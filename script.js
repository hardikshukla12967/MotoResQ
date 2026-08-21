const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);


/* =========================
   BASIC FUNCTIONS
========================= */

function openApp() {
    location.href = "app.html";
}

function now() {
    return new Date().toLocaleString();
}

function toast(t) {
    const x = $("#toast");

    if (!x) return;

    x.textContent = t;
    x.classList.add("show-toast");

    setTimeout(() => {
        x.classList.remove("show-toast");
    }, 2500);
}


/* =========================
   PAGE NAVIGATION
========================= */

function showPage(id) {

    $$(".page").forEach(p => {
        p.classList.remove("active-page");
    });

    const page = $("#" + id);

    if (page) {
        page.classList.add("active-page");
    }

    $$(".tab").forEach(t => {
        t.classList.toggle(
            "active",
            t.dataset.page === id
        );
    });

    const pageTitle = $("#pageTitle");

    if (pageTitle) {
        pageTitle.textContent =
            id === "dashboard"
                ? "Dashboard"
                : id.replace(/^./, c => c.toUpperCase());
    }
}


/* =========================
   TAB CLICK EVENTS
========================= */

$$(".tab").forEach(t => {

    t.onclick = () => {
        showPage(t.dataset.page);
    };

});


/* =========================
   RIDER PROFILE
========================= */

/*
    HTML IDs:
    riderName
    riderPhone
    bloodGroup
    medicalCondition
    allergies
    vehicleNumber
    riderAddress
*/

function getProfile() {

    try {

        return JSON.parse(
            localStorage.getItem("motoresqProfile") || "{}"
        );

    } catch (error) {

        console.error("Profile data error:", error);

        return {};
    }
}


function loadProfile() {

    const p = getProfile();


    const fields = {

        riderName: p.name || "",

        riderPhone: p.phone || "",

        bloodGroup: p.blood || "",

        medicalCondition: p.medical || "",

        allergies: p.allergies || "",

        vehicleNumber: p.vehicle || "",

        riderAddress: p.address || ""

    };


    Object.keys(fields).forEach(id => {

        const element = $("#" + id);

        if (element) {
            element.value = fields[id];
        }

    });


    updateSafetyScore();
}


/* =========================
   SAVE RIDER PROFILE
========================= */

if ($("#profileForm")) {

    $("#profileForm").addEventListener(
        "submit",
        function (e) {

            e.preventDefault();


            const name =
                $("#riderName")?.value.trim() || "";

            const phone =
                $("#riderPhone")?.value.trim() || "";

            const blood =
                $("#bloodGroup")?.value.trim() || "";

            const medical =
                $("#medicalCondition")?.value.trim() || "";

            const allergies =
                $("#allergies")?.value.trim() || "";

            const vehicle =
                $("#vehicleNumber")?.value.trim().toUpperCase() || "";

            const address =
                $("#riderAddress")?.value.trim() || "";


            /* =========================
               VALIDATION
            ========================= */

            if (!name) {

                toast("Please enter your full name");

                $("#riderName")?.focus();

                return;
            }


            if (!phone) {

                toast("Please enter your phone number");

                $("#riderPhone")?.focus();

                return;
            }


            /*
                Accepts Indian numbers such as:
                9876543210
                +919876543210
                09876543210
            */

            const phonePattern =
                /^(\+91[\s-]?)?[6-9]\d{9}$/;


            const cleanPhone =
                phone.replace(/[\s-]/g, "");


            if (!phonePattern.test(cleanPhone)) {

                toast("Please enter a valid Indian phone number");

                $("#riderPhone")?.focus();

                return;
            }


            if (!blood) {

                toast("Please select your blood group");

                $("#bloodGroup")?.focus();

                return;
            }


            if (!vehicle) {

                toast("Please enter your vehicle number");

                $("#vehicleNumber")?.focus();

                return;
            }


            /* =========================
               CREATE PROFILE OBJECT
            ========================= */

            const profile = {

                name: name,

                phone: phone,

                blood: blood,

                medical: medical,

                allergies: allergies,

                vehicle: vehicle,

                address: address,

                updatedAt: now()

            };


            /* =========================
               SAVE TO LOCAL STORAGE
            ========================= */

            localStorage.setItem(
                "motoresqProfile",
                JSON.stringify(profile)
            );


            /* =========================
               UPDATE SAFETY SCORE
            ========================= */

            updateSafetyScore();


            /* =========================
               SUCCESS MESSAGE
            ========================= */

            toast("✅ Rider profile saved successfully");


            /*
                Optional:
                return user to dashboard
                after saving.
            */

            setTimeout(() => {

                showPage("dashboard");

            }, 800);

        }
    );
}


