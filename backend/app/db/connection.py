import os
from contextlib import contextmanager
from typing import Iterator, Optional
from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL")

_engine: Optional[Engine] = None
_SessionLocal: Optional[sessionmaker] = None

if DATABASE_URL:
    _engine = create_engine(DATABASE_URL, pool_pre_ping=True)
    _SessionLocal = sessionmaker(bind=_engine, autoflush=False, autocommit=False)


def get_engine() -> Optional[Engine]:
    return _engine


def get_session() -> sessionmaker:
    if _SessionLocal is None:
        raise RuntimeError("DATABASE_URL not configured; cannot create DB session")
    return _SessionLocal


@contextmanager
def db_session() -> Iterator:
    """Yield a SQLAlchemy session and ensure proper close/rollback."""
    Session = get_session()
    session = Session()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
