import cloudinary.uploader
import cloudinary.api
import cloudinary
import os

from flask_apscheduler import APScheduler
from datetime import datetime, time, timedelta
from functools import wraps
from zoneinfo import ZoneInfo

from pusher_push_notifications import PushNotifications
from dotenv import load_dotenv
from flask import Flask, flash, g, jsonify, redirect, render_template, request, session, send_file
from sqlalchemy import desc
from sqlalchemy.exc import IntegrityError

from forms import LoginForm, UserAddForm
from models import Feed, Infant, User, Reminder, connect_db, db

load_dotenv()

CURR_USER_KEY = "curr_user"
CURR_INFANT_KEY = "curr_infant"

app = Flask(__name__)

uri = os.environ.get('DATABASE_URL', 'postgresql:///bably')
if uri.startswith("postgres://"):
    uri = uri.replace("postgres://", "postgresql://", 1)        

app.config['SQLALCHEMY_DATABASE_URI'] = uri

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ECHO'] = False
app.config['DEBUG_TB_INTERCEPT_REDIRECTS'] = False
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', "CATS_ARE_COOL")

scheduler = APScheduler()
scheduler.api_enabled = True
scheduler.init_app(app)
scheduler.start()

cloudinary.config(cloud_name=os.getenv('CLOUD_NAME'), api_key=os.getenv('CLOUDINARY_API_KEY'),
                  api_secret=os.getenv('CLOUDINARY_API_SECRET'))

beams_client = PushNotifications(
    instance_id=os.getenv('PUSHER_INSTANCE_ID'),
    secret_key=os.getenv('PUSHER_SECRET_KEY')
)
connect_db(app)

# ---------------------------------------------MISC------------------------------------------------


def login_required(f):
    """checks if a user is logged in, if not redirects to homepage and flashes unauthorized message"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if g.user is None or g.infant is None:
            flash("Access unauthorized.", "danger")
            return redirect("/")
        return f(*args, **kwargs)
    return decorated_function


@app.before_request
def add_user_to_g():
    """If we're logged in, add curr user to Flask global."""

    if CURR_USER_KEY in session:
        g.user = User.query.get(session[CURR_USER_KEY])
    else:
        g.user = None

    if CURR_INFANT_KEY in session:
        g.infant = Infant.query.get(session[CURR_INFANT_KEY])
    else:
        g.infant = None

@app.route("/service-worker.js")
def service_worker():
    """serve service worker file"""
    return send_file('static/service-worker.js')


def push_notification(msg, user, start, cutoff, rd):
    """sends push notification to the current user"""
    response = beams_client.publish_to_users(
        user_ids=[user],
        publish_body={
            'web': {
                'notification': {
                    'title': 'Bably says:',
                    'body': msg
                }
            }
        }
    )
    return response['publishId']


@app.route('/pusher/beams-auth', methods=['GET'])
def beams_auth():
    """generates a beams token for push notification for the user currently logged in"""
    user_id = request.args.get('user_id')
    beams_token = beams_client.generate_token(user_id)

    return jsonify(beams_token)


@app.route("/upload", methods=['POST'])
def upload_file():
    """uploads a photo for the infant profile page. if a photo already exists it replaces the current photo"""
    if g.user is None:
        flash("Access unauthorized.", "danger")
        return redirect("/")
    upload_result = None
    if request.method == 'POST':
        file_to_upload = request.files['file']
        if file_to_upload:
            if g.infant and g.infant.public_id:
                upload_result = cloudinary.uploader.upload(
                    file_to_upload, public_id=g.infant.public_id, filename_override=True, unique_filename=False, invalidate=True)
            else:
                upload_result = cloudinary.uploader.upload(file_to_upload)

            return jsonify(upload_result)


def check_notification_times(start, next, cutoff):
    """checks if the next notification falls within the do not disturb night period"""
    return start < next < cutoff


def set_reminder(feed_id, tz):
    """if reminders are enabled, and reminders fall outside of the do not disturb period, creates a job to send a notification
    at the next requested time"""
    reminder = Reminder.query.get_or_404(g.user.reminders[0].id)
    if reminder.enabled:
        feed = Feed.query.get_or_404(feed_id)
        latest_feed = Feed.query.filter(Feed.infant_id == g.infant.id).order_by(
            desc(Feed.fed_at)).limit(1).all()
        if feed_id != latest_feed[0].id:
            return
        mins = (reminder.hours * 60) + reminder.minutes
        rd = datetime.utcfromtimestamp(feed.fed_at) + timedelta(minutes=mins)

        delta = rd.time().replace(tzinfo=ZoneInfo(tz))
        next = rd.time() + delta.utcoffset()
        start = time.fromisoformat(reminder.start)
        cutoff = time.fromisoformat(reminder.cutoff)
        if reminder.cutoff_enabled:
            if not check_notification_times(start, next, cutoff):
                return

    msg = f"Time to feed {g.infant.first_name}"
    user = g.user.email
    scheduler.add_job(id=f"feed{feed_id}", func=push_notification, trigger="date", args=[
                      msg, user, start.isoformat(), cutoff.isoformat(), next.isoformat()], run_date=rd)

