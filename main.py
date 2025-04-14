from app import app, db  # noqa: F401
import models  # noqa: F401

# Create database tables within app context
with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True, threaded=True)
