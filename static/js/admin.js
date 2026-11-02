
// =======================================
// ANISH SOUHARDA - ADMIN JAVASCRIPT
// =======================================


// =======================================
// 1. DISPLAY CURRENT YEAR
// =======================================

var yearText = document.getElementById("yearText");

if (yearText) {
    yearText.textContent = new Date().getFullYear();
}


// =======================================
// 2. DISPLAY CURRENT DATE
// =======================================

var todayChip = document.getElementById("todayChip");

if (todayChip) {
    todayChip.textContent = new Date().toDateString();
}


// =======================================
// 3. ADMIN SUCCESS POPUP
// =======================================

// Display success popup

function showAdminPopup(title, message) {

    var popupOverlay = document.getElementById("adminPopupOverlay");
    var popupTitle = document.getElementById("adminPopupTitle");
    var popupMessage = document.getElementById("adminPopupMessage");

    if (popupOverlay && popupTitle && popupMessage) {

        popupTitle.textContent = title;
        popupMessage.textContent = message;

        popupOverlay.classList.add("show");

    } else {

        alert(message);

    }

}


// Close success popup

var adminPopupOk = document.getElementById("adminPopupOk");

if (adminPopupOk) {

    adminPopupOk.addEventListener("click", function () {

        var popupOverlay = document.getElementById("adminPopupOverlay");

        if (popupOverlay) {
            popupOverlay.classList.remove("show");
        }

    });

}


// =======================================
// 4. SIDEBAR NAVIGATION
// =======================================

var navButtons = document.querySelectorAll(".nav-item");

var modules = document.querySelectorAll(".module-section");

var pageTitle = document.getElementById("pageTitle");


function openModule(moduleName) {

    for (var i = 0; i < modules.length; i++) {

        modules[i].classList.remove("active");

    }

    for (var i = 0; i < navButtons.length; i++) {

        navButtons[i].classList.remove("active");

    }

    var selectedModule = document.getElementById("module-" + moduleName);

    if (selectedModule) {

        selectedModule.classList.add("active");

    }

    for (var i = 0; i < navButtons.length; i++) {

        if (navButtons[i].getAttribute("data-module") === moduleName) {

            navButtons[i].classList.add("active");

        }

    }

    if (pageTitle) {

        pageTitle.textContent =
            moduleName.charAt(0).toUpperCase() + moduleName.slice(1);

    }

}


// Navigation buttons

for (var i = 0; i < navButtons.length; i++) {

    navButtons[i].addEventListener("click", function () {

        var moduleName = this.getAttribute("data-module");

        if (moduleName) {

            openModule(moduleName);

        }

    });

}


// =======================================
// 5. QUICK ACCESS BUTTONS
// =======================================

var quickButtons = document.querySelectorAll(".quick-action");

for (var i = 0; i < quickButtons.length; i++) {

    quickButtons[i].addEventListener("click", function () {

        var moduleName = this.getAttribute("data-go");

        if (moduleName) {

            openModule(moduleName);

        }

    });

}


// =======================================
// 6. MOBILE SIDEBAR
// =======================================

var mobileMenu = document.getElementById("mobileMenu");

var adminSidebar = document.getElementById("adminSidebar");

if (mobileMenu && adminSidebar) {

    mobileMenu.addEventListener("click", function () {

        adminSidebar.classList.toggle("active");

    });

}


// =======================================
// 7. GALLERY IMAGE VALIDATION
// =======================================

var galleryForm = document.getElementById("galleryForm");

var galleryImage = document.getElementById("galleryImage");

var galleryFileInfo = document.getElementById("galleryFileInfo");

var maxImageSize = 2 * 1024 * 1024;


// Validate selected image

if (galleryImage) {

    galleryImage.addEventListener("change", function () {

        var file = galleryImage.files[0];

        if (!file) {

            if (galleryFileInfo) {

                galleryFileInfo.textContent = "No file selected.";

            }

            return;

        }

        var fileName = file.name.toLowerCase();

        // Check JPG and JPEG format

        if (!fileName.endsWith(".jpg") &&
            !fileName.endsWith(".jpeg")) {

            alert("Only JPG and JPEG images are allowed.");

            galleryImage.value = "";

            if (galleryFileInfo) {

                galleryFileInfo.textContent = "Invalid image format.";

            }

            return;

        }

        // Check 2MB size

        if (file.size > maxImageSize) {

            alert("Image size must not exceed 2 MB.");

            galleryImage.value = "";

            if (galleryFileInfo) {

                galleryFileInfo.textContent = "Image size is too large.";

            }

            return;

        }

        if (galleryFileInfo) {

            galleryFileInfo.textContent = "Selected: " + file.name;

        }

    });

}


// =======================================
// 8. LOAD GALLERY IMAGES
// =======================================

