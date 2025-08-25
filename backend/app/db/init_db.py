import os
from pathlib import Path
from sqlalchemy import text

from app.db.connection import get_engine
from app.db.models import Base


def create_tables_and_indexes() -> None:
    engine = get_engine()
    if engine is None:
        raise RuntimeError(
            "DATABASE_URL is not configured. Set it in your environment or .env before running init_db."
        )

    # 1) Create all tables from ORM models
    print("[init_db] Creating tables from ORM models...")
    Base.metadata.create_all(bind=engine)

    # 2) Apply additional indexes/constraints from SQL file (idempotent)
    ddl_path = Path(__file__).with_name("ddl_unique_indexes.sql")
    if ddl_path.exists():
        print(f"[init_db] Applying DDL from {ddl_path} ...")
        sql_text = ddl_path.read_text(encoding="utf-8")
        with engine.begin() as conn:
            # Split on semicolons while preserving simple structure
            # Execute only non-empty statements
            for stmt in [s.strip() for s in sql_text.split(";") if s.strip()]:
                conn.execute(text(stmt))
        print("[init_db] DDL applied.")
    else:
        print(f"[init_db] No DDL file found at {ddl_path}, skipping index creation.")

    print("[init_db] Done.")


if __name__ == "__main__":
    create_tables_and_indexes()
