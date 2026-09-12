(() => {
  'use strict';
  if (window.__SAFARI_SANCTION_SCORES_V38_READY__) return;
  window.__SAFARI_SANCTION_SCORES_V38_READY__ = true;

  const SUPABASE_URL = 'https://sqxcygylcxlsigcmawma.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_SdZBbhB1onHQHFB-XFX3PQ_rsfgL7Af';
  const SAVE_RPC = 'safari_v38_save_sanction';
  const DELETE_RPC = 'safari_v38_delete_sanction';
  let busy = false;

  function headers() {
    return {
      apikey: SUPABASE_KEY,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    };
  }

  function currentStaffNameV38() {
    try {
      if (typeof getCurrentStaffDisplayName === 'function') {
        return getCurrentStaffDisplayName() || 'Staff';
      }
    } catch (error) {}
    return 'Staff';
  }

  function freshSanctionId() {
    try {
      if (typeof makeSanctionId === 'function') return makeSanctionId();
    } catch (error) {}
    if (globalThis.crypto?.randomUUID) return `sanction-${crypto.randomUUID()}`;
    return `sanction-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function applyScores(nextScores) {
    if (!Array.isArray(nextScores)) return;
    try {
      scoreTeams = nextScores;
      if (typeof SCORE_TABLE_KEY !== 'undefined') {
        localStorage.setItem(SCORE_TABLE_KEY, JSON.stringify(scoreTeams));
      }
      if (typeof renderScoreTable === 'function') renderScoreTable();
      if (typeof renderSanctions === 'function') renderSanctions();
    } catch (error) {
      console.error('Safari V38 no pudo refrescar la tabla local:', error);
    }
  }

  async function callRPC(name, body) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new Error(`Supabase ${response.status}${detail ? ` · ${detail}` : ''}`);
    }
    return response.json();
  }

  async function handleSanctionSubmit(event) {
    const form = event.target.closest?.('#sanctionEditorForm');
    if (!form) return;
    if (busy) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }

    try {
      if (typeof scoreEditUnlocked !== 'undefined' && !scoreEditUnlocked) return;
    } catch (error) {
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();

    const teamId = typeof currentSanctionsTeamId !== 'undefined' ? currentSanctionsTeamId : null;
    const reasonInput = document.getElementById('sanctionReasonInput');
    const pointsInput = document.getElementById('sanctionPointsInput');
    const reason = reasonInput?.value.trim() || '';
    const points = Math.max(0, Number.parseInt(pointsInput?.value, 10) || 0);
    if (!teamId || !reason) return;

    let sanctionId = null;
    try { sanctionId = editingSanctionId || null; } catch (error) {}
    if (!sanctionId) sanctionId = freshSanctionId();

    const submit = form.querySelector('button[type="submit"]');
    const originalText = submit?.textContent || 'GUARDAR';
    busy = true;
    if (submit) {
      submit.disabled = true;
      submit.textContent = 'GUARDANDO…';
    }

    try {
      const nextScores = await callRPC(SAVE_RPC, {
        p_team_id: teamId,
        p_sanction_id: sanctionId,
        p_reason: reason,
        p_points: points,
        p_created_by: currentStaffNameV38()
      });

      applyScores(nextScores);
      if (typeof hideSanctionEditor === 'function') hideSanctionEditor();
    } catch (error) {
      console.error('Safari V38 sanción:', error);
      alert('No se pudo guardar la sanción ni actualizar el puntaje. Intentá nuevamente.');
    } finally {
      busy = false;
      if (submit) {
        submit.disabled = false;
        submit.textContent = originalText;
      }
    }
  }

  async function handleSanctionDelete(event) {
    const button = event.target.closest?.('#sanctionsList button[data-action="delete-sanction"]');
    if (!button) return;

    try {
      if (typeof scoreEditUnlocked !== 'undefined' && !scoreEditUnlocked) return;
    } catch (error) {
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();
    if (busy) return;

    const teamId = typeof currentSanctionsTeamId !== 'undefined' ? currentSanctionsTeamId : null;
    const sanctionId = button.dataset.id;
    if (!teamId || !sanctionId) return;

    let sanction = null;
    try {
      const team = typeof getTeamById === 'function' ? getTeamById(teamId) : null;
      sanction = (team?.sanctions || []).find((item) => item.id === sanctionId) || null;
    } catch (error) {}
    if (!sanction) return;

    const ok = confirm(`¿Quitar la sanción "${sanction.reason}"? Los ${Math.max(0, Number(sanction.points || 0))} puntos descontados volverán a la promo.`);
    if (!ok) return;

    const originalText = button.textContent;
    busy = true;
    button.disabled = true;
    button.textContent = 'ELIMINANDO…';

    try {
      const nextScores = await callRPC(DELETE_RPC, {
        p_team_id: teamId,
        p_sanction_id: sanctionId
      });
      applyScores(nextScores);
    } catch (error) {
      console.error('Safari V38 eliminar sanción:', error);
      alert('No se pudo quitar la sanción ni devolver los puntos. Intentá nuevamente.');
      button.disabled = false;
      button.textContent = originalText;
    } finally {
      busy = false;
    }
  }

  document.addEventListener('submit', handleSanctionSubmit, true);
  document.addEventListener('click', handleSanctionDelete, true);
  console.info('Safari V38 · sanciones conectadas a puntajes');
})();
