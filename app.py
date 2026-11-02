from flask import Flask, request, jsonify, render_template,session, redirect, url_for
from supabase import create_client
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
import os
import uuid
from datetime import datetime, timezone, timedelta
from zoneinfo import ZoneInfo

load_dotenv()

# =====================================
# APPLICATION SETTINGS & PATH RESOLUTION
# =====================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

template_candidates = [
    os.path.join(BASE_DIR, "templates"),
    os.path.join(os.path.dirname(BASE_DIR), "templates"),
    os.path.join(os.getcwd(), "templates"),
]
template_dir = next((p for p in template_candidates if os.path.isdir(p)), os.path.join(BASE_DIR, "templates"))

static_candidates = [
    os.path.join(BASE_DIR, "static"),
    os.path.join(os.path.dirname(BASE_DIR), "static"),
    os.path.join(os.getcwd(), "static"),
]
static_dir = next((p for p in static_candidates if os.path.isdir(p)), os.path.join(BASE_DIR, "static"))

app = Flask(
    __name__,
    template_folder=template_dir,
    static_folder=static_dir
)

app.secret_key = os.getenv("SECRET_KEY", "anish_bank_secret_2026")

# Admin login credentials
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "Anish")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "Anish@123")


# =====================================
# SUPABASE CONNECTION
# =====================================

SUPABASE_URL = (
    os.getenv("SUPABASE_URL")
    or os.getenv("https://lctkbtpkluydmsxtrraw.supabase.co")
    or "https://lctkbtpkluydmsxtrraw.supabase.co"
)
SUPABASE_KEY = (
    os.getenv("SUPABASE_KEY")
    or os.getenv("sb_secret_-XdTnxf0NIxitmr6I73ksQ_BEK6dl6u")
    or "sb_secret_-XdTnxf0NIxitmr6I73ksQ_BEK6dl6u"
)
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

@app.route("/test-supabase")
def test_supabase():

    response = (
        supabase.table("gallery_images")
        .select("id")
        .limit(1)
        .execute()
    )

    return "Supabase connection successful!"



@app.route("/test-storage")
def test_storage():
    try:
        buckets = supabase.storage.list_buckets()

        bucket_names = [bucket.name for bucket in buckets]

        return jsonify({
            "success": True,
            "buckets": bucket_names,
            "board_bucket_exists": "board-directors" in bucket_names
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        })









# gallery
GALLERY_BUCKET = "gallery-images"
MAX_IMAGE_SIZE = 2 * 1024 * 1024
ALLOWED_EXTENSIONS = ["jpg", "jpeg"]





# HOME PAGE


@app.route("/")
@app.route("/index")
@app.route("/index.html")
@app.route("/index4.html")
@app.route("/api")
@app.route("/api/")
@app.route("/api/index")
@app.route("/api/index.py")
def home():
    return render_template("index4.html")

# =====================================
# BOARD OF DIRECTORS
# =====================================

# =====================================
# BOARD OF DIRECTORS SETTINGS
# =====================================

DIRECTOR_BUCKET = "board-directors"
MAX_DIRECTOR_IMAGE_SIZE = 2 * 1024 * 1024

ALLOWED_DIRECTOR_EXTENSIONS = ["jpg", "jpeg", "png", "webp"]


# =====================================
# CHECK DIRECTOR IMAGE FORMAT
# =====================================

def valid_director_image(filename, image_data):

    if "." not in filename:
        return False

    extension = filename.rsplit(".", 1)[1].lower()

    if extension not in ALLOWED_DIRECTOR_EXTENSIONS:
        return False

    if extension in ["jpg", "jpeg"]:
        return image_data.startswith(b"\xff\xd8\xff")

    if extension == "png":
        return image_data.startswith(b"\x89PNG\r\n\x1a\n")

    if extension == "webp":
        return (
            len(image_data) >= 12
            and image_data[:4] == b"RIFF"
            and image_data[8:12] == b"WEBP"
        )

    return False


# =====================================
# ADMIN: LOAD ALL 13 DIRECTOR SLOTS
# =====================================

@app.route("/admin/api/directors", methods=["GET"])
def get_admin_directors():

    if "admin_username" not in session:
        return jsonify({
            "success": False,
            "message": "Please login first."
        }), 401

    result = (
        supabase.table("board_directors")
        .select("*")
        .order("serial_number")
        .execute()
    )

    return jsonify({
        "success": True,
        "directors": result.data
    })


# =====================================
# ADMIN: ADD OR UPDATE DIRECTOR
# =====================================