function loadGallery() {

    var galleryGrid = document.getElementById("galleryGrid");

    var galleryCount = document.getElementById("galleryCount");

    var statGallery = document.getElementById("statGallery");

    if (!galleryGrid) {

        return;

    }

    fetch("/admin/api/gallery", {

        method: "GET"

    })

    .then(function(response) {

        if (!response.ok) {

            throw new Error("Unable to load gallery.");

        }

        return response.json();

    })

    .then(function(data) {

        if (!data.success) {

            galleryGrid.textContent =
                data.message || "Unable to load gallery images.";

            return;

        }

        galleryGrid.innerHTML = "";

        var images = data.images || [];

        for (var i = 0; i < images.length; i++) {

            var image = images[i];

            var card = document.createElement("div");

            card.className = "media-card";

            var photo = document.createElement("img");

            photo.src = image.image_url;

            photo.alt = image.alt_text || image.title || "Gallery image";

            var title = document.createElement("h4");

            title.textContent = image.title || "Untitled";

            var description = document.createElement("p");

            description.textContent = image.description || "";

            card.appendChild(photo);

            card.appendChild(title);

            card.appendChild(description);

            galleryGrid.appendChild(card);

        }

        if (images.length === 0) {

            galleryGrid.textContent =
                "No gallery images uploaded yet.";

        }

        if (galleryCount) {

            galleryCount.textContent = images.length + " items";

        }

        if (statGallery) {

            statGallery.textContent = images.length;

        }

    })

    .catch(function() {

        galleryGrid.textContent =
            "Unable to connect to the server.";

    });

}


// =======================================
// 9. GALLERY IMAGE UPLOAD CONFIRMATION
// =======================================

var uploadConfirmOverlay =
    document.getElementById("uploadConfirmOverlay");

var uploadCancelBtn =
    document.getElementById("uploadCancelBtn");

var confirmUploadBtn =
    document.getElementById("confirmUploadBtn");

var pendingUploadData = null;


// Close confirmation popup

function closeUploadPopup() {

    if (uploadConfirmOverlay) {

        uploadConfirmOverlay.classList.remove("show");

    }

    pendingUploadData = null;

}


// Cancel button

if (uploadCancelBtn) {

    uploadCancelBtn.addEventListener("click", function () {

        closeUploadPopup();

    });

}


// Validate and open confirmation popup

if (galleryForm) {

    galleryForm.addEventListener("submit", function (event) {

        event.preventDefault();

        var title = document.getElementById("galleryTitle").value;

        var description =
            document.getElementById("galleryDescription").value;

        var altText = document.getElementById("galleryAlt").value;

        var file = galleryImage ? galleryImage.files[0] : null;


        // Validate required fields

        if (title.trim() === "" ||
            altText.trim() === "" ||
            !file) {

            alert(
                "Please enter the title, alternative text and select an image."
            );

            return;

        }


        // Validate image extension

        var fileName = file.name.toLowerCase();

        if (!fileName.endsWith(".jpg") &&
            !fileName.endsWith(".jpeg")) {

            alert("Only JPG and JPEG images are allowed.");

            return;

        }


        // Validate image size

        if (file.size > maxImageSize) {

            alert("Image size must not exceed 2 MB.");

            return;

        }


        // Create FormData and store temporarily

        pendingUploadData = new FormData();

        pendingUploadData.append("title", title);

        pendingUploadData.append("description", description);

        pendingUploadData.append("alt_text", altText);

        pendingUploadData.append("image", file);


        // Open confirmation popup

        if (uploadConfirmOverlay) {

            uploadConfirmOverlay.classList.add("show");

        } else {

            alert("Upload confirmation popup was not found.");

            pendingUploadData = null;

        }

    });

}


// =======================================
// 10. CONFIRM AND UPLOAD IMAGE
// =======================================

if (confirmUploadBtn) {

    confirmUploadBtn.addEventListener("click", function () {

        if (!pendingUploadData) {

            alert("Please select an image before uploading.");

            return;

        }

        // Prevent multiple clicks

        confirmUploadBtn.disabled = true;

        confirmUploadBtn.textContent = "Uploading...";


        // Send image to Flask

        fetch("/admin/api/gallery", {

            method: "POST",

            body: pendingUploadData

        })

        .then(function(response) {

            if (!response.ok) {

                throw new Error("Image upload failed.");

            }

            return response.json();

        })

        .then(function(data) {

            if (data.success) {

                // Close confirmation popup

                closeUploadPopup();


                // Reset form

                galleryForm.reset();

                if (galleryFileInfo) {

                    galleryFileInfo.textContent = "No file selected.";

                }


                // Refresh gallery

                loadGallery();


                // Display success popup

                showAdminPopup(

                    "Image Uploaded Successfully!",

                    data.message ||
                    "Your gallery image has been uploaded successfully."

                );

            } else {

                // Keep confirmation popup open for retry

                alert(data.message || "Image upload failed.");

            }

        })

        .catch(function() {

            // Keep confirmation popup open for retry

            alert(
                "Unable to upload image. Please check the server and try again."
            );

        })

        .finally(function() {

            // Enable button again

            confirmUploadBtn.disabled = false;

            confirmUploadBtn.textContent = "Upload Image";

        });

    });

}


// Load gallery when dashboard opens

loadGallery();



// =======================================
// 11. HEADER NOTIFICATION MANAGEMENT
// =======================================

var notificationForm = document.getElementById("notificationForm");
var notificationPdf = document.getElementById("notificationPdf");
var notificationList = document.getElementById("notificationList");
var notificationCount = document.getElementById("noticeCount");
var statNotifications = document.getElementById("statNotifications");

