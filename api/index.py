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
from werkzeug.middleware.proxy_fix import ProxyFix

# Tells Flask to trust X-Forwarded-* headers from Vercel edge proxy
app.wsgi_app = ProxyFix(
    app.wsgi_app,
    x_for=1,
    x_proto=1,
    x_host=1,
    x_prefix=1,
)


class VercelPathMiddleware:
    """
    WSGI Middleware to normalize PATH_INFO for Vercel Serverless Functions.
    Vercel rewrites incoming traffic from /(.*) to /api/index.
    This middleware extracts the client's actual requested path from Vercel's proxy headers
    (X-Matched-Path or X-Forwarded-Uri) or normalizes /api/index -> /
    """
    def __init__(self, wsgi_app):
        self.wsgi_app = wsgi_app

    def __call__(self, environ, start_response):
        path_info = environ.get("PATH_INFO", "")

        # Check Vercel edge routing headers for original request path
        raw_uri = (
            environ.get("HTTP_X_FORWARDED_URI")
            or environ.get("HTTP_X_MATCHED_PATH")
            or environ.get("HTTP_X_VERCEL_PATH")
        )

        if raw_uri and not raw_uri.startswith("/api/index"):
            clean_path = raw_uri.split("?")[0]
            environ["PATH_INFO"] = clean_path
        elif path_info in ["/api/index", "/api/index.py", "/api", "/api/"]:
            environ["PATH_INFO"] = "/"
        elif path_info.startswith("/api/index/"):
            environ["PATH_INFO"] = path_info[len("/api/index"):]

        return self.wsgi_app(environ, start_response)


# Apply Vercel path normalization
app.wsgi_app = VercelPathMiddleware(app.wsgi_app)

# Expose WSGI application callable for Vercel
# Do not call app.run() in production serverless execution
if __name__ == "__main__":
    app.run(debug=True)
