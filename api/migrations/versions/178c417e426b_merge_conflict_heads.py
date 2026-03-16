"""merge conflict heads

Revision ID: 178c417e426b
Revises: 87e0b1f43d76, e658413aa3cb
Create Date: 2026-03-16 11:50:59.682389

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '178c417e426b'
down_revision = ('87e0b1f43d76', 'e658413aa3cb')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