var maxPdfSize = 5 * 1024 * 1024;


// =======================================
// VALIDATE PDF FILE
// =======================================

if (notificationPdf) {

    notificationPdf.addEventListener("change", function () {

        var file = notificationPdf.files[0];

        if (!file) {
            return;
        }

        if (!file.name.toLowerCase().endsWith(".pdf")) {

            alert("Only PDF files are allowed.");
            notificationPdf.value = "";
            return;

        }

        if (file.size > maxPdfSize) {

            alert("PDF size must not exceed 5MB.");
            notificationPdf.value = "";
            return;

        }

        showCustomPopup("PDF selected successfully!");

    });

}


// =======================================
// LOAD ALL NOTIFICATIONS
// =======================================

function loadNotifications() {

    if (!notificationList) {
        return;
    }

    notificationList.textContent = "Loading notifications...";

    fetch("/admin/api/notifications")

    .then(function (response) {

        return response.json().then(function (data) {

            if (!response.ok) {
                throw new Error(data.message || "Unable to load notifications.");
            }

            return data;

        });

    })

    .then(function (data) {

        if (!data.success) {
            throw new Error(data.message || "Unable to load notifications.");
        }

        var notifications = data.notifications || [];

        notificationList.replaceChildren();

        for (var i = 0; i < notifications.length; i++) {

            var notice = notifications[i];

            var card = document.createElement("div");
            card.className = "notification-admin-card";

            var category = document.createElement("h4");
            category.textContent = notice.category;

            var title = document.createElement("h3");
            title.textContent = notice.title;

            var message = document.createElement("p");
            message.textContent = notice.message;

            var status = document.createElement("p");
            status.textContent = notice.active ? "Active" : "Inactive";

            var link = document.createElement("p");

            if (notice.link_url) {

                var linkAnchor = document.createElement("a");
                linkAnchor.href = notice.link_url;
                linkAnchor.textContent = "Open announcement link";
                linkAnchor.target = "_blank";
                linkAnchor.rel = "noopener noreferrer";

                link.appendChild(linkAnchor);

            }

            var pdf = document.createElement("p");

            if (notice.pdf_url) {

                var pdfAnchor = document.createElement("a");
                pdfAnchor.href = notice.pdf_url;
                pdfAnchor.textContent = "View attached PDF";
                pdfAnchor.target = "_blank";
                pdfAnchor.rel = "noopener noreferrer";

                pdf.appendChild(pdfAnchor);

            }

            var editButton = document.createElement("button");
            editButton.type = "button";
            editButton.className = "btn btn-primary";
            editButton.textContent = "Edit";

            editButton.addEventListener("click", function (selectedNotice) {

                return function () {
                    editNotification(selectedNotice);
                };

            }(notice));


            var toggleButton = document.createElement("button");
            toggleButton.type = "button";
            toggleButton.className = "btn btn-secondary";
            toggleButton.textContent = notice.active ? "Deactivate" : "Activate";

            toggleButton.addEventListener("click", function (selectedNotice, button) {

                return function () {
                    toggleNotification(selectedNotice, button);
                };

            }(notice, toggleButton));


            var deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "btn btn-secondary";
            deleteButton.textContent = "Delete";

            deleteButton.addEventListener("click", function (selectedNotice, button) {

                return function () {
                    deleteNotification(selectedNotice.id, button);
                };

            }(notice, deleteButton));


            var actions = document.createElement("div");
            actions.className = "notification-actions";

            actions.appendChild(editButton);
            actions.appendChild(toggleButton);
            actions.appendChild(deleteButton);

            card.appendChild(category);
            card.appendChild(title);
            card.appendChild(message);
            card.appendChild(status);
            card.appendChild(link);
            card.appendChild(pdf);
            card.appendChild(actions);

            notificationList.appendChild(card);

        }

        if (notifications.length === 0) {

            notificationList.textContent = "No notifications created yet.";

        }

        if (notificationCount) {
            notificationCount.textContent = notifications.length + " items";
        }

        if (statNotifications) {
            statNotifications.textContent = notifications.length;
        }

    })

    .catch(function (error) {

        notificationList.textContent = error.message;

    });

}


// =======================================
// 12. CREATE OR UPDATE NOTIFICATION
// =======================================

