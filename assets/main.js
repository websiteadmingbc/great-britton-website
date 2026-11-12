document.addEventListener('DOMContentLoaded',()=>{const button=document.querySelector('.mobile-toggle');const menu=document.getElementById('site-menu');if(!button||!menu)return;function close(){menu.classList.remove('is-open');button.setAttribute('aria-expanded','false');button.setAttribute('aria-label','Open navigation menu')}button.addEventListener('click',()=>{const open=menu.classList.toggle('is-open');button.setAttribute('aria-expanded',String(open));button.setAttribute('aria-label',open?'Close navigation menu':'Open navigation menu')});menu.querySelectorAll('a').forEach(link=>link.addEventListener('click',close));document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});document.addEventListener('click',e=>{if(!button.contains(e.target)&&!menu.contains(e.target))close()});window.addEventListener('resize',()=>{if(window.innerWidth>950)close()})});
/* Portfolio filtering and accessible image viewer */
(()=>{const tiles=[...document.querySelectorAll('.portfolio-tile')],filters=[...document.querySelectorAll('.filter-btn')];if(!tiles.length)return;const lb=document.getElementById('portfolio-lightbox'),pic=document.getElementById('lightbox-image');let visible=tiles,idx=0,lastFocus=null;function show(i){idx=(i+visible.length)%visible.length;pic.src=visible[idx].dataset.src;pic.alt=visible[idx].querySelector('img').alt;}function close(){lb.hidden=true;pic.removeAttribute('src');document.body.style.overflow='';lastFocus?.focus()}filters.forEach(btn=>btn.addEventListener('click',()=>{filters.forEach(x=>{x.classList.remove('active');x.setAttribute('aria-pressed','false')});btn.classList.add('active');btn.setAttribute('aria-pressed','true');const v=btn.dataset.filter;tiles.forEach(t=>t.hidden=v!=='all'&&t.dataset.source!==v);visible=tiles.filter(t=>!t.hidden)}));tiles.forEach(t=>t.addEventListener('click',()=>{lastFocus=t;show(visible.indexOf(t));lb.hidden=false;document.body.style.overflow='hidden';lb.querySelector('.lightbox-close').focus()}));lb.querySelector('.lightbox-close').addEventListener('click',close);lb.querySelector('.lightbox-prev').addEventListener('click',()=>show(idx-1));lb.querySelector('.lightbox-next').addEventListener('click',()=>show(idx+1));lb.addEventListener('click',e=>{if(e.target===lb)close()});document.addEventListener('keydown',e=>{if(lb.hidden)return;if(e.key==='Escape')close();if(e.key==='ArrowLeft')show(idx-1);if(e.key==='ArrowRight')show(idx+1)})})();


// Independent accessible category slideshows
(() => {
  const dialog=document.querySelector('.photo-dialog');
  document.querySelectorAll('.category-slider').forEach(slider=>{
    const slides=[...slider.querySelectorAll('.slide')], thumbs=[...slider.querySelectorAll('.thumb')],counter=slider.querySelector('.slide-count');let current=0;
    const show=(n)=>{current=(n+slides.length)%slides.length;slides.forEach((el,i)=>el.classList.toggle('active',i===current));thumbs.forEach((el,i)=>{el.classList.toggle('active',i===current);el.setAttribute('aria-pressed',String(i===current))});counter.textContent=String(current+1).padStart(2,'0')+' / '+String(slides.length).padStart(2,'0');thumbs[current]?.scrollIntoView({block:'nearest',inline:'nearest',behavior:'smooth'});};
    slider.querySelector('.prev').addEventListener('click',()=>show(current-1));slider.querySelector('.next').addEventListener('click',()=>show(current+1));thumbs.forEach((el,i)=>el.addEventListener('click',()=>show(i)));
    slider.querySelector('.open-fullscreen').addEventListener('click',()=>{if(!dialog)return;const im=slides[current].querySelector('img');dialog.querySelector('img').src=im.src;dialog.querySelector('img').alt=im.alt;dialog.querySelector('.dialog-caption').textContent=slides[current].querySelector('figcaption').textContent;dialog.showModal();});
    slider.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();show(current+1)}if(e.key==='ArrowLeft'){e.preventDefault();show(current-1)}});
  });
  if(dialog){dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});}
})();


