const modal = document.getElementById("appointmentModal");
const openButtons = document.querySelectorAll(".open-modal-btn");
const closeButton = document.getElementById("closeModal");
const cancelButton = document.getElementById("cancelModal");
const form = document.getElementById("appointmentForm");

const toast = document.getElementById("toast");
const toastTitle = document.getElementById("toastTitle");
const toastMessage = document.getElementById("toastMessage");
const toastClose = document.getElementById("toastClose");

const WEBHOOK_URL =
  "https://random12345.app.n8n.cloud/webhook/appointment-form";

let toastTimer = null;

/* ===========================
   Modal Functions
=========================== */

function openModal() {
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
}

/* ===========================
   Toast Functions
=========================== */

function hideToast() {
  toast.classList.remove("show");

  if (toastTimer) {
    clearTimeout(toastTimer);
    toastTimer = null;
  }
}

function showToast(type, title, message) {
  if (toastTimer) {
    clearTimeout(toastTimer);
  }

  toast.classList.remove("success", "error");

  toast.classList.add(type);

  toastTitle.textContent = title;
  toastMessage.textContent = message;

  // Force browser reflow so animation always works
  void toast.offsetWidth;

  toast.classList.add("show");

  toastTimer = setTimeout(() => {
    hideToast();
  }, 5000);
}

toastClose.addEventListener("click", hideToast);

/* ===========================
   Event Listeners
=========================== */

openButtons.forEach((button) => {
  button.addEventListener("click", openModal);
});

closeButton.addEventListener("click", closeModal);
cancelButton.addEventListener("click", closeModal);

modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeModal();
  }
});

/* ===========================
   Form Submission
=========================== */

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const data = new FormData(form);

  const payload = {
    name: data.get("name"),
    email: data.get("email"),
    contactInfo: data.get("contact") || "",
    appointmentDate: data.get("appointmentDate"),
    problemDescription: data.get("problem"),
    timeSlot: data.get("timeSlot")
  };

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    form.reset();

    closeModal();

    showToast(
      "success",
      "Appointment Request Submitted",
      `Thank you, ${payload.name}! Your appointment request has been received successfully. A confirmation email containing your appointment details will be sent to ${payload.email} shortly.`
    );
  } catch (error) {
    console.error("Appointment submission error:", error);

    showToast(
      "error",
      "Appointment Request Failed",
      "We couldn't submit your appointment request. Please try again later."
    );
  }
});