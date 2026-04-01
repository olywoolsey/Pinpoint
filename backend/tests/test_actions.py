import os
import sys
import base64
import pytest
from setup import app, client, runner, init_routes, init_friendships, authenticated_client, authenticated_admin_client
from app import create_app, db
from app.auth import generate_password_hash, check_password_hash
from app.models import User, SubscriptionPlan, GPSRoute, Friendship

# Add the parent directory (backend) to the sys.path to allow imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))


@pytest.mark.actions
@pytest.mark.content
@pytest.mark.parametrize("path", [
    '/projections',
    '/users_data',
])
def test_manager_protected(client, path):
    """Test that the specified page can't be accessed."""
    response = client.get(path)
    assert response.status_code == 401  # Expected unauthorized status code as user is not logged in


@pytest.mark.actions
@pytest.mark.auth
# @pytest.mark.skip(reason="Tests pass, no new changes.")
@pytest.mark.parametrize("email,password,expected_status", [
    ('testing@testing.com', 'testing123', 200),  # Valid login
    ('nonexistent@example.com', 'password', 401),  # Non-existent user
    ('testing@testing.com', 'wrongpassword', 401),  # Wrong password for an existing user
    ('c4@customer.com', 'cust', 401)  # Missing credentials
])
def test_login_route(app, client, email, password, expected_status):
    """Test that the login route can be used with various credentials."""
    with app.app_context():
        response = client.post('/login', json={
            'email': email,
            'password': password
        })
        # Check if test passes
        assert response.status_code == expected_status
        if response.status_code == 200:
            assert 'access_token' in response.get_json()

# @pytest.mark.actions
# @pytest.mark.auth
# def test_login_route(app, client, auth_client):
#     # ('testing123', 'newPass123!', 'newPass123!', True),
#     # Invalid current password
#     # ('wrongCurPwd', 'newPass123!', 'newPass123!', False),

#     """Test that the login route can be used with various credentials."""
#     with app.app_context():

#         test_user = User.query.filter_by(username='testing').first()
#         assert test_user.email == "testing@testing.com"

#         password = 'testing123'
#         new_password1 = 'NEW_password123'
#         new_password2 = 'NEW_password123'

#         response2 = auth_client.post('/change_password', json={
#             'currentPassword': password,
#             'newPassword1': new_password1,
#             'newPassword2': new_password2
#         })

#         assert response2.status_code == 200
#         test_user = User.query.filter_by(username='testing').first()
#         assert check_password_hash(test_user.password_hash, new_password1)



@pytest.mark.actions
@pytest.mark.auth
@pytest.mark.parametrize("username,email,password,expected_status,expected_message", [
    ('user112334', 'new@example.com', 'password123', 201, "Registration successful"),
    ('n', 'n@example.com', 'password123', 400, "Username must be at least 4 characters long."),
    ('newuser', 'new@example.com', 'short', 400, "Password must be at least 8 characters long."),
    ('validname', 'testing@testing.com', 'password123', 400, "Account with that email already exists."),
    ('testing', 'c@customer.com', 'customer123', 400, "Username taken, please choose another."),
])
def test_register_route(app, client, username, email, password, expected_status, expected_message):
    """Test the registration route with various inputs."""
    with app.app_context():
        response = client.post('/register', json={
            'username': username,
            'email': email,
            'password': password
        })
        assert response.status_code == expected_status
        response_data = response.get_json()
        if expected_message:
            assert expected_message in response_data["message"]


@pytest.mark.actions
@pytest.mark.auth
def test_logout_route(app):
    """Test that the logout route behaves as expected."""
    with app.test_client() as new_client:
        # Perform login action
        response = new_client.post('/login', json={
            'email': 'testing@testing.com',
            'password': 'testing123'
        })
        assert response.status_code == 200
        # Perform logout action
        response = new_client.get('/logout')
        assert response.status_code == 200
        # Attempt to access a protected route
        response = new_client.get('/welcome')
        # Expected unauthorized status code as user is not logged in
        assert response.status_code == 401


@pytest.mark.actions
@pytest.mark.auth
# @pytest.mark.skip(reason="Tests pass, no new changes.")
def test_delete_account(app, authenticated_client):
    """Test that the delete account route can be accessed."""
    with app.app_context():
        user = User.query.filter_by(username='testing').first()
        assert user is not None
        assert user.email == 'testing@testing.com'
        response = authenticated_client.post('/delete_account')
        assert response.status_code == 200
        # Show that the user has been deleted
        user = User.query.filter_by(username='testing').first()
        assert user is None
        assert b'User deleted successfully' in response.data


@pytest.mark.actions
@pytest.mark.auth
# @pytest.mark.skip(reason="Tests pass, no new changes.")
@pytest.mark.parametrize("new_username", [
    'testing',
    'new_test_user',
    'user2'
])
def test_change_username(app, authenticated_client, new_username):
    """Test that the change username route can be accessed and properly handled."""
    with app.app_context():
        # Ensure a test customer exists
        test_customer = User.query.filter_by(username='testing').first()
        assert test_customer is not None, "Test customer should exist before attempting to change username."
        test_customer_username = test_customer.username
        # Check if the username was already taken and handle assertions accordingly
        new_username_user = User.query.filter_by(username=new_username).first()
        # Attempt to change the username
        response = authenticated_client.post('/change_username', json={'new_username': new_username})
        # Check if new username is the same as current
        if new_username == test_customer_username:
            assert response.status_code == 400, "Expected failure when attempting to change to the same username."
            assert 'New username cannot be the same as current.' in response.get_json()['message']
        elif new_username_user:
            assert response.status_code == 400, "Expected failure when attempting to change to an existing username."
            assert 'Username taken, please choose another.' in response.get_json()['message']
        else:
            assert response.status_code == 200, "Expected successful username change."
            assert 'Username successfully updated.' in response.get_json()['message']
            updated_customer = User.query.filter_by(
                user_id=test_customer.user_id).first()
            assert updated_customer.username == new_username, "Username should have been updated in the database."