if (notificationForm) {

    notificationForm.addEventListener("submit", function (event) {

        event.preventDefault();

        var notificationId = document.getElementById("notificationId");
        var category = document.getElementById("notificationCategory");
        var title = document.getElementById("notificationTitle");
        var message = document.getElementById("notificationMessage");
        var link = document.getElementById("notificationLink");
        var start = document.getElementById("notificationStart");
        var end = document.getElementById("notificationEnd");
        var active = document.getElementById("notificationActive");

        var pdf = document.getElementById("notificationPdf");
        var removePdf = document.getElementById("removeNotificationPdf");

        if (!category.value || !title.value.trim() || !message.value.trim()) {

            alert("Please enter the category, title and message.");
            return;

        }

        if (start.value && end.value) {

            if (new Date(end.value) <= new Date(start.value)) {

                alert("End date must be after start date.");
                return;

            }

        }

        var selectedPdf = pdf.files[0];

        if (selectedPdf) {

            if (!selectedPdf.name.toLowerCase().endsWith(".pdf")) {

                alert("Only PDF files are allowed.");
                return;

            }

            if (selectedPdf.size > maxPdfSize) {

                alert("PDF size must not exceed 5MB.");
                return;

            }

        }

        var formData = new FormData(notificationForm);

        // Explicitly send active status.
        formData.set("active", active.checked ? "1" : "0");

        // Remove PDF option.
        formData.set(
            "remove_pdf",
            removePdf && removePdf.checked ? "1" : "0"
        );

        var id = notificationId.value.trim();

        var url = id
            ? "/admin/api/notifications/" + id
            : "/admin/api/notifications";

        var method = id ? "PUT" : "POST";

        var submitButton = document.getElementById("notificationSubmit");

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = id ? "Updating..." : "Saving...";
        }

        fetch(url, {

            method: method,
            body: formData

        })

        .then(function (response) {

            return response.json().then(function (data) {

                if (!response.ok) {
                    throw new Error(data.message || "Unable to save notification.");
                }

                return data;

            });

        })

        .then(function (data) {

            if (!data.success) {
                throw new Error(data.message || "Unable to save notification.");
            }

            notificationForm.reset();

            if (notificationId) {
                notificationId.value = "";
            }

            if (removePdf) {
                removePdf.checked = false;
            }

            if (submitButton) {
                submitButton.textContent = "Save Notification";
            }

            var cancelButton = document.getElementById("cancelNoticeEdit");

            if (cancelButton) {
                cancelButton.style.display = "none";
            }

            loadNotifications();

            showAdminPopup(
                "Notification Saved!",
                data.message || "Notification saved successfully."
            );

        })

        .catch(function (error) {

            alert(error.message);

        })

        .finally(function () {

            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = "Save Notification";
            }

        });

    });

}


// =======================================
// EDIT NOTIFICATION
// =======================================

