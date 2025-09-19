"""
Database initialization for the Flask application.

This module sets up the SQLAlchemy database instance to be used by the main
application and the data models. It helps prevent circular import issues.
"""
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    """Base class for SQLAlchemy models."""
    pass

# Initialize SQLAlchemy to be used by the application and models
db = SQLAlchemy(model_class=Base)
