from sqlalchemy import func
from app.core.database import db
from app.modules.assets.models import Asset
from app.modules.issues.models import Issue

class DashboardService:
    @staticmethod
    def get_dashboard_stats():
        if not db.engine:
             return {"error": "Database not initialized"}, 500

        try:
             total_assets = Asset.query.count() # total assets

             status_aggregations = db.session.query( # by status
                 Asset.status, 
                 func.count(Asset.id)
             ).group_by(Asset.status).all()

             stats_by_status = {status: count for status, count in status_aggregations}

             open_issues_count = Issue.query.filter( # open issues
                 Issue.status.in_(['open', 'In Progress', 'Open'])
             ).count()

             return {
                 "total_assets": total_assets,
                 "assets_by_status": {
                     "available": stats_by_status.get('Available', 0),
                     "assigned": stats_by_status.get('Assigned', 0),
                     "under_maintenance": stats_by_status.get('Under Maintenance', 0),
                     "retired": stats_by_status.get('Retired', 0)
                 },
                 "open_issues": open_issues_count
             }, 200
             
        except Exception as e:
             return {"error": f"Failed to calculate stats: {str(e)}"}, 500
