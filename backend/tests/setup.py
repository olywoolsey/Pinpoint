import os
import sys

# Add the parent directory (backend) to the sys.path to allow imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.models import User, SubscriptionPlan, GPSRoute, Friendship
from app.auth import generate_password_hash
from app import create_app, db
import pytest
import random as r
from datetime import datetime, timedelta
from app import create_app, db, init_db


# ACTIVATE _VENV AND RUN IN ~/backend/ 

# For local testing, run:
# pytest -c pytest.dev.ini > tests/results.txt 2>&1

# For CI/CD, GitHub Actions will run:
# pytest -c pytest.ci.ini


# Set up the database and create a test client
@pytest.fixture
def app():
    """Create and configure a new app instance for each test."""
    app = create_app()
    with app.app_context():
        db.create_all()
        init_db()
    yield app
    with app.app_context():
        db.drop_all()


@pytest.fixture
def client(app):
    """ Create a test client for the app."""
    return app.test_client()


@pytest.fixture
def runner(app):
    """Create a test runner for the app's Click commands."""
    return app.test_cli_runner()


def generate_random_date(start_date, end_date):
    """ 
    Generate a random date between two dates.
    
    Args:
    - start_date (datetime): The start date.
    - end_date (datetime): The end date.

    Returns:
    - datetime: A random date between the start and end dates.
    """
    time_between_dates = end_date - start_date
    days_between_dates = time_between_dates.days
    random_number_of_days = r.randrange(days_between_dates)
    random_date = start_date + timedelta(days=random_number_of_days)
    return random_date


@pytest.fixture
def authenticated_client(app, client):
    """Return a client with an Authorization header set for authenticated requests."""
    with app.app_context():
        # customer = User.query.filter_by(role='customer').first()
        email = "testing@testing.com"
        password = "testing123"
        # Log in as the user
        response = client.post('/login', json={
            'email': email,
            'password': password
        })
        # Extract the access token from the response
        access_token = response.get_json()['access_token']
        # Create a header for subsequent requests
        headers = {
            'Authorization': f'Bearer {access_token}'
        }
        # Return a modified client with the Authorization header set
        class AuthClient:
            def __init__(self, client, headers):
                self.client = client
                self.headers = headers
            def get(self, *args, **kwargs):
                return self.client.get(*args, headers=self.headers, **kwargs)
            def post(self, *args, **kwargs):
                return self.client.post(*args, headers=self.headers, **kwargs)
        return AuthClient(client, headers)


@pytest.fixture
def authenticated_admin_client(app, client):
    """Return a client with an Authorization header set for authenticated requests."""
    with app.app_context():
        manager = User.query.filter_by(role='manager').first()
        email = manager.email
        password = "manager123"
        # Log in as the user
        response = client.post('/login', json={
            'email': email,
            'password': password
        })
        # Extract the access token from the response
        access_token = response.get_json()['access_token']
        # Create a header for subsequent requests
        headers = {
            'Authorization': f'Bearer {access_token}'
        }
        # Return a modified client with the Authorization header set
        class AuthClient:
            def __init__(self, client, headers):
                self.client = client
                self.headers = headers
            def get(self, *args, **kwargs):
                return self.client.get(*args, headers=self.headers, **kwargs)
            def post(self, *args, **kwargs):
                return self.client.post(*args, headers=self.headers, **kwargs)
        return AuthClient(client, headers)


def init_routes():
    """Initialize the database with GPS routes from GPX files."""
    gpx_dir = os.path.join(os.path.dirname(__file__), 'GPX_data')

    for i in range(1, 6):
        num = r.randint(1, 3)
        gpx_file_path = os.path.join(gpx_dir, f"Route{num}.gpx")

        try:
            with open(gpx_file_path, 'rb') as file:
                gpx_data = file.read()

            # Assuming GPSRoute is defined and has a save method.
            route = GPSRoute(user_id=i, file_name=f"Route{i}.gpx", file_data=gpx_data)
            route.save()
        except IOError as e:
            print(f"Failed to process {gpx_file_path}: {e}")


def init_friendships():
    """Initialize the database with friendships between customers."""
    users = User.query.filter_by(role="customer").all()

    # Create friendships between all the users, default status is 'pending'
    for user in users:
        for friend in users:
            if user.user_id != friend.user_id:
                friendship = Friendship(requester_id=user.user_id, receiver_id=friend.user_id, status='pending')
                friendship.save()
