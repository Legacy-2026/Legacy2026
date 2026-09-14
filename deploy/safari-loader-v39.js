(() => {
  'use strict';
  if (window.__SAFARI_LOADER_V39_READY__) return;
  window.__SAFARI_LOADER_V39_READY__ = true;

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

  function badgeV39() {
    const badge = document.getElementById('safariVersionBadge');
    if (badge) badge.textContent = 'VERSIÓN V39';
  }

  (async () => {
    loadCSS('./deploy/v33-responsive.css?v=39', 'safari-responsive-v39-css');
    loadCSS('./deploy/v35-move-item.css?v=39', 'safari-move-item-v39-css');
    loadCSS('./deploy/v36-comodin-registry.css?v=39', 'safari-comodin-registry-base-v39-css');
    loadCSS('./deploy/v37-comodin-registry.css?v=39', 'safari-comodin-registry-v39-css');

    try {
      await loadScript('./deploy/v32-device-auth.js?v=39', 'safari-device-auth-v39-js');
    } catch (error) {
      console.error('Safari Device Auth V39 no pudo cargarse:', error);
    }

    try {
      await loadScript('./deploy/safari-loader-v31.js?v=39', 'safari-loader-v31-v39-compat-js');
    } catch (error) {
      console.error('Safari V31 compatibility stack no pudo cargarse:', error);
    }

    try {
      await loadScript('./deploy/v33-archivo.js?v=39', 'safari-archivo-v39-js');
    } catch (error) {
      console.error('Safari Archivo V39 no pudo cargarse:', error);
    }

    try {
      await loadScript('./deploy/v34-linkify.js?v=39', 'safari-linkify-v39-js');
    } catch (error) {
      console.error('Safari Linkify V39 no pudo cargarse:', error);
    }

    try {
      await loadScript('./deploy/v35-move-item.js?v=39', 'safari-move-item-v39-js');
    } catch (error) {
      console.error('Safari Move Item V39 no pudo cargarse:', error);
    }

    try {
      await loadScript('./deploy/v37-comodin-registry.js?v=39', 'safari-comodin-registry-v39-js');
    } catch (error) {
      console.error('Safari Comodín Registry V39 no pudo cargarse:', error);
    }

    try {
      await loadScript('./deploy/v38-sanction-scores.js?v=39', 'safari-sanction-scores-v39-js');
    } catch (error) {
      console.error('Safari Sanction Scores V39 no pudo cargarse:', error);
    }

    try {
      await loadScript('./deploy/v39-word-export.js?v=39', 'safari-word-export-v39-js');
    } catch (error) {
      console.error('Safari Word Export V39 no pudo cargarse:', error);
    }

    badgeV39();
  })();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(badgeV39, 0), { once: true });
  } else {
    setTimeout(badgeV39, 0);
  }
})();