/* =========================
   EMERGENCY CONTACTS
========================= */

function contacts() {

    try {

        const data = JSON.parse(
            localStorage.getItem("motoresqContacts") || "[]"
        );

        return Array.isArray(data) ? data : [];

    } catch (error) {

        return [];
    }
}


function renderContacts() {

    const list = $("#contactList");

    if (!list) return;

    const a = contacts();


    if (a.length) {

        list.innerHTML = a.map((c, i) => `

            <div class="contact">

                <div>

                    <b>${esc(c.name)}</b>

                    <br>

                    <small>
                        ${esc(c.phone)}
                        •
                        ${esc(c.relation)}
                    </small>

                </div>


                <button
                    type="button"
                    class="delete"
                    onclick="removeContact(${i})"
                >
                    Delete
                </button>

            </div>

        `).join("");

    } else {

        list.innerHTML =
            '<p class="muted">No emergency contacts added yet.</p>';

    }


    updateSafetyScore();
}


function removeContact(i) {

    const a = contacts();


    if (i < 0 || i >= a.length) {
        return;
    }


    a.splice(i, 1);


    localStorage.setItem(
        "motoresqContacts",
        JSON.stringify(a)
    );


    renderContacts();

    updateSafetyScore();

    toast("Contact removed");
}


/* =========================
   ADD EMERGENCY CONTACT
========================= */

if ($("#contactForm")) {

    $("#contactForm").addEventListener(
        "submit",
        function (e) {

            e.preventDefault();


            const name =
                $("#contactName");

            const phone =
                $("#contactPhone");

            const relation =
                $("#contactRelation");


            if (!name || !phone || !relation) {

                toast("Contact fields not found");

                return;
            }


            if (
                !name.value.trim() ||
                !phone.value.trim() ||
                !relation.value.trim()
            ) {

                toast("Please fill all contact fields");

                return;
            }


            const a = contacts();


            a.push({

                name: name.value.trim(),

                phone: phone.value.trim(),

                relation: relation.value.trim()

            });


            localStorage.setItem(
                "motoresqContacts",
                JSON.stringify(a)
            );


            e.target.reset();


            renderContacts();

            updateSafetyScore();


            toast("✅ Emergency contact added");

        }
    );
}


/* =========================
   HTML ESCAPE
========================= */

function esc(s) {

    return String(s).replace(
        /[&<>"]/g,
        m => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;"
        }[m])
    );
}


/* =========================
   ACCIDENT HISTORY
========================= */

function history() {

    try {

        const data = JSON.parse(
            localStorage.getItem("motoresqHistory") || "[]"
        );

        return Array.isArray(data) ? data : [];

    } catch (error) {

        return [];
    }
}


function renderHistory() {

    const h = $("#historyList");

    if (!h) return;

    const a = history();


    if (a.length) {

        h.innerHTML = a.map(x => `

            <div class="history-item">

                <div>

                    <b>${esc(x.status)}</b>

                    <br>

                    <small class="muted">
                        ${esc(x.time)}
                    </small>

                </div>


                <span class="muted">
                    ${esc(x.location)}
                </span>

            </div>

        `).join("");

    } else {

        h.innerHTML =
            '<p class="muted">No alerts yet. Try "Simulate Accident" from the dashboard.</p>';

    }
}


/* =========================
   ACCIDENT SIMULATION
========================= */

let interval = null;


function simulateAccident() {

    const modal = $("#modal");

    if (!modal) return;


    modal.classList.remove("hidden");


    let time = 30;


    const modalContent =
        $("#modalContent");


    if (!modalContent) return;


    modalContent.innerHTML = `

        <div class="sos-icon">
            🚨
        </div>

        <p class="eyebrow">
            POSSIBLE ACCIDENT DETECTED
        </p>

        <h2>
            Are you okay?
        </h2>

        <p class="muted">
            Demo countdown. Cancel to stop the simulated alert.
        </p>

        <div class="timer" id="timer">
            30
        </div>

        <button
            class="cancel"
            onclick="cancelAlert()"
        >
            Cancel Alert
        </button>

    `;


    clearInterval(interval);


    interval = setInterval(() => {

        time--;


        const timer =
            $("#timer");


        if (timer) {
            timer.textContent = time;
        }


        if (time <= 0) {

            clearInterval(interval);

            sendAlert();

        }

    }, 1000);
}


