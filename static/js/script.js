/* =====================================================
   ANISH SOUHARDA COOPERATIVE BANK
   MAIN WEBSITE JAVASCRIPT
   ===================================================== */


/* ================= MOBILE NAVIGATION ================= */

function toggleMenu() {
    const navbar = document.querySelector(".navbar");

    if (navbar) {
        navbar.classList.toggle("active");
    }
}


/* ================= EMI CALCULATOR ================= */

function calculateEMI() {

    const amount = Number(
        document.getElementById("loanAmount").value.replace(/,/g, "")
    );

    const rate = Number(
        document.getElementById("interestRate").value
    );

    const years = Number(
        document.getElementById("loanYears").value
    );

    if (amount <= 0 || rate <= 0 || years <= 0) {
        alert("Please enter valid loan details.");
        return;
    }

    const monthlyRate = rate / 12 / 100;
    const months = years * 12;

    let emi;

    if (monthlyRate === 0) {
        emi = amount / months;
    } else {
        emi =
            (amount * monthlyRate *
            Math.pow(1 + monthlyRate, months)) /
            (Math.pow(1 + monthlyRate, months) - 1);
    }

    document.getElementById("emiResult").textContent =
        "₹" + Math.round(emi).toLocaleString("en-IN");
}


function resetCalculator() {

    document.getElementById("loanAmount").value = "";
    document.getElementById("interestRate").value = "";
    document.getElementById("loanYears").value = "";

    document.getElementById("emiResult").textContent = "₹0";
}


/* ================= LOAN AMOUNT FORMATTING ================= */

document.addEventListener("DOMContentLoaded", function () {

    const loanAmount = document.getElementById("loanAmount");

    if (loanAmount) {

        loanAmount.addEventListener("input", function () {

            let value = this.value.replace(/,/g, "");

            value = value.replace(/\D/g, "");

            if (value === "") {
                this.value = "";
                return;
            }

            this.value = Number(value).toLocaleString("en-IN");

        });

    }

});


/* ================= FAQ ================= */

function toggleFAQ(button) {

    const item = button.parentElement;

    item.classList.toggle("active");

}


/* ================= BANK IMAGE SLIDER ================= */

let slideIndex = 1;


function changeSlide(n) {
    showSlide(slideIndex += n);
}


function currentSlide(n) {
    showSlide(slideIndex = n);
}


function showSlide(n) {

    const slides = document.getElementsByClassName("slide");
    const dots = document.getElementsByClassName("dot");

    if (slides.length === 0) {
        return;
    }

    if (n > slides.length) {
        slideIndex = 1;
    }

    if (n < 1) {
        slideIndex = slides.length;
    }

    for (let i = 0; i < slides.length; i++) {
        slides[i].classList.remove("active");
    }

    for (let i = 0; i < dots.length; i++) {
        dots[i].classList.remove("active");
    }

    slides[slideIndex - 1].classList.add("active");

    if (dots.length >= slideIndex) {
        dots[slideIndex - 1].classList.add("active");
    }

}


/* ================= AUTOMATIC IMAGE SLIDER ================= */

document.addEventListener("DOMContentLoaded", function () {

    if (document.getElementsByClassName("slide").length > 0) {

        showSlide(slideIndex);

        setInterval(function () {
            changeSlide(1);
        }, 4000);

    }

});


/* =====================================================
   CO-OP ASSIST CHATBOT
   ===================================================== */


/* ================= TOGGLE CHAT ================= */

function toggleChat() {

    const chatbot = document.getElementById("chatbotBox");

    if (!chatbot) {
        return;
    }

    if (chatbot.style.display === "flex") {
        chatbot.style.display = "none";
    } else {
        chatbot.style.display = "flex";
    }

}


/* ================= ASK CHATBOT QUESTION ================= */

