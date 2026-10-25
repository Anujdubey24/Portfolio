const menuToggle = document.querySelector("#menu-toggle");
const siteNav = document.querySelector("#site-nav");

menuToggle.addEventListener("click", () => {
  const isOpen = siteNav.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
});

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;

    event.preventDefault();
    siteNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");

    if (window.location.hash !== link.getAttribute("href")) {
      window.history.pushState(null, "", link.getAttribute("href"));
    }

    target.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start"
    });
  });
});

const galleryTrack = document.querySelector("#gallery-track");

document.querySelector("#gallery-prev").addEventListener("click", () => {
  galleryTrack.scrollBy({ left: -Math.round(galleryTrack.clientWidth * 0.82), behavior: "smooth" });
});

document.querySelector("#gallery-next").addEventListener("click", () => {
  galleryTrack.scrollBy({ left: Math.round(galleryTrack.clientWidth * 0.82), behavior: "smooth" });
});

let galleryDrag = null;
let galleryDragged = false;
galleryTrack.addEventListener("pointerdown", (event) => {
  if (event.pointerType !== "mouse" || event.button !== 0) return;
  galleryDrag = { x: event.clientX, y: event.clientY, scrollLeft: galleryTrack.scrollLeft };
  galleryDragged = false;
});
galleryTrack.addEventListener("pointermove", (event) => {
  if (!galleryDrag) return;
  const dx = event.clientX - galleryDrag.x;
  const dy = event.clientY - galleryDrag.y;
  if (Math.abs(dx) > 7 && Math.abs(dx) > Math.abs(dy)) {
    galleryDragged = true;
    galleryTrack.scrollLeft = galleryDrag.scrollLeft - dx;
    event.preventDefault();
  }
});
galleryTrack.addEventListener("pointerup", () => { galleryDrag = null; });
galleryTrack.addEventListener("pointercancel", () => { galleryDrag = null; });
galleryTrack.addEventListener("click", (event) => {
  if (!galleryDragged) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  galleryDragged = false;
}, true);

const navLinks = [...document.querySelectorAll(".site-nav a[href^='#']")];
const navTargets = navLinks.map((link) => ({ link, section: document.querySelector(link.getAttribute("href")) })).filter((item) => item.section);
let navScrollFrame = 0;
function updateCurrentNav() {
  navScrollFrame = 0;
  const marker = 130;
  const current = navTargets.filter(({ section }) => {
    const bounds = section.getBoundingClientRect();
    return bounds.top <= marker && bounds.bottom > marker;
  }).at(-1);
  navTargets.forEach(({ link }) => {
    if (link === current?.link) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
}
window.addEventListener("scroll", () => {
  if (!navScrollFrame) navScrollFrame = window.requestAnimationFrame(updateCurrentNav);
}, { passive: true });
window.addEventListener("resize", updateCurrentNav);
updateCurrentNav();

const certificateCarousel = document.querySelector("#certificate-carousel");
const certificateStage = document.querySelector("#certificate-stage");
const certificateSlides = [...document.querySelectorAll(".certificate-slide")];
let activeCertificate = 0;

function updateCertificateCarousel() {
  const mobile = window.matchMedia("(max-width: 800px)").matches;
  const spacing = certificateStage.clientWidth * (mobile ? 0.29 : 0.245);

  certificateSlides.forEach((slide, index) => {
    let offset = index - activeCertificate;
    if (offset > certificateSlides.length / 2) offset -= certificateSlides.length;
    if (offset < -certificateSlides.length / 2) offset += certificateSlides.length;

    const distance = Math.abs(offset);
    const isActive = distance === 0;
    const isVisible = distance <= 2;
    const selectButton = slide.querySelector(".certificate-select");

    slide.classList.toggle("is-active", isActive);
    slide.classList.toggle("is-hidden", !isVisible);
    slide.style.setProperty("--shift", `${offset * spacing}px`);
    slide.style.setProperty("--scale", isActive ? "1" : distance === 1 ? ".78" : ".62");
    slide.style.setProperty("--tilt", `${offset * -5}deg`);
    slide.style.setProperty("--opacity", isActive ? "1" : distance === 1 ? ".7" : ".42");
    slide.style.setProperty("--layer", String(10 - distance));
    slide.inert = !isVisible;
    selectButton.setAttribute("aria-pressed", String(isActive));
  });
}

function selectCertificate(index) {
  activeCertificate = (index + certificateSlides.length) % certificateSlides.length;
  updateCertificateCarousel();
}

certificateSlides.forEach((slide, index) => {
  slide.querySelector(".certificate-select").addEventListener("click", () => selectCertificate(index));
});
document.querySelector("#certificate-prev").addEventListener("click", () => selectCertificate(activeCertificate - 1));
document.querySelector("#certificate-next").addEventListener("click", () => selectCertificate(activeCertificate + 1));
certificateCarousel.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    selectCertificate(activeCertificate - 1);
  } else if (event.key === "ArrowRight") {
    event.preventDefault();
    selectCertificate(activeCertificate + 1);
  }
});
let certificateDrag = null;
let suppressCertificateClick = false;
certificateStage.addEventListener("pointerdown", (event) => {
  if (event.target.closest(".certificate-open")) return;
  certificateDrag = { x: event.clientX, y: event.clientY, dragged: false };
});
certificateStage.addEventListener("pointermove", (event) => {
  if (!certificateDrag) return;
  const dx = event.clientX - certificateDrag.x;
  const dy = event.clientY - certificateDrag.y;
  if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
    certificateDrag.dragged = true;
    event.preventDefault();
  }
});
certificateStage.addEventListener("pointerup", (event) => {
  if (!certificateDrag) return;
  const dx = event.clientX - certificateDrag.x;
  const didDrag = certificateDrag.dragged && Math.abs(dx) > 45;
  certificateDrag = null;
  if (!didDrag) return;
  selectCertificate(activeCertificate + (dx < 0 ? 1 : -1));
  suppressCertificateClick = true;
  window.setTimeout(() => { suppressCertificateClick = false; }, 0);
});
certificateStage.addEventListener("pointercancel", () => { certificateDrag = null; });
certificateStage.addEventListener("click", (event) => {
  if (!suppressCertificateClick || !event.target.closest(".certificate-select")) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  suppressCertificateClick = false;
}, true);
window.addEventListener("resize", updateCertificateCarousel);
updateCertificateCarousel();