function closeModal() {

    clearInterval(interval);


    const modal =
        $("#modal");


    if (modal) {
        modal.classList.add("hidden");
    }
}


function cancelAlert() {

    clearInterval(interval);


    addHistory("Alert Cancelled");


    closeModal();


    const safeText =
        $("#safeText");


    if (safeText) {
        safeText.textContent =
            "YOU ARE SAFE";
    }


    toast("Alert cancelled");
}


function sendAlert() {

    addHistory("SOS Alert Sent");


    const modalContent =
        $("#modalContent");


    if (modalContent) {

        modalContent.innerHTML = `

            <div class="sos-icon">
                📡
            </div>

            <p class="eyebrow">
                DEMO COMPLETE
            </p>

            <h2>
                SOS Alert Prepared
            </h2>

            <p class="muted">
                In Phase 1, no real SMS or call is sent.
                A future backend/hardware phase would handle
                emergency delivery.
            </p>

            <button
                class="primary"
                onclick="closeModal()"
            >
                Close
            </button>

        `;
    }


    const safeText =
        $("#safeText");


    if (safeText) {

        safeText.textContent =
            "SOS DEMO COMPLETED";

    }
}


function addHistory(status) {

    const a = history();


    a.unshift({

        status: status,

        time: now(),

        location:
            "Demo location • 26.8467° N, 80.9462° E"

    });


    localStorage.setItem(
        "motoresqHistory",
        JSON.stringify(a)
    );


    renderHistory();
}


/* =========================
   CLOCK
========================= */

function clock() {

    const c = $("#clock");


    if (c) {

        c.textContent =
            new Date().toLocaleString();

    }
}


setInterval(clock, 1000);


/* =========================
   SAFETY SCORE
========================= */

/*

    Rider Profile       = 40 points
    Emergency Contact   = 40 points
    Vehicle Information = 20 points

    Maximum = 100

*/

function updateSafetyScore() {

    const profile =
        getProfile();


    const contactList =
        contacts();


    let score = 0;


    /* =========================
       PROFILE CHECK
    ========================= */

    const profileCompleted =
        Boolean(
            profile.name &&
            profile.phone &&
            profile.blood
        );


    const profileCheck =
        $("#profileCheck");


    if (profileCompleted) {

        score += 40;


        if (profileCheck) {
            profileCheck.textContent = "✅";
        }

    } else {

        if (profileCheck) {
            profileCheck.textContent = "❌";
        }
    }


    /* =========================
       CONTACT CHECK
    ========================= */

    const contactAdded =
        Array.isArray(contactList) &&
        contactList.length > 0;


    const contactCheck =
        $("#contactCheck");


    if (contactAdded) {

        score += 40;


        if (contactCheck) {
            contactCheck.textContent = "✅";
        }

    } else {

        if (contactCheck) {
            contactCheck.textContent = "❌";
        }
    }


    /* =========================
       VEHICLE CHECK
    ========================= */

    const vehicleAdded =
        Boolean(profile.vehicle);


    const vehicleCheck =
        $("#vehicleCheck");


    if (vehicleAdded) {

        score += 20;


        if (vehicleCheck) {
            vehicleCheck.textContent = "✅";
        }

    } else {

        if (vehicleCheck) {
            vehicleCheck.textContent = "❌";
        }
    }


    /* =========================
       SCORE NUMBER
    ========================= */

    const scoreElement =
        $("#safetyScore");


    if (scoreElement) {

        scoreElement.textContent =
            score;

    }


    /* =========================
       PROGRESS BAR
    ========================= */

    const progressElement =
        $("#safetyProgress");


    if (progressElement) {

        progressElement.style.width =
            score + "%";


        progressElement.setAttribute(
            "aria-valuenow",
            score
        );

    }


    /* =========================
       SCORE STATUS
    ========================= */

    const scoreStatus =
        $("#safetyStatus");


    if (scoreStatus) {

        if (score === 100) {

            scoreStatus.textContent =
                "Excellent — your safety profile is complete.";

        } else if (score >= 80) {

            scoreStatus.textContent =
                "Very good — complete your remaining safety information.";

        } else if (score >= 40) {

            scoreStatus.textContent =
                "Good start — add the remaining safety information.";

        } else {

            scoreStatus.textContent =
                "Complete your profile and emergency contacts to improve your score.";

        }

    }
}


/* =========================
   INITIALIZE APP
========================= */

function initializeApp() {

    clock();

    loadProfile();

    renderContacts();

    renderHistory();

    updateSafetyScore();

}


if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        initializeApp
    );

} else {

    initializeApp();

}
