(() => {
  'use strict';

  const data = Array.isArray(window.RECALLS_DATA) ? window.RECALLS_DATA : [];
  const meta = window.RECALLS_META || {};

  const CATEGORY_ORDER = ['History', 'Communication', 'Video', 'Clinical', 'Development', 'Others'];
  const CATEGORY_CONFIG = {
    All: { color: '#22d3ee', icon: '◉', short: 'All' },
    History: { color: '#38bdf8', icon: 'H', short: 'Hx' },
    Communication: { color: '#f59e0b', icon: 'C', short: 'Com' },
    Video: { color: '#fb7185', icon: 'V', short: 'Vid' },
    Clinical: { color: '#34d399', icon: 'C', short: 'Clin' },
    Development: { color: '#a78bfa', icon: 'D', short: 'Dev' },
    Others: { color: '#94a3b8', icon: '+', short: 'Other' }
  };

  const MONTH_ORDER = {
    January: 1,
    February: 2,
    March: 3,
    April: 4,
    May: 5,
    June: 6,
    July: 7,
    August: 8,
    September: 9,
    October: 10,
    November: 11,
    December: 12
  };

  const state = {
    query: '',
    category: 'All',
    year: '',
    country: '',
    center: '',
    month: '',
    sort: 'newest'
  };

  const els = {
    categoryStats: document.getElementById('categoryStats'),
    categoryFilters: document.getElementById('categoryFilters'),
    searchInput: document.getElementById('searchInput'),
    clearSearch: document.getElementById('clearSearch'),
    yearFilter: document.getElementById('yearFilter'),
    countryFilter: document.getElementById('countryFilter'),
    centerFilter: document.getElementById('centerFilter'),
    monthFilter: document.getElementById('monthFilter'),
    sortFilter: document.getElementById('sortFilter'),
    activeFilters: document.getElementById('activeFilters'),
    resetFilters: document.getElementById('resetFilters'),
    emptyReset: document.getElementById('emptyReset'),
    results: document.getElementById('results'),
    resultCount: document.getElementById('resultCount'),
    emptyState: document.getElementById('emptyState'),
    expandAll: document.getElementById('expandAll'),
    collapseAll: document.getElementById('collapseAll'),
    printResults: document.getElementById('printResults'),
    themeToggle: document.getElementById('themeToggle'),
    backToTop: document.getElementById('backToTop'),
    sourceModal: document.getElementById('sourceModal'),
    sourceFrame: document.getElementById('sourceFrame'),
    modalTitle: document.getElementById('modalTitle'),
    modalPageNote: document.getElementById('modalPageNote'),
    openPdfLink: document.getElementById('openPdfLink'),
    closeModal: document.getElementById('closeModal'),
    progressPercent: document.getElementById('progressPercent'),
    progressBar: document.getElementById('progressBar'),
    transcribedPageCount: document.getElementById('transcribedPageCount'),
    sourcePageCount: document.getElementById('sourcePageCount'),
    sessionCount: document.getElementById('sessionCount'),
    countryCount: document.getElementById('countryCount'),
    centerCount: document.getElementById('centerCount'),
    yearCount: document.getElementById('yearCount')
  };

  const unique = (values) => [...new Set(values.filter(value => value !== null && value !== undefined && value !== ''))];

  const escapeHtml = (value = '') => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const escapeRegExp = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const highlight = (text, query) => {
    const safe = escapeHtml(text);
    const trimmed = query.trim();
    if (!trimmed) return markUncertain(safe);

    const tokens = unique(trimmed.split(/\s+/).filter(token => token.length >= 2)).slice(0, 8);
    if (!tokens.length) return markUncertain(safe);

    const regex = new RegExp(`(${tokens.map(escapeRegExp).join('|')})`, 'gi');
    return markUncertain(safe.replace(regex, '<mark>$1</mark>'));
  };

  const markUncertain = (html) => html
    .replace(/\[unclear([^\]]*)\]/gi, '<span class="uncertain">[unclear$1]</span>')
    .replace(/\[abbreviation retained from source\]/gi, '<span class="uncertain">[abbreviation retained from source]</span>')
    .replace(/\[preceding abbreviation unclear\]/gi, '<span class="uncertain">[preceding abbreviation unclear]</span>');

  const flattenSession = (session) => {
    const sectionText = Object.entries(session.sections || {})
      .flatMap(([category, items]) => [category, ...(items || [])])
      .join(' ');
    return [
      session.title,
      session.center,
      session.country,
      session.region,
      session.year,
      session.month,
      session.day,
      sectionText
    ].filter(Boolean).join(' ').toLowerCase();
  };

  const categoryCount = (category) => data.reduce((count, session) => {
    return count + ((session.sections?.[category] || []).length);
  }, 0);

  const sessionCategoryCount = (category) => data.filter(session => (session.sections?.[category] || []).length > 0).length;

  const getDateScore = (session) => {
    const year = Number(session.year || 0);
    const month = MONTH_ORDER[session.month] || 0;
    const day = Number(session.day || 0);
    return (year * 10000) + (month * 100) + day;
  };

  const pageLabel = (pages = []) => {
    if (!pages.length) return 'Source page unavailable';
    if (pages.length === 1) return `Page ${pages[0]}`;
    const sorted = [...pages].sort((a, b) => a - b);
    const contiguous = sorted.every((value, index) => index === 0 || value === sorted[index - 1] + 1);
    return contiguous ? `Pages ${sorted[0]}–${sorted.at(-1)}` : `Pages ${sorted.join(', ')}`;
  };

  function populateProjectStats() {
    const sourcePages = Number(meta.sourcePages || 0);
    const transcribed = Number(meta.transcribedThroughPage || 0);
    const percent = sourcePages ? Math.round((transcribed / sourcePages) * 100) : 0;

    els.progressPercent.textContent = `${percent}%`;
    els.transcribedPageCount.textContent = transcribed;
    els.sourcePageCount.textContent = sourcePages;
    els.sessionCount.textContent = data.length;
    els.countryCount.textContent = unique(data.map(item => item.country)).length;
    els.centerCount.textContent = unique(data.map(item => item.center)).length;
    els.yearCount.textContent = unique(data.map(item => item.year)).length;

    requestAnimationFrame(() => {
      els.progressBar.style.width = `${percent}%`;
    });
  }

  function renderCategoryStats() {
    const categories = CATEGORY_ORDER.filter(category => categoryCount(category) > 0);
    els.categoryStats.innerHTML = categories.map(category => {
      const config = CATEGORY_CONFIG[category];
      return `
        <article class="category-stat" style="--category-color:${config.color}">
          <div class="stat-icon">${escapeHtml(config.icon)}</div>
          <h3>${escapeHtml(category)}</h3>
          <p>${sessionCategoryCount(category)} sessions</p>
          <strong>${categoryCount(category)}</strong>
        </article>
      `;
    }).join('');
  }

  function renderCategoryFilters() {
    const categories = ['All', ...CATEGORY_ORDER.filter(category => categoryCount(category) > 0)];
    els.categoryFilters.innerHTML = categories.map(category => {
      const config = CATEGORY_CONFIG[category];
      const count = category === 'All' ? data.length : sessionCategoryCount(category);
      return `
        <button
          class="filter-chip ${state.category === category ? 'active' : ''}"
          style="--chip-color:${config.color}"
          type="button"
          data-category="${escapeHtml(category)}"
          aria-pressed="${state.category === category}">
          <span>${escapeHtml(category)}</span>
          <span class="chip-count">${count}</span>
        </button>
      `;
    }).join('');
  }

  function fillSelect(select, values, label, sortFn) {
    const current = select.value;
    const sorted = [...values].sort(sortFn || ((a, b) => String(a).localeCompare(String(b))));
    select.innerHTML = `<option value="">All ${escapeHtml(label)}</option>` + sorted
      .map(value => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`)
      .join('');
    if (sorted.map(String).includes(String(current))) select.value = current;
  }

  function populateFilters() {
    fillSelect(els.yearFilter, unique(data.map(item => item.year)), 'years', (a, b) => Number(b) - Number(a));
    fillSelect(els.countryFilter, unique(data.map(item => item.country)), 'countries');
    fillSelect(els.monthFilter, unique(data.map(item => item.month)), 'months', (a, b) => (MONTH_ORDER[a] || 99) - (MONTH_ORDER[b] || 99));
    refreshCenterOptions();
  }

  function refreshCenterOptions() {
    const centers = unique(data
      .filter(item => !state.country || item.country === state.country)
      .map(item => item.center));
    const previous = state.center;
    fillSelect(els.centerFilter, centers, 'centres');
    if (previous && centers.includes(previous)) {
      els.centerFilter.value = previous;
    } else if (previous) {
      state.center = '';
    }
  }

  function getFilteredData() {
    const query = state.query.trim().toLowerCase();
    let filtered = data.filter(session => {
      if (state.category !== 'All' && !(session.sections?.[state.category] || []).length) return false;
      if (state.year && String(session.year) !== String(state.year)) return false;
      if (state.country && session.country !== state.country) return false;
      if (state.center && session.center !== state.center) return false;
      if (state.month && session.month !== state.month) return false;
      if (query && !flattenSession(session).includes(query)) {
        const queryTokens = query.split(/\s+/).filter(Boolean);
        const haystack = flattenSession(session);
        if (!queryTokens.every(token => haystack.includes(token))) return false;
      }
      return true;
    });

    filtered.sort((a, b) => {
      if (state.sort === 'oldest') return getDateScore(a) - getDateScore(b) || a.title.localeCompare(b.title);
      if (state.sort === 'center') return a.center.localeCompare(b.center) || getDateScore(b) - getDateScore(a);
      return getDateScore(b) - getDateScore(a) || a.title.localeCompare(b.title);
    });

    return filtered;
  }

  function shouldOpenSection(category, items) {
    if (state.category !== 'All') return category === state.category;
    if (!state.query.trim()) return false;
    const queryTokens = state.query.toLowerCase().split(/\s+/).filter(Boolean);
    const sectionText = [category, ...items].join(' ').toLowerCase();
    return queryTokens.some(token => token.length >= 2 && sectionText.includes(token));
  }

  function renderSection(category, items) {
    const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.Others;
    const isOpen = shouldOpenSection(category, items);
    return `
      <details class="recall-section" style="--section-color:${config.color}" ${isOpen ? 'open' : ''}>
        <summary>
          <span class="section-symbol">${escapeHtml(config.short)}</span>
          <span class="section-name">${escapeHtml(category)}</span>
          <span class="section-count">${items.length} item${items.length === 1 ? '' : 's'}</span>
          <span class="section-chevron" aria-hidden="true">⌄</span>
        </summary>
        <ul>
          ${items.map(item => `<li>${highlight(item, state.query)}</li>`).join('')}
        </ul>
      </details>
    `;
  }

  function renderCard(session) {
    const categories = CATEGORY_ORDER.filter(category => (session.sections?.[category] || []).length > 0);
    const visibleCategories = state.category === 'All' ? categories : categories.filter(category => category === state.category);
    const firstPage = session.pages?.[0] || 1;
    const dateParts = [session.month, session.year, session.day ? `Day ${session.day}` : null].filter(Boolean);

    return `
      <article class="recall-card" data-session-id="${escapeHtml(session.id)}">
        <header class="recall-card-header">
          <div class="card-topline">
            <h3>${highlight(session.title, state.query)}</h3>
            <span class="location-badge">⌖ ${escapeHtml(session.country)}</span>
          </div>
          <div class="card-meta">
            <span>🏥 ${escapeHtml(session.center)}</span>
            <span>◷ ${escapeHtml(dateParts.join(' • '))}</span>
            <span>▤ ${escapeHtml(pageLabel(session.pages))}</span>
          </div>
          <div class="card-categories">
            ${categories.map(category => {
              const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.Others;
              return `<span class="card-category" style="--cat-color:${config.color}">${escapeHtml(category)}</span>`;
            }).join('')}
          </div>
        </header>

        <div class="card-body">
          ${visibleCategories.map(category => renderSection(category, session.sections[category])).join('')}
        </div>

        <div class="card-actions">
          <button class="card-action primary-action" type="button" data-source-page="${firstPage}" data-source-title="${escapeHtml(session.title)}" data-source-pages="${escapeHtml(pageLabel(session.pages))}">View source</button>
          <button class="card-action" type="button" data-copy-session="${escapeHtml(session.id)}">Copy full text</button>
        </div>
      </article>
    `;
  }

  function renderActiveFilters() {
    const filters = [];
    if (state.query) filters.push(`Search: “${state.query}”`);
    if (state.category !== 'All') filters.push(`Category: ${state.category}`);
    if (state.year) filters.push(`Year: ${state.year}`);
    if (state.country) filters.push(`Country: ${state.country}`);
    if (state.center) filters.push(`Centre: ${state.center}`);
    if (state.month) filters.push(`Month: ${state.month}`);

    els.activeFilters.innerHTML = filters.length
      ? filters.map(filter => `<span class="active-filter">${escapeHtml(filter)}</span>`).join('')
      : '<span>No active filters — showing the complete transcribed batch.</span>';
  }

  function render() {
    renderCategoryFilters();
    const filtered = getFilteredData();
    els.resultCount.textContent = filtered.length;
    els.results.innerHTML = filtered.map(renderCard).join('');
    els.emptyState.hidden = filtered.length > 0;
    els.results.hidden = filtered.length === 0;
    renderActiveFilters();
    bindDynamicEvents();
  }

  function formatSessionForCopy(session) {
    const lines = [session.title, `${session.center}, ${session.country}`, pageLabel(session.pages), ''];
    CATEGORY_ORDER.forEach(category => {
      const items = session.sections?.[category] || [];
      if (!items.length) return;
      lines.push(`${category}:`);
      items.forEach((item, index) => lines.push(`${index + 1}. ${item}`));
      lines.push('');
    });
    lines.push(meta.notice || 'Study recall material only.');
    return lines.join('\n');
  }

  async function copyText(text, button) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (_) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
    }

    const original = button.textContent;
    button.textContent = 'Copied';
    setTimeout(() => { button.textContent = original; }, 1400);
  }

  function bindDynamicEvents() {
    document.querySelectorAll('[data-source-page]').forEach(button => {
      button.addEventListener('click', () => {
        openSourceModal({
          page: Number(button.dataset.sourcePage || 1),
          title: button.dataset.sourceTitle || 'Recall source',
          pages: button.dataset.sourcePages || ''
        });
      });
    });

    document.querySelectorAll('[data-copy-session]').forEach(button => {
      button.addEventListener('click', () => {
        const session = data.find(item => item.id === button.dataset.copySession);
        if (session) copyText(formatSessionForCopy(session), button);
      });
    });
  }

  function resetFilters() {
    state.query = '';
    state.category = 'All';
    state.year = '';
    state.country = '';
    state.center = '';
    state.month = '';
    state.sort = 'newest';

    els.searchInput.value = '';
    els.yearFilter.value = '';
    els.countryFilter.value = '';
    els.monthFilter.value = '';
    els.sortFilter.value = 'newest';
    refreshCenterOptions();
    els.centerFilter.value = '';
    render();
  }

  function openSourceModal({ page, title, pages }) {
    const url = `assets/recalls-source.pdf#page=${page}&zoom=page-width`;
    els.sourceFrame.src = url;
    els.modalTitle.textContent = title;
    els.modalPageNote.textContent = `${pages}. The PDF is handwritten; use the transcription and source together for verification.`;
    els.openPdfLink.href = url;
    els.sourceModal.hidden = false;
    document.body.classList.add('modal-open');
    els.closeModal.focus();
  }

  function closeSourceModal() {
    els.sourceModal.hidden = true;
    els.sourceFrame.src = 'about:blank';
    document.body.classList.remove('modal-open');
  }

  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('recalls-theme', theme); } catch (_) { /* Storage may be blocked in local previews. */ }
    els.themeToggle.querySelector('span').textContent = theme === 'dark' ? '☾' : '☀';
    els.themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  }

  function initialiseTheme() {
    let saved = null;
    try { saved = localStorage.getItem('recalls-theme'); } catch (_) { /* Storage may be blocked in local previews. */ }
    if (saved === 'dark' || saved === 'light') {
      setTheme(saved);
      return;
    }
    const prefersLight = window.matchMedia?.('(prefers-color-scheme: light)').matches;
    setTheme(prefersLight ? 'light' : 'dark');
  }

  function bindStaticEvents() {
    els.searchInput.addEventListener('input', event => {
      state.query = event.target.value;
      render();
    });

    els.clearSearch.addEventListener('click', () => {
      state.query = '';
      els.searchInput.value = '';
      els.searchInput.focus();
      render();
    });

    els.categoryFilters.addEventListener('click', event => {
      const button = event.target.closest('[data-category]');
      if (!button) return;
      state.category = button.dataset.category;
      render();
    });

    els.yearFilter.addEventListener('change', event => {
      state.year = event.target.value;
      render();
    });

    els.countryFilter.addEventListener('change', event => {
      state.country = event.target.value;
      refreshCenterOptions();
      render();
    });

    els.centerFilter.addEventListener('change', event => {
      state.center = event.target.value;
      render();
    });

    els.monthFilter.addEventListener('change', event => {
      state.month = event.target.value;
      render();
    });

    els.sortFilter.addEventListener('change', event => {
      state.sort = event.target.value;
      render();
    });

    els.resetFilters.addEventListener('click', resetFilters);
    els.emptyReset.addEventListener('click', resetFilters);

    els.expandAll.addEventListener('click', () => {
      els.results.querySelectorAll('details').forEach(detail => { detail.open = true; });
    });

    els.collapseAll.addEventListener('click', () => {
      els.results.querySelectorAll('details').forEach(detail => { detail.open = false; });
    });

    els.printResults.addEventListener('click', () => {
      els.results.querySelectorAll('details').forEach(detail => { detail.open = true; });
      window.print();
    });

    els.themeToggle.addEventListener('click', () => {
      setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
    });

    els.closeModal.addEventListener('click', closeSourceModal);
    els.sourceModal.addEventListener('click', event => {
      if (event.target.matches('[data-close-modal]')) closeSourceModal();
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !els.sourceModal.hidden) closeSourceModal();
    });

    window.addEventListener('scroll', () => {
      els.backToTop.classList.toggle('visible', window.scrollY > 600);
    }, { passive: true });

    els.backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function initialise() {
    initialiseTheme();
    populateProjectStats();
    renderCategoryStats();
    populateFilters();
    bindStaticEvents();
    render();
  }

  initialise();
})();