// Homepage inquiry form (Formspree)
(() => {
  const form = document.getElementById('inquiry-form');
  if (!form) return;
  const status = form.querySelector('.form-status');
  const btn = form.querySelector('button[type="submit"]');
  form.querySelector('[name="landing_page"]').value = location.href;
  const setStatus = (msg, cls) => { status.textContent = msg; status.className = 'form-status ' + (cls || ''); };
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let firstBad = null;
    form.querySelectorAll('[required]').forEach(el => {
      const bad = !el.value.trim();
      el.setAttribute('aria-invalid', bad ? 'true' : 'false');
      if (bad && !firstBad) firstBad = el;
    });
    const phone = form.phone.value.trim(), email = form.email.value.trim();
    const emailBad = email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    form.email.setAttribute('aria-invalid', emailBad ? 'true' : 'false');
    if (firstBad) { setStatus('Please fill in the highlighted fields.', 'err'); firstBad.focus(); return; }
    if (!phone && !email) { form.phone.setAttribute('aria-invalid', 'true'); setStatus('Please add a phone number or email so we can reach you.', 'err'); form.phone.focus(); return; }
    if (emailBad) { setStatus('Please check the email address.', 'err'); form.email.focus(); return; }
    if (form.company_website.value) return; // honeypot
    btn.disabled = true; setStatus('Sending…');
    try {
      const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      form.reset();
      setStatus("Thanks — we've received your project details and will be in touch soon.", 'ok');
      if (window.clarity) window.clarity('event', 'inquiry_submitted');
      if (window.gtag) window.gtag('event', 'generate_lead', { form: 'main_site_inquiry', came_from: (window.GB_CONTACT && window.GB_CONTACT.source) || 'direct' });
    } catch (err) {
      setStatus('Something went wrong sending your request. Please call ' + ((window.GB_CONTACT && window.GB_CONTACT.phoneText) || '(510) 432-8461') + '.', 'err');
    } finally { btn.disabled = false; }
  });
})();

// GA4: track phone and email link clicks
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="tel:"], a[href^="mailto:"]');
  if (!link || typeof window.gtag !== 'function') return;
  const area = link.closest('header, nav, section, footer');
  window.gtag('event', link.href.startsWith('tel:') ? 'phone_click' : 'email_click', {
    link_location: (area && (area.id || area.tagName.toLowerCase())) || 'page',
    transport_type: 'beacon'
  });
});

