import os

from flask import Flask, render_template, request, flash, redirect, session, g, abort, url_for, jsonify
from flask_debugtoolbar import DebugToolbarExtension
from sqlalchemy.exc import IntegrityError
from functools import wraps
from sqlalchemy.sql import func
from forms import UserAddForm, LoginForm
from models import db, connect_db, User, Infant, Feed
from sqlalchemy import desc
from datetime import datetime, time

CURR_USER_KEY = "curr_user"
CURR_INFANT_KEY = "curr_infant"


app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = (
    os.environ.get('DATABASE_URL', 'postgresql:///bably'))

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ECHO'] = False
app.config['DEBUG_TB_INTERCEPT_REDIRECTS'] = False
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', "CATS_ARE_COOL")
toolbar = DebugToolbarExtension(app)

connect_db(app)

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if g.user is None:
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
        user = User.authenticate(form.email.data.strip().lower(),
                                 form.password.data)
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

    if g.user:
        if not g.infant:
            return render_template("register.html")
        last_midnight = datetime.combine(datetime.today(), time.min).timestamp()
        next_midnight = datetime.combine(datetime.today(), time.max).timestamp()
        feeds = Feed.query.filter(Feed.infant_id == g.infant.id).filter(Feed.fed_at >= last_midnight).filter(Feed.fed_at <= next_midnight).order_by(desc(Feed.fed_at)).limit(3).all()
        bottle_amts = [feed.amount for feed in feeds if feed.method == "bottle"]
        nursing_feeds = [feed for feed in feeds if feed.method == "nursing"]
 
        return render_template('home.html', feeds=feeds, total_oz=sum(bottle_amts), nursing_count=len(nursing_feeds))

    else:
        return redirect('/signup')

@app.route('/signup', methods=["GET", "POST"])
def signup():
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

        return render_template("register.html")

    else:
        return render_template('signup.html', form=form)

@app.route('/api/infants', methods=["POST"])
@login_required
def register_infant():
    new_infant = Infant(
        first_name=request.json["first_name"],
        dob=request.json["dob"],
        gender=request.json["gender"]
    )
    db.session.add(new_infant)
    g.user.infants.append(new_infant)
    db.session.commit()
    add_infant(new_infant)

    response_json = jsonify(infant=new_infant.serialize())
    return (response_json, 201)

@app.route('/feeds', methods=["GET", "POST"])
@login_required
def show_feed_form():
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
        response_json = jsonify(feeding=new_feed.serialize())
        return (response_json, 201)
    else:
        return render_template("feeds.html")

# @app.route('/register')
# def show_registration():
#     return render_template('register.html')

@app.route('/calendar')
def show_calendar():
    return render_template('calendar.html')

@app.route('/feed/<int:feed_id>')
def show_feed(feed_id):
    feed = Feed.query.get_or_404(feed_id)
    return render_template('feed.html', feed=feed)

def show_calendar():
    return render_template('calendar.html')

@app.route("/api/events")
def fetch_feeds():
    start = datetime.fromisoformat(request.args.get("start")).timestamp()
    end = datetime.fromisoformat(request.args.get("end")).timestamp()
    feeds = Feed.query.filter(Feed.infant_id == g.infant.id).filter(Feed.fed_at > start).filter(Feed.fed_at < end).all()
    response_json = [feed.serialize() for feed in feeds]
    return(response_json, 201)