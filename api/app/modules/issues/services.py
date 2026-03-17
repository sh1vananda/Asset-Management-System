from datetime import datetime
from app.core.database import db
from .models import Issue
from app.core.domain_events import dispatch_event

VALID_STATUSES = ["open", "in_progress", "resolved", "closed"]


def create_issue(asset_id, description, reported_by):

    issue = Issue(
        asset_id=asset_id,
        description=description,
        reported_by=reported_by,
        status="open"
    )

    db.session.add(issue)
    db.session.commit()

    dispatch_event("issue_reported", {
    "asset_id": asset_id
})

    return issue


def get_issues():
    return Issue.query.all()


def update_issue_status(issue_id, status):

    issue = Issue.query.get(issue_id)

    if not issue:
        return None

    if status not in VALID_STATUSES:
        raise ValueError("Invalid status")

    if issue.status == "resolved":
        raise ValueError("Issue already resolved")

    issue.status = status

    if status == "resolved":
        issue.resolved_at = datetime.utcnow()

    db.session.commit()

    if status == "resolved":
        dispatch_event("issue_resolved", {
        "asset_id": issue.asset_id
    })

    return issue