function editNotification(notice) {

    document.getElementById("notificationId").value = notice.id;

    document.getElementById("notificationCategory").value = notice.category;

    document.getElementById("notificationTitle").value = notice.title;

    document.getElementById("notificationMessage").value = notice.message;

    document.getElementById("notificationLink").value =
        notice.link_url || "";

    document.getElementById("notificationStart").value =
        formatDateForInput(notice.start_at);

    document.getElementById("notificationEnd").value =
        formatDateForInput(notice.end_at);

    document.getElementById("notificationActive").checked =
        notice.active === true || notice.active === "true";

    document.getElementById("notificationPdf").value = "";

    var removePdf = document.getElementById("removeNotificationPdf");

    if (removePdf) {
        removePdf.checked = false;
    }

    var submitButton = document.getElementById("notificationSubmit");

    if (submitButton) {
        submitButton.textContent = "Update Notification";
    }

    var cancelButton = document.getElementById("cancelNoticeEdit");

    if (cancelButton) {
        cancelButton.style.display = "inline-block";
    }

    notificationForm.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


// Convert database date into datetime-local format

function formatDateForInput(value) {

    if (!value) {
        return "";
    }

    var date = new Date(value);

    if (isNaN(date.getTime())) {
        return "";
    }

    var localDate = new Date(
        date.getTime() - date.getTimezoneOffset() * 60000
    );

    return localDate.toISOString().slice(0, 16);

}


// =======================================
// CANCEL NOTIFICATION EDIT
// =======================================

var cancelNoticeEdit = document.getElementById("cancelNoticeEdit");

if (cancelNoticeEdit) {

    cancelNoticeEdit.addEventListener("click", function () {

        notificationForm.reset();

        document.getElementById("notificationId").value = "";

        cancelNoticeEdit.style.display = "none";

        var submitButton = document.getElementById("notificationSubmit");

        if (submitButton) {
            submitButton.textContent = "Save Notification";
        }

    });

    cancelNoticeEdit.style.display = "none";

}


// =======================================
// ACTIVATE OR DEACTIVATE NOTIFICATION
// =======================================

function toggleNotification(notice, button) {

    var formData = new FormData();

    formData.append("active", notice.active ? "0" : "1");

    button.disabled = true;
    button.textContent = "Updating...";

    fetch("/admin/api/notifications/" + notice.id, {

        method: "PUT",
        body: formData

    })

    .then(function (response) {

        return response.json().then(function (data) {

            if (!response.ok) {
                throw new Error(data.message || "Unable to update status.");
            }

            return data;

        });

    })

    .then(function (data) {

        if (!data.success) {
            throw new Error(data.message || "Unable to update status.");
        }

        loadNotifications();

        showAdminPopup(
            "Status Updated!",
            "Notification status has been changed successfully."
        );

    })

    .catch(function (error) {

        alert(error.message);

        button.disabled = false;
        button.textContent = notice.active ? "Deactivate" : "Activate";

    });

}


// =======================================
// DELETE NOTIFICATION
// =======================================

function deleteNotification(id, button) {

    var confirmDelete = confirm(
        "Are you sure you want to delete this notification?"
    );

    if (!confirmDelete) {
        return;
    }

    button.disabled = true;
    button.textContent = "Deleting...";

    fetch("/admin/api/notifications/" + id, {

        method: "DELETE"

    })

    .then(function (response) {

        return response.json().then(function (data) {

            if (!response.ok) {
                throw new Error(data.message || "Unable to delete notification.");
            }

            return data;

        });

    })

    .then(function (data) {

        if (!data.success) {
            throw new Error(data.message || "Unable to delete notification.");
        }

        loadNotifications();

        showAdminPopup(
            "Notification Deleted!",
            "The notification has been deleted successfully."
        );

    })

    .catch(function (error) {

        alert(error.message);

        button.disabled = false;
        button.textContent = "Delete";

    });

}


// =======================================
// LOAD NOTIFICATIONS WHEN DASHBOARD OPENS
// =======================================

loadNotifications();


// =======================================
// 13. FESTIVAL WISHES MANAGEMENT
// =======================================

var wishForm = document.getElementById("wishForm");
var wishImage = document.getElementById("wishImage");
var wishCount = document.getElementById("wishCount");
var statWishes = document.getElementById("statWishes");
var wishesTableBody = document.getElementById("wishesTableBody");

var MAX_WISH_IMAGE_SIZE = 2 * 1024 * 1024;


// =======================================
// VALIDATE FESTIVAL IMAGE
// =======================================

if (wishImage) {

    wishImage.addEventListener("change", function () {

        var file = wishImage.files[0];

        if (!file) {
            return;
        }

        var fileName = file.name.toLowerCase();

        var validFormat =
            fileName.endsWith(".jpg") ||
            fileName.endsWith(".jpeg") ||
            fileName.endsWith(".png") ||
            fileName.endsWith(".webp");

        if (!validFormat) {

            alert("Only JPG, JPEG, PNG and WEBP images are allowed.");

            wishImage.value = "";
            return;

        }

        if (file.size > MAX_WISH_IMAGE_SIZE) {

            alert("Festival image must not exceed 2 MB.");

            wishImage.value = "";
            return;

        }

    });

}


// =======================================
// LOAD FESTIVAL CAMPAIGNS
// =======================================

function loadFestivalWishes() {

    if (!wishesTableBody) {
        return;
    }

    wishesTableBody.textContent = "Loading campaigns...";

    fetch("/admin/api/festival-wishes", {
        method: "GET"
    })

    .then(function (response) {

        return response.json().then(function (data) {

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to load festival campaigns."
                );
            }

            return data;

        });

    })

    .then(function (data) {

        if (!data.success) {
            throw new Error(
                data.message || "Unable to load festival campaigns."
            );
        }

        var campaigns = data.campaigns || [];

        wishesTableBody.replaceChildren();

        for (var i = 0; i < campaigns.length; i++) {

            var campaign = campaigns[i];

            var row = document.createElement("tr");

            var titleCell = document.createElement("td");
            titleCell.textContent = campaign.title || "";

            var channelCell = document.createElement("td");
            channelCell.textContent =
                Array.isArray(campaign.channels)
                    ? campaign.channels.join(", ").toUpperCase()
                    : "";

            var scheduleCell = document.createElement("td");

            if (campaign.schedule_at) {

                var scheduleDate = new Date(campaign.schedule_at);

                scheduleCell.textContent =
                    isNaN(scheduleDate.getTime())
                        ? campaign.schedule_at
                        : scheduleDate.toLocaleString();

            } else {

                scheduleCell.textContent = "Not scheduled";

            }

            var statusCell = document.createElement("td");
            statusCell.textContent = campaign.status || "pending";

            var actionCell = document.createElement("td");

            var deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "btn btn-secondary";
            deleteButton.textContent = "Delete";

            deleteButton.addEventListener("click", function (selectedCampaign, button) {

                return function () {
                    deleteFestivalWish(selectedCampaign.id, button);
                };

            }(campaign, deleteButton));

            actionCell.appendChild(deleteButton);

            row.appendChild(titleCell);
            row.appendChild(channelCell);
            row.appendChild(scheduleCell);
            row.appendChild(statusCell);
            row.appendChild(actionCell);

            wishesTableBody.appendChild(row);

        }

        if (campaigns.length === 0) {

            var emptyRow = document.createElement("tr");
            var emptyCell = document.createElement("td");

            emptyCell.colSpan = 5;
            emptyCell.textContent = "No festival campaigns created yet.";

            emptyRow.appendChild(emptyCell);
            wishesTableBody.appendChild(emptyRow);

        }

        if (wishCount) {
            wishCount.textContent = campaigns.length + " campaigns";
        }

        if (statWishes) {
            statWishes.textContent = campaigns.length;
        }

    })

    .catch(function (error) {

        wishesTableBody.textContent = error.message;

    });

}


// =======================================
// CREATE FESTIVAL CAMPAIGN
// =======================================

