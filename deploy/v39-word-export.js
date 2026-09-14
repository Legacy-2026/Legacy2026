(() => {
  'use strict';
  if (window.__SAFARI_WORD_EXPORT_V39_READY__) return;
  window.__SAFARI_WORD_EXPORT_V39_READY__ = true;

  const VERSION = 'V39';
  const SUPABASE_URL = 'https://sqxcygylcxlsigcmawma.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_SdZBbhB1onHQHFB-XFX3PQ_rsfgL7Af';
  const TABLE = 'safari_archive_items';
  const CATEGORY_ORDER = ['fotos', 'videos', 'tiktoks', 'averigua', 'traer', 'audios'];
  const CATEGORY_LABELS = {
    fotos: 'FOTOS',
    videos: 'VIDEOS',
    tiktoks: 'TIKTOKS',
    averigua: 'AVERIGUA',
    traer: 'TRAER',
    audios: 'AUDIOS'
  };

  const FINAL_MESSAGE = [
    'A quienes lideraron, corrieron, se perdieron, se rieron y no dejaron de intentar:',
    'Este Safari no nació en una noche. Detrás de cada pista, cada foto, cada video, cada desafío, cada comodín y cada detalle hubo horas de ideas, cambios, recorridos, discusiones, nervios y muchísimo esfuerzo de todo el Staff.',
    'Lo preparamos con una sola ilusión: que durante estos días puedan vivir algo que después recuerden durante años. Ojalá se rían mucho, se sorprendan, compitan con todo y, sobre todo, disfruten el camino y a las personas con las que lo comparten.',
    'Si al terminar queda una historia que vuelvan a contar, una amistad más fuerte o un momento que no quieran olvidar, entonces todo el trabajo habrá valido la pena.',
    'Gracias por confiar, participar y darle vida a LEGACY. Un museo guarda piezas del pasado; ustedes van a crear los recuerdos que algún día serán parte de su propio legado.',
    'Con cariño,\nSTAFF · SAFARI 2026 — LEGACY'
  ];

  let exporting = false;
  let docxLoadingPromise = null;

  function setExportUi(busy, text) {
    const form = document.getElementById('exportPasswordForm');
    const submit = form?.querySelector('button[type="submit"]');
    const cancel = document.getElementById('cancelExportPassword');
    const close = document.getElementById('closeExportPassword');
    if (submit) {
      if (!submit.dataset.originalText) submit.dataset.originalText = submit.textContent || 'EXPORTAR';
      submit.disabled = busy;
      submit.textContent = busy ? (text || 'CREANDO WORD…') : submit.dataset.originalText;
    }
    if (cancel) cancel.disabled = busy;
    if (close) close.disabled = busy;
  }

  function showError(message) {
    const error = document.getElementById('exportPasswordError');
    if (error) error.textContent = message;
  }

  function passwordIsValid() {
    const input = document.getElementById('exportPasswordInput');
    if (!input) return false;
    try {
      if (typeof EXPORT_PASSWORD !== 'undefined') return input.value === EXPORT_PASSWORD;
    } catch (error) {}
    return input.value === 'bolaños';
  }

  function closePasswordModal() {
    try {
      if (typeof hideExportPassword === 'function') {
        hideExportPassword();
        return;
      }
    } catch (error) {}
    const modal = document.getElementById('exportPasswordModal');
    modal?.classList.remove('open');
    modal?.setAttribute('aria-hidden', 'true');
  }

  function loadScript(src, id) {
    return new Promise((resolve, reject) => {
      if (globalThis.docx?.Document && globalThis.docx?.Packer) return resolve();
      const old = document.getElementById(id);
      if (old) old.remove();
      const script = document.createElement('script');
      script.id = id;
      script.src = src;
      script.async = true;
      script.onload = () => globalThis.docx?.Document ? resolve() : reject(new Error('La librería Word no quedó disponible.'));
      script.onerror = () => reject(new Error(`No se pudo cargar ${src}`));
      document.head.appendChild(script);
    });
  }

  async function ensureDocxLibrary() {
    if (globalThis.docx?.Document && globalThis.docx?.Packer) return globalThis.docx;
    if (!docxLoadingPromise) {
      docxLoadingPromise = (async () => {
        const sources = [
          'https://unpkg.com/docx@8.5.0/build/index.iife.js',
          'https://cdn.jsdelivr.net/npm/docx@8.5.0/build/index.iife.js'
        ];
        let lastError = null;
        for (let i = 0; i < sources.length; i += 1) {
          try {
            await loadScript(sources[i], `safari-docx-v39-${i}`);
            if (globalThis.docx?.Document) return globalThis.docx;
          } catch (error) {
            lastError = error;
          }
        }
        throw lastError || new Error('No se pudo iniciar el exportador de Word.');
      })().finally(() => {
        if (!globalThis.docx?.Document) docxLoadingPromise = null;
      });
    }
    return docxLoadingPromise;
  }

  async function fetchArchiveRows() {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/${TABLE}?select=category,title,detail,sort_order,created_at&order=sort_order.asc,created_at.asc`,
      {
        headers: { apikey: SUPABASE_KEY },
        cache: 'no-store'
      }
    );
    if (!response.ok) throw new Error(`No se pudo leer la carpeta compartida (${response.status}).`);
    const rows = await response.json();
    return Array.isArray(rows) ? rows : [];
  }

  function fallbackArchiveRows() {
    try {
      if (typeof archivoData === 'undefined' || !archivoData) return [];
      return CATEGORY_ORDER.flatMap((category) => {
        const items = Array.isArray(archivoData[category]) ? archivoData[category] : [];
        return items.map((item, index) => ({
          category,
          title: item?.title || '',
          detail: item?.detail || '',
          sort_order: index,
          created_at: item?.createdAt || null
        }));
      });
    } catch (error) {
      return [];
    }
  }

  async function getArchiveRows() {
    try {
      return await fetchArchiveRows();
    } catch (error) {
      const fallback = fallbackArchiveRows();
      if (fallback.length) return fallback;
      throw error;
    }
  }

  async function getCoverBytes() {
    const response = await fetch(`./deploy/v39-legacy-cover.b64?v=39`, { cache: 'no-store' });
    if (!response.ok) throw new Error('No se pudo cargar la portada LEGACY.');
    const b64 = (await response.text()).trim();
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  function cleanText(value) {
    return String(value ?? '').replace(/\s+/g, ' ').trim();
  }

  function richRuns(text, docx) {
    const value = cleanText(text);
    if (!value) return [];
    const { TextRun, ExternalHyperlink } = docx;
    const regex = /(https?:\/\/[^\s<>]+|www\.[^\s<>]+)/gi;
    const parts = [];
    let cursor = 0;
    let match;
    while ((match = regex.exec(value)) !== null) {
      if (match.index > cursor) parts.push(new TextRun({ text: value.slice(cursor, match.index) }));
      let visible = match[0];
      let trailing = '';
      while (/[),.;!?]$/.test(visible)) {
        trailing = visible.slice(-1) + trailing;
        visible = visible.slice(0, -1);
      }
      const link = visible.startsWith('www.') ? `https://${visible}` : visible;
      parts.push(new ExternalHyperlink({
        link,
        children: [new TextRun({ text: visible, color: '315E9B', underline: {} })]
      }));
      if (trailing) parts.push(new TextRun({ text: trailing }));
      cursor = match.index + match[0].length;
    }
    if (cursor < value.length) parts.push(new TextRun({ text: value.slice(cursor) }));
    return parts;
  }

  function makeRule(docx, color = 'BDBDBD') {
    const { Paragraph, BorderStyle } = docx;
    return new Paragraph({
      border: { bottom: { color, space: 1, style: BorderStyle.SINGLE, size: 6 } },
      spacing: { after: 160 }
    });
  }

  function itemParagraphs(row, index, docx) {
    const { Paragraph, TextRun } = docx;
    const title = cleanText(row.title) || 'Ítem sin título';
    const detail = cleanText(row.detail);
    const children = [
      new TextRun({ text: `${String(index + 1).padStart(2, '0')}. `, bold: true, color: '111111' }),
      ...richRuns(title, docx)
    ];
    const out = [new Paragraph({
      children,
      spacing: { after: detail ? 70 : 155, line: 300 },
      keepNext: Boolean(detail)
    })];
    if (detail) {
      out.push(new Paragraph({
        children: [new TextRun({ text: 'Nota · ', bold: true, color: '666666' }), ...richRuns(detail, docx)],
        indent: { left: 360 },
        spacing: { after: 170, line: 285 }
      }));
    }
    return out;
  }

  function buildDocument(rows, coverBytes, docx) {
    const {
      Document,
      Paragraph,
      TextRun,
      ImageRun,
      AlignmentType,
      PageBreak,
      BorderStyle,
      ShadingType
    } = docx;

    const grouped = Object.fromEntries(CATEGORY_ORDER.map((category) => [category, []]));
    for (const row of rows) {
      if (grouped[row.category]) grouped[row.category].push(row);
    }

    const children = [];

    children.push(
      new Paragraph({ spacing: { before: 650, after: 240 } }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new ImageRun({ data: coverBytes, transformation: { width: 520, height: 563 } })],
        spacing: { after: 260 }
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: 'CARPETA OFICIAL · SAFARI 2026', bold: true, size: 22, characterSpacing: 90 })],
        spacing: { after: 80 }
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: 'STAFF · LEGACY', size: 18, color: '777777', characterSpacing: 110 })]
      }),
      new Paragraph({ children: [new PageBreak()] })
    );

    children.push(
      new Paragraph({
        children: [new TextRun({ text: 'CARPETA LEGACY', bold: true, size: 48, color: '111111' })],
        spacing: { after: 80 }
      }),
      new Paragraph({
        children: [new TextRun({ text: 'SAFARI 2026 · CONTENIDO OFICIAL', size: 20, color: '777777', characterSpacing: 100 })],
        spacing: { after: 180 }
      }),
      makeRule(docx, '111111'),
      new Paragraph({
        children: [new TextRun({ text: 'SECCIONES', bold: true, size: 20, color: '444444' })],
        spacing: { after: 140 }
      })
    );

    CATEGORY_ORDER.forEach((category, i) => {
      children.push(new Paragraph({
        children: [
          new TextRun({ text: `${String(i + 1).padStart(2, '0')}  `, bold: true, color: '777777' }),
          new TextRun({ text: CATEGORY_LABELS[category], bold: true, size: 26 }),
          new TextRun({ text: `  ·  ${grouped[category].length} ítems`, color: '777777', size: 20 })
        ],
        spacing: { after: 110 }
      }));
    });

    for (const category of CATEGORY_ORDER) {
      children.push(new Paragraph({ children: [new PageBreak()] }));
      children.push(new Paragraph({
        children: [new TextRun({ text: CATEGORY_LABELS[category], bold: true, size: 44, color: '111111' })],
        spacing: { after: 65 }
      }));
      children.push(new Paragraph({
        children: [new TextRun({ text: `${grouped[category].length} ÍTEMS · SAFARI 2026`, color: '777777', size: 18, characterSpacing: 80 })],
        spacing: { after: 120 }
      }));
      children.push(makeRule(docx, '111111'));

      if (!grouped[category].length) {
        children.push(new Paragraph({
          children: [new TextRun({ text: 'Sin ítems registrados en esta sección.', italics: true, color: '777777' })]
        }));
      } else {
        grouped[category].forEach((row, index) => children.push(...itemParagraphs(row, index, docx)));
      }
    }

    children.push(new Paragraph({ children: [new PageBreak()] }));
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: 'PARA USTEDES', bold: true, size: 42, color: '111111', characterSpacing: 60 })],
      spacing: { before: 520, after: 120 }
    }));
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: 'LÍDERES · PARTICIPANTES · LEGACY 2026', size: 18, color: '777777', characterSpacing: 80 })],
      spacing: { after: 220 }
    }));
    children.push(new Paragraph({
      border: {
        top: { color: 'BBBBBB', style: BorderStyle.SINGLE, size: 6 },
        bottom: { color: 'BBBBBB', style: BorderStyle.SINGLE, size: 6 },
        left: { color: 'BBBBBB', style: BorderStyle.SINGLE, size: 6 },
        right: { color: 'BBBBBB', style: BorderStyle.SINGLE, size: 6 }
      },
      shading: { type: ShadingType.CLEAR, fill: 'F5F5F3' },
      children: [new TextRun({ text: FINAL_MESSAGE[0], bold: true, size: 24 })],
      spacing: { before: 80, after: 170 },
      indent: { left: 260, right: 260 }
    }));

    FINAL_MESSAGE.slice(1, -1).forEach((text) => {
      children.push(new Paragraph({
        children: [new TextRun({ text, size: 22 })],
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 190, line: 340 },
        indent: { left: 260, right: 260 }
      }));
    });

    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      children: FINAL_MESSAGE.at(-1).split('\n').flatMap((line, index) => [
        new TextRun({ text: line, bold: index === 1, italics: index === 0, size: index === 1 ? 24 : 22 }),
        ...(index === 0 ? [new TextRun({ break: 1 })] : [])
      ]),
      spacing: { before: 180, after: 80 }
    }));

    return new Document({
      creator: 'Staff Safari 2026',
      title: 'SAFARI 2026 — LEGACY · Carpeta Oficial',
      subject: 'Carpeta oficial del Safari 2026 Legacy',
      description: 'Contenido organizado por secciones para líderes y participantes.',
      styles: {
        default: {
          document: {
            run: { font: 'Aptos', size: 22, color: '222222' },
            paragraph: { spacing: { line: 300 } }
          }
        }
      },
      sections: [{
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 850, right: 900, bottom: 850, left: 900 }
          }
        },
        children
      }]
    });
  }

  function saveBlob(blob) {
    const now = new Date();
    const stamp = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `SAFARI_2026_LEGACY_CARPETA_${stamp}.docx`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2500);
  }

  async function exportWord() {
    const [docx, rows, coverBytes] = await Promise.all([
      ensureDocxLibrary(),
      getArchiveRows(),
      getCoverBytes()
    ]);
    const documentFile = buildDocument(rows, coverBytes, docx);
    const blob = await docx.Packer.toBlob(documentFile);
    saveBlob(blob);
  }

  async function interceptExportSubmit(event) {
    const form = event.target?.closest?.('#exportPasswordForm');
    if (!form) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    if (exporting) return;
    if (!passwordIsValid()) {
      showError('Contraseña incorrecta.');
      document.getElementById('exportPasswordInput')?.select();
      return;
    }

    exporting = true;
    showError('');
    setExportUi(true, 'CREANDO WORD…');

    try {
      await exportWord();
      closePasswordModal();
    } catch (error) {
      console.error('Safari V39 Word export:', error);
      showError('No se pudo crear el Word. Verificá tu conexión e intentá nuevamente.');
    } finally {
      exporting = false;
      setExportUi(false);
    }
  }

  document.addEventListener('submit', interceptExportSubmit, true);
  console.info(`Safari ${VERSION} · exportación Word activa`);
})();
