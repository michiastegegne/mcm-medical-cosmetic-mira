const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const year = document.querySelector("[data-year]");
const bookingForm = document.querySelector("[data-booking-form]");
const summaryOutput = document.querySelector("[data-summary-output]");
const copyBooking = document.querySelector("[data-copy-booking]");

const setHeaderState = () => {
  header.classList.toggle("is-scrolled", document.body.classList.contains("inner-page") || window.scrollY > 12);
};

if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    const isOpen = header.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Menü schliessen" : "Menü öffnen");
  });
}

document.querySelectorAll(".nav a").forEach((link) => {
  link.addEventListener("click", () => {
    header.classList.remove("is-open");
    if (menuToggle) {
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Menü öffnen");
    }
  });
});

window.addEventListener("scroll", setHeaderState, { passive: true });
setHeaderState();

if (year) {
  year.textContent = new Date().getFullYear();
}

const params = new URLSearchParams(window.location.search);
const requestedService = params.get("service");

if (bookingForm && requestedService) {
  const serviceSelect = bookingForm.elements.service;
  const option = Array.from(serviceSelect.options).find((item) => item.text === requestedService);
  if (option) {
    serviceSelect.value = option.text;
  }
}

if (bookingForm && summaryOutput) {
  const dateInput = bookingForm.elements.date;
  const today = new Date();
  today.setDate(today.getDate() + 1);
  dateInput.min = today.toISOString().split("T")[0];

  bookingForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(bookingForm).entries());
    const lines = [
      "Hallo MCM Medical Cosmetic Mira, ich möchte gerne einen Termin anfragen:",
      `Behandlung: ${data.service}`,
      `Wunschdatum: ${data.date}`,
      `Zeitfenster: ${data.time}`,
      `Name: ${data.name}`,
      `Kontakt: ${data.contact}`,
      data.message ? `Nachricht: ${data.message}` : "",
    ].filter(Boolean);
    const message = lines.join("\n");

    localStorage.setItem("mcmBookingRequest", message);
    summaryOutput.textContent = message;
    summaryOutput.classList.add("is-visible");

    bookingForm.querySelector("button[type='submit']").textContent = "Anfrage vorbereitet";
  });
}

if (copyBooking && summaryOutput) {
  copyBooking.addEventListener("click", async () => {
    const message = summaryOutput.textContent || localStorage.getItem("mcmBookingRequest") || "";
    if (!message) return;
    try {
      await navigator.clipboard.writeText(message);
      copyBooking.textContent = "Nachricht kopiert";
    } catch {
      copyBooking.textContent = "Manuell kopieren";
    }
  });
}

if (window.lucide) {
  window.lucide.createIcons();
}
