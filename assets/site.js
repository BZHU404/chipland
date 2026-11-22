(() => {
  "use strict";

  const root = document.documentElement;
  const body = document.body;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobileQuery = window.matchMedia("(max-width: 980px)");

  /* -------------------------------------------------------
     Header state + scroll spy
     ------------------------------------------------------- */

  const header = document.getElementById("siteHeader");
  const sections = Array.from(document.querySelectorAll("main section[id]"));
  const navLinks = Array.from(document.querySelectorAll(".nav-link"));
  const scrollLinks = navLinks.reduce((map, link) => {
    const id = link.getAttribute("href");
    if (id && id.startsWith("#")) map.set(id.slice(1), link);
    return map;
  }, new Map());

  let scrollTicking = false;

  const updateOnScroll = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 20);

    const marker = window.scrollY + window.innerHeight * 0.34;
    let currentId = "";
    sections.forEach((section) => {
      if (section.offsetTop <= marker) currentId = section.id;
    });

    navLinks.forEach((link) => {
      const isActive = Boolean(currentId) && link.getAttribute("href") === `#${currentId}`;
      link.classList.toggle("is-active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    scrollTicking = false;
  };

  const requestScrollUpdate = () => {
    if (!scrollTicking) {
      scrollTicking = true;
      window.requestAnimationFrame(updateOnScroll);
    }
  };

  window.addEventListener("scroll", requestScrollUpdate, { passive: true });
  window.addEventListener("resize", requestScrollUpdate);
  updateOnScroll();

  /* -------------------------------------------------------
     Mobile navigation
     ------------------------------------------------------- */

  const nav = document.getElementById("primaryNav");
  const navToggle = document.querySelector(".nav-toggle");
  const navBackdrop = document.querySelector(".nav-backdrop");

  const setNav = (open, returnFocus = false) => {
    nav.classList.toggle("is-open", open);
    navBackdrop.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");
    body.classList.toggle("nav-open", open);

    if (open) {
      window.setTimeout(() => {
        const firstLink = nav.querySelector(".nav-link");
        if (firstLink) firstLink.focus({ preventScroll: true });
      }, 220);
    } else if (returnFocus) {
      navToggle.focus({ preventScroll: true });
    }
  };

  if (navToggle && nav && navBackdrop) {
    navToggle.addEventListener("click", () => {
      const isOpen = nav.classList.contains("is-open");
      setNav(!isOpen);
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setNav(false, true));
    });

    navBackdrop.addEventListener("click", () => setNav(false, true));

    document.addEventListener("keydown", (event) => {
      if (!nav.classList.contains("is-open")) return;

      if (event.key === "Escape") {
        setNav(false, true);
        return;
      }

      if (event.key !== "Tab") return;

      const focusables = [navToggle, ...nav.querySelectorAll("a[href]")];
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    mobileQuery.addEventListener("change", (event) => {
      if (!event.matches) setNav(false);
    });
  }

  /* -------------------------------------------------------
     Booking modal
     ------------------------------------------------------- */

  const bookingModal = document.getElementById("bookingModal");
  const bookingDialog = bookingModal ? bookingModal.querySelector(".booking-modal__dialog") : null;
  const bookingClose = bookingModal ? bookingModal.querySelector(".booking-modal__close") : null;

  let bookingTrigger = null;

  const getBookingFocusable = () => {
    if (!bookingModal) return [];
    return Array.from(
      bookingModal.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
    ).filter((element) => element.getClientRects().length > 0);
  };

  const openBooking = (trigger) => {
    if (!bookingModal) return;

    bookingTrigger = trigger;
    bookingModal.classList.add("is-open");
    bookingModal.removeAttribute("aria-hidden");
    bookingModal.inert = false;
    body.classList.add("modal-open");

    if (bookingDialog) bookingDialog.scrollTop = 0;

    window.setTimeout(() => {
      if (bookingClose) bookingClose.focus({ preventScroll: true });
    }, 80);
  };

  const closeBooking = () => {
    if (!bookingModal || !bookingModal.classList.contains("is-open")) return;

    bookingModal.classList.remove("is-open");
    bookingModal.setAttribute("aria-hidden", "true");
    body.classList.remove("modal-open");

    let returnTarget = bookingTrigger;
    if (!returnTarget || !returnTarget.getClientRects().length) {
      returnTarget = document.querySelector(".header__cta");
    }
    if (!returnTarget || !returnTarget.getClientRects().length) {
      returnTarget = navToggle;
    }
    if (returnTarget) returnTarget.focus({ preventScroll: true });

    bookingModal.inert = true;
    bookingTrigger = null;
  };

  if (bookingModal) {
    document.querySelectorAll("[data-open-booking]").forEach((trigger) => {
      trigger.setAttribute("aria-haspopup", "dialog");
      trigger.setAttribute("aria-controls", "bookingModal");
      trigger.addEventListener("click", (event) => {
        event.preventDefault();
        openBooking(trigger);
      });
    });

    bookingModal.querySelectorAll("[data-close-booking]").forEach((closer) => {
      closer.addEventListener("click", closeBooking);
    });

    document.addEventListener("keydown", (event) => {
      if (!bookingModal.classList.contains("is-open")) return;

      if (event.key === "Escape") {
        event.preventDefault();
        closeBooking();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = getBookingFocusable();
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  /* -------------------------------------------------------
     Reveal on scroll
     ------------------------------------------------------- */

  const revealElements = Array.from(document.querySelectorAll("[data-reveal]"));

  if (reduceMotion.matches || !("IntersectionObserver" in window)) {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -7% 0px" }
    );

    revealElements.forEach((element) => revealObserver.observe(element));
  }

  /* -------------------------------------------------------
     Hero atmosphere + gentle float
     ------------------------------------------------------- */

  const hero = document.querySelector(".hero");
  const heroVisual = document.querySelector("[data-hero-visual]");
  const finePointer = window.matchMedia("(pointer: fine)");

  if (hero && finePointer.matches && !reduceMotion.matches) {
    let heroFrame = 0;
    let pointerX = 50;
    let pointerY = 30;

    hero.addEventListener(
      "pointermove",
      (event) => {
        const rect = hero.getBoundingClientRect();
        pointerX = ((event.clientX - rect.left) / rect.width) * 100;
        pointerY = ((event.clientY - rect.top) / rect.height) * 100;

        if (!heroFrame) {
          heroFrame = window.requestAnimationFrame(() => {
            hero.style.setProperty("--mx", `${pointerX}%`);
            hero.style.setProperty("--my", `${pointerY}%`);
            heroFrame = 0;
          });
        }
      },
      { passive: true }
    );
  }

  if (heroVisual && finePointer.matches && !reduceMotion.matches) {
    heroVisual.addEventListener(
      "pointermove",
      (event) => {
        const rect = heroVisual.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        heroVisual.style.setProperty("--vx", `${x * 11}px`);
        heroVisual.style.setProperty("--vy", `${y * 9}px`);
      },
      { passive: true }
    );

    heroVisual.addEventListener("pointerleave", () => {
      heroVisual.style.setProperty("--vx", "0px");
      heroVisual.style.setProperty("--vy", "0px");
    });
  }

  /* -------------------------------------------------------
     Copy address / booking text
     ------------------------------------------------------- */

  const toast = document.querySelector(".toast");
  let toastTimer = 0;

  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 3200);
  };

  const copyText = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (error) {
        // Fall through to the legacy selection method.
      }
    }

    const helper = document.createElement("textarea");
    helper.value = text;
    helper.setAttribute("readonly", "");
    helper.style.position = "fixed";
    helper.style.top = "0";
    helper.style.left = "-9999px";
    helper.style.opacity = "0";
    document.body.appendChild(helper);
    helper.select();
    helper.setSelectionRange(0, helper.value.length);

    let copied = false;
    try {
      copied = document.execCommand("copy");
    } catch (error) {
      copied = false;
    }

    helper.remove();
    return copied;
  };

  document.querySelectorAll("[data-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      const text = button.getAttribute("data-copy") || "";
      const successMessage = button.getAttribute("data-copy-message") || "预约暗号已复制，发给店主就能对上暗号。";
      const copied = await copyText(text);
      showToast(
        copied
          ? successMessage
          : "这个浏览器不允许自动复制，请手动复制预约信息。"
      );
    });
  });

  /* -------------------------------------------------------
     Footer year
     ------------------------------------------------------- */

  document.querySelectorAll("[data-year]").forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });
})();
