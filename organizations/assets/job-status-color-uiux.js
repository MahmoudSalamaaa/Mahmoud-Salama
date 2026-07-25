(() => {
  "use strict";

  const STORE = {
    apps: "career_apps_v4",
    availability: "career_availability_overrides_v4"
  };

  const CARD_SELECTOR = [
    ".record-card",
    ".new-job-card",
    ".lifestyle-job-card",
    ".job-card",
    ".opportunity-card"
  ].join(",");

  const TERMINAL_APPLICATION = new Set([
    "rejected", "withdrawn", "not suitable", "not available"
  ]);

  const PROGRESS_APPLICATION = new Set([
    "shortlisted", "applied", "interview"
  ]);

  const SAVED_APPLICATION = new Set([
    "saved", "interested"
  ]);

  function readJSON(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value ?? fallback;
    } catch {
      return fallback;
    }
  }

  function normalize(value) {
    return String(value ?? "").trim().toLowerCase();
  }

  function toneFor(availability, application) {
    const av = normalize(availability);
    const ap = normalize(application);

    // Application progress has the strongest immediate meaning for the user.
    if (ap === "offer") return "offer";
    if (PROGRESS_APPLICATION.has(ap)) return "progress";
    if (ap === "follow-up") return "attention";
    if (TERMINAL_APPLICATION.has(ap)) return "unavailable";
    if (SAVED_APPLICATION.has(ap)) return "progress";
    if (ap === "ignored") return "neutral";

    // Otherwise use the source/job availability.
    if (
      av === "available" ||
      av === "career page available" ||
      av === "live search" ||
      av.startsWith("active ")
    ) return "available";

    if (
      av === "possibly available" ||
      av === "deadline approaching"
    ) return "attention";

    if (
      av === "expired" ||
      av === "not available" ||
      av === "inactive" ||
      av === "broken link"
    ) return "unavailable";

    return "neutral";
  }

  function recordIdFrom(element) {
    if (!element) return "";
    const statusHost = element.querySelector("[data-status-record]");
    const availabilitySelect = element.querySelector("[data-availability]");
    const applicationSelect = element.querySelector("[data-application]");
    const staticHost = element.querySelector("[data-static-job-id]");

    return String(
      statusHost?.dataset.statusRecord ||
      availabilitySelect?.dataset.availability ||
      applicationSelect?.dataset.application ||
      staticHost?.dataset.staticJobId ||
      element.dataset.recordId ||
      element.dataset.id ||
      ""
    );
  }

  function valuesFor(element) {
    const id = recordIdFrom(element);
    const availabilityStore = readJSON(STORE.availability, {});
    const applicationStore = readJSON(STORE.apps, {});

    const availabilitySelect = element.querySelector("[data-availability]");
    const applicationSelect = element.querySelector("[data-application]");

    const visibleAvailability =
      availabilitySelect?.value ||
      element.querySelector(".badge.good,.badge.warn,.badge.bad")?.textContent?.trim() ||
      "";

    const visibleApplication =
      applicationSelect?.value ||
      "";

    const availability =
      visibleAvailability ||
      availabilityStore[id] ||
      "Not Verified";

    const application =
      visibleApplication ||
      applicationStore[id]?.status ||
      "Not Reviewed";

    return { id, availability, application };
  }

  function setSelectTone(select, tone) {
    if (!select) return;
    select.dataset.statusTone = tone;
  }

  function ensureSummary(card, availability, application, tone) {
    let summary = card.querySelector(":scope > .uiux-status-summary");

    if (!summary) {
      summary = document.createElement("div");
      summary.className = "uiux-status-summary";
      summary.setAttribute("role", "status");
      summary.setAttribute("aria-live", "polite");

      const badges = card.querySelector(":scope > .badges");
      const heading = card.querySelector(":scope > h1,:scope > h2,:scope > h3");

      if (badges) {
        badges.insertAdjacentElement("afterend", summary);
      } else if (heading) {
        heading.insertAdjacentElement("beforebegin", summary);
      } else {
        card.prepend(summary);
      }
    }

    summary.dataset.statusTone = tone;
    const desiredHTML =
      `<span class="uiux-status-main">Availability: ${escapeHTML(availability)}</span>` +
      `<span class="uiux-status-application">Application: ${escapeHTML(application)}</span>`;

    // Avoid mutation-observer feedback loops during asynchronous card rendering.
    if (summary.innerHTML !== desiredHTML) summary.innerHTML = desiredHTML;

    const desiredTitle =
      `Availability: ${availability}. Application status: ${application}.`;
    if (summary.title !== desiredTitle) summary.title = desiredTitle;
  }

  function decorateCard(card) {
    if (!(card instanceof Element)) return;

    const { availability, application } = valuesFor(card);
    const tone = toneFor(availability, application);

    card.dataset.statusTone = tone;
    card.setAttribute(
      "aria-label",
      `${card.querySelector("h1,h2,h3")?.textContent?.trim() || "Job"}; ` +
      `availability ${availability}; application ${application}`
    );

    setSelectTone(card.querySelector("[data-availability]"), toneFor(availability, ""));
    setSelectTone(card.querySelector("[data-application]"), toneFor("", application));
    ensureSummary(card, availability, application, tone);
  }

  function decorateRow(row) {
    if (!(row instanceof HTMLTableRowElement)) return;

    const availabilitySelect = row.querySelector("[data-availability]");
    const applicationSelect = row.querySelector("[data-application]");
    if (!availabilitySelect && !applicationSelect) return;

    const availability = availabilitySelect?.value || "Not Verified";
    const application = applicationSelect?.value || "Not Reviewed";
    const tone = toneFor(availability, application);

    row.dataset.statusTone = tone;
    setSelectTone(availabilitySelect, toneFor(availability, ""));
    setSelectTone(applicationSelect, toneFor("", application));
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);
  }

  function isJobPage() {
    const body = document.body;
    const file = location.pathname.split("/").pop().toLowerCase();
    const title = document.title.toLowerCase();

    return (
      body.dataset.navActive === "jobs" ||
      body.dataset.page === "listing" && /job|vacanc|opportunit/.test(title) ||
      /job|vacanc|opportunit|canonical/.test(file) ||
      document.querySelector(CARD_SELECTOR + ",[data-status-record],[data-static-job-id]")
    );
  }

  function insertLegend() {
    if (!isJobPage() || document.querySelector(".status-color-legend")) return;

    const legend = document.createElement("section");
    legend.className = "status-color-legend";
    legend.setAttribute("aria-label", "Job status color guide");
    legend.innerHTML = `
      <div class="status-color-legend__head">
        <div>
          <strong>Job status color guide</strong>
          <small>Cards update immediately when Availability or Application status changes.</small>
        </div>
      </div>
      <div class="status-color-legend__items">
        <span class="status-color-legend__item" data-status-tone="available">Available / open</span>
        <span class="status-color-legend__item" data-status-tone="progress">Application in progress</span>
        <span class="status-color-legend__item" data-status-tone="attention">Action needed / deadline</span>
        <span class="status-color-legend__item" data-status-tone="unavailable">Unavailable / closed</span>
        <span class="status-color-legend__item" data-status-tone="neutral">Not reviewed / unverified</span>
      </div>
      <p class="status-color-legend__note">
        Each color is paired with a written label for accessibility and accurate interpretation.
      </p>
    `;

    const anchor =
      document.querySelector(".listing-layout") ||
      document.querySelector(".live-controls") ||
      document.querySelector(".directory-section") ||
      document.querySelector(".toolbar") ||
      document.querySelector("main");

    if (!anchor) return;

    if (anchor.matches(".listing-layout,.live-controls,.directory-section")) {
      anchor.insertAdjacentElement("beforebegin", legend);
    } else if (anchor.matches(".toolbar")) {
      anchor.insertAdjacentElement("afterend", legend);
    } else {
      anchor.prepend(legend);
    }
  }

  let scheduled = false;

  function decorateAll() {
    scheduled = false;
    document.querySelectorAll(CARD_SELECTOR).forEach(decorateCard);
    document.querySelectorAll(".data-table tbody tr").forEach(decorateRow);

    // Canonical/static cards may receive controls after the page script runs.
    document.querySelectorAll("[data-static-job-id]").forEach(host => {
      const card = host.closest(CARD_SELECTOR);
      if (card) decorateCard(card);
    });

    insertLegend();
  }

  function scheduleDecorate() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(decorateAll);
  }

  document.addEventListener("change", event => {
    if (
      event.target.matches?.(
        "[data-availability],[data-application],.availability-select,.application-select"
      )
    ) {
      scheduleDecorate();
      setTimeout(scheduleDecorate, 40);
    }
  });

  window.addEventListener("career-status-changed", scheduleDecorate);
  window.addEventListener("storage", event => {
    if (event.key === STORE.apps || event.key === STORE.availability) {
      scheduleDecorate();
    }
  });

  const observer = new MutationObserver(mutations => {
    if (mutations.some(mutation => mutation.addedNodes.length)) {
      scheduleDecorate();
    }
  });

  function start() {
    observer.observe(document.body, { childList: true, subtree: true });
    decorateAll();
    setTimeout(decorateAll, 250);
    setTimeout(decorateAll, 900);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
