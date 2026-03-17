from marshmallow import Schema, fields, validate

class IssueCreateSchema(Schema):
    asset_id = fields.Int(required=True)
    description = fields.Str(required=True, validate=validate.Length(min=5))
    reported_by = fields.Int(required=True)

class IssueStatusUpdateSchema(Schema):
    status = fields.Str(required=True, validate=validate.OneOf(['open', 'In Progress', 'Resolved', 'Closed']))