// Visitors who came through start.greatbrittongc.com (within 30 days):
// show Collective Design Studio contact details and route the form to the start-page Formspree form.
(() => {
  const START = {
    source: 'start',
    phoneText: '(408) 455-3800',
    phoneTel: 'tel:4084553800',
    email: 'dylansimpson@greatbrittongc.com',
    formAction: 'https://formspree.io/f/mkjjzlkv'
  };
  const MAIN_PHONE_TEXT = '(510) 432-8461';
  let fromStart = false;
  try {
    fromStart = /(?:^|;\s*)gb_src=start(?:;|$)/.test(document.cookie);
    const ref = new URLSearchParams(location.search).get('ref');
    let refHost = '';
    try { refHost = document.referrer ? new URL(document.referrer).hostname : ''; } catch (e) {}
    if (ref === 'start' || refHost === 'start.greatbrittongc.com') {
      fromStart = true;
      document.cookie = 'gb_src=start; domain=greatbrittongc.com; path=/; max-age=2592000; SameSite=Lax; Secure';
    }
  } catch (e) {}
  if (!fromStart) return;
  window.GB_CONTACT = START;

  // Phone / SMS links: swap number and visible text (keeps icons intact)
  document.querySelectorAll('a[href^="tel:"], a[href^="sms:"]').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href.startsWith('sms:')) a.setAttribute('href', 'sms:4084553800');
    else a.setAttribute('href', START.phoneTel);
    const walker = document.createTreeWalker(a, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walker.nextNode())) {
      if (n.nodeValue.includes(MAIN_PHONE_TEXT)) n.nodeValue = n.nodeValue.split(MAIN_PHONE_TEXT).join(START.phoneText);
    }
  });

  // Email: add to the contact block
  const phones = document.querySelector('.phones');
  if (phones && !phones.querySelector('a[href^="mailto:"]')) {
    const tel = phones.querySelector('a[href^="tel:"]');
    const label = document.createElement('div');
    label.className = 'label';
    label.textContent = 'Email';
    const mail = document.createElement('a');
    mail.className = 'contact-email';
    mail.href = 'mailto:' + START.email;
    mail.textContent = START.email;
    if (tel) { tel.after(label, mail); } else { phones.prepend(label, mail); }
  }

  // Form: send to the start-page Formspree form, tagged
  const form = document.getElementById('inquiry-form');
  if (form) {
    form.setAttribute('action', START.formAction);
    const subj = form.querySelector('[name="_subject"]');
    if (subj) subj.value = 'New inquiry — greatbrittongc.com (via start page)';
    const hidden = document.createElement('input');
    hidden.type = 'hidden'; hidden.name = 'came_from'; hidden.value = 'start';
    form.appendChild(hidden);
  }

  // GA: label these visitors
  if (typeof window.gtag === 'function') {
    window.gtag('set', 'user_properties', { traffic_source: 'start' });
    window.gtag('event', 'start_visitor_view', { page_path: location.pathname });
  }
})();

