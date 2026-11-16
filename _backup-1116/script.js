(() => {
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('#mobile-menu');
  const closeMenu = (restoreFocus = false) => {
    menu.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Öppna menyn');
    toggle.querySelector('.menu-label').textContent = 'Meny';
    document.body.classList.remove('menu-open');
    if (restoreFocus) toggle.focus();
  };
  toggle.addEventListener('click', () => {
    if (!menu.hidden) return closeMenu(true);
    menu.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Stäng menyn');
    toggle.querySelector('.menu-label').textContent = 'Stäng';
    document.body.classList.add('menu-open');
    menu.querySelector('a').focus();
  });
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
  document.addEventListener('keydown', event => {
    if (menu.hidden) return;
    if (event.key === 'Escape') { event.preventDefault(); closeMenu(true); }
    if (event.key === 'Tab') {
      const links = [...menu.querySelectorAll('a[href]')];
      const first = links[0], last = links.at(-1);
      if (event.shiftKey && (document.activeElement === first || document.activeElement === toggle)) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); toggle.focus();
      } else if (!event.shiftKey && document.activeElement === toggle) {
        event.preventDefault(); first.focus();
      }
    }
  });
  matchMedia('(min-width: 761px)').addEventListener('change', event => { if (event.matches) closeMenu(); });
  document.querySelector('.film').addEventListener('toggle', event => {
    if (!event.currentTarget.open) event.currentTarget.querySelector('video').pause();
  });
  document.getElementById('year').textContent = new Date().getFullYear();

  const viewer = document.querySelector('.viewer');
  const photo = viewer.querySelector('.viewer-image');
  const caption = viewer.querySelector('figcaption');
  const error = viewer.querySelector('.viewer-error');
  const original = viewer.querySelector('.viewer-original');
  const links = [...document.querySelectorAll('a[data-viewer]')];
  let active = 0;
  let opener;
  const showPhoto = index => {
    active = (index + links.length) % links.length;
    const link = links[active];
    error.hidden = true;
    photo.hidden = false;
    viewer.classList.add('is-loading');
    photo.alt = link.querySelector('img')?.alt || link.dataset.caption;
    caption.textContent = link.dataset.caption;
    viewer.querySelector('.viewer-count').textContent = `${active + 1} / ${links.length}`;
    original.href = link.href;
    photo.src = link.href;
  };
  photo.addEventListener('load', () => viewer.classList.remove('is-loading'));
  photo.addEventListener('error', () => {
    viewer.classList.remove('is-loading');
    photo.hidden = true;
    error.hidden = false;
  });
  links.forEach((link, index) => link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || typeof viewer.showModal !== 'function') return;
    event.preventDefault();
    opener = link;
    showPhoto(index);
    viewer.showModal();
    viewer.querySelector('.viewer-close').focus();
  }));
  viewer.querySelector('.viewer-close').addEventListener('click', () => viewer.close());
  viewer.querySelector('.viewer-prev').addEventListener('click', () => showPhoto(active - 1));
  viewer.querySelector('.viewer-next').addEventListener('click', () => showPhoto(active + 1));
  viewer.addEventListener('close', () => opener?.focus({preventScroll: true}));
  viewer.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); showPhoto(active - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); showPhoto(active + 1); }
  });
})();

// Progressively enhanced material guide. All three descriptions remain in HTML.
(() => {
  const guide = document.querySelector('.material-guide');
  if (!guide) return;
  const tablist = guide.querySelector('.material-tabs');
  const tabs = [...guide.querySelectorAll('.material-tab')];
  const panels = [...guide.querySelectorAll('.material-panel')];
  const controls = guide.querySelector('.material-controls');
  const count = guide.querySelector('.material-count');
  let current = 0;
  const show = (index, focusTab = false) => {
    current = (index + tabs.length) % tabs.length;
    tabs.forEach((tab, i) => {
      const selected = i === current;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      panels[i].hidden = !selected;
    });
    count.textContent = `${tabs[current].querySelector('span').textContent}, ${current + 1} av ${tabs.length}`;
    if (focusTab) tabs[current].focus({preventScroll: true});
  };
  tablist.setAttribute('role', 'tablist');
  tablist.setAttribute('aria-label', 'Välj naturmaterial');
  tabs.forEach((tab, i) => {
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panels[i].id);
    panels[i].setAttribute('role', 'tabpanel');
    panels[i].setAttribute('aria-labelledby', tab.id);
    panels[i].tabIndex = 0;
    tab.addEventListener('click', () => show(i));
    tab.addEventListener('keydown', event => {
      const targets = {ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1};
      if (targets[event.key] === undefined) return;
      event.preventDefault();
      show(targets[event.key], true);
    });
  });
  guide.querySelector('.material-prev').addEventListener('click', () => show(current - 1));
  guide.querySelector('.material-next').addEventListener('click', () => show(current + 1));
  const samples = [...guide.querySelectorAll('.material-sample')];
  samples.forEach(img => {
    img.addEventListener('error', () => {
      img.hidden = true;
      img.closest('figure').querySelector('.material-image-fallback').hidden = false;
    });
  });
  // Warm the three lightweight local images only when the guide is near view.
  if ('IntersectionObserver' in window && !navigator.connection?.saveData) {
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      samples.forEach(img => { img.loading = 'eager'; });
      observer.disconnect();
    }, {rootMargin: '250px'});
    observer.observe(guide);
  }
  const selectHash = () => {
    const index = panels.findIndex(panel => '#' + panel.id === location.hash);
    if (index !== -1) show(index);
  };
  show(0);
  selectHash();
  window.addEventListener('hashchange', selectHash);
  tablist.hidden = false;
  controls.hidden = false;
  guide.classList.add('is-ready');
})();
