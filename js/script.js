(function () {
  document.documentElement.classList.add("js");

  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector("#site-nav");
  const year = document.querySelector("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  if (header) {
    const solid = header.classList.contains("is-solid");
    let ticking = false;
    const update = () => {
      ticking = false;
      if (solid) return;
      header.classList.toggle("is-scrolled", window.scrollY > 24);
    };
    window.addEventListener("scroll", () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }, { passive: true });
    update();
  }

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
      });
    });
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const reveals = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach((el) => io.observe(el));
  }

  // Play muted looping videos when they enter the viewport; pause when they leave.
  const clips = document.querySelectorAll("video[data-auto]");
  const playClip = (video) => {
    if (reduceMotion) return;
    const run = () => video.play().catch(() => {});
    if (video.readyState >= 2) run();
    else video.addEventListener("canplay", run, { once: true });
  };
  if (reduceMotion) {
    clips.forEach((v) => { v.pause(); v.removeAttribute("autoplay"); });
  } else if ("IntersectionObserver" in window) {
    const vio = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const v = entry.target;
        if (entry.isIntersecting) playClip(v);
        else v.pause();
      });
    }, { threshold: 0.2 });
    clips.forEach((v) => vio.observe(v));
  } else {
    clips.forEach(playClip);
  }

  // Gallery lightbox
  const lightbox = document.getElementById("lightbox");
  const lbStage = lightbox ? lightbox.querySelector("[data-lb-stage]") : null;
  const lbCap = lightbox ? lightbox.querySelector("[data-lb-cap]") : null;
  const shots = Array.from(document.querySelectorAll("[data-gallery]"));
  let lbIndex = 0;

  const paintLightbox = (i) => {
    if (!lightbox || !shots.length) return;
    lbIndex = (i + shots.length) % shots.length;
    const shot = shots[lbIndex];
    const src = shot.getAttribute("data-full") || shot.getAttribute("data-src");
    const type = shot.getAttribute("data-type") || "image";
    const cap = shot.getAttribute("data-caption") || "";
    lbStage.replaceChildren();
    if (type === "video") {
      const v = document.createElement("video");
      v.src = src;
      v.controls = true;
      v.autoplay = !reduceMotion;
      v.playsInline = true;
      v.loop = true;
      v.muted = true;
      lbStage.appendChild(v);
    } else {
      const img = document.createElement("img");
      img.src = src;
      img.alt = cap;
      lbStage.appendChild(img);
    }
    if (lbCap) lbCap.textContent = cap;
  };

  const openLightbox = (i) => {
    if (!lightbox || typeof lightbox.showModal !== "function") return;
    paintLightbox(i);
    if (!lightbox.open) lightbox.showModal();
  };

  shots.forEach((shot, i) => {
    shot.addEventListener("click", () => openLightbox(i));
    shot.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openLightbox(i);
      }
    });
  });

  if (lightbox) {
    lightbox.querySelectorAll("[data-lb]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const action = btn.getAttribute("data-lb");
        if (action === "close") lightbox.close();
        if (action === "prev") paintLightbox(lbIndex - 1);
        if (action === "next") paintLightbox(lbIndex + 1);
      });
    });
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) lightbox.close();
    });
    document.addEventListener("keydown", (e) => {
      if (!lightbox.open) return;
      if (e.key === "ArrowLeft") paintLightbox(lbIndex - 1);
      if (e.key === "ArrowRight") paintLightbox(lbIndex + 1);
    });
  }

  // Quote form
  const form = document.querySelector("#quote-form");
  const dateInput = form ? form.querySelector('input[name="date"]') : null;
  const todayLocal = () => {
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  };
  const checkDate = () => {
    if (!dateInput) return true;
    const min = todayLocal();
    dateInput.min = min;
    const past = dateInput.value && dateInput.value < min;
    dateInput.setCustomValidity(past ? "Pick today or a later date. Past dates can’t be booked." : "");
    return !past;
  };
  if (dateInput) {
    checkDate();
    dateInput.addEventListener("focus", checkDate);
    dateInput.addEventListener("input", checkDate);
    dateInput.addEventListener("change", checkDate);
    dateInput.addEventListener("click", () => {
      checkDate();
      if (typeof dateInput.showPicker === "function") {
        try { dateInput.showPicker(); } catch (err) { /* native control still works */ }
      }
    });
  }

  const GUEST_MIN = 50;
  const guestInput = form ? form.querySelector('input[name="guests"]') : null;
  const guestDialog = document.getElementById("guest-dialog");
  let guestAcked = null;
  let guestMode = "field";
  const guestsLow = () => {
    if (!guestInput || guestInput.value === "") return false;
    const n = Number(guestInput.value);
    return Number.isFinite(n) && n > 0 && n < GUEST_MIN;
  };
  const openGuestDialog = (mode) => {
    if (!guestDialog || typeof guestDialog.showModal !== "function") return false;
    guestMode = mode;
    guestDialog.querySelector('[data-guest="go"]').textContent = mode === "submit" ? "Send anyway" : "Keep it";
    if (!guestDialog.open) guestDialog.showModal();
    guestDialog.querySelector('[data-guest="change"]').focus();
    return true;
  };
  if (guestDialog && guestInput) {
    guestDialog.addEventListener("click", (e) => {
      const b = e.target.closest("[data-guest]");
      if (!b) return;
      if (b.dataset.guest === "change") guestDialog.close("change");
      else {
        guestAcked = guestInput.value;
        guestDialog.close("go");
      }
    });
    guestDialog.addEventListener("close", () => {
      if (guestDialog.returnValue === "go" && guestMode === "submit") {
        guestDialog.returnValue = "";
        if (typeof form.requestSubmit === "function") form.requestSubmit();
        else form.dispatchEvent(new Event("submit", { cancelable: true }));
        return;
      }
      guestDialog.returnValue = "";
      guestInput.focus();
      if (guestInput.select) guestInput.select();
    });
    guestInput.addEventListener("change", () => {
      if (guestsLow() && guestInput.value !== guestAcked) openGuestDialog("field");
    });
  }

  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const note = form.querySelector(".form-note");
      const btn = form.querySelector('button[type="submit"]');
      const show = (msg) => { if (note) { note.hidden = false; note.textContent = msg; } };
      if (!checkDate()) show(dateInput.validationMessage);
      if (!form.checkValidity()) { form.reportValidity(); return; }
      if (guestsLow() && guestInput.value !== guestAcked && openGuestDialog("submit")) return;
      btn.disabled = true;
      show("Sending…");
      try {
        const res = await fetch("https://formsubmit.co/ajax/desisoundguys@gmail.com", {
          method: "POST",
          headers: { Accept: "application/json" },
          body: new FormData(form),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || String(data.success) === "false") throw new Error(data.message || "failed");
        form.reset();
        guestAcked = null;
        show("Got it. We’ll be in touch soon.");
      } catch (err) {
        show("Couldn’t send right now. Email desisoundguys@gmail.com or call (206) 388-8696.");
      } finally {
        btn.disabled = false;
      }
    });
  }
})();
