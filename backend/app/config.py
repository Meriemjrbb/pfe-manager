import os


class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///pfe.db")
    AI_SERVICE_URL = os.getenv("AI_SERVICE_URL", "http://localhost:5001")