if (wishForm) {

    wishForm.addEventListener("submit", function (event) {

        event.preventDefault();

        var title = document.getElementById("wishTitle").value.trim();

        var message = document.getElementById("wishMessage").value.trim();

        var channels = document.querySelectorAll(
            '#wishForm input[name="channels"]:checked'
        );

        var schedule = document.getElementById("wishSchedule").value;

        var image = wishImage ? wishImage.files[0] : null;


        // Check title and message

        if (!title || !message) {

            alert("Please enter the campaign title and message.");
            return;

        }


        // Check selected channels

        if (channels.length === 0) {

            alert("Please select at least one delivery channel.");
            return;

        }


        // Check image format and size

        if (image) {

            var fileName = image.name.toLowerCase();

            var validFormat =
                fileName.endsWith(".jpg") ||
                fileName.endsWith(".jpeg") ||
                fileName.endsWith(".png") ||
                fileName.endsWith(".webp");

            if (!validFormat) {

                alert("Only JPG, JPEG, PNG and WEBP images are allowed.");
                return;

            }

            if (image.size > MAX_WISH_IMAGE_SIZE) {

                alert("Festival image must not exceed 2 MB.");
                return;

            }

        }


        // Check scheduled date

        if (schedule) {

            var selectedDate = new Date(schedule);

            if (isNaN(selectedDate.getTime()) ||
                selectedDate <= new Date()) {

                alert("Please select a future date and time.");
                return;

            }

        }


        // Prepare campaign data

        var formData = new FormData(wishForm);

        var submitButton = wishForm.querySelector(
            'button[type="submit"]'
        );

        if (submitButton) {

            submitButton.disabled = true;
            submitButton.textContent = "Saving Campaign...";

        }


        // Send campaign details to Flask

        fetch("/admin/api/festival-wishes", {

            method: "POST",
            body: formData

        })

        .then(function (response) {

            return response.json().then(function (data) {

                if (!response.ok) {

                    throw new Error(
                        data.message || "Unable to save festival campaign."
                    );

                }

                return data;

            });

        })

        .then(function (data) {

            if (!data.success) {

                throw new Error(
                    data.message || "Unable to save festival campaign."
                );

            }

            wishForm.reset();

            loadFestivalWishes();

            showAdminPopup(
                "Festival Campaign Saved!",
                data.message ||
                "Your festival campaign has been saved successfully."
            );

        })

        .catch(function (error) {

            alert(error.message);

        })

        .finally(function () {

            if (submitButton) {

                submitButton.disabled = false;
                submitButton.textContent = "Send / Schedule Wishes";

            }

        });

    });

}


// =======================================
// DELETE FESTIVAL CAMPAIGN
// =======================================


/* =========================================
   FESTIVAL WISHES - CUSTOM DELETE POPUP
========================================= */

// Get modal elements
var deleteWishModal = document.getElementById("deleteWishModal");
var cancelDeleteWish = document.getElementById("cancelDeleteWish");
var confirmDeleteWish = document.getElementById("confirmDeleteWish");

// Store selected campaign details
var selectedWishId = null;
var selectedWishButton = null;


// =========================================
// OPEN DELETE POPUP
// =========================================

function deleteFestivalWish(campaignId, button) {

    selectedWishId = campaignId;
    selectedWishButton = button;

    deleteWishModal.classList.add("show");

}


// =========================================
// CLOSE DELETE POPUP
// =========================================

function closeDeleteWishModal() {

    deleteWishModal.classList.remove("show");

    selectedWishId = null;
    selectedWishButton = null;

}


// Cancel button
cancelDeleteWish.addEventListener("click", function () {

    closeDeleteWishModal();

});


// =========================================
// CONFIRM AND DELETE CAMPAIGN
// =========================================

confirmDeleteWish.addEventListener("click", function () {

    if (!selectedWishId) {
        return;
    }

    var campaignId = selectedWishId;
    var button = selectedWishButton;

    confirmDeleteWish.disabled = true;
    confirmDeleteWish.innerHTML = "Deleting...";

    if (button) {
        button.disabled = true;
        button.textContent = "Deleting...";
    }

    fetch("/admin/api/festival-wishes/" + campaignId, {

        method: "DELETE"

    })

    .then(function (response) {

        return response.json().then(function (data) {

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to delete campaign."
                );
            }

            return data;

        });

    })

    .then(function (data) {

        if (!data.success) {
            throw new Error(
                data.message || "Unable to delete campaign."
            );
        }

        closeDeleteWishModal();

        loadFestivalWishes();

        showAdminPopup(
            "Campaign Deleted!",
            "The festival campaign has been deleted successfully."
        );

    })

    .catch(function (error) {

        alert(error.message);

        if (button) {
            button.disabled = false;
            button.textContent = "Delete";
        }

    })

    .finally(function () {

        confirmDeleteWish.disabled = false;

        confirmDeleteWish.innerHTML =
            '<i class="fa-solid fa-trash"></i> Delete';

    });

});

// =======================================
// LOAD CAMPAIGNS WHEN DASHBOARD OPENS
// =======================================

loadFestivalWishes();





/* =====================================
   CUSTOM FESTIVAL DELETE MODAL
===================================== */

var deleteWishModal = document.getElementById("deleteWishModal");
var cancelDeleteWish = document.getElementById("cancelDeleteWish");
var confirmDeleteWish = document.getElementById("confirmDeleteWish");

var selectedWishId = null;

// Open confirmation popup
function openDeleteWishModal(id) {
    selectedWishId = id;
    deleteWishModal.classList.add("show");
}

