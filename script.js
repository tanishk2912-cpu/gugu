
"use strict";

// Google Apps Script URL
const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwG83BD-FmjSJo_XmE7oiAIE-lQqXire8-lQD8rMApkkYoPwJFXxqPPoLxmLMJ-28TNQQ/exec";

// Add your Instagram profile URL here later.
const INSTAGRAM_URL = "";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("consultationForm");
  const formMessage = document.getElementById("formMessage");
  const submitButton = form?.querySelector(".submit-button");
  const submitLabel = form?.querySelector(".submit-label");

  const successModal = document.getElementById("successModal");
  const successCard = successModal?.querySelector(".success-card");
  const successClose = document.getElementById("successClose");
  const successOverlay = successModal?.querySelector(".success-overlay");
  const instagramButton = document.getElementById("instagramButton");
  const currentYear = document.getElementById("currentYear");

  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }

  if (!form || !formMessage || !submitButton || !submitLabel) {
    console.error("Consultation form elements were not found.");
    return;
  }

  let isSubmitting = false;

  function showMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;
  }

  function openSuccessPopup() {
    if (!successModal) {
      showMessage(
        "Your consultation form has been submitted successfully.",
        "success"
      );
      return;
    }

    successModal.classList.add("is-open");
    successModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    if (successClose) {
      successClose.focus();
    } else {
      successCard?.focus();
    }
  }

  function closeSuccessPopup() {
    if (!successModal) return;

    successModal.classList.remove("is-open");
    successModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";

    submitButton.focus();
  }

  successClose?.addEventListener("click", closeSuccessPopup);
  successOverlay?.addEventListener("click", closeSuccessPopup);

  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      successModal?.classList.contains("is-open")
    ) {
      closeSuccessPopup();
    }
  });

  if (instagramButton) {
    if (INSTAGRAM_URL.trim()) {
      instagramButton.href = INSTAGRAM_URL;
    } else {
      instagramButton.href = "#";
      instagramButton.removeAttribute("target");
      instagramButton.addEventListener("click", (event) => {
        event.preventDefault();
      });

      const note = instagramButton
        .closest(".instagram-invite")
        ?.querySelector("small");

      if (note) {
        note.textContent = "Our Instagram link will be available here soon.";
      }
    }
  }

  form.addEventListener("submit", async (event) => {
    // Prevent normal form submission and page reload.
    event.preventDefault();
    event.stopPropagation();

    if (isSubmitting) return;

    formMessage.textContent = "";
    formMessage.className = "form-message";

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    if (!GOOGLE_SCRIPT_URL.trim()) {
      showMessage(
        "Form submission is not connected yet. Please try again later.",
        "error"
      );
      return;
    }

    const data = new FormData(form);

    const lead = {
      fullName: String(data.get("fullName") || "").trim(),
      phone: String(data.get("phone") || "").trim(),
      age: String(data.get("age") || "").trim(),
      gender: String(data.get("gender") || "").trim(),
      email: String(data.get("email") || "").trim(),
      city: String(data.get("city") || "").trim(),
      consent: data.get("consent") === "on",
      submittedAt: new Date().toISOString()
    };

    isSubmitting = true;
    submitButton.disabled = true;
    submitLabel.textContent = "Submitting...";

    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(lead)
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const result = await response.json();

      if (result.success !== true) {
        throw new Error(result.message || "Submission was not confirmed.");
      }

      form.reset();
      openSuccessPopup();

    } catch (error) {
      console.error("Consultation form submission failed:", error);

      showMessage(
        "We couldn't confirm your submission. Please check your internet connection and try again. If the problem continues, contact us directly.",
        "error"
      );

    } finally {
      isSubmitting = false;
      submitButton.disabled = false;
      submitLabel.textContent = "Submit Request";
    }
  });
});

/* =====================================
   AAHARDARSHAN THEME SWITCHER
   ===================================== */

(() => {
  const toggle = document.getElementById("themeToggle");

  if (!toggle || toggle.dataset.initialized === "true") {
    return;
  }

  toggle.dataset.initialized = "true";

  const root = document.documentElement;
  const icon = toggle.querySelector(".theme-toggle-icon");
  const label = toggle.querySelector(".theme-toggle-label");

  let savedTheme = null;

  try {
    savedTheme = localStorage.getItem("aahardarshan-theme");
  } catch (error) {
    savedTheme = null;
  }

  const systemPrefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  function applyTheme(theme) {
    const isDark = theme === "dark";

    root.setAttribute("data-theme", isDark ? "dark" : "light");

    toggle.setAttribute("aria-pressed", String(isDark));
    toggle.setAttribute(
      "aria-label",
      isDark ? "Switch to light mode" : "Switch to dark mode"
    );

    if (icon) {
      icon.textContent = isDark ? "☀" : "☾";
    }

    if (label) {
      label.textContent = isDark ? "Light Mode" : "Dark Mode";
    }

    try {
      localStorage.setItem("aahardarshan-theme", isDark ? "dark" : "light");
    } catch (error) {
      /* Theme switching still works without local storage. */
    }
  }

  const initialTheme =
    savedTheme === "dark" || savedTheme === "light"
      ? savedTheme
      : systemPrefersDark
        ? "dark"
        : "light";

  applyTheme(initialTheme);

  toggle.addEventListener("click", () => {
    const currentTheme = root.getAttribute("data-theme");
    applyTheme(currentTheme === "dark" ? "light" : "dark");
  });
})();

