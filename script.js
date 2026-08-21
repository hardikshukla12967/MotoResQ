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

    const title = $("#pageTitle");

    if (title) {
        title.textContent =
            id === "dashboard"
                ? "Dashboard"
                : id.replace(/^./, c => c.toUpperCase());
    }
}


/* =========================
   TAB CLICK
========================= */

$$(".tab").forEach(t => {
    t.onclick = () => {
        showPage(t.dataset.page);
    };
});


/* =========================
   PROFILE
========================= */

function loadProfile() {

    let p = JSON.parse(
        localStorage.getItem("motoresqProfile") || "{}"
    );

    [
        "name",
        "blood",
        "medical",
        "allergies",
        "vehicle"
    ].forEach(k => {

        const element = $("#" + k);

        if (element) {
            element.value = p[k] || "";
        }

    });
}


/* =========================
   SAVE PROFILE
========================= */

if ($("#profileForm")) {

    $("#profileForm").onsubmit = e => {

        e.preventDefault();

        let p = {};

        [
            "name",
            "blood",
            "medical",
            "allergies",
            "vehicle"
        ].forEach(k => {

            const element = $("#" + k);

            p[k] = element
                ? element.value.trim()
                : "";

        });

        localStorage.setItem(
            "motoresqProfile",
            JSON.stringify(p)
        );

        // Update safety score immediately
        updateSafetyScore();

        toast("Profile saved locally");
    };
}


/* =========================
   EMERGENCY CONTACTS
========================= */

function contacts() {

    return JSON.parse(
        localStorage.getItem("motoresqContacts") || "[]"
    );
}


/* =========================
   RENDER CONTACTS
========================= */

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
                    class="delete"
                    onclick="removeContact(${i})"
                >
                    Delete
                </button>

            </div>

        `).join("");

    } else {

        list.innerHTML = `
            <p class="muted">
                No emergency contacts added yet.
            </p>
        `;
    }
}


/* =========================
   ESCAPE HTML
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
   REMOVE CONTACT
========================= */

function removeContact(i) {

    let a = contacts();

    a.splice(i, 1);

    localStorage.setItem(
        "motoresqContacts",
        JSON.stringify(a)
    );

    renderContacts();

    // Update safety score immediately
    updateSafetyScore();

    toast("Contact removed");
}


/* =========================
   ADD CONTACT
========================= */

if ($("#contactForm")) {

    $("#contactForm").onsubmit = e => {

        e.preventDefault();

        let a = contacts();

        const name = $("#contactName");
        const phone = $("#contactPhone");
        const relation = $("#contactRelation");

        a.push({

            name: name ? name.value.trim() : "",

            phone: phone ? phone.value.trim() : "",

            relation: relation
                ? relation.value.trim()
                : ""

        });

        localStorage.setItem(
            "motoresqContacts",
            JSON.stringify(a)
        );

        e.target.reset();

        renderContacts();

        // Update safety score immediately
        updateSafetyScore();

        toast("Emergency contact added");
    };
}


/* =========================
   ACCIDENT HISTORY
========================= */

function history() {

    return JSON.parse(
        localStorage.getItem("motoresqHistory") || "[]"
    );
}


/* =========================
   RENDER HISTORY
========================= */

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

        h.innerHTML = `
            <p class="muted">
                No alerts yet. Try "Simulate Accident"
                from the dashboard.
            </p>
        `;
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

    const content = $("#modalContent");

    if (!content) return;

    content.innerHTML = `

        <div class="sos-icon">🚨</div>

        <p class="eyebrow">
            POSSIBLE ACCIDENT DETECTED
        </p>

        <h2>
            Are you okay?
        </h2>

        <p class="muted">
            Demo countdown. Cancel to stop
            the simulated alert.
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

        const timer = $("#timer");

        if (timer) {
            timer.textContent = time;
        }

        if (time <= 0) {

            clearInterval(interval);

            sendAlert();
        }

    }, 1000);
}


/* =========================
   CLOSE MODAL
========================= */

function closeModal() {

    clearInterval(interval);

    const modal = $("#modal");

    if (modal) {
        modal.classList.add("hidden");
    }
}


/* =========================
   CANCEL ALERT
========================= */

function cancelAlert() {

    clearInterval(interval);

    addHistory("Alert Cancelled");

    closeModal();

    const safeText = $("#safeText");

    if (safeText) {
        safeText.textContent = "YOU ARE SAFE";
    }

    toast("Alert cancelled");
}


/* =========================
   SEND DEMO ALERT
========================= */

function sendAlert() {

    addHistory("SOS Alert Sent");

    const content = $("#modalContent");

    if (content) {

        content.innerHTML = `

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
                A future backend/hardware phase would
                handle emergency delivery.
            </p>

            <button
                class="primary"
                onclick="closeModal()"
            >
                Close
            </button>

        `;
    }

    const safeText = $("#safeText");

    if (safeText) {
        safeText.textContent = "SOS DEMO COMPLETED";
    }
}


/* =========================
   ADD HISTORY
========================= */

function addHistory(status) {

    let a = history();

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
        c.textContent = new Date().toLocaleString();
    }
}

setInterval(clock, 1000);

clock();


/* =====================================================
   SAFETY SCORE SYSTEM
===================================================== */

function updateSafetyScore() {

    /* -------------------------
       GET PROFILE
    ------------------------- */

    const profile = JSON.parse(
        localStorage.getItem("motoresqProfile") || "{}"
    );


    /* -------------------------
       GET CONTACTS
    ------------------------- */

    const emergencyContacts = JSON.parse(
        localStorage.getItem("motoresqContacts") || "[]"
    );


    /* -------------------------
       INITIAL SCORE
    ------------------------- */

    let score = 0;


    /* =================================================
       PROFILE CHECK
       Name + Blood Group = 40 points
    ================================================= */

    const profileCompleted =
        Boolean(
            profile.name &&
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


    /* =================================================
       EMERGENCY CONTACT CHECK
       At least 1 contact = 40 points
    ================================================= */

    const contactAdded =
        emergencyContacts.length > 0;


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


    /* =================================================
       VEHICLE CHECK
       Vehicle details = 20 points
    ================================================= */

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


    /* =================================================
       UPDATE SCORE NUMBER
    ================================================= */

    const scoreElement =
        $("#safetyScore");


    if (scoreElement) {

        scoreElement.textContent =
            score;
    }


    /* =================================================
       UPDATE PROGRESS BAR
    ================================================= */

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


    /* =================================================
       UPDATE SAFETY STATUS
    ================================================= */

    const statusElement =
        $("#safetyStatus");


    if (statusElement) {

        if (score === 100) {

            statusElement.textContent =
                "Excellent Safety Setup";

        } else if (score >= 80) {

            statusElement.textContent =
                "Very Good Safety Setup";

        } else if (score >= 60) {

            statusElement.textContent =
                "Good Safety Setup";

        } else if (score >= 40) {

            statusElement.textContent =
                "Basic Safety Setup";

        } else {

            statusElement.textContent =
                "Safety Setup Incomplete";
        }
    }
}


/* =====================================================
   INITIALIZE APPLICATION
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadProfile();

        renderContacts();

        renderHistory();

        updateSafetyScore();

        clock();
    }
);
