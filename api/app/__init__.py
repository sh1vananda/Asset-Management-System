from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager

from app.core.database import db
from app.core.config import Config
from app.modules.assignments.routes import assignment_bp

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

    app.register_blueprint(assignment_bp)

    from app.modules.auth.models import User
    from app.modules.assignments.models import Assignment
    from app.modules.assets.models import Asset

    from .modules.auth.routes import auth_bp
    from .modules.assets.routes import assets_bp
    app.register_blueprint(auth_bp)
    app.register_blueprint(assets_bp)

    return app