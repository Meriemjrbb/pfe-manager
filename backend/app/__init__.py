import importlib
import pkgutil

from flask import Flask
from flask_cors import CORS

from .config import Config
from .extensions import db


def _load(pkg):
    p = importlib.import_module(pkg)
    return [importlib.import_module(f"{pkg}.{m.name}") for m in pkgutil.iter_modules(p.__path__)]


def create_app(config=None):
    app = Flask(__name__)
    app.config.from_object(Config)
    if config:
        app.config.update(config)
    app.url_map.strict_slashes = False
    CORS(app)
    db.init_app(app)
    _load("app.models")
    for mod in _load("app.routes"):
        app.register_blueprint(mod.bp)
    with app.app_context():
        db.create_all()

    @app.get("/api/health")
    def health():
        return {"status": "ok"}

    return app
