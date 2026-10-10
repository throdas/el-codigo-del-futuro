/* Configuración de eventos y animaciones para El Código del Futuro. */
(function () {
  const cfg = window.ECF_CONFIG || {};
  const pixelId = (cfg.metaPixelId || "").trim();

  // Inicializa Meta Pixel solo si se añade un ID real en config.js.
  if (pixelId && !window.fbq) {
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
    (window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', pixelId);
    window.fbq('track', 'PageView');
  }

  const checkoutUrl = (cfg.checkoutUrl || "").trim();
  const whatsappNumber = (cfg.whatsappNumber || "").replace(/\D/g, "");
  const whatsappMessage = encodeURIComponent(cfg.whatsappMessage || "Hola, quiero información para comprar mi entrada a El Código del Futuro en Bogotá.");
  // Prioridad: enlace directo (wa.link) → número con wa.me → vacío.
  const whatsappHref = (cfg.whatsappUrl || "").trim() || (whatsappNumber ? `https://wa.me/${whatsappNumber}?text=${whatsappMessage}` : "");
  const mapsUrl = (cfg.mapsUrl || "").trim();
  const checkoutButton = document.getElementById("checkout-button");
  const whatsappButton = document.getElementById("whatsapp-button");
  const mapsLink = document.getElementById("maps-link");

  if (checkoutButton && checkoutUrl) {
    checkoutButton.href = checkoutUrl;
    checkoutButton.target = "_blank";
    checkoutButton.rel = "noopener";
  } else if (checkoutButton) {
    checkoutButton.href = "#contacto-pendiente";
    checkoutButton.addEventListener("click", (event) => {
      event.preventDefault();
      if (whatsappHref) {
        window.open(whatsappHref, "_blank", "noopener");
      } else {
        alert("El enlace de compra aún debe configurarse. Contacta a la organización para recibir asistencia.");
      }
    });
  }
  if (whatsappButton && whatsappHref) {
    whatsappButton.href = whatsappHref;
    whatsappButton.target = "_blank";
    whatsappButton.rel = "noopener";
  }
  if (mapsLink && mapsUrl) mapsLink.href = mapsUrl;

  // Countdown to the event start: 18 Oct 2026, 8:00 a. m. in Bogotá (UTC-5).
  const countdownNodes = {
    days: document.getElementById("countdown-days"),
    hours: document.getElementById("countdown-hours"),
    minutes: document.getElementById("countdown-minutes"),
    seconds: document.getElementById("countdown-seconds")
  };
  const eventDate = new Date("2026-10-18T08:00:00-05:00").getTime();
  const updateCountdown = () => {
    const remaining = Math.max(0, eventDate - Date.now());
    const totalSeconds = Math.floor(remaining / 1000);
    const values = {
      days: Math.floor(totalSeconds / 86400),
      hours: Math.floor((totalSeconds % 86400) / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: totalSeconds % 60
    };
    Object.entries(values).forEach(([key, value]) => {
      if (countdownNodes[key]) countdownNodes[key].textContent = String(value).padStart(2, "0");
    });
    if (remaining <= 0) {
      const label = document.querySelector(".event-countdown>p");
      if (label) label.textContent = "EL EVENTO HA COMENZADO";
    }
  };
  updateCountdown();
  window.setInterval(updateCountdown, 1000);


  // Phase pricing: Phase 1 ends on the configured deadline; afterwards the page switches to Phase 2 automatically.
  const phase1Deadline = new Date(cfg.phase1Deadline || "2026-10-12T00:00:00-05:00").getTime();
  const phase1Price = cfg.phase1Price || "97";
  const phase2Price = cfg.phase2Price || "109";
  const phaseNodes = {
    hours: document.getElementById("phase-hours"),
    minutes: document.getElementById("phase-minutes"),
    seconds: document.getElementById("phase-seconds")
  };
  let currentPhase = 0;
  const applyPhase = (phase) => {
    if (phase === currentPhase) return;
    currentPhase = phase;
    document.body.classList.toggle("phase-2", phase === 2);
    document.querySelectorAll("[data-phase]").forEach((el) => {
      el.hidden = el.getAttribute("data-phase") !== String(phase);
    });
    document.querySelectorAll("[data-price]").forEach((el) => {
      el.textContent = phase === 2 ? phase2Price : phase1Price;
    });
  };
  const updatePhase = () => {
    const remaining = Math.max(0, phase1Deadline - Date.now());
    applyPhase(remaining > 0 ? 1 : 2);
    if (remaining > 0) {
      const totalSeconds = Math.floor(remaining / 1000);
      const v = {
        hours: Math.floor(totalSeconds / 3600),
        minutes: Math.floor((totalSeconds % 3600) / 60),
        seconds: totalSeconds % 60
      };
      Object.entries(v).forEach(([key, value]) => {
        if (phaseNodes[key]) phaseNodes[key].textContent = String(value).padStart(2, "0");
      });
    }
  };
  updatePhase();
  window.setInterval(updatePhase, 1000);

  // Only one testimonial video plays at a time.
  const testimonialVideos = document.querySelectorAll(".testimonial-video");
  testimonialVideos.forEach((video) => {
    video.addEventListener("play", () => {
      testimonialVideos.forEach((other) => { if (other !== video) other.pause(); });
      if (window.fbq) window.fbq("trackCustom", "TestimonialPlay", { name: video.getAttribute("data-name") || "" });
    });
  });

  // Advisor links use WhatsApp when the official number is configured.
  ["hero-advisor-link", "final-advisor-link"].forEach((id) => {
    const link = document.getElementById(id);
    if (!link) return;
    if (whatsappHref) {
      link.href = whatsappHref;
      link.target = "_blank";
      link.rel = "noopener";
    } else {
      link.href = "#entradas";
    }
  });

  // Track clicks as contact/checkout intent; never report a click as a purchase.
  document.querySelectorAll("[data-track]").forEach((el) => {
    el.addEventListener("click", () => {
      const action = el.getAttribute("data-track");
      if (!window.fbq) return;
      if (action === "whatsapp_click" || action === "advisor_click") window.fbq("track", "Contact");
      if (action === "checkout_click" || action === "hero_buy" || action === "header_cta" || action === "mobile_cta" || action === "final_cta") {
        window.fbq("trackCustom", "CheckoutIntent", { placement: action });
      }
    });
  });

  // Reveal content gently as it enters the viewport.
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  // Mobile sticky purchase bar appears after scrolling past the hero.
  const mobileBar = document.getElementById("mobile-buy-bar");
  const hero = document.querySelector(".hero");
  if (mobileBar && hero && "IntersectionObserver" in window) {
    const heroObserver = new IntersectionObserver(([entry]) => {
      mobileBar.classList.toggle("visible", !entry.isIntersecting);
    }, { threshold: 0.05 });
    heroObserver.observe(hero);
  }

  // Pause the moving ticker when the page tab is hidden.
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) document.querySelectorAll(".ticker-track").forEach(el => el.style.animationPlayState = "paused");
    else document.querySelectorAll(".ticker-track").forEach(el => el.style.animationPlayState = "");
  });
})();
