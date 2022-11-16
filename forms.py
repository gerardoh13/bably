from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, TextAreaField, TimeField, FloatField, RadioField
from wtforms.validators import DataRequired, Email, Length, ValidationError, URL, Optional

class UserAddForm(FlaskForm):
    """Form for adding users."""

    first_name = StringField('First Name', validators=[DataRequired()])
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[Length(min=6)])

class LoginForm(FlaskForm):
    """Login form."""

    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[Length(min=6)])

# class FeedForm(FlaskForm):
#     """Feed form"""
#     fed_at = TimeField("Start Time:")
#     amount = FloatField("Amount:")
#     method = RadioField(default="Bottle", choices=["Bottle", "Nursing"])
