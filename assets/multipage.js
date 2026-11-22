/* Multi-page nav dropdown + Projects gallery filters / show-more */
(() => {
  const toggles = [...document.querySelectorAll('.nav-dropdown-toggle')];
  toggles.forEach((btn) => {
    const item = btn.closest('.nav-item');
    btn.addEventListener('click', () => {
      const open = item.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });
  document.addEventListener('click', (e) => {
    toggles.forEach((btn) => {
      const item = btn.closest('.nav-item');
      if (!item.contains(e.target)) {
        item.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  });
})();

/* Projects page: category filters + show more (max 9 visible per category) */
(() => {
  const root = document.getElementById('portfolio');
  if (!root || !document.getElementById('pf-grid')) return;

  const grid = document.getElementById('pf-grid');
  const filters = [...document.querySelectorAll('.pf-filter')];
  const countEl = document.getElementById('pf-count');
  const heading = document.getElementById('pf-heading');
  const showMore = document.getElementById('pf-show-more');
  const lightbox = document.getElementById('pf-lightbox');
  const lbImg = document.getElementById('pf-lb-img');
  const lbCap = document.getElementById('pf-lb-cap');
  let visible = [];
  let idx = 0;
  let lastFocus = null;
  let expanded = false;

  function tilesFor(cat) {
    return [...grid.querySelectorAll('.pf-tile')].filter((t) => t.dataset.category === cat);
  }

  function setFilter(cat, label) {
    expanded = false;
    filters.forEach((btn) => {
      const on = btn.dataset.filter === cat;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    const tiles = tilesFor(cat);
    tiles.sort((a, b) => Number(b.dataset.featured === 'true') - Number(a.dataset.featured === 'true'));
    [...grid.querySelectorAll('.pf-tile')].forEach((t) => {
      t.hidden = true;
    });
    tiles.forEach((t, i) => {
      const show = expanded || i < 9;
      t.hidden = !show;
      t.classList.toggle('is-overflow', i >= 9);
    });
    if (countEl) countEl.textContent = String(tiles.length);
    if (heading) heading.textContent = label || cat;
    if (showMore) {
      showMore.hidden = tiles.length <= 9;
      showMore.textContent = 'Show more';
    }
    visible = tiles.filter((t) => !t.hidden);
  }

  filters.forEach((btn) => {
    btn.addEventListener('click', () => setFilter(btn.dataset.filter, btn.dataset.label || btn.textContent.trim()));
  });

  showMore?.addEventListener('click', () => {
    const active = filters.find((b) => b.classList.contains('is-active'));
    if (!active) return;
    expanded = true;
    const tiles = tilesFor(active.dataset.filter);
    tiles.forEach((t) => { t.hidden = false; });
    visible = tiles;
    showMore.hidden = true;
  });

  function openAt(i) {
    if (!visible.length || !lightbox) return;
    idx = (i + visible.length) % visible.length;
    const tile = visible[idx];
    lbImg.src = tile.dataset.webp || tile.dataset.src;
    lbImg.alt = tile.querySelector('img')?.alt || '';
    lbCap.textContent = tile.querySelector('.pf-tile-meta small')?.textContent || '';
    if (!lightbox.open) lightbox.showModal();
  }

  function closeLb() {
    if (!lightbox?.open) return;
    lightbox.close();
    lbImg.removeAttribute('src');
    lastFocus?.focus();
  }

  grid.querySelectorAll('.pf-tile').forEach((tile) => {
    tile.addEventListener('click', () => {
      lastFocus = tile;
      const active = filters.find((b) => b.classList.contains('is-active'));
      visible = tilesFor(active?.dataset.filter || tile.dataset.category).filter((t) => !t.hidden);
      openAt(visible.indexOf(tile));
    });
  });

  lightbox?.querySelector('.pf-lb-close')?.addEventListener('click', closeLb);
  lightbox?.querySelector('.pf-lb-prev')?.addEventListener('click', () => openAt(idx - 1));
  lightbox?.querySelector('.pf-lb-next')?.addEventListener('click', () => openAt(idx + 1));
  lightbox?.addEventListener('click', (e) => { if (e.target === lightbox) closeLb(); });
  document.addEventListener('keydown', (e) => {
    if (!lightbox?.open) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') openAt(idx - 1);
    if (e.key === 'ArrowRight') openAt(idx + 1);
  });

  const first = filters[0];
  if (first) setFilter(first.dataset.filter, first.dataset.label || first.textContent.trim());
})();
