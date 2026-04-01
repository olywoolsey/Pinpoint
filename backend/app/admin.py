"""
Sets up Flask-Admin for the app
"""
from flask_admin import Admin

# Template modes available: 'bootstrap2', 'bootstrap3', 'bootstrap4'
admin = Admin(name='Dashboard', template_mode='bootstrap2')

def setup_admin(app, db):
    """
    Sets up Flask-Admin for the app.
    Parameters:
        app: The Flask application instance.
        db: The SQLAlchemy database instance.
    """
    if app.config.get('FLASK_ADMIN_ENABLED', False):
        from .models import User, SubscriptionPlan, GPSRoute, Friendship

        # Add model views
        from flask_admin.contrib.sqla import ModelView
        admin.add_view(ModelView(User, db.session))
        admin.add_view(ModelView(SubscriptionPlan, db.session))
        admin.add_view(ModelView(GPSRoute, db.session))
        admin.add_view(ModelView(Friendship, db.session))

        # Added here to avoid circular import
        admin.init_app(app)
