import os
from datetime import timedelta

# Determine the base directory of the application
basedir = os.path.abspath(os.path.dirname(__file__))

# Web addresses
os.environ['FRONTEND_ADDRESS'] = 'http://localhost:3000'
os.environ['BACKEND_ADDRESS'] = 'http://localhost:5000'
# prices for the subscription plans
os.environ['WEEKLY_SUB']   = 'price_1OqJ9vC2Liz4wwk2MMFXGCVv'
os.environ['MONTHLY_SUB']  = 'price_1OqJATC2Liz4wwk2PSaOD8BJ'
os.environ['ANNUALLY_SUB'] = 'price_1OqJApC2Liz4wwk2p6lMUfBt'
os.environ['WEEKLY_COST']  = '2.00'
os.environ['MONTHLY_COST'] = '7.00'
os.environ['ANNUAL_COST']  = '80.00'


class Config(object):
    """Base configuration class with common settings.

    Attributes:
    - JWT_SECRET_KEY (str): The secret key used to encode and decode JWT tokens.
    - JWT_ACCESS_TOKEN_EXPIRES (timedelta): The expiration time for access tokens.
    - FLASK_ADMIN_ENABLED (bool): Flag to enable/disable Flask-Admin.
    - SQLALCHEMY_DATABASE_URI (str): Database connection string.
    - SQLALCHEMY_TRACK_MODIFICATIONS (bool): Flag to track modifications of objects and emit signals.
    - SECURITY_PASSWORD_SALT (str): The salt used to hash passwords.
    - WTF_CSRF_ENABLED (bool): Flag to enable/disable CSRF protection in forms.
    - BABEL_DEFAULT_LOCALE (str): The default locale for Flask-Babel.
    - BABEL_DEFAULT_TIMEZONE (str): The default timezone for Flask-Babel.
    """
    JWT_SECRET_KEY = 'team-7-project'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    FLASK_ADMIN_ENABLED = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(basedir, 'app.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = True
    SECURITY_PASSWORD_SALT = 'salt'
    WTF_CSRF_ENABLED = True
    # Flask-Babel Configuration
    BABEL_DEFAULT_LOCALE = 'en'
    BABEL_DEFAULT_TIMEZONE = 'UTC'

    # Stripe Payment API Keys
    os.environ['STRIPE_PUBLIC_KEY'] = \
        'pk_test_51Omg9mC2Liz4wwk2KbYDgpL2uqucPHXKp1O6mkHFT4XccD4wssTe9BrLb2NH2nJJM2Jk9PK11xwLdUZTW44l6PDN00VzP4uOe7'
    os.environ['STRIPE_SECRET_KEY'] = \
        'sk_test_51Omg9mC2Liz4wwk2K4EpTWMkoyLuToaKdS4du9yZTkEPgwJ8IPMlDCN6vAgA7RC8pLGfgs6FVK6wOjFCncNATjWe00RrPlYEzK'


class DevelopmentConfig(Config):
    """Development-specific configuration class.

    Inherits from the base Config class and overrides or extends it with development-specific settings.

    Attributes:
    - PORT (int): The port on which the Flask application will run.
    - DEBUG (bool): Enables/Disables debug mode in Flask.
    """
    PORT = 5000
    DEBUG = True
    TESTING = True
    FLASK_ADMIN_ENABLED = False
    SQLALCHEMY_ECHO = False
    # Other development-specific settings can be added here


class TestingConfig(Config):
    """Development-specific configuration class.

    Inherits from the base Config class and overrides or extends it with development-specific settings.

    Attributes:
    - PORT (int): The port on which the Flask application will run.
    - DEBUG (bool): Enables/Disables debug mode in Flask.
    """
    PORT = 5000
    DEBUG = True
    TESTING = True
    FLASK_ADMIN_ENABLED = False
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = False
    WTF_CSRF_ENABLED = False
    # Other testing-specific settings can be added here


class ProductionConfig(Config):
    """Production-specific configuration class.

    Inherits from the base Config class and overrides or extends it with production-specific settings.

    Attributes:
    - PORT (int): The port on which the Flask application will run.
    - DEBUG (bool): Enables/Disables debug mode in Flask.
    """
    PORT = 8130
    DEBUG = False
    # Other production-specific settings can be added here
