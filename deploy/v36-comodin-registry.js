(() => {
  'use strict';
  if (window.__SAFARI_COMODIN_REGISTRY_V36_READY__) return;
  window.__SAFARI_COMODIN_REGISTRY_V36_READY__ = true;

  const VERSION = 'V36';
  const SUPABASE_URL = 'https://sqxcygylcxlsigcmawma.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_SdZBbhB1onHQHFB-XFX3PQ_rsfgL7Af';
  const TABLE = 'safari_comodin_registry';
  const CATEGORIES = ['diamante', 'oro', 'normal'];
  const LABELS = { diamante: 'DIAMANTE', oro: 'ORO', normal: 'NORMAL' };

  let rows = [];
  let busy = false;
  let editingId = null;
  let polling = false;

  const $ = (id) => document.getElementById(id);

  function headers(extra = {}) {
    return { apikey: SUPABASE_KEY, 'Content-Type': 'application/json', ...extra };
  }

  function escapeHTML(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function currentStaffName() {
    try {
      const id = localStorage.getItem('legacyCurrentStaffV1');
      if (typeof staffProfiles !== 'undefined' && Array.isArray(staffProfiles)) {
        return staffProfiles.find((profile) => profile.id === id)?.name || 'Staff';
      }
    } catch (error) {}
    return 'Staff';
  }

  function newId() {
    if (globalThis.crypto?.randomUUID) return `comodin-${crypto.randomUUID()}`;
    return `comodin-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function ensureUI() {
    if (!$('comodinRegistryCardV36')) {
      const cards = document.querySelector('.cards');
      if (cards) {
        const card = document.createElement('article');
        card.className = 'card comodin-registry-card-v36';
        card.id = 'comodinRegistryCardV36';
        card.innerHTML = `
          <div class="card-top"><span>REGISTRO</span><span id="comodinRegistryCardCountV36">00</span></div>
          <div>
            <h4>Registro de comodines</h4>
            <p id="comodinRegistryCardSummaryV36">Diamante · Oro · Normal. Código y estado de cada comodín.</p>
          </div>
          <button class="ghost-btn" id="openComodinRegistryV36" type="button">ABRIR REGISTRO ↗</button>`;
        cards.appendChild(card);
      }
    }

    if (!$('comodinRegistryModalV36')) {
      const modal = document.createElement('div');
      modal.id = 'comodinRegistryModalV36';
      modal.className = 'comodin-registry-modal-v36';
      modal.setAttribute('aria-hidden', 'true');
      modal.innerHTML = `
        <div class="comodin-registry-backdrop-v36" data-registry-close="1"></div>
        <section class="comodin-registry-window-v36" role="dialog" aria-modal="true" aria-labelledby="comodinRegistryTitleV36">
          <header class="comodin-registry-header-v36">
            <div>
              <p>SAFARI 2026 · LEGACY</p>
              <h3 id="comodinRegistryTitleV36">REGISTRO DE COMODINES</h3>
            </div>
            <button type="button" class="comodin-registry-close-v36" data-registry-close="1" aria-label="Cerrar">×</button>
          </header>

          <div class="comodin-registry-toolbar-v36">
            <div class="comodin-registry-stats-v36">
              <div><span>TOTAL</span><strong id="comodinRegistryTotalV36">0</strong></div>
              <div><span>ENCONTRADOS</span><strong id="comodinRegistryFoundV36">0</strong></div>
              <div><span>PENDIENTES</span><strong id="comodinRegistryPendingV36">0</strong></div>
            </div>
            <button type="button" class="comodin-registry-add-v36" id="addComodinRegistryV36">＋ AÑADIR COMODÍN</button>
          </div>

          <div class="comodin-registry-status-v36" id="comodinRegistryStatusV36"><span></span><strong>SINCRONIZADO</strong></div>

          <main class="comodin-registry-body-v36">
            <div class="comodin-registry-list-v36" id="comodinRegistryListV36"></div>
            <div class="comodin-registry-empty-v36" id="comodinRegistryEmptyV36">
              <strong>SIN COMODINES REGISTRADOS</strong>
              <p>Añadí el primero indicando categoría, código y estado.</p>
            </div>
          </main>
        </section>`;
      document.body.appendChild(modal);
    }

    if (!$('comodinRegistryEditorV36')) {
      const editor = document.createElement('div');
      editor.id = 'comodinRegistryEditorV36';
      editor.className = 'comodin-registry-editor-v36';
      editor.setAttribute('aria-hidden', 'true');
      editor.innerHTML = `
        <div class="comodin-registry-editor-backdrop-v36" data-registry-editor-close="1"></div>
        <section class="comodin-registry-editor-window-v36" role="dialog" aria-modal="true" aria-labelledby="comodinRegistryEditorTitleV36">
          <header>
            <div>
              <p id="comodinRegistryEditorModeV36">NUEVO COMODÍN</p>
              <h4 id="comodinRegistryEditorTitleV36">REGISTRO</h4>
            </div>
            <button type="button" data-registry-editor-close="1" aria-label="Cerrar">×</button>
          </header>
          <form id="comodinRegistryFormV36">
            <label>
              <span>CATEGORÍA</span>
              <select id="comodinRegistryCategoryV36" required>
                <option value="diamante">DIAMANTE</option>
                <option value="oro">ORO</option>
                <option value="normal">NORMAL</option>
              </select>
            </label>
            <label>
              <span>CÓDIGO DEL COMODÍN</span>
              <input id="comodinRegistryCodeV36" type="text" maxlength="120" autocomplete="off" placeholder="Ej.: LEGACY-027-D01" required />
            </label>
            <label>
              <span>ESTADO</span>
              <select id="comodinRegistryFoundInputV36" required>
                <option value="false">NO ENCONTRADO</option>
                <option value="true">ENCONTRADO</option>
              </select>
            </label>
            <div class="comodin-registry-editor-actions-v36">
              <button type="button" data-registry-editor-close="1">CANCELAR</button>
              <button type="submit" id="saveComodinRegistryV36">GUARDAR COMODÍN</button>
            </div>
          </form>
        </section>`;
      document.body.appendChild(editor);
    }
  }

  function setStatus(text, mode = 'ok') {
    const el = $('comodinRegistryStatusV36');
    if (!el) return;
    el.classList.toggle('saving', mode === 'saving');
    el.classList.toggle('error', mode === 'error');
    const strong = el.querySelector('strong');
    if (strong) strong.textContent = text;
  }

  function updateCard() {
    const total = rows.length;
    const found = rows.filter((row) => row.found).length;
    const count = $('comodinRegistryCardCountV36');
    const summary = $('comodinRegistryCardSummaryV36');
    if (count) count.textContent = String(total).padStart(2, '0');
    if (summary) summary.textContent = `${total} registrados · ${found} encontrados · ${total - found} pendientes.`;
  }

  function categoryCounts(category) {
    const subset = rows.filter((row) => row.category === category);
    return { total: subset.length, found: subset.filter((row) => row.found).length };
  }

  function render() {
    ensureUI();
    const host = $('comodinRegistryListV36');
    const empty = $('comodinRegistryEmptyV36');
    if (!host || !empty) return;

    const total = rows.length;
    const found = rows.filter((row) => row.found).length;
    $('comodinRegistryTotalV36').textContent = total;
    $('comodinRegistryFoundV36').textContent = found;
    $('comodinRegistryPendingV36').textContent = total - found;

    host.innerHTML = rows.map((row, index) => `
      <article class="comodin-registry-item-v36 ${row.found ? 'is-found' : 'is-pending'}" data-id="${escapeHTML(row.id)}">
        <div class="comodin-registry-index-v36">${String(index + 1).padStart(2, '0')}</div>
        <div class="comodin-registry-copy-v36">
          <div class="comodin-registry-line-v36">
            <span class="comodin-registry-category-v36 category-${escapeHTML(row.category)}">${escapeHTML(LABELS[row.category] || row.category)}</span>
            <span class="comodin-registry-state-v36">${row.found ? 'ENCONTRADO' : 'NO ENCONTRADO'}</span>
          </div>
          <h5>${escapeHTML(row.code)}</h5>
          <small>AÑADIDO POR ${escapeHTML(row.created_by || 'STAFF')}</small>
        </div>
        <div class="comodin-registry-actions-v36">
          <button type="button" class="comodin-registry-toggle-v36" data-registry-action="toggle" data-id="${escapeHTML(row.id)}">${row.found ? 'MARCAR NO ENCONTRADO' : 'MARCAR ENCONTRADO'}</button>
          <button type="button" data-registry-action="edit" data-id="${escapeHTML(row.id)}">EDITAR</button>
          <button type="button" class="danger" data-registry-action="delete" data-id="${escapeHTML(row.id)}">QUITAR</button>
        </div>
      </article>`).join('');

    empty.classList.toggle('visible', total === 0);
    host.style.display = total ? 'grid' : 'none';
    updateCard();

    const d = categoryCounts('diamante');
    const o = categoryCounts('oro');
    const n = categoryCounts('normal');
    const title = $('comodinRegistryTitleV36');
    if (title) title.dataset.summary = `D ${d.found}/${d.total} · O ${o.found}/${o.total} · N ${n.found}/${n.total}`;
  }

  async function fetchRows() {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/${TABLE}?select=id,category,code,found,created_by,created_at,updated_at,sort_order&order=sort_order.asc,created_at.asc`,
      { headers: headers(), cache: 'no-store' }
    );
    if (!response.ok) throw new Error(`Supabase ${response.status}`);
    return response.json();
  }

  async function refresh({ quiet = false } = {}) {
    if (polling || busy) return;
    polling = true;
    try {
      rows = await fetchRows();
      render();
      if (!quiet) setStatus('SINCRONIZADO', 'ok');
    } catch (error) {
      console.warn('Safari Comodín Registry V36 sync:', error);
      setStatus('SIN CONEXIÓN · REINTENTANDO', 'error');
    } finally {
      polling = false;
    }
  }

  function openRegistry() {
    ensureUI();
    const modal = $('comodinRegistryModalV36');
    modal?.classList.add('open');
    modal?.setAttribute('aria-hidden', 'false');
    document.body.classList.add('comodin-registry-open-v36');
    refresh();
  }

  function closeRegistry() {
    if (busy) return;
    const modal = $('comodinRegistryModalV36');
    modal?.classList.remove('open');
    modal?.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('comodin-registry-open-v36');
  }

  function openEditor(id = null) {
    editingId = id ? String(id) : null;
    const editor = $('comodinRegistryEditorV36');
    const mode = $('comodinRegistryEditorModeV36');
    const category = $('comodinRegistryCategoryV36');
    const code = $('comodinRegistryCodeV36');
    const found = $('comodinRegistryFoundInputV36');

    if (editingId) {
      const row = rows.find((entry) => String(entry.id) === editingId);
      if (!row) return;
      mode.textContent = 'EDITAR COMODÍN';
      category.value = row.category;
      code.value = row.code || '';
      found.value = String(Boolean(row.found));
    } else {
      mode.textContent = 'NUEVO COMODÍN';
      category.value = 'normal';
      code.value = '';
      found.value = 'false';
    }

    editor?.classList.add('open');
    editor?.setAttribute('aria-hidden', 'false');
    setTimeout(() => code?.focus(), 60);
  }

  function closeEditor() {
    if (busy) return;
    const editor = $('comodinRegistryEditorV36');
    editor?.classList.remove('open');
    editor?.setAttribute('aria-hidden', 'true');
    editingId = null;
  }

  async function saveEditor(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    if (busy) return;

    const category = $('comodinRegistryCategoryV36')?.value;
    const code = $('comodinRegistryCodeV36')?.value.trim();
    const found = $('comodinRegistryFoundInputV36')?.value === 'true';
    if (!CATEGORIES.includes(category) || !code) return;

    const button = $('saveComodinRegistryV36');
    const original = button?.textContent || 'GUARDAR COMODÍN';
    busy = true;
    if (button) { button.disabled = true; button.textContent = 'GUARDANDO…'; }
    setStatus('GUARDANDO…', 'saving');

    try {
      if (editingId) {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?id=eq.${encodeURIComponent(editingId)}`, {
          method: 'PATCH',
          headers: headers({ Prefer: 'return=minimal' }),
          body: JSON.stringify({ category, code, found, updated_at: new Date().toISOString() })
        });
        if (!response.ok) throw new Error(`Supabase ${response.status}`);
      } else {
        const now = new Date().toISOString();
        const response = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}`, {
          method: 'POST',
          headers: headers({ Prefer: 'return=minimal' }),
          body: JSON.stringify({
            id: newId(),
            category,
            code,
            found,
            created_by: currentStaffName(),
            created_at: now,
            updated_at: now,
            sort_order: -Date.now()
          })
        });
        if (!response.ok) throw new Error(`Supabase ${response.status}`);
      }

      busy = false;
      closeEditor();
      await refresh();
      setStatus('GUARDADO Y SINCRONIZADO', 'ok');
    } catch (error) {
      console.error('Safari Comodín Registry V36 save:', error);
      setStatus('NO SE PUDO GUARDAR', 'error');
      alert('No se pudo guardar el comodín. Intentá nuevamente.');
    } finally {
      busy = false;
      if (button) { button.disabled = false; button.textContent = original; }
    }
  }

  async function toggleFound(id) {
    const row = rows.find((entry) => String(entry.id) === String(id));
    if (!row || busy) return;
    busy = true;
    setStatus('ACTUALIZANDO ESTADO…', 'saving');
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: headers({ Prefer: 'return=minimal' }),
        body: JSON.stringify({ found: !row.found, updated_at: new Date().toISOString() })
      });
      if (!response.ok) throw new Error(`Supabase ${response.status}`);
      busy = false;
      await refresh();
      setStatus('ESTADO ACTUALIZADO', 'ok');
    } catch (error) {
      console.error('Safari Comodín Registry V36 toggle:', error);
      setStatus('NO SE PUDO ACTUALIZAR', 'error');
    } finally {
      busy = false;
    }
  }

  async function deleteRow(id) {
    const row = rows.find((entry) => String(entry.id) === String(id));
    if (!row || busy) return;
    if (!confirm(`¿Quitar el comodín ${row.code} del registro?`)) return;
    busy = true;
    setStatus('ELIMINANDO…', 'saving');
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?id=eq.${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: headers({ Prefer: 'return=minimal' })
      });
      if (!response.ok) throw new Error(`Supabase ${response.status}`);
      busy = false;
      await refresh();
      setStatus('ELIMINADO Y SINCRONIZADO', 'ok');
    } catch (error) {
      console.error('Safari Comodín Registry V36 delete:', error);
      setStatus('NO SE PUDO ELIMINAR', 'error');
    } finally {
      busy = false;
    }
  }

  function installEvents() {
    document.addEventListener('click', (event) => {
      if (event.target.closest('#openComodinRegistryV36')) {
        event.preventDefault();
        openRegistry();
        return;
      }
      if (event.target.closest('#addComodinRegistryV36')) {
        event.preventDefault();
        openEditor();
        return;
      }
      if (event.target.closest('[data-registry-close="1"]')) {
        event.preventDefault();
        closeRegistry();
        return;
      }
      if (event.target.closest('[data-registry-editor-close="1"]')) {
        event.preventDefault();
        closeEditor();
        return;
      }

      const action = event.target.closest('[data-registry-action]');
      if (!action) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      const id = action.dataset.id;
      if (action.dataset.registryAction === 'toggle') toggleFound(id);
      if (action.dataset.registryAction === 'edit') openEditor(id);
      if (action.dataset.registryAction === 'delete') deleteRow(id);
    }, true);

    $('comodinRegistryFormV36')?.addEventListener('submit', saveEditor, true);

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      if ($('comodinRegistryEditorV36')?.classList.contains('open')) closeEditor();
      else if ($('comodinRegistryModalV36')?.classList.contains('open')) closeRegistry();
    });
  }

  function install() {
    ensureUI();
    installEvents();
    refresh({ quiet: true });
    setInterval(() => {
      if (document.visibilityState === 'visible' && $('comodinRegistryModalV36')?.classList.contains('open')) refresh({ quiet: true });
    }, 4000);
    window.addEventListener('online', () => refresh());
    console.info(`Safari Comodín Registry ${VERSION} activo`);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
  else install();
})();
