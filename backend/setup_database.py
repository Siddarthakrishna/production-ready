#!/usr/bin/env python3
"""
Database setup script for the unified Sharada Research application.
This script initializes the database tables and sets up the initial data.
"""

import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add the app directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.db.connection import get_db_url
from app.db.models import Base

def setup_database():
    """Set up the database with all required tables."""
    try:
        # Get database URL
        database_url = get_db_url()
        print(f"Setting up database at: {database_url}")
        
        # Create engine
        engine = create_engine(database_url, echo=True)
        
        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("Database tables created successfully!")
        
        # Create a session
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        
        # Add any initial data here if needed
        # For example:
        # initial_user = User(email="admin@example.com", hashed_password="hashed_password")
        # db.add(initial_user)
        # db.commit()
        
        db.close()
        print("Database setup completed successfully!")
        
    except Exception as e:
        print(f"Error setting up database: {e}")
        sys.exit(1)

if __name__ == "__main__":
    setup_database()