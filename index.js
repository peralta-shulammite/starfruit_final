(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------
     Mobile nav toggle
     --------------------------------------------- */
  var navToggle = document.getElementById("navToggle");
  var navMobile = document.getElementById("navMobile");

  if (navToggle && navMobile) {
    navToggle.addEventListener("click", function () {
      var isOpen = navMobile.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    });

    navMobile.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navMobile.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Open menu");
      });
    });
  }

  /* ---------------------------------------------
     Dashboard "This month" dropdown
     --------------------------------------------- */
  var dashSelect = document.getElementById("dashSelect");
  var dashSelectBtn = document.getElementById("dashSelectBtn");
  var dashSelectMenu = document.getElementById("dashSelectMenu");
  var dashSelectLabel = document.getElementById("dashSelectLabel");

  if (dashSelect && dashSelectBtn && dashSelectMenu && dashSelectLabel) {
    function closeDashMenu() {
      dashSelectMenu.classList.remove("is-open");
      dashSelectBtn.setAttribute("aria-expanded", "false");
    }

    dashSelectBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      var isOpen = dashSelectMenu.classList.toggle("is-open");
      dashSelectBtn.setAttribute("aria-expanded", String(isOpen));
    });

    dashSelectMenu.querySelectorAll("li").forEach(function (option) {
      function selectOption() {
        dashSelectLabel.textContent = option.textContent;
        closeDashMenu();
      }
      option.addEventListener("click", selectOption);
      option.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectOption();
        }
      });
    });

    document.addEventListener("click", function (e) {
      if (!dashSelect.contains(e.target)) closeDashMenu();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeDashMenu();
    });
  }

  /* ---------------------------------------------
     Count-up animation (savings figure + stat bar)
     --------------------------------------------- */
  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    if (isNaN(target)) return;
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";

    if (prefersReducedMotion) {
      el.textContent = prefix + target.toLocaleString() + suffix;
      return;
    }

    var duration = 1400;
    var start = null;

    function step(timestamp) {
      if (start === null) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var eased = easeOutExpo(progress);
      var current = Math.round(target * eased);
      el.textContent = prefix + current.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var countTargets = document.querySelectorAll("[data-count]");
  if (countTargets.length) {
    var countObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            countObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    countTargets.forEach(function (el) { countObserver.observe(el); });
  }

  /* ---------------------------------------------
     Sparkline draw-in
     --------------------------------------------- */
  var sparklineLine = document.querySelector(".sparkline-line");
  var sparklineFill = document.querySelector(".sparkline-fill");

  if (sparklineLine) {
    var drawIn = function () {
      sparklineLine.classList.add("is-drawn");
      if (sparklineFill) sparklineFill.classList.add("is-drawn");
    };
    if (prefersReducedMotion) {
      drawIn();
    } else {
      window.requestAnimationFrame(function () {
        setTimeout(drawIn, 250);
      });
    }
  }

  /* ---------------------------------------------
     Subtle parallax tilt on the dashboard card
     --------------------------------------------- */
  var heroVisual = document.querySelector(".hero-visual");
  var dashboardCard = document.getElementById("dashboardCard");

  if (heroVisual && dashboardCard && !prefersReducedMotion && window.matchMedia("(min-width: 981px)").matches) {
    var maxTilt = 6;

    heroVisual.addEventListener("mousemove", function (e) {
      var rect = heroVisual.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width;
      var y = (e.clientY - rect.top) / rect.height;
      var rotateY = (x - 0.5) * maxTilt * 2;
      var rotateX = (0.5 - y) * maxTilt * 2;
      dashboardCard.style.transform =
        "rotateX(" + rotateX.toFixed(2) + "deg) rotateY(" + rotateY.toFixed(2) + "deg)";
    });

    heroVisual.addEventListener("mouseleave", function () {
      dashboardCard.style.transform = "rotateX(0deg) rotateY(0deg)";
    });
  }
})();