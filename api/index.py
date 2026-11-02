import os
import sys

# Ensure root project directory is on sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(BASE_DIR)
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from app import app

# Expose WSGI application callable for Vercel
if __name__ == "__main__":
    app.run(debug=True)
