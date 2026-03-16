from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.core.security import role_required
from .services import AssetService

assets_bp = Blueprint('assets', __name__, url_prefix='/assets')

@assets_bp.route('', methods=['GET'])
@jwt_required()
@role_required(['admin', 'it_manager'])
def list_assets():
    filters = {
        'category': request.args.get('category'),
        'status': request.args.get('status'),
        'search': request.args.get('search')
    }
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    result = AssetService.get_assets(filters, page, per_page)
    return jsonify(result), 200

@assets_bp.route('/<int:asset_id>', methods=['GET'])
@jwt_required()
@role_required(['admin', 'it_manager', 'employee'])
def get_asset(asset_id):
    from .models import Asset
    asset = Asset.query.get(asset_id)
    if not asset:
        return jsonify({"error": "Asset not found"}), 404
    return jsonify(asset.to_dict()), 200

@assets_bp.route('', methods=['POST'])
@jwt_required()
@role_required(['admin', 'it_manager'])
def create():
    data = request.get_json()
    if not data or not all(k in data for k in ('name', 'category', 'brand', 'model', 'serial_number', 'purchase_date')):
        return jsonify({"error": "Missing required fields"}), 400
    
    result, status_code = AssetService.create_asset(data)
    return jsonify(result), status_code

@assets_bp.route('/<int:asset_id>', methods=['PUT'])
@jwt_required()
@role_required(['admin', 'it_manager'])
def update(asset_id):
    data = request.get_json()
    result, status_code = AssetService.update_asset(asset_id, data)
    return jsonify(result), status_code

@assets_bp.route('/<int:asset_id>', methods=['DELETE'])
@jwt_required()
@role_required(['admin'])
def delete(asset_id):
    result, status_code = AssetService.delete_asset(asset_id)
    return jsonify(result), status_code
