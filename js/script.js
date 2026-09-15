/* ==========================================================================
   Aurelion — shared site behavior
   ========================================================================== */
document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Loading screen: lettered word + progress count ---------- */
  var loader = document.querySelector('.loader');
  if (loader) {
    var wordEl = loader.querySelector('.loader-word');
    if (wordEl) {
      var text = wordEl.textContent.trim();
      wordEl.textContent = '';
      text.split('').forEach(function (ch, i) {
        var s = document.createElement('span');
        s.textContent = ch;
        s.style.animationDelay = (i * 0.05) + 's';
        wordEl.appendChild(s);
      });
    }

    var fill = loader.querySelector('.loader-track-fill');
    var pct = loader.querySelector('.loader-pct');
    var progress = 0;
    var finishing = false;

    function setProgress(val) {
      progress = Math.min(val, 100);
      if (fill) fill.style.width = progress + '%';
      if (pct) pct.textContent = Math.round(progress) + '%';
    }

    var progressTimer = setInterval(function () {
      // ease toward 90% while assets are still loading
      var target = 90;
      progress += (target - progress) * 0.09 + 0.4;
      setProgress(Math.min(progress, 90));
    }, 90);

    function finishLoading() {
      if (finishing) return;
      finishing = true;
      clearInterval(progressTimer);
      setProgress(100);
      setTimeout(function () { loader.classList.add('is-hidden'); }, 420);
    }

    window.addEventListener('load', function () { setTimeout(finishLoading, 300); });
    setTimeout(finishLoading, 2600); // fallback ceiling
  }

  /* ---------- Sticky header on scroll ---------- */
  var header = document.querySelector('.site-header');
  function handleHeaderScroll() {
    if (!header) return;
    if (window.scrollY > 40) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  }
  handleHeaderScroll();
  window.addEventListener('scroll', handleHeaderScroll, { passive: true });

  /* ---------- Mobile nav toggle ---------- */
  var navToggle = document.querySelector('.nav-toggle');
  var mainNav = document.querySelector('.main-nav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      var open = mainNav.classList.toggle('is-open');
      navToggle.classList.toggle('is-open', open);
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    mainNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mainNav.classList.remove('is-open');
        navToggle.classList.remove('is-open');
      });
    });
  }

  /* ---------- Back to top ---------- */
  var backToTop = document.querySelector('.back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', function () {
      backToTop.classList.toggle('is-visible', window.scrollY > 500);
    }, { passive: true });
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Animated counters ---------- */
  var counters = document.querySelectorAll('[data-count]');
  function animateCounter(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 1600;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = Math.round(target * eased);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window && counters.length) {
    var counterIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { counterIO.observe(el); });
  }

  /* ---------- Testimonial slider ---------- */
  var slides = document.querySelectorAll('.testimonial-slide');
  var dotsWrap = document.querySelector('.slider-dots');
  if (slides.length) {
    var current = 0;
    if (dotsWrap) {
      slides.forEach(function (_, i) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', 'Show testimonial ' + (i + 1));
        if (i === 0) dot.classList.add('is-active');
        dot.addEventListener('click', function () { goToSlide(i); });
        dotsWrap.appendChild(dot);
      });
    }
    function goToSlide(index) {
      slides[current].classList.remove('is-active');
      if (dotsWrap) dotsWrap.children[current].classList.remove('is-active');
      current = (index + slides.length) % slides.length;
      slides[current].classList.add('is-active');
      if (dotsWrap) dotsWrap.children[current].classList.add('is-active');
    }
    setInterval(function () { goToSlide(current + 1); }, 5500);
  }

  /* ---------- Tabs (extra forms) ---------- */
  var tabBtns = document.querySelectorAll('.tab-btn');
  if (tabBtns.length) {
    tabBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = btn.getAttribute('data-tab');
        document.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('is-active'); });
        document.querySelectorAll('.tab-panel').forEach(function (p) { p.classList.remove('is-active'); });
        btn.classList.add('is-active');
        document.getElementById(target).classList.add('is-active');
      });
    });
  }

  /* ---------- File upload label ---------- */
  document.querySelectorAll('.file-drop input[type="file"]').forEach(function (input) {
    input.addEventListener('change', function () {
      var label = input.closest('.file-drop').querySelector('.fname');
      if (label) {
        label.textContent = input.files.length ? input.files[0].name : 'No file chosen';
      }
    });
  });

  /* ---------- Form validation ---------- */
  function validateField(field) {
    var input = field.querySelector('input, select, textarea');
    if (!input) return true;
    var valid = true;

    if (input.hasAttribute('required')) {
      if (input.type === 'checkbox' && !input.checked) valid = false;
      else if (!input.value || !input.value.trim()) valid = false;
    }
    if (valid && input.type === 'email' && input.value) {
      var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      valid = emailPattern.test(input.value.trim());
    }
    if (valid && input.type === 'tel' && input.value) {
      var phonePattern = /^[0-9+\-\s()]{7,16}$/;
      valid = phonePattern.test(input.value.trim());
    }
    field.classList.toggle('has-error', !valid);
    return valid;
  }

  document.querySelectorAll('form[data-validate]').forEach(function (form) {
    var success = form.parentElement.querySelector('.form-success');

    form.querySelectorAll('.field').forEach(function (field) {
      var input = field.querySelector('input, select, textarea');
      if (!input) return;
      input.addEventListener('blur', function () { validateField(field); });
      input.addEventListener('input', function () {
        if (field.classList.contains('has-error')) validateField(field);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fields = form.querySelectorAll('.field');
      var allValid = true;
      fields.forEach(function (field) {
        if (!validateField(field)) allValid = false;
      });
      if (!allValid) {
        var firstError = form.querySelector('.has-error input, .has-error select, .has-error textarea');
        if (firstError) firstError.focus();
        return;
      }
      if (success) {
        success.classList.add('is-visible');
        success.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      form.reset();
      form.querySelectorAll('.fname').forEach(function (f) { f.textContent = 'No file chosen'; });
      form.querySelectorAll('.field').forEach(function (f) { f.classList.remove('has-error'); });
    });
  });

  /* ---------- Scroll progress bar ---------- */
  var progressFill = document.querySelector('.scroll-progress-fill');
  if (progressFill) {
    function updateScrollProgress() {
      var doc = document.documentElement;
      var scrollTop = doc.scrollTop || document.body.scrollTop;
      var height = doc.scrollHeight - doc.clientHeight;
      var pct = height > 0 ? (scrollTop / height) * 100 : 0;
      progressFill.style.width = pct + '%';
    }
    updateScrollProgress();
    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    window.addEventListener('resize', updateScrollProgress);
  }

  /* ---------- Cursor glow (desktop only) ---------- */
  var glow = document.querySelector('.cursor-glow');
  if (glow && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var gx = 0, gy = 0, cx = 0, cy = 0;
    document.addEventListener('mousemove', function (e) {
      gx = e.clientX; gy = e.clientY;
      glow.classList.add('is-active');
    });
    document.addEventListener('mouseleave', function () { glow.classList.remove('is-active'); });
    (function animateGlow() {
      cx += (gx - cx) * 0.18;
      cy += (gy - cy) * 0.18;
      glow.style.transform = 'translate(' + cx + 'px,' + cy + 'px) translate(-50%,-50%)';
      requestAnimationFrame(animateGlow);
    })();
  }

  /* ---------- Magnetic buttons ---------- */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.magnetic').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var mx = e.clientX - r.left - r.width / 2;
        var my = e.clientY - r.top - r.height / 2;
        btn.style.transform = 'translate(' + (mx * 0.22) + 'px,' + (my * 0.32) + 'px)';
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.transform = 'translate(0,0)';
      });
    });
  }

  /* ---------- Tilt cards ---------- */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.tilt').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        var rx = (py - 0.5) * -8;
        var ry = (px - 0.5) * 8;
        card.style.transform = 'perspective(700px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateY(-4px)';
        card.style.setProperty('--mx', (px * 100) + '%');
        card.style.setProperty('--my', (py * 100) + '%');
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = 'perspective(700px) rotateX(0) rotateY(0) translateY(0)';
      });
    });
  }

  /* ---------- Value card glow tracking (works even without tilt) ---------- */
  document.querySelectorAll('.value-card').forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
      card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
    });
  });

  /* ---------- Hero canvas: connected particle network ---------- */
  var heroCanvas = document.querySelector('.hero-canvas');
  if (heroCanvas && heroCanvas.getContext) {
    var ctx = heroCanvas.getContext('2d');
    var particles = [];
    var mouseX = null, mouseY = null;
    var w, h;

    function resize() {
      var rect = heroCanvas.parentElement.getBoundingClientRect();
      w = heroCanvas.width = rect.width;
      h = heroCanvas.height = rect.height;
      var count = Math.round((w * h) / 18000);
      particles = [];
      for (var i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25
        });
      }
    }

    function step() {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        for (var j = i + 1; j < particles.length; j++) {
          var q = particles[j];
          var dx = p.x - q.x, dy = p.y - q.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.strokeStyle = 'rgba(179,154,106,' + (0.16 * (1 - dist / 120)) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
        if (mouseX !== null) {
          var mdx = p.x - mouseX, mdy = p.y - mouseY;
          var mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < 150) {
            ctx.strokeStyle = 'rgba(217,201,163,' + (0.28 * (1 - mdist / 150)) + ')';
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouseX, mouseY);
            ctx.stroke();
          }
        }
        ctx.fillStyle = 'rgba(217,201,163,0.55)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(step);
    }

    resize();
    requestAnimationFrame(step);
    window.addEventListener('resize', resize);
    heroCanvas.parentElement.addEventListener('mousemove', function (e) {
      var rect = heroCanvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    });
    heroCanvas.parentElement.addEventListener('mouseleave', function () {
      mouseX = null; mouseY = null;
    });
  }

  /* ---------- Hero background subtle parallax ---------- */
  var heroSection = document.querySelector('.hero');
  var heroMedia = document.querySelector('.hero-media');
  if (heroSection && heroMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    heroSection.addEventListener('mousemove', function (e) {
      var r = heroSection.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      heroMedia.style.transform = 'scale(1.06) translate(' + (px * -14) + 'px,' + (py * -14) + 'px)';
    });
    heroSection.addEventListener('mouseleave', function () {
      heroMedia.style.transform = 'scale(1.06) translate(0,0)';
    });
  }

});
