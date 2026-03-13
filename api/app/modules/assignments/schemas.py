from marshmallow import Schema, fields


class AssignmentCreateSchema(Schema):
    asset_id = fields.Int(required=True)
    user_id = fields.Int(required=True)


class AssignmentResponseSchema(Schema):
    id = fields.Int()
    asset_id = fields.Int()
    user_id = fields.Int()
    status = fields.Str()
    assigned_at = fields.DateTime()
    returned_at = fields.DateTime()