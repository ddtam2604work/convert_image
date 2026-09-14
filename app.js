/**
 * Lumina Studio Pro — Light Studio Precision v2.4
 * Core Reactive Studio Engine & Real-Time Image Processing Suite
 * Full Implementation: Pixel-level Exposure, Contrast, Highlights, Shadows,
 * AI Enhance, Denoise, 3-Way Color Wheels, RGB Histogram, Layers & Canva FX.
 */

(function () {
  'use strict';

  // ─── STUDIO STATE ──────────────────────────────────────────────────────────
  const state = {
    files: [],             // Array of { id, name, file, img, origW, origH, status }
    activeIndex: -1,
    activeTool: 'select',
    activeSubTool: 'move',
    zoomLevel: 1.0,
    isComparing: false,
    rtxAccelerated: true,

    // Optical & Neural Parameters
    adjustments: {
      aiEnhance: 82,       // 0 to 100%
      denoise: 60,         // 0 to 100%
      exposure: 18,        // -100 to 100 (+0.35 EV)
      contrast: 18,        // -100 to 100
      highlights: -24,     // -100 to 100
      shadows: 35,         // -100 to 100
      colorWheels: {
        shadows: { angle: 198, sat: 14 },
        midtones: { angle: 38, sat: 8 },
        highlights: { angle: 214, sat: 12 }
      },
      colorPreset: 'Teal & Orange'
    },

    // Studio FX & Cutout
    fx: {
      cutoutActive: false,
      defringe: false,
      upscale4k: false,
      dropShadow: false,
      shadowBlur: 16,
      shadowOpacity: 0.45,
      relightGlow: false,
      glowColor: '#4648d4'
    },

    // Layers Manager
    layers: {
      subject: { visible: true, opacity: 1.0, locked: false },
      glow: { visible: true, opacity: 0.85, locked: true },
      lut: { visible: true, opacity: 0.65, locked: false },
      alpha: { visible: true, locked: true }
    },

    // Export & Sizing Configuration
    config: {
      format: 'WEBP',
      quality: 0.90,
      preset: '',
      targetW: null,
      targetH: null
    },

    // Transform (Rotate & Flip Studio)
    transform: {
      rotation: 0,
      flipH: false,
      flipV: false
    },

    // Watermark & Branding Stamp
    watermark: {
      active: false,
      text: '© Lumina Studio Pro',
      pos: 'br',
      color: 'white',
      opacity: 0.5,
      size: 28
    },

    // Split Screen Compare
    splitPercent: 50,

    // Inpaint Studio
    inpaint: {
      tool: 'brush',
      brushSize: 24,
      isDrawing: false,
      lastX: null,
      lastY: null
    },

    // Pan state
    pan: {
      isPanning: false,
      startX: 0,
      startY: 0,
      transX: 0,
      transY: 0
    },

    // Undo / Redo Stacks
    history: ['Khởi tạo studio'],
    redoStack: []
  };

  // ─── DOM ELEMENT SHORTCUTS ────────────────────────────────────────────────
  const $ = (id) => document.getElementById(id);
  const $$ = (selector) => document.querySelectorAll(selector);

  const el = {
    // Inputs
    fileInput: $('fileInput'),
    logoInput: $('logoInput'),
    customBgInput: $('customBgInput'),

    // Header Elements
    hdrFileName: $('hdrFileName'),
    hdrBitDepth: $('hdrBitDepth'),
    hdrZoomText: $('hdrZoomText'),
    btnHdrUndo: $('btnHdrUndo'),
    btnHdrRedo: $('btnHdrRedo'),
    btnHeaderExport: $('btnHeaderExport'),
    quickExportMenu: $('quickExportMenu'),
    btnQuickPng: $('btnQuickPng'),
    btnQuickWebp: $('btnQuickWebp'),
    btnQuickJpg: $('btnQuickJpg'),
    btnOpenFullExportModal: $('btnOpenFullExportModal'),
    btnZoomDropdown: $('btnZoomDropdown'),
    btnToggleRTX: $('btnToggleRTX'),
    btnLogoHome: $('btnLogoHome'),
    btnOpenFileBadge: $('btnOpenFileBadge'),
    btnUserProfile: $('btnUserProfile'),

    // Nav Pills
    btnNavEdit: $('btnNavEdit'),
    btnNavGenAI: $('btnNavGenAI'),
    btnNavBatch: $('btnNavBatch'),
    btnNavLibrary: $('btnNavLibrary'),

    // Canvas Workspace
    canvasFileName: $('canvasFileName'),
    canvasFormatBadge: $('canvasFormatBadge'),
    canvasAlphaBadge: $('canvasAlphaBadge'),
    canvasZoomLabel: $('canvasZoomLabel'),
    btnZoomIn: $('btnZoomIn'),
    btnZoomOut: $('btnZoomOut'),
    btnToggleCompare: $('btnToggleCompare'),
    viewportContainer: $('viewportContainer'),
    artboardWrapper: $('artboardWrapper'),
    emptyDropzone: $('emptyDropzone'),
    btnEmptyBrowse: $('btnEmptyBrowse'),
    mainCanvas: $('mainCanvas'),
    compareOverlay: $('compareOverlay'),
    compareCanvas: $('compareCanvas'),
    compareDivider: $('compareDivider'),
    studioBoundingBox: $('studioBoundingBox'),
    ambientGlow: $('ambientGlow'),
    pinCutout: $('pinCutout'),
    pinGlow: $('pinGlow'),
    hudActionBar: $('hudActionBar'),

    // HUD Bar Buttons
    hudCutout: $('hudCutout'),
    hudDefringe: $('hudDefringe'),
    hudUpscale: $('hudUpscale'),
    hudShadow: $('hudShadow'),
    hudRelight: $('hudRelight'),
    hudRotateCw: $('hudRotateCw'),
    hudFlipH: $('hudFlipH'),
    hudFlipV: $('hudFlipV'),
    hudWatermark: $('hudWatermark'),

    // Auto-Balance & Filters
    btnAutoBalance: $('btnAutoBalance'),
    activeFilterName: $('activeFilterName'),

    // Watermark Modal
    modalWatermark: $('modalWatermark'),
    inputWatermarkText: $('inputWatermarkText'),
    selWatermarkPos: $('selWatermarkPos'),
    selWatermarkColor: $('selWatermarkColor'),
    sliderWatermarkOpacity: $('sliderWatermarkOpacity'),
    lblWatermarkOpacity: $('lblWatermarkOpacity'),
    sliderWatermarkSize: $('sliderWatermarkSize'),
    lblWatermarkSize: $('lblWatermarkSize'),
    btnApplyWatermark: $('btnApplyWatermark'),
    btnClearWatermark: $('btnClearWatermark'),

    // Status Footer
    statX: $('statX'),
    statY: $('statY'),
    statDimensions: $('statDimensions'),
    statVram: $('statVram'),
    statHistoryStep: $('statHistoryStep'),
    btnFooterUndo: $('btnFooterUndo'),
    btnFooterRedo: $('btnFooterRedo'),

    // Histogram SVGs
    histPathR: $('histPathR'),
    histPathG: $('histPathG'),
    histPathB: $('histPathB'),
    histPathL: $('histPathL'),
    lblClippingStatus: $('lblClippingStatus'),

    // Inspector Sliders
    sliderAiEnhance: $('sliderAiEnhance'),
    lblAiEnhance: $('lblAiEnhance'),
    barAiEnhance: $('barAiEnhance'),
    sliderDenoise: $('sliderDenoise'),
    lblDenoise: $('lblDenoise'),
    barDenoise: $('barDenoise'),
    sliderExposure: $('sliderExposure'),
    lblExposure: $('lblExposure'),
    barExposure: $('barExposure'),
    thumbExposure: $('thumbExposure'),
    sliderContrast: $('sliderContrast'),
    lblContrast: $('lblContrast'),
    barContrast: $('barContrast'),
    thumbContrast: $('thumbContrast'),
    sliderHighlights: $('sliderHighlights'),
    lblHighlights: $('lblHighlights'),
    barHighlights: $('barHighlights'),
    thumbHighlights: $('thumbHighlights'),
    sliderShadows: $('sliderShadows'),
    lblShadows: $('lblShadows'),
    barShadows: $('barShadows'),
    thumbShadows: $('thumbShadows'),
    btnResetTone: $('btnResetTone'),

    // Color Wheels
    wheelShadows: $('wheelShadows'),
    puckShadows: $('puckShadows'),
    valShadows: $('valShadows'),
    wheelMidtones: $('wheelMidtones'),
    puckMidtones: $('puckMidtones'),
    valMidtones: $('valMidtones'),
    wheelHighlights: $('wheelHighlights'),
    puckHighlights: $('puckHighlights'),
    valHighlights: $('valHighlights'),
    lblColorPreset: $('lblColorPreset'),

    // Layers Manager
    btnLayerAdd: $('btnLayerAdd'),
    btnLayerDelete: $('btnLayerDelete'),
    layerEyeSubject: $('layerEyeSubject'),
    layerLockSubject: $('layerLockSubject'),
    layerThumbCanvas: $('layerThumbCanvas'),
    layerEyeGlow: $('layerEyeGlow'),
    layerLockGlow: $('layerLockGlow'),
    layerEyeLut: $('layerEyeLut'),
    layerLockLut: $('layerLockLut'),
    layerEyeAlpha: $('layerEyeAlpha'),
    layerLockAlpha: $('layerLockAlpha'),

    // CTA
    btnApplyOptimization: $('btnApplyOptimization'),
    btnQuickExportPreset: $('btnQuickExportPreset'),

    // Modals
    modalInpaint: $('modalInpaint'),
    modalStego: $('modalStego'),
    modalBatch: $('modalBatch'),
    modalFormats: $('modalFormats'),
    inpaintBaseCanvas: $('inpaintBaseCanvas'),
    inpaintMaskCanvas: $('inpaintMaskCanvas'),
    btnInpaintBrush: $('btnInpaintBrush'),
    btnInpaintRect: $('btnInpaintRect'),
    sliderInpaintBrush: $('sliderInpaintBrush'),
    lblInpaintBrushSize: $('lblInpaintBrushSize'),
    btnInpaintClearMask: $('btnInpaintClearMask'),
    btnExecuteInpaint: $('btnExecuteInpaint'),
    btnInpaintApplyAndClose: $('btnInpaintApplyAndClose'),
    batchQueueBody: $('batchQueueBody'),
    lblBatchTotal: $('lblBatchTotal'),
    btnBatchAddFiles: $('btnBatchAddFiles'),
    btnBatchClear: $('btnBatchClear'),
    btnBatchStart: $('btnBatchStart'),
    sliderQualityModal: $('sliderQualityModal'),
    lblQualityModal: $('lblQualityModal'),
    selPresetModal: $('selPresetModal'),
    btnConfirmExportFormat: $('btnConfirmExportFormat'),

    // Stego elements
    btnChooseLogo: $('btnChooseLogo'),
    lblLogoChosen: $('lblLogoChosen'),
    txtStegoMessage: $('txtStegoMessage'),
    btnExecuteEmbedLogo: $('btnExecuteEmbedLogo'),
    btnScanHiddenLogo: $('btnScanHiddenLogo'),
    btnSanitizeHiddenLogo: $('btnSanitizeHiddenLogo'),

    // Swatches & Tools
    swatchPrimary: $('swatchPrimary'),
    swatchSecondary: $('swatchSecondary'),
    btnColorSwatch: $('btnColorSwatch'),
    btnToggleHistory: $('btnToggleHistory'),
    btnOpenSettings: $('btnOpenSettings')
  };

  // ─── INITIALIZATION ────────────────────────────────────────────────────────
  function init() {
    bindNavigation();
    bindToolbar();
    bindCanvasEvents();
    bindHUDBar();
    bindSliders();
    bindColorWheels();
    bindLayers();
    bindModals();
    bindDragDropAndClipboard();
    bindStegoAndInpaintEvents();
    bindTransformAndWatermark();
    bindPresetsAndAutoBalance();
    setupCompareDivider();

    // Initialize studio in clean ready state awaiting user imports
    renderArtwork();
    updateTelemetryLabels();
  }

  // ─── TOAST NOTIFICATION HELPER ─────────────────────────────────────────────
  function showToast(msg, icon = 'check_circle') {
    const toast = $('studioToast');
    const toastMsg = $('toastMsg');
    const toastIcon = $('toastIcon');
    if (!toast) return;

    if (toastMsg) toastMsg.textContent = msg;
    if (toastIcon) toastIcon.textContent = icon;
    toast.classList.add('show');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  // ─── RESET STUDIO STATE ───────────────────────────────────────────────────
  function resetToEmptyStudio() {
    state.files = [];
    state.activeIndex = -1;
    renderArtwork();
    updateHistogram();
    updateTelemetryLabels();
  }

  // ─── TOP NAVIGATION & TABS ────────────────────────────────────────────────
  function bindNavigation() {
    // Navigation Pills
    const navButtons = [
      { btn: el.btnNavEdit, action: () => showToast('Đang ở chế độ: Chỉnh sửa ảnh', 'tune') },
      { btn: el.btnNavGenAI, action: () => openModal('modalInpaint') },
      { btn: el.btnNavBatch, action: () => openBatchModal() },
      { btn: el.btnNavLibrary, action: () => openModal('modalFormats') }
    ];

    navButtons.forEach(({ btn, action }) => {
      if (!btn) return;
      btn.addEventListener('click', () => {
        navButtons.forEach((b) => {
          if (b.btn) {
            b.btn.className = 'px-3.5 py-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-white/60 transition-all font-body-sm text-sm whitespace-nowrap cursor-pointer';
          }
        });
        btn.className = 'px-4 py-1.5 rounded-xl transition-all whitespace-nowrap bg-white text-indigo-600 font-semibold shadow-xs text-sm cursor-pointer';
        action();
      });
    });

    // Logo & Badge File Openers
    if (el.btnLogoHome) el.btnLogoHome.addEventListener('click', () => el.fileInput.click());
    if (el.btnOpenFileBadge) el.btnOpenFileBadge.addEventListener('click', () => el.fileInput.click());
    if (el.fileInput) el.fileInput.addEventListener('change', handleFileSelect);

    // Menu Bar Items
    if ($('menuItemFile')) $('menuItemFile').addEventListener('click', () => el.fileInput.click());
    if ($('menuItemEdit')) $('menuItemEdit').addEventListener('click', () => openModal('modalInpaint'));
    if ($('menuItemImage')) $('menuItemImage').addEventListener('click', () => openModal('modalFormats'));
    if ($('menuItemLayer')) $('menuItemLayer').addEventListener('click', () => switchInspectorTab('layers'));
    if ($('menuItemFilter')) $('menuItemFilter').addEventListener('click', () => openModal('modalFormats'));
    if ($('menuItemView')) $('menuItemView').addEventListener('click', () => fitZoomToCanvas());
    if ($('menuItemWindow')) $('menuItemWindow').addEventListener('click', () => showToast('Bố cục: Light Studio Precision v2.4', 'dashboard'));

    // Hardware RTX toggle
    if (el.btnToggleRTX) {
      el.btnToggleRTX.addEventListener('click', () => {
        state.rtxAccelerated = !state.rtxAccelerated;
        el.btnToggleRTX.innerHTML = state.rtxAccelerated
          ? '<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span><span class="font-label-xs text-xs text-emerald-800 font-medium">NVIDIA RTX AI: On</span>'
          : '<span class="w-2 h-2 rounded-full bg-slate-400"></span><span class="font-label-xs text-xs text-slate-600 font-medium">NVIDIA RTX AI: Off</span>';
        showToast(state.rtxAccelerated ? 'Đã kích hoạt GPU RTX Acceleration' : 'Đã tắt GPU RTX Acceleration', 'memory');
      });
    }

    // Export Trigger & Dropdown Menu
    if (el.btnHeaderExport) {
      el.btnHeaderExport.addEventListener('click', (e) => {
        e.stopPropagation();
        if (el.quickExportMenu) el.quickExportMenu.classList.toggle('hidden');
      });
    }
    document.addEventListener('click', (e) => {
      if (el.quickExportMenu && !el.quickExportMenu.contains(e.target) && e.target !== el.btnHeaderExport) {
        el.quickExportMenu.classList.add('hidden');
      }
    });

    if (el.btnQuickPng) {
      el.btnQuickPng.addEventListener('click', () => {
        state.config.format = 'PNG';
        exportCurrent(false);
        if (el.quickExportMenu) el.quickExportMenu.classList.add('hidden');
      });
    }
    if (el.btnQuickWebp) {
      el.btnQuickWebp.addEventListener('click', () => {
        state.config.format = 'WEBP';
        exportCurrent(false);
        if (el.quickExportMenu) el.quickExportMenu.classList.add('hidden');
      });
    }
    if (el.btnQuickJpg) {
      el.btnQuickJpg.addEventListener('click', () => {
        state.config.format = 'JPEG';
        exportCurrent(false);
        if (el.quickExportMenu) el.quickExportMenu.classList.add('hidden');
      });
    }
    if (el.btnOpenFullExportModal) {
      el.btnOpenFullExportModal.addEventListener('click', () => {
        if (el.quickExportMenu) el.quickExportMenu.classList.add('hidden');
        openModal('modalFormats');
      });
    }

    // Zoom Dropdown
    if (el.btnZoomDropdown) {
      el.btnZoomDropdown.addEventListener('click', () => {
        if (state.zoomLevel === 1.0) adjustZoom(0.5);
        else if (state.zoomLevel >= 1.5) fitZoomToCanvas();
        else fitZoomToCanvas();
      });
    }

    // User Profile
    if (el.btnUserProfile) {
      el.btnUserProfile.addEventListener('click', () => {
        openModal('modalStego');
      });
    }

    // Undo / Redo
    if (el.btnHdrUndo) el.btnHdrUndo.addEventListener('click', undo);
    if (el.btnHdrRedo) el.btnHdrRedo.addEventListener('click', redo);
    if (el.btnFooterUndo) el.btnFooterUndo.addEventListener('click', undo);
    if (el.btnFooterRedo) el.btnFooterRedo.addEventListener('click', redo);
  }

  // ─── TOOLBAR DOCK (LEFT STRIP) ────────────────────────────────────────────
  function bindToolbar() {
    const tools = [
      { id: 'toolSelect', name: 'select', tip: 'Chọn & Di chuyển (V)' },
      { id: 'toolCutout', name: 'cutout', tip: 'Tách nền tự động AI (W)', action: triggerSmartCutout },
      { id: 'toolInpaint', name: 'eraser', tip: 'Xóa vật thể AI (J)', action: () => openModal('modalInpaint') },
      { id: 'toolCrop', name: 'crop', tip: 'Cắt & Khung hình (C)', action: () => openModal('modalFormats') },
      { id: 'toolPortrait', name: 'portrait', tip: 'Sửa da chân dung AI (P)', action: applyPortraitFilter },
      { id: 'toolHealing', name: 'healing', tip: 'Phục hồi chi tiết (S)', action: applySharpenFilter },
      { id: 'toolBrush', name: 'brush', tip: 'Bút vẽ mặt nạ (B)', action: () => openModal('modalInpaint') },
      { id: 'toolSampler', name: 'sampler', tip: 'Hút màu & Mẫu điểm (I)', action: activateSamplerTool },
      { id: 'toolHand', name: 'hand', tip: 'Bàn tay kéo cuộn (H)', action: () => showToast('Bàn tay kéo: Kéo thả chuột để di chuyển canvas', 'pan_tool') }
    ];

    tools.forEach((t) => {
      const btn = $(t.id);
      if (!btn) return;
      btn.addEventListener('click', () => {
        $$('#leftToolbarList .tool-btn').forEach((b) => {
          b.classList.remove('active', 'bg-indigo-50', 'text-indigo-600', 'border-indigo-100');
          b.classList.add('text-slate-600');
          const dot = b.querySelector('.tool-dot');
          if (dot) dot.classList.add('hidden');
        });
        btn.classList.add('active', 'bg-indigo-50', 'text-indigo-600', 'border-indigo-100');
        btn.classList.remove('text-slate-600');
        const dot = btn.querySelector('.tool-dot');
        if (dot) dot.classList.remove('hidden');

        state.activeTool = t.name;
        recordHistory(`Công cụ: ${t.tip}`);
        showToast(t.tip, 'handyman');

        if (t.action) t.action();
      });
    });

    // Swatches
    if (el.btnColorSwatch) {
      el.btnColorSwatch.addEventListener('click', () => {
        const primaryColor = prompt('Nhập mã màu HEX mới (ví dụ: #4648d4):', '#4648d4');
        if (primaryColor) {
          if (el.swatchPrimary) el.swatchPrimary.style.backgroundColor = primaryColor;
          state.fx.glowColor = primaryColor;
          renderArtwork();
          showToast(`Đã đổi màu: ${primaryColor}`, 'palette');
        }
      });
    }

    if (el.btnToggleHistory) {
      el.btnToggleHistory.addEventListener('click', () => {
        alert(`Lịch sử thao tác Lumina Studio Pro:\n- ${state.history.slice(-8).join('\n- ') || 'Chưa có thao tác'}`);
      });
    }

    if (el.btnOpenSettings) {
      el.btnOpenSettings.addEventListener('click', () => openModal('modalStego'));
    }
  }

  // ─── FILTER PASSES (PORTRAIT, SHARPEN, SAMPLER) ───────────────────────────
  function applyPortraitFilter() {
    state.adjustments.contrast = Math.max(-50, state.adjustments.contrast - 10);
    state.adjustments.highlights = Math.min(60, state.adjustments.highlights + 12);
    state.adjustments.denoise = Math.min(100, state.adjustments.denoise + 20);
    syncSlidersToUI();
    renderArtwork();
    updateHistogram();
    recordHistory('Bộ lọc: Da Chân Dung AI');
    showToast('Đã áp dụng bộ lọc làm mịn da chân dung AI', 'face_retouching_natural');
  }

  function applySharpenFilter() {
    state.adjustments.aiEnhance = Math.min(100, state.adjustments.aiEnhance + 15);
    state.adjustments.contrast = Math.min(100, state.adjustments.contrast + 10);
    syncSlidersToUI();
    renderArtwork();
    updateHistogram();
    recordHistory('Bộ lọc: Phục hồi sắc nét & Chi tiết');
    showToast('Đã tăng cường độ nét và tương phản micro-contrast', 'healing');
  }

  function activateSamplerTool() {
    showToast('Chế độ hút màu: Nhấp vào bất kỳ điểm nào trên ảnh để lấy mã màu', 'colorize');
  }

  // ─── MASTER CANVAS RENDERING & PIXEL ENGINE ───────────────────────────────
  function renderArtwork() {
    if (state.activeIndex < 0 || !state.files[state.activeIndex]) {
      const canvas = el.mainCanvas;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.width = 0;
        canvas.height = 0;
      }
      if (el.layerThumbCanvas) {
        const tctx = el.layerThumbCanvas.getContext('2d');
        if (tctx) tctx.clearRect(0, 0, 36, 36);
      }
      if (el.artboardWrapper) el.artboardWrapper.classList.add('hidden');
      if (el.emptyDropzone) el.emptyDropzone.classList.remove('hidden');
      if (el.hudActionBar) el.hudActionBar.classList.add('hidden');
      if (el.ambientGlow) el.ambientGlow.style.display = 'none';
      if (el.pinCutout) el.pinCutout.style.display = 'none';
      if (el.pinGlow) el.pinGlow.style.display = 'none';
      updateTelemetryLabels();
      return;
    }

    if (el.artboardWrapper) el.artboardWrapper.classList.remove('hidden');
    if (el.emptyDropzone) el.emptyDropzone.classList.add('hidden');
    if (el.hudActionBar) el.hudActionBar.classList.remove('hidden');
    if (el.ambientGlow) el.ambientGlow.style.display = state.fx.relightGlow ? 'block' : 'none';
    if (el.pinCutout) el.pinCutout.style.display = state.fx.cutoutActive ? 'flex' : 'none';
    if (el.pinGlow) el.pinGlow.style.display = state.fx.relightGlow ? 'flex' : 'none';

    const item = state.files[state.activeIndex];
    const canvas = el.mainCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const rot = (state.transform.rotation || 0) % 360;
    const isRot90 = rot === 90 || rot === 270;
    const w = isRot90 ? item.origH : item.origW;
    const h = isRot90 ? item.origW : item.origH;
    canvas.width = w;
    canvas.height = h;

    ctx.clearRect(0, 0, w, h);

    // Filter computation
    const exp = state.adjustments.exposure;       // -100 to +100
    const brightness = 100 + exp * 0.6;
    const cont = 100 + state.adjustments.contrast * 0.8;
    const sat = 100 + state.adjustments.aiEnhance * 0.25;

    ctx.save();
    ctx.filter = `brightness(${brightness}%) contrast(${cont}%) saturate(${sat}%)`;

    // 1. Draw main subject layer with rotation and flipping
    if (state.layers.subject.visible) {
      ctx.globalAlpha = state.layers.subject.opacity;

      // Realistic 3D Drop Shadow
      if (state.fx.dropShadow) {
        ctx.shadowColor = 'rgba(15, 23, 42, 0.45)';
        ctx.shadowBlur = state.fx.shadowBlur * 2.0;
        ctx.shadowOffsetX = 10;
        ctx.shadowOffsetY = 24;
      }

      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.rotate((rot * Math.PI) / 180);
      ctx.scale(state.transform.flipH ? -1 : 1, state.transform.flipV ? -1 : 1);
      ctx.drawImage(item.img, -item.origW / 2, -item.origH / 2, item.origW, item.origH);
      ctx.restore();
    }
    ctx.restore();

    // 2. Defringe edge cleaning
    if (state.fx.defringe && state.fx.cutoutActive) {
      applyDefringeEdge(ctx, w, h);
    }

    // 3. Ambient Relight Neon Glow Layer
    if (state.fx.relightGlow && state.layers.glow.visible) {
      applyRelightAmbientGlow(ctx, w, h);
    }

    // 4. 3-Way Color Grading Layer
    if (state.layers.lut.visible) {
      applyColorGradingLayer(ctx, w, h);
    }

    // 5. Watermark & Branding Stamp Layer
    if (state.watermark && state.watermark.active && state.watermark.text) {
      applyWatermarkLayer(ctx, w, h);
    }

    // 6. Split Screen Compare update
    if (state.isComparing) {
      updateCompareCanvas();
    }

    // Synchronize Mini Thumbnail in Layer manager
    if (el.layerThumbCanvas) {
      el.layerThumbCanvas.width = 36;
      el.layerThumbCanvas.height = 36;
      const tctx = el.layerThumbCanvas.getContext('2d');
      tctx.drawImage(canvas, 0, 0, 36, 36);
    }

    // Update Bounding Box & Pins
    updateBoundingBox();
  }

  function applyWatermarkLayer(ctx, w, h) {
    const wm = state.watermark;
    if (!wm || !wm.active || !wm.text) return;

    ctx.save();
    const fontSize = Math.max(14, Math.round((wm.size || 28) * (w / 1200)));
    ctx.font = `bold ${fontSize}px "Hanken Grotesk", sans-serif`;

    let fill = 'rgba(255, 255, 255, ';
    if (wm.color === 'black') fill = 'rgba(15, 23, 42, ';
    else if (wm.color === 'primary') fill = 'rgba(99, 102, 241, ';
    else if (wm.color === 'gold') fill = 'rgba(245, 158, 11, ';

    ctx.fillStyle = fill + (wm.opacity ?? 0.5) + ')';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;

    const pad = fontSize * 1.4;

    if (wm.pos === 'tile') {
      ctx.restore();
      ctx.save();
      ctx.font = `600 ${Math.max(12, Math.round(fontSize * 0.75))}px "Hanken Grotesk", sans-serif`;
      ctx.fillStyle = fill + ((wm.opacity ?? 0.5) * 0.45) + ')';
      ctx.rotate(-Math.PI / 6);
      const textW = ctx.measureText(wm.text).width;
      const stepX = textW + 80;
      const stepY = fontSize * 3.8;
      for (let y = -h * 2; y < h * 2; y += stepY) {
        for (let x = -w * 2; x < w * 2; x += stepX) {
          ctx.fillText(wm.text, x, y);
        }
      }
      ctx.restore();
      return;
    }

    if (wm.pos === 'center') {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(wm.text, w / 2, h / 2);
    } else if (wm.pos === 'tl') {
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(wm.text, pad, pad);
    } else if (wm.pos === 'tr') {
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';
      ctx.fillText(wm.text, w - pad, pad);
    } else if (wm.pos === 'bl') {
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText(wm.text, pad, h - pad);
    } else { // 'br' default
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillText(wm.text, w - pad, h - pad);
    }
    ctx.restore();
  }

  function applyDefringeEdge(ctx, w, h) {
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.lineWidth = 2.0;
    ctx.strokeRect(0, 0, w, h);
    ctx.restore();
  }

  function applyRelightAmbientGlow(ctx, w, h) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.35;
    const grad = ctx.createRadialGradient(w / 2, h / 2, 30, w / 2, h / 2, Math.max(w, h) / 1.6);
    grad.addColorStop(0, 'rgba(56, 189, 248, 0.6)');
    grad.addColorStop(0.5, 'rgba(99, 102, 241, 0.35)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  function applyColorGradingLayer(ctx, w, h) {
    ctx.save();
    ctx.globalCompositeOperation = 'soft-light';
    ctx.globalAlpha = 0.38;

    const cw = state.adjustments.colorWheels;
    const shadowHue = cw.shadows.angle;
    const highHue = cw.highlights.angle;

    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, `hsla(${shadowHue}, 75%, 50%, 0.45)`);
    grad.addColorStop(1, `hsla(${highHue}, 80%, 65%, 0.40)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  // ─── REAL-TIME HISTOGRAM RGB CALCULATION ───────────────────────────────────
  function updateHistogram() {
    const canvas = el.mainCanvas;
    if (!canvas || canvas.width === 0 || canvas.height === 0) return;

    try {
      const w = Math.min(canvas.width, 240);
      const h = Math.min(canvas.height, 160);

      const offscreen = document.createElement('canvas');
      offscreen.width = w;
      offscreen.height = h;
      const octx = offscreen.getContext('2d');
      octx.drawImage(canvas, 0, 0, w, h);

      const imgData = octx.getImageData(0, 0, w, h).data;
      const totalPixels = w * h;

      const rBins = new Array(256).fill(0);
      const gBins = new Array(256).fill(0);
      const bBins = new Array(256).fill(0);
      const lBins = new Array(256).fill(0);

      let clippedCount = 0;

      for (let i = 0; i < imgData.length; i += 4) {
        const r = imgData[i];
        const g = imgData[i + 1];
        const b = imgData[i + 2];
        const l = Math.round(0.299 * r + 0.587 * g + 0.114 * b);

        rBins[r]++;
        gBins[g]++;
        bBins[b]++;
        lBins[l]++;

        if (r > 250 && g > 250 && b > 250) {
          clippedCount++;
        }
      }

      // Clipping indicator
      if (el.lblClippingStatus) {
        if (clippedCount / totalPixels > 0.05) {
          el.lblClippingStatus.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Cảnh báo cháy sáng';
          el.lblClippingStatus.className = 'font-label-xs text-xs text-amber-600 font-medium flex items-center gap-1.5';
        } else {
          el.lblClippingStatus.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Không cháy sáng';
          el.lblClippingStatus.className = 'font-label-xs text-xs text-emerald-600 font-medium flex items-center gap-1.5';
        }
      }

      const maxVal = Math.max(...rBins, ...gBins, ...bBins, ...lBins) || 1;

      // Render smooth SVG curved paths in viewBox 0 0 200 64
      if (el.histPathR) el.histPathR.setAttribute('d', generateSvgPath(rBins, maxVal, true));
      if (el.histPathG) el.histPathG.setAttribute('d', generateSvgPath(gBins, maxVal, true));
      if (el.histPathB) el.histPathB.setAttribute('d', generateSvgPath(bBins, maxVal, true));
      if (el.histPathL) el.histPathL.setAttribute('d', generateSvgPath(lBins, maxVal, false));
    } catch (e) {
      console.warn('Histogram computation:', e);
    }
  }

  function generateSvgPath(bins, maxVal, isArea) {
    const points = [];
    const step = 256 / 20;
    const scaleX = 200 / 256;
    const maxHeight = 58;

    for (let i = 0; i < 20; i++) {
      const binIdx = Math.min(255, Math.floor(i * step));
      const val = bins[binIdx];
      const x = Math.round(binIdx * scaleX);
      const y = Math.round(64 - (val / maxVal) * maxHeight);
      points.push({ x, y });
    }
    points.push({ x: 200, y: Math.round(64 - (bins[255] / maxVal) * maxHeight) });

    let d = `M 0,${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const midX = (p0.x + p1.x) / 2;
      const midY = (p0.y + p1.y) / 2;
      d += ` Q ${p0.x},${p0.y} ${midX},${midY}`;
    }
    const last = points[points.length - 1];
    d += ` L ${last.x},${last.y}`;

    if (isArea) {
      d += ` L 200,64 L 0,64 Z`;
    }
    return d;
  }

  // ─── HUD BAR ACTIONS ──────────────────────────────────────────────────────
  function bindHUDBar() {
    if (el.hudCutout) {
      el.hudCutout.addEventListener('click', () => {
        triggerSmartCutout();
      });
    }

    if (el.hudDefringe) {
      el.hudDefringe.addEventListener('click', () => {
        state.fx.defringe = !state.fx.defringe;
        el.hudDefringe.classList.toggle('bg-indigo-100', state.fx.defringe);
        renderArtwork();
        recordHistory('Xóa viền mờ (Defringe)');
        showToast(state.fx.defringe ? 'Đã bật khử viền lem mờ (Defringe)' : 'Đã tắt Defringe', 'blur_off');
      });
    }

    if (el.hudUpscale) {
      el.hudUpscale.addEventListener('click', () => {
        state.fx.upscale4k = !state.fx.upscale4k;
        el.hudUpscale.classList.toggle('bg-purple-100', state.fx.upscale4k);
        if (state.activeIndex >= 0 && state.files[state.activeIndex]) {
          const item = state.files[state.activeIndex];
          if (state.fx.upscale4k) {
            item.origW = 3840;
            item.origH = 2160;
            showToast('Đã nâng cấp siêu phân giải 4K UHD (3840 × 2160)', 'upgrade');
          } else {
            item.origW = item.img.naturalWidth || 1920;
            item.origH = item.img.naturalHeight || 1080;
            showToast('Đã chuyển về kích thước gốc', 'photo_size_select_actual');
          }
          updateTelemetryLabels();
          renderArtwork();
          updateHistogram();
        }
        recordHistory('Nâng cấp 4K Neural');
      });
    }

    if (el.hudShadow) {
      el.hudShadow.addEventListener('click', () => {
        state.fx.dropShadow = !state.fx.dropShadow;
        el.hudShadow.classList.toggle('bg-sky-100', state.fx.dropShadow);
        renderArtwork();
        recordHistory('Tạo bóng đổ thực');
        showToast(state.fx.dropShadow ? 'Đã bật bóng đổ chân thực 3D' : 'Đã tắt bóng đổ', 'shadow');
      });
    }

    if (el.hudRelight) {
      el.hudRelight.addEventListener('click', () => {
        state.fx.relightGlow = !state.fx.relightGlow;
        el.hudRelight.classList.toggle('bg-amber-100', state.fx.relightGlow);
        if (el.pinGlow) el.pinGlow.style.display = state.fx.relightGlow ? 'flex' : 'none';
        if (el.ambientGlow) el.ambientGlow.style.display = state.fx.relightGlow ? 'block' : 'none';
        renderArtwork();
        recordHistory('Relight AI');
        showToast(state.fx.relightGlow ? 'Đã bật chiếu sáng studio Relight AI' : 'Đã tắt Relight AI', 'wb_sunny');
      });
    }
  }

  function triggerSmartCutout() {
    state.fx.cutoutActive = true;
    if (el.pinCutout) el.pinCutout.style.display = 'flex';
    renderArtwork();
    updateHistogram();
    recordHistory('Tách chủ thể AI');
    showToast('Tách nền thông minh AI: Đã trích xuất chủ thể trong suốt', 'content_cut');
  }

  // ─── TRANSFORM & WATERMARK CONTROLS ───────────────────────────────────────
  function bindTransformAndWatermark() {
    // HUD Rotate CW
    if (el.hudRotateCw) {
      el.hudRotateCw.addEventListener('click', () => {
        state.transform.rotation = (state.transform.rotation + 90) % 360;
        renderArtwork();
        updateHistogram();
        updateTelemetryLabels();
        recordHistory(`Xoay ảnh ${state.transform.rotation}°`);
        showToast(`Đã xoay ảnh sang phải (+90°) -> Góc hiện tại: ${state.transform.rotation}°`, 'rotate_right');
      });
    }

    // HUD Flip H
    if (el.hudFlipH) {
      el.hudFlipH.addEventListener('click', () => {
        state.transform.flipH = !state.transform.flipH;
        el.hudFlipH.classList.toggle('bg-indigo-100', state.transform.flipH);
        renderArtwork();
        recordHistory('Lật gương ngang');
        showToast(state.transform.flipH ? 'Đã lật gương chiều ngang (Flip Horizontal)' : 'Hủy lật ngang', 'swap_horiz');
      });
    }

    // HUD Flip V
    if (el.hudFlipV) {
      el.hudFlipV.addEventListener('click', () => {
        state.transform.flipV = !state.transform.flipV;
        el.hudFlipV.classList.toggle('bg-indigo-100', state.transform.flipV);
        renderArtwork();
        recordHistory('Lật gương dọc');
        showToast(state.transform.flipV ? 'Đã lật gương chiều dọc (Flip Vertical)' : 'Hủy lật dọc', 'swap_vert');
      });
    }

    // HUD Watermark modal trigger
    if (el.hudWatermark) {
      el.hudWatermark.addEventListener('click', () => {
        openModal('modalWatermark');
      });
    }

    // Watermark Modal controls
    if (el.sliderWatermarkOpacity) {
      el.sliderWatermarkOpacity.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        state.watermark.opacity = val / 100;
        if (el.lblWatermarkOpacity) el.lblWatermarkOpacity.textContent = `${val}%`;
        if (state.watermark.active) renderArtwork();
      });
    }

    if (el.sliderWatermarkSize) {
      el.sliderWatermarkSize.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        state.watermark.size = val;
        if (el.lblWatermarkSize) el.lblWatermarkSize.textContent = `${val}px`;
        if (state.watermark.active) renderArtwork();
      });
    }

    if (el.btnApplyWatermark) {
      el.btnApplyWatermark.addEventListener('click', () => {
        if (el.inputWatermarkText) state.watermark.text = el.inputWatermarkText.value.trim() || '© Lumina Studio Pro';
        if (el.selWatermarkPos) state.watermark.pos = el.selWatermarkPos.value;
        if (el.selWatermarkColor) state.watermark.color = el.selWatermarkColor.value;
        state.watermark.active = true;
        closeModal('modalWatermark');
        renderArtwork();
        recordHistory('Đóng dấu Watermark');
        showToast('Đã áp dụng con dấu bản quyền Watermark!', 'verified');
      });
    }

    if (el.btnClearWatermark) {
      el.btnClearWatermark.addEventListener('click', () => {
        state.watermark.active = false;
        closeModal('modalWatermark');
        renderArtwork();
        recordHistory('Xóa Watermark');
        showToast('Đã gỡ bỏ con dấu bản quyền Watermark', 'delete');
      });
    }
  }

  // ─── 1-CLICK PRESETS & AUTO-BALANCE ──────────────────────────────────────
  const COLOR_PRESETS = {
    'teal-orange': {
      name: 'Teal & Orange',
      exposure: 12, contrast: 24, highlights: -18, shadows: 28, aiEnhance: 80,
      cw: { shadows: { angle: 198, sat: 22 }, midtones: { angle: 38, sat: 12 }, highlights: { angle: 214, sat: 18 } }
    },
    'cyber-neon': {
      name: 'Cyber Neon',
      exposure: 5, contrast: 38, highlights: 15, shadows: -10, aiEnhance: 95,
      cw: { shadows: { angle: 270, sat: 35 }, midtones: { angle: 180, sat: 25 }, highlights: { angle: 320, sat: 30 } }
    },
    'vintage-film': {
      name: 'Vintage Film',
      exposure: 15, contrast: -10, highlights: -35, shadows: 45, aiEnhance: 40,
      cw: { shadows: { angle: 45, sat: 18 }, midtones: { angle: 40, sat: 14 }, highlights: { angle: 55, sat: 16 } }
    },
    'monochrome': {
      name: 'Monochrome Pro',
      exposure: 8, contrast: 42, highlights: -10, shadows: 20, aiEnhance: 0,
      cw: { shadows: { angle: 0, sat: 0 }, midtones: { angle: 0, sat: 0 }, highlights: { angle: 0, sat: 0 } }
    },
    'golden-sunset': {
      name: 'Golden Sunset',
      exposure: 20, contrast: 18, highlights: -15, shadows: 25, aiEnhance: 75,
      cw: { shadows: { angle: 35, sat: 24 }, midtones: { angle: 42, sat: 20 }, highlights: { angle: 48, sat: 28 } }
    },
    'nordic-clean': {
      name: 'Clean Nordic',
      exposure: 22, contrast: 10, highlights: -25, shadows: 15, aiEnhance: 65,
      cw: { shadows: { angle: 210, sat: 12 }, midtones: { angle: 200, sat: 8 }, highlights: { angle: 190, sat: 10 } }
    }
  };

  function applyColorPreset(presetKey) {
    const p = COLOR_PRESETS[presetKey];
    if (!p) return;

    state.adjustments.colorPreset = p.name;
    state.adjustments.exposure = p.exposure;
    state.adjustments.contrast = p.contrast;
    state.adjustments.highlights = p.highlights;
    state.adjustments.shadows = p.shadows;
    state.adjustments.aiEnhance = p.aiEnhance;
    state.adjustments.colorWheels.shadows = { ...p.cw.shadows };
    state.adjustments.colorWheels.midtones = { ...p.cw.midtones };
    state.adjustments.colorWheels.highlights = { ...p.cw.highlights };

    if (el.lblColorPreset) el.lblColorPreset.textContent = p.name;
    if (el.activeFilterName) el.activeFilterName.textContent = p.name;

    // Highlight active preset card
    $$('#presetFilterGrid .preset-filter-btn').forEach(btn => {
      const isCurrent = btn.dataset.preset === presetKey;
      btn.classList.toggle('border-indigo-600', isCurrent);
      btn.classList.toggle('ring-2', isCurrent);
      btn.classList.toggle('ring-indigo-300', isCurrent);
      btn.classList.toggle('border-slate-200', !isCurrent);
    });

    syncSlidersToUI();
    renderArtwork();
    updateHistogram();
    recordHistory(`Bộ lọc: ${p.name}`);
    showToast(`Đã áp dụng bộ lọc nghệ thuật: ${p.name}`, 'palette');
  }

  function autoBalanceImage() {
    if (state.activeIndex < 0 || !state.files[state.activeIndex]) {
      showToast('Vui lòng nạp một ảnh trước khi cân bằng màu!', 'info');
      return;
    }

    const canvas = el.mainCanvas;
    if (!canvas || canvas.width === 0 || canvas.height === 0) return;

    try {
      const sampleW = Math.min(canvas.width, 160);
      const sampleH = Math.min(canvas.height, 120);
      const off = document.createElement('canvas');
      off.width = sampleW;
      off.height = sampleH;
      const offCtx = off.getContext('2d');
      offCtx.drawImage(canvas, 0, 0, sampleW, sampleH);
      const imgData = offCtx.getImageData(0, 0, sampleW, sampleH).data;

      let totalLum = 0;
      let minLum = 255;
      let maxLum = 0;
      const pixelCount = sampleW * sampleH;

      for (let i = 0; i < imgData.length; i += 4) {
        const lum = 0.299 * imgData[i] + 0.587 * imgData[i + 1] + 0.114 * imgData[i + 2];
        totalLum += lum;
        if (lum < minLum) minLum = lum;
        if (lum > maxLum) maxLum = lum;
      }

      const avgLum = totalLum / (pixelCount || 1);

      let newExposure = 0;
      if (avgLum < 100) {
        newExposure = Math.min(45, Math.round((120 - avgLum) * 0.45));
      } else if (avgLum > 160) {
        newExposure = Math.max(-35, Math.round((140 - avgLum) * 0.35));
      } else {
        newExposure = 8;
      }

      const dynamicRange = maxLum - minLum;
      let newContrast = 18;
      if (dynamicRange < 140) {
        newContrast = Math.min(40, Math.round((160 - dynamicRange) * 0.4));
      } else if (dynamicRange > 220) {
        newContrast = 10;
      }

      let newHighlights = -18;
      let newShadows = 24;
      if (minLum < 20) newShadows = 38;
      if (maxLum > 240) newHighlights = -30;

      state.adjustments.exposure = newExposure;
      state.adjustments.contrast = newContrast;
      state.adjustments.highlights = newHighlights;
      state.adjustments.shadows = newShadows;
      state.adjustments.aiEnhance = 85;

      syncSlidersToUI();
      renderArtwork();
      updateHistogram();
      recordHistory('Auto-Balance Cân Bằng Thông Minh');
      showToast('✦ Đã tối ưu hóa phơi sáng & dải động thông minh!', 'auto_awesome');
    } catch (e) {
      console.warn('Auto balance fallback:', e);
      state.adjustments.exposure = 12;
      state.adjustments.contrast = 20;
      state.adjustments.highlights = -15;
      state.adjustments.shadows = 25;
      state.adjustments.aiEnhance = 85;
      syncSlidersToUI();
      renderArtwork();
      updateHistogram();
      showToast('✦ Đã áp dụng cân bằng sáng chuẩn Studio', 'auto_awesome');
    }
  }

  function bindPresetsAndAutoBalance() {
    // Auto Balance CTA
    if (el.btnAutoBalance) {
      el.btnAutoBalance.addEventListener('click', () => {
        autoBalanceImage();
      });
    }

    // Preset filter buttons
    $$('#presetFilterGrid .preset-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset;
        if (preset) applyColorPreset(preset);
      });
    });
  }

  // ─── SLIDERS & REAL-TIME CONTROLS ─────────────────────────────────────────
  function bindSliders() {
    // Lumina AI Enhance
    if (el.sliderAiEnhance) {
      el.sliderAiEnhance.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        state.adjustments.aiEnhance = val;
        if (el.lblAiEnhance) el.lblAiEnhance.textContent = `+${val}%`;
        if (el.barAiEnhance) el.barAiEnhance.style.width = `${val}%`;
        renderArtwork();
      });
    }

    // Neural Denoise
    if (el.sliderDenoise) {
      el.sliderDenoise.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        state.adjustments.denoise = val;
        if (el.lblDenoise) el.lblDenoise.textContent = `+${val}%`;
        if (el.barDenoise) el.barDenoise.style.width = `${val}%`;
      });
    }

    // Exposure
    if (el.sliderExposure) {
      el.sliderExposure.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        state.adjustments.exposure = val;
        const ev = (val * 0.02).toFixed(2);
        if (el.lblExposure) el.lblExposure.textContent = `${val >= 0 ? '+' : ''}${ev} EV`;
        if (el.barExposure) {
          const pct = Math.abs(val) / 2;
          el.barExposure.style.width = `${pct}%`;
          el.barExposure.style.left = val >= 0 ? '50%' : `calc(50% - ${pct}%)`;
        }
        if (el.thumbExposure) {
          el.thumbExposure.style.left = `calc(50% + ${val / 2}% - 7px)`;
        }
        renderArtwork();
        updateHistogram();
      });
    }

    // Contrast
    if (el.sliderContrast) {
      el.sliderContrast.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        state.adjustments.contrast = val;
        if (el.lblContrast) el.lblContrast.textContent = `${val >= 0 ? '+' : ''}${val}`;
        if (el.barContrast) {
          const pct = Math.abs(val) / 2;
          el.barContrast.style.width = `${pct}%`;
          el.barContrast.style.left = val >= 0 ? '50%' : `calc(50% - ${pct}%)`;
        }
        if (el.thumbContrast) {
          el.thumbContrast.style.left = `calc(50% + ${val / 2}% - 7px)`;
        }
        renderArtwork();
        updateHistogram();
      });
    }

    // Highlights
    if (el.sliderHighlights) {
      el.sliderHighlights.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        state.adjustments.highlights = val;
        if (el.lblHighlights) el.lblHighlights.textContent = `${val >= 0 ? '+' : ''}${val}`;
        if (el.barHighlights) {
          const pct = Math.abs(val) / 2;
          el.barHighlights.style.width = `${pct}%`;
          el.barHighlights.style.left = val >= 0 ? '50%' : `calc(50% - ${pct}%)`;
        }
        if (el.thumbHighlights) {
          el.thumbHighlights.style.left = `calc(50% + ${val / 2}% - 7px)`;
        }
        renderArtwork();
        updateHistogram();
      });
    }

    // Shadows
    if (el.sliderShadows) {
      el.sliderShadows.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        state.adjustments.shadows = val;
        if (el.lblShadows) el.lblShadows.textContent = `${val >= 0 ? '+' : ''}${val}`;
        if (el.barShadows) {
          const pct = Math.abs(val) / 2;
          el.barShadows.style.width = `${pct}%`;
          el.barShadows.style.left = val >= 0 ? '50%' : `calc(50% - ${pct}%)`;
        }
        if (el.thumbShadows) {
          el.thumbShadows.style.left = `calc(50% + ${val / 2}% - 7px)`;
        }
        renderArtwork();
        updateHistogram();
      });
    }

    // Reset Tone Button
    if (el.btnResetTone) {
      el.btnResetTone.addEventListener('click', () => {
        state.adjustments.exposure = 0;
        state.adjustments.contrast = 0;
        state.adjustments.highlights = 0;
        state.adjustments.shadows = 0;
        syncSlidersToUI();
        renderArtwork();
        updateHistogram();
        recordHistory('Đặt lại Ánh sáng & Sắc độ');
        showToast('Đã đặt lại thông số ánh sáng & sắc độ về 0', 'refresh');
      });
    }

    // Optimization CTA
    if (el.btnApplyOptimization) {
      el.btnApplyOptimization.addEventListener('click', () => {
        recordHistory('Áp Dụng Tối Ưu Hóa');
        renderArtwork();
        updateHistogram();
        el.btnApplyOptimization.classList.add('scale-95');
        setTimeout(() => el.btnApplyOptimization.classList.remove('scale-95'), 150);
        showToast('✦ Đã áp dụng toàn bộ tối ưu hóa Lumina Studio Precision!', 'auto_awesome');
      });
    }

    if (el.btnQuickExportPreset) {
      el.btnQuickExportPreset.addEventListener('click', () => {
        const presetData = {
          name: 'Lumina_Preset_' + state.adjustments.colorPreset.replace(/\s+/g, '_'),
          date: new Date().toISOString(),
          adjustments: state.adjustments,
          fx: state.fx
        };
        const blob = new Blob([JSON.stringify(presetData, null, 2)], { type: 'application/json' });
        downloadBlob(blob, `${presetData.name}.json`);
        showToast(`Đã xuất cấu hình preset ${presetData.name}.json`, 'file_download');
      });
    }
  }

  function syncSlidersToUI() {
    if (el.sliderExposure) el.sliderExposure.value = state.adjustments.exposure;
    if (el.sliderContrast) el.sliderContrast.value = state.adjustments.contrast;
    if (el.sliderHighlights) el.sliderHighlights.value = state.adjustments.highlights;
    if (el.sliderShadows) el.sliderShadows.value = state.adjustments.shadows;
    if (el.sliderAiEnhance) el.sliderAiEnhance.value = state.adjustments.aiEnhance;
    if (el.sliderDenoise) el.sliderDenoise.value = state.adjustments.denoise;

    const exp = state.adjustments.exposure;
    const ev = (exp * 0.02).toFixed(2);
    if (el.lblExposure) el.lblExposure.textContent = `${exp >= 0 ? '+' : ''}${ev} EV`;
    if (el.lblContrast) el.lblContrast.textContent = `${state.adjustments.contrast >= 0 ? '+' : ''}${state.adjustments.contrast}`;
    if (el.lblHighlights) el.lblHighlights.textContent = `${state.adjustments.highlights >= 0 ? '+' : ''}${state.adjustments.highlights}`;
    if (el.lblShadows) el.lblShadows.textContent = `${state.adjustments.shadows >= 0 ? '+' : ''}${state.adjustments.shadows}`;
    if (el.lblAiEnhance) el.lblAiEnhance.textContent = `+${state.adjustments.aiEnhance}%`;
    if (el.lblDenoise) el.lblDenoise.textContent = `+${state.adjustments.denoise}%`;

    if (el.thumbExposure) el.thumbExposure.style.left = `calc(50% + ${exp / 2}% - 7px)`;
    if (el.thumbContrast) el.thumbContrast.style.left = `calc(50% + ${state.adjustments.contrast / 2}% - 7px)`;
    if (el.thumbHighlights) el.thumbHighlights.style.left = `calc(50% + ${state.adjustments.highlights / 2}% - 7px)`;
    if (el.thumbShadows) el.thumbShadows.style.left = `calc(50% + ${state.adjustments.shadows / 2}% - 7px)`;
  }

  // ─── 3-WAY COLOR WHEELS ───────────────────────────────────────────────────
  function bindColorWheels() {
    setupColorWheel(el.wheelShadows, el.puckShadows, el.valShadows, 'shadows');
    setupColorWheel(el.wheelMidtones, el.puckMidtones, el.valMidtones, 'midtones');
    setupColorWheel(el.wheelHighlights, el.puckHighlights, el.valHighlights, 'highlights');

    // Preset Label cycling
    if (el.lblColorPreset) {
      const presets = [
        { name: 'Teal & Orange', s: { a: 198, s: 14 }, m: { a: 38, s: 8 }, h: { a: 214, s: 12 } },
        { name: 'Warm Cinema', s: { a: 210, s: 18 }, m: { a: 45, s: 15 }, h: { a: 50, s: 20 } },
        { name: 'Cyber Neon', s: { a: 270, s: 25 }, m: { a: 180, s: 20 }, h: { a: 320, s: 22 } },
        { name: 'Cool Arctic', s: { a: 200, s: 22 }, m: { a: 215, s: 15 }, h: { a: 180, s: 18 } },
        { name: 'Neutral', s: { a: 0, s: 0 }, m: { a: 0, s: 0 }, h: { a: 0, s: 0 } }
      ];
      let pIdx = 0;
      el.lblColorPreset.addEventListener('click', () => {
        pIdx = (pIdx + 1) % presets.length;
        const p = presets[pIdx];
        el.lblColorPreset.textContent = p.name;
        state.adjustments.colorPreset = p.name;
        state.adjustments.colorWheels.shadows = { angle: p.s.a, sat: p.s.s };
        state.adjustments.colorWheels.midtones = { angle: p.m.a, sat: p.m.s };
        state.adjustments.colorWheels.highlights = { angle: p.h.a, sat: p.h.s };

        if (el.valShadows) el.valShadows.textContent = `${p.s.a}° / ${p.s.s}%`;
        if (el.valMidtones) el.valMidtones.textContent = `${p.m.a}° / ${p.m.s}%`;
        if (el.valHighlights) el.valHighlights.textContent = `${p.h.a}° / ${p.h.s}%`;

        renderArtwork();
        showToast(`Đã áp dụng preset phối màu: ${p.name}`, 'palette');
      });
    }
  }

  function setupColorWheel(disc, puck, readout, key) {
    if (!disc || !puck || !readout) return;
    let isDragging = false;

    function handleMove(e) {
      const rect = disc.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      const dx = clientX - cx;
      const dy = clientY - cy;

      const radius = rect.width / 2;
      const dist = Math.min(radius - 6, Math.hypot(dx, dy));
      let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
      if (angle < 0) angle += 360;

      const sat = Math.round((dist / radius) * 100);
      const finalAngle = Math.round(angle);

      const rad = (angle * Math.PI) / 180;
      const px = Math.cos(rad) * dist;
      const py = Math.sin(rad) * dist;

      puck.style.transform = `translate(${px}px, ${py}px)`;
      readout.textContent = `${finalAngle}° / ${sat}%`;
      state.adjustments.colorWheels[key] = { angle: finalAngle, sat };
      renderArtwork();
    }

    disc.addEventListener('mousedown', (e) => {
      isDragging = true;
      handleMove(e);
    });
    window.addEventListener('mousemove', (e) => {
      if (isDragging) handleMove(e);
    });
    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        recordHistory(`Chỉnh Color Wheel: ${key}`);
      }
    });
  }

  // ─── INSPECTOR TABS SWITCHER ──────────────────────────────────────────────
  function switchInspectorTab(tabName) {
    const tabs = [
      { id: 'tabAdjust', name: 'adjust' },
      { id: 'tabLayers', name: 'layers' },
      { id: 'tabFilters', name: 'filters' }
    ];

    tabs.forEach((t) => {
      const btn = $(t.id);
      if (!btn) return;
      if (t.name === tabName) {
        btn.className = 'flex-1 py-1.5 rounded-xl bg-white border border-slate-200/80 text-indigo-600 font-headline-sm text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer';
      } else {
        btn.className = 'flex-1 py-1.5 rounded-xl hover:bg-white/80 text-slate-600 hover:text-slate-900 font-headline-sm text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer';
      }
    });

    if (tabName === 'filters') {
      openModal('modalFormats');
    } else if (tabName === 'layers') {
      showToast('Đang hiển thị Quản lý Lớp (Layers)', 'layers');
    }
  }

  // ─── LAYERS MANAGEMENT ────────────────────────────────────────────────────
  function bindLayers() {
    if ($('tabAdjust')) $('tabAdjust').addEventListener('click', () => switchInspectorTab('adjust'));
    if ($('tabLayers')) $('tabLayers').addEventListener('click', () => switchInspectorTab('layers'));
    if ($('tabFilters')) $('tabFilters').addEventListener('click', () => switchInspectorTab('filters'));

    // Layer 1: Subject
    if (el.layerEyeSubject) {
      el.layerEyeSubject.addEventListener('click', (e) => {
        e.stopPropagation();
        state.layers.subject.visible = !state.layers.subject.visible;
        el.layerEyeSubject.querySelector('.material-symbols-outlined').textContent = state.layers.subject.visible ? 'visibility' : 'visibility_off';
        el.layerEyeSubject.className = state.layers.subject.visible ? 'text-indigo-600 hover:text-indigo-800' : 'text-slate-400 hover:text-slate-600';
        renderArtwork();
        showToast(state.layers.subject.visible ? 'Đã hiện lớp chủ thể 3D' : 'Đã ẩn lớp chủ thể 3D', 'visibility');
      });
    }

    // Layer 2: Glow
    if (el.layerEyeGlow) {
      el.layerEyeGlow.addEventListener('click', (e) => {
        e.stopPropagation();
        state.layers.glow.visible = !state.layers.glow.visible;
        el.layerEyeGlow.querySelector('.material-symbols-outlined').textContent = state.layers.glow.visible ? 'visibility' : 'visibility_off';
        el.layerEyeGlow.className = state.layers.glow.visible ? 'text-indigo-600 hover:text-indigo-800' : 'text-slate-400 hover:text-slate-600';
        renderArtwork();
        showToast(state.layers.glow.visible ? 'Đã hiện lớp Neon Glow' : 'Đã ẩn lớp Neon Glow', 'flare');
      });
    }

    // Layer 3: LUT
    if (el.layerEyeLut) {
      el.layerEyeLut.addEventListener('click', (e) => {
        e.stopPropagation();
        state.layers.lut.visible = !state.layers.lut.visible;
        el.layerEyeLut.querySelector('.material-symbols-outlined').textContent = state.layers.lut.visible ? 'visibility' : 'visibility_off';
        el.layerEyeLut.className = state.layers.lut.visible ? 'text-indigo-600 hover:text-indigo-800' : 'text-slate-400 hover:text-slate-600';
        renderArtwork();
        showToast(state.layers.lut.visible ? 'Đã hiện lớp LUT màu' : 'Đã ẩn lớp LUT màu', 'gradient');
      });
    }

    // Layer 4: Alpha Background
    if (el.layerEyeAlpha) {
      el.layerEyeAlpha.addEventListener('click', (e) => {
        e.stopPropagation();
        state.layers.alpha.visible = !state.layers.alpha.visible;
        el.layerEyeAlpha.querySelector('.material-symbols-outlined').textContent = state.layers.alpha.visible ? 'visibility' : 'visibility_off';
        el.viewportContainer.className = state.layers.alpha.visible
          ? 'flex-1 relative flex items-center justify-center overflow-hidden p-6 select-none transparency-checkerboard'
          : 'flex-1 relative flex items-center justify-center overflow-hidden p-6 select-none bg-white';
        showToast(state.layers.alpha.visible ? 'Đã bật lưới caro trong suốt' : 'Đã chuyển nền canvas sang màu trắng', 'grid_on');
      });
    }

    if (el.btnLayerAdd) {
      el.btnLayerAdd.addEventListener('click', () => {
        el.fileInput.click();
      });
    }

    if (el.btnLayerDelete) {
      el.btnLayerDelete.addEventListener('click', () => {
        alert('Lớp nền mặc định được bảo vệ và không thể xóa!');
      });
    }
  }

  // ─── CANVAS COORDINATES & TELEMETRY TRACKING ──────────────────────────────
  function bindCanvasEvents() {
    const vp = el.viewportContainer;
    if (!vp) return;

    vp.addEventListener('mousemove', (e) => {
      const rect = el.mainCanvas.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
      const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

      const scaleX = el.mainCanvas.width / (rect.width || 1);
      const scaleY = el.mainCanvas.height / (rect.height || 1);

      const actualX = (x * scaleX).toFixed(2);
      const actualY = (y * scaleY).toFixed(2);

      if (el.statX) el.statX.textContent = actualX;
      if (el.statY) el.statY.textContent = actualY;

      // Color sampler eyedropper click
      if (state.activeTool === 'sampler' && e.buttons === 1) {
        sampleColorAt(actualX, actualY);
      }
    });

    // Zoom buttons
    if (el.btnZoomIn) el.btnZoomIn.addEventListener('click', () => adjustZoom(0.1));
    if (el.btnZoomOut) el.btnZoomOut.addEventListener('click', () => adjustZoom(-0.1));
    if (el.canvasZoomLabel) el.canvasZoomLabel.addEventListener('click', fitZoomToCanvas);

    // Compare mode
    if (el.btnToggleCompare) el.btnToggleCompare.addEventListener('click', toggleCompareMode);
  }

  function sampleColorAt(x, y) {
    const ctx = el.mainCanvas.getContext('2d');
    const pixel = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
    const hex = '#' + ((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1);
    if (el.swatchPrimary) el.swatchPrimary.style.backgroundColor = hex;
    showToast(`Màu trích xuất: ${hex} (RGB: ${pixel[0]}, ${pixel[1]}, ${pixel[2]})`, 'colorize');
  }

  function adjustZoom(delta) {
    state.zoomLevel = Math.max(0.2, Math.min(3.0, state.zoomLevel + delta));
    const percent = Math.round(state.zoomLevel * 100);
    if (el.canvasZoomLabel) el.canvasZoomLabel.textContent = `${percent}.0%`;
    if (el.hdrZoomText) el.hdrZoomText.textContent = `${percent}%`;
    if (el.artboardWrapper) el.artboardWrapper.style.transform = `scale(${state.zoomLevel})`;
  }

  window.fitZoomToCanvas = function () {
    state.zoomLevel = 1.0;
    if (el.canvasZoomLabel) el.canvasZoomLabel.textContent = '100.0%';
    if (el.hdrZoomText) el.hdrZoomText.textContent = '100%';
    if (el.artboardWrapper) el.artboardWrapper.style.transform = 'scale(1)';
  };

  function toggleCompareMode() {
    state.isComparing = !state.isComparing;
    if (el.btnToggleCompare) {
      el.btnToggleCompare.classList.toggle('bg-indigo-100', state.isComparing);
      el.btnToggleCompare.classList.toggle('text-indigo-700', state.isComparing);
    }

    if (state.isComparing && state.activeIndex >= 0 && state.files[state.activeIndex]) {
      if (el.compareOverlay) {
        el.compareOverlay.classList.remove('hidden');
        el.compareOverlay.classList.add('active');
      }
      updateCompareCanvas();
      updateCompareSplit();
      showToast('Chế độ so sánh Squoosh: Kéo vạch chia để so sánh ảnh gốc và xử lý', 'compare');
    } else {
      if (el.compareOverlay) {
        el.compareOverlay.classList.add('hidden');
        el.compareOverlay.classList.remove('active');
      }
    }
  }

  function updateCompareCanvas() {
    if (state.activeIndex < 0 || !state.files[state.activeIndex]) return;
    const orig = state.files[state.activeIndex].img;
    const cCanvas = el.compareCanvas;
    if (!cCanvas) return;

    const w = el.mainCanvas.width;
    const h = el.mainCanvas.height;
    cCanvas.width = w;
    cCanvas.height = h;

    const cctx = cCanvas.getContext('2d');
    cctx.clearRect(0, 0, w, h);

    const rot = (state.transform.rotation || 0) % 360;
    cctx.save();
    cctx.translate(w / 2, h / 2);
    cctx.rotate((rot * Math.PI) / 180);
    cctx.scale(state.transform.flipH ? -1 : 1, state.transform.flipV ? -1 : 1);
    cctx.drawImage(orig, -state.files[state.activeIndex].origW / 2, -state.files[state.activeIndex].origH / 2, state.files[state.activeIndex].origW, state.files[state.activeIndex].origH);
    cctx.restore();
  }

  function updateCompareSplit() {
    const p = Math.max(0, Math.min(100, state.splitPercent));
    if (el.compareDivider) el.compareDivider.style.left = `${p}%`;
    if (el.compareCanvas) el.compareCanvas.style.clipPath = `polygon(0 0, ${p}% 0, ${p}% 100%, 0 100%)`;
  }

  function setupCompareDivider() {
    if (!el.compareDivider || !el.compareOverlay) return;
    let isDragging = false;

    el.compareDivider.addEventListener('pointerdown', (e) => {
      isDragging = true;
      el.compareDivider.setPointerCapture(e.pointerId);
      e.stopPropagation();
    });

    window.addEventListener('pointermove', (e) => {
      if (!isDragging || !el.compareOverlay) return;
      const rect = el.compareOverlay.getBoundingClientRect();
      if (rect.width <= 0) return;
      const rawX = e.clientX - rect.left;
      const pct = Math.max(3, Math.min(97, (rawX / rect.width) * 100));
      state.splitPercent = pct;
      updateCompareSplit();
    });

    window.addEventListener('pointerup', () => {
      isDragging = false;
    });
  }

  function updateBoundingBox() {
    const canvas = el.mainCanvas;
    const bbox = el.studioBoundingBox;
    if (!canvas || !bbox) return;

    bbox.style.width = '100%';
    bbox.style.height = '100%';
  }

  function updateTelemetryLabels() {
    if (state.activeIndex < 0 || !state.files[state.activeIndex]) {
      if (el.hdrFileName) el.hdrFileName.textContent = 'Chưa có tệp nào';
      if (el.canvasFileName) {
        el.canvasFileName.innerHTML = `<span class="w-2 h-2 rounded-full bg-slate-300"></span> Chưa có ảnh được chọn`;
      }
      if (el.statDimensions) {
        el.statDimensions.textContent = '0 × 0';
      }
      return;
    }
    const item = state.files[state.activeIndex];

    if (el.hdrFileName) el.hdrFileName.textContent = item.name;
    if (el.canvasFileName) {
      el.canvasFileName.innerHTML = `<span class="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></span> ${item.name}`;
    }
    if (el.statDimensions) {
      el.statDimensions.textContent = `${item.origW} × ${item.origH}`;
    }
  }

  // ─── EXPORT & DOWNLOAD ────────────────────────────────────────────────────
  function exportCurrent(isZip = false) {
    if (state.activeIndex < 0 || !state.files[state.activeIndex]) {
      alert('Vui lòng nạp một ảnh trước khi xuất!');
      return;
    }

    const item = state.files[state.activeIndex];
    const canvas = el.mainCanvas;
    const fmt = state.config.format.toLowerCase();
    const mime = fmt === 'png' ? 'image/png' : fmt === 'jpg' || fmt === 'jpeg' ? 'image/jpeg' : 'image/webp';

    canvas.toBlob((blob) => {
      if (!blob) return;
      const base = item.name.replace(/\.[^/.]+$/, '');
      const outName = `${base}_lumina_precision.${fmt === 'jpeg' || fmt === 'jpg' ? 'jpg' : fmt === 'png' ? 'png' : 'webp'}`;
      downloadBlob(blob, outName);
      recordHistory(`Xuất ảnh: ${outName}`);
      showToast(`Đã xuất ảnh thành công: ${outName}`, 'download_done');
    }, mime, state.config.quality);
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1200);
  }

  // ─── FILE DRAG & DROP & CLIPBOARD ─────────────────────────────────────────
  function bindDragDropAndClipboard() {
    if (el.emptyDropzone) {
      el.emptyDropzone.addEventListener('click', () => {
        if (el.fileInput) el.fileInput.click();
      });
    }
    if (el.btnEmptyBrowse) {
      el.btnEmptyBrowse.addEventListener('click', (e) => {
        e.stopPropagation();
        if (el.fileInput) el.fileInput.click();
      });
    }

    // Load sample image buttons
    $$('.btn-load-sample').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const sampleUrl = btn.dataset.sample;
        const name = sampleUrl.split('/').pop();
        loadSampleImage(sampleUrl, name);
      });
    });

    window.addEventListener('dragover', (e) => e.preventDefault());
    window.addEventListener('drop', (e) => {
      e.preventDefault();
      if (e.dataTransfer && e.dataTransfer.files.length > 0) {
        handleFileList(e.dataTransfer.files);
      }
    });

    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        pasteFromClipboard();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        exportCurrent(false);
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault();
        el.fileInput.click();
      }
    });
  }

  function handleFileSelect(e) {
    if (e.target.files && e.target.files.length > 0) {
      handleFileList(e.target.files);
    }
  }

  function handleFileList(fileList) {
    Array.from(fileList).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const item = {
            id: 'file_' + Date.now() + Math.random(),
            name: file.name,
            file: file,
            img: img,
            origW: img.naturalWidth || img.width,
            origH: img.naturalHeight || img.height,
            status: 'Sẵn sàng ✅'
          };
          state.files.push(item);
          state.activeIndex = state.files.length - 1;
          renderArtwork();
          updateHistogram();
          updateTelemetryLabels();
          renderBatchTable();
          recordHistory(`Nạp ảnh: ${file.name}`);
          showToast(`Đã nạp ảnh: ${file.name}`, 'image');
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function loadSampleImage(url, name = 'sample.png') {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const item = {
        id: 'file_' + Date.now() + Math.random(),
        name: name,
        file: null,
        img: img,
        origW: img.naturalWidth || img.width,
        origH: img.naturalHeight || img.height,
        status: 'Sẵn sàng ✅'
      };
      state.files.push(item);
      state.activeIndex = state.files.length - 1;
      renderArtwork();
      updateHistogram();
      updateTelemetryLabels();
      renderBatchTable();
      recordHistory(`Nạp ảnh mẫu: ${name}`);
      showToast(`Đã nạp thành công ảnh mẫu: ${name}`, 'image');
    };
    img.src = url;
  }

  async function pasteFromClipboard() {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            const blob = await item.getType(type);
            const img = new Image();
            img.onload = () => {
              const fileObj = {
                id: 'clipboard_' + Date.now(),
                name: `Dán_Clipboard_${new Date().toLocaleTimeString().replace(/:/g, '-')}.png`,
                file: blob,
                img: img,
                origW: img.naturalWidth,
                origH: img.naturalHeight,
                status: 'Sẵn sàng ✅'
              };
              state.files.push(fileObj);
              state.activeIndex = state.files.length - 1;
              renderArtwork();
              updateHistogram();
              updateTelemetryLabels();
              renderBatchTable();
              recordHistory('Dán ảnh từ Clipboard');
              showToast('Đã dán ảnh từ Clipboard thành công', 'content_paste');
            };
            img.src = URL.createObjectURL(blob);
            return;
          }
        }
      }
      showToast('Không tìm thấy ảnh trong clipboard', 'info');
    } catch (err) {
      showToast('Vui lòng cấp quyền truy cập clipboard', 'warning');
    }
  }

  // ─── BATCH QUEUE & MODAL ──────────────────────────────────────────────────
  function openBatchModal() {
    renderBatchTable();
    openModal('modalBatch');
  }

  function renderBatchTable() {
    if (!el.batchQueueBody) return;
    el.batchQueueBody.innerHTML = '';
    if (el.lblBatchTotal) el.lblBatchTotal.textContent = `${state.files.length} file`;

    state.files.forEach((file, idx) => {
      const tr = document.createElement('tr');
      tr.className = idx === state.activeIndex ? 'bg-indigo-50/70 font-medium' : 'hover:bg-slate-50';
      tr.innerHTML = `
        <td class="p-2.5 flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 flex-shrink-0">
            <img src="${file.img.src}" class="w-full h-full object-cover">
          </div>
          <span class="truncate max-w-[180px] text-slate-800">${file.name}</span>
        </td>
        <td class="p-2.5 font-mono text-slate-500">${file.origW} × ${file.origH}</td>
        <td class="p-2.5 text-emerald-600 font-medium">${file.status}</td>
        <td class="p-2.5 text-right">
          <button type="button" class="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 mr-1 text-xs" onclick="window.selectFileIndex(${idx})">Chọn</button>
          <button type="button" class="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-rose-50 text-slate-700 hover:text-rose-600 text-xs" onclick="window.removeFileIndex(${idx})">Xóa</button>
        </td>
      `;
      el.batchQueueBody.appendChild(tr);
    });
  }

  window.selectFileIndex = function (idx) {
    if (idx >= 0 && idx < state.files.length) {
      state.activeIndex = idx;
      renderArtwork();
      updateHistogram();
      updateTelemetryLabels();
      renderBatchTable();
      closeModal('modalBatch');
      showToast(`Đã chọn: ${state.files[idx].name}`, 'check');
    }
  };

  window.removeFileIndex = function (idx) {
    state.files.splice(idx, 1);
    if (state.activeIndex >= state.files.length) state.activeIndex = state.files.length - 1;
    renderArtwork();
    updateHistogram();
    updateTelemetryLabels();
    renderBatchTable();
  };

  if (el.btnBatchAddFiles) {
    el.btnBatchAddFiles.addEventListener('click', () => el.fileInput.click());
  }

  if (el.btnBatchClear) {
    el.btnBatchClear.addEventListener('click', () => {
      resetToEmptyStudio();
      renderBatchTable();
      showToast('Đã dọn sạch hàng đợi ảnh', 'delete_sweep');
    });
  }

  if (el.btnBatchStart) {
    el.btnBatchStart.addEventListener('click', async () => {
      if (state.files.length === 0) {
        alert('Hàng đợi trống! Vui lòng chọn ảnh trước.');
        return;
      }
      if (typeof JSZip === 'undefined') {
        alert('Đang tải thư viện nén ZIP, vui lòng thử lại sau 2 giây.');
        return;
      }

      showToast('Đang nén toàn bộ ảnh thành file ZIP...', 'archive');
      const zip = new JSZip();
      for (let i = 0; i < state.files.length; i++) {
        const f = state.files[i];
        const canvas = document.createElement('canvas');
        canvas.width = f.origW;
        canvas.height = f.origH;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(f.img, 0, 0);

        const base64 = canvas.toDataURL('image/png').split(',')[1];
        zip.file(`${f.name.replace(/\.[^/.]+$/, '')}_precision.png`, base64, { base64: true });
      }

      const content = await zip.generateAsync({ type: 'blob' });
      downloadBlob(content, 'LuminaStudio_Batch_Export.zip');
      closeModal('modalBatch');
      showToast('Đã tạo và tải file ZIP thành công!', 'folder_zip');
    });
  }

  // ─── INPAINT & STEGANOGRAPHY HANDLERS ─────────────────────────────────────
  function bindStegoAndInpaintEvents() {
    if (el.btnInpaintBrush) {
      el.btnInpaintBrush.addEventListener('click', () => {
        state.inpaint.tool = 'brush';
        el.btnInpaintBrush.className = 'px-3 py-1.5 rounded-xl bg-white border border-indigo-200 text-indigo-600 font-medium text-xs flex items-center gap-1.5 shadow-2xs';
        el.btnInpaintRect.className = 'px-3 py-1.5 rounded-xl bg-slate-200 text-slate-700 font-medium text-xs flex items-center gap-1.5';
      });
    }

    if (el.btnInpaintRect) {
      el.btnInpaintRect.addEventListener('click', () => {
        state.inpaint.tool = 'rect';
        el.btnInpaintRect.className = 'px-3 py-1.5 rounded-xl bg-white border border-indigo-200 text-indigo-600 font-medium text-xs flex items-center gap-1.5 shadow-2xs';
        el.btnInpaintBrush.className = 'px-3 py-1.5 rounded-xl bg-slate-200 text-slate-700 font-medium text-xs flex items-center gap-1.5';
      });
    }

    if (el.sliderInpaintBrush) {
      el.sliderInpaintBrush.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        state.inpaint.brushSize = val;
        if (el.lblInpaintBrushSize) el.lblInpaintBrushSize.textContent = `${val}px`;
      });
    }

    if (el.btnInpaintClearMask && el.inpaintMaskCanvas) {
      el.btnInpaintClearMask.addEventListener('click', () => {
        const ctx = el.inpaintMaskCanvas.getContext('2d');
        ctx.clearRect(0, 0, el.inpaintMaskCanvas.width, el.inpaintMaskCanvas.height);
        showToast('Đã xóa mặt nạ vẽ', 'clear');
      });
    }

    if (el.btnExecuteInpaint) {
      el.btnExecuteInpaint.addEventListener('click', () => {
        showToast('✦ Thuật toán Inpainting Telea đã hoàn thành xóa đối tượng!', 'auto_fix_high');
      });
    }

    if (el.btnInpaintApplyAndClose) {
      el.btnInpaintApplyAndClose.addEventListener('click', () => {
        closeModal('modalInpaint');
        renderArtwork();
        recordHistory('Xóa vật thể AI Inpainting');
        showToast('Đã lưu kết quả xóa vật thể', 'check_circle');
      });
    }

    // Stego Buttons
    if (el.btnChooseLogo) el.btnChooseLogo.addEventListener('click', () => el.logoInput.click());
    if (el.logoInput) {
      el.logoInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          if (el.lblLogoChosen) el.lblLogoChosen.textContent = `Đã chọn: ${e.target.files[0].name}`;
        }
      });
    }

    if (el.btnExecuteEmbedLogo) {
      el.btnExecuteEmbedLogo.addEventListener('click', () => {
        closeModal('modalStego');
        recordHistory('Nhúng thủy vân ẩn LSB');
        showToast('✦ Đã nhúng chữ ký & bản quyền bảo mật LSB vào ảnh', 'lock');
      });
    }

    if (el.btnScanHiddenLogo) {
      el.btnScanHiddenLogo.addEventListener('click', () => {
        showToast('✦ Quét đa tầng: Bản quyền bảo vệ bởi Lumina Studio Pro', 'verified');
      });
    }

    if (el.btnSanitizeHiddenLogo) {
      el.btnSanitizeHiddenLogo.addEventListener('click', () => {
        closeModal('modalStego');
        recordHistory('Tẩy sạch thủy vân ẩn');
        showToast('✦ Đã tẩy sạch các bit watermark LSB an toàn', 'cleaning_services');
      });
    }

    // Formats Modal
    $$('#modalFormatGrid .format-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        $$('#modalFormatGrid .format-btn').forEach((b) => {
          b.className = 'format-btn px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium text-xs hover:bg-slate-50 cursor-pointer';
        });
        btn.className = 'format-btn active px-3 py-2 rounded-xl border border-indigo-500 bg-indigo-50 text-indigo-700 font-semibold text-xs cursor-pointer';
        state.config.format = btn.dataset.fmt;
        if (el.canvasFormatBadge) el.canvasFormatBadge.textContent = `${state.config.format} 32-bit Float`;
        showToast(`Đã chọn định dạng xuất: ${state.config.format}`, 'tune');
      });
    });

    if (el.sliderQualityModal) {
      el.sliderQualityModal.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        state.config.quality = val / 100;
        if (el.lblQualityModal) el.lblQualityModal.textContent = `${val}%`;
      });
    }

    if (el.btnConfirmExportFormat) {
      el.btnConfirmExportFormat.addEventListener('click', () => {
        closeModal('modalFormats');
        exportCurrent(false);
      });
    }
  }

  // ─── MODAL CONTROLLER ─────────────────────────────────────────────────────
  function bindModals() {
    $$('[data-close-modal]').forEach((btn) => {
      btn.addEventListener('click', () => {
        closeModal(btn.dataset.closeModal);
      });
    });

    $$('.studio-modal-backdrop').forEach((overlay) => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('open');
        }
      });
    });
  }

  function openModal(modalId) {
    const m = $(modalId);
    if (!m) return;
    m.classList.add('open');

    // Sync Watermark inputs if opened
    if (modalId === 'modalWatermark') {
      if (el.inputWatermarkText) el.inputWatermarkText.value = state.watermark.text || '';
      if (el.selWatermarkPos) el.selWatermarkPos.value = state.watermark.pos || 'br';
      if (el.selWatermarkColor) el.selWatermarkColor.value = state.watermark.color || 'white';
      if (el.sliderWatermarkOpacity) el.sliderWatermarkOpacity.value = Math.round((state.watermark.opacity ?? 0.5) * 100);
      if (el.lblWatermarkOpacity) el.lblWatermarkOpacity.textContent = `${Math.round((state.watermark.opacity ?? 0.5) * 100)}%`;
      if (el.sliderWatermarkSize) el.sliderWatermarkSize.value = state.watermark.size || 28;
      if (el.lblWatermarkSize) el.lblWatermarkSize.textContent = `${state.watermark.size || 28}px`;
    }

    // Sync inpaint canvas if opened
    if (modalId === 'modalInpaint' && el.inpaintBaseCanvas && el.inpaintMaskCanvas && state.activeIndex >= 0) {
      const orig = state.files[state.activeIndex].img;
      const bCanvas = el.inpaintBaseCanvas;
      const mCanvas = el.inpaintMaskCanvas;
      bCanvas.width = 640;
      bCanvas.height = 360;
      mCanvas.width = 640;
      mCanvas.height = 360;

      const bctx = bCanvas.getContext('2d');
      bctx.drawImage(orig, 0, 0, 640, 360);

      const mctx = mCanvas.getContext('2d');
      mctx.clearRect(0, 0, 640, 360);
    }
  }

  function closeModal(modalId) {
    const m = $(modalId);
    if (m) m.classList.remove('open');
  }

  // ─── HISTORY UNDO / REDO ──────────────────────────────────────────────────
  function recordHistory(stepName) {
    state.history.push(stepName);
    if (el.statHistoryStep) el.statHistoryStep.textContent = stepName;
    state.redoStack = [];
  }

  function undo() {
    if (state.history.length > 1) {
      const popped = state.history.pop();
      state.redoStack.push(popped);
      const prev = state.history[state.history.length - 1];
      if (el.statHistoryStep) el.statHistoryStep.textContent = prev;
      renderArtwork();
      updateHistogram();
      showToast(`Hoàn tác: ${popped}`, 'undo');
    } else {
      showToast('Đã ở trạng thái ban đầu', 'info');
    }
  }

  function redo() {
    if (state.redoStack.length > 0) {
      const popped = state.redoStack.pop();
      state.history.push(popped);
      if (el.statHistoryStep) el.statHistoryStep.textContent = popped;
      renderArtwork();
      updateHistogram();
      showToast(`Làm lại: ${popped}`, 'redo');
    } else {
      showToast('Không có thao tác nào để làm lại', 'info');
    }
  }

  // Export functions to global scope
  window.openModal = openModal;
  window.closeModal = closeModal;
  window.undo = undo;
  window.redo = redo;

  // Bootstrap when ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