@pytest.mark.actions
@pytest.mark.auth
@pytest.mark.parametrize("current_password,new_password,expected_result", [
    # Successful password change
    ('testing123', 'newPass123!', True),
    # Invalid current password
    ('wrongCurPwd', 'newPass123!', False),
    # New password matches current
    ('testing123', 'testing123', False),
    # New password too short
    ('testing123', '1', False),
])
def test_change_password(app, authenticated_client, current_password, new_password, expected_result):
    """Test that the change password route can be accessed and properly handled."""
    with app.app_context():
        test_customer = User.query.filter_by(username='testing').first()
        assert test_customer is not None, "Test customer should exist before attempting to change password."
        assert test_customer.password_hash is not None
        # Attempt to change the password
        response = authenticated_client.post('/change_password', json={
            'current_password': current_password,
            'new_password': new_password,
        })
        # Assertions based on expected outcome
        if expected_result:
            assert response.status_code == 200, "Expected successful password change."
            assert "Password successfully updated." in response.get_json()['message'], "Expected success message in response."
            # Verify the password was actually changed
            updated_customer = User.query.filter_by(
                user_id=test_customer.user_id).first()
            assert check_password_hash(
                updated_customer.password_hash, new_password), "Password should have been updated in the database."
        else:
            assert response.status_code == 400 or response.status_code == 401


@pytest.mark.actions
@pytest.mark.content
@pytest.mark.parametrize("file_name, route_name, expected_status, expected_message", [
    ('Route1.gpx', 'Test Route 1', 200, 'File uploaded successfully'),  # Valid GPX file
    ('map.png', 'BadRoute', 400, 'File is not in GPX format'),  # Invalid file type
    ('', '', 400, 'No file selected')  # No file
])
def test_upload_route(app, authenticated_client, file_name, route_name, expected_status, expected_message):
    """Test uploading different file formats to ensure only GPX files are accepted."""
    data = {'routeName': route_name}  # Always send routeName, even if empty
    # Handle file upload if filename is provided
    if file_name:
        file_path = os.path.join(os.path.dirname(
            __file__), f'GPX_data/{file_name}')
        # Conditionally add the file to the data payload if it exists
        if os.path.exists(file_path):
            data['routeFile'] = open(file_path, 'rb')
        else:
            # Simulate a missing file by not including 'routeFile' in the data
            pass
    else:
        # Simulate sending no file by providing an empty file-like object with an empty name
        data['routeFile'] = (b'', '')
    # Make the request
    response = authenticated_client.post('/upload', data=data, content_type='multipart/form-data')
    # Check assertions
    assert response.get_json().get('message') == expected_message, \
        f"Expected message '{expected_message}', got '{response.get_json().get('message')}'"
    # If a file was opened, close it after the request has been made
    if 'routeFile' in data and hasattr(data['routeFile'], 'close'):
        data['routeFile'].close()


@pytest.mark.actions
@pytest.mark.content
def test_deleting_route(app, authenticated_client):
    """Test that a route can be deleted."""
    with app.app_context():
        # query database for testing user and return their id
        user = User.query.filter_by(username='testing').first()
        # Create a new route
        file_path = os.path.join(os.path.dirname(__file__), 'GPX_data/Route1.gpx')
        with open(file_path, 'rb') as file:
            new_route = GPSRoute(user_id=user.user_id, file_name='Test Route', file_data=file.read())
            db.session.add(new_route)
            db.session.commit()
            route_id = new_route.route_id
        # Check if the route exists
        assert route_id is not None
        # Delete the route
        response = authenticated_client.post('/delete_route', json={'route_id': route_id})
        print(f"Response: {response.data}")
        print(f"Response JSON: {response.get_json()}")
        print(f"Route ID: {route_id}")
        print(f"Route: {GPSRoute.query.filter_by(route_id=route_id).first()}")
        assert response.status_code == 200
        assert response.get_json()['message'] == 'Route deleted successfully'
        assert GPSRoute.query.filter_by(route_id=route_id).first() is None


@pytest.mark.actions
@pytest.mark.content
def test_download_existing_route(app, authenticated_client):
    """Test downloading an existing route."""
    with app.app_context():
        # Create a new route
        file_path = os.path.join(os.path.dirname(__file__), 'GPX_data/Route1.gpx')
        with open(file_path, 'rb') as file:
            file_content = file.read()
            new_route = GPSRoute(user_id=1, file_name='Test Route', file_data=file_content)
            db.session.add(new_route)
            db.session.commit()
            route_id = new_route.route_id
        # check if the route exists
        assert route_id is not None
        # Attempt to download the route
        response = authenticated_client.get(f'/download_route?route_id={route_id}')
        # Check the HTTP status code and response message
        assert response.status_code == 200
        assert response.get_json()['message'] == 'Route found'
        # Check if the downloaded route data matches the expected content
        expected_content_base64 = base64.b64encode(file_content).decode()
        assert response.get_json()['route_data'] == expected_content_base64, \
            "The downloaded route data does not match the expected content."


@pytest.mark.actions
@pytest.mark.content
def test_manager_access(app, authenticated_admin_client):
    """Test that the manager can access the manager dashboard."""
    with app.app_context():
        # Attempt to access users data in manager dashboard
        response = authenticated_admin_client.get('/users_data')
        assert response.status_code == 200
        assert b'testing' in response.data
        # Attempt to access revenue projections in manager dashboard
        response = authenticated_admin_client.get('/projections')
        assert response.status_code == 200
        assert b'Revenue Projections' in response.data