// Close confirmation popup
function closeDeleteWishModal() {
    deleteWishModal.classList.remove("show");
    selectedWishId = null;
}

cancelDeleteWish.addEventListener("click", function () {
    closeDeleteWishModal();
});

// Delete after confirmation
confirmDeleteWish.addEventListener("click", async function () {

    if (!selectedWishId) {
        return;
    }

    confirmDeleteWish.disabled = true;
    confirmDeleteWish.textContent = "Deleting...";

    try {

        var response = await fetch(
            "/admin/api/festival-wishes/" + selectedWishId,
            {
                method: "DELETE"
            }
        );

        var result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Unable to delete campaign.");
        }

        closeDeleteWishModal();

        alert("Festival campaign deleted successfully.");

        loadFestivalWishes();

    } catch (error) {

        alert(error.message);

    } finally {

        confirmDeleteWish.disabled = false;
        confirmDeleteWish.innerHTML =
            '<i class="fa-solid fa-trash"></i> Delete';

    }

});



// =======================================
// 14. LOGOUT POPUP
// =======================================

// Open logout popup

function openLogoutPopup() {

    var logoutPopup = document.getElementById("logoutPopup");

    if (logoutPopup) {

        logoutPopup.classList.add("show");

    }

}


// Close logout popup

function closeLogoutPopup() {

    var logoutPopup = document.getElementById("logoutPopup");

    if (logoutPopup) {

        logoutPopup.classList.remove("show");

    }

}


// Confirm logout

function confirmLogout() {

    var logoutForm = document.getElementById("logoutForm");

    if (logoutForm) {

        logoutForm.submit();

    }

}

// =======================================
// 15. BOARD OF DIRECTORS MANAGEMENT
// =======================================

var directorsGrid = document.getElementById("directorsGrid");
var statDirectors = document.getElementById("statDirectors");

var MAX_DIRECTOR_IMAGE_SIZE = 2 * 1024 * 1024;


// =======================================
// CREATE DIRECTOR CARD
// =======================================

function createDirectorCard(serial, director) {

    var card = document.createElement("div");
    card.className = "director-admin-card";

    // Card heading
    var heading = document.createElement("h3");
    heading.textContent = "Director Slot " + serial;

    card.appendChild(heading);

    // Profile photo preview
    var photo = document.createElement("img");
    photo.className = "director-photo-preview";
    photo.alt = "Director " + serial + " profile photo";

    if (director && director.image_url) {
        photo.src = director.image_url;
    } else {
        photo.alt = "No profile photo uploaded";
    }

    card.appendChild(photo);

    // Name input
    var nameLabel = document.createElement("label");
    nameLabel.textContent = "Full Name";

    var nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.name = "full_name";
    nameInput.placeholder = "Enter full name";
    nameInput.maxLength = 150;
    nameInput.required = true;
    nameInput.value = director && director.full_name
        ? director.full_name : "";

    card.appendChild(nameLabel);
    card.appendChild(nameInput);

    // Designation input
    var designationLabel = document.createElement("label");
    designationLabel.textContent = "Designation";

    var designationInput = document.createElement("input");
    designationInput.type = "text";
    designationInput.name = "designation";
    designationInput.placeholder = "Enter designation";
    designationInput.maxLength = 100;
    designationInput.required = true;
    designationInput.value = director && director.designation
        ? director.designation : "";

    card.appendChild(designationLabel);
    card.appendChild(designationInput);

    // Phone input
    var phoneLabel = document.createElement("label");
    phoneLabel.textContent = "Phone Number";

    var phoneInput = document.createElement("input");
    phoneInput.type = "tel";
    phoneInput.name = "phone";
    phoneInput.placeholder = "Enter phone number";
    phoneInput.maxLength = 15;
    phoneInput.value = director && director.phone
        ? director.phone : "";

    card.appendChild(phoneLabel);
    card.appendChild(phoneInput);

    // Image input
    var imageLabel = document.createElement("label");
    imageLabel.textContent = "Profile Photo";

    var imageInput = document.createElement("input");
    imageInput.type = "file";
    imageInput.name = "image";
    imageInput.accept = ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp";

    card.appendChild(imageLabel);
    card.appendChild(imageInput);

    // Image preview when selecting a new photo
    imageInput.addEventListener("change", function () {

        var file = imageInput.files[0];

        if (!file) {
            return;
        }

        var fileName = file.name.toLowerCase();

        var validFormat =
            fileName.endsWith(".jpg") ||
            fileName.endsWith(".jpeg") ||
            fileName.endsWith(".png") ||
            fileName.endsWith(".webp");

        if (!validFormat) {
            alert("Only JPG, JPEG, PNG and WEBP images are allowed.");
            imageInput.value = "";
            return;
        }

        if (file.size > MAX_DIRECTOR_IMAGE_SIZE) {
            alert("Profile photo must not exceed 2 MB.");
            imageInput.value = "";
            return;
        }

        photo.src = URL.createObjectURL(file);
        photo.alt = "Selected director profile photo";

    });

    // Save button
    var saveButton = document.createElement("button");
    saveButton.type = "button";
    saveButton.className = "btn btn-primary";
    saveButton.textContent = "Save Director";

    saveButton.addEventListener("click", function () {

        saveDirector(
            serial,
            nameInput,
            designationInput,
            phoneInput,
            imageInput,
            saveButton
        );

    });

    // Delete button
    var deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "btn btn-secondary";
    deleteButton.textContent = "Delete Details";

    deleteButton.addEventListener("click", function () {

        deleteDirector(serial, deleteButton);

    });

    var actions = document.createElement("div");
    actions.className = "director-actions";

    actions.appendChild(saveButton);
    actions.appendChild(deleteButton);

    card.appendChild(actions);

    return card;
}


