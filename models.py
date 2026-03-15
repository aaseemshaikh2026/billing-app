from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin

db = SQLAlchemy()

class User(UserMixin, db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    full_name = db.Column(db.String(200), nullable=False)
    email = db.Column(db.String(200), unique=True, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    email_verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    security_question_1 = db.Column(db.String(200))
    security_answer_1 = db.Column(db.String(200))
    security_question_2 = db.Column(db.String(200))
    security_answer_2 = db.Column(db.String(200))

    clients = db.relationship('Client', backref='owner', lazy=True, cascade='all, delete-orphan')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def set_security_answer(self, num, answer):
        hashed = generate_password_hash(answer.lower().strip())
        if num == 1:
            self.security_answer_1 = hashed
        else:
            self.security_answer_2 = hashed

    def check_security_answer(self, num, answer):
        stored = self.security_answer_1 if num == 1 else self.security_answer_2
        if not stored:
            return False
        return check_password_hash(stored, answer.lower().strip())

class Client(db.Model):
    __tablename__ = 'clients'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    client_name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    roles = db.relationship('Role', backref='client', lazy=True, cascade='all, delete-orphan')
    employees = db.relationship('Employee', backref='client', lazy=True, cascade='all, delete-orphan')
    holidays = db.relationship('Holiday', backref='client', lazy=True, cascade='all, delete-orphan')

class Role(db.Model):
    __tablename__ = 'roles'
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey('clients.id'), nullable=False)
    role_name = db.Column(db.String(100), nullable=False)
    hourly_rate_usd = db.Column(db.Float, nullable=False)

class Employee(db.Model):
    __tablename__ = 'employees'
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey('clients.id'), nullable=False)
    name = db.Column(db.String(200), nullable=False)
    role_id = db.Column(db.Integer, db.ForeignKey('roles.id'), nullable=False)
    billing_start_date = db.Column(db.Date, nullable=False)
    is_active = db.Column(db.Boolean, default=True)

    role = db.relationship('Role', backref='employees')
    leaves = db.relationship('Leave', backref='employee', lazy=True, cascade='all, delete-orphan')

class Holiday(db.Model):
    __tablename__ = 'holidays'
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey('clients.id'), nullable=False)
    holiday_date = db.Column(db.Date, nullable=False)
    description = db.Column(db.String(200))
    year = db.Column(db.Integer, nullable=False)

    __table_args__ = (
        db.UniqueConstraint('client_id', 'holiday_date', name='unique_client_holiday'),
    )

class Leave(db.Model):
    __tablename__ = 'leaves'
    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.Integer, db.ForeignKey('employees.id'), nullable=False)
    leave_date = db.Column(db.Date, nullable=False)
    is_half_day = db.Column(db.Boolean, default=False)

    __table_args__ = (
        db.UniqueConstraint('employee_id', 'leave_date', name='unique_employee_leave'),
    )