# ---------------------------------------------USERS/INFANTS------------------------------------------------
def do_login(user):
    """Log in user."""
    session[CURR_USER_KEY] = user.id


def add_infant(infant):
    """Log in user."""
    session[CURR_INFANT_KEY] = infant.id


def do_logout():
    """Logout user."""
    if CURR_INFANT_KEY in session:
        del session[CURR_INFANT_KEY]
    if CURR_USER_KEY in session:
        del session[CURR_USER_KEY]
        flash("Goodbye!", "info")

@app.route('/login', methods=["GET", "POST"])
def login():
    """Handle user login."""
    if g.user and g.infant:
        return redirect("/")
    form = LoginForm()
    if form.validate_on_submit():
        user = User.authenticate(
            form.email.data.strip().lower(), form.password.data)
        if user:
            do_login(user)
            if user.infants:
                add_infant(user.infants[0])
            flash(f"Hello, {user.first_name}!", "success")
            return redirect("/")

        flash("Invalid credentials.", 'danger')

    return render_template('login.html', form=form)


@app.route('/logout')
def logout():
    """Handle logout of user."""
    do_logout()
    return redirect("/")


@app.route('/')
def homepage():
    """returns dashboard if logged in and an infant has been registered, 
    redirects to child registration if user is logged in and child is not registered, or redirects to signup if user is not logged in"""
    if g.user:
        if not g.infant:
            return render_template("register.html")
        return render_template('home.html')
    else:
        return redirect('/signup')


@app.route('/signup', methods=["GET", "POST"])
def signup():
    """returns signup page for get request, handles new account creating for post requests"""
    if g.user and g.infant:
        return redirect("/")

    form = UserAddForm()

    if form.validate_on_submit():
        try:
            user = User.signup(
                first_name=form.first_name.data.strip(),
                password=form.password.data,
                email=form.email.data.strip(),
            )
            db.session.commit()

        except IntegrityError:
            flash("There's already an account with that email", 'danger')
            return render_template('signup.html', form=form)

        do_login(user)
        reminder = Reminder(user_id=user.id)
        user.reminders.append(reminder)
        db.session.commit()
        return render_template("register.html")

    else:
        return render_template('signup.html', form=form)


@app.route('/api/infants', methods=["POST"])
def register_infant():
    """registers a new infant"""
    if g.user is None:
        flash("Access unauthorized.", "danger")
        return redirect("/")
    data = request.get_json()
    new_infant = Infant(
        first_name=data.get("first_name"),
        dob=data.get("dob"),
        gender=data.get("gender"),
        public_id=data.get("public_id", None)
    )
    db.session.add(new_infant)
    g.user.infants.append(new_infant)
    db.session.commit()
    add_infant(new_infant)

    response_json = jsonify(infant=new_infant.serialize())
    return (response_json, 201)


@app.route('/api/infants', methods=["PATCH"])
@login_required
def update_infant():
    """updates the infant information"""
    data = request.get_json()
    modified_infant = Infant.query.get_or_404(g.infant.id)

    modified_infant.first_name = data.get("first_name"),
    modified_infant.dob = data.get("dob"),
    modified_infant.gender = data.get("gender"),
    if not g.infant.public_id:
        modified_infant.public_id = data.get("public_id", None)

    db.session.commit()
    response_json = jsonify(infant=modified_infant.serialize())
    return (response_json, 200)


@app.route('/profile')
@login_required
def show_profile():
    """shows the profile page"""
    return render_template('profile.html')


@app.route('/api/user')
def get_current_userID():
    """if a user is logged in, returns the email adress used for push notifications"""
    if g.user:
        return g.user.email
    else:
        return "N/A"
# ---------------------------------------------FEEDS------------------------------------------------


@app.route('/feeds', methods=["GET", "POST"])
@login_required
def show_feed_form():
    """if method is GET it shows the form to add a new feed, if the method is POST it creates a new feed and adds to db"""
    if request.method == "POST":
        data = request.get_json()
        new_feed = Feed(
            method=data.get("method"),
            fed_at=data.get("fed_at"),
            amount=data.get("amount", None),
            duration=data.get("duration", None),
            infant_id=g.infant.id
        )
        db.session.add(new_feed)
        db.session.commit()
        tz = data.get("tz")
        if g.user.reminders[0].enabled:
            set_reminder(new_feed.id, tz)
        response_json = jsonify(feed=new_feed.serialize())
        return (response_json, 201)
    else:
        return render_template("feeds.html")

