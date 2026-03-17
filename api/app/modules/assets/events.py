from app.core.domain_events import register_event


def handle_asset_assigned(data):
    print(f"[EVENT] Asset {data['asset_id']} assigned to user {data['user_id']}")


def handle_asset_returned(data):
    print(f"[EVENT] Asset {data['asset_id']} returned")


def handle_issue_reported(data):
    print(f"[EVENT] Asset {data['asset_id']} under maintenance")


def handle_issue_resolved(data):
    print(f"[EVENT] Asset {data['asset_id']} issue resolved")


def register_listeners():
    register_event("asset_assigned", handle_asset_assigned)
    register_event("asset_returned", handle_asset_returned)
    register_event("issue_reported", handle_issue_reported)
    register_event("issue_resolved", handle_issue_resolved)