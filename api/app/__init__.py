from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from .core.config import Config
from .core.database import db

migrate = Migrate()
jwt = JWTManager()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize Extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app)

    # Import models to ensure they are registered with SQLAlchemy for migrations
    from .modules.auth.models import User

    # Register Blueprints
    from .modules.auth.routes import auth_bp
    app.register_blueprint(auth_bp)

    @app.route('/health')
    def health_check():
        return {'status': 'healthy'}, 200

    return app
