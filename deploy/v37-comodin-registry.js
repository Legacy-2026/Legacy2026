(() => {
  'use strict';
  if (window.__SAFARI_COMODIN_REGISTRY_V37_READY__) return;
  window.__SAFARI_COMODIN_REGISTRY_V37_READY__ = true;

  const VERSION = 'V37';
  const SUPABASE_URL = 'https://sqxcygylcxlsigcmawma.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_SdZBbhB1onHQHFB-XFX3PQ_rsfgL7Af';
  const TABLE = 'safari_comodin_registry';
  const SAVE_RPC = 'safari_v37_save_comodin';
  const DELETE_RPC = 'safari_v37_delete_comodin';
  const CATEGORIES = ['diamante', 'oro', 'normal'];
  const LABELS = { diamante: 'DIAMANTE', oro: 'ORO', normal: 'NORMAL' };
  const PROMOS = [
    { id: 'team-027', label: '027 VIKINGOS' },
    { id: 'team-028', label: '028 SAMURAIS' },
    { id: 'team-02930', label: '029/30 GRIEGOS' }
  ];
  const PROMO_LABELS = Object.fromEntries(PROMOS.map((promo) => [promo.id, promo.label]));

  let rows = [];
  let busy = false;
  let editingId = null;
  let polling = false;
  let findingId = null;

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

  function promoOptions(selected = '') {
    return `<option value="">SELECCIONAR PROMO</option>` + PROMOS.map((promo) =>
      `<option value="${promo.id}" ${promo.id === selected ? 'selected' : ''}>${promo.label}</option>`
    ).join('');
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
            <p id="comodinRegistryCardSummaryV36">Categoría · código · puntaje · promo que lo encontró.</p>
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
              <p>Añadí el primero indicando categoría, código y puntaje.</p>
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
              <span>VALOR EN PUNTOS</span>
              <input id="comodinRegistryPointsV37" type="number" min="0" step="1" value="0" required />
            </label>
            <label>
              <span>ESTADO</span>
              <select id="comodinRegistryFoundInputV36" required>
                <option value="false">NO ENCONTRADO</option>
                <option value="true">ENCONTRADO</option>
              </select>
            </label>
            <label id="comodinRegistryPromoFieldV37" class="comodin-registry-promo-field-v37 is-hidden">
              <span>PROMO QUE LO ENCONTRÓ</span>
              <select id="comodinRegistryPromoV37">${promoOptions()}</select>
              <small>Obligatorio cuando el comodín está marcado como encontrado.</small>
            </label>
            <div class="comodin-registry-editor-actions-v36">
              <button type="button" data-registry-editor-close="1">CANCELAR</button>
              <button type="submit" id="saveComodinRegistryV36">GUARDAR COMODÍN</button>
            </div>
          </form>
        </section>`;
      document.body.appendChild(editor);
    }

    if (!$('comodinFoundModalV37')) {
      const modal = document.createElement('div');
      modal.id = 'comodinFoundModalV37';
      modal.className = 'comodin-found-modal-v37';
      modal.setAttribute('aria-hidden', 'true');
      modal.innerHTML = `
        <div class="comodin-found-backdrop-v37" data-found-close="1"></div>
        <section class="comodin-found-window-v37" role="dialog" aria-modal="true" aria-labelledby="comodinFoundTitleV37">
          <header>
            <div><p>COMODÍN ENCONTRADO</p><h4 id="comodinFoundTitleV37">¿QUÉ PROMO LO ENCONTRÓ?</h4></div>
            <button type="button" data-found-close="1" aria-label="Cerrar">×</button>
          </header>
          <div class="comodin-found-body-v37">
            <div class="comodin-found-summary-v37">
              <span>CÓDIGO</span><strong id="comodinFoundCodeV37">—</strong>
            </div>
            <label><span>PROMO</span><select id="comodinFoundPromoV37">${promoOptions()}</select></label>
            <label><span>PUNTAJE A SUMAR</span><input id="comodinFoundPointsV37" type="number" min="0" step="1" value="0" /></label>
            <p>Al confirmar, el puntaje se sumará automáticamente en la tabla de puntajes y el contador de comodines de esa promo aumentará en 1.</p>
            <div class="comodin-found-actions-v37">
              <button type="button" data-found-close="1">CANCELAR</button>
              <button type="button" id="confirmComodinFoundV37">CONFIRMAR ENCONTRADO</button>
            </div>
          </div>
        </section>`;
      document.body.appendChild(modal);
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

    host.innerHTML = rows.map((row, index) => {
      const promo = row.found_by_promo ? (PROMO_LABELS[row.found_by_promo] || row.found_by_promo) : '';
      const toggleText = row.found
        ? (row.found_by_promo ? 'MARCAR NO ENCONTRADO' : 'ASIGNAR PROMO Y PUNTOS')
        : 'MARCAR ENCONTRADO';
      return `
      <article class="comodin-registry-item-v36 ${row.found ? 'is-found' : 'is-pending'}" data-id="${escapeHTML(row.id)}">
        <div class="comodin-registry-index-v36">${String(index + 1).padStart(2, '0')}</div>
        <div class="comodin-registry-copy-v36">
          <div class="comodin-registry-line-v36">
            <span class="comodin-registry-category-v36 category-${escapeHTML(row.category)}">${escapeHTML(LABELS[row.category] || row.category)}</span>
            <span class="comodin-registry-state-v36">${row.found ? 'ENCONTRADO' : 'NO ENCONTRADO'}</span>
            <span class="comodin-registry-points-v37">${Math.max(0, Number(row.points || 0))} PTS</span>
            ${promo ? `<span class="comodin-registry-promo-v37">${escapeHTML(promo)}</span>` : (row.found ? '<span class="comodin-registry-promo-v37 missing">PROMO PENDIENTE</span>' : '')}
          </div>
          <h5>${escapeHTML(row.code)}</h5>
          <small>AÑADIDO POR ${escapeHTML(row.created_by || 'STAFF')}</small>
        </div>
        <div class="comodin-registry-actions-v36">
          <button type="button" class="comodin-registry-toggle-v36" data-registry-action="toggle" data-id="${escapeHTML(row.id)}">${toggleText}</button>
          <button type="button" data-registry-action="edit" data-id="${escapeHTML(row.id)}">EDITAR</button>
          <button type="button" class="danger" data-registry-action="delete" data-id="${escapeHTML(row.id)}">QUITAR</button>
        </div>
      </article>`;
    }).join('');

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
      `${SUPABASE_URL}/rest/v1/${TABLE}?select=id,category,code,points,found,found_by_promo,found_at,awarded_promo,awarded_points,created_by,created_at,updated_at,sort_order&order=sort_order.asc,created_at.asc`,
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
      console.warn('Safari Comodín Registry V37 sync:', error);
      setStatus('SIN CONEXIÓN · REINTENTANDO', 'error');
    } finally {
      polling = false;
    }
  }

  function applyScoresToPage(scores) {
    if (!Array.isArray(scores)) return;
    try {
      if (typeof sharedSaveTimers !== 'undefined') {
        const timer = sharedSaveTimers.get('scores');
        if (timer) clearTimeout(timer);
        sharedSaveTimers.delete('scores');
      }
      if (typeof sharedDirtySections !== 'undefined') sharedDirtySections.delete('scores');
      if (typeof scoreTeams !== 'undefined') scoreTeams = scores;
      if (typeof SCORE_TABLE_KEY !== 'undefined') localStorage.setItem(SCORE_TABLE_KEY, JSON.stringify(scores));
      if (typeof renderScoreTable === 'function') renderScoreTable();
    } catch (error) {
      console.warn('Safari V37 score refresh:', error);
    }
  }

  async function callSave(row) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${SAVE_RPC}`, {
      method: 'POST',
      headers: headers({ Prefer: 'return=representation' }),
      body: JSON.stringify({
        p_id: row.id,
        p_category: row.category,
        p_code: row.code,
        p_points: Math.max(0, Number.parseInt(row.points, 10) || 0),
        p_found: Boolean(row.found),
        p_found_by_promo: row.found ? row.found_by_promo : null,
        p_created_by: row.created_by || currentStaffName(),
        p_sort_order: Number.isFinite(Number(row.sort_order)) ? Number(row.sort_order) : -Date.now()
      })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new Error(`Supabase ${response.status} ${detail}`);
    }
    const result = await response.json();
    if (result?.scores) applyScoresToPage(result.scores);
    return result;
  }

  async function callDelete(id) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${DELETE_RPC}`, {
      method: 'POST',
      headers: headers({ Prefer: 'return=representation' }),
      body: JSON.stringify({ p_id: id })
    });
    if (!response.ok) throw new Error(`Supabase ${response.status}`);
    const result = await response.json();
    if (result?.scores) applyScoresToPage(result.scores);
    return result;
  }

  function showPromoField() {
    const found = $('comodinRegistryFoundInputV36')?.value === 'true';
    const field = $('comodinRegistryPromoFieldV37');
    const select = $('comodinRegistryPromoV37');
    field?.classList.toggle('is-hidden', !found);
    if (select) select.required = found;
    if (!found && select) select.value = '';
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
    const points = $('comodinRegistryPointsV37');
    const found = $('comodinRegistryFoundInputV36');
    const promo = $('comodinRegistryPromoV37');

    if (editingId) {
      const row = rows.find((entry) => String(entry.id) === editingId);
      if (!row) return;
      mode.textContent = 'EDITAR COMODÍN';
      category.value = row.category;
      code.value = row.code || '';
      points.value = Math.max(0, Number(row.points || 0));
      found.value = String(Boolean(row.found));
      promo.value = row.found_by_promo || '';
    } else {
      mode.textContent = 'NUEVO COMODÍN';
      category.value = 'normal';
      code.value = '';
      points.value = '0';
      found.value = 'false';
      promo.value = '';
    }

    showPromoField();
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
    const points = Math.max(0, Number.parseInt($('comodinRegistryPointsV37')?.value, 10) || 0);
    const found = $('comodinRegistryFoundInputV36')?.value === 'true';
    const promo = $('comodinRegistryPromoV37')?.value || null;
    if (!CATEGORIES.includes(category) || !code) return;
    if (found && !PROMO_LABELS[promo]) {
      alert('Elegí qué promo encontró el comodín.');
      $('comodinRegistryPromoV37')?.focus();
      return;
    }

    const existing = editingId ? rows.find((entry) => String(entry.id) === String(editingId)) : null;
    const button = $('saveComodinRegistryV36');
    const original = button?.textContent || 'GUARDAR COMODÍN';
    busy = true;
    if (button) { button.disabled = true; button.textContent = 'GUARDANDO…'; }
    setStatus(found ? 'GUARDANDO Y ACTUALIZANDO PUNTAJES…' : 'GUARDANDO…', 'saving');

    try {
      await callSave({
        id: editingId || newId(),
        category,
        code,
        points,
        found,
        found_by_promo: found ? promo : null,
        created_by: existing?.created_by || currentStaffName(),
        sort_order: existing?.sort_order ?? -Date.now()
      });
      busy = false;
      closeEditor();
      await refresh();
      setStatus(found ? `GUARDADO · ${points} PTS A ${PROMO_LABELS[promo]}` : 'GUARDADO Y SINCRONIZADO', 'ok');
    } catch (error) {
      console.error('Safari Comodín Registry V37 save:', error);
      setStatus('NO SE PUDO GUARDAR', 'error');
      alert('No se pudo guardar el comodín. Intentá nuevamente.');
    } finally {
      busy = false;
      if (button) { button.disabled = false; button.textContent = original; }
    }
  }

  function openFoundDialog(id) {
    const row = rows.find((entry) => String(entry.id) === String(id));
    if (!row || busy) return;
    findingId = String(id);
    $('comodinFoundCodeV37').textContent = row.code || '—';
    $('comodinFoundPromoV37').value = row.found_by_promo || '';
    $('comodinFoundPointsV37').value = Math.max(0, Number(row.points || 0));
    const modal = $('comodinFoundModalV37');
    modal?.classList.add('open');
    modal?.setAttribute('aria-hidden', 'false');
    setTimeout(() => $('comodinFoundPromoV37')?.focus(), 50);
  }

  function closeFoundDialog() {
    if (busy) return;
    const modal = $('comodinFoundModalV37');
    modal?.classList.remove('open');
    modal?.setAttribute('aria-hidden', 'true');
    findingId = null;
  }

  async function confirmFound() {
    const row = rows.find((entry) => String(entry.id) === String(findingId));
    if (!row || busy) return;
    const promo = $('comodinFoundPromoV37')?.value;
    const points = Math.max(0, Number.parseInt($('comodinFoundPointsV37')?.value, 10) || 0);
    if (!PROMO_LABELS[promo]) {
      alert('Elegí qué promo encontró el comodín.');
      $('comodinFoundPromoV37')?.focus();
      return;
    }

    const button = $('confirmComodinFoundV37');
    busy = true;
    if (button) { button.disabled = true; button.textContent = 'SUMANDO PUNTOS…'; }
    setStatus('REGISTRANDO HALLAZGO Y SUMANDO PUNTOS…', 'saving');
    try {
      await callSave({ ...row, points, found: true, found_by_promo: promo });
      busy = false;
      closeFoundDialog();
      await refresh();
      setStatus(`ENCONTRADO · +${points} PTS PARA ${PROMO_LABELS[promo]}`, 'ok');
    } catch (error) {
      console.error('Safari V37 found:', error);
      setStatus('NO SE PUDO REGISTRAR EL HALLAZGO', 'error');
      alert('No se pudo registrar el hallazgo. Intentá nuevamente.');
    } finally {
      busy = false;
      if (button) { button.disabled = false; button.textContent = 'CONFIRMAR ENCONTRADO'; }
    }
  }

  async function markNotFound(id) {
    const row = rows.find((entry) => String(entry.id) === String(id));
    if (!row || busy) return;
    const promo = row.found_by_promo ? (PROMO_LABELS[row.found_by_promo] || row.found_by_promo) : 'la promo asignada';
    if (!confirm(`¿Marcar ${row.code} como NO ENCONTRADO? Si tenía puntaje asignado, se descontará de ${promo}.`)) return;
    busy = true;
    setStatus('REVERTIENDO HALLAZGO Y PUNTAJE…', 'saving');
    try {
      await callSave({ ...row, found: false, found_by_promo: null });
      busy = false;
      await refresh();
      setStatus('MARCAD0 COMO NO ENCONTRADO · PUNTAJE AJUSTADO', 'ok');
    } catch (error) {
      console.error('Safari V37 unfind:', error);
      setStatus('NO SE PUDO ACTUALIZAR', 'error');
    } finally {
      busy = false;
    }
  }

  async function deleteRow(id) {
    const row = rows.find((entry) => String(entry.id) === String(id));
    if (!row || busy) return;
    const note = row.awarded_promo ? ' El puntaje otorgado también se revertirá.' : '';
    if (!confirm(`¿Quitar el comodín ${row.code} del registro?${note}`)) return;
    busy = true;
    setStatus('ELIMINANDO…', 'saving');
    try {
      await callDelete(id);
      busy = false;
      await refresh();
      setStatus('ELIMINADO · PUNTAJES SINCRONIZADOS', 'ok');
    } catch (error) {
      console.error('Safari Comodín Registry V37 delete:', error);
      setStatus('NO SE PUDO ELIMINAR', 'error');
    } finally {
      busy = false;
    }
  }

  function installEvents() {
    document.addEventListener('click', (event) => {
      if (event.target.closest('#openComodinRegistryV36')) { event.preventDefault(); openRegistry(); return; }
      if (event.target.closest('#addComodinRegistryV36')) { event.preventDefault(); openEditor(); return; }
      if (event.target.closest('[data-registry-close="1"]')) { event.preventDefault(); closeRegistry(); return; }
      if (event.target.closest('[data-registry-editor-close="1"]')) { event.preventDefault(); closeEditor(); return; }
      if (event.target.closest('[data-found-close="1"]')) { event.preventDefault(); closeFoundDialog(); return; }
      if (event.target.closest('#confirmComodinFoundV37')) { event.preventDefault(); confirmFound(); return; }

      const action = event.target.closest('[data-registry-action]');
      if (!action) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      const id = action.dataset.id;
      if (action.dataset.registryAction === 'toggle') {
        const row = rows.find((entry) => String(entry.id) === String(id));
        if (row?.found && row.found_by_promo) markNotFound(id);
        else openFoundDialog(id);
      }
      if (action.dataset.registryAction === 'edit') openEditor(id);
      if (action.dataset.registryAction === 'delete') deleteRow(id);
    }, true);

    $('comodinRegistryFormV36')?.addEventListener('submit', saveEditor, true);
    $('comodinRegistryFoundInputV36')?.addEventListener('change', showPromoField);

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      if ($('comodinFoundModalV37')?.classList.contains('open')) closeFoundDialog();
      else if ($('comodinRegistryEditorV36')?.classList.contains('open')) closeEditor();
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
