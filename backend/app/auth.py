"""
Contains routes for user authentication and account management.
"""
from datetime import datetime, timedelta, timezone
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, get_jwt, get_jwt_identity, jwt_required, unset_jwt_cookies
from werkzeug.security import generate_password_hash, check_password_hash
from app import db
from .models import User, GPSRoute, Friendship

auth = Blueprint('auth', __name__)


@auth.after_request
def refresh_expiring_jwts(response):
    """
    Refresh the JWT if it is about to expire.
    Parameters:
        response: The response object.
    Returns:
        response: The response object with the new JWT added.
    """
    try:
        # Check if the JWT is about to expire
        expiry_timestamp = get_jwt()["exp"]
        now = datetime.now(timezone.utc)
        target_timestamp = datetime.timestamp(now + timedelta(minutes=55))
        if target_timestamp > expiry_timestamp:
            # Create a new access token and return it in the response
            access_token = create_access_token(identity=get_jwt_identity())
            # Add the new access token to the response
            response = response.get_json()
            if type(response) is dict:
                response["access_token"] = access_token
                return jsonify(response)
            
    except (RuntimeError, KeyError):
        # If no valid JWT return the original response
        pass
    return response


@auth.route('/login', methods=['GET', 'POST'])
def login():
    """
    Log in the user and return the JWT.
    Returns:
        - dict: The JWT.
    """
    # Get data from request
    email = request.json.get('email', None)
    password = request.json.get('password', None)

    # Check if user exists and password is correct
    user = User.query.filter_by(email=email).first()
    if not user:
        return {"message": "Account with that email address not found."}, 401
    if not user or not check_password_hash(user.password_hash, password):
        return {"message": "Incorrect password, please try again."}, 401

    # Create access token and return it
    access_token = create_access_token(identity=user.user_id)

    return jsonify({"access_token": access_token}), 200


@auth.route('/logout', methods=['GET', 'POST'])
# No jwt_required() decorator here because the user is logging out
def logout():
    """
    Logout the user by revoking the JWT.
    Returns:
        - dict: The logout message.
    """
    # Create response and unset JWT cookies
    response = jsonify({"message": "Logout successful"})
    unset_jwt_cookies(response)
    return response, 200


@auth.route('/register', methods=['POST'])
def register():
    """
    Register a new user.
    Returns:
        - dict: The registration message.
    """
    # Get data from request
    username = request.json.get('username', None)
    email = request.json.get('email', None)
    password = request.json.get('password', None)

    # Check if all fields are filled
    if not email or not password or not username:
        return jsonify({"message": "Please fill in all fields."}), 400
    if len(password) < 8:
        return jsonify({"message": "Password must be at least 8 characters long."}), 400
    if len(username) < 4:
        return jsonify({"message": "Username must be at least 4 characters long."}), 400
    
    # Check if user already exists
    existing_email = User.query.filter_by(email=email).first()
    if existing_email:
        return jsonify({"message": "Account with that email already exists."}), 400
    
    # Check if username is taken
    existing_username = User.query.filter_by(username=username).first()
    if existing_username:
        return jsonify({"message": "Username taken, please choose another."}), 400
    
    # Create new user and add to database
    new_user = User(email=email, password_hash=generate_password_hash(password, method='pbkdf2:sha1', salt_length=8),
                    username=username, plan_id=0, role='customer')
    db.session.add(new_user)
    db.session.commit()

    # Create access token and return it
    access_token = create_access_token(identity=new_user.user_id)
    return jsonify({"message": "Registration successful", "access_token": access_token}), 201

@auth.route('/welcome', methods=['GET', 'POST'])
@jwt_required()
def welcome():
    """
    Return a welcome message for the authenticated user.
    Returns:
        - dict: The welcome message.
    """
    # Get the current user's name
    current_user_id = get_jwt_identity()
    current_user_name = User.query.filter_by(
        user_id=current_user_id).first().username
    return jsonify({"name": current_user_name}), 200


@auth.route('/change_username', methods=['POST'])
@jwt_required()
def change_username():
    """
    Change the user's username.
    Returns:
        - dict: The status message.
    """
    # Get data from request
    new_username = request.json.get('new_username', None)
    current_user_id = get_jwt_identity()
    user = User.query.filter_by(user_id=current_user_id).first()

    # Check if user exists and username is valid
    if User.query.filter_by(username=new_username).first():
        if new_username == user.username:
            return jsonify({"message": "New username cannot be the same as current."}), 400
        else:
            return jsonify({"message": "Username taken, please choose another."}), 400

    # Create new username and add to database
    user.username = new_username
    db.session.commit()

    return {"message": "Username successfully updated."}, 200


@auth.route('/change_password', methods=['GET', 'POST'])
@jwt_required()
def change_password():
    """
    Change the user's password.
    Returns:
        - dict: The status message.
    """
    # Get data from request
    current_password = request.json.get('current_password', None)
    new_password = request.json.get('new_password', None)
    current_user_id = get_jwt_identity()

    # Check if user exists and password is correct
    user = User.query.filter_by(user_id=current_user_id).first()
    if len(new_password) < 8:
        return jsonify({"message": "Password must be at least 8 characters long."}), 400
    if not user or not check_password_hash(user.password_hash, current_password):
        return {"message": "Current password incorrect."}, 401

    # Check if new password is the same as the current password
    if current_password == new_password:
        return {"message": "New password cannot be same as current."}, 400

    # Create new password and add to database
    user.password_hash = generate_password_hash(new_password, method='pbkdf2:sha1', salt_length=8)
    db.session.commit()

    return {"message": "Password successfully updated."}, 200


@auth.route('/delete_account', methods=['GET', 'POST'])
@jwt_required()
def delete_account():
    """
    Delete the user's account.
    Returns:
        - dict: The deletion message
    """
    current_user_id = get_jwt_identity()
    user = User.query.filter_by(user_id=current_user_id).first()
    # Delete the user's routes
    user_routes = GPSRoute.query.filter_by(user_id=current_user_id).all()
    for route in user_routes:
        route.delete()
    # Delete the user's friendships
    user_friendships = Friendship.query.filter(
        (Friendship.requester_id == current_user_id) | (Friendship.receiver_id == current_user_id)).all()
    for friendship in user_friendships:
        friendship.delete()
    user.delete()

    return {'message': 'User deleted successfully'}, 200


@auth.route('/check_user_role', methods=['GET', 'POST'])
@jwt_required()
def check_user_role():
    """
    Checks whether the user is a customer or manager.
    Returns:
        - dict: The user's role.
    """
    current_user_id = get_jwt_identity()
    current_user_role = User.query.filter_by(user_id=current_user_id).first().role
    return jsonify({"user_role": current_user_role}), 200
