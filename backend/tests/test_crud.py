import os
import sys
import random as r
import pytest
from setup import app, client, runner, init_routes, init_friendships
from app import create_app, db
from app.auth import generate_password_hash, check_password_hash
from app.models import User, SubscriptionPlan, GPSRoute, Friendship

# Add the parent directory (backend) to the sys.path to allow imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))


@pytest.mark.crud
@pytest.mark.users
def test_retrieval_valid_customer(app):
    with app.app_context():
        """Ensure a new customer can be retrieved from the database."""
        customer = User.query.filter_by(username='testing').first()
        assert customer is not None, "Customer 'testing' does not exist"
        assert customer.username == 'testing', f"Expected username 'testing', got '{customer.username}'"
        assert customer.email == 'testing@testing.com', f"Expected email 'testing@testing.com', got '{customer.email}'"
        assert check_password_hash(customer.password_hash, 'testing123'), "Password does not match"
        assert customer.user_id > 0, "user ID is valid"


@pytest.mark.crud
@pytest.mark.users
# @pytest.mark.skip(reason="No changes made, tests are already passing")
def test_retrieval_invalid_customer(app):
    """Check that a customer with missing fields is not in the database."""
    with app.app_context():
        # Create a customer with missing fields
        bad_customer = User(username='bad_customer', email='bc@customer.com')
        bad_customer.save()
        # Should not be in the database
        assert (User.query.filter_by(username='bad_customer').first()) is None


@pytest.mark.crud
@pytest.mark.users
def test_update_customer(app):
    with app.app_context():
        """Ensure a customer's username can be updated."""
        # Get the testing customer from the database
        customer = User.query.filter_by(username='testing').first()
        assert customer is not None
        assert customer.username == 'testing'
        # Update the customer's username
        customer.username = 'new_customer'
        db.session.commit()
        # Check that the customer's username has been updated
        assert (User.query.filter_by(username='new_customer').first()) is not None


@pytest.mark.crud
@pytest.mark.users
def test_delete_customer(app):
    with app.app_context():
        """Ensure a customer can be deleted from the database."""
        customer = User.query.filter_by(username='testing').first()
        assert customer is not None
        assert customer.username == 'testing'
        # Delete the customer
        customer.delete()
        assert (User.query.filter_by(username='testing').first()) is None


@pytest.mark.crud
@pytest.mark.plans
# @pytest.mark.skip(reason="No changes made, tests are already passing")
def test_new_valid_plan(app):
    with app.app_context():
        # Get the number of plans in the database
        num_plans = SubscriptionPlan.query.count()
        assert num_plans == 3

        # Get the first plan in the database
        plan = SubscriptionPlan.query.first()
        assert plan is not None
        assert plan.plan_type == 'weekly'
        assert float(plan.price) == 2.00

        # Add a new plan
        new_plan = SubscriptionPlan(plan_type='quarterly', price=19.99)
        new_plan.save()

        # Get the number of plans in the database
        assert SubscriptionPlan.query.count() == num_plans + 1

        # Get the last plan in the database
        assert SubscriptionPlan.query.order_by(SubscriptionPlan.plan_id.desc()).first().plan_type == 'quarterly'


@pytest.mark.crud
@pytest.mark.plans
# @pytest.mark.skip(reason="No changes made, tests are already passing")
def test_new_invalid_plan(app):
    with app.app_context():
        # Create a plan with missing fields
        bad_plan = SubscriptionPlan(plan_type='quarterly')
        bad_plan.save()
        assert (SubscriptionPlan.query.filter_by(
            plan_type='quarterly').first()) is None


@pytest.mark.crud
@pytest.mark.plans
# @pytest.mark.skip(reason="No changes made, tests are already passing")
def test_update_plan_price(app):
    with app.app_context():

        # Get the first plan in the database
        plan = SubscriptionPlan.query.first()
        assert plan is not None
        assert plan.plan_type == 'weekly'
        assert float(plan.price) == 2.00

        # Update the plan's type and price
        plan.plan_type = 'bi-weekly'
        plan.price = 3.99
        db.session.commit()
        assert (SubscriptionPlan.query.filter_by(
            plan_type='bi-weekly').first()) is not None
        assert float(plan.price) == 3.99


