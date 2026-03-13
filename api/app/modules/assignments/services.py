from datetime import datetime
from app.core.database import db
from .models import Assignment


def assign_asset(asset_id, user_id):

    existing = Assignment.query.filter_by(
        asset_id=asset_id,
        status="assigned"
    ).first()

    if existing:
        raise ValueError("Asset already assigned")

    assignment = Assignment(
        asset_id=asset_id,
        user_id=user_id,
        status="assigned"
    )

    db.session.add(assignment)
    db.session.commit()

    return assignment

def return_asset(assignment_id):

    assignment = Assignment.query.get(assignment_id)

    if not assignment:
        return None

    assignment.status = "returned"
    assignment.returned_at = datetime.utcnow()

    db.session.commit()

    return assignment


def get_user_assignments(user_id):

    return Assignment.query.filter_by(user_id=user_id).all()