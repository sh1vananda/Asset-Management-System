from datetime import timedelta
from flask_jwt_extended import create_access_token
from app.core.database import db
from .models import User

class AuthService:
    @staticmethod
    def register_user(data):
        if User.query.filter_by(username=data['username']).first():
            return {"error": "Username already exists"}, 400
        
        if User.query.filter_by(email=data['email']).first():
            return {"error": "Email already exists"}, 400

        user = User(
            username=data['username'],
            email=data['email'],
            role=data.get('role', 'employee')
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        return user.to_dict(), 201

    @staticmethod
    def authenticate_user(username, password):
        user = User.query.filter_by(username=username).first()
        
        if user and user.check_password(password):
            # Include the role in the JWT claims
            additional_claims = {"role": user.role}
            access_token = create_access_token(
                identity=str(user.id), 
                additional_claims=additional_claims,
                expires_delta=timedelta(minutes=15)
            )
            return {
                "access_token": access_token,
                "user": user.to_dict()
            }, 200
            
        return {"error": "Invalid credentials"}, 401
    
    @staticmethod
    def get_all_employees():
        users = User.query.filter_by(role="employee").all()
        return [user.to_dict() for user in users]
