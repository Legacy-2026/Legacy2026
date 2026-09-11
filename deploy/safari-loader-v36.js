(() => {
  'use strict';
  if (window.__SAFARI_LOADER_V36_READY__) return;
  window.__SAFARI_LOADER_V36_READY__ = true;

  window.__SAFARI_ARCHIVO_V29_READY__ = true;

  function loadScript(src, id) {
    return new Promise((resolve, reject) => {
      const existing = document.getElementById(id);
      if (existing?.dataset.loaded === '1') return resolve();
      if (existing) existing.remove();
      const script = document.createElement('script');
      script.id = id;
      script.src = src;
      script.async = false;
      script.onload = () => { script.dataset.loaded = '1'; resolve(); };
      script.onerror = () => reject(new Error(`No se pudo cargar ${src}`));
      document.body.appendChild(script);
    });
  }

  function loadCSS(href, id) {
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }

  function badgeV36() {
    const badge = document.getElementById('safariVersionBadge');
    if (badge) badge.textContent = 'VERSIÓN V36';
  }

  (async () => {
    loadCSS('./deploy/v33-responsive.css?v=36', 'safari-responsive-v36-css');
    loadCSS('./deploy/v35-move-item.css?v=36', 'safari-move-item-v36-css');
    loadCSS('./deploy/v36-comodin-registry.css?v=36', 'safari-comodin-registry-v36-css');

    try {
      await loadScript('./deploy/v32-device-auth.js?v=36', 'safari-device-auth-v36-js');
    } catch (error) {
      console.error('Safari Device Auth V36 no pudo cargarse:', error);
    }

    try {
      await loadScript('./deploy/safari-loader-v31.js?v=36', 'safari-loader-v31-v36-compat-js');
    } catch (error) {
      console.error('Safari V31 compatibility stack no pudo cargarse:', error);
    }

    try {
      await loadScript('./deploy/v33-archivo.js?v=36', 'safari-archivo-v36-js');
    } catch (error) {
      console.error('Safari Archivo V36 no pudo cargarse:', error);
    }

    try {
      await loadScript('./deploy/v34-linkify.js?v=36', 'safari-linkify-v36-js');
    } catch (error) {
      console.error('Safari Linkify V36 no pudo cargarse:', error);
    }

    try {
      await loadScript('./deploy/v35-move-item.js?v=36', 'safari-move-item-v36-js');
    } catch (error) {
      console.error('Safari Move Item V36 no pudo cargarse:', error);
    }

    try {
      await loadScript('./deploy/v36-comodin-registry.js?v=36', 'safari-comodin-registry-v36-js');
    } catch (error) {
      console.error('Safari Comodín Registry V36 no pudo cargarse:', error);
    }

    badgeV36();
  })();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(badgeV36, 0), { once: true });
  } else {
    setTimeout(badgeV36, 0);
  }
})();
