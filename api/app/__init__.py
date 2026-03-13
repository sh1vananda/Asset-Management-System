from flask import Flask
from flask_cors import CORS
from .core.config import Config
from .core.database import db

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize Extensions
    db.init_app(app)
    CORS(app)

    # Register Blueprints
    @app.route('/health')
    def health_check():
        return {'status': 'healthy'}, 200

    return app
