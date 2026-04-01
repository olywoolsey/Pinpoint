"""
Contains routes for returning routes and friends data.
"""
import base64
import gpxpy
from flask import request, Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from .models import User, GPSRoute, Friendship

journeys = Blueprint('journeys', __name__)

@journeys.route('/upload', methods=['POST'])
@jwt_required()
def upload():
    """
    Uploads a file to the server
    Returns:
        - dict: The upload message
    """
    # Check if the request has the file part
    if 'routeFile' not in request.files:
        return {"message": 'No file received'}
    file = request.files['routeFile']
    if file.filename == '':
        return {"message": 'No file selected'}
    # Check file is GPX format
    if not file.filename.endswith('.gpx'):
        return {"message": 'File is not in GPX format'}
    
    # Get ID of user uploading file
    user_id = get_jwt_identity()
    # Get name of route
    route_name = request.form['routeName']

    # Save file to server
    new_route = GPSRoute(user_id=user_id, file_name=route_name, file_data=file.read())
    route_id = new_route.route_id
    db.session.add(new_route)
    db.session.commit()
    return {"message": 'File uploaded successfully', "route_id": route_id}


@journeys.route('/get_route_list', methods=['GET', 'POST'])
@jwt_required()
def get_route_list():
    """
    Gets the list of routes for the specified user and their friends from the database.
    Returns:
        - dict: The route list
    """
    user_id = get_jwt_identity()
    # Get user's friends
    user = User.query.filter_by(user_id=user_id).first()
    friends = user.current_friends()

    # Get list of routes from database for user and friends
    route_list = []
    # Get user's routes
    routes = GPSRoute.query.filter_by(user_id=user_id).all()
    if routes:
        for route in routes:
            route_list.append([0, route.route_id, route.file_name])
    else:
        route_list.append([])
    # Get friends' routes
    for friend in friends:
        routes = GPSRoute.query.filter_by(user_id=friend.user_id).all()
        if routes:
            for route in routes:
                route_list.append([friend.user_id, route.route_id, route.file_name])

    # Return message depending on whether route_list is empty
    return {"message": 'No routes found' if not route_list else 'Route list found', "route_list": route_list}


@journeys.route('/get_route', methods=['GET'])
@jwt_required()
def get_route():
    """
    Gets the specified user route from the database and parses it.
    Returns:
        - dict: The route message and route data
    """
    user_id = get_jwt_identity()
    # Get list of user friend IDs
    friend_user_ids = [friend.user_id for friend in User.query.filter_by(user_id=user_id).first().current_friends()]
    route_id = request.args.get('route_id', None)
    route_user_id = request.args.get('route_user_id', None)
    # If current user's route set the ID to the current user's ID
    if route_user_id == '0':
        route_user_id = user_id
    # Otherwise convert to integer
    else:
        route_user_id = int(route_user_id)

    # Check user is authorised to access route
    if (route_user_id != user_id) and (route_user_id not in friend_user_ids):
        return {"message": 'Route not found1',
                "route_name": 'Route not found1'}
    # Get route from database checking it belongs to logged in user or a friend
    route = GPSRoute.query.filter_by(user_id=route_user_id, route_id=route_id).first()

    # If no route is found return this error
    if route is None:
        return {"message": 'No route found',
                "route_name": 'No route found'}

    # Iff a route exists
    route_file = route.file_data
    route_name = route.file_name
    # Parse GPX file
    gpx = gpxpy.parse(route_file)
    # Extract latitude and longitude coordinate pairs
    coordinates = []
    for track in gpx.tracks:
        for segment in track.segments:
            for point in segment.points:
                coordinates.append((point.latitude, point.longitude))

    return {"message": 'Route found',
            "route_name": route_name,
            "coordinates": coordinates}


@journeys.route('/delete_route', methods=['POST'])
@jwt_required()
def delete_route():
    """
    Deletes the specified user route from the database.
    Returns:
        - dict: The delete message
    """
    user_id = get_jwt_identity()
    route_id = request.json.get('route_id', None)

    # Get route from database checking it belongs to logged-in user
    route = GPSRoute.query.filter_by(user_id=user_id, route_id=route_id).first()

    # If no route is found return this error
    if route is None:
        return {"message": 'No route found'}
    route.delete()
    return {"message": 'Route deleted successfully'}


@journeys.route('/download_route', methods=['GET'])
@jwt_required()
def download_route():
    """
    Returns the specified file for the user to download.
    Returns:
        - dict: The download message and file data
    """
    route_id = request.args.get('route_id', None)

    # Get route from database
    route = GPSRoute.query.filter_by(route_id=route_id).first()

    # If no route is found return this error
    if route is None:
        return {"message": 'No route found'}

    # Encode file data to base64
    file_data_base64 = base64.b64encode(route.file_data).decode()

    return {"message": 'Route found',
            "route_name": route.file_name,
            "route_data": file_data_base64}