// =======================================
// LOAD ALL 13 DIRECTOR SLOTS
// =======================================

function loadDirectors() {

    if (!directorsGrid) {
        return;
    }

    directorsGrid.textContent = "Loading 13 director slots...";

    fetch("/admin/api/directors", {
        method: "GET"
    })

    .then(function(response) {

        if (!response.ok) {
            throw new Error("Unable to load directors. Please login again.");
        }

        return response.json();

    })

    .then(function(data) {

        if (!data.success) {
            throw new Error(data.message || "Unable to load directors.");
        }

        var directors = data.directors || [];

        directorsGrid.replaceChildren();

        var completedCount = 0;

        // Always display exactly 13 slots
        for (var serial = 1; serial <= 13; serial++) {

            var director = null;

            for (var i = 0; i < directors.length; i++) {

                if (Number(directors[i].serial_number) === serial) {

                    director = directors[i];
                    break;

                }

            }

            if (director && director.full_name) {
                completedCount++;
            }

            var card = createDirectorCard(serial, director);

            directorsGrid.appendChild(card);

        }

        // Update dashboard statistics
        if (statDirectors) {
            statDirectors.textContent = completedCount;
        }

    })

    .catch(function(error) {

        directorsGrid.textContent = error.message;

    });

}


// =======================================
// SAVE OR UPDATE DIRECTOR
// =======================================

function saveDirector(
    serial,
    nameInput,
    designationInput,
    phoneInput,
    imageInput,
    saveButton
) {

    var fullName = nameInput.value.trim();
    var designation = designationInput.value.trim();
    var phone = phoneInput.value.trim();

    if (!fullName || !designation) {
        alert("Please enter the director's name and designation.");
        return;
    }

    if (phone && (!/^\d{10,15}$/.test(phone))) {
        alert("Please enter a valid phone number of 10 to 15 digits.");
        return;
    }

    var image = imageInput.files[0];

    if (image && image.size > MAX_DIRECTOR_IMAGE_SIZE) {
        alert("Profile photo must not exceed 2 MB.");
        return;
    }

    var formData = new FormData();

    formData.append("full_name", fullName);
    formData.append("designation", designation);
    formData.append("phone", phone);

    if (image) {
        formData.append("image", image);
    }

    saveButton.disabled = true;
    saveButton.textContent = "Saving...";

    fetch("/admin/api/directors/" + serial, {

        method: "POST",
        body: formData

    })

    .then(function(response) {

        return response.json().then(function(data) {

            if (!response.ok) {
                throw new Error(data.message || "Unable to save director.");
            }

            return data;

        });

    })

    .then(function(data) {

        if (data.success) {

            showAdminPopup(
                "Director Saved!",
                "Director slot " + serial + " has been saved successfully."
            );

            loadDirectors();

        } else {

            alert(data.message || "Unable to save director.");

        }

    })

    .catch(function(error) {

        alert(error.message);

    })

    .finally(function() {

        saveButton.disabled = false;
        saveButton.textContent = "Save Director";

    });

}


// =======================================
// DELETE DIRECTOR DETAILS
// =======================================

function deleteDirector(serial, deleteButton) {

    var confirmDelete = confirm(
        "Are you sure you want to delete the details of Director Slot " +
        serial + "?"
    );

    if (!confirmDelete) {
        return;
    }

    deleteButton.disabled = true;
    deleteButton.textContent = "Deleting...";

    fetch("/admin/api/directors/" + serial, {

        method: "DELETE"

    })

    .then(function(response) {

        return response.json().then(function(data) {

            if (!response.ok) {
                throw new Error(data.message || "Unable to delete director.");
            }

            return data;

        });

    })

    .then(function(data) {

        if (data.success) {

            showAdminPopup(
                "Director Details Deleted!",
                "Slot " + serial + " is now empty. The 13 fixed slots remain."
            );

            loadDirectors();

        } else {

            alert(data.message || "Unable to delete director.");

        }

    })

    .catch(function(error) {

        alert(error.message);

    })

    .finally(function() {

        deleteButton.disabled = false;
        deleteButton.textContent = "Delete Details";

    });

}


// =======================================
// LOAD DIRECTORS WHEN DASHBOARD OPENS
// =======================================

loadDirectors();




// =================================
// CUSTOM POPUP FUNCTIONS
// =================================

function showCustomPopup(message, title = "Success!") {

    document.getElementById("popupTitle").textContent = title;

    document.getElementById("popupMessage").textContent = message;

    document.getElementById("customPopup").classList.add("show");
}


function closeCustomPopup() {

    document.getElementById("customPopup").classList.remove("show");
}


