"""
Contains routes for the manager to view user data and revenue projections.
"""
from datetime import datetime, timedelta
from decimal import Decimal
from collections import defaultdict
from flask import request, Blueprint, jsonify
from flask_jwt_extended import jwt_required
from .models import User, SubscriptionPlan

owner = Blueprint('owner', __name__)

def get_current_date():
    """
    Returns the current date.
    Returns:
    - datetime.date: The current date.
    """
    return datetime.now().date()

def fetch_subscriptions():
    """
    Fetches user active subscription information from the database.
    Returns:
    - list of dict: User subscription information.
    """
    # Get user data for customers only
    users = User.query.filter_by(role='customer').all()
    # Compile the results into a list of dictionaries, considering the specified structure
    results = [
        {
            "user_id": user.user_id,
            "plan": user.plan_id,
            "subscription_date": user.subscription_date,
            "price": SubscriptionPlan.query.filter_by(plan_id=user.plan_id).first().price if user.plan_id != 0 else 0.00
        }
        for user in users
    ]
    return results


def calculate_user_revenue(user, week):
    """
    Calculates the revenue for a user at the end of a given week.
    Parameters:
    - user (dict): The user's subscription information.
    - week (int): The week number.
    Returns:
    - float: The revenue for the user at the end of the week.
    """
    if user['plan'] == 1:
        return user['price']
    if user['plan'] == 2:
        # Get the day of the month when the user subscribed
        start_date = user['subscription_date']
        day_of_month = start_date.day

        # Get the current date that is `week` weeks ahead of the subscription date
        current_date = datetime.now() + timedelta(weeks=week - 1)
        next_date = current_date + timedelta(weeks=1)

        # Check if the current date is within a week of the subscription date day
        if (current_date.day <= day_of_month < next_date.day or
                (current_date.month != next_date.month and
                 (current_date.day <= day_of_month or day_of_month < next_date.day))):
            return user['price']
        
    if user['plan'] == 3:
        # Change the year of the subscription date to the current year
        current_date = datetime.now() + timedelta(weeks=week - 1)
        start_date = user['subscription_date'].replace(year=current_date.year)
        if start_date <= current_date < (start_date + timedelta(weeks=1)):
            return float(user['price'])
    return 0.0


def weeks_until_next_payment(start_date, plan):
    """
    Calculates the number of weeks until the next payment for a user.
    Parameters:
    - start_date (str): The start date of the subscription.
    - plan (str): The subscription plan (monthly, quarterly, annual).
    Returns:
    - int: The number of weeks until the next payment.
    """
    start_date = datetime.strptime(start_date, "%Y-%m-%d").date()
    current_date = get_current_date()

    payment_interval = {
        "weekly": 1,
        "monthly": 4,
        "annually": 52
    }
    # Calculate the total number of weeks from the start date to the current date
    total_weeks = (current_date - start_date).days // 7
    # Calculate the number of weeks until the next payment
    weeks_until_payment = payment_interval[plan] - (total_weeks % payment_interval[plan])
    # Calculate the date of the next payment
    next_payment_date = current_date + timedelta(weeks=weeks_until_payment)

    return next_payment_date


def total_revenue():
    """
    Calculate the total revenue separated into weeks and accumulate weekly revenue into monthly revenue, 
    with each month's revenue including the total of all previous months.
    Returns:
    - tuple: Contains dictionaries for total revenue by week, total revenue per user, weeks ahead, and cumulative monthly revenue.
    """
    users = fetch_subscriptions()
    weeks_ahead = request.args.get('weeks_ahead', default=1, type=int)
    weeks_ahead = max(1, min(weeks_ahead, 52))
    
    # Initialize the total revenue by week and user totals
    total_revenue_by_week = {week: Decimal('0.0') for week in range(1, weeks_ahead + 1)}
    user_totals = {}
    
    # Calculate the revenue for each user and accumulate the total revenue by week
    for user in users:
        user_total_revenue = Decimal('0.0')
        for week in range(1, weeks_ahead + 1):
            user_weekly_revenue = Decimal(str(calculate_user_revenue(user, week)))
            user_total_revenue += user_weekly_revenue
            total_revenue_by_week[week] += user_total_revenue
        user_totals[user['user_id']] = user_total_revenue

    # Accumulate the weekly revenue into monthly revenue
    monthly_accumulated_revenue = defaultdict(Decimal)
    cumulative_revenue = Decimal('0.0')
    start_date = get_current_date()
    for week, revenue in sorted(total_revenue_by_week.items()):
        week_date = start_date + timedelta(weeks=week - 1)
        month_key = week_date.strftime('%Y-%m')
        monthly_accumulated_revenue[month_key] = revenue
    return total_revenue_by_week, user_totals, weeks_ahead, dict(monthly_accumulated_revenue)

@owner.route('/projections', methods=['GET'])
@jwt_required()
def projections():
    """
    A page that allows the manager to display future revenue data at a weekly level for up to 1 year ahead.
    Returns:
    - tuple: A tuple where the first element is a JSON object containing the revenue projections,
    and the second element is the HTTP status code.
    """
    total_revenue_by_week, future_revenue_per_user, weeks_ahead, monthly_revenue = total_revenue()
    # Calculate the revenue projections and format as a JSON object
    response_data = {
        "Weeks Ahead": weeks_ahead,
        "User Revenue Projections": [
            {
                "User": User.query.filter_by(user_id=user_id).first().username,
                "Expected Revenue": float(f"{float(revenue):.2f}")
            }
            for user_id, revenue in future_revenue_per_user.items()
        ],
        "Weekly Revenue Projections": [
            {
                "Week": week,
                "Accumulated Revenue": round(revenue, 2),
                "Expected Revenue": float(f"{float(revenue):.2f}")
            }
            for week, revenue in total_revenue_by_week.items()
        ],
        "Monthly Revenue Projections": [
            {
                "Month": month, 
                "Accumulated Revenue": round(revenue, 2)
            }
            for month, revenue in monthly_revenue.items()
        ]
    }
    return jsonify(response_data), 200


@owner.route('/users_data', methods=['GET'])
@jwt_required()
def list_users():
    """
    A page that allows the manager to view user data.
    Returns:
    - tuple: A tuple where the first element is a JSON object containing the user data,
    and the second element is the HTTP status code.
    """
    users = User.query.filter_by(role='customer').all()
    users_list = []
    # Query database for user subscription details
    for user in users:
        plan = SubscriptionPlan.query.filter_by(plan_id=user.plan_id).first()
    # If user has no subscription, set plan type and next payment date to "Not subscribed"
        if plan is None or user.plan_id is None:
            plan_type = "Not subscribed"
            next_payment_date = "Not subscribed"
    # If user has a subscription, calculate the next payment date
        else:
            plan_type = plan.plan_type 
            next_payment_date = weeks_until_next_payment(user.created_at.strftime('%Y-%m-%d'), plan_type)
            next_payment_date = next_payment_date.strftime('%Y-%m-%d')
        start_date = user.created_at.strftime('%Y-%m-%d')
    # Append user data to the list
        users_list.append({
            'user_id': user.user_id,
            'username': user.username,
            'plan_type': plan_type,
            'email': user.email,
            'next_payment_date': next_payment_date,
            'account_creation_date': start_date
        })
    return jsonify(users_list), 200