function askQuestion(type) {

    const messages = document.getElementById("chatMessages");

    if (!messages) {
        return;
    }

    let question = "";
    let answer = "";


    if (type === "fd") {

        question = "What is an FD?";

        answer =
            "FD (Fixed Deposit) is a savings option where you deposit a fixed amount for a specific period. The bank pays interest on the deposited amount.";

    }

    else if (type === "rd") {

        question = "What is an RD?";

        answer =
            "RD (Recurring Deposit) allows you to deposit a fixed amount regularly, usually every month, for a selected period and earn interest on your savings.";

    }

    else if (type === "emi") {

        question = "How does EMI work?";

        answer =
            "EMI (Equated Monthly Instalment) is the fixed amount you pay every month towards a loan. It generally includes both the principal amount and interest.";

    }

    else if (type === "documents") {

        question = "What documents are required for a loan?";

        answer =
            "Commonly required documents may include Aadhaar Card, PAN Card, address proof, income proof, bank statements and photographs. Requirements may vary depending on the loan type.";

    }

    else if (type === "hours") {

        question = "What are the banking hours?";

        answer =
            "Our regular banking hours are during the bank's working schedule. Please contact the branch for the latest working hours and holiday information.";

    }

    else if (type === "contact") {

        question = "How can I contact the bank?";

        answer =
            "You can contact Anish Souharda Cooperative Bank through the Contact Us section of our website or visit our Dharwad branch.";

    }

    else if (type === "accounts") {

        question = "What types of accounts are available?";

        answer =
            "The bank may offer Savings Accounts, Current Accounts, Fixed Deposits and Recurring Deposits. Please contact the bank for account-specific details.";

    }

    else if (type === "loan") {

        question = "How do I apply for a loan?";

        answer =
            "Choose the suitable loan type, check the eligibility requirements, prepare the required documents and contact the bank or visit the branch to submit your loan application.";

    }

    else if (type === "fraud") {

        question = "What should I do if I suspect fraud?";

        answer =
            "If you suspect fraudulent activity, immediately contact the bank through an official contact channel. Do not share your OTP, PIN, password or banking credentials with anyone.";

    }

    else {
        return;
    }


    const userMessage = document.createElement("div");

    userMessage.className = "user-message";
    userMessage.textContent = question;

    messages.appendChild(userMessage);

    messages.scrollTop = messages.scrollHeight;


    const typingMessage = document.createElement("div");

    typingMessage.className = "bot-message";
    typingMessage.textContent = "...";

    messages.appendChild(typingMessage);

    messages.scrollTop = messages.scrollHeight;


    setTimeout(function () {

        typingMessage.textContent = answer;

        messages.scrollTop = messages.scrollHeight;

    }, 3000);

}


/* ================= LOAD SAVED LANGUAGE ================= */

document.addEventListener("DOMContentLoaded", function () {

    const savedLanguage = localStorage.getItem("selectedLanguage");

    const languageSelect = document.getElementById("languageSelect");

    if (savedLanguage === "kn") {

        if (languageSelect) {
            languageSelect.value = "kn";
        }

        if (typeof changeLanguage === "function") {
            changeLanguage("kn");
        }

    }

});


/* ================= OTHERS DROPDOWN ================= */

function toggleOthersMenu() {

    const menu = document.getElementById("othersMenu");

    if (menu) {
        menu.classList.toggle("show");
    }

}


document.addEventListener("click", function (event) {

    const dropdown = document.querySelector(".others-dropdown");
    const menu = document.getElementById("othersMenu");

    if (dropdown && menu && !dropdown.contains(event.target)) {
        menu.classList.remove("show");
    }

});


/* =====================================================
   SMART LOAN ELIGIBILITY CHECKER
   ===================================================== */

