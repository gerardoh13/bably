from datetime import datetime, date
from flask_bcrypt import Bcrypt
from flask_sqlalchemy import SQLAlchemy
from dateutil import relativedelta

bcrypt = Bcrypt()
db = SQLAlchemy()

def connect_db(app):
    db.app = app
    db.init_app(app)

class User(db.Model):
    """User in the system."""

    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(60), nullable=False, unique=True)
    first_name = db.Column(db.String(20), nullable=False)
    password = db.Column(db.Text, nullable=False)
    infants = db.relationship('Infant', secondary='users_infants', backref="users")

    def __repr__(self):
        return f"<User #{self.id}: {self.first_name}, {self.email}>"

    @classmethod
    def signup(cls, first_name, email, password):
        hashed_pwd = bcrypt.generate_password_hash(password).decode('UTF-8')
        user = User(first_name=first_name, email=email, password=hashed_pwd)
        db.session.add(user)
        return user

    @classmethod
    def authenticate(cls, email, password):
        user = cls.query.filter_by(email=email).first()

        if user:
            is_auth = bcrypt.check_password_hash(user.password, password)
            if is_auth:
                return user
        return False


class Infant(db.Model):
    """Infant class"""

    __tablename__ = "infants"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    first_name = db.Column(db.String(20), nullable=False)
    dob = db.Column(db.Date, nullable=False)
    gender = db.Column(db.String(6), nullable=False)
    public_id = db.Column(db.Text)

    def __repr__(self):
        return f"<Infant #{self.id}: {self.first_name}, {self.dob}>"

    def serialize(self):
        return {
            "id": self.id,
            "first_name": self.first_name,
            "dob": self.dob,
            "gender": self.gender,
            "public_id": self.public_id
        }

    def get_age(self):
        delta = relativedelta.relativedelta(date.today(), self.dob)
        years = delta.years
        months = delta.months
        days = delta.days
        if years and not months:
            age = f"{years} year{'s' if years > 1 else ''}"
        elif years and months:
            age = f"{years} year{'s' if years > 1 else ''}, {months} month{'s' if months > 1 else ''}"
        elif months and not years:
            age = f"{months} month{'s' if months > 1 else ''}"
        else:
            age = f"{days} day{'s' if days != 1 else ''}"
        return age
    
    def get_months(self):
        delta = relativedelta.relativedelta(date.today(), self.dob)
        return delta.months + (12*delta.years)
        
    age = property(fget=get_age)
    months = property(fget=get_months)

class Feed(db.Model):
    """Feed class"""

    __tablename__ = 'feeds'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    method = db.Column(db.String(7), nullable=False)
    fed_at = db.Column(db.BigInteger, nullable=False)
    amount = db.Column(db.Float)
    duration = db.Column(db.Integer)
    infant_id = db.Column(db.Integer, db.ForeignKey('infants.id'), nullable=False)

    def __repr__(self):
        return f"<Feed #{self.id}: {self.method}, User#{self.infant_id}>"

    def serialize(self):
        feed = {
            "id": self.id,
            "method": self.method,
            "fed_at": self.fed_at,
            "datetime": datetime.fromtimestamp(self.fed_at).isoformat()
        }
        if self.method == "bottle":
            feed["amount"] = self.amount
        else: 
            feed["duration"] = self.duration
        return feed


    def serialize_event(self):
        if self.method == "bottle":
            title = f"{self.method} feed, {self.amount} oz"
        else:
            title = f"{self.method}, {self.duration} mins"
        return {
            "title": title,
            "id": self.id,
            "date": datetime.fromtimestamp(self.fed_at).isoformat(),
            "start": self.fed_at * 1000
        }
    
    def to_date(self):
        """convert epoch to datetime"""         
        ts = datetime.fromtimestamp(self.fed_at)
        return ts.strftime("%-m/%-d/%Y %-I:%M %p")

    date = property(fget=to_date)


class UserInfant(db.Model):
    """UserInfant class"""
    __tablename__ = "users_infants"

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), primary_key=True)
    infant_id = db.Column(db.Integer, db.ForeignKey("infants.id"), primary_key=True)

    def __repr__(self):
        return f"<User {self.user_id}, Infant {self.infant_id}>"

class Reminder(db.Model):
    """Reminders class"""
    __tablename__ = "reminders"

    id = db.Column(db.Integer, primary_key=True)
    enabled = db.Column(db.Boolean, nullable=False, default=False)
    hours = db.Column(db.Integer, default=0)
    minutes = db.Column(db.Integer, default=0)
    cutoff_enabled = db.Column(db.Boolean, nullable=False, default=True)
    cutoff = db.Column(db.Text, nullable=False, default="20:00:00")
    start = db.Column(db.Text, nullable=False, default="08:00:00")
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    user = db.relationship('User', backref="reminders")

    def __repr__(self):
        return f"<Reminder #{self.id}: {self.enabled}, {self.cutoff_enabled}, {self.cutoff}>"

    def serialize(self):
        return {
            "id": self.id,
            "enabled": self.enabled,
            "cutoff_enabled": self.cutoff_enabled,
            "start": self.start,
            "cutoff": self.cutoff
        }