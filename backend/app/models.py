"""
Database models for the application.
"""
from datetime import datetime
from app import db
from flask_login import UserMixin
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import or_, and_, DateTime
from sqlalchemy.exc import SQLAlchemyError


class BaseModel(db.Model):
    """Base class for all SQLAlchemy models in the application.
    All models should inherit from this class to ensure that they have the required fields and methods.

    Attributes: - created_at (datetime): Timestamp of when the record was created, set by default to the current
    time. - updated_at (datetime): Timestamp of the last update to the record, updated automatically to the current
    time on record update.

    The __repr__ method provides a friendly representation of the record.
    The save method is used to save the current record to the database.

    This class is abstract and is intended to be inherited by other models.
    """
    __abstract__ = True

    created_at = db.Column(db.DateTime(timezone=True), default=datetime.now)
    updated_at = db.Column(db.DateTime(timezone=True),
                           default=datetime.now, onupdate=datetime.now)

    def __repr__(self):
        """Provide a simple representation of the record.
        E.g. "<User {'user_id': 1, 'username': 'testuser', ...}>"
        """
        return f"<{self.__class__.__name__}: {self.__dict__}>"

    def save(self):
        """Save the current record to the database.
        For new records, this will add the record to the session and commit it to the database.
        For existing records, this will only commit the changes to the database.

        By using this method, we can ensure that the record is saved to the database after making changes to it,
            without having to call db.session.add() and db.session.commit() manually in the application code.
        """

        # Last stage of error checking for the db session
        try:
            db.session.add(self)
            db.session.commit()
        except SQLAlchemyError as e:
            print(f"Error adding record to session: {e}")
            db.session.rollback()
            return e

    def delete(self):
        """
        Delete the current record from the database.
        """
        try:
            db.session.delete(self)
            db.session.commit()
        except Exception as e:
            print("Error deleting record from session: ", e)
            db.session.rollback()
            return e


