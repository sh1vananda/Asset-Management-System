from flask import Blueprint, request, jsonify
from marshmallow import ValidationError

from .services import create_issue, get_issues, update_issue_status
from .schemas import IssueCreateSchema, IssueStatusUpdateSchema


issue_bp = Blueprint(
    "issues",
    __name__,
    url_prefix="/issues"
)

create_schema = IssueCreateSchema()
status_schema = IssueStatusUpdateSchema()


@issue_bp.route("", methods=["POST"])
def report_issue():

    try:
        data = create_schema.load(request.json)

        issue = create_issue(
            data["asset_id"],
            data["description"],
            data["reported_by"]
        )

        return jsonify({
            "message": "Issue reported",
            "issue_id": issue.id
        }), 201

    except ValidationError as err:
        return jsonify({"error": err.messages}), 400


@issue_bp.route("", methods=["GET"])
def list_issues():

    issues = get_issues()

    return jsonify([
        {
            "id": i.id,
            "asset_id": i.asset_id,
            "description": i.description,
            "status": i.status
        }
        for i in issues
    ])


@issue_bp.route("/<int:issue_id>/status", methods=["PATCH"])
def change_issue_status(issue_id):

    try:
        data = status_schema.load(request.json)

        issue = update_issue_status(issue_id, data["status"])

        if not issue:
            return jsonify({"error": "Issue not found"}), 404

        return jsonify({"message": "Issue updated"})

    except ValidationError as err:
        return jsonify({"error": err.messages}), 400

    except ValueError as err:
        return jsonify({"error": str(err)}), 400