@app.route('/api/feeds/<int:last_midnight>/<int:next_midnight>')
@login_required
def get_feeds(last_midnight, next_midnight):
    """returns a list of feeding events for the current day to be displayed on the homepage"""
    all_feeds = Feed.query.filter(Feed.infant_id == g.infant.id).filter(Feed.fed_at >= last_midnight).filter(
            Feed.fed_at <= next_midnight).order_by(desc(Feed.fed_at)).all()
    bottle_amts = [
            feed.amount for feed in all_feeds if feed.method == "bottle"]
    nursing_feeds = [
            feed for feed in all_feeds if feed.method == "nursing"]
    all_feeds = [feed.serialize() for feed in all_feeds]
    more_feeds = []
    feeds = all_feeds
    if len(all_feeds) >= 3:
        feeds = all_feeds[:3]
        more_feeds = all_feeds[3:]
    response_json = {
        "feeds": feeds,
        "total_oz": sum(bottle_amts),
        "nursing_count": len(nursing_feeds),
        "more_feeds": more_feeds
        }
    return  (response_json, 200)

@app.route('/api/feeds/<int:feed_id>')
@login_required
def show_feed(feed_id):
    """returns a json onject with feed information"""
    fetched_feed = Feed.query.get_or_404(feed_id)
    response_json = jsonify(feed=fetched_feed.serialize())
    return (response_json, 201)


@app.route('/api/feeds/<int:feed_id>', methods=["DELETE"])
@login_required
def delete_feed(feed_id):
    """Deletes a particular feed"""
    feed = Feed.query.get_or_404(feed_id)
    db.session.delete(feed)
    db.session.commit()
    return jsonify(message="deleted")


@app.route('/api/feeds/<int:feed_id>', methods=["PATCH"])
@login_required
def update_feeds(feed_id):
    """Updates a particular feed and responds w/ JSON of that updated feed"""
    data = request.get_json()
    feed = Feed.query.get_or_404(feed_id)
    feed.fed_at = data.get("fed_at"),
    feed.amount = data.get("amount", None),
    feed.duration = data.get("duration", None),

    db.session.commit()
    response_json = jsonify(feed=feed.serialize_event())
    return (response_json, 200)

    # ---------------------------------------------EVENTS/REMINDERS------------------------------------------------


@app.route('/calendar')
@login_required
def show_calendar():
    """shows the calendar page"""
    return render_template('calendar.html')

def format_dates(date):
    """formats the feed events to the local timezone"""
    delta = datetime.utcfromtimestamp(date / 1000).replace(tzinfo=ZoneInfo(request.args.get("tz")))
    date = datetime.utcfromtimestamp(date / 1000) + delta.utcoffset()
    return date.isoformat()[0:10]

@app.route("/api/events")
@login_required
def fetch_feeds():
    """returns a list of feeding events to be displayed on the calendar"""
    start = datetime.fromisoformat(request.args.get("start")).timestamp()
    end = datetime.fromisoformat(request.args.get("end")).timestamp()
    feeds = Feed.query.filter(Feed.infant_id == g.infant.id).filter(
        Feed.fed_at > start).filter(Feed.fed_at < end).all()
    response_json = [feed.serialize_event() for feed in feeds]
    if response_json:
        all_day_events = []
        unique_dates = {format_dates(event["start"]) for event in response_json}

        for x in unique_dates:
            all_day_events.append({"start": x, "title": ""})
        response_json.extend(all_day_events)

    return (response_json, 201)


@app.route("/reminders")
@login_required
def show_reminders():
    reminder = Reminder.query.get_or_404(g.user.reminders[0].id)
    return render_template("reminders.html", reminder=reminder)


@app.route("/api/reminders", methods=["POST"])
@login_required
def schedule_reminder():
    """updates the reminder object to the user preferred settings"""
    data = request.get_json()
    reminder = Reminder.query.get_or_404(g.user.reminders[0].id)
    reminder.hours = data.get("hours")
    reminder.minutes = data.get("minutes")
    reminder.enabled = data.get("afterFeedEnable")
    reminder.start = data.get('start')
    reminder.cutoff = data.get('cutoff')
    reminder.cutoff_enabled = data.get("cutOffEnabled")
    db.session.commit()

    response_json = jsonify(reminder=reminder.serialize())
    return (response_json, 200)