class User(BaseModel, UserMixin):
    """User model representing a user in the system.

    Inherits from BaseModel and adds specific fields and relationships for a user.

    Attributes:
    - user_id (int): Primary key for the user, auto-incrementing.
    - role (str): Role of the user, either 'customer' or 'manager', defaults to 'customer'.
    - username (str): Unique username for the user, required and unique.
    - email (str): Email address for the user, required and unique.
    - password_hash (str): Hashed password for the user, required.
    - plan_id (int): Foreign key to the subscription plan the user is subscribed to, required.
    - is_active (bool): Flag indicating if the user is active, defaults to True.

    The __repr__ method provides a friendly representation of the user.
    """
    __tablename__ = 'user'

    user_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    role = db.Column(db.String(16), default='customer')
    username = db.Column(db.String(64), nullable=False)
    email = db.Column(db.String(128), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    plan_id = db.Column(db.Integer, db.ForeignKey('subscription_plan.plan_id'), default=0)
    subscription_id = db.Column(db.String(64), default='NULL')
    subscription_date = db.Column(DateTime, default=None)

    def current_friends(self):
        """
        Return a list of the user's friends.
        """
        friendships = Friendship.query.filter(
            or_(self.user_id == Friendship.requester_id, self.user_id == Friendship.receiver_id)).all()
        friendships = [friendship for friendship in friendships if friendship.status == 'accepted']
        friends = []
        for friendship in friendships:
            if friendship.requester_id == self.user_id:
                friends.append(User.query.get(friendship.receiver_id))
            else:
                friends.append(User.query.get(friendship.requester_id))
        return friends

    def outgoing_pending_friends(self):
        """
        Return a list of the user's outgoing pending friend requests.
        """
        friendships = Friendship.query.filter(Friendship.requester_id == self.user_id).all()
        friendships = [friendship for friendship in friendships if friendship.status == 'pending']
        pending = []
        for friendship in friendships:
            pending.append(User.query.get(friendship.receiver_id))
        return pending

    def incoming_pending_friends(self):
        """
        Return a list of the user's incoming pending friend requests.
        """
        friendships = Friendship.query.filter(Friendship.receiver_id == self.user_id).all()
        friendships = [friendship for friendship in friendships if friendship.status == 'pending']
        pending = []
        for friendship in friendships:
            pending.append(User.query.get(friendship.requester_id))
        return pending

    def permanently_rejected_friends(self):
        """
        Return a list of users that the current user has requested and been rejected as a friend 3 or more times.
        """
        friendships = Friendship.query.filter(
            and_(Friendship.requester_id == self.user_id, Friendship.status == 'rejected')).all()
        rejected = []
        # if one receiver id appears more than 3 times in friendships, add to rejected
        for friendship in friendships:
            if friendships.count(friendship.receiver_id) >= 3 and User.query.get(
                    friendship.receiver_id) not in rejected:
                rejected.append(User.query.get(friendship.receiver_id))
        return rejected

    def friends_routes(self):
        """ Return the GPS routes of the user's friends (status==accepted). """
        accepted_friends_ids = [
            friendship.receiver_id for friendship in self.friendships if friendship.status.lower() == 'accepted']
        return GPSRoute.query.filter(GPSRoute.user_id.in_(accepted_friends_ids)).all()

    def __repr__(self):
        return f"<Role: {self.role}\t username: {self.username}>"


class SubscriptionPlan(BaseModel):
    """Subscription plan model representing a subscription plan in the system.

    Inherits from BaseModel and adds specific fields and relationships for a subscription plan.

    Attributes:
    - plan_id (int): Primary key for the plan, auto-incrementing.
    - plan_type (str): Type of the plan (Weekly, Monthly, Yearly), required.
    - price (decimal): Price of the plan, required.

    The __repr__ method provides a friendly representation of the plan.
    """
    __tablename__ = 'subscription_plan'

    plan_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    plan_type = db.Column(db.String(32), nullable=False)
    price = db.Column(db.Numeric(10, 2), nullable=False)

    def __repr__(self):
        return f"<SubscriptionPlan {self.plan_type}>"


class GPSRoute(BaseModel):
    """GPS route model representing a GPS route in the system.

    Inherits from BaseModel and adds specific fields and relationships for a GPS route.

    Attributes:
    - route_id (int): Primary key for the route, auto-incrementing.
    - user_id (int): Foreign key to the user that created the route, required.
    - file_name (str): Name of the file containing the route data, required.
    - file_data (bytes): Binary data of the route, required.

    The __repr__ method provides a friendly representation of the route.
    """
    __tablename__ = 'gps_route'

    route_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey(
        'user.user_id'), nullable=False)
    file_name = db.Column(db.String(32), nullable=False)
    file_data = db.Column(db.LargeBinary, nullable=False)

    def __repr__(self):
        return f"<GPSRoute {self.route_id} by User {self.user_id} from file {self.file_name}>"


class Friendship(BaseModel):
    """Friendship model represents a friendship between two users in the system.

    Inherits from BaseModel and adds specific fields and relationships for a friendship.

    Attributes:
    - friendship_id (int): Primary key for the friendship, auto-incrementing.
    - requester_id (int): Foreign key to the user that requested the friendship, required.
    - receiver_id (int): Foreign key to the user that received the friendship request, required.
    - status (str): Status of the friendship request, either 'accepted', 'cancelled', 'pending', or 'rejected', required

    The __repr__ method provides a friendly representation of the friendship.
    """
    __tablename__ = 'friendship'

    friendship_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    requester_id = db.Column(db.Integer, db.ForeignKey(
        'user.user_id'), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey(
        'user.user_id'), nullable=False)
    # "accepted", "pending", "rejected", "cancelled"
    status = db.Column(db.String(16), nullable=False)

    def __repr__(self):
        return f"<Friendship {self.friendship_id}: {self.requester_id} to {self.receiver_id} - {self.status}>"
