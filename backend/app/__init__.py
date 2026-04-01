"""
Initializes the Flask application and its extensions.
"""
import stripe
from flask import Flask
from flask_babel import Babel
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy

# Configuration import can be adjusted based on project structure
from config import DevelopmentConfig, ProductionConfig, TestingConfig

# Initialize extensions but don't bind them to the app yet
db = SQLAlchemy()
migrate = None
babel = Babel()


def create_app(configuration=DevelopmentConfig):
    """
    Create a Flask application using the app factory pattern.
    Parameters:
        configuration: The configuration object to use.
    Returns:
        app: The Flask application instance.
    """
    app = Flask(__name__)
    app.config.from_object(configuration)

    # Initialize JWTManager
    jwt = JWTManager(app)

    # Bind extensions to the app
    db.init_app(app)
    global migrate
    migrate = Migrate(app, db)
    babel.init_app(app)

    with app.app_context():
        from .admin import setup_admin
        setup_admin(app, db)

        # Import and register blueprints
        from .auth import auth as auth_blueprint
        app.register_blueprint(auth_blueprint)
        from .journeys import journeys as journeys_blueprint
        app.register_blueprint(journeys_blueprint)
        from .payments import payments as payments_blueprint
        app.register_blueprint(payments_blueprint)
        from .manager import owner as manager_blueprint
        app.register_blueprint(manager_blueprint)
    return app

def init_db():
    """
    Populates the database with initial data for testing purposes.
    """
    db.drop_all()
    db.create_all()

    from .models import User, SubscriptionPlan
    from werkzeug.security import generate_password_hash

    plans = [
        {"plan_type": "weekly", "price": 2.00},
        {"plan_type": "monthly", "price": 7.00},
        {"plan_type": "annually", "price": 80.00},
    ]

    for plan_data in plans:
        plan = SubscriptionPlan(**plan_data)
        plan.save()

    manager = User(role='manager', username="manager", email="manager@manager.com",
                   password_hash=generate_password_hash("manager123", method='pbkdf2:sha1', salt_length=8), plan_id=0)
    manager.save()

    pwd_hash = generate_password_hash("testing123", method='pbkdf2:sha1', salt_length=8)

    # Create and save users and their payments
    for i in range(1, 5):
        user = User(username=f"user{i}", email=f"user{i}@mail.com",
                    password_hash=pwd_hash, plan_id=0)
        user.save()

    # Create and save a manager and a tester user, and one generic payment
    tester = User(username="testing", email="testing@testing.com",
                  password_hash=pwd_hash, plan_id=0)
    tester.save()

    # Commit the changes to the database
    db.session.commit()
