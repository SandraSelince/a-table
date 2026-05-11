(function () {
  'use strict';

  // ─── STYLES ────────────────────────────────────────────────────────────────
  const CSS = `
    #site-nav {
      position: sticky; top: 0; z-index: 200;
      backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
      font-family: 'Sora', -apple-system, sans-serif;
    }
    #site-nav .nav-inner {
      max-width: 1280px; margin: 0 auto; padding: 0 32px;
      height: 76px; display: flex; align-items: center; gap: 24px;
    }
    #site-nav .nav-logo-wrap {
      display: flex; flex-direction: column; align-items: flex-start;
      gap: 1px; flex-shrink: 0; margin-right: 8px; text-decoration: none;
    }
    #site-nav .nav-logo-img {
      height: 80px; width: auto; display: block;
    }
    #site-nav.nav--public .nav-logo-img { filter: brightness(0); }
    #site-nav.nav--connected .nav-logo-img { filter: brightness(0); }

    /* ── NON-CONNECTED (light) ── */
    #site-nav.nav--public {
      background: rgba(255,255,255,0.95);
      border-bottom: 1px solid #E8D5CC;
    }
    #site-nav.nav--public .nav-logo  { color: #111010; }
    #site-nav.nav--public .nav-tagline { color: #7A5C52; }
    #site-nav.nav--public .nav-links {
      display: flex; align-items: center; gap: 4px; margin-left: auto;
    }
    #site-nav.nav--public .nav-links a,
    #site-nav.nav--public .nav-links button {
      padding: 7px 14px; border-radius: 9999px; font-size: 13px; font-weight: 500;
      color: #7A5C52; transition: background 0.15s, color 0.15s;
      border: none; cursor: pointer; font-family: inherit; background: none;
      text-decoration: none; display: inline-flex; align-items: center;
    }
    #site-nav.nav--public .nav-links a:hover,
    #site-nav.nav--public .nav-links button:hover { color: #111010; background: rgba(0,0,0,0.06); }
    #site-nav.nav--public .nav-btn-signup {
      background: #CC7039 !important; color: #fff !important; font-weight: 600 !important;
    }
    #site-nav.nav--public .nav-btn-signup:hover { background: #B8602F !important; }
    #site-nav.nav--public .nav-menu-btn {
      width: 36px; height: 36px; border-radius: 50%; background: none; border: none;
      display: flex; align-items: center; justify-content: center; flex-direction: column;
      gap: 4px; cursor: pointer; transition: background 0.15s; flex-shrink: 0;
      font-family: inherit;
    }
    #site-nav.nav--public .nav-menu-btn:hover { background: rgba(0,0,0,0.06); }
    #site-nav.nav--public .nav-menu-btn span {
      display: block; width: 16px; height: 1.5px; background: #111010;
    }

    /* ── CONNECTED (light/transparent) ── */
    #site-nav.nav--connected {
      background: rgba(255,255,255,0.88);
      border-bottom: 1px solid #E8D5CC;
    }
    #site-nav.nav--connected .nav-logo  { color: #111010; }
    #site-nav.nav--connected .nav-tagline { color: #9B8E86; }
    #site-nav.nav--connected .nav-user { position: relative; margin-left: auto; }
    #site-nav.nav--connected .nav-user-btn {
      display: flex; align-items: center; gap: 9px;
      padding: 6px 14px 6px 6px; border-radius: 9999px; cursor: pointer;
      background: rgba(0,0,0,0.04); border: 1px solid #E8D5CC;
      transition: background 0.15s, border-color 0.15s; font-family: inherit;
    }
    #site-nav.nav--connected .nav-user-btn:hover {
      background: rgba(0,0,0,0.08); border-color: rgba(0,0,0,0.2);
    }
    #site-nav.nav--connected .nav-user-btn[aria-expanded="true"] .nav-chevron {
      transform: rotate(180deg);
    }
    #site-nav .nav-user-avatar {
      width: 28px; height: 28px; border-radius: 8px;
      background: linear-gradient(135deg, #CC7039, #B8602F);
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 800; color: #fff; flex-shrink: 0;
    }
    #site-nav .nav-user-name { font-size: 13px; font-weight: 600; color: #111010; }
    #site-nav .nav-chevron { color: #9B8E86; transition: transform 0.2s; flex-shrink: 0; }

    /* Dropdown */
    #site-nav .nav-dropdown {
      position: absolute; top: calc(100% + 8px); right: 0;
      background: #fff; border: 1px solid #E8D5CC;
      border-radius: 14px; padding: 6px; min-width: 220px;
      box-shadow: 0 16px 40px rgba(0,0,0,0.12);
      opacity: 0; pointer-events: none; transform: translateY(-6px);
      transition: opacity 0.15s, transform 0.15s; z-index: 100;
    }
    #site-nav .nav-dropdown.open { opacity: 1; pointer-events: all; transform: translateY(0); }
    #site-nav .nav-dd-item {
      display: flex; align-items: center; gap: 10px; padding: 10px 12px;
      border-radius: 9px; font-size: 13px; font-weight: 500;
      color: #111010; cursor: pointer;
      transition: background 0.12s, color 0.12s; width: 100%;
      text-align: left; text-decoration: none; border: none; background: none;
      font-family: inherit;
    }
    #site-nav .nav-dd-item:hover { background: #F5E6D8; color: #111010; }
    #site-nav .nav-dd-item svg { color: #7A5C52; flex-shrink: 0; }
    #site-nav .nav-dd-item.active { color: #111010; background: #F5E6D8; }
    #site-nav .nav-dd-divider { height: 1px; background: #E8D5CC; margin: 4px 0; }
    #site-nav .nav-dd-danger { color: rgba(255,100,100,0.75) !important; }
    #site-nav .nav-dd-danger:hover { background: rgba(255,50,50,0.08) !important; color: #ff6b6b !important; }
    #site-nav .nav-dd-danger svg { color: rgba(255,100,100,0.5) !important; }

    /* ── SLIDE-OUT MENU (non-connected) ── */
    #nav-menu-overlay {
      position: fixed; inset: 0; z-index: 300; background: rgba(0,0,0,0.5);
      opacity: 0; pointer-events: none; transition: opacity 0.2s;
    }
    #nav-menu-overlay.open { opacity: 1; pointer-events: all; }
    #nav-menu-panel {
      position: fixed; top: 0; right: 0; width: 320px; height: 100%;
      background: #fff; border-left: 1px solid #E8D5CC; z-index: 400;
      transform: translateX(100%); transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
      display: flex; flex-direction: column; padding: 32px;
    }
    #nav-menu-panel.open { transform: translateX(0); }
    .nav-menu-close-btn {
      align-self: flex-end; color: #7A5C52; font-size: 22px;
      line-height: 1; margin-bottom: 40px; background: none; border: none;
      cursor: pointer; font-family: inherit;
    }
    .nav-menu-close-btn:hover { color: #111010; }
    .nav-slide-links { list-style: none; display: flex; flex-direction: column; gap: 4px; }
    .nav-slide-links a {
      display: block; padding: 14px 0; font-size: 20px; font-weight: 700;
      color: #111010; border-bottom: 1px solid #E8D5CC;
      transition: color 0.15s; letter-spacing: -0.3px; text-decoration: none;
    }
    .nav-slide-links a:hover { color: #CC7039; }
    .nav-slide-bottom { margin-top: auto; display: flex; gap: 12px; }
    .nav-slide-bottom a {
      flex: 1; text-align: center; padding: 12px; border-radius: 9999px;
      font-size: 13px; font-weight: 600; transition: all 0.15s; text-decoration: none;
    }
    .nav-slide-login { border: 1px solid #E8D5CC; color: #7A5C52; }
    .nav-slide-login:hover { border-color: #111010; color: #111010; }
    .nav-slide-signup { background: #CC7039; color: #fff; }
    .nav-slide-signup:hover { background: #B8602F; }

    #site-nav.nav--connected .nav-menu-btn--connected {
      width: 36px; height: 36px; border-radius: 50%; background: none; border: none;
      display: flex; align-items: center; justify-content: center; flex-direction: column;
      gap: 4px; cursor: pointer; transition: background 0.15s; flex-shrink: 0;
      font-family: inherit; margin-left: 8px;
    }
    #site-nav.nav--connected .nav-menu-btn--connected:hover { background: rgba(0,0,0,0.06); }
    #site-nav.nav--connected .nav-menu-btn--connected span {
      display: block; width: 16px; height: 1.5px; background: #111010;
    }
    @media (max-width: 768px) {
      #site-nav .nav-inner { padding: 0 20px; }
      #site-nav.nav--public .nav-btn-login-text { display: none; }
    }
    /* ── Hide app download banners globally ── */
    .app-banner, .hero-download-bar { display: none !important; }
    .app-store-btn { display: none !important; }
  `;
  const styleEl = document.createElement('style');
  styleEl.textContent = CSS;
  document.head.appendChild(styleEl);

  // ─── SESSION ───────────────────────────────────────────────────────────────
  function getSession() {
    try {
      const r = localStorage.getItem('restaurantProfile');
      if (r) return { type: 'restaurant', data: JSON.parse(r) };
    } catch (e) {}
    try {
      const c = localStorage.getItem('curatorProfile');
      if (c) return { type: 'curator', data: JSON.parse(c) };
    } catch (e) {}
    return null;
  }

  // ─── ICONS ─────────────────────────────────────────────────────────────────
  const I = {
    grid:   `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>`,
    user:   `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    logout: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
    chev:   `<svg class="nav-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="2,4 6,8 10,4"/></svg>`
  };

  // ─── RENDER ────────────────────────────────────────────────────────────────
  const nav = document.getElementById('site-nav');
  if (!nav) return;

  const session = getSession();
  const path    = window.location.pathname.split('/').pop() || 'index.html';

  if (!session) {
    // ── NON-CONNECTED ──
    nav.className = 'nav--public';
    nav.innerHTML = `
      <div class="nav-inner">
        <a class="nav-logo-wrap" href="/landing.html">
          <img class="nav-logo-img" src="/logo.svg" alt="A Table" />
        </a>
        <div class="nav-links">
          <a href="/index.html" class="nav-btn-login nav-btn-login-text">Voir la carte</a>
          <a href="/login.html" class="nav-btn-login">Connexion</a>
          <a href="/signup.html" class="nav-btn-signup">S'inscrire</a>
          <button type="button" class="nav-menu-btn" onclick="navOpenMenu()" aria-label="Ouvrir le menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    `;
    // Slide-out menu (appended to body, outside nav)
    const overlay = document.createElement('div');
    overlay.id = 'nav-menu-overlay';
    overlay.onclick = () => navCloseMenu();
    document.body.appendChild(overlay);

    const panel = document.createElement('div');
    panel.id = 'nav-menu-panel';
    panel.innerHTML = `
      <button type="button" class="nav-menu-close-btn" onclick="navCloseMenu()" aria-label="Fermer le menu">✕</button>
      <ul class="nav-slide-links">
        <li><a href="/how-it-works.html">Comment ça marche ?</a></li>
        <li><a href="/index.html">Voir la carte</a></li>
        <li><a href="/curators.html">Voir les curateurs</a></li>
        <li><a href="/categories.html">Par cuisine</a></li>
        <li><a href="/statistiques.html">Statistiques</a></li>
      </ul>
      <div class="nav-slide-bottom">
        <a href="/login.html" class="nav-slide-login">Connexion</a>
        <a href="/signup.html" class="nav-slide-signup">S'inscrire</a>
      </div>
    `;
    document.body.appendChild(panel);

  } else {
    // ── CONNECTED ──
    const name       = session.data.name || '?';
    const initial    = name[0].toUpperCase();
    const dashUrl    = session.type === 'restaurant' ? '/dashboard-restaurant.html' : '/dashboard.html';
    const profileUrl = session.type === 'restaurant' ? '/restaurant-profile.html'  : '/profile.html';
    const dashActive    = path === dashUrl.replace('/', '');
    const profileActive = path === profileUrl.replace('/', '');

    nav.className = 'nav--connected';
    nav.innerHTML = `
      <div class="nav-inner">
        <a class="nav-logo-wrap" href="/landing.html">
          <img class="nav-logo-img" src="/logo.svg" alt="A Table" />
        </a>
        <div class="nav-user" id="navUser">
          <button type="button" class="nav-user-btn" onclick="navToggleDropdown()" aria-expanded="false" aria-haspopup="true">
            <span class="nav-user-avatar">${initial}</span>
            <span class="nav-user-name">${name}</span>
            ${I.chev}
          </button>
          <div class="nav-dropdown" id="navDropdown">
            <a class="nav-dd-item${dashActive    ? ' active' : ''}" href="${dashUrl}">${I.grid} Mon tableau de bord</a>
            <a class="nav-dd-item${profileActive ? ' active' : ''}" href="${profileUrl}">${I.user} Mon profil</a>
            <div class="nav-dd-divider"></div>
            <button type="button" class="nav-dd-item nav-dd-danger" onclick="navLogout()">${I.logout} Déconnexion</button>
          </div>
        </div>
        <button type="button" class="nav-menu-btn nav-menu-btn--connected" onclick="navOpenMenu()" aria-label="Ouvrir le menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    `;
    // Slide-out menu for connected state
    if (!document.getElementById('nav-menu-overlay')) {
      const overlay = document.createElement('div');
      overlay.id = 'nav-menu-overlay';
      overlay.onclick = () => navCloseMenu();
      document.body.appendChild(overlay);
      const panel = document.createElement('div');
      panel.id = 'nav-menu-panel';
      panel.innerHTML = `
        <button type="button" class="nav-menu-close-btn" onclick="navCloseMenu()" aria-label="Fermer le menu">✕</button>
        <ul class="nav-slide-links">
          <li><a href="/how-it-works.html">Comment ça marche ?</a></li>
          <li><a href="/index.html">Voir la carte</a></li>
          <li><a href="/curators.html">Voir les curateurs</a></li>
          <li><a href="/categories.html">Par cuisine</a></li>
        </ul>
      `;
      document.body.appendChild(panel);
    }
  }

  // ─── EVENTS ────────────────────────────────────────────────────────────────
  window.navOpenMenu = function () {
    document.getElementById('nav-menu-overlay')?.classList.add('open');
    document.getElementById('nav-menu-panel')?.classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  window.navCloseMenu = function () {
    document.getElementById('nav-menu-overlay')?.classList.remove('open');
    document.getElementById('nav-menu-panel')?.classList.remove('open');
    document.body.style.overflow = '';
  };
  window.navToggleDropdown = function () {
    const btn = document.querySelector('#site-nav .nav-user-btn');
    const dd  = document.getElementById('navDropdown');
    if (!dd || !btn) return;
    const open = dd.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
  };
  window.navLogout = function () {
    localStorage.removeItem('restaurantProfile');
    localStorage.removeItem('curatorProfile');
    window.location.href = '/landing.html';
  };

  document.addEventListener('click', function (e) {
    const nu = document.getElementById('navUser');
    if (nu && !nu.contains(e.target)) {
      document.getElementById('navDropdown')?.classList.remove('open');
      document.querySelector('#site-nav .nav-user-btn')?.setAttribute('aria-expanded', 'false');
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      navCloseMenu();
      document.getElementById('navDropdown')?.classList.remove('open');
    }
  });

  // ─── FOOTER LINKS (session-aware) ──────────────────────────────────────────
  document.querySelectorAll('footer a').forEach(function (a) {
    const text = a.textContent.trim();
    if (text === 'Tableau de bord') {
      a.href = session ? '/dashboard-restaurant.html' : '/signup.html';
    } else if (text === 'Inscrire mon restaurant') {
      a.href = (session && session.type === 'restaurant') ? '/restaurant-profile.html' : '/signup-restaurant.html';
    }
  });
})();
