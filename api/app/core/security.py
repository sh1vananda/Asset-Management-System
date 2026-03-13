from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt

def role_required(allowed_roles):
    """
    Decorator to restrict access to specific roles.
    """
    def decorator(f):
         @wraps(f)
         def decorated_function(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            user_role = claims.get("role")
            
            if user_role not in allowed_roles:
                return jsonify({"msg": "Forbidden: insufficient permissions"}), 403
            
            return f(*args, **kwargs)
         return decorated_function
    return decorator