/* Meet the Crew directory — live from Field personnel (published only) */
(() => {
  const grid = document.getElementById('crew-grid');
  if (!grid) return;

  const empty = document.getElementById('crew-empty');
  const loading = document.getElementById('crew-loading');
  const form = document.getElementById('crew-search-form');
  const input = document.getElementById('crew-query');
  const filters = [...document.querySelectorAll('.crew-filter')];
  const allBtn = document.getElementById('crew-filter-all') || filters.find((b) => b.dataset.filter === 'all');
  const cfg = window.GBC_SUPABASE || {};
  const crewBase = grid.dataset.crewBase ?? 'crew/';
  let dept = 'all';
  let cards = [];

  const normalize = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
  const escapeHtml = (s) =>
    String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  function avatarUrl(path) {
    if (!path) return null;
    if (/^https?:\/\//i.test(path)) return path;
    if (!cfg.url) return null;
    return `${cfg.url}/storage/v1/object/public/personnel-avatars/${path.replace(/^\/+/, '')}`;
  }

  function displayParts(row) {
    const preferred = (row.preferred_name || '').trim();
    const first = preferred || (row.first_name || '').trim() || 'Crew';
    const middle = (row.middle_name || '').trim();
    const last = (row.last_name || '').trim();
    const initialSrc = middle || last;
    const initial = initialSrc ? `${initialSrc.charAt(0).toUpperCase()}.` : '';
    const fullSearch = [row.first_name, row.middle_name, row.last_name, preferred]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    const initials =
      `${(preferred || row.first_name || '?').charAt(0)}${(last || middle || '').charAt(0) || ''}`.toUpperCase();
    return { first, initial, fullSearch, initials };
  }

  function renderCard(row) {
    const deptKey = row.website_category || '';
    const { first, initial, fullSearch, initials } = displayParts(row);
    const badge = row.personnel_code || '';
    const role = row.job_title || '';
    const photo = avatarUrl(row.avatar_path);
    const slug = (row.website_slug || '').trim();
    const href = slug ? `${crewBase}${slug}/` : '';
    const isLead = deptKey === 'leadership';
    const tag = href ? 'a' : 'div';
    const hrefAttr = href ? ` href="${escapeHtml(href)}"` : '';
    const avatarHtml = photo
      ? `<div class="crew-avatar"><img src="${escapeHtml(photo)}" alt="" width="118" height="118" loading="lazy" decoding="async"/></div>`
      : `<div class="crew-avatar" aria-hidden="true"><span class="crew-avatar-fallback">${escapeHtml(initials)}</span></div>`;
    const leadHtml = isLead ? '<span class="crew-lead">Lead</span>' : '';
    const titleHtml = initial
      ? `${escapeHtml(first)} <span class="initial">${escapeHtml(initial)}</span>`
      : escapeHtml(first);

    const el = document.createElement(tag);
    el.className = 'crew-card';
    if (!href) el.setAttribute('role', 'group');
    el.dataset.dept = deptKey;
    el.dataset.name = fullSearch;
    el.dataset.badge = badge.toLowerCase();
    if (hrefAttr) el.setAttribute('href', href);
    el.innerHTML = `${leadHtml}${avatarHtml}<h3>${titleHtml}</h3><p class="crew-role">${escapeHtml(role)}</p><div class="crew-meta"><span class="crew-badge">${escapeHtml(badge)}</span><span class="crew-status">Active</span></div>`;
    return el;
  }

  function updateAllCount(total) {
    if (!allBtn) return;
    allBtn.textContent = total > 0 ? `All · ${total}` : 'All';
  }

  function apply() {
    const q = normalize(input?.value);
    let shown = 0;
    cards.forEach((card) => {
      const deptOk = dept === 'all' || card.dataset.dept === dept;
      const hay = normalize(`${card.dataset.name} ${card.dataset.badge}`);
      const queryOk = !q || hay.includes(q);
      const match = deptOk && queryOk;
      card.hidden = !match;
      card.classList.toggle('is-match', Boolean(match && q));
      if (match) shown += 1;
    });
    if (empty) {
      const showEmpty = cards.length > 0 && shown === 0;
      empty.hidden = !showEmpty;
      empty.classList.toggle('is-visible', showEmpty);
      empty.textContent = 'No crew members match that search.';
    }
  }

  function bindFilters() {
    filters.forEach((btn) => {
      btn.addEventListener('click', () => {
        dept = btn.dataset.filter || 'all';
        filters.forEach((b) => {
          const on = b === btn;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-pressed', String(on));
        });
        apply();
      });
    });

    input?.addEventListener('input', apply);
    form?.addEventListener('submit', (e) => {
      const path = location.pathname.replace(/index\.html$/, '');
      const onCrewDir = /(^|\/)crew\/?$/.test(path);
      if (!onCrewDir) return;
      e.preventDefault();
      apply();
      const first = cards.find((c) => !c.hidden);
      first?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }

  async function loadCrew() {
    try {
      const qParam = new URLSearchParams(location.search).get('q');
      if (qParam && input) input.value = qParam;
    } catch (_) {}

    bindFilters();

    if (!cfg.url || !cfg.anonKey) {
      if (loading) loading.textContent = 'Crew directory unavailable.';
      grid.setAttribute('aria-busy', 'false');
      return;
    }

    const url =
      `${cfg.url}/rest/v1/personnel_website` +
      `?select=id,first_name,last_name,preferred_name,middle_name,job_title,personnel_code,website_category,avatar_path,website_slug,website_sort_order` +
      `&order=website_sort_order.asc,last_name.asc,first_name.asc`;

    try {
      const res = await fetch(url, {
        headers: {
          apikey: cfg.anonKey,
          Authorization: `Bearer ${cfg.anonKey}`,
          Accept: 'application/json',
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const rows = await res.json();

      if (loading) loading.remove();
      grid.querySelectorAll('.crew-card').forEach((n) => n.remove());

      const frag = document.createDocumentFragment();
      (rows || []).forEach((row) => {
        if (!row.website_category) return;
        frag.appendChild(renderCard(row));
      });
      grid.insertBefore(frag, empty || null);
      cards = [...grid.querySelectorAll('.crew-card')];
      updateAllCount(cards.length);
      grid.setAttribute('aria-busy', 'false');

      if (cards.length === 0 && empty) {
        empty.hidden = false;
        empty.classList.add('is-visible');
        empty.textContent = 'No published crew members yet.';
      } else {
        apply();
      }
    } catch (err) {
      if (loading) {
        loading.textContent = 'Could not load crew. Please try again later.';
        loading.classList.add('is-visible');
      }
      grid.setAttribute('aria-busy', 'false');
      console.warn('Crew directory load failed', err);
    }
  }

  loadCrew();
})();

/* Area checker — ZIP/city match shows the service city; routes to San Jose main office */
(() => {
  const form = document.getElementById('area-check-form');
  const input = document.getElementById('area-query');
  const result = document.getElementById('area-check-result');
  if (!form || !input || !result) return;

  const AREAS = [
    {
      city: 'San Francisco',
      zips: ['94102','94103','94104','94105','94107','94108','94109','94110','94111','94112','94114','94115','94116','94117','94118','94121','94122','94123','94124','94127','94129','94130','94131','94132','94133','94134','94158'],
      aliases: ['san francisco','sf']
    },
    {
      city: 'San Mateo County, Bay side',
      detail: 'Daly City to Menlo Park',
      zips: ['94005','94014','94015','94080','94066','94030','94010','94401','94402','94403','94404','94002','94070','94061','94062','94063','94065','94025','94027','94028'],
      aliases: ['san mateo','san mateo county bay side','peninsula','daly city','colma','south san francisco','san bruno','millbrae','burlingame','foster city','belmont','san carlos','redwood city','atherton','menlo park','hillsborough']
    },
    {
      city: 'San Mateo County, coast',
      detail: 'Pacifica to Pescadero',
      zips: ['94044','94037','94038','94018','94019','94020','94021','94060','94074'],
      aliases: ['san mateo county coast','coastside','pacifica','montara','moss beach','el granada','half moon bay','la honda','pescadero','san gregorio']
    },
    {
      city: 'Santa Clara County',
      detail: 'Palo Alto to San Jose and Los Gatos',
      zips: ['94301','94303','94304','94305','94306','94040','94041','94043','94022','94024','94085','94086','94087','94089','95014','95050','95051','95054','95008','95070','95030','95032','95033','95110','95111','95112','95113','95116','95117','95118','95119','95120','95121','95122','95123','95124','95125','95126','95127','95128','95129','95130','95131','95132','95133','95134','95135','95136','95138','95139','95148'],
      aliases: ['santa clara','santa clara county','south bay','palo alto','mountain view','los altos','sunnyvale','cupertino','campbell','saratoga','los gatos','san jose','milpitas']
    },
    {
      city: 'Santa Cruz County',
      detail: 'Santa Cruz, the San Lorenzo Valley, Capitola and Aptos',
      zips: ['95060','95062','95064','95065','95066','95018','95005','95006','95007','95010','95073','95003','95017'],
      aliases: ['santa cruz','santa cruz county','scotts valley','felton','ben lomond','boulder creek','brookdale','capitola','aptos','soquel','davenport']
    }
  ];

  const ZIP = {};
  const CITY = {};
  const chips = [...document.querySelectorAll('.area-check-chips-list [data-area]')];
  AREAS.forEach(area => {
    area.zips.forEach(z => { ZIP[z] = area; });
    area.aliases.forEach(a => { CITY[a] = area; });
    CITY[area.city.toLowerCase()] = area;
  });

  const norm = (s) => (s || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const title = (s) => s.replace(/\b\w/g, c => c.toUpperCase());
  const phoneHref = () => (window.GB_CONTACT && window.GB_CONTACT.phoneTel) || 'tel:5104328461';
  const phoneText = () => (window.GB_CONTACT && window.GB_CONTACT.phoneText) || '(510) 432-8461';

  function lookup(raw) {
    const q = norm(raw);
    if (!q) return null;
    if (/^\d{5}$/.test(q)) {
      const area = ZIP[q];
      if (!area) return { hit: false, query: q };
      return { hit: true, city: area.city, detail: area.detail || '', zip: q };
    }
    const exact = CITY[q];
    if (exact) return { hit: true, city: exact.city, detail: exact.detail || '', zip: '' };
    const soft = Object.keys(CITY).find(c => q.includes(c) || c.includes(q));
    if (soft) {
      const area = CITY[soft];
      return { hit: true, city: area.city, detail: area.detail || '', zip: '' };
    }
    return { hit: false, query: title(q) };
  }

  function setChipActive(city) {
    chips.forEach(btn => btn.classList.toggle('is-active', btn.getAttribute('data-area') === city));
  }

  function render(info) {
    result.hidden = false;
    result.classList.add('is-visible');
    if (!info) {
      result.className = 'area-check-result is-visible is-miss';
      result.innerHTML = '<strong>Enter a city or ZIP</strong><p>Tell us where you\'re building and we\'ll confirm coverage.</p>';
      setChipActive('');
      return;
    }
    if (!info.hit) {
      result.className = 'area-check-result is-visible is-miss';
      result.innerHTML = `<strong>Not sure about ${info.query} yet</strong><p>Call the main office and we\'ll confirm coverage — <a href="${phoneHref()}">${phoneText()}</a>.</p>`;
      setChipActive('');
      return;
    }
    result.className = 'area-check-result is-visible';
    const detail = info.detail ? `<span class="area-check-city-detail">${info.detail}</span>` : '';
    const zipNote = info.zip ? `<p class="area-check-zip-note">ZIP ${info.zip}</p>` : '';
    result.innerHTML = `<strong>Yes — we build here</strong><p class="area-check-city">${info.city}</p>${detail}${zipNote}<p>Our San Jose main office handles your estimate, contract and scheduling.</p><p><a href="${phoneHref()}">Call the main office — ${phoneText()}</a></p>`;
    setChipActive(info.city);
    const city = document.querySelector('#inquiry-form [name="city"]');
    if (city) city.value = info.city;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    render(lookup(input.value));
  });

  chips.forEach(btn => {
    btn.addEventListener('click', () => {
      input.value = btn.getAttribute('data-area') || '';
      render(lookup(input.value));
    });
  });
})();

/* Projects portfolio: filters, category jump, lightbox */
(() => {
  const grid = document.getElementById('pf-grid');
  if (!grid) return;

  const tiles = [...grid.querySelectorAll('.pf-tile')];
  const filters = [...document.querySelectorAll('.pf-filter')];
  const countEl = document.getElementById('pf-count');
  const heading = document.getElementById('pf-heading');
  const lightbox = document.getElementById('pf-lightbox');
  const lbImg = document.getElementById('pf-lb-img');
  const lbCap = document.getElementById('pf-lb-cap');
  const labels = {
    kitchens: 'Kitchen Remodeling',
    bathrooms: 'Bathroom Remodeling',
    roofing: 'Roofing',
    framing: 'Framing & Structural Work',
    exteriors: 'Exterior Construction',
    interiors: '<span class="pf-heading-line">Interior Remodeling</span><span class="pf-heading-line">&amp; Flooring</span>',
    commercial: 'Commercial Construction'
  };

  let active = 'kitchens';
  let visible = tiles;
  let idx = 0;
  let lastFocus = null;

  function setFilter(key, {scroll = false} = {}) {
    active = key;
    filters.forEach(btn => {
      const on = btn.dataset.filter === key;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-pressed', String(on));
    });
    visible = [];
    tiles.forEach(tile => {
      const show = tile.dataset.category === key;
      tile.classList.toggle('is-hidden', !show);
      if (show) {
        tile.classList.remove('is-entering');
        void tile.offsetWidth;
        tile.classList.add('is-entering');
        visible.push(tile);
      }
    });
    if (countEl) countEl.textContent = String(visible.length);
    if (heading) heading.innerHTML = labels[key] || 'Portfolio';
    if (scroll) {
      document.getElementById('portfolio')?.scrollIntoView({behavior: 'smooth', block: 'start'});
    }
  }

  filters.forEach(btn => btn.addEventListener('click', () => setFilter(btn.dataset.filter)));
  setFilter('kitchens');

  function openAt(i) {
    if (!visible.length || !lightbox) return;
    idx = (i + visible.length) % visible.length;
    const tile = visible[idx];
    lbImg.src = tile.dataset.src;
    lbImg.alt = tile.querySelector('img')?.alt || '';
    lbCap.textContent = tile.querySelector('.pf-tile-meta small')?.textContent + ' · ' + (tile.querySelector('.pf-tile-meta b')?.textContent || '');
    if (!lightbox.open) lightbox.showModal();
  }

  function closeLb() {
    if (!lightbox?.open) return;
    lightbox.close();
    lbImg.removeAttribute('src');
    lastFocus?.focus();
  }

  tiles.forEach(tile => tile.addEventListener('click', () => {
    lastFocus = tile;
    const list = visible.length ? visible : tiles.filter(t => !t.classList.contains('is-hidden'));
    visible = list;
    openAt(visible.indexOf(tile));
  }));

  lightbox?.querySelector('.pf-lb-close')?.addEventListener('click', closeLb);
  lightbox?.querySelector('.pf-lb-prev')?.addEventListener('click', () => openAt(idx - 1));
  lightbox?.querySelector('.pf-lb-next')?.addEventListener('click', () => openAt(idx + 1));
  lightbox?.addEventListener('click', e => { if (e.target === lightbox) closeLb(); });
  document.addEventListener('keydown', e => {
    if (!lightbox?.open) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') openAt(idx - 1);
    if (e.key === 'ArrowRight') openAt(idx + 1);
  });

  // Sticky filter shadow when pinned
  const toolbar = document.getElementById('pf-toolbar');
  if (toolbar && 'IntersectionObserver' in window) {
    const sentinel = document.createElement('div');
    sentinel.style.height = '1px';
    toolbar.parentNode.insertBefore(sentinel, toolbar);
    const io = new IntersectionObserver(([entry]) => {
      toolbar.classList.toggle('is-stuck', !entry.isIntersecting);
    });
    io.observe(sentinel);
  }
})();


/* Homepage service cards can jump into a portfolio filter */
document.addEventListener('click', (e) => {
  const a = e.target.closest('[data-pf-jump]');
  if (!a) return;
  const key = a.getAttribute('data-pf-jump');
  const btn = document.querySelector(`.pf-filter[data-filter="${key}"]`);
  if (btn) {
    e.preventDefault();
    btn.click();
    document.getElementById('portfolio')?.scrollIntoView({behavior:'smooth', block:'start'});
  }
});

/* Hide specific SociableKIT Yelp reviews by author */
(() => {
  const HIDE = [/^\s*ajay\s*v\.?\s*$/i, /^\s*diana\s*a\.?\s*$/i];
  const roots = () => [...document.querySelectorAll('.sk-ww-yelp-reviews')];

  function authorName(item) {
    const link = item.querySelector('.sk-post-username a');
    if (link) return (link.textContent || '').replace(/\s+/g, ' ').trim();
    const block = item.querySelector('.sk-post-username');
    if (!block) return '';
    return (block.textContent || '').split(/\breviewed\b/i)[0].replace(/\s+/g, ' ').trim();
  }

  function hideMatching(root) {
    root.querySelectorAll('.sk-yelp-summary-badge').forEach(item => {
      item.style.display = 'none';
    });
    root.querySelectorAll('.sk-post-item').forEach(item => {
      const name = authorName(item);
      if (HIDE.some(re => re.test(name))) item.style.display = 'none';
    });
  }

  function scan() {
    roots().forEach(hideMatching);
  }

  const mo = new MutationObserver(() => {
    mo.disconnect();
    scan();
    roots().forEach(root => mo.observe(root, { childList: true, subtree: true }));
  });

  scan();
  roots().forEach(root => mo.observe(root, { childList: true, subtree: true }));
  // Widget may inject after first paint
  let tries = 0;
  const poll = setInterval(() => {
    scan();
    roots().forEach(root => mo.observe(root, { childList: true, subtree: true }));
    if (++tries > 40 || document.querySelectorAll('.sk-post-item').length) clearInterval(poll);
  }, 250);
})();
