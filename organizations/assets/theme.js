(function (window, document) {
  'use strict';

  var STORAGE_KEY = 'careerTheme_v2';
  var LEGACY_KEY = 'careerTheme';
  var WINDOW_NAME_TOKEN = '__career_theme__=';
  var DEFAULT_THEME = 'light';

  function normalize(value) {
    return value === 'dark' || value === 'light' ? value : null;
  }

  function safeLocalGet(key) {
    try {
      return window.localStorage ? window.localStorage.getItem(key) : null;
    } catch (error) {
      return null;
    }
  }

  function safeLocalSet(key, value) {
    try {
      if (window.localStorage) {
        window.localStorage.setItem(key, value);
        return true;
      }
    } catch (error) {
      return false;
    }
    return false;
  }

  function safeLocalRemove(key) {
    try {
      if (window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      /* File-based Windows browsing may block localStorage. */
    }
  }

  function readWindowName() {
    try {
      var pattern = new RegExp('(?:^|\\|)' + WINDOW_NAME_TOKEN + '(light|dark)(?:\\||$)');
      var match = String(window.name || '').match(pattern);
      return match ? normalize(match[1]) : null;
    } catch (error) {
      return null;
    }
  }

  function writeWindowName(theme) {
    try {
      var current = String(window.name || '');
      var pattern = new RegExp('(?:^|\\|)' + WINDOW_NAME_TOKEN + '(?:light|dark)(?=\\||$)', 'g');
      current = current.replace(pattern, '').replace(/^\|+|\|+$/g, '').replace(/\|{2,}/g, '|');
      window.name = (current ? current + '|' : '') + WINDOW_NAME_TOKEN + theme;
    } catch (error) {
      /* window.name is only a fallback. */
    }
  }

  function readCookie() {
    try {
      var match = document.cookie.match(/(?:^|;\s*)careerTheme_v2=(light|dark)(?:;|$)/);
      return match ? normalize(match[1]) : null;
    } catch (error) {
      return null;
    }
  }

  function writeCookie(theme) {
    try {
      document.cookie = 'careerTheme_v2=' + theme + '; path=/; max-age=31536000; SameSite=Lax';
    } catch (error) {
      /* Cookies may be unavailable when the project is opened from disk. */
    }
  }

  function getStoredTheme() {
    return (
      normalize(safeLocalGet(STORAGE_KEY)) ||
      readCookie() ||
      readWindowName() ||
      DEFAULT_THEME
    );
  }

  function saveTheme(theme) {
    safeLocalSet(STORAGE_KEY, theme);
    safeLocalRemove(LEGACY_KEY);
    writeCookie(theme);
    writeWindowName(theme);
  }

  function updateMetaColor(theme) {
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', theme === 'dark' ? '#07111e' : '#f3f6fa');
    }
  }

  function updateButton(button, theme) {
    if (!button) return;

    var isDark = theme === 'dark';
    button.textContent = isDark ? '☀' : '☾';
    button.setAttribute(
      'aria-label',
      isDark ? 'Switch to light theme' : 'Switch to dark theme'
    );
    button.setAttribute(
      'title',
      isDark ? 'Switch to light theme' : 'Switch to dark theme'
    );
    button.setAttribute('aria-pressed', String(isDark));
    button.setAttribute('data-current-theme', theme);
  }

  function updateAllButtons(theme) {
    var buttons = document.querySelectorAll('#themeBtn, [data-theme-toggle]');
    for (var index = 0; index < buttons.length; index += 1) {
      updateButton(buttons[index], theme);
    }
  }

  function applyTheme(theme, persist) {
    theme = normalize(theme) || DEFAULT_THEME;

    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme;
    updateMetaColor(theme);
    updateAllButtons(theme);

    if (persist) {
      saveTheme(theme);
    }

    try {
      window.dispatchEvent(
        new CustomEvent('career-theme-changed', {
          detail: { theme: theme }
        })
      );
    } catch (error) {
      /* CustomEvent fallback is not required for the theme itself. */
    }

    return theme;
  }

  function toggleTheme() {
    var current = normalize(
      document.documentElement.getAttribute('data-theme')
    ) || DEFAULT_THEME;

    return applyTheme(current === 'dark' ? 'light' : 'dark', true);
  }

  function bindButton(button) {
    if (!button || button.getAttribute('data-theme-bound') === 'true') return;

    button.setAttribute('data-theme-bound', 'true');
    button.setAttribute('type', 'button');
    updateButton(
      button,
      normalize(document.documentElement.getAttribute('data-theme')) || DEFAULT_THEME
    );

    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      toggleTheme();
    });
  }

  function bindButtons() {
    var buttons = document.querySelectorAll('#themeBtn, [data-theme-toggle]');
    for (var index = 0; index < buttons.length; index += 1) {
      bindButton(buttons[index]);
    }
  }

  function init() {
    applyTheme(getStoredTheme(), false);

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', bindButtons, { once: true });
    } else {
      bindButtons();
    }
  }

  window.CAREER_THEME = {
    storageKey: STORAGE_KEY,
    defaultTheme: DEFAULT_THEME,
    get: getStoredTheme,
    apply: applyTheme,
    set: function (theme) {
      return applyTheme(theme, true);
    },
    toggle: toggleTheme,
    bindButton: bindButton,
    bindButtons: bindButtons,
    init: init
  };

  init();

  window.addEventListener('storage', function (event) {
    if (event.key === STORAGE_KEY) {
      applyTheme(normalize(event.newValue) || DEFAULT_THEME, false);
    }
  });
})(window, document);
