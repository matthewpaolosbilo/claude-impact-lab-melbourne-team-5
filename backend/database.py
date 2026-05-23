import os

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./community.db")

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def init_db() -> None:
    import models  # noqa: F401  ensure tables are registered before create_all

    Base.metadata.create_all(bind=engine)
    _apply_lightweight_migrations()


def _apply_lightweight_migrations() -> None:
    """Idempotent ALTERs for columns added after the first deploy. SQLite friendly.

    `Base.metadata.create_all` is additive at the table level but does not add new
    columns to existing tables, so we patch them in by hand. Each ALTER is wrapped
    so re-running on an already-migrated DB is a no-op.
    """
    inspector = inspect(engine)
    if "users" not in inspector.get_table_names():
        return
    user_columns = {col["name"] for col in inspector.get_columns("users")}
    if "preferences" not in user_columns:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE users ADD COLUMN preferences JSON"))


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