const previewDialog = document.querySelector("#preview-dialog");
const dialogImage = document.querySelector("#dialog-image");
const dialogCaption = document.querySelector("#dialog-caption");

const demoToggle = document.querySelector("#demo-toggle");
const demoCredentialValues = document.querySelectorAll("[data-demo-value]");

demoToggle.addEventListener("click", () => {
  const isVisible = demoToggle.getAttribute("aria-expanded") === "true";
  demoCredentialValues.forEach((value) => {
    value.textContent = isVisible ? "Hidden until shown" : value.dataset.demoValue;
  });
  demoToggle.setAttribute("aria-expanded", String(!isVisible));
  demoToggle.textContent = isVisible ? "Show credentials" : "Hide credentials";
});

document.querySelectorAll(".copy-button[data-copy]").forEach((button) => {
  button.addEventListener("click", async () => {
    const value = button.dataset.copy;
    let copied = false;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        copied = true;
      } else {
        const temporaryField = document.createElement("textarea");
        temporaryField.value = value;
        temporaryField.setAttribute("readonly", "");
        temporaryField.style.position = "fixed";
        temporaryField.style.opacity = "0";
        document.body.append(temporaryField);
        temporaryField.select();
        copied = document.execCommand("copy");
        temporaryField.remove();
      }
    } catch {
      copied = false;
    }

    window.clearTimeout(button.resetTimer);
    button.textContent = copied ? "Copied!" : "Copy failed";
    button.classList.toggle("is-copied", copied);
    button.resetTimer = window.setTimeout(() => {
      button.textContent = "Copy";
      button.classList.remove("is-copied");
    }, 1800);
  });
});

document.querySelectorAll(".preview-trigger").forEach((button) => {
  button.addEventListener("click", () => {
    const image = button.dataset.image;
    const caption = button.dataset.caption;

    dialogImage.src = image;
    dialogImage.alt = caption;
    dialogCaption.textContent = caption;
    previewDialog.showModal();
  });
});

previewDialog.addEventListener("click", (event) => {
  if (event.target === previewDialog) {
    previewDialog.close();
  }
});

previewDialog.addEventListener("close", () => {
  dialogImage.src = "";
});
// Summary: Adds smooth section navigation, interactive screenshot and certificate galleries, image previews, and contact copy controls.