function checkLoanEligibility() {

    const age = Number(document.getElementById("loanAge").value);

    const income = Number(document.getElementById("monthlyIncome").value);

    const employment = document.getElementById("employmentType").value;

    const requiredLoan = Number(document.getElementById("requiredLoan").value);

    const tenure = Number(document.getElementById("loanTenure").value);


    if (
        age <= 0 ||
        income <= 0 ||
        employment === "" ||
        requiredLoan <= 0 ||
        tenure <= 0
    ) {

        alert("Please fill all the details.");

        return;
    }


    if (age < 18 || age > 70) {

        alert("Please enter a valid age between 18 and 70.");

        return;
    }


    const annualRate = 10;
    const monthlyRate = annualRate / 12 / 100;

    const maximumEMI = income * 0.40;

    const eligibleLoan =
        maximumEMI *
        (
            (Math.pow(1 + monthlyRate, tenure) - 1) /
            (monthlyRate * Math.pow(1 + monthlyRate, tenure))
        );


    const finalEligibleAmount =
        Math.round(eligibleLoan / 1000) * 1000;


    const emi =
        requiredLoan *
        monthlyRate *
        Math.pow(1 + monthlyRate, tenure) /
        (Math.pow(1 + monthlyRate, tenure) - 1);


    const finalEMI = Math.round(emi);


    let status;

    if (finalEligibleAmount >= requiredLoan) {
        status = "Suitable";
    }

    else if (finalEligibleAmount >= requiredLoan * 0.75) {
        status = "May Be Suitable";
    }

    else {
        status = "Not Suitable";
    }


    document.getElementById("eligibleAmount").innerText =
        "₹" + finalEligibleAmount.toLocaleString("en-IN");


    document.getElementById("estimatedEMI").innerText =
        "₹" + finalEMI.toLocaleString("en-IN") + "/month";


    document.getElementById("eligibilityStatus").innerText = status;

    document.getElementById("loanResult").style.display = "block";

}


/* ================= GOOGLE TRANSLATE ================= */

function googleTranslateElementInit() {

    new google.translate.TranslateElement(
        {
            pageLanguage: "en",
            includedLanguages: "en,kn",
            layout: google.translate.TranslateElement.InlineLayout.SIMPLE
        },
        "google_translate_element"
    );

}


/* ================= PRODUCT EMI CALCULATOR ================= */

function calculateProductEMI() {

    if (
        selectedProduct === "save" ||
        selectedProduct === "invest" ||
        selectedProduct === "monthly"
    ) {

        document.getElementById("productMessage").innerHTML =
            "EMI calculator is mainly available for loan products.";

        return;
    }


    const amount = prompt("Enter loan amount:");

    if (!amount) {
        return;
    }


    const rate = prompt("Enter annual interest rate (%):");

    if (!rate) {
        return;
    }


    const years = prompt("Enter loan period in years:");

    if (!years) {
        return;
    }


    const principal = parseFloat(amount.replace(/,/g, ""));
    const monthlyRate = parseFloat(rate) / 12 / 100;
    const months = parseInt(years) * 12;


    if (
        principal <= 0 ||
        monthlyRate <= 0 ||
        months <= 0 ||
        isNaN(principal) ||
        isNaN(monthlyRate) ||
        isNaN(months)
    ) {

        alert("Please enter valid loan details.");

        return;
    }


    const emi =
        (principal * monthlyRate *
        Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1);


    document.getElementById("productMessage").innerHTML =
        "<strong>Estimated Monthly EMI:</strong> ₹" +
        emi.toFixed(2);

}


/* ================= CONTACT BANK ================= */

function contactBank() {

    window.location.href = "index4.html#contact";

}


/* =====================================================
   PAGE ANIMATIONS AND MENU INITIALIZATION
   ===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    const detailsPage = document.querySelector(".details-page");

    if (detailsPage) {

        detailsPage.style.opacity = "0";

        setTimeout(function () {

            detailsPage.style.transition = "opacity 0.6s ease";
            detailsPage.style.opacity = "1";

        }, 100);

    }


    const infoCards = document.querySelectorAll(".info-card");

    infoCards.forEach(function (card, index) {

        card.style.opacity = "0";
        card.style.transform = "translateY(20px)";

        setTimeout(function () {

            card.style.transition =
                "opacity 0.5s ease, transform 0.5s ease";

            card.style.opacity = "1";
            card.style.transform = "translateY(0)";

        }, 150 + (index * 100));

    });


    document.body.classList.add("investment-page-loaded");
    document.body.classList.add("vehicle-loan-page-loaded");
    document.body.classList.add("education-loan-page-loaded");
    document.body.classList.add("home-loan-page-loaded");

});


/* =====================================================
   INVESTMENT PAGE
   ===================================================== */

