const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const year = document.querySelector("[data-year]");
const bookingForm = document.querySelector("[data-booking-form]");
const summaryOutput = document.querySelector("[data-summary-output]");
const copyBooking = document.querySelector("[data-copy-booking]");
const progressBar = document.createElement("div");
const floatingCta = document.createElement("a");

progressBar.className = "scroll-progress";
progressBar.setAttribute("aria-hidden", "true");
document.body.append(progressBar);

floatingCta.className = "floating-cta";
floatingCta.href = "buchen.html";
floatingCta.innerHTML = '<i data-lucide="calendar-check" aria-hidden="true"></i><span>Termin</span>';
if (!window.location.pathname.endsWith("buchen.html")) {
  document.body.append(floatingCta);
}

const setHeaderState = () => {
  header.classList.toggle("is-scrolled", document.body.classList.contains("inner-page") || window.scrollY > 12);
};

const setScrollProgress = () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
  progressBar.style.transform = `scaleX(${Math.min(Math.max(progress, 0), 1)})`;
  floatingCta.classList.toggle("is-visible", floatingCta.isConnected && window.scrollY > 420);
};

if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    const isOpen = header.classList.toggle("is-open");
    document.body.classList.toggle("no-scroll", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Menü schliessen" : "Menü öffnen");
  });
}

document.querySelectorAll(".nav a").forEach((link) => {
  link.addEventListener("click", () => {
    header.classList.remove("is-open");
    document.body.classList.remove("no-scroll");
    if (menuToggle) {
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Menü öffnen");
    }
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  header.classList.remove("is-open");
  document.body.classList.remove("no-scroll");
  if (menuToggle) {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Menü öffnen");
  }
});

window.addEventListener("scroll", setHeaderState, { passive: true });
window.addEventListener("scroll", setScrollProgress, { passive: true });
setHeaderState();
setScrollProgress();

const revealItems = document.querySelectorAll(
  ".band, .link-grid, .service-card, .feature-link, .detail-card, .price-row, .testimonial, .contact-item, .booking, .booking-form, .booking-summary, .map-band",
);

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-revealed");
        revealObserver.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.12 },
  );

  revealItems.forEach((item, index) => {
    item.classList.add("reveal");
    item.style.setProperty("--reveal-delay", `${Math.min(index % 4, 3) * 70}ms`);
    revealObserver.observe(item);
  });
} else {
  revealItems.forEach((item) => item.classList.add("is-revealed"));
}

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

  const buildBookingMessage = () => {
    const data = Object.fromEntries(new FormData(bookingForm).entries());
    const lines = [
      "Hallo MCM Medical Cosmetic Mira, ich möchte gerne einen Termin anfragen:",
      data.service ? `Behandlung: ${data.service}` : "Behandlung: noch offen",
      data.date ? `Wunschdatum: ${data.date}` : "Wunschdatum: noch offen",
      data.time ? `Zeitfenster: ${data.time}` : "Zeitfenster: noch offen",
      data.name ? `Name: ${data.name}` : "Name: noch offen",
      data.contact ? `Kontakt: ${data.contact}` : "Kontakt: noch offen",
      data.message ? `Nachricht: ${data.message}` : "",
    ].filter(Boolean);
    return lines.join("\n");
  };

  const updateBookingPreview = () => {
    const message = buildBookingMessage();
    summaryOutput.textContent = message;
    summaryOutput.classList.add("is-visible");
    return message;
  };

  bookingForm.addEventListener("input", updateBookingPreview);
  bookingForm.addEventListener("change", updateBookingPreview);
  updateBookingPreview();

  bookingForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const message = updateBookingPreview();
    localStorage.setItem("mcmBookingRequest", message);

    const submitButton = bookingForm.querySelector("button[type='submit']");
    submitButton.classList.add("is-complete");
    submitButton.innerHTML = '<i data-lucide="check" aria-hidden="true"></i>Anfrage vorbereitet';
    if (window.lucide) {
      window.lucide.createIcons();
    }
  });
}

if (copyBooking && summaryOutput) {
  copyBooking.addEventListener("click", async () => {
    const message = summaryOutput.textContent || localStorage.getItem("mcmBookingRequest") || "";
    if (!message) return;
    try {
      await navigator.clipboard.writeText(message);
      copyBooking.innerHTML = '<i data-lucide="check" aria-hidden="true"></i>Nachricht kopiert';
    } catch {
      copyBooking.textContent = "Manuell kopieren";
    }
    if (window.lucide) {
      window.lucide.createIcons();
    }
  });
}

if (window.lucide) {
  window.lucide.createIcons();
}
