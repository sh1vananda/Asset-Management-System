from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from flask_migrate import Migrate

from app.core.database import db
from app.core.config import Config

load_dotenv()

migrate = Migrate()


def create_app(config_class=Config):

    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app)

    # Import models so Alembic detects them
    from app.modules.assignments.models import Assignment

    # Health check endpoint
    @app.route("/health")
    def health_check():
        return {"status": "healthy"}, 200

    return app