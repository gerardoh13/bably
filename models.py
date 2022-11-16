from datetime import datetime

from sqlalchemy.sql import expression
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.types import DateTime

from flask_bcrypt import Bcrypt
from flask_sqlalchemy import SQLAlchemy

bcrypt = Bcrypt()
db = SQLAlchemy()


class utcnow(expression.FunctionElement):
    type = DateTime()
    inherit_cache = True


@compiles(utcnow, 'postgresql')
def pg_utcnow(element, compiler, **kw):
    return "TIMEZONE('utc', CURRENT_TIMESTAMP)"


@compiles(utcnow, 'mssql')
def ms_utcnow(element, compiler, **kw):
    return "GETUTCDATE()"


def connect_db(app):

    db.app = app
    db.init_app(app)


class User(db.Model):
    """User in the system."""

    __tablename__ = 'users'

    id = db.Column(
        db.Integer,
        primary_key=True,
    )

    email = db.Column(
        db.String(60),
        nullable=False,
        unique=True,
    )

    first_name = db.Column(
        db.String(20),
        nullable=False,
    )

    password = db.Column(
        db.Text,
        nullable=False,
    )
    infants = db.relationship('Infant', backref="user",
                              cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User #{self.id}: {self.first_name}, {self.email}>"

    @classmethod
    def signup(cls, first_name, email, password):

        hashed_pwd = bcrypt.generate_password_hash(password).decode('UTF-8')

        user = User(
            first_name=first_name,
            email=email,
            password=hashed_pwd,
        )

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
    """Blog post class"""

    __tablename__ = "infants"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    first_name = db.Column(db.String(20), nullable=False)
    dob = db.Column(db.Date, nullable=False)
    gender = db.Column(db.String(6), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey(
        'users.id', ondelete='CASCADE'), nullable=False)

    def __repr__(self):
        return f"<Infant #{self.id}: {self.first_name}, {self.dob}>"

    def serialize(self):
        return {
            "id": self.id,
            "first_name": self.first_name,
            "dob": self.dob,
            "gender": self.gender,
            "user_id": self.user_id,
        }


class Feed(db.Model):
    """Feed class"""

    __tablename__ = 'Feeds'

    id = db.Column(
        db.Integer,
        primary_key=True,
    )

    method = db.Column(db.String(7), nullable=False)

    fed_at = db.Column(
        db.BigInteger,
        nullable=False,
    )

    amount = db.Column(db.Float)

    infant_id = db.Column(
        db.Integer,
        db.ForeignKey('infants.id', ondelete='CASCADE'),
        nullable=False,
    )

    infant = db.relationship('Infant')

    def __repr__(self):
        return f"<Feed #{self.id}: {self.method}, User#{self.infant_id}>"

    def serialize(self):
        return {
            "id": self.id,
            "method": self.method,
            "infant_id": self.infant_id
        }