const investmentOptions = {

    fixedDeposit: {
        title: "Fixed Deposit",
        description:
            "Fixed Deposit allows you to invest a lump sum amount for a selected period and earn applicable interest on your investment."
    },

    recurringDeposit: {
        title: "Recurring Deposit",
        description:
            "Recurring Deposit allows you to save a fixed amount regularly and build a fund for your future financial requirements."
    },

    seniorCitizen: {
        title: "Senior Citizen Investment",
        description:
            "Investment options for senior citizens can help support financial planning and provide a structured approach to managing savings."
    },

    longTerm: {
        title: "Long-Term Investment",
        description:
            "Long-term investment planning helps customers prepare for important future goals through disciplined financial planning."
    },

    goalBased: {
        title: "Goal-Based Investment",
        description:
            "Goal-based investment planning helps customers save according to specific objectives such as education, home purchase or retirement."
    }

};


function showInvestmentMessage(option) {

    const investment = investmentOptions[option];

    if (!investment) {
        return;
    }

    alert(investment.title + "\n\n" + investment.description);

}


/* =====================================================
   VEHICLE LOAN PAGE
   ===================================================== */

const vehicleLoanOptions = {

    twoWheeler: {
        title: "Two-Wheeler Loan",
        description:
            "A two-wheeler loan can help eligible customers purchase a new bike or scooter according to applicable bank terms."
    },

    carLoan: {
        title: "Car Loan",
        description:
            "A car loan helps eligible customers finance the purchase of a suitable car and repay the approved amount through regular instalments."
    },

    commercialVehicle: {
        title: "Commercial Vehicle Loan",
        description:
            "Commercial vehicle finance may help eligible business owners or customers purchase vehicles for approved commercial purposes."
    },

    emi: {
        title: "Vehicle Loan EMI",
        description:
            "Vehicle loan EMI depends on the loan amount, applicable interest rate and repayment period selected for the loan."
    },

    eligibility: {
        title: "Vehicle Loan Eligibility",
        description:
            "Eligibility depends on factors such as income, repayment capacity, documents and the bank's prevailing loan policies."
    }

};


function showVehicleLoanMessage(option) {

    const vehicleLoan = vehicleLoanOptions[option];

    if (!vehicleLoan) {
        return;
    }

    alert(vehicleLoan.title + "\n\n" + vehicleLoan.description);

}


/* =====================================================
   EDUCATION LOAN PAGE
   ===================================================== */

const educationLoanOptions = {

    higherEducation: {
        title: "Higher Education Loan",
        description:
            "Education loan facilities can help eligible students meet approved expenses for higher education and professional courses."
    },

    professionalCourse: {
        title: "Professional Course Loan",
        description:
            "Eligible students pursuing professional or specialized courses may apply for financial assistance according to the bank's applicable rules."
    },

    tuitionFees: {
        title: "Tuition Fee Support",
        description:
            "An education loan may help eligible students manage approved tuition and academic fees."
    },

    hostelExpenses: {
        title: "Hostel and Accommodation",
        description:
            "Eligible hostel or accommodation expenses may be considered as part of education financing according to applicable bank policies."
    },

    eligibility: {
        title: "Education Loan Eligibility",
        description:
            "Eligibility depends on factors such as the student's course, institution, admission details, documents and the bank's prevailing policies."
    }

};


function showEducationLoanMessage(option) {

    const educationLoan = educationLoanOptions[option];

    if (!educationLoan) {
        return;
    }

    alert(educationLoan.title + "\n\n" + educationLoan.description);

}


/* =====================================================
   HOME LOAN PAGE
   ===================================================== */

const homeLoanOptions = {

    propertyPurchase: {
        title: "Home Purchase Loan",
        description:
            "A home purchase loan can help eligible customers finance the purchase of a suitable residential property according to applicable bank terms."
    },

    homeConstruction: {
        title: "Home Construction Loan",
        description:
            "Eligible customers may receive financial assistance for construction of a residential house, subject to the bank's requirements."
    },

    homeImprovement: {
        title: "Home Improvement Loan",
        description:
            "Home improvement finance may help eligible customers meet approved renovation or improvement expenses according to applicable policies."
    },

    homeLoanEmi: {
        title: "Home Loan EMI",
        description:
            "Home loan EMI depends on factors such as the approved loan amount, applicable interest rate and repayment period."
    },

    eligibility: {
        title: "Home Loan Eligibility",
        description:
            "Eligibility depends on factors such as income, repayment capacity, property details, documents and the bank's prevailing policies."
    }

};


