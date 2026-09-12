(() => {
  'use strict';
  if (window.__SAFARI_LOADER_V38_READY__) return;
  window.__SAFARI_LOADER_V38_READY__ = true;

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

  function badgeV38() {
    const badge = document.getElementById('safariVersionBadge');
    if (badge) badge.textContent = 'VERSIÓN V38';
  }

  (async () => {
    loadCSS('./deploy/v33-responsive.css?v=38', 'safari-responsive-v38-css');
    loadCSS('./deploy/v35-move-item.css?v=38', 'safari-move-item-v38-css');
    loadCSS('./deploy/v36-comodin-registry.css?v=38', 'safari-comodin-registry-base-v38-css');
    loadCSS('./deploy/v37-comodin-registry.css?v=38', 'safari-comodin-registry-v38-css');

    try {
      await loadScript('./deploy/v32-device-auth.js?v=38', 'safari-device-auth-v38-js');
    } catch (error) {
      console.error('Safari Device Auth V38 no pudo cargarse:', error);
    }

    try {
      await loadScript('./deploy/safari-loader-v31.js?v=38', 'safari-loader-v31-v38-compat-js');
    } catch (error) {
      console.error('Safari V31 compatibility stack no pudo cargarse:', error);
    }

    try {
      await loadScript('./deploy/v33-archivo.js?v=38', 'safari-archivo-v38-js');
    } catch (error) {
      console.error('Safari Archivo V38 no pudo cargarse:', error);
    }

    try {
      await loadScript('./deploy/v34-linkify.js?v=38', 'safari-linkify-v38-js');
    } catch (error) {
      console.error('Safari Linkify V38 no pudo cargarse:', error);
    }

    try {
      await loadScript('./deploy/v35-move-item.js?v=38', 'safari-move-item-v38-js');
    } catch (error) {
      console.error('Safari Move Item V38 no pudo cargarse:', error);
    }

    try {
      await loadScript('./deploy/v37-comodin-registry.js?v=38', 'safari-comodin-registry-v38-js');
    } catch (error) {
      console.error('Safari Comodín Registry V38 no pudo cargarse:', error);
    }

    try {
      await loadScript('./deploy/v38-sanction-scores.js?v=38', 'safari-sanction-scores-v38-js');
    } catch (error) {
      console.error('Safari Sanction Scores V38 no pudo cargarse:', error);
    }

    badgeV38();
  })();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(badgeV38, 0), { once: true });
  } else {
    setTimeout(badgeV38, 0);
  }
})();
