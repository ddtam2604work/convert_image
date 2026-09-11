/**
 * OmniImage Studio v2.5 — Full Studio Web Application Engine
 * 100% Client-Side Canvas, Image Processing, Canva Cutout, Inpainting & Stego Suite
 */

(function () {
  'use strict';

  // ─── STATE MANAGEMENT ─────────────────────────────────────────────────────
  const state = {
    files: [],              // Array of { id, file, name, img, origW, origH, status, procBlob, customMask }
    activeIndex: -1,
    theme: 'light',
    viewMode: 'compare',   // 'compare', 'single-proc', 'single-orig'
    zoomFit: true,         // true: fill box, false: 100% actual size
    config: {
      format: 'WEBP',
      quality: 0.90,
      preset: '',
      targetW: null,
      targetH: null,
      lockAspect: true,
      aspectRatio: 1.0,
      fitMode: 'stretch',
      cutoutEnabled: false,
      canvaBgMode: 'transparent',
      canvaBgColor: '#FFFFFF',
      canvaBlurRadius: 20,
      shadowEnabled: false,
      shadowBlur: 16,
      shadowOpacity: 0.45,
      glowEnabled: false,
      glowWidth: 6,
      glowColor: '#FFFFFF',
      tolerance: 35,
      sharpen: 0,
      cleanStego: false,
      hiddenLogoImg: null,
      hiddenLogoName: null
    },
    // Canva Studio Modal State
    studio: {
      tool: 'view',         // 'view', 'erase', 'restore'
      brushSize: 25,
      isDrawing: false,
      method: 'smart',
      bgType: 'transparent',
      bgColor: '#FFFFFF',
      blurRadius: 25,
      shadow: false,
      glow: false,
      undoStack: [],
      maskCanvas: null,
      baseCanvas: null
    },
    // Watermark Inpaint Studio State
    watermark: {
      brushSize: 20,
      isDrawing: false,
      maskCanvas: null,
      baseCanvas: null
    }
  };

  // ─── DOM ELEMENT REFERENCES ───────────────────────────────────────────────
  const el = {
    // Inputs & Header
    fileInput: document.getElementById('fileInput'),
    logoInput: document.getElementById('logoInput'),
    btnSelectFiles: document.getElementById('btnSelectFiles'),
    btnPasteClipboard: document.getElementById('btnPasteClipboard'),
    lblFileCount: document.getElementById('lblFileCount'),
    btnThemeToggle: document.getElementById('btnThemeToggle'),
    themeIcon: document.getElementById('themeIcon'),
    themeText: document.getElementById('themeText'),

    // Format & Quality
    segFormat: document.getElementById('segFormat'),
    selExtraFormat: document.getElementById('selExtraFormat'),
    sliderQuality: document.getElementById('sliderQuality'),
    lblQuality: document.getElementById('lblQuality'),

    // Resize
    selPreset: document.getElementById('selPreset'),
    inputWidth: document.getElementById('inputWidth'),
    inputHeight: document.getElementById('inputHeight'),
    chkLockAspect: document.getElementById('chkLockAspect'),
    selFitMode: document.getElementById('selFitMode'),

    // Canva Cutout & Sharpen
    swCutout: document.getElementById('swCutout'),
    btnOpenCanvaStudio: document.getElementById('btnOpenCanvaStudio'),
    segBgMode: document.getElementById('segBgMode'),
    chkShadow: document.getElementById('chkShadow'),
    chkGlow: document.getElementById('chkGlow'),
    sliderTolerance: document.getElementById('sliderTolerance'),
    lblTolerance: document.getElementById('lblTolerance'),
    sliderSharpen: document.getElementById('sliderSharpen'),
    lblSharpen: document.getElementById('lblSharpen'),

    // Stego & Logo
    btnSelectLogo: document.getElementById('btnSelectLogo'),
    btnOpenStegoInspector: document.getElementById('btnOpenStegoInspector'),
    lblLogoInfo: document.getElementById('lblLogoInfo'),
    btnOpenWatermarkStudio: document.getElementById('btnOpenWatermarkStudio'),
    btnQuickSanitize: document.getElementById('btnQuickSanitize'),
    chkCleanStego: document.getElementById('chkCleanStego'),

    // Bottom Actions
    btnStartBatch: document.getElementById('btnStartBatch'),
    btnClearAll: document.getElementById('btnClearAll'),

    // Tabs
    tabBtnPreview: document.getElementById('tabBtnPreview'),
    tabBtnQueue: document.getElementById('tabBtnQueue'),
    tabPreview: document.getElementById('tabPreview'),
    tabQueue: document.getElementById('tabQueue'),

    // Preview Toolbar & Panes
    btnPrevImg: document.getElementById('btnPrevImg'),
    btnNextImg: document.getElementById('btnNextImg'),
    lblImgIndex: document.getElementById('lblImgIndex'),
    lblCurrentFilename: document.getElementById('lblCurrentFilename'),
    btnNavCanva: document.getElementById('btnNavCanva'),
    btnNavErase: document.getElementById('btnNavErase'),
    btnModeCompare: document.getElementById('btnModeCompare'),
    btnModeSingleProc: document.getElementById('btnModeSingleProc'),
    btnModeSingleOrig: document.getElementById('btnModeSingleOrig'),
    btnToggleZoom: document.getElementById('btnToggleZoom'),
    comparisonGrid: document.querySelector('.comparison-grid'),
    btnDownloadCurrent: document.getElementById('btnDownloadCurrent'),

    paneOrigDrop: document.getElementById('paneOrigDrop'),
    badgeOrig: document.getElementById('badgeOrig'),
    placeholderOrig: document.getElementById('placeholderOrig'),
    imgOrig: document.getElementById('imgOrig'),

    paneProc: document.querySelector('.pane-proc'),
    badgeProc: document.getElementById('badgeProc'),
    placeholderProc: document.getElementById('placeholderProc'),
    canvasPreview: document.getElementById('canvasPreview'),

    // Queue Tab
    lblQueueStats: document.getElementById('lblQueueStats'),
    btnDownloadAllZip: document.getElementById('btnDownloadAllZip'),
    queueCardsContainer: document.getElementById('queueCardsContainer'),

    // Status Bar
    lblStatus: document.getElementById('lblStatus'),
    progressBar: document.getElementById('progressBar'),

    // Canva Studio Modal
    modalCanvaStudio: document.getElementById('modalCanvaStudio'),
    btnCloseCanvaStudio: document.getElementById('btnCloseCanvaStudio'),
    btnStudioCompare: document.getElementById('btnStudioCompare'),
    segRetouchTool: document.getElementById('segRetouchTool'),
    sliderBrushSize: document.getElementById('sliderBrushSize'),
    lblBrushSize: document.getElementById('lblBrushSize'),
    btnStudioUndo: document.getElementById('btnStudioUndo'),
    studioCanvas: document.getElementById('studioCanvas'),
    segStudioMethod: document.getElementById('segStudioMethod'),
    btnStudioRunCutout: document.getElementById('btnStudioRunCutout'),
    segStudioBgType: document.getElementById('segStudioBgType'),
    studioColorPicker: document.getElementById('studioColorPicker'),
    sliderStudioBlur: document.getElementById('sliderStudioBlur'),
    lblStudioBlur: document.getElementById('lblStudioBlur'),
    studioBlurBox: document.getElementById('studioBlurBox'),
    chkStudioShadow: document.getElementById('chkStudioShadow'),
    chkStudioGlow: document.getElementById('chkStudioGlow'),
    btnStudioApply: document.getElementById('btnStudioApply'),

    // Watermark Modal
    modalWatermarkStudio: document.getElementById('modalWatermarkStudio'),
    btnCloseWatermarkStudio: document.getElementById('btnCloseWatermarkStudio'),
    sliderInpaintBrush: document.getElementById('sliderInpaintBrush'),
    lblInpaintBrushSize: document.getElementById('lblInpaintBrushSize'),
    btnInpaintClearMask: document.getElementById('btnInpaintClearMask'),
    btnRunInpaint: document.getElementById('btnRunInpaint'),
    inpaintCanvas: document.getElementById('inpaintCanvas'),
    btnCancelWatermark: document.getElementById('btnCancelWatermark'),
    btnApplyWatermark: document.getElementById('btnApplyWatermark'),

    // Stego Modal
    modalStegoInspector: document.getElementById('modalStegoInspector'),
    btnCloseStegoInspector: document.getElementById('btnCloseStegoInspector'),
    segBitPlane: document.getElementById('segBitPlane'),
    selStegoChannel: document.getElementById('selStegoChannel'),
    stegoCanvas: document.getElementById('stegoCanvas')
  };

  // ─── INITIALIZATION & EVENT BINDINGS ──────────────────────────────────────
  function init() {
    bindUIEvents();
    bindDragAndDrop();
    bindClipboard();
    updateTheme(state.theme);
  }

  function bindUIEvents() {
    // Theme toggle
    el.btnThemeToggle.addEventListener('click', () => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      updateTheme(state.theme);
    });

    // File Input
    el.btnSelectFiles.addEventListener('click', () => el.fileInput.click());
    el.fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length) {
        loadFilesList(e.target.files);
        el.fileInput.value = '';
      }
    });

    // Paste
    el.btnPasteClipboard.addEventListener('click', pasteFromClipboard);

    // Format segmented buttons
    el.segFormat.addEventListener('click', (e) => {
      const btn = e.target.closest('.seg-btn');
      if (!btn) return;
      el.segFormat.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.config.format = btn.dataset.val;
      el.selExtraFormat.value = '';
      updateQualitySliderVisibility();
      renderCurrentPreview();
    });

    el.selExtraFormat.addEventListener('change', (e) => {
      if (e.target.value) {
        state.config.format = e.target.value;
        el.segFormat.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
        updateQualitySliderVisibility();
        renderCurrentPreview();
      }
    });

    // Quality slider
    el.sliderQuality.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      el.lblQuality.textContent = `${val}%`;
      state.config.quality = val / 100;
    });

    // Preset selection
    el.selPreset.addEventListener('change', (e) => {
      const val = e.target.value;
      state.config.preset = val;
      if (val && val.includes('x')) {
        const [w, h] = val.split('x').map(Number);
        el.inputWidth.value = w;
        el.inputHeight.value = h;
        state.config.targetW = w;
        state.config.targetH = h;
        state.config.aspectRatio = w / h;
      } else {
        el.inputWidth.value = '';
        el.inputHeight.value = '';
        state.config.targetW = null;
        state.config.targetH = null;
      }
      renderCurrentPreview();
    });

    // Custom dimensions
    el.inputWidth.addEventListener('input', (e) => {
      const w = parseInt(e.target.value, 10);
      state.config.targetW = w > 0 ? w : null;
      if (state.config.lockAspect && state.config.aspectRatio && w > 0) {
        const h = Math.round(w / state.config.aspectRatio);
        el.inputHeight.value = h;
        state.config.targetH = h;
      }
      renderCurrentPreview();
    });

    el.inputHeight.addEventListener('input', (e) => {
      const h = parseInt(e.target.value, 10);
      state.config.targetH = h > 0 ? h : null;
      if (state.config.lockAspect && state.config.aspectRatio && h > 0) {
        const w = Math.round(h * state.config.aspectRatio);
        el.inputWidth.value = w;
        state.config.targetW = w;
      }
      renderCurrentPreview();
    });

    el.chkLockAspect.addEventListener('change', (e) => {
      state.config.lockAspect = e.target.checked;
    });

    el.selFitMode.addEventListener('change', (e) => {
      state.config.fitMode = e.target.value;
      renderCurrentPreview();
    });

    // Canva cutout switch
    el.swCutout.addEventListener('change', (e) => {
      state.config.cutoutEnabled = e.target.checked;
      renderCurrentPreview();
    });

    // Quick background selector
    el.segBgMode.addEventListener('click', (e) => {
      const btn = e.target.closest('.seg-btn');
      if (!btn) return;
      el.segBgMode.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.config.canvaBgMode = btn.dataset.val;
      renderCurrentPreview();
    });

    // Canva effects checkboxes
    el.chkShadow.addEventListener('change', (e) => {
      state.config.shadowEnabled = e.target.checked;
      renderCurrentPreview();
    });

    el.chkGlow.addEventListener('change', (e) => {
      state.config.glowEnabled = e.target.checked;
      renderCurrentPreview();
    });

    // Sliders: Tolerance & Sharpen
    el.sliderTolerance.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      el.lblTolerance.textContent = `${val}%`;
      state.config.tolerance = val;
      renderCurrentPreview();
    });

    el.sliderSharpen.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      el.lblSharpen.textContent = `${val}%`;
      state.config.sharpen = val;
      renderCurrentPreview();
    });

    // Stego actions
    el.btnSelectLogo.addEventListener('click', () => el.logoInput.click());
    el.logoInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        loadHiddenLogo(e.target.files[0]);
      }
    });

    el.btnOpenStegoInspector.addEventListener('click', openStegoModal);
    el.btnQuickSanitize.addEventListener('click', quickSanitizeCurrent);
    el.btnNavClean.addEventListener('click', quickSanitizeCurrent);
    el.chkCleanStego.addEventListener('change', (e) => {
      state.config.cleanStego = e.target.checked;
    });

    // Navigation buttons inside Preview
    el.btnPrevImg.addEventListener('click', () => selectImageIndex(state.activeIndex - 1));
    el.btnNextImg.addEventListener('click', () => selectImageIndex(state.activeIndex + 1));

    // View mode pills & zoom toggle (Cho phép xem ảnh to cực đại)
    if (el.btnModeCompare) el.btnModeCompare.addEventListener('click', () => setViewMode('compare'));
    if (el.btnModeSingleProc) el.btnModeSingleProc.addEventListener('click', () => setViewMode('single-proc'));
    if (el.btnModeSingleOrig) el.btnModeSingleOrig.addEventListener('click', () => setViewMode('single-orig'));
    if (el.btnToggleZoom) el.btnToggleZoom.addEventListener('click', toggleZoomMode);

    // Studio openers
    el.btnOpenCanvaStudio.addEventListener('click', openCanvaStudioModal);
    el.btnNavCanva.addEventListener('click', openCanvaStudioModal);
    el.btnOpenWatermarkStudio.addEventListener('click', openWatermarkModal);
    el.btnNavErase.addEventListener('click', openWatermarkModal);

    // Download single current
    el.btnDownloadCurrent.addEventListener('click', downloadCurrentItem);

    // Batch Convert & Clear
    el.btnStartBatch.addEventListener('click', startBatchConversion);
    el.btnDownloadAllZip.addEventListener('click', startBatchConversion);
    el.btnClearAll.addEventListener('click', clearAll);

    // Tabs switching
    el.tabBtnPreview.addEventListener('click', () => switchTab('preview'));
    el.tabBtnQueue.addEventListener('click', () => switchTab('queue'));

    // Modal close buttons
    el.btnCloseCanvaStudio.addEventListener('click', () => el.modalCanvaStudio.style.display = 'none');
    el.btnCloseWatermarkStudio.addEventListener('click', () => el.modalWatermarkStudio.style.display = 'none');
    el.btnCancelWatermark.addEventListener('click', () => el.modalWatermarkStudio.style.display = 'none');
    el.btnCloseStegoInspector.addEventListener('click', () => el.modalStegoInspector.style.display = 'none');

    // Setup Canvas Retouch listeners for Canva Studio
    setupCanvaStudioCanvasEvents();
    // Setup Watermark Inpaint listeners
    setupWatermarkCanvasEvents();
    // Setup Stego Inspector listeners
    setupStegoInspectorEvents();
  }

  function updateTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      el.themeIcon.textContent = '☀';
      el.themeText.textContent = 'Sáng';
    } else {
      el.themeIcon.textContent = '🌙';
      el.themeText.textContent = 'Tối';
    }
  }

  function updateQualitySliderVisibility() {
    const isLossy = ['WEBP', 'JPG'].includes(state.config.format);
    const box = document.getElementById('qualityBox');
    if (box) {
      box.style.opacity = isLossy ? '1' : '0.4';
      box.style.pointerEvents = isLossy ? 'auto' : 'none';
    }
  }

  function switchTab(tab) {
    if (tab === 'preview') {
      el.tabBtnPreview.classList.add('active');
      el.tabBtnQueue.classList.remove('active');
      el.tabPreview.style.display = 'flex';
      el.tabQueue.style.display = 'none';
    } else {
      el.tabBtnPreview.classList.remove('active');
      el.tabBtnQueue.classList.add('active');
      el.tabPreview.style.display = 'none';
      el.tabQueue.style.display = 'flex';
      renderQueueTable();
    }
  }

  function setViewMode(mode) {
    state.viewMode = mode;
    if (el.btnModeCompare) el.btnModeCompare.classList.toggle('active', mode === 'compare');
    if (el.btnModeSingleProc) el.btnModeSingleProc.classList.toggle('active', mode === 'single-proc');
    if (el.btnModeSingleOrig) el.btnModeSingleOrig.classList.toggle('active', mode === 'single-orig');

    if (!el.comparisonGrid) return;
    if (mode === 'compare') {
      el.comparisonGrid.style.gridTemplateColumns = '1fr 1fr';
      if (el.paneOrigDrop) el.paneOrigDrop.style.display = 'flex';
      if (el.paneProc) el.paneProc.style.display = 'flex';
    } else if (mode === 'single-proc') {
      el.comparisonGrid.style.gridTemplateColumns = '1fr';
      if (el.paneOrigDrop) el.paneOrigDrop.style.display = 'none';
      if (el.paneProc) el.paneProc.style.display = 'flex';
    } else if (mode === 'single-orig') {
      el.comparisonGrid.style.gridTemplateColumns = '1fr';
      if (el.paneProc) el.paneProc.style.display = 'none';
      if (el.paneOrigDrop) el.paneOrigDrop.style.display = 'flex';
    }
  }

  function toggleZoomMode() {
    state.zoomFit = !state.zoomFit;
    if (el.btnToggleZoom) {
      el.btnToggleZoom.textContent = state.zoomFit ? '🔍 Vừa Khung' : '🔍 100% Gốc';
      el.btnToggleZoom.title = state.zoomFit ? 'Đang xem vừa khung tối đa. Bấm để xem kích thước thực 100%' : 'Đang xem kích thước thực 100%. Bấm để phóng to vừa khung tối đa';
    }
    if (el.imgOrig) el.imgOrig.classList.toggle('zoom-actual', !state.zoomFit);
    if (el.canvasPreview) el.canvasPreview.classList.toggle('zoom-actual', !state.zoomFit);
  }

  // ─── DRAG AND DROP & CLIPBOARD ────────────────────────────────────────────
  function bindDragAndDrop() {
    window.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
    });

    window.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
        loadFilesList(e.dataTransfer.files);
      }
    });

    el.paneOrigDrop.addEventListener('click', () => {
      if (!state.files.length) el.fileInput.click();
    });
  }

  function bindClipboard() {
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        // Handled by paste event
      } else if (e.key === 'ArrowLeft') {
        selectImageIndex(state.activeIndex - 1);
      } else if (e.key === 'ArrowRight') {
        selectImageIndex(state.activeIndex + 1);
      }
    });

    window.addEventListener('paste', (e) => {
      const items = (e.clipboardData || window.clipboardData).items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          const file = new File([blob], `clipboard_${Date.now()}.png`, { type: 'image/png' });
          loadFilesList([file]);
          break;
        }
      }
    });
  }

  async function pasteFromClipboard() {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        const imageType = item.types.find(type => type.startsWith('image/'));
        if (imageType) {
          const blob = await item.getType(imageType);
          const file = new File([blob], `clipboard_${Date.now()}.png`, { type: imageType });
          loadFilesList([file]);
          return;
        }
      }
      setStatus('Không tìm thấy ảnh trong bộ nhớ tạm (Clipboard)');
    } catch (err) {
      setStatus('Hãy nhấn Ctrl+V trực tiếp trên trang để dán ảnh!');
    }
  }

  // ─── FILE LOADING & QUEUE MANAGEMENT ──────────────────────────────────────
  function loadFilesList(fileList) {
    let countAdded = 0;
    const promises = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (!file.type.startsWith('image/')) continue;

      const p = new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const item = {
              id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
              file: file,
              name: file.name,
              src: event.target.result,
              img: img,
              origW: img.naturalWidth || img.width,
              origH: img.naturalHeight || img.height,
              sizeBytes: file.size,
              status: 'Sẵn sàng',
              customMask: null,
              procBlob: null
            };
            state.files.push(item);
            countAdded++;
            resolve();
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      });
      promises.push(p);
    }

    Promise.all(promises).then(() => {
      if (countAdded > 0) {
        if (state.activeIndex === -1) {
          selectImageIndex(0);
        } else {
          updateHeaderCount();
          renderQueueTable();
        }
        setStatus(`Đã nạp ${countAdded} ảnh thành công!`);
      }
    });
  }

  function updateHeaderCount() {
    const total = state.files.length;
    el.lblFileCount.textContent = total > 0 ? `${total} ảnh` : 'Chưa có ảnh';
    el.btnDownloadAllZip.style.display = total > 1 ? 'block' : 'none';
  }

  function selectImageIndex(idx) {
    if (!state.files.length) {
      state.activeIndex = -1;
      resetPreviewPanes();
      updateHeaderCount();
      renderQueueTable();
      return;
    }

    if (idx < 0) idx = 0;
    if (idx >= state.files.length) idx = state.files.length - 1;
    state.activeIndex = idx;

    const item = state.files[idx];
    el.lblImgIndex.textContent = `Ảnh ${idx + 1}/${state.files.length}`;
    el.lblCurrentFilename.textContent = item.name;
    el.lblCurrentFilename.title = item.name;

    // Update aspect ratio helper
    state.config.aspectRatio = item.origW / item.origH;
    if (state.config.preset && state.config.preset.includes('x')) {
      // Keep preset
    } else {
      el.inputWidth.placeholder = `${item.origW}`;
      el.inputHeight.placeholder = `${item.origH}`;
    }

    // Display Original
    el.placeholderOrig.style.display = 'none';
    el.imgOrig.style.display = 'block';
    el.imgOrig.src = item.src;
    el.imgOrig.classList.toggle('zoom-actual', !state.zoomFit);
    el.canvasPreview.classList.toggle('zoom-actual', !state.zoomFit);
    el.badgeOrig.textContent = `${item.origW} × ${item.origH} px (${formatBytes(item.sizeBytes)})`;

    updateHeaderCount();
    renderCurrentPreview();
    renderQueueTable();
  }

  function resetPreviewPanes() {
    el.lblImgIndex.textContent = 'Ảnh 0/0';
    el.lblCurrentFilename.textContent = 'Chưa nạp ảnh nào';
    el.placeholderOrig.style.display = 'block';
    el.imgOrig.style.display = 'none';
    el.imgOrig.src = '';
    el.badgeOrig.textContent = '—';

    el.placeholderProc.style.display = 'block';
    el.canvasPreview.style.display = 'none';
    el.badgeProc.textContent = '—';
    el.btnDownloadCurrent.style.display = 'none';
  }

  function removeQueueItem(idx) {
    state.files.splice(idx, 1);
    if (state.activeIndex >= state.files.length) {
      state.activeIndex = state.files.length - 1;
    }
    selectImageIndex(state.activeIndex);
    setStatus('Đã xóa mục khỏi danh sách.');
  }

  function clearAll() {
    state.files = [];
    state.activeIndex = -1;
    resetPreviewPanes();
    updateHeaderCount();
    renderQueueTable();
    setStatus('Đã làm trống danh sách.');
  }

  // ─── CANVAS RENDERING PIPELINE (LIVE PREVIEW) ─────────────────────────────
  let previewDebounceTimer = null;
  function renderCurrentPreview() {
    if (previewDebounceTimer) clearTimeout(previewDebounceTimer);
    previewDebounceTimer = setTimeout(() => {
      _executeRenderCurrentPreview();
    }, 40);
  }

  function _executeRenderCurrentPreview() {
    if (state.activeIndex < 0 || !state.files[state.activeIndex]) return;

    const item = state.files[state.activeIndex];
    const outCanvas = el.canvasPreview;

    // 1. Determine Output Dimensions
    let outW = state.config.targetW || item.origW;
    let outH = state.config.targetH || item.origH;

    // Render processed canvas
    processImageToCanvas(item, outCanvas, outW, outH, state.config);

    // Show preview elements
    el.placeholderProc.style.display = 'none';
    outCanvas.style.display = 'block';
    el.badgeProc.textContent = `${outW} × ${outH} px • ${state.config.format}`;
    el.btnDownloadCurrent.style.display = 'block';
  }

  /**
   * Main image processing algorithm on Canvas
   */
  function processImageToCanvas(item, targetCanvas, targetW, targetH, cfg) {
    const origW = item.origW;
    const origH = item.origH;
    targetCanvas.width = targetW;
    targetCanvas.height = targetH;
    const ctx = targetCanvas.getContext('2d', { willReadFrequently: true });
    ctx.clearRect(0, 0, targetW, targetH);

    // Step A: Create offscreen canvas for Cutout Subject
    let subjectCanvas = document.createElement('canvas');
    subjectCanvas.width = origW;
    subjectCanvas.height = origH;
    const subCtx = subjectCanvas.getContext('2d', { willReadFrequently: true });
    subCtx.drawImage(item.img, 0, 0, origW, origH);

    if (cfg.cutoutEnabled) {
      // 1. Run Cutout Segmentation
      const imgData = subCtx.getImageData(0, 0, origW, origH);
      const data = imgData.data;

      // Sample 4 corners for background reference
      const corners = [
        [0, 0],
        [origW - 1, 0],
        [0, origH - 1],
        [origW - 1, origH - 1]
      ];
      let bgR = 0, bgG = 0, bgB = 0;
      for (const [cx, cy] of corners) {
        const idx = (cy * origW + cx) * 4;
        bgR += data[idx];
        bgG += data[idx + 1];
        bgB += data[idx + 2];
      }
      bgR /= 4; bgG /= 4; bgB /= 4;

      const tol = (cfg.tolerance / 100) * 255;
      const tolSoft = tol * 1.35;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Euclidean color distance
        const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);

        if (dist < tol) {
          data[i + 3] = 0; // Transparent
        } else if (dist < tolSoft) {
          // Soft edge feathering
          const alphaFactor = (dist - tol) / (tolSoft - tol);
          data[i + 3] = Math.round(data[i + 3] * alphaFactor);
        }
      }

      // Apply manual brush mask if exists
      if (item.customMask) {
        const maskCtx = item.customMask.getContext('2d');
        const maskData = maskCtx.getImageData(0, 0, origW, origH).data;
        for (let i = 0; i < data.length; i += 4) {
          const action = maskData[i]; // 1 = Erase, 2 = Restore
          if (action === 255) {
            data[i + 3] = 0; // Erased
          } else if (action === 128) {
            data[i + 3] = 255; // Restored
          }
        }
      }

      subCtx.putImageData(imgData, 0, 0);
    }

    // Step B: Calculate Fit Mode transform
    let drawX = 0, drawY = 0, drawW = targetW, drawH = targetH;
    if (cfg.fitMode === 'contain') {
      const ratio = Math.min(targetW / origW, targetH / origH);
      drawW = Math.round(origW * ratio);
      drawH = Math.round(origH * ratio);
      drawX = Math.round((targetW - drawW) / 2);
      drawY = Math.round((targetH - drawH) / 2);
    } else if (cfg.fitMode === 'cover') {
      const ratio = Math.max(targetW / origW, targetH / origH);
      drawW = Math.round(origW * ratio);
      drawH = Math.round(origH * ratio);
      drawX = Math.round((targetW - drawW) / 2);
      drawY = Math.round((targetH - drawH) / 2);
    }

    // Step C: Render Background
    if (cfg.cutoutEnabled) {
      if (cfg.canvaBgMode === 'transparent') {
        // Leave canvas transparent
      } else if (cfg.canvaBgMode.startsWith('#')) {
        ctx.fillStyle = cfg.canvaBgMode;
        ctx.fillRect(0, 0, targetW, targetH);
      } else if (cfg.canvaBgMode === 'blur') {
        ctx.save();
        ctx.filter = `blur(${cfg.canvaBlurRadius}px)`;
        ctx.drawImage(item.img, drawX - 10, drawY - 10, drawW + 20, drawH + 20);
        ctx.restore();
      }
    } else {
      // Non-cutout: if contain mode, fill background with clean white or card bg
      if (cfg.fitMode === 'contain' && (drawX > 0 || drawY > 0)) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, targetW, targetH);
      }
    }

    // Step D: Render Effects (Shadow & Glow) behind Subject
    if (cfg.cutoutEnabled && cfg.shadowEnabled) {
      ctx.save();
      ctx.shadowColor = `rgba(0, 0, 0, ${cfg.shadowOpacity})`;
      ctx.shadowBlur = cfg.shadowBlur;
      ctx.shadowOffsetX = 10;
      ctx.shadowOffsetY = 12;
      ctx.drawImage(subjectCanvas, drawX, drawY, drawW, drawH);
      ctx.restore();
    }

    if (cfg.cutoutEnabled && cfg.glowEnabled) {
      ctx.save();
      ctx.shadowColor = cfg.glowColor;
      ctx.shadowBlur = cfg.glowWidth * 2;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.drawImage(subjectCanvas, drawX, drawY, drawW, drawH);
      ctx.drawImage(subjectCanvas, drawX, drawY, drawW, drawH);
      ctx.restore();
    }

    // Step E: Draw Final Subject
    ctx.drawImage(subjectCanvas, drawX, drawY, drawW, drawH);

    // Step F: Unsharp Mask Sharpening
    if (cfg.sharpen > 0) {
      applyUnsharpMask(ctx, targetW, targetH, cfg.sharpen / 100);
    }

    // Step G: Stego Sanitization (if enabled)
    if (cfg.cleanStego) {
      sanitizeCanvasLsb(ctx, targetW, targetH);
    }
  }

  /**
   * Fast Unsharp Mask filter on Canvas TypedArray
   */
  function applyUnsharpMask(ctx, w, h, amount) {
    const imgData = ctx.getImageData(0, 0, w, h);
    const src = imgData.data;
    const output = ctx.createImageData(w, h);
    const dst = output.data;

    // Convolution 3x3 kernel:
    // [  0, -a,  0 ]
    // [ -a, 1+4a, -a ]
    // [  0, -a,  0 ]
    const a = amount * 0.8;
    const center = 1 + 4 * a;

    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const idx = (y * w + x) * 4;
        const top = ((y - 1) * w + x) * 4;
        const bot = ((y + 1) * w + x) * 4;
        const left = (y * w + (x - 1)) * 4;
        const right = (y * w + (x + 1)) * 4;

        for (let c = 0; c < 3; c++) {
          const val = src[idx + c] * center -
                      (src[top + c] + src[bot + c] + src[left + c] + src[right + c]) * a;
          dst[idx + c] = Math.min(255, Math.max(0, val));
        }
        dst[idx + 3] = src[idx + 3];
      }
    }
    ctx.putImageData(output, 0, 0);
  }

  function sanitizeCanvasLsb(ctx, w, h) {
    const imgData = ctx.getImageData(0, 0, w, h);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
      d[i] = d[i] & 0xFC;     // Zero bottom 2 bits
      d[i + 1] = d[i + 1] & 0xFC;
      d[i + 2] = d[i + 2] & 0xFC;
    }
    ctx.putImageData(imgData, 0, 0);
  }

  // ─── QUEUE TABLE RENDERING ────────────────────────────────────────────────
  function renderQueueTable() {
    const container = el.queueCardsContainer;
    container.innerHTML = '';

    const total = state.files.length;
    const done = state.files.filter(f => f.status === 'Thành công').length;
    el.lblQueueStats.textContent = `Tổng số: ${total} ảnh  •  Hoàn tất: ${done}  •  Đang chờ: ${total - done}`;

    if (!total) {
      container.innerHTML = `
        <div class="queue-empty-notice">
          <span>📑</span>
          <p>Chưa có ảnh nào trong danh sách. Hãy thêm ảnh để xử lý hàng loạt!</p>
        </div>
      `;
      return;
    }

    state.files.forEach((item, idx) => {
      const card = document.createElement('div');
      card.className = 'queue-item-card';

      let statusClass = 'ready';
      if (item.status === 'Đang xử lý') statusClass = 'working';
      else if (item.status === 'Thành công') statusClass = 'success';
      else if (item.status === 'Lỗi') statusClass = 'error';

      card.innerHTML = `
        <span class="queue-idx-badge">${String(idx + 1).padStart(2, '0')}</span>
        <img class="queue-item-thumb" src="${item.src}" alt="${item.name}">
        <div class="queue-item-info">
          <span class="queue-item-name">${escapeHtml(item.name)}</span>
          <div class="queue-item-sub">
            <span>${item.origW} × ${item.origH} px</span>
            <span>•</span>
            <span class="status-tag ${statusClass}">${item.status}</span>
          </div>
        </div>
        <div class="queue-item-actions">
          <button class="btn-queue-view" title="Xem trước ảnh này">👁 Xem</button>
          <button class="btn-queue-del" title="Xóa khỏi danh sách">✕</button>
        </div>
      `;

      card.querySelector('.btn-queue-view').addEventListener('click', () => {
        selectImageIndex(idx);
        switchTab('preview');
      });

      card.querySelector('.btn-queue-del').addEventListener('click', () => {
        removeQueueItem(idx);
      });

      container.appendChild(card);
    });
  }

  // ─── BATCH EXPORT & DOWNLOADING ───────────────────────────────────────────
  async function downloadCurrentItem() {
    if (state.activeIndex < 0 || !state.files[state.activeIndex]) return;
    const item = state.files[state.activeIndex];
    setStatus(`Đang xuất ảnh: ${item.name}…`);

    const tempCanvas = document.createElement('canvas');
    let outW = state.config.targetW || item.origW;
    let outH = state.config.targetH || item.origH;
    processImageToCanvas(item, tempCanvas, outW, outH, state.config);

    const blob = await canvasToBlob(tempCanvas, state.config.format, state.config.quality);
    const ext = getExtensionForFormat(state.config.format);
    const baseName = item.name.replace(/\.[^/.]+$/, '');
    downloadBlob(blob, `${baseName}_converted.${ext}`);
    setStatus(`Đã tải xuống ${baseName}_converted.${ext}`);
  }

  async function startBatchConversion() {
    if (!state.files.length) {
      alert('Vui lòng thêm ít nhất một ảnh vào danh sách để chuyển đổi!');
      return;
    }

    setStatus('Đang bắt đầu xử lý hàng loạt…');
    el.progressBar.style.width = '0%';

    const total = state.files.length;
    const convertedItems = [];

    for (let i = 0; i < total; i++) {
      const item = state.files[i];
      item.status = 'Đang xử lý';
      renderQueueTable();

      const tempCanvas = document.createElement('canvas');
      let outW = state.config.targetW || item.origW;
      let outH = state.config.targetH || item.origH;

      processImageToCanvas(item, tempCanvas, outW, outH, state.config);
      const blob = await canvasToBlob(tempCanvas, state.config.format, state.config.quality);

      const ext = getExtensionForFormat(state.config.format);
      const baseName = item.name.replace(/\.[^/.]+$/, '');
      const outName = `${baseName}.${ext}`;

      convertedItems.push({ name: outName, blob: blob });
      item.status = 'Thành công';

      const pct = Math.round(((i + 1) / total) * 100);
      el.progressBar.style.width = `${pct}%`;
      renderQueueTable();
    }

    if (total === 1) {
      downloadBlob(convertedItems[0].blob, convertedItems[0].name);
      setStatus(`Đã xuất thành công: ${convertedItems[0].name}`);
    } else {
      // Pack into ZIP using JSZip
      setStatus('Đang nén toàn bộ ảnh vào tệp ZIP…');
      if (window.JSZip) {
        const zip = new window.JSZip();
        convertedItems.forEach(ci => {
          zip.file(ci.name, ci.blob);
        });
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        downloadBlob(zipBlob, `OmniImage_Batch_${Date.now()}.zip`);
        setStatus(`Hoàn tất! Đã tải gói ZIP (${total} ảnh).`);
      } else {
        // Fallback individual downloads
        convertedItems.forEach(ci => downloadBlob(ci.blob, ci.name));
        setStatus(`Hoàn tất xuất ${total} ảnh!`);
      }
    }
  }

  function canvasToBlob(canvas, format, quality) {
    return new Promise((resolve) => {
      let mime = 'image/png';
      if (format === 'WEBP') mime = 'image/webp';
      else if (format === 'JPG' || format === 'JPEG') mime = 'image/jpeg';
      else if (format === 'BMP') mime = 'image/bmp';

      canvas.toBlob((blob) => {
        resolve(blob);
      }, mime, quality);
    });
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  function getExtensionForFormat(fmt) {
    const map = { WEBP: 'webp', PNG: 'png', JPG: 'jpg', ICO: 'ico', PDF: 'pdf', BMP: 'bmp', GIF: 'gif', TIFF: 'tiff' };
    return map[fmt] || 'png';
  }

  // ─── CANVA BACKGROUND STUDIO MODAL LOGIC ─────────────────────────────────
  function openCanvaStudioModal() {
    if (state.activeIndex < 0 || !state.files[state.activeIndex]) {
      alert('Vui lòng chọn hoặc thêm ảnh trước khi mở Canva Background Studio!');
      return;
    }
    const item = state.files[state.activeIndex];
    el.modalCanvaStudio.style.display = 'flex';

    // Prepare studio canvases
    state.studio.baseCanvas = document.createElement('canvas');
    state.studio.baseCanvas.width = item.origW;
    state.studio.baseCanvas.height = item.origH;
    const bCtx = state.studio.baseCanvas.getContext('2d');
    bCtx.drawImage(item.img, 0, 0);

    // Prepare mask canvas (255 = Erased, 128 = Restored, 0 = Normal)
    state.studio.maskCanvas = document.createElement('canvas');
    state.studio.maskCanvas.width = item.origW;
    state.studio.maskCanvas.height = item.origH;
    const mCtx = state.studio.maskCanvas.getContext('2d');
    if (item.customMask) {
      mCtx.drawImage(item.customMask, 0, 0);
    }

    state.studio.undoStack = [];
    pushStudioUndo();
    renderStudioDisplay();
  }

  function pushStudioUndo() {
    const m = state.studio.maskCanvas;
    const copy = document.createElement('canvas');
    copy.width = m.width;
    copy.height = m.height;
    copy.getContext('2d').drawImage(m, 0, 0);
    state.studio.undoStack.push(copy);
    if (state.studio.undoStack.length > 20) state.studio.undoStack.shift();
  }

  function doStudioUndo() {
    if (state.studio.undoStack.length > 1) {
      state.studio.undoStack.pop(); // Remove current
      const prev = state.studio.undoStack[state.studio.undoStack.length - 1];
      const m = state.studio.maskCanvas;
      const mCtx = m.getContext('2d');
      mCtx.clearRect(0, 0, m.width, m.height);
      mCtx.drawImage(prev, 0, 0);
      renderStudioDisplay();
    }
  }

  function setupCanvaStudioCanvasEvents() {
    // Retouch Tools
    el.segRetouchTool.addEventListener('click', (e) => {
      const btn = e.target.closest('.seg-btn');
      if (!btn) return;
      el.segRetouchTool.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.studio.tool = btn.dataset.tool;
    });

    el.sliderBrushSize.addEventListener('input', (e) => {
      state.studio.brushSize = parseInt(e.target.value, 10);
      el.lblBrushSize.textContent = `${state.studio.brushSize}px`;
    });

    el.btnStudioUndo.addEventListener('click', doStudioUndo);

    // Methods & Background in studio
    el.segStudioMethod.addEventListener('click', (e) => {
      const btn = e.target.closest('.seg-btn');
      if (!btn) return;
      el.segStudioMethod.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.studio.method = btn.dataset.method;
    });

    el.btnStudioRunCutout.addEventListener('click', () => {
      state.config.cutoutEnabled = true;
      el.swCutout.checked = true;
      renderStudioDisplay();
    });

    el.segStudioBgType.addEventListener('click', (e) => {
      const btn = e.target.closest('.seg-btn');
      if (!btn) return;
      el.segStudioBgType.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.studio.bgType = btn.dataset.bg;
      el.studioBlurBox.style.display = btn.dataset.bg === 'blur' ? 'block' : 'none';
      renderStudioDisplay();
    });

    // Swatches
    document.querySelectorAll('.palette-swatch').forEach(sw => {
      sw.addEventListener('click', () => {
        state.studio.bgType = 'color';
        state.studio.bgColor = sw.dataset.color;
        el.segStudioBgType.querySelectorAll('.seg-btn').forEach(b => {
          b.classList.toggle('active', b.dataset.bg === 'color');
        });
        renderStudioDisplay();
      });
    });

    el.studioColorPicker.addEventListener('input', (e) => {
      state.studio.bgType = 'color';
      state.studio.bgColor = e.target.value;
      renderStudioDisplay();
    });

    el.sliderStudioBlur.addEventListener('input', (e) => {
      state.studio.blurRadius = parseInt(e.target.value, 10);
      el.lblStudioBlur.textContent = `${state.studio.blurRadius}px`;
      if (state.studio.bgType === 'blur') renderStudioDisplay();
    });

    el.chkStudioShadow.addEventListener('change', (e) => {
      state.studio.shadow = e.target.checked;
      renderStudioDisplay();
    });

    el.chkStudioGlow.addEventListener('change', (e) => {
      state.studio.glow = e.target.checked;
      renderStudioDisplay();
    });

    // Hold compare button
    el.btnStudioCompare.addEventListener('mousedown', () => {
      const sCanvas = el.studioCanvas;
      const ctx = sCanvas.getContext('2d');
      ctx.drawImage(state.studio.baseCanvas, 0, 0);
    });
    el.btnStudioCompare.addEventListener('mouseup', renderStudioDisplay);
    el.btnStudioCompare.addEventListener('mouseleave', renderStudioDisplay);

    // Apply button
    el.btnStudioApply.addEventListener('click', () => {
      const item = state.files[state.activeIndex];
      if (item) {
        item.customMask = document.createElement('canvas');
        item.customMask.width = state.studio.maskCanvas.width;
        item.customMask.height = state.studio.maskCanvas.height;
        item.customMask.getContext('2d').drawImage(state.studio.maskCanvas, 0, 0);

        state.config.cutoutEnabled = true;
        el.swCutout.checked = true;

        if (state.studio.bgType === 'color') {
          state.config.canvaBgMode = state.studio.bgColor;
        } else {
          state.config.canvaBgMode = state.studio.bgType;
        }
        state.config.canvaBlurRadius = state.studio.blurRadius;
        state.config.shadowEnabled = state.studio.shadow;
        el.chkShadow.checked = state.studio.shadow;
        state.config.glowEnabled = state.studio.glow;
        el.chkGlow.checked = state.studio.glow;

        renderCurrentPreview();
        el.modalCanvaStudio.style.display = 'none';
        setStatus('Đã áp dụng các tinh chỉnh từ Canva Studio!');
      }
    });

    // Drawing on Studio Canvas
    const sCanvas = el.studioCanvas;
    sCanvas.addEventListener('mousedown', (e) => {
      if (state.studio.tool === 'view') return;
      state.studio.isDrawing = true;
      pushStudioUndo();
      drawOnStudioMask(e);
    });

    sCanvas.addEventListener('mousemove', (e) => {
      if (!state.studio.isDrawing) return;
      drawOnStudioMask(e);
    });

    window.addEventListener('mouseup', () => {
      if (state.studio.isDrawing) {
        state.studio.isDrawing = false;
        renderStudioDisplay();
      }
    });
  }

  function drawOnStudioMask(e) {
    const sCanvas = el.studioCanvas;
    const rect = sCanvas.getBoundingClientRect();
    const scaleX = sCanvas.width / rect.width;
    const scaleY = sCanvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const mCtx = state.studio.maskCanvas.getContext('2d');
    mCtx.beginPath();
    mCtx.arc(x, y, state.studio.brushSize, 0, Math.PI * 2);
    // 255 = Erase, 128 = Restore
    mCtx.fillStyle = state.studio.tool === 'erase' ? 'rgb(255, 0, 0)' : 'rgb(128, 0, 0)';
    mCtx.fill();
    renderStudioDisplay();
  }

  function renderStudioDisplay() {
    const item = state.files[state.activeIndex];
    if (!item) return;

    const sCanvas = el.studioCanvas;
    const w = item.origW;
    const h = item.origH;
    sCanvas.width = w;
    sCanvas.height = h;

    const studioCfg = {
      cutoutEnabled: state.config.cutoutEnabled,
      canvaBgMode: state.studio.bgType === 'color' ? state.studio.bgColor : state.studio.bgType,
      canvaBlurRadius: state.studio.blurRadius,
      shadowEnabled: state.studio.shadow,
      shadowBlur: 16,
      shadowOpacity: 0.45,
      glowEnabled: state.studio.glow,
      glowWidth: 6,
      glowColor: '#FFFFFF',
      tolerance: state.config.tolerance,
      sharpen: 0,
      fitMode: 'stretch',
      cleanStego: false
    };

    const tempItem = {
      origW: w, origH: h, img: item.img, customMask: state.studio.maskCanvas
    };

    processImageToCanvas(tempItem, sCanvas, w, h, studioCfg);
  }

  // ─── WATERMARK / LOGO ERASER INPAINTING ENGINE ────────────────────────────
  function openWatermarkModal() {
    if (state.activeIndex < 0 || !state.files[state.activeIndex]) {
      alert('Vui lòng chọn ảnh trước khi mở công cụ Xóa Logo!');
      return;
    }
    const item = state.files[state.activeIndex];
    el.modalWatermarkStudio.style.display = 'flex';

    const w = item.origW;
    const h = item.origH;
    state.watermark.baseCanvas = document.createElement('canvas');
    state.watermark.baseCanvas.width = w;
    state.watermark.baseCanvas.height = h;
    state.watermark.baseCanvas.getContext('2d').drawImage(item.img, 0, 0);

    state.watermark.maskCanvas = document.createElement('canvas');
    state.watermark.maskCanvas.width = w;
    state.watermark.maskCanvas.height = h;

    renderWatermarkDisplay();
  }

  function setupWatermarkCanvasEvents() {
    el.sliderInpaintBrush.addEventListener('input', (e) => {
      state.watermark.brushSize = parseInt(e.target.value, 10);
      el.lblInpaintBrushSize.textContent = `${state.watermark.brushSize}px`;
    });

    el.btnInpaintClearMask.addEventListener('click', () => {
      const m = state.watermark.maskCanvas;
      m.getContext('2d').clearRect(0, 0, m.width, m.height);
      renderWatermarkDisplay();
    });

    // Inpainting algorithm trigger
    el.btnRunInpaint.addEventListener('click', () => {
      setStatus('Đang chạy thuật toán xóa logo…');
      executeInpaint();
    });

    el.btnApplyWatermark.addEventListener('click', () => {
      const item = state.files[state.activeIndex];
      if (item) {
        const newImg = new Image();
        newImg.onload = () => {
          item.img = newImg;
          item.src = state.watermark.baseCanvas.toDataURL();
          renderCurrentPreview();
          el.modalWatermarkStudio.style.display = 'none';
          setStatus('Đã lưu kết quả xóa logo!');
        };
        newImg.src = state.watermark.baseCanvas.toDataURL();
      }
    });

    const cv = el.inpaintCanvas;
    cv.addEventListener('mousedown', (e) => {
      state.watermark.isDrawing = true;
      drawWatermarkMask(e);
    });
    cv.addEventListener('mousemove', (e) => {
      if (!state.watermark.isDrawing) return;
      drawWatermarkMask(e);
    });
    window.addEventListener('mouseup', () => {
      state.watermark.isDrawing = false;
    });
  }

  function drawWatermarkMask(e) {
    const cv = el.inpaintCanvas;
    const rect = cv.getBoundingClientRect();
    const scaleX = cv.width / rect.width;
    const scaleY = cv.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const mCtx = state.watermark.maskCanvas.getContext('2d');
    mCtx.beginPath();
    mCtx.arc(x, y, state.watermark.brushSize, 0, Math.PI * 2);
    mCtx.fillStyle = 'rgba(255, 0, 0, 1)';
    mCtx.fill();
    renderWatermarkDisplay();
  }

  function renderWatermarkDisplay() {
    const cv = el.inpaintCanvas;
    const w = state.watermark.baseCanvas.width;
    const h = state.watermark.baseCanvas.height;
    cv.width = w;
    cv.height = h;
    const ctx = cv.getContext('2d');

    // Draw base
    ctx.drawImage(state.watermark.baseCanvas, 0, 0);

    // Draw mask overlay with semi-transparency
    ctx.save();
    ctx.globalAlpha = 0.55;
    ctx.drawImage(state.watermark.maskCanvas, 0, 0);
    ctx.restore();
  }

  /**
   * Client-Side Fast Inpainting Algorithm (Neighborhood Diffusion)
   */
  function executeInpaint() {
    const bCanvas = state.watermark.baseCanvas;
    const mCanvas = state.watermark.maskCanvas;
    const w = bCanvas.width;
    const h = bCanvas.height;

    const bCtx = bCanvas.getContext('2d');
    const mCtx = mCanvas.getContext('2d');

    const imgData = bCtx.getImageData(0, 0, w, h);
    const maskData = mCtx.getImageData(0, 0, w, h).data;
    const data = imgData.data;

    // Identify masked pixels
    const rad = 6;
    // Perform 3 iterations of diffusion
    for (let iter = 0; iter < 4; iter++) {
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 4;
          if (maskData[idx] > 50) { // Masked
            let sumR = 0, sumG = 0, sumB = 0, count = 0;
            for (let dy = -rad; dy <= rad; dy++) {
              const ny = y + dy;
              if (ny < 0 || ny >= h) continue;
              for (let dx = -rad; dx <= rad; dx++) {
                const nx = x + dx;
                if (nx < 0 || nx >= w) continue;
                const nIdx = (ny * w + nx) * 4;
                if (maskData[nIdx] <= 50) { // Sample clean pixel
                  const weight = 1 / (1 + Math.sqrt(dx * dx + dy * dy));
                  sumR += data[nIdx] * weight;
                  sumG += data[nIdx + 1] * weight;
                  sumB += data[nIdx + 2] * weight;
                  count += weight;
                }
              }
            }
            if (count > 0) {
              data[idx] = Math.round(sumR / count);
              data[idx + 1] = Math.round(sumG / count);
              data[idx + 2] = Math.round(sumB / count);
            }
          }
        }
      }
    }

    bCtx.putImageData(imgData, 0, 0);
    // Clear mask
    mCtx.clearRect(0, 0, w, h);
    renderWatermarkDisplay();
    setStatus('Đã xóa logo thành công!');
  }

  // ─── STEGANOGRAPHY LSB INSPECTOR & EMBEDDING ──────────────────────────────
  function loadHiddenLogo(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        state.config.hiddenLogoImg = img;
        state.config.hiddenLogoName = file.name;
        el.lblLogoInfo.textContent = `Đã chọn: ${file.name}`;
        setStatus(`Đã tải logo nhúng: ${file.name}`);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function quickSanitizeCurrent() {
    if (state.activeIndex < 0 || !state.files[state.activeIndex]) return;
    const item = state.files[state.activeIndex];
    const c = document.createElement('canvas');
    c.width = item.origW;
    c.height = item.origH;
    const ctx = c.getContext('2d');
    ctx.drawImage(item.img, 0, 0);
    sanitizeCanvasLsb(ctx, item.origW, item.origH);

    const newImg = new Image();
    newImg.onload = () => {
      item.img = newImg;
      renderCurrentPreview();
      setStatus('Đã tẩy sạch toàn bộ logo và thủy vân ẩn trong ảnh hiện tại!');
    };
    newImg.src = c.toDataURL();
  }

  function openStegoModal() {
    if (state.activeIndex < 0 || !state.files[state.activeIndex]) {
      alert('Vui lòng chọn ảnh trước khi soi logo ẩn!');
      return;
    }
    el.modalStegoInspector.style.display = 'flex';
    renderStegoDisplay();
  }

  function setupStegoInspectorEvents() {
    el.segBitPlane.addEventListener('click', (e) => {
      const btn = e.target.closest('.seg-btn');
      if (!btn) return;
      el.segBitPlane.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderStegoDisplay();
    });

    el.selStegoChannel.addEventListener('change', renderStegoDisplay);
  }

  function renderStegoDisplay() {
    const item = state.files[state.activeIndex];
    if (!item) return;

    const bit = parseInt(el.segBitPlane.querySelector('.seg-btn.active').dataset.bit, 10);
    const channel = el.selStegoChannel.value;

    const canvas = el.stegoCanvas;
    const w = item.origW;
    const h = item.origH;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(item.img, 0, 0);

    const imgData = ctx.getImageData(0, 0, w, h);
    const d = imgData.data;

    for (let i = 0; i < d.length; i += 4) {
      let val = 0;
      if (channel === 'red') {
        val = ((d[i] >> bit) & 1) * 255;
        d[i] = val; d[i + 1] = 0; d[i + 2] = 0;
      } else if (channel === 'green') {
        val = ((d[i + 1] >> bit) & 1) * 255;
        d[i] = 0; d[i + 1] = val; d[i + 2] = 0;
      } else if (channel === 'blue') {
        val = ((d[i + 2] >> bit) & 1) * 255;
        d[i] = 0; d[i + 1] = 0; d[i + 2] = val;
      } else {
        // Average or grayscale bit extraction
        const rBit = (d[i] >> bit) & 1;
        const gBit = (d[i + 1] >> bit) & 1;
        const bBit = (d[i + 2] >> bit) & 1;
        val = Math.round(((rBit + gBit + bBit) / 3) * 255);
        d[i] = val; d[i + 1] = val; d[i + 2] = val;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }

  // ─── UTILITIES ────────────────────────────────────────────────────────────
  function setStatus(msg) {
    el.lblStatus.textContent = msg;
  }

  function formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // Start application on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