function showHomeLoanMessage(option) {

    const homeLoan = homeLoanOptions[option];

    if (!homeLoan) {
        return;
    }

    alert(homeLoan.title + "\n\n" + homeLoan.description);

}



/* =====================================================
   SMART WEBSITE SEARCH
   ===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    const searchToggle = document.getElementById("searchToggle");
    const searchBox = document.getElementById("searchBox");
    const searchInput = document.getElementById("searchInput");
    const searchResults = document.getElementById("searchResults");


    if (!searchToggle || !searchBox || !searchInput || !searchResults) {
        return;
    }


    const searchData = [

        {
            name: "Home Loan",
            keywords: "home loan house property housing",
            target: "loans"
        },

        {
            name: "Education Loan",
            keywords: "education loan student college university studies study",
            target: "loans"
        },

        {
            name: "Vehicle Loan",
            keywords: "vehicle loan car bike automobile transport",
            target: "loans"
        },

        {
            name: "EMI Calculator",
            keywords: "emi calculator loan monthly payment interest",
            target: "emi-calculator"
        },

        {
            name: "Loan Documents",
            keywords: "loan documents required documents papers",
            target: "loans"
        },

        {
            name: "Loan Eligibility",
            keywords: "loan eligibility qualification criteria eligible",
            target: "loan-eligibility"
        },

        {
            name: "Savings Account",
            keywords: "savings account saving account deposit money",
            target: "services"
        },

        {
            name: "Current Account",
            keywords: "current account business account banking",
            target: "services"
        },

        {
            name: "Internet Banking",
            keywords: "internet banking online banking digital banking",
            target: "services"
        },

        {
            name: "Account Statements",
            keywords: "account statement bank statement transaction statement account details",
            target: "services"
        },

        {
            name: "Money Transfer",
            keywords: "money transfer fund transfer send money payment transfer",
            target: "services"
        },

        {
            name: "Customer Support",
            keywords: "customer support help assistance complaint query contact service",
            target: "services"
        }

    ];


    searchToggle.addEventListener("click", function (event) {

        event.stopPropagation();

        searchBox.classList.toggle("active");

        if (searchBox.classList.contains("active")) {
            searchInput.focus();
        }

    });


    searchInput.addEventListener("input", function () {

        const searchTerm = searchInput.value.toLowerCase().trim();

        searchResults.innerHTML = "";

        if (searchTerm === "") {
            return;
        }


        const results = searchData.filter(function (item) {

            return (
                item.name.toLowerCase().includes(searchTerm) ||
                item.keywords.toLowerCase().includes(searchTerm)
            );

        });


        if (results.length === 0) {

            searchResults.innerHTML = `
                <div class="no-results">
                    No banking service found.
                </div>
            `;

            return;
        }


        results.forEach(function (item) {

            const resultItem = document.createElement("div");

            resultItem.className = "search-result-item";


            const icon = document.createElement("i");

            icon.className = "fa-solid fa-arrow-right";

            const text = document.createElement("span");

            text.textContent = item.name;

            resultItem.appendChild(icon);
            resultItem.appendChild(text);


            resultItem.addEventListener("click", function () {

                const targetSection = document.getElementById(item.target);

                if (targetSection) {

                    targetSection.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                    searchBox.classList.remove("active");

                    searchInput.value = "";

                    searchResults.innerHTML = "";

                } else {

                    console.error(
                        "Search target not found: #" + item.target
                    );

                }

            });


            searchResults.appendChild(resultItem);

        });

    });


    document.addEventListener("click", function (event) {

        if (!event.target.closest(".smart-search")) {
            searchBox.classList.remove("active");
        }

    });


    searchInput.addEventListener("keydown", function (event) {

        if (event.key === "Enter") {

            const firstResult =
                searchResults.querySelector(".search-result-item");

            if (firstResult) {
                firstResult.click();
            }

        }

    });

});


/* =====================================================
   BANK INTRO SCREEN
   ===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    const bankIntro = document.getElementById("bankIntro");
    const enterBankBtn = document.getElementById("enterBankBtn");

    if (!bankIntro) {
        return;
    }


    const urlParams = new URLSearchParams(window.location.search);

    const fromPage = urlParams.get("from");


    if (fromPage === "page") {

        bankIntro.style.display = "none";

        document.body.classList.remove("intro-active");

        return;
    }


    document.body.classList.add("intro-active");


    if (enterBankBtn) {

        enterBankBtn.addEventListener("click", function () {

            bankIntro.classList.add("hide-intro");

            document.body.classList.remove("intro-active");

        });

    }


    setTimeout(function () {

        bankIntro.classList.add("hide-intro");

        document.body.classList.remove("intro-active");

    }, 6000);

});


/* =====================================================
   IMPORTANT BANKING LINKS
   ===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    const bankLinkCards = document.querySelectorAll(
        ".bank-links-grid .bank-link-card"
    );


    bankLinkCards.forEach(function (card) {

        card.addEventListener("mouseenter", function () {
            this.style.animationPlayState = "paused";
        });

        card.addEventListener("mouseleave", function () {
            this.style.animationPlayState = "running";
        });

        card.addEventListener("focus", function () {
            this.style.animationPlayState = "paused";
        });

        card.addEventListener("blur", function () {
            this.style.animationPlayState = "running";
        });

    });

});


/* =====================================================
   PUBLIC BANK NOTIFICATIONS
   ===================================================== */