@pytest.mark.crud
@pytest.mark.plans
# @pytest.mark.skip(reason="No changes made, tests are already passing")
def test_delete_plan(app):
    with app.app_context():

        num_plans = SubscriptionPlan.query.count()
        assert num_plans == 3

        # Get the first plan in the database
        plan = SubscriptionPlan.query.first()
        assert plan is not None
        assert plan.plan_type == 'weekly'

        # Delete the plan
        plan.delete()
        assert (SubscriptionPlan.query.filter_by(
            plan_type='weekly').first()) is None
        assert SubscriptionPlan.query.count() == num_plans - 1


@pytest.mark.crud
@pytest.mark.routes
# @pytest.mark.skip(reason="No changes made, tests are already passing")
def test_new_valid_route(app):
    with app.app_context():
        init_routes()

        # Get the number of routes in the database
        assert GPSRoute.query.count() > 0

        # Get the first route in the database
        route = GPSRoute.query.first()
        assert route is not None
        assert route.file_name == 'Route1.gpx'

        # Verify file data is binary type
        assert route.file_data is not None
        assert isinstance(route.file_data, bytes)
        assert route.user_id > 0


@pytest.mark.crud
@pytest.mark.routes
# @pytest.mark.skip(reason="No changes made, tests are already passing")
def test_new_invalid_route(app):
    with app.app_context():
        # Create a route with missing fields
        bad_route = GPSRoute(user_id=1, file_name='badroute.gpx')
        bad_route.save()

        assert (GPSRoute.query.filter_by(route_id=1).first()) is None


@pytest.mark.crud
@pytest.mark.routes
# @pytest.mark.skip(reason="No changes made, tests are already passing")
def test_update_route(app):
    with app.app_context():
        init_routes()

        # Get the first route in the database
        route = GPSRoute.query.first()
        assert route is not None
        assert route.file_name == 'Route1.gpx'

        # Update the route's file name
        route.file_name = 'newroute.gpx'
        db.session.commit()
        assert (GPSRoute.query.filter_by(route_id=1).first()) is not None
        assert route.file_name == 'newroute.gpx'


@pytest.mark.crud
@pytest.mark.routes
# @pytest.mark.skip(reason="No changes made, tests are already passing")
def test_delete_route(app):
    with app.app_context():
        init_routes()

        # Get the first route in the database
        route = GPSRoute.query.first()
        assert route is not None
        assert route.file_name == 'Route1.gpx'

        # Delete the route
        route.delete()
        assert (GPSRoute.query.filter_by(route_id=1).first()) is None


@pytest.mark.crud
@pytest.mark.friendships
# @pytest.mark.skip(reason="No changes made, tests are already passing")
def test_new_valid_friendship(app):
    with app.app_context():
        init_friendships()

        # Get the number of friendships in the database
        assert Friendship.query.count() > 0

        # Get the first friendship in the database
        friendship = Friendship.query.first()
        assert friendship is not None
        assert friendship.status.lower() == 'pending'
        assert friendship.requester_id > 0
        assert friendship.receiver_id > 0


@pytest.mark.crud
@pytest.mark.friendships
# @pytest.mark.skip(reason="No changes made, tests are already passing")
def test_new_invalid_friendship(app):
    with app.app_context():
        # Create a friendship with missing fields
        bad_friendship_req = Friendship(requester_id=1, status='Pending')

        # Should not be in the database
        assert (Friendship.query.filter_by(requester_id=1).first()) is None
        

@pytest.mark.crud
@pytest.mark.friendships
# @pytest.mark.skip(reason="No changes made, tests are already passing")
def test_update_friendship(app):
    with app.app_context():
        init_friendships()

        # Get the first friendship in the database
        friendship = Friendship.query.first()

        assert friendship.status.lower() == 'pending'
        assert friendship is not None

        # Randomly act on each friendship
        options = ['cancelled', 'accepted', 'rejected']

        for friendship in Friendship.query.all():
            friendship.status = r.choice(options)
            
        assert all([friendship.status != 'pending' for friendship in Friendship.query.all()])
        

@pytest.mark.crud
@pytest.mark.friendships
# @pytest.mark.skip(reason="No changes made, tests are already passing")
def test_delete_friendship(app):
    with app.app_context():
        init_friendships()

        # Get the first friendship in the database
        friendship = Friendship.query.first()
        assert friendship is not None
        assert friendship.status.lower() == 'pending'

        # Delete the friendship
        friendship.delete()
        assert (Friendship.query.filter_by(friendship_id=1).first()) is None
        
    