@app.route(
    "/admin/api/directors/<int:serial_number>",
    methods=["POST"]
)
def save_director(serial_number):

    if "admin_username" not in session:
        return jsonify({
            "success": False,
            "message": "Please login first."
        }), 401

    if serial_number < 1 or serial_number > 13:
        return jsonify({
            "success": False,
            "message": "Invalid director slot."
        }), 400

    full_name = request.form.get("full_name", "").strip()
    designation = request.form.get("designation", "").strip()
    phone = request.form.get("phone", "").strip()

    if not full_name or not designation:
        return jsonify({
            "success": False,
            "message": "Name and designation are required."
        }), 400

    if phone and (
        not phone.isdigit() or len(phone) < 10 or len(phone) > 15
    ):
        return jsonify({
            "success": False,
            "message": "Enter a valid phone number."
        }), 400

    # Find the selected director slot
    existing = (
        supabase.table("board_directors")
        .select("*")
        .eq("serial_number", serial_number)
        .execute()
    )

    if not existing.data:
        return jsonify({
            "success": False,
            "message": "Director slot not found."
        }), 404

    old_record = existing.data[0]

    # Keep the existing photo if no new photo is selected
    image_path = old_record.get("image_path")
    image_url = old_record.get("image_url")

    image = request.files.get("image")
    new_image_uploaded = False

    # Upload new photo if selected
    if image and image.filename:

        original_name = secure_filename(image.filename)

        image_data = image.read(MAX_DIRECTOR_IMAGE_SIZE + 1)

        if len(image_data) == 0:
            return jsonify({
                "success": False,
                "message": "Selected image is empty."
            }), 400

        if len(image_data) > MAX_DIRECTOR_IMAGE_SIZE:
            return jsonify({
                "success": False,
                "message": "Image size must not exceed 2 MB."
            }), 400

        if not valid_director_image(original_name, image_data):
            return jsonify({
                "success": False,
                "message": "Only valid JPG, JPEG, PNG and WEBP images are allowed."
            }), 400

        extension = original_name.rsplit(".", 1)[1].lower()

        content_types = {
            "jpg": "image/jpeg",
            "jpeg": "image/jpeg",
            "png": "image/png",
            "webp": "image/webp"
        }

        new_filename = str(uuid.uuid4()) + "." + extension

        new_image_path = (
            "director_" + str(serial_number) + "/" + new_filename
        )

        supabase.storage.from_(DIRECTOR_BUCKET).upload(
            new_image_path,
            image_data,
            file_options={
                "content-type": content_types[extension]
            }
        )

        image_path = new_image_path

        image_url = supabase.storage.from_(
            DIRECTOR_BUCKET
        ).get_public_url(new_image_path)

        new_image_uploaded = True

    # Update director information
    director_data = {
        "full_name": full_name,
        "designation": designation,
        "phone": phone or None,
        "image_path": image_path,
        "image_url": image_url,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }

    result = (
        supabase.table("board_directors")
        .update(director_data)
        .eq("serial_number", serial_number)
        .execute()
    )

    # Delete old photo after successful database update
    if new_image_uploaded and old_record.get("image_path"):
        supabase.storage.from_(DIRECTOR_BUCKET).remove(
            [old_record["image_path"]]
        )

    return jsonify({
        "success": True,
        "message": "Director profile saved successfully.",
        "director": result.data[0] if result.data else None
    })


# =====================================
# ADMIN: DELETE DIRECTOR DETAILS
# =====================================

@app.route(
    "/admin/api/directors/<int:serial_number>",
    methods=["DELETE"]
)
def clear_director(serial_number):

    if "admin_username" not in session:
        return jsonify({
            "success": False,
            "message": "Please login first."
        }), 401

    if serial_number < 1 or serial_number > 13:
        return jsonify({
            "success": False,
            "message": "Invalid director slot."
        }), 400

    existing = (
        supabase.table("board_directors")
        .select("*")
        .eq("serial_number", serial_number)
        .execute()
    )

    if not existing.data:
        return jsonify({
            "success": False,
            "message": "Director slot not found."
        }), 404

    old_record = existing.data[0]

    # Clear details but retain the director slot
    result = (
        supabase.table("board_directors")
        .update({
            "full_name": None,
            "designation": None,
            "phone": None,
            "image_path": None,
            "image_url": None,
            "updated_at": datetime.now(timezone.utc).isoformat()
        })
        .eq("serial_number", serial_number)
        .execute()
    )

    # Delete the old profile photo
    if old_record.get("image_path"):
        supabase.storage.from_(DIRECTOR_BUCKET).remove(
            [old_record["image_path"]]
        )

    return jsonify({
        "success": True,
        "message": "Director details deleted successfully."
    })


# =====================================
# PUBLIC: DISPLAY BOARD OF DIRECTORS
# =====================================

@app.route("/board_directors.html")
@app.route("/board_directors")
def board_directors():

    try:
        result = (
            supabase.table("board_directors")
            .select("*")
            .order("serial_number")
            .execute()
        )
        directors = result.data or []
    except Exception as e:
        app.logger.warning(f"Board directors query: {e}")
        directors = []

    return render_template(
        "board_directors.html",
        directors=directors
    )


