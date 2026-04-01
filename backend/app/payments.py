"""
Contains routes for handling payments and subscriptions.
"""
import os
from urllib.parse import urlparse, parse_qs
from flask_jwt_extended import jwt_required, get_jwt_identity
import stripe
from flask import request, Blueprint, redirect
from .models import User
from app import db
from datetime import datetime

payments = Blueprint('payments', __name__)

frontend_address = os.environ.get('FRONTEND_ADDRESS')
backend_address = os.environ.get('BACKEND_ADDRESS')
stripe.api_key = os.environ.get('STRIPE_SECRET_KEY')


@payments.route('/create_checkout_session', methods=['POST'])
@jwt_required()
def create_checkout_session():
    """
    Create a way for a customer to pay for their subscription.
    Returns:
        - dict: A dictionary containing the session ID.
    """
    current_user_id = get_jwt_identity()
    subscription_type = request.json.get('subscription_type')
    subscription_ids = {
        'weekly': os.environ.get('WEEKLY_SUB'),
        'monthly': os.environ.get('MONTHLY_SUB'),
        'annually': os.environ.get('ANNUALLY_SUB'),
    }
    # Get the subscription ID based on the subscription type from the request
    subscription_id = subscription_ids[subscription_type]
    # Create a new Checkout Session for the desired subscription
    checkout_session = stripe.checkout.Session.create(
        payment_method_types=['card'],
        line_items=[{
            'price': subscription_id,
            'quantity': 1,
        }],
        mode='subscription',
        success_url=f'{backend_address}/success?sessionid={{CHECKOUT_SESSION_ID}}',
        metadata={
            'user_id': str(current_user_id),
        },
    )
    # Return the Checkout Session ID to the frontend.
    return {'session_id': checkout_session['id']}


@payments.route('/success/', methods=['GET', 'POST'])
def add_new_subscription():
    """
    Create a way for a customer to pay for their subscription.
    Returns:
        - dict: A dictionary containing the session ID.
    """
    parsed_url = urlparse(request.url)
    # Get the query parameters
    query_params = parse_qs(parsed_url.query)
    # Get the session parameter
    session_id = query_params.get('sessionid', [None])[0]
    checkout_session = stripe.checkout.Session.retrieve(session_id)
    # Get the current user from returned metadata that was passed to stripe
    current_user_id = checkout_session["metadata"]["user_id"]
    user = User.query.filter_by(user_id=current_user_id).first()
    # If the user already has a subscription, delete it
    if user.subscription_id != "NULL":
        stripe.Subscription.delete(user.subscription_id)
    # Add the subscription ID to the database
    user.subscription_id = checkout_session["subscription"]
    paid_amount = checkout_session["amount_total"]
    if paid_amount == 200:
        user.plan_id = 1
    elif paid_amount == 700:
        user.plan_id = 2
    elif paid_amount == 8000:
        user.plan_id = 3
    user.subscription_date = datetime.now()
    db.session.commit()
    # Redirect to journeys as both stripe and our own database have got the user subscription
    return redirect(f'{frontend_address}/journeys')


@payments.route('/delete_subscription', methods=['GET', 'POST'])
@jwt_required()
def delete_subscription():
    """
    Delete the subscription on an account, without deleting the actual account.
    Returns:
        - dict or str: A success message or an error message.
    """
    try:
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(user_id=current_user_id).first()
        # Remove from Stripe servers
        if user.subscription_id:
            stripe.Subscription.delete(user.subscription_id)
        # Remove from database
        user.plan_id = 0
        user.subscription_id = 'NULL'
        db.session.commit()
        # Redirect with JavaScript for reloading the page
        return {"message": "Subscription deleted successfully"}
    except Exception as e:
        # Log the error or inform the user accordingly
        print("Error deleting subscription:", e)
        return "Error deleting subscription", 500


@payments.route('/check_user_sub_status', methods=['GET', 'POST'])
@jwt_required()
def check_user_sub_status():
    """
    Check that a user has a subscription, if not redirect to payments page.
    Returns:
        - dict: A dictionary indicating whether the user is subscribed or not.
    """
    current_user_id = get_jwt_identity()
    user = User.query.filter_by(user_id=current_user_id).first()
    if user.subscription_id != 'NULL':
        return {"subscribed": "true"}
    else:
        return {"subscribed": "false"}


@payments.route('/get_subscription_details', methods=['GET'])
@jwt_required()
def get_subscription_details():
    """
    Get the details of a user's subscription from Stripe.
    Returns:
        - dict or str: A dictionary containing the subscription details or an error message.
    """
    try:
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(user_id=current_user_id).first()
        # Check if the user has a subscription
        if user.subscription_id and user.subscription_id != 'NULL':
            # Get subscription details from Stripe
            subscription = stripe.Subscription.retrieve(user.subscription_id)
            return {"subscription": subscription}
        else:
            return {"message": "No subscription found for this user"}, 404
    except Exception as e:
        # Log the error or inform the user accordingly
        print("Error getting subscription details:", e)
        return "Error getting subscription details", 500
