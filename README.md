# File Struct(Anish) - Anish Souharda Cooperative Bank

A finalized banking web application built with **Python Flask**, **Supabase** (PostgreSQL Database & Cloud Storage), **HTML5**, **CSS3**, and **JavaScript**, configured for zero-friction deployment to **Vercel**.

---

## 📁 Project Structure (Vercel Ready)

```text
File Struct(Anish)/
├── api/
│   └── index.py            # Vercel Serverless Function entry point
├── static/
│   ├── css/                # Stylesheets (stylesheet4.css, admin.css, etc.)
│   ├── images/             # Static images & icons
│   └── js/                 # Client-side scripts (script.js, admin.js)
├── templates/              # HTML templates (22 Jinja2 templates)
│   ├── index4.html         # Main Landing Page (Home)
│   ├── admin_login.html    # Admin Login
│   ├── admin_dashboard.html# Admin Management Workspace
│   ├── board_directors.html# Board of Directors
│   ├── gallery.html        # Bank Gallery
│   ├── notifications.html  # Notice Board
│   └── ...                 # Loan and Service detail pages
├── app.py                  # Core Flask application and Supabase integration
├── pyproject.toml          # Vercel Backend Framework configuration & dependencies
├── requirements.txt        # Python package dependencies
├── vercel.json             # Vercel deployment configuration
├── package.json            # Project manifest
├── .python-version         # Runtime version specification (Python 3.12)
├── .env.example            # Environment variables reference
└── .gitignore              # Git and build artifact exclusions
```

---

## 🚀 Deploying to Vercel

### Option 1: Deploy via Vercel Dashboard (Git)

1. Push this project to your GitHub repository.
2. Go to [Vercel](https://vercel.com/) and click **Add New** > **Project**.
3. Import your repository.
4. If your project files are inside the `File Struct(Anish)` folder in your repo, ensure Vercel's **Root Directory** setting is set to `File Struct(Anish)`.
5. Vercel automatically detects the Python Flask framework from `pyproject.toml` and `requirements.txt`.
6. *(Optional)* Under **Environment Variables**, you can configure:
   - `SECRET_KEY`
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   *(All variables have secure default fallbacks built into the project).*
7. Click **Deploy**.

---

### Option 2: Deploy via Vercel CLI

```bash
# 1. Install Vercel CLI (if not already installed)
npm i -g vercel

# 2. Deploy from the project root
vercel

# 3. Deploy to production
vercel --prod
```

---

## 💻 Local Development

To run the application locally on your machine:

```bash
# 1. (Optional) Create and activate a virtual environment
python -m venv venv
venv\Scripts\activate   # On Windows
# source venv/bin/activate  # On macOS/Linux

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run the Flask application
python app.py
```

The application will be live at `http://127.0.0.1:5000/`.

---

## 🔐 Admin Credentials

- **Username**: `Anish`
- **Password**: `Anish@123`
- **Login URL**: `/admin_login`