# =====================================
# ABOUT US
# =====================================

@app.route("/about.html")
@app.route("/about")
def about():
    try:
        return render_template("aboutus.html")
    except Exception:
        return redirect(url_for("home") + "#about")


# =====================================
# GALLERY
# =====================================

@app.route("/gallery.html")
@app.route("/gallery")
def gallery():
    return render_template("gallery.html")


# =====================================
# LOAN PAGES
# =====================================

@app.route("/loan_business.html")
@app.route("/loan_business")
def loan_business():
    return render_template("loan_business.html")


@app.route("/loan_details.html")
@app.route("/loan_details")
def loan_details():
    return render_template("loan_details.html")


@app.route("/loan_education.html")
@app.route("/loan_education")
def loan_education():
    return render_template("loan_education.html")


@app.route("/loan_home.html")
@app.route("/loan_home")
def loan_home():
    return render_template("loan_home.html")


@app.route("/loan_vehicle.html")
@app.route("/loan_vehicle")
def loan_vehicle():
    return render_template("loan_vehicle.html")


# =====================================
# PRIVACY POLICY
# =====================================

@app.route("/privacy.html")
@app.route("/privacy")
def privacy():
    return render_template("privacy.html")


# =====================================
# SERVICE PAGES
# =====================================

@app.route("/service_account.html")
@app.route("/service_account")
def service_account():
    return render_template("service_account.html")


@app.route("/service_current.html")
@app.route("/service_current")
def service_current():
    return render_template("service_current.html")


@app.route("/service_customer.html")
@app.route("/service_customer")
def service_customer():
    return render_template("service_customer.html")


@app.route("/service_details.html")
@app.route("/service_details")
def service_details():
    try:
        return render_template("service_details.html")
    except Exception:
        return redirect(url_for("home") + "#services")


@app.route("/service_digital.html")
@app.route("/service_digital")
def service_digital():
    return render_template("service_digital.html")


@app.route("/service_investment.html")
@app.route("/service_investment")
def service_investment():
    return render_template("service_investment.html")


@app.route("/service_money.html")
@app.route("/service_money")
def service_money():
    return render_template("service_money.html")


@app.route("/service_recurring.html")
@app.route("/service_recurring")
def service_recurring():
    return render_template("service_recurring.html")


@app.route("/service_savings.html")
@app.route("/service_savings")
def service_savings():
    return render_template("service_savings.html")


# =====================================
# TERMS AND CONDITIONS
# =====================================

@app.route("/terms.html")
@app.route("/terms")
def terms():
    return render_template("terms.html")


# =====================================
# ADMIN LOGIN PAGE
# =====================================

@app.route("/admin_login")
@app.route("/admin_login.html")
@app.route("/login")
def admin_login():

    if "admin_username" in session:
        return redirect(url_for("admin_dashboard"))

    return render_template("admin_login.html")

# =====================================
# ADMIN DASHBOARD AND LOGIN
# =====================================

@app.route("/admin_dashboard.html", methods=["GET", "POST"])
@app.route("/admin_dashboard", methods=["GET", "POST"])
def admin_dashboard():

    if request.method == "POST":

        username = request.form.get("username")
        password = request.form.get("password")

        if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:

            session["admin_username"] = username

            return redirect(url_for("admin_dashboard"))

        else:

            return render_template(
                "admin_login.html",
                error="Invalid username or password"
            )

    if "admin_username" not in session:

        return redirect(url_for("admin_login"))

    return render_template(
        "admin_dashboard.html",
        admin_username=session["admin_username"]
    )


# =====================================
# ADMIN HOME
# =====================================

@app.route("/admin")
def admin_home():

    if "admin_username" not in session:
        return redirect(url_for("admin_login"))

    return redirect(url_for("admin_dashboard"))


# =====================================
# ADMIN LOGOUT
# =====================================
@app.route("/admin/logout", methods=["POST"])
def admin_logout():
    session.clear()
    return redirect(url_for("admin_login"))






# =====================================
# BRANCH VISIT
# =====================================
@app.route("/schedule-branch-visit", methods=["POST"])
def schedule_branch_visit():

    name = request.form.get("name")
    phone = request.form.get("phone")
    purpose = request.form.get("purpose")
    preferred_date = request.form.get("preferred_date")
    preferred_time = request.form.get("preferred_time")

    if not all([name, phone, purpose, preferred_date, preferred_time]):
        return "Please fill all the fields.", 400

    visit_data = {
        "name": name,
        "phone": phone,
        "purpose": purpose,
        "preferred_date": preferred_date,
        "preferred_time": preferred_time
    }

    response = supabase.table("branch_visits").insert(visit_data).execute()

    return render_template(
        "branch_visit_success.html",
        name=name,
        phone=phone,
        purpose=purpose,
        preferred_date=preferred_date,
        preferred_time=preferred_time
    )
