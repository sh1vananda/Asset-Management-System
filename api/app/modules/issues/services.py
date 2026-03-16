from datetime import datetime
from app.core.database import db
from .models import Issue


def create_issue(asset_id, description, reported_by):

    issue = Issue(
        asset_id=asset_id,
        description=description,
        reported_by=reported_by,
        status="open"
    )

    db.session.add(issue)
    db.session.commit()

    return issue


def get_issues():

    return Issue.query.all()


def update_issue_status(issue_id, status):

    issue = Issue.query.get(issue_id)

    if not issue:
        return None

    issue.status = status

    if status == "resolved":
        issue.resolved_at = datetime.utcnow()

    db.session.commit()

    return issue