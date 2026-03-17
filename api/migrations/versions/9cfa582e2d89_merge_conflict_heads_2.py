"""merge conflict heads 2

Revision ID: 9cfa582e2d89
Revises: 2ec152c65534, d4378c0b1436
Create Date: 2026-03-17 10:51:10.462696

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '9cfa582e2d89'
down_revision = ('2ec152c65534', 'd4378c0b1436')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
