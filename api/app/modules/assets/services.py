from datetime import datetime
from sqlalchemy import or_
from app.core.database import db
from .models import Asset

class AssetService:
    @staticmethod
    def get_assets(filters=None, page=1, per_page=10):
        query = Asset.query
        
        if filters:
            if 'category' in filters and filters['category']:
                query = query.filter(Asset.category == filters['category'])
            if 'status' in filters and filters['status']:
                query = query.filter(Asset.status == filters['status'])
            if 'search' in filters and filters['search']:
                search_term = f"%{filters['search']}%"
                query = query.filter(
                    or_(
                        Asset.name.ilike(search_term),
                        Asset.serial_number.ilike(search_term),
                        Asset.brand.ilike(search_term)
                    )
                )

        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        return {
            'items': [asset.to_dict() for asset in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page
        }

    @staticmethod
    def create_asset(data):
        if Asset.query.filter_by(serial_number=data['serial_number']).first():
            return {"error": "Asset with this serial number already exists"}, 400

        try:
            asset = Asset(
                name=data['name'],
                category=data['category'],
                brand=data['brand'],
                model=data['model'],
                serial_number=data['serial_number'],
                status=data.get('status', 'Available'),
                purchase_date=datetime.strptime(data['purchase_date'], '%Y-%m-%d').date()
            )
            if 'warranty_expiry' in data and data['warranty_expiry']:
                asset.warranty_expiry = datetime.strptime(data['warranty_expiry'], '%Y-%m-%d').date()

            db.session.add(asset)
            db.session.commit()
            return asset.to_dict(), 201
            
        except ValueError as e:
            return {"error": f"Invalid date format. Use YYYY-MM-DD. Details: {str(e)}"}, 400

    @staticmethod
    def update_asset(asset_id, data):
        asset = Asset.query.get(asset_id)
        if not asset:
            return {"error": "Asset not found"}, 404

        try:
            if 'name' in data: asset.name = data['name']
            if 'category' in data: asset.category = data['category']
            if 'brand' in data: asset.brand = data['brand']
            if 'model' in data: asset.model = data['model']
            if 'status' in data: asset.status = data['status']
            if 'serial_number' in data:
                existing = Asset.query.filter_by(serial_number=data['serial_number']).first()
                if existing and existing.id != asset_id:
                     return {"error": "Serial number already in use by another asset"}, 400
                asset.serial_number = data['serial_number']
            
            if 'purchase_date' in data and data['purchase_date']:
                 asset.purchase_date = datetime.strptime(data['purchase_date'], '%Y-%m-%d').date()
            if 'warranty_expiry' in data:
                 asset.warranty_expiry = datetime.strptime(data['warranty_expiry'], '%Y-%m-%d').date() if data['warranty_expiry'] else None

            db.session.commit()
            return asset.to_dict(), 200
            
        except ValueError as e:
             return {"error": f"Invalid date format. Use YYYY-MM-DD. Details: {str(e)}"}, 400

    @staticmethod
    def delete_asset(asset_id):
        asset = Asset.query.get(asset_id)
        if not asset:
            return {"error": "Asset not found"}, 404
            
        db.session.delete(asset)
        db.session.commit()
        return {"message": "Asset deleted successfully"}, 200
