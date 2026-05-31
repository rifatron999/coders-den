/* ============================================================
   CODERS DEN — SCRIPT.JS v2.0
   Vue 3 app · Premium animations · Mouse-tracking glow
   ============================================================ */

const { createApp, ref, computed, onMounted, onUnmounted, nextTick, watch } = Vue;

createApp({
  setup() {
    // ── Reactive State ──
    const company      = ref({});
    const stats        = ref([]);
    const services     = ref([]);
    const whyUs        = ref([]);
    const portfolio    = ref([]);
    const team         = ref([]);
    const testimonials = ref([]);
    const processSteps = ref([]);
    const pricing      = ref([]);
    const faq          = ref([]);
    const contact      = ref({});
    const meta         = ref({});
    const capabilities = ref(null);

    // UI state
    const isScrolled     = ref(false);
    const mobileMenuOpen = ref(false);
    const activeSection  = ref('hero');
    const showBackToTop  = ref(false);
    const activeFilter   = ref('All');
    const openFaq        = ref(null);
    const typewriterText = ref('');
    const currentYear    = new Date().getFullYear();

    // ── Navigation ──
    const navLinks = [
      { href: '#services',     id: 'services',     label: 'Services' },
      { href: '#portfolio',    id: 'portfolio',    label: 'Portfolio' },
      { href: '#process',      id: 'process',      label: 'Process' },
      { href: '#team',         id: 'team',         label: 'Team' },
      { href: '#pricing',      id: 'pricing',      label: 'Pricing' },
      { href: '#testimonials', id: 'testimonials', label: 'Testimonials' },
      { href: '#contact',      id: 'contact',      label: 'Contact' },
    ];

    // ── Computed ──
    const quoteMailto = computed(() => {
      const email = contact.value.email || 'hello@codersden.dev';
      return `mailto:${email}?subject=${encodeURIComponent('Project Inquiry — ' + (company.value.name || 'Coders Den'))}`;
    });

    const whatsappLink = computed(() => {
      const num = (contact.value.whatsapp || company.value.whatsapp || '').replace(/[^0-9]/g, '');
      return `https://wa.me/${num}?text=${encodeURIComponent("Hi! I'm interested in your software development services.")}`;
    });

    const portfolioCategories = computed(() => {
      return [...new Set(portfolio.value.map(p => p.category))].sort();
    });

    const filteredPortfolio = computed(() => {
      if (activeFilter.value === 'All') return portfolio.value;
      return portfolio.value.filter(p => p.category === activeFilter.value);
    });

    // ── Fetch Data ──
    async function loadData() {
      try {
        const res = await fetch('company-data.json');
        if (!res.ok) throw new Error('Failed to load data');
        const data = await res.json();

        company.value      = data.company      || {};
        stats.value        = data.stats        || [];
        services.value     = data.services     || [];
        whyUs.value        = data.whyUs        || [];
        portfolio.value    = data.portfolio    || [];
        team.value         = data.team         || [];
        testimonials.value = data.testimonials || [];
        processSteps.value = data.process      || [];
        pricing.value      = data.pricing      || [];
        faq.value          = data.faq          || [];
        contact.value      = data.contact      || {};
        meta.value         = data.meta         || {};
        capabilities.value = data.capabilities || null;

        // Apply meta
        applyMeta(data.meta);

        // Start typewriter after DOM update
        await nextTick();
        startTypewriter(data.company?.typewriterPhrases || [data.company?.tagline || '']);

        // Init all visual effects
        initParticles();

        // Hide loading screen with a smooth delay
        setTimeout(() => {
          const loader = document.getElementById('loading-screen');
          if (loader) loader.classList.add('hidden');

          // Init observers after loader fades
          setTimeout(async () => {
            await nextTick();
            initScrollReveal();
            initCountUp();
            initTiltCards();
            initCardGlow();
          }, 100);
        }, 600);

      } catch (err) {
        console.error('Error loading company data:', err);
        const loader = document.getElementById('loading-screen');
        if (loader) {
          loader.querySelector('.loader-text').textContent = 'Failed to load — please refresh.';
        }
      }
    }

    function applyMeta(m) {
      if (!m) return;
      if (m.siteTitle) document.title = m.siteTitle;
      if (m.themeColor) {
        document.documentElement.style.setProperty('--accent', m.themeColor);
        const hex = m.themeColor.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        document.documentElement.style.setProperty('--accent-rgb', `${r}, ${g}, ${b}`);
      }
      if (m.favicon) {
        const link = document.querySelector("link[rel*='icon']");
        if (link) link.href = m.favicon;
      }
      if (m.siteDescription) {
        const desc = document.querySelector('meta[name="description"]');
        if (desc) desc.setAttribute('content', m.siteDescription);
      }
    }

    // ── Typewriter Effect ──
    let twTimeout = null;
    function startTypewriter(phrases) {
      if (!phrases.length) return;
      let phraseIdx = 0, charIdx = 0, deleting = false;

      function tick() {
        const current = phrases[phraseIdx];
        if (!deleting) {
          typewriterText.value = current.substring(0, charIdx + 1);
          charIdx++;
          if (charIdx === current.length) {
            deleting = true;
            twTimeout = setTimeout(tick, 2200);
            return;
          }
          twTimeout = setTimeout(tick, 65 + Math.random() * 30);
        } else {
          typewriterText.value = current.substring(0, charIdx - 1);
          charIdx--;
          if (charIdx === 0) {
            deleting = false;
            phraseIdx = (phraseIdx + 1) % phrases.length;
            twTimeout = setTimeout(tick, 500);
            return;
          }
          twTimeout = setTimeout(tick, 35);
        }
      }
      tick();
    }

    // ── Particle Canvas (enhanced with mouse interaction) ──
    let particleAnim = null;
    function initParticles() {
      const canvas = document.getElementById('particle-canvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      let particles = [];
      let mouseX = -1000, mouseY = -1000;
      const count = Math.min(90, Math.floor(window.innerWidth / 16));

      function resize() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
      }
      resize();
      window.addEventListener('resize', resize);

      // Mouse tracking for particle interaction
      canvas.parentElement.addEventListener('mousemove', (e) => {
        const rect = canvas.parentElement.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
      });
      canvas.parentElement.addEventListener('mouseleave', () => {
        mouseX = -1000; mouseY = -1000;
      });

      const style = getComputedStyle(document.documentElement);
      const rgb = style.getPropertyValue('--accent-rgb').trim() || '14, 165, 233';

      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r: Math.random() * 2 + 0.8,
          alpha: Math.random() * 0.35 + 0.08,
          baseAlpha: 0,
        });
        particles[i].baseAlpha = particles[i].alpha;
      }

      function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach((p, i) => {
          // Mouse repel/attract effect
          const dx = p.x - mouseX;
          const dy = p.y - mouseY;
          const mouseDist = Math.sqrt(dx * dx + dy * dy);
          if (mouseDist < 150) {
            const force = (150 - mouseDist) / 150 * 0.02;
            p.vx += dx * force;
            p.vy += dy * force;
            p.alpha = Math.min(0.8, p.baseAlpha + (150 - mouseDist) / 150 * 0.5);
          } else {
            p.alpha += (p.baseAlpha - p.alpha) * 0.05;
          }

          // Damping
          p.vx *= 0.99;
          p.vy *= 0.99;

          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0) p.x = canvas.width;
          if (p.x > canvas.width) p.x = 0;
          if (p.y < 0) p.y = canvas.height;
          if (p.y > canvas.height) p.y = 0;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${rgb}, ${p.alpha})`;
          ctx.fill();

          // Connect nearby particles with distance-faded lines
          for (let j = i + 1; j < particles.length; j++) {
            const ddx = p.x - particles[j].x;
            const ddy = p.y - particles[j].y;
            const dist = Math.sqrt(ddx * ddx + ddy * ddy);
            if (dist < 130) {
              const lineAlpha = 0.06 * (1 - dist / 130);
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.strokeStyle = `rgba(${rgb}, ${lineAlpha})`;
              ctx.lineWidth = 0.6;
              ctx.stroke();
            }
          }
        });

        particleAnim = requestAnimationFrame(draw);
      }
      draw();
    }

    // ── Scroll Handling (throttled) ──
    let scrollTick = false;
    function handleScroll() {
      if (scrollTick) return;
      scrollTick = true;
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        isScrolled.value = scrollY > 50;
        showBackToTop.value = scrollY > 600;

        // Progress bar
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
        const bar = document.getElementById('scroll-progress');
        if (bar) bar.style.width = progress + '%';

        // Active section detection
        const sections = navLinks.map(l => l.id);
        for (let i = sections.length - 1; i >= 0; i--) {
          const el = document.getElementById(sections[i]);
          if (el && el.getBoundingClientRect().top <= 200) {
            activeSection.value = sections[i];
            break;
          }
        }
        scrollTick = false;
      });
    }

    function scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ── Scroll Reveal (Intersection Observer) ──
    let revealObserver = null;
    function initScrollReveal() {
      revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Once visible, stop observing for performance
            revealObserver.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.08,
        rootMargin: '0px 0px -60px 0px'
      });

      document.querySelectorAll('.reveal').forEach(el => {
        revealObserver.observe(el);
      });
    }

    // ── Count-Up Animation ──
    function initCountUp() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.getAttribute('data-target'), 10);
            if (isNaN(target)) return;
            animateCount(el, target);
            observer.unobserve(el);
          }
        });
      }, { threshold: 0.5 });

      document.querySelectorAll('.count-up').forEach(el => observer.observe(el));
    }

    function animateCount(el, target) {
      const duration = 2200;
      const start = performance.now();
      function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out quart for smoother ending
        const eased = 1 - Math.pow(1 - progress, 4);
        el.textContent = Math.floor(eased * target);
        if (progress < 1) requestAnimationFrame(update);
        else el.textContent = target;
      }
      requestAnimationFrame(update);
    }

    // ── 3D Tilt Cards (enhanced) ──
    function initTiltCards() {
      document.querySelectorAll('.tilt-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const rotateX = ((y - centerY) / centerY) * -5;
          const rotateY = ((x - centerX) / centerX) * 5;
          card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
        });
        card.addEventListener('mouseleave', () => {
          card.style.transform = '';
          card.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
          setTimeout(() => { card.style.transition = ''; }, 500);
        });
      });
    }

    // ── Card Glow Effect (mouse-following gradient) ──
    function initCardGlow() {
      document.querySelectorAll('.glass-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          card.style.setProperty('--mouse-x', x + '%');
          card.style.setProperty('--mouse-y', y + '%');
        });
      });
    }

    // ── Contact Form ──
    function submitContact(e) {
      const form = e.target;
      const name    = form.querySelector('#cf-name').value;
      const email   = form.querySelector('#cf-email').value;
      const subject = form.querySelector('#cf-subject').value || 'Project Inquiry';
      const budget  = form.querySelector('#cf-budget').value;
      const message = form.querySelector('#cf-message').value;

      const body = `Name: ${name}\nEmail: ${email}\nBudget: ${budget || 'Not specified'}\n\n${message}`;
      window.location.href = `mailto:${contact.value.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }

    // ── Lifecycle ──
    onMounted(() => {
      loadData();
      window.addEventListener('scroll', handleScroll, { passive: true });
    });

    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll);
      if (twTimeout) clearTimeout(twTimeout);
      if (particleAnim) cancelAnimationFrame(particleAnim);
      if (revealObserver) revealObserver.disconnect();
    });

    // Re-init after filter change
    watch(activeFilter, async () => {
      await nextTick();
      initTiltCards();
      initCardGlow();
      // Re-observe new cards that might have appeared
      document.querySelectorAll('.reveal:not(.visible)').forEach(el => {
        if (revealObserver) revealObserver.observe(el);
      });
    });

    return {
      company, stats, services, whyUs, portfolio, team,
      testimonials, processSteps, pricing, faq, contact, meta, capabilities,
      isScrolled, mobileMenuOpen, activeSection, showBackToTop,
      activeFilter, openFaq, typewriterText, currentYear,
      quoteMailto, whatsappLink, portfolioCategories, filteredPortfolio,
      navLinks, scrollToTop, submitContact,
    };
  }
}).mount('#app');
