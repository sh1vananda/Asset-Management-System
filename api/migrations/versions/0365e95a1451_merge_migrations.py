"""merge migrations

Revision ID: 0365e95a1451
Revises: 87e0b1f43d76, e658413aa3cb
Create Date: 2026-03-16 11:10:16.748087

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0365e95a1451'
down_revision = ('87e0b1f43d76', 'e658413aa3cb')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