function loadPublicNotifications() {

    const container = document.getElementById("notificationContainer");

    if (!container) {
        return;
    }


    fetch("/api/header-notifications")

        .then(function (response) {

            if (!response.ok) {
                throw new Error("Unable to fetch notifications.");
            }

            return response.json();

        })

        .then(function (data) {

            container.innerHTML = "";


            if (
                !data.success ||
                !Array.isArray(data.notifications) ||
                data.notifications.length === 0
            ) {

                container.innerHTML =
                    "<p>No new notifications available.</p>";

                return;
            }


            data.notifications.forEach(function (notice) {

                const card = document.createElement("div");

                card.className = "notification-card";


                /* Notification title */

                const title = document.createElement("h3");

                title.textContent = notice.title || "Bank Notification";


                /* Notification message */

                const message = document.createElement("p");

                message.textContent = notice.message || "";


                card.appendChild(title);

                card.appendChild(message);


                /* Uploaded PDF link and preview */

                if (notice.pdf_url) {

                    const pdfLink = document.createElement("a");

                    pdfLink.href = notice.pdf_url;

                    pdfLink.textContent = "View PDF in New Tab";

                    pdfLink.target = "_blank";

                    pdfLink.rel = "noopener noreferrer";

                    card.appendChild(pdfLink);


                    const pdfPreview = document.createElement("iframe");

                    pdfPreview.src = notice.pdf_url;

                    pdfPreview.title = "Bank Notification PDF";

                    pdfPreview.loading = "lazy";

                    pdfPreview.className = "notification-pdf-preview";

                    card.appendChild(pdfPreview);

                }


                /* Optional notification link */

                if (notice.link_url) {

                    const noticeLink = document.createElement("a");

                    noticeLink.href = notice.link_url;

                    noticeLink.textContent = "Read More";

                    noticeLink.target = "_blank";

                    noticeLink.rel = "noopener noreferrer";

                    noticeLink.className = "notification-read-more";

                    card.appendChild(noticeLink);

                }


                container.appendChild(card);

            });

        })

        .catch(function (error) {

            console.error("Notification error:", error);

            container.innerHTML =
                "<p>Unable to load notifications. Please try again later.</p>";

        });

}


/* Load notifications when homepage opens */

document.addEventListener("DOMContentLoaded", function () {

    loadPublicNotifications();

});


/* =====================================================
   SMOOTH SCROLLING
   ===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    document.querySelectorAll('a[href^="#"]').forEach(function (link) {

        link.addEventListener("click", function (event) {

            const targetId = this.getAttribute("href");

            if (targetId === "#") {
                return;
            }

            const target = document.querySelector(targetId);

            if (target) {

                event.preventDefault();

                target.scrollIntoView({
                    behavior: "smooth"
                });

            }

        });

    });

});