@journeys.route('/get_friends', methods=['GET'])
@jwt_required()
def get_friends():
    """
    Gets the list of friends for the specified user from the database.
    Returns:
        - dict: The friends list
    """
    user_id = get_jwt_identity()

    # Get current friends from database
    user = User.query.filter_by(user_id=user_id).first()
    current_friends = user.current_friends()
    current_friends_list = [(friend.user_id, friend.username) for friend in current_friends]

    # Get incoming pending friend requests from database
    incoming_friends = user.incoming_pending_friends()
    incoming_friends_list = [(friend.user_id, friend.username) for friend in incoming_friends]

    # Get outgoing pending friend requests from database
    outgoing_friends = user.outgoing_pending_friends()
    outgoing_friends_list = [(friend.user_id, friend.username) for friend in outgoing_friends]

    return {"current_friends": current_friends_list,
            "incoming_friends": incoming_friends_list,
            "outgoing_friends": outgoing_friends_list}


@journeys.route('/request_friend', methods=['POST'])
@jwt_required()
def request_friend():
    """
    Adds a friend to the specified user in the database.
    Returns:
        - dict: The request message depending on whether the friend was requested successfully
    """
    user_id = get_jwt_identity()
    user = User.query.filter_by(user_id=user_id).first()
    friend_username = request.json.get('username', None)
    # Get friend from database
    friend = User.query.filter_by(username=friend_username).first()
    if friend is None:
        return {"message": "User " + friend_username + ' not found'}
    if friend.user_id == user.user_id:
        return {"message": 'You cannot request yourself as a friend'}

    # Check if friendship already exists
    friend_id = friend.user_id
    if friend_id in [f.user_id for f in user.current_friends()]:
        return {"message": friend_username + ' is already a friend'}
    if friend_id in [f.user_id for f in user.incoming_pending_friends()]:
        return {"message": 'Friend request already received from ' + friend_username}
    if friend_id in [f.user_id for f in user.outgoing_pending_friends()]:
        return {"message": 'Friend request already sent to ' + friend_username}
    if friend_id in [f.user_id for f in user.permanently_rejected_friends()]:
        return {"message": 'Friend request already rejected too many times by ' + friend_username}

    # Add friendship to database with status pending
    new_friend = Friendship(requester_id=user_id, receiver_id=friend.user_id, status='pending')
    db.session.add(new_friend)
    db.session.commit()
    return {"message": 'Friend request sent'}


@journeys.route('/remove_friend', methods=['POST'])
@jwt_required()
def remove_friend():
    """
    Deletes a friend from the specified user in the database.
    Returns:
        - dict: The remove message depending on whether the friend was removed successfully
    """
    user_id = get_jwt_identity()
    friend_id = (User.query.filter_by(user_id=request.json.get('friend_id')).first()).user_id
    # Get friend from database
    friend = Friendship.query.filter_by(requester_id=user_id, receiver_id=friend_id).first()

    # Check if friend can be removed
    if friend:
        db.session.delete(friend)
    if friend is None:
        friend = Friendship.query.filter_by(requester_id=friend_id, receiver_id=user_id).first()
        if friend is None:
            return {"message": 'No friend found'}
        else:
            db.session.delete(friend)
    db.session.commit()
    return {"message": 'Friend removed successfully'}


@journeys.route('/accept_friend', methods=['POST'])
@jwt_required()
def accept_friend():
    """
    Accepts a friend request for the specified user in the database.
    Returns:
        - dict: The accept message depending on whether the friend request was accepted successfully
    """
    user_id = get_jwt_identity()
    friend_id = (User.query.filter_by(user_id=request.json.get('friend_id')).first()).user_id
    # Get friend from database
    friend = Friendship.query.filter_by(requester_id=friend_id, receiver_id=user_id).first()

    # Check if friend request can be accepted
    if friend is None:
        return {"message": 'No friend request found'}
    if friend.status == 'accepted':
        return {"message": 'Friend request already accepted'}
    friend.status = 'accepted'
    db.session.commit()
    return {"message": 'Friend request accepted'}


@journeys.route('/reject_friend', methods=['POST'])
@jwt_required()
def reject_friend():
    """
    Rejects a friend request for the specified user in the database.
    Returns:
        - dict: The reject message depending on whether the friend request was rejected successfully
    """
    user_id = get_jwt_identity()
    friend_id = (User.query.filter_by(user_id=request.json.get('friend_id')).first()).user_id
    # Get friend from database
    friend = Friendship.query.filter_by(requester_id=friend_id, receiver_id=user_id).first()

    # Check if friend request can be rejected
    if friend is None:
        return {"message": 'No friend request found'}
    if friend.status == 'rejected':
        return {"message": 'Friend request already rejected'}
    friend.status = 'rejected'
    db.session.commit()
    return {"message": 'Friend request rejected'}


@journeys.route('/cancel_request', methods=['POST'])
@jwt_required()
def cancel_request():
    """
    Cancels a friend request for the specified user in the database.
    Returns:
        - dict: The cancel message depending on whether the friend request was cancelled successfully
    """
    user_id = get_jwt_identity()
    friend_id = (User.query.filter_by(user_id=request.json.get('friend_id')).first()).user_id
    # Get friend from database
    friend = Friendship.query.filter_by(requester_id=user_id, receiver_id=friend_id).first()

    # Check if friend request can be cancelled
    if friend is None:
        return {"message": 'No friend request found'}
    if friend.status != 'pending':
        return {"message": 'Friend request already accepted or rejected'}
    db.session.delete(friend)
    db.session.commit()
    return {"message": 'Friend request cancelled'}
