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

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app)

    # Import models so Alembic detects them for migrations
    from app.modules.auth.models import User
    from app.modules.assignments.models import Assignment

    # Register Blueprints
    from .modules.auth.routes import auth_bp
    app.register_blueprint(auth_bp)

    @app.route("/health")
    def health_check():
        return {"status": "healthy"}, 200

    return app