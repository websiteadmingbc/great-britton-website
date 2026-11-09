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

  // Phone links: swap number and visible text (keeps icons intact)
  document.querySelectorAll('a[href^="tel:"]').forEach(a => {
    a.setAttribute('href', START.phoneTel);
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

/* Meet the Crew directory — search + department filters */
(() => {
  const grid = document.getElementById('crew-grid');
  if (!grid) return;
  const cards = [...grid.querySelectorAll('.crew-card')];
  const empty = document.getElementById('crew-empty');
  const form = document.getElementById('crew-search-form');
  const input = document.getElementById('crew-query');
  const filters = [...document.querySelectorAll('.crew-filter')];
  let dept = 'all';

  const normalize = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '');

  // Prefill from ?q= for badge / manual verify links
  try {
    const qParam = new URLSearchParams(location.search).get('q');
    if (qParam && input) input.value = qParam;
  } catch (_) {}

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
      empty.hidden = shown !== 0;
      empty.classList.toggle('is-visible', shown === 0);
    }
  }

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
    // Homepage form posts to /crew/?q=… ; directory page filters in place.
    const path = location.pathname.replace(/index\.html$/, '');
    const onCrewDir = /(^|\/)crew\/?$/.test(path);
    if (!onCrewDir) return;
    e.preventDefault();
    apply();
    const first = cards.find((c) => !c.hidden);
    first?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  apply();
})();
