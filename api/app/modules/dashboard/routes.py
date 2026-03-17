from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from app.core.security import role_required
from .services import DashboardService

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/dashboard')

@dashboard_bp.route('/stats', methods=['GET'])
@jwt_required()
@role_required(['admin', 'it_manager'])
def get_stats():
    """
    Retrieve Dashboard and Analytics Statistics.
    Requires Admin or IT Manager permissions.
    """
    result, status_code = DashboardService.get_dashboard_stats()
    return jsonify(result), status_code
