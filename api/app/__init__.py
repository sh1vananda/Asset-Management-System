from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager

from app.core.database import db
from app.core.config import Config


load_dotenv()

migrate = Migrate()
jwt = JWTManager()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app)

    from app.modules.auth.models import User
    from app.modules.assignments.models import Assignment
    from app.modules.assets.models import Asset
    from app.modules.issues.models import Issue
    from app.modules.issues.models import Issue

    from app.modules.assets.events import register_listeners
    register_listeners()

    from app.modules.issues.routes import issue_bp
    app.register_blueprint(issue_bp)

    from app.modules.assignments.routes import assignment_bp
    app.register_blueprint(assignment_bp)

    from .modules.auth.routes import auth_bp
    from .modules.assets.routes import assets_bp
    from .modules.dashboard.routes import dashboard_bp
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(assets_bp)
    app.register_blueprint(dashboard_bp)

    return app