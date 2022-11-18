from datetime import datetime
from flask_bcrypt import Bcrypt
from flask_sqlalchemy import SQLAlchemy

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

    def __repr__(self):
        return f"<Infant #{self.id}: {self.first_name}, {self.dob}>"

    def serialize(self):
        return {
            "id": self.id,
            "first_name": self.first_name,
            "dob": self.dob,
            "gender": self.gender
        }

class Feed(db.Model):
    """Feed class"""

    __tablename__ = 'feeds'

    id = db.Column(db.Integer, primary_key=True)
    method = db.Column(db.String(7), nullable=False)
    fed_at = db.Column(db.BigInteger, nullable=False)
    amount = db.Column(db.Float)
    duration = db.Column(db.Float)
    infant_id = db.Column(db.Integer, db.ForeignKey('infants.id'), nullable=False)

    def __repr__(self):
        return f"<Feed #{self.id}: {self.method}, User#{self.infant_id}>"

    def serialize(self):
        if self.method == "bottle":
            title = f"{self.method} feed, {self.amount} oz"
        else:
            title = f"{self.method}, {self.duration} mins"
        return {
            "title": title,
            "id": self.id,
            "start": datetime.fromtimestamp(self.fed_at).isoformat(),
            "ts": self.fed_at
        }
    
    def to_timestamp(self):
        """convert epoch to datetime"""         
        ts = datetime.fromtimestamp(self.fed_at)
        return ts.strftime("%-m/%-d/%Y %-I:%M %p")


    timestamp = property(fget=to_timestamp)

class UserInfant(db.Model):
    """UserInfant class"""
    __tablename__ = "users_infants"

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), primary_key=True)
    infant_id = db.Column(db.Integer, db.ForeignKey("infants.id"), primary_key=True)

    def __repr__(self):
        return f"<User {self.user_id}, Infant {self.infant_id}>"