# =====================================
# GALLERY SETTINGS
# =====================================

GALLERY_BUCKET = "gallery-images"

MAX_IMAGE_SIZE = 2 * 1024 * 1024

ALLOWED_EXTENSIONS = ["jpg", "jpeg"]


# =====================================
# GALLERY IMAGE UPLOAD
# =====================================

@app.route("/admin/api/gallery", methods=["POST"])
def upload_gallery_image():

    # Check admin login
    if "admin_username" not in session:

        return jsonify({
            "success": False,
            "message": "Please login as admin."
        }), 401

    # Get form data
    title = request.form.get("title")
    description = request.form.get("description")
    alt_text = request.form.get("alt_text")

    # Get uploaded image
    image = request.files.get("image")

    # Check required fields
    if not title or not alt_text or not image:

        return jsonify({
            "success": False,
            "message": "Please enter title, alternative text and select an image."
        }), 400

    # Check filename
    if not image.filename:

        return jsonify({
            "success": False,
            "message": "Please select an image."
        }), 400

    filename = secure_filename(image.filename)

    # Check file extension
    if "." not in filename:

        return jsonify({
            "success": False,
            "message": "Invalid image file."
        }), 400

    extension = filename.rsplit(".", 1)[1].lower()

    if extension not in ALLOWED_EXTENSIONS:

        return jsonify({
            "success": False,
            "message": "Only JPG and JPEG images are allowed."
        }), 400

    # Read image and check size
    image_bytes = image.read(MAX_IMAGE_SIZE + 1)

    if len(image_bytes) == 0:

        return jsonify({
            "success": False,
            "message": "Image file is empty."
        }), 400

    if len(image_bytes) > MAX_IMAGE_SIZE:

        return jsonify({
            "success": False,
            "message": "Image size must not exceed 2 MB."
        }), 400

    # Check JPEG file signature
    if not image_bytes.startswith(b"\xff\xd8\xff"):

        return jsonify({
            "success": False,
            "message": "Please upload a valid JPG or JPEG image."
        }), 400

    # Generate unique filename
    new_filename = str(uuid.uuid4()) + "." + extension

    # Upload image to Supabase Storage
    supabase.storage.from_(GALLERY_BUCKET).upload(
        new_filename,
        image_bytes,
        file_options={
            "content-type": "image/jpeg"
        }
    )

    # Get public image URL
    image_url = supabase.storage.from_(GALLERY_BUCKET).get_public_url(
        new_filename
    )

    # Store image details in database
    gallery_data = {
        "title": title,
        "description": description,
        "alt_text": alt_text,
        "image_path": new_filename,
        "image_url": image_url
    }

    # Insert details into Supabase table
    supabase.table("gallery_images").insert(
        gallery_data
    ).execute()

    return jsonify({
        "success": True,
        "message": "Gallery image uploaded successfully!"
    })


# =====================================
# LOAD GALLERY IMAGES
# =====================================

@app.route("/admin/api/gallery", methods=["GET"])
def get_gallery_images():

    # Check admin login
    if "admin_username" not in session:

        return jsonify({
            "success": False,
            "message": "Please login as admin."
        }), 401

    # Get images from Supabase
    response = (
        supabase.table("gallery_images")
        .select("*")
        .order("created_at", desc=True)
        .execute()
    )

    return jsonify({
        "success": True,
        "images": response.data
    })



@app.route("/api/gallery", methods=["GET"])
def public_gallery():

    try:
        response = (
            supabase.table("gallery_images")
            .select("id, title, description, alt_text, image_url")
            .order("created_at", desc=True)
            .execute()
        )
        images = response.data or []
        return jsonify({
            "success": True,
            "images": images
        })
    except Exception as e:
        app.logger.warning(f"Gallery query: {e}")
        return jsonify({
            "success": False,
            "images": [],
            "error": str(e)
        }), 500




# =====================================
# HEADER NOTIFICATION SETTINGS
# =====================================

NOTIFICATION_BUCKET = "header-notifications"
MAX_PDF_SIZE = 5 * 1024 * 1024

ALLOWED_CATEGORIES = [
    "Bank Notification",
    "Bank Offers",
    "Career Update",
    "Dividend Announcement",
    "Important Update"
]


# =====================================
# CHECK ADMIN LOGIN
# =====================================

def notification_admin_check():
    if "admin_username" not in session:
        return jsonify({
            "success": False,
            "message": "Please login first."
        }), 401

    return None


# =====================================
# GET PDF PUBLIC URL
# =====================================

def get_notification_pdf_url(pdf_path):

    if not pdf_path:
        return None

    return supabase.storage.from_(
        NOTIFICATION_BUCKET
    ).get_public_url(pdf_path)


# =====================================
# VALIDATE PDF
# =====================================

def valid_notification_pdf(filename, file_data):

    if not filename or "." not in filename:
        return False

    extension = filename.rsplit(".", 1)[1].lower()

    return (
        extension == "pdf"
        and file_data.startswith(b"%PDF-")
    )


# =====================================
# UPLOAD NOTIFICATION PDF
# =====================================

def upload_notification_pdf(pdf):

    if not pdf or not pdf.filename:
        return None, "Please select a PDF."

    filename = secure_filename(pdf.filename)

    file_data = pdf.read(MAX_PDF_SIZE + 1)

    if not file_data:
        return None, "PDF file is empty."

    if len(file_data) > MAX_PDF_SIZE:
        return None, "PDF size must not exceed 5 MB."

    if not valid_notification_pdf(filename, file_data):
        return None, "Only valid PDF files are allowed."

    new_filename = str(uuid.uuid4()) + ".pdf"

    supabase.storage.from_(NOTIFICATION_BUCKET).upload(
        new_filename,
        file_data,
        file_options={
            "content-type": "application/pdf"
        }
    )

    return new_filename, None


# =====================================
# CHECK NOTIFICATION DATES
# =====================================

def validate_notification_dates(start_at, end_at):

    try:

        start_time = None
        end_time = None

        if start_at:
            start_time = datetime.fromisoformat(
                start_at.replace("Z", "+00:00")
            )

            if start_time.tzinfo is None:
                start_time = start_time.replace(
                    tzinfo=timezone.utc
                )

        if end_at:
            end_time = datetime.fromisoformat(
                end_at.replace("Z", "+00:00")
            )

            if end_time.tzinfo is None:
                end_time = end_time.replace(
                    tzinfo=timezone.utc
                )

        if start_time and end_time:
            if end_time <= start_time:
                return False

        return True

    except (ValueError, TypeError):
        return False


# =====================================
# CONVERT ACTIVE VALUE
# =====================================

def parse_notification_active(value):

    return str(value).lower() in [
        "true", "1", "yes", "on"
    ]


# =====================================
# ADMIN: LOAD NOTIFICATIONS
# =====================================

@app.route("/admin/api/notifications", methods=["GET"])
def get_notifications():

    check = notification_admin_check()

    if check:
        return check

    result = (
        supabase.table("header_notifications")
        .select("*")
        .order("created_at", desc=True)
        .execute()
    )

    notifications = result.data

    for notice in notifications:

        notice["pdf_url"] = get_notification_pdf_url(
            notice.get("pdf_path")
        )

        notice["category"] = (
            notice.get("category")
            or notice.get("notification_type")
        )

        notice["active"] = (
            notice.get("active")
            if notice.get("active") is not None
            else notice.get("is_active", True)
        )

    return jsonify({
        "success": True,
        "notifications": notifications
    })


# =====================================
# ADMIN: CREATE NOTIFICATION
# =====================================

@app.route("/admin/api/notifications", methods=["POST"])
def create_notification():

    check = notification_admin_check()

    if check:
        return check

    category = request.form.get("category", "").strip()
    title = request.form.get("title", "").strip()
    message = request.form.get("message", "").strip()
    link_url = request.form.get("link_url", "").strip()

    start_at = request.form.get("start_at") or None
    end_at = request.form.get("end_at") or None

    active = parse_notification_active(
        request.form.get("active", "false")
    )

    if category not in ALLOWED_CATEGORIES:
        return jsonify({
            "success": False,
            "message": "Select a valid category."
        }), 400

    if not title or not message:
        return jsonify({
            "success": False,
            "message": "Title and message are required."
        }), 400

    if link_url and not link_url.startswith(
        ("https://", "http://")
    ):
        return jsonify({
            "success": False,
            "message": "Enter a valid link."
        }), 400

    if not validate_notification_dates(start_at, end_at):
        return jsonify({
            "success": False,
            "message": "End date must be after start date."
        }), 400

    pdf_path = None

    pdf = request.files.get("pdf")

    if pdf and pdf.filename:

        pdf_path, error = upload_notification_pdf(pdf)

        if error:
            return jsonify({
                "success": False,
                "message": error
            }), 400

    notification_data = {
        "category": category,
        "notification_type": category,
        "title": title,
        "message": message,
        "link_url": link_url or None,
        "pdf_path": pdf_path,
        "start_at": start_at,
        "end_at": end_at,
        "active": active,
        "is_active": active
    }

    result = (
        supabase.table("header_notifications")
        .insert(notification_data)
        .execute()
    )

    return jsonify({
        "success": True,
        "message": "Notification added successfully.",
        "notification": (
            result.data[0] if result.data else None
        )
    })


# =====================================
# ADMIN: UPDATE NOTIFICATION
# =====================================

@app.route(
    "/admin/api/notifications/<int:notice_id>",
    methods=["PUT"]
)
def update_notification(notice_id):

    check = notification_admin_check()

    if check:
        return check

    existing = (
        supabase.table("header_notifications")
        .select("*")
        .eq("id", notice_id)
        .execute()
    )

    if not existing.data:
        return jsonify({
            "success": False,
            "message": "Notification not found."
        }), 404

    old_notice = existing.data[0]

    category = request.form.get(
        "category",
        old_notice.get("category") or old_notice.get("notification_type")
    ).strip()

    title = request.form.get(
        "title", old_notice.get("title", "")
    ).strip()

    message = request.form.get(
        "message", old_notice.get("message", "")
    ).strip()

    link_url = request.form.get(
        "link_url", old_notice.get("link_url") or ""
    ).strip()

    start_at = request.form.get(
        "start_at", old_notice.get("start_at")
    ) or None

    end_at = request.form.get(
        "end_at", old_notice.get("end_at")
    ) or None

    active = parse_notification_active(
        request.form.get(
            "active",
            old_notice.get("active", old_notice.get("is_active", True))
        )
    )

    if category not in ALLOWED_CATEGORIES:
        return jsonify({
            "success": False,
            "message": "Select a valid category."
        }), 400

    if not title or not message:
        return jsonify({
            "success": False,
            "message": "Title and message are required."
        }), 400

    if link_url and not link_url.startswith(
        ("https://", "http://")
    ):
        return jsonify({
            "success": False,
            "message": "Enter a valid link."
        }), 400

    if not validate_notification_dates(start_at, end_at):
        return jsonify({
            "success": False,
            "message": "End date must be after start date."
        }), 400

    old_pdf_path = old_notice.get("pdf_path")
    new_pdf_path = old_pdf_path

    remove_pdf = parse_notification_active(
        request.form.get("remove_pdf", "false")
    )

    if remove_pdf:
        new_pdf_path = None

    pdf = request.files.get("pdf")

    if pdf and pdf.filename:

        new_pdf_path, error = upload_notification_pdf(pdf)

        if error:
            return jsonify({
                "success": False,
                "message": error
            }), 400

    update_data = {
        "category": category,
        "notification_type": category,
        "title": title,
        "message": message,
        "link_url": link_url or None,
        "pdf_path": new_pdf_path,
        "start_at": start_at,
        "end_at": end_at,
        "active": active,
        "is_active": active,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }

    result = (
        supabase.table("header_notifications")
        .update(update_data)
        .eq("id", notice_id)
        .execute()
    )

    if old_pdf_path and old_pdf_path != new_pdf_path:

        supabase.storage.from_(
            NOTIFICATION_BUCKET
        ).remove([old_pdf_path])

    return jsonify({
        "success": True,
        "message": "Notification updated successfully."
    })


# =====================================
# ADMIN: DELETE NOTIFICATION
# =====================================

@app.route(
    "/admin/api/notifications/<int:notice_id>",
    methods=["DELETE"]
)
def delete_notification(notice_id):

    check = notification_admin_check()

    if check:
        return check

    existing = (
        supabase.table("header_notifications")
        .select("*")
        .eq("id", notice_id)
        .execute()
    )

    if not existing.data:
        return jsonify({
            "success": False,
            "message": "Notification not found."
        }), 404

    pdf_path = existing.data[0].get("pdf_path")

    supabase.table("header_notifications").delete().eq(
        "id", notice_id
    ).execute()

    if pdf_path:

        supabase.storage.from_(
            NOTIFICATION_BUCKET
        ).remove([pdf_path])

    return jsonify({
        "success": True,
        "message": "Notification deleted successfully."
    })


# =====================================
# PUBLIC: LOAD ACTIVE NOTIFICATIONS
# =====================================

@app.route("/api/header-notifications", methods=["GET"])
def public_header_notifications():

    try:

        result = (
            supabase.table("header_notifications")
            .select("*")
            .eq("active", True)
            .order("created_at", desc=True)
            .execute()
        )

        now = datetime.now(timezone.utc)

        public_notices = []

        for notice in result.data:

            start_at = notice.get("start_at")
            end_at = notice.get("end_at")

            if start_at:

                start_time = datetime.fromisoformat(
                    start_at.replace("Z", "+00:00")
                )

                if start_time.tzinfo is None:
                    start_time = start_time.replace(
                        tzinfo=timezone.utc
                    )

                if now < start_time:
                    continue

            if end_at:

                end_time = datetime.fromisoformat(
                    end_at.replace("Z", "+00:00")
                )

                if end_time.tzinfo is None:
                    end_time = end_time.replace(
                        tzinfo=timezone.utc
                    )

                if now > end_time:
                    continue

            public_notices.append({

                "id": notice.get("id"),

                "category": (
                    notice.get("category")
                    or notice.get("notification_type")
                ),

                "title": notice.get("title"),

                "message": notice.get("message"),

                "link_url": notice.get("link_url"),

                "pdf_url": get_notification_pdf_url(
                    notice.get("pdf_path")
                )
            })

        return jsonify({
            "success": True,
            "notifications": public_notices
        })

    except Exception as error:

        app.logger.exception(
            "PUBLIC NOTIFICATION ERROR"
        )

        return jsonify({
            "success": False,
            "message": str(error),
            "notifications": []
        }), 500



@app.route("/notifications")
@app.route("/notifications.html")
def notifications():
    return render_template("notifications.html")



# =====================================
# FESTIVAL CAMPAIGN SETTINGS
# =====================================

FESTIVAL_BUCKET = "festival-wishes"

MAX_WISH_IMAGE_SIZE = 2 * 1024 * 1024

ALLOWED_WISH_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp"
}

ALLOWED_WISH_MIMES = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp"
}

ALLOWED_WISH_CHANNELS = [
    "whatsapp",
    "sms",
    "email"
]


# =====================================
# CHECK ADMIN LOGIN
# =====================================

def check_admin_login():

    return "admin_username" in session


def admin_required_response():

    if not check_admin_login():

        return jsonify({
            "success": False,
            "message": "Please login as admin."
        }), 401

    return None


# =====================================
# VALIDATE FESTIVAL IMAGE
# =====================================

def validate_wish_image(image):

    if not image or not image.filename:
        return None, None

    filename = secure_filename(image.filename)

    extension = os.path.splitext(filename)[1].lower()

    if extension not in ALLOWED_WISH_EXTENSIONS:

        return None, "Only JPG, JPEG, PNG and WEBP images are allowed."

    image_data = image.read(MAX_WISH_IMAGE_SIZE + 1)

    if not image_data:

        return None, "The selected image is empty."

    if len(image_data) > MAX_WISH_IMAGE_SIZE:

        return None, "Image size must not exceed 2 MB."

    # Check actual image format

    if extension in [".jpg", ".jpeg"]:

        valid_image = image_data.startswith(
            b"\xff\xd8\xff"
        )

    elif extension == ".png":

        valid_image = image_data.startswith(
            b"\x89PNG\r\n\x1a\n"
        )

    else:

        valid_image = (
            len(image_data) >= 12
            and image_data[:4] == b"RIFF"
            and image_data[8:12] == b"WEBP"
        )

    if not valid_image:

        return None, "The selected file is not a valid image."

    return image_data, None


# =====================================
# ADD FESTIVAL CAMPAIGN
# =====================================

@app.route("/admin/api/festival-wishes", methods=["POST"])
def add_festival_wish():

    check = admin_required_response()

    if check:
        return check

    title = request.form.get("title", "").strip()
    message = request.form.get("message", "").strip()
    channels = request.form.getlist("channels")
    audience = request.form.get("audience", "opted_in_customers")
    schedule_value = request.form.get("schedule_at", "").strip()

    # VALIDATE TITLE AND MESSAGE

    if not title or not message:
        return jsonify({
            "success": False,
            "message": "Enter the campaign title and message."
        }), 400

    if not channels:
        return jsonify({
            "success": False,
            "message": "Select at least one communication channel."
        }), 400

    if any(channel not in ALLOWED_WISH_CHANNELS for channel in channels):
        return jsonify({
            "success": False,
            "message": "Invalid communication channel."
        }), 400

    if len(channels) != len(set(channels)):
        return jsonify({
            "success": False,
            "message": "Duplicate channels are not allowed."
        }), 400

    if audience != "opted_in_customers":
        return jsonify({
            "success": False,
            "message": "Only opted-in customers are supported."
        }), 400

    # VALIDATE SCHEDULE

    schedule_at = None
    status = "pending"

    if schedule_value:
        try:
            schedule_at = datetime.fromisoformat(
                schedule_value.replace("Z", "+00:00")
            )

            if schedule_at.tzinfo is None:
                schedule_at = schedule_at.replace(
                    tzinfo=timezone(timedelta(hours=5, minutes=30))
                )

            schedule_at = schedule_at.astimezone(timezone.utc)

            if schedule_at <= datetime.now(timezone.utc):
                return jsonify({
                    "success": False,
                    "message": "Select a future date and time."
                }), 400

            status = "scheduled"

        except ValueError:
            return jsonify({
                "success": False,
                "message": "Invalid schedule date or time."
            }), 400

    # UPLOAD FESTIVAL IMAGE

    image_path = None
    image = request.files.get("image")

    if image and image.filename:

        image_data, error = validate_wish_image(image)

        if error:
            return jsonify({
                "success": False,
                "message": error
            }), 400

        extension = os.path.splitext(
            secure_filename(image.filename)
        )[1].lower()

        image_path = "festival_" + str(uuid.uuid4()) + extension

        supabase.storage.from_(FESTIVAL_BUCKET).upload(
            image_path,
            image_data,
            file_options={
                "content-type": ALLOWED_WISH_MIMES[extension]
            }
        )

    # SAVE CAMPAIGN

    campaign_data = {
        "title": title,
        "message": message,
        "image_path": image_path,
        "channels": channels,
        "audience": audience,
        "schedule_at": schedule_at.isoformat() if schedule_at else None,
        "status": status
    }

    try:

        result = (
            supabase.table("festival_campaigns")
            .insert(campaign_data)
            .execute()
        )

        if not result.data:
            return jsonify({
                "success": False,
                "message": "Campaign could not be saved."
            }), 500

        campaign = result.data[0]
        campaign_id = campaign["id"]

        # FIND ELIGIBLE CUSTOMERS

        delivery_records = []
        recipient_counts = {}

        customers_result = (
            supabase.table("customers")
            .select(
                "id,full_name,phone,email,whatsapp_number,"
                "whatsapp_opt_in,sms_opt_in,email_opt_in"
            )
            .execute()
        )

        customers = customers_result.data or []

        for channel in channels:

            eligible_count = 0

            for customer in customers:

                contact_available = False
                opted_in = False

                if channel == "whatsapp":
                    opted_in = customer.get("whatsapp_opt_in") is True
                    contact_available = bool(
                        customer.get("whatsapp_number")
                    )

                elif channel == "sms":
                    opted_in = customer.get("sms_opt_in") is True
                    contact_available = bool(
                        customer.get("phone")
                    )

                elif channel == "email":
                    opted_in = customer.get("email_opt_in") is True
                    contact_available = bool(
                        customer.get("email")
                    )

                if opted_in and contact_available:

                    eligible_count += 1

                    delivery_records.append({
                        "campaign_id": campaign_id,
                        "customer_id": str(customer["id"]),
                        "channel": channel,
                        "status": "pending"
                    })

            recipient_counts[channel] = eligible_count

        # SAVE DELIVERY HISTORY

        if delivery_records:

            supabase.table("festival_delivery_logs").insert(
                delivery_records
            ).execute()

        return jsonify({
            "success": True,
            "message": "Festival campaign saved successfully.",
            "campaign": campaign,
            "recipient_counts": recipient_counts,
            "total_delivery_records": len(delivery_records)
        }), 201

    except Exception as error:

        app.logger.exception("FESTIVAL CAMPAIGN ERROR")

        return jsonify({
            "success": False,
            "message": "Unable to save festival campaign.",
            "error": str(error)
        }), 500

# =====================================
# DISPLAY FESTIVAL CAMPAIGN HISTORY
# =====================================

@app.route(
    "/admin/api/festival-wishes",
    methods=["GET"]
)
def get_festival_wishes():

    check = admin_required_response()

    if check:
        return check

    result = (
        supabase.table("festival_campaigns")
        .select("*")
        .order("created_at", desc=True)
        .execute()
    )

    campaigns = []

    for campaign in result.data:

        image_path = campaign.get("image_path")

        image_url = None

        if image_path:

            image_url = supabase.storage.from_(
                FESTIVAL_BUCKET
            ).get_public_url(image_path)

        campaign["image_url"] = image_url

        campaigns.append(campaign)

    return jsonify({

        "success": True,

        "campaigns": campaigns

    })


# =====================================
# DELETE FESTIVAL CAMPAIGN
# =====================================

@app.route(
    "/admin/api/festival-wishes/<int:campaign_id>",
    methods=["DELETE"]
)
def delete_festival_wish(campaign_id):

    check = admin_required_response()

    if check:
        return check

    # Find campaign

    result = (
        supabase.table("festival_campaigns")
        .select("id,image_path")
        .eq("id", campaign_id)
        .execute()
    )

    if not result.data:

        return jsonify({
            "success": False,
            "message": "Campaign not found."
        }), 404

    image_path = result.data[0].get("image_path")

    # Delete database record

    supabase.table("festival_campaigns").delete().eq(
        "id", campaign_id
    ).execute()

    # Delete associated image

    if image_path:

        supabase.storage.from_(
            FESTIVAL_BUCKET
        ).remove([image_path])

    return jsonify({

        "success": True,

        "message": "Festival campaign deleted successfully."

    })



    
# =====================================
# 404 ERROR HANDLER (VERCEL COMPATIBILITY)
# =====================================

@app.errorhandler(404)
def handle_404(e):
    # Log the not found path for debugging
    app.logger.warning(f"404 Not Found: {request.path}")
    # Smoothly redirect any unmatched URL to the home page
    return redirect(url_for("home"))


# =====================================
# RUN APPLICATION
# =====================================

if __name__ == "__main__":

    app.run(debug=True)