/* =====================================
   AAHARDARSHAN TESTIMONIAL VIDEO SLIDER
===================================== */

(() => {
  function initTestimonialSlider() {
    const slider = document.getElementById("testimonialSlider");

    if (!slider || slider.dataset.initialized === "true") return;

    slider.dataset.initialized = "true";

    const slides = Array.from(
      slider.querySelectorAll(".testimonial-slide")
    );

    const dots = Array.from(
      slider.querySelectorAll(".testimonial-dot")
    );

    const prevButton = slider.querySelector(".testimonial-prev");
    const nextButton = slider.querySelector(".testimonial-next");

    if (!slides.length || !prevButton || !nextButton) return;

    let currentIndex = 0;

    function showSlide(index) {
      currentIndex = (index + slides.length) % slides.length;

      slides.forEach((slide, i) => {
        const isActive = i === currentIndex;

        slide.classList.toggle("is-active", isActive);
        slide.setAttribute("aria-hidden", String(!isActive));

        const video = slide.querySelector("video");

        if (video && !isActive) {
          video.pause();
        }
      });

      dots.forEach((dot, i) => {
        const isActive = i === currentIndex;

        dot.classList.toggle("is-active", isActive);
        dot.setAttribute("aria-pressed", String(isActive));
      });
    }

    // Previous video
    prevButton.addEventListener("click", () => {
      showSlide(currentIndex - 1);
    });

    // Next video
    nextButton.addEventListener("click", () => {
      showSlide(currentIndex + 1);
    });

    // Click on indicator dots
    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        showSlide(index);
      });
    });

    // Mobile swipe support
    let touchStartX = 0;
    let touchStartY = 0;

    slider.addEventListener("touchstart", (event) => {
      const touch = event.changedTouches[0];

      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    }, { passive: true });

    slider.addEventListener("touchend", (event) => {
      const touch = event.changedTouches[0];

      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;

      // Ignore vertical scrolling
      if (
        Math.abs(deltaX) > 55 &&
        Math.abs(deltaX) > Math.abs(deltaY)
      ) {
        showSlide(currentIndex + (deltaX < 0 ? 1 : -1));
      }
    }, { passive: true });

    // Show the first video initially
    showSlide(0);
  }

  // Works whether the script loads before or after HTML parsing
  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initTestimonialSlider,
      { once: true }
    );
  } else {
    initTestimonialSlider();
  }
})();

document.addEventListener("DOMContentLoaded", () => {
  const videos = document.querySelectorAll(
    ".founder-video, .testimonial-video, .testimonial-preview"
  );

  if (!videos.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target;

        // Video mostly screen se bahar jaaye to pause
        if (!entry.isIntersecting) {
          video.pause();
        }
      });
    },
    {
      threshold: 0.15
    }
  );

  videos.forEach((video) => {
    observer.observe(video);
  });
});

document.querySelectorAll(".video-wrapper").forEach((wrapper) => {
  const video = wrapper.querySelector("video");
  const playButton = wrapper.querySelector(".video-play");
  const closeButton = wrapper.querySelector(".video-close");

  if (!video || !playButton || !closeButton) return;

  playButton.addEventListener("click", async () => {
    if (video.paused) {
      try {
        await video.play();
      } catch (error) {
        console.warn("Video playback could not start.", error);
      }
    } else {
      video.pause();
    }
  });

  video.addEventListener("play", () => {
    playButton.textContent = "Ⅱ";
    playButton.setAttribute("aria-label", "Pause video");
  });

  video.addEventListener("pause", () => {
    playButton.textContent = "▶";
    playButton.setAttribute("aria-label", "Play video");
  });

  closeButton.addEventListener("click", () => {
    video.pause();

    try {
      video.currentTime = 0;
    } catch (error) {
      // Video metadata abhi available na ho to ignore karein.
    }

    video.load();
    playButton.textContent = "▶";
    playButton.setAttribute("aria-label", "Play video");
  });
});


