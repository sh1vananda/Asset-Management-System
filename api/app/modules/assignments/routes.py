from flask import Blueprint, request, jsonify
from .services import assign_asset, return_asset, get_user_assignments
from .schemas import AssignmentCreateSchema
from marshmallow import ValidationError

assignment_bp = Blueprint(
    "assignments",
    __name__,
    url_prefix="/assignments"
)

schema = AssignmentCreateSchema()


@assignment_bp.route("", methods=["POST"])
def create_assignment():

    try:
        data = schema.load(request.json)

        assignment = assign_asset(
            data["asset_id"],
            data["user_id"]
        )

        return jsonify({
            "message": "Asset assigned",
            "assignment_id": assignment.id
        }), 201

    except ValidationError as err:
        return jsonify({"error": err.messages}), 400

    except ValueError as err:
        return jsonify({"error": str(err)}), 400

@assignment_bp.route("/return/<int:assignment_id>", methods=["POST"])
def return_assignment_route(assignment_id):
    from .models import Assignment

    assignment = Assignment.query.get(assignment_id)

    if not assignment:
        return jsonify({"error": "Assignment not found"}), 404

    if assignment.status == "returned":
        return jsonify({"error": "Asset already returned"}), 400

    return_asset(assignment_id)

    return jsonify({"message": "Asset returned"})


@assignment_bp.route("/user/<int:user_id>", methods=["GET"])
def get_assignments(user_id):

    assignments = get_user_assignments(user_id)

    return jsonify([
        {
            "id": a.id,
            "asset_id": a.asset_id,
            "user_id": a.user_id,
            "status": a.status
        }
        for a in assignments
    ])