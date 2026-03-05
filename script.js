/* =============================================
   LUMIÈRE JEWELS — MAIN SCRIPT (Data-Driven Template)
   Three.js + GSAP + Lenis + Swiper + JSON DataLoader
   ============================================= */

(function () {
  'use strict';

  /* ---------- perf helpers ---------- */
  let mouseX = 0, mouseY = 0;
  const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const dpr = Math.min(window.devicePixelRatio, 1.5);

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  // ==========================================
  // DATA LOADER — load sri_mangala.json directly
  // ==========================================
  const DataLoader = {
    shopData: null,

    async load() {
      try {
        const res = await fetch(`data/sri_mangala.json`);
        if (!res.ok) throw new Error(`Shop data not found (${res.status})`);
        this.shopData = await res.json();
        return this.shopData;
      } catch (err) {
        console.error('DataLoader error:', err);
        throw err;
      }
    },

    // Inject text into all [data-bind] elements
    bindText(data) {
      document.querySelectorAll('[data-bind]').forEach(el => {
        const key = el.getAttribute('data-bind');
        if (data[key] !== undefined) {
          if (el.tagName === 'TITLE') {
            document.title = data[key] + ' — Luxury Jewellery';
          } else {
            el.textContent = data[key];
          }
        }
      });
      // Update page title
      if (data.shop_name) {
        document.title = `${data.shop_name} — ${data.tagline || 'Luxury Jewellery'}`;
      }
      // Update meta description
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc && data.shop_name) {
        metaDesc.setAttribute('content',
          `Discover exquisite handcrafted luxury jewellery at ${data.shop_name}. ${data.tagline || ''}`);
      }
    },

    // Render collections grid
    renderCollections(collections) {
      const grid = document.getElementById('collectionsGrid');
      if (!grid || !collections) return;
      grid.innerHTML = '';
      collections.forEach((col, i) => {
        const card = document.createElement('div');
        card.className = 'collection-card';
        card.dataset.category = col.name.toLowerCase().replace(/\s+/g, '-');
        card.innerHTML = `
          <div class="collection-image">
            <img src="${col.image}" alt="${col.name}" loading="lazy">
            <div class="collection-overlay"></div>
          </div>
          <div class="collection-content">
            <span class="collection-number">${String(i + 1).padStart(2, '0')}</span>
            <h3>${col.name}</h3>
            <p>${col.description}</p>
            <a href="#" class="collection-link">Explore →</a>
          </div>`;
        grid.appendChild(card);
      });
    },

    // Render product slides
    renderProducts(products) {
      const wrapper = document.getElementById('productSlides');
      if (!wrapper || !products) return;
      wrapper.innerHTML = '';
      products.forEach(prod => {
        const slide = document.createElement('div');
        slide.className = 'swiper-slide';
        slide.innerHTML = `
          <div class="product-card">
            <div class="product-image-wrap">
              <img src="${prod.image}" alt="${prod.name}">
              <div class="product-shimmer"></div>
              ${prod.badge ? `<span class="product-badge">${prod.badge}</span>` : ''}
            </div>
            <div class="product-details">
              <h3>${prod.name}</h3>
              <div class="product-meta">
                <span>${prod.metal}</span>
                <span>•</span>
                <span>${prod.weight}</span>
              </div>
              <div class="product-price">${prod.price}</div>
              <button class="btn btn-small">View Details</button>
            </div>
          </div>`;
        wrapper.appendChild(slide);
      });
    },

    // Render testimonials
    renderTestimonials(testimonials) {
      const grid = document.getElementById('testimonialsGrid');
      if (!grid || !testimonials) return;
      grid.innerHTML = '';
      testimonials.forEach(t => {
        const card = document.createElement('div');
        card.className = 'testimonial-card';
        card.innerHTML = `
          <div class="testimonial-stars">${'★'.repeat(t.rating || 5)}</div>
          <p class="testimonial-text">"${t.text}"</p>
          <div class="testimonial-author">
            <img src="${t.photo}" alt="${t.name}" loading="lazy">
            <div>
              <h4>${t.name}</h4>
              <span>${t.collection}</span>
            </div>
          </div>`;
        grid.appendChild(card);
      });
    },

    // Render craftsmanship timeline
    renderCraftsmanship(steps) {
      const container = document.getElementById('timelineContainer');
      if (!container || !steps) return;
      // Keep the timeline-line element, remove old items
      const existingItems = container.querySelectorAll('.timeline-item');
      existingItems.forEach(el => el.remove());

      const icons = [
        '<path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />',
        '<polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />',
        '<path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />',
        '<circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />',
        '<path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22,4 12,14.01 9,11.01" />'
      ];

      steps.forEach((step, i) => {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        item.dataset.step = i + 1;
        item.innerHTML = `
          <div class="timeline-dot">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              ${icons[i % icons.length]}
            </svg>
          </div>
          <div class="timeline-content">
            <span class="timeline-number">${String(i + 1).padStart(2, '0')}</span>
            <h3>${step.title}</h3>
            <p>${step.description}</p>
          </div>`;
        container.appendChild(item);
      });
    },

    // Render footer collection links
    renderFooterCollections(collections) {
      const ul = document.getElementById('footerCollections');
      if (!ul || !collections) return;
      ul.innerHTML = '';
      collections.forEach(col => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="#">${col.name}</a>`;
        ul.appendChild(li);
      });
    },

    // Set social links
    setSocialLinks(social) {
      if (!social) return;
      const igLink = document.getElementById('socialInstagram');
      const fbLink = document.getElementById('socialFacebook');
      const ytLink = document.getElementById('socialYoutube');
      if (igLink && social.instagram) igLink.href = social.instagram;
      if (fbLink && social.facebook) fbLink.href = social.facebook;
      if (ytLink && social.youtube) ytLink.href = social.youtube;
    },

    // Set map iframe
    setMap(url) {
      const iframe = document.getElementById('mapFrame');
      if (iframe && url) iframe.src = url;
    },

    // Apply all data to the page
    applyAll(data) {
      this.bindText(data);
      this.renderCollections(data.collections);
      this.renderProducts(data.products);
      this.renderTestimonials(data.testimonials);
      this.renderCraftsmanship(data.craftsmanship);
      this.renderFooterCollections(data.collections);
      this.setSocialLinks(data.social);
      this.setMap(data.map_embed_url);
    }
  };

  // ==========================================
  // PRELOADER
  // ==========================================
  window.addEventListener('load', () => {
    setTimeout(() => {
      const preloader = document.getElementById('preloader');
      if (preloader) {
        preloader.classList.add('hidden');
        setTimeout(() => preloader.remove(), 800);
      }
      initHeroAnimations();
    }, 2200);
  });

  // ==========================================
  // LENIS SMOOTH SCROLL
  // ==========================================
  let lenis;
  try {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  } catch (e) {
    console.warn('Lenis not available, using native scroll');
  }

  // ==========================================
  // CUSTOM CURSOR (GPU-accelerated)
  // ==========================================
  const cursor = document.getElementById('customCursor');
  if (cursor && !isMobile && window.matchMedia('(hover: hover)').matches) {
    let cx = 0, cy = 0;
    (function tickCursor() {
      cx += (mouseX - cx) * 0.15;
      cy += (mouseY - cy) * 0.15;
      cursor.style.transform = `translate3d(${cx - 10}px, ${cy - 10}px, 0)`;
      requestAnimationFrame(tickCursor);
    })();
    document.body.addEventListener('mouseover', (e) => {
      if (e.target.closest('a, button, .product-card, .collection-card, .showcase-card, .testimonial-card'))
        cursor.classList.add('hovering');
    }, { passive: true });
    document.body.addEventListener('mouseout', (e) => {
      if (e.target.closest('a, button, .product-card, .collection-card, .showcase-card, .testimonial-card'))
        cursor.classList.remove('hovering');
    }, { passive: true });
  } else if (cursor) {
    cursor.style.display = 'none';
  }

  // ==========================================
  // NAVBAR
  // ==========================================
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > 80 && lastScroll <= 80) navbar.classList.add('scrolled');
    else if (y <= 80 && lastScroll > 80) navbar.classList.remove('scrolled');
    lastScroll = y;
  }, { passive: true });

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navLinks.classList.toggle('active');
      document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    });
    navLinks.querySelectorAll('a').forEach(l => l.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navLinks.classList.remove('active');
      document.body.style.overflow = '';
    }));
  }

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      const t = document.querySelector(this.getAttribute('href'));
      if (t) lenis ? lenis.scrollTo(t, { offset: -80 }) : t.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // ==========================================
  // VISIBILITY OBSERVER
  // ==========================================
  const visibilityMap = new Map();
  const visObs = new IntersectionObserver((entries) => {
    entries.forEach(e => visibilityMap.set(e.target, e.isIntersecting));
  }, { rootMargin: '100px' });
  function isVisible(el) { return visibilityMap.get(el) !== false; }

  // ==========================================
  // SHARED RENDERER FACTORY
  // ==========================================
  function makeRenderer(canvas) {
    const r = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !isMobile, powerPreference: 'high-performance' });
    r.setPixelRatio(dpr);
    r.setSize(canvas.clientWidth, canvas.clientHeight, false);
    return r;
  }

  // ==========================================
  // HERO THREE.JS
  // ==========================================
  function initHeroScene() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    visObs.observe(canvas);

    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    cam.position.z = 5;
    const renderer = makeRenderer(canvas);

    scene.add(new THREE.AmbientLight(0xfff5e6, 0.4));
    const l1 = new THREE.PointLight(0xd4a853, 2, 20); l1.position.set(3, 3, 5); scene.add(l1);
    const l2 = new THREE.PointLight(0xb76e79, 1.5, 20); l2.position.set(-3, -2, 4); scene.add(l2);
    const l3 = new THREE.PointLight(0x4a90d9, 0.8, 20); l3.position.set(0, 4, -3); scene.add(l3);

    const dGeo = new THREE.OctahedronGeometry(1.2, 2);
    const dMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0.1, roughness: 0.05, transmission: 0.9, thickness: 1.5, ior: 2.4, clearcoat: 1, clearcoatRoughness: 0.05 });
    const diamond = new THREE.Mesh(dGeo, dMat);
    scene.add(diamond);

    const r1 = new THREE.Mesh(
      new THREE.TorusGeometry(1.8, 0.08, 24, 80),
      new THREE.MeshPhysicalMaterial({ color: 0xd4a853, metalness: 1, roughness: 0.15, clearcoat: 0.8 })
    );
    r1.rotation.x = Math.PI / 2.5;
    scene.add(r1);

    const r2 = new THREE.Mesh(
      new THREE.TorusGeometry(2.2, 0.04, 24, 80),
      new THREE.MeshPhysicalMaterial({ color: 0xb76e79, metalness: 1, roughness: 0.2, clearcoat: 0.6 })
    );
    r2.rotation.x = Math.PI / 3; r2.rotation.z = Math.PI / 6;
    scene.add(r2);

    const N = isMobile ? 80 : 150;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0xd4a853, size: 0.03, transparent: true, opacity: 0.6, sizeAttenuation: true })));
    const particles = scene.children[scene.children.length - 1];

    function tick() {
      requestAnimationFrame(tick);
      if (!isVisible(canvas)) return;
      diamond.rotation.y += 0.005; diamond.rotation.x += 0.002;
      r1.rotation.z += 0.003; r2.rotation.y += 0.004;
      particles.rotation.y += 0.0005;
      const mx = (mouseX / window.innerWidth - 0.5) * 2;
      const my = (mouseY / window.innerHeight - 0.5) * 2;
      diamond.position.x += (mx * 0.3 - diamond.position.x) * 0.05;
      diamond.position.y += (-my * 0.3 - diamond.position.y) * 0.05;
      cam.position.x += (mx * 0.2 - cam.position.x) * 0.03;
      cam.position.y += (-my * 0.2 - cam.position.y) * 0.03;
      cam.lookAt(scene.position);
      renderer.render(scene, cam);
    }
    tick();

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        cam.aspect = canvas.clientWidth / canvas.clientHeight;
        cam.updateProjectionMatrix();
        renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
      }, 150);
    });
  }

  // ==========================================
  // 3D SHOWCASE
  // ==========================================
  function initShowcaseScenes() {
    const configs = [
      { id: 'showcase3D_1', type: 'diamond', color: 0xffffff, metal: 0xe8e8e8 },
      { id: 'showcase3D_2', type: 'pendant', color: 0xe0115f, metal: 0xd4a853 },
      { id: 'showcase3D_3', type: 'band', color: 0xd4a853, metal: 0xd4a853 },
    ];
    configs.forEach(cfg => {
      const canvas = document.getElementById(cfg.id);
      if (!canvas) return;
      visObs.observe(canvas);

      const scene = new THREE.Scene();
      const cam = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
      cam.position.z = 4;
      const renderer = makeRenderer(canvas);

      scene.add(new THREE.AmbientLight(0xffffff, 0.5));
      const sl1 = new THREE.PointLight(0xd4a853, 2, 15); sl1.position.set(2, 3, 4); scene.add(sl1);
      const sl2 = new THREE.PointLight(0xb76e79, 1, 15); sl2.position.set(-3, -1, 3); scene.add(sl2);

      let main;
      if (cfg.type === 'diamond') {
        main = new THREE.Mesh(new THREE.OctahedronGeometry(1, 2), new THREE.MeshPhysicalMaterial({ color: cfg.color, metalness: 0, roughness: 0.05, transmission: 0.85, thickness: 2, ior: 2.4, clearcoat: 1 }));
        const band = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.06, 16, 48), new THREE.MeshPhysicalMaterial({ color: cfg.metal, metalness: 1, roughness: 0.1, clearcoat: 0.8 }));
        band.rotation.x = Math.PI / 2; band.position.y = -0.6; scene.add(band);
      } else if (cfg.type === 'pendant') {
        main = new THREE.Mesh(new THREE.DodecahedronGeometry(0.7, 1), new THREE.MeshPhysicalMaterial({ color: cfg.color, metalness: 0.1, roughness: 0.1, transmission: 0.7, thickness: 1.5, ior: 1.9, clearcoat: 1 }));
        const frame = new THREE.Mesh(new THREE.TorusGeometry(1, 0.05, 16, 48), new THREE.MeshPhysicalMaterial({ color: cfg.metal, metalness: 1, roughness: 0.15, clearcoat: 0.7 }));
        scene.add(frame);
        const chain = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.02, 8, 24, Math.PI), new THREE.MeshPhysicalMaterial({ color: cfg.metal, metalness: 1, roughness: 0.2 }));
        chain.position.y = 0.8; chain.rotation.z = Math.PI; scene.add(chain);
      } else {
        main = new THREE.Mesh(new THREE.TorusGeometry(1, 0.25, 24, 64), new THREE.MeshPhysicalMaterial({ color: cfg.metal, metalness: 1, roughness: 0.1, clearcoat: 1, clearcoatRoughness: 0.05 }));
        main.rotation.x = Math.PI / 4;
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * Math.PI * 2;
          const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.08, 1), new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0, roughness: 0.05, transmission: 0.8, ior: 2.4 }));
          gem.position.set(Math.cos(a), 0, Math.sin(a)); main.add(gem);
        }
      }
      scene.add(main);

      let controls;
      try {
        controls = new THREE.OrbitControls(cam, canvas);
        controls.enableDamping = true; controls.dampingFactor = 0.05;
        controls.enableZoom = true; controls.minDistance = 2; controls.maxDistance = 7;
        controls.autoRotate = true; controls.autoRotateSpeed = 1.5; controls.enablePan = false;
      } catch (e) { }

      function tick() {
        requestAnimationFrame(tick);
        if (!isVisible(canvas)) return;
        if (controls) controls.update();
        renderer.render(scene, cam);
      }
      tick();

      new ResizeObserver(() => {
        cam.aspect = canvas.clientWidth / canvas.clientHeight;
        cam.updateProjectionMatrix();
        renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
      }).observe(canvas.parentElement);
    });
  }

  // ==========================================
  // CUSTOMIZER 3D
  // ==========================================
  function initCustomizerScene() {
    const canvas = document.getElementById('customizerCanvas');
    if (!canvas) return;
    visObs.observe(canvas);

    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    cam.position.z = 4.5;
    const renderer = makeRenderer(canvas);

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const kl = new THREE.PointLight(0xd4a853, 2.5, 20); kl.position.set(3, 3, 5); scene.add(kl);
    const fl = new THREE.PointLight(0xb76e79, 1.2, 20); fl.position.set(-3, -1, 3); scene.add(fl);

    const ringMat = new THREE.MeshPhysicalMaterial({ color: 0xd4a853, metalness: 1, roughness: 0.1, clearcoat: 1, clearcoatRoughness: 0.05 });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.2, 24, 64), ringMat);
    ring.rotation.x = Math.PI / 3; scene.add(ring);

    const gemMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0, roughness: 0.05, transmission: 0.85, thickness: 2, ior: 2.4, clearcoat: 1 });
    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.4, 2), gemMat);
    gem.position.set(0, 0.9, 0.5); scene.add(gem);

    let controls;
    try {
      controls = new THREE.OrbitControls(cam, canvas);
      controls.enableDamping = true; controls.dampingFactor = 0.05;
      controls.enableZoom = true; controls.autoRotate = true;
      controls.autoRotateSpeed = 2; controls.enablePan = false;
    } catch (e) { }

    function tick() {
      requestAnimationFrame(tick);
      if (!isVisible(canvas)) return;
      if (controls) controls.update();
      renderer.render(scene, cam);
    }
    tick();

    new ResizeObserver(() => {
      cam.aspect = canvas.clientWidth / canvas.clientHeight;
      cam.updateProjectionMatrix();
      renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    }).observe(canvas.parentElement);

    window._customizerRing = { ring, ringMat, gem, gemMat, glow: document.getElementById('ringGlow') };
  }

  // ==========================================
  // HERO ANIMATIONS (GSAP)
  // ==========================================
  function initHeroAnimations() {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.to('.hero-badge', { opacity: 1, y: 0, duration: 0.8, delay: 0.2 })
      .to('.hero-line', { opacity: 1, y: 0, duration: 1, stagger: 0.15 }, '-=0.4')
      .to('.hero-subtitle', { opacity: 1, y: 0, duration: 0.8 }, '-=0.5')
      .to('.hero-ctas', { opacity: 1, y: 0, duration: 0.8 }, '-=0.4')
      .to('.hero-scroll-indicator', { opacity: 1, duration: 1 }, '-=0.3');
  }

  // ==========================================
  // GSAP SCROLL ANIMATIONS
  // ==========================================
  function initScrollAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    gsap.utils.toArray('.section-header').forEach(h => {
      const tag = h.querySelector('.section-tag');
      const title = h.querySelector('.section-title');
      const sub = h.querySelector('.section-subtitle');
      const tl = gsap.timeline({ scrollTrigger: { trigger: h, start: 'top 80%', toggleActions: 'play none none reverse' } });
      if (tag) tl.from(tag, { opacity: 0, y: 20, duration: 0.6 });
      if (title) tl.from(title, { opacity: 0, y: 30, duration: 0.8 }, '-=0.3');
      if (sub) tl.from(sub, { opacity: 0, y: 20, duration: 0.6 }, '-=0.4');
    });

    gsap.utils.toArray('.showcase-card').forEach((c, i) => {
      gsap.from(c, { opacity: 0, y: 60, duration: 0.8, delay: i * 0.15, scrollTrigger: { trigger: c, start: 'top 85%', toggleActions: 'play none none reverse' } });
    });

    gsap.utils.toArray('.collection-card').forEach((c, i) => {
      gsap.from(c, { opacity: 0, y: 50, scale: 0.95, duration: 0.7, delay: i * 0.1, scrollTrigger: { trigger: c, start: 'top 85%', toggleActions: 'play none none reverse' } });
    });

    gsap.utils.toArray('.timeline-item').forEach(item => {
      ScrollTrigger.create({ trigger: item, start: 'top 75%', onEnter: () => item.classList.add('visible') });
    });

    const timelineFill = document.getElementById('timelineFill');
    const timeline = document.querySelector('.timeline');
    if (timeline && timelineFill) {
      ScrollTrigger.create({ trigger: timeline, start: 'top 60%', end: 'bottom 40%', scrub: 0.5, onUpdate: s => { timelineFill.style.height = (s.progress * 100) + '%'; } });
    }

    gsap.utils.toArray('.testimonial-card').forEach((c, i) => {
      gsap.from(c, { opacity: 0, y: 40, duration: 0.8, delay: i * 0.15, scrollTrigger: { trigger: c, start: 'top 85%', toggleActions: 'play none none reverse' } });
    });

    gsap.from('.contact-info', { opacity: 0, x: -40, duration: 0.9, scrollTrigger: { trigger: '.contact-section', start: 'top 70%', toggleActions: 'play none none reverse' } });
    gsap.from('.contact-form-wrap', { opacity: 0, x: 40, duration: 0.9, scrollTrigger: { trigger: '.contact-section', start: 'top 70%', toggleActions: 'play none none reverse' } });
    gsap.from('.customizer-steps', { opacity: 0, x: -40, duration: 0.9, scrollTrigger: { trigger: '.customize-section', start: 'top 70%', toggleActions: 'play none none reverse' } });
    gsap.from('.customizer-preview', { opacity: 0, x: 40, duration: 0.9, scrollTrigger: { trigger: '.customize-section', start: 'top 70%', toggleActions: 'play none none reverse' } });
  }

  // ==========================================
  // SWIPER
  // ==========================================
  function initSwiper() {
    new Swiper('.gallery-swiper', {
      slidesPerView: 1.2, spaceBetween: 20, grabCursor: true, loop: true, speed: 800,
      pagination: { el: '.swiper-pagination', clickable: true },
      navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
      breakpoints: {
        480: { slidesPerView: 1.5 },
        768: { slidesPerView: 2.5, spaceBetween: 24 },
        1024: { slidesPerView: 3.2, spaceBetween: 28 },
        1400: { slidesPerView: 3.8, spaceBetween: 32 },
      },
    });
  }

  // ==========================================
  // PARTICLES
  // ==========================================
  function initHeroParticles() {
    const c = document.getElementById('heroParticles');
    if (!c || isMobile) return;
    const count = prefersReduced ? 0 : 20;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const s = 1 + Math.random() * 3;
      p.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 100}%;width:${s}px;height:${s}px;--duration:${3 + Math.random() * 5}s;--delay:${Math.random() * 5}s`;
      c.appendChild(p);
    }
  }

  // ==========================================
  // CUSTOMIZER INTERACTION
  // ==========================================
  function initCustomizer() {
    const metalBtns = document.querySelectorAll('.metal-options .option-btn');
    const gemBtns = document.querySelectorAll('.gem-options .option-btn');
    const steps = document.querySelectorAll('.customizer-step');
    const sMetal = document.getElementById('summaryMetal');
    const sGem = document.getElementById('summaryGem');
    const sPrice = document.getElementById('summaryPrice');

    const prices = {
      'yellow-gold': { diamond: '₹2,50,000', ruby: '₹1,85,000', emerald: '₹2,10,000', sapphire: '₹1,95,000' },
      'white-gold': { diamond: '₹2,70,000', ruby: '₹2,05,000', emerald: '₹2,30,000', sapphire: '₹2,15,000' },
      'rose-gold': { diamond: '₹2,60,000', ruby: '₹1,95,000', emerald: '₹2,20,000', sapphire: '₹2,05,000' },
      'platinum': { diamond: '₹3,50,000', ruby: '₹2,85,000', emerald: '₹3,10,000', sapphire: '₹2,95,000' },
    };
    let selMetal = 'yellow-gold', selGem = 'diamond';
    const metalColors = { 'yellow-gold': 0xd4a853, 'white-gold': 0xe8e8e8, 'rose-gold': 0xb76e79, platinum: 0xd0d0d0 };
    const gemColors = { diamond: 0xffffff, ruby: 0xe0115f, emerald: 0x50c878, sapphire: 0x0f52ba };

    function update() {
      const mBtn = document.querySelector('.metal-options .option-btn.active');
      const gBtn = document.querySelector('.gem-options .option-btn.active');
      if (sMetal) sMetal.textContent = mBtn ? mBtn.querySelector('.option-label').textContent : 'Yellow Gold';
      if (sGem) sGem.textContent = gBtn ? gBtn.querySelector('.option-label').textContent : 'Diamond';
      if (sPrice) sPrice.textContent = (prices[selMetal] || {})[selGem] || '₹2,50,000';
      if (window._customizerRing) {
        const { ringMat, gemMat, glow } = window._customizerRing;
        if (ringMat) ringMat.color.setHex(metalColors[selMetal] || 0xd4a853);
        if (gemMat) gemMat.color.setHex(gemColors[selGem] || 0xffffff);
        if (glow && mBtn) glow.style.background = `radial-gradient(circle, ${mBtn.dataset.color}22, transparent 70%)`;
      }
    }

    metalBtns.forEach(b => b.addEventListener('click', () => {
      metalBtns.forEach(x => x.classList.remove('active')); b.classList.add('active');
      selMetal = b.dataset.metal; steps.forEach(s => s.classList.add('active')); update();
    }));
    gemBtns.forEach(b => b.addEventListener('click', () => {
      gemBtns.forEach(x => x.classList.remove('active')); b.classList.add('active');
      selGem = b.dataset.gem; steps.forEach(s => s.classList.add('active')); update();
    }));
  }

  // ==========================================
  // TILT
  // ==========================================
  function initTiltEffect() {
    if (isMobile || !window.matchMedia('(hover: hover)').matches) return;
    document.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        card.style.transform = `perspective(1000px) rotateX(${(0.5 - y) * 6}deg) rotateY(${(x - 0.5) * 6}deg) translateY(-6px) translateZ(0)`;
      }, { passive: true });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; }, { passive: true });
    });
  }

  // ==========================================
  // FORM
  // ==========================================
  function initForm() {
    const form = document.getElementById('appointmentForm');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const orig = btn.innerHTML;
      btn.innerHTML = '<span>✓ Appointment Booked!</span>';
      btn.style.background = 'linear-gradient(135deg, #50c878, #3da65c)';
      setTimeout(() => { btn.innerHTML = orig; btn.style.background = ''; form.reset(); }, 3000);
    });
  }

  // ==========================================
  // HERO PARALLAX
  // ==========================================
  function initHeroParallax() {
    if (isMobile) return;
    const els = document.querySelectorAll('#heroContent [data-parallax]');
    if (!els.length) return;
    let ticking = false;
    document.addEventListener('mousemove', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
        const mx = (mouseX - cx) / cx, my = (mouseY - cy) / cy;
        els.forEach(el => {
          const s = parseFloat(el.dataset.parallax);
          el.style.transform = `translate3d(${mx * s * 40}px, ${my * s * 40}px, 0)`;
        });
        ticking = false;
      });
    }, { passive: true });
  }

  // ==========================================
  // INIT — Load data first, then setup everything
  // ==========================================
  document.addEventListener('DOMContentLoaded', async () => {
    // 1. Load shop data from JSON
    try {
      const data = await DataLoader.load();
      DataLoader.applyAll(data);
      console.log(`✅ Loaded shop: ${data.shop_name}`);
    } catch (err) {
      console.error('Failed to load shop data:', err);
    }

    // 2. Init all interactive features (runs after data is in the DOM)
    initHeroScene();
    initHeroParticles();
    initShowcaseScenes();
    initCustomizerScene();
    initScrollAnimations();
    initSwiper();
    initCustomizer();
    initTiltEffect();
    initForm();
    initHeroParallax();
  });

})();
