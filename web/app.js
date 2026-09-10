/* ==========================================================================
   OMNIIMAGE STUDIO - WEB CANVA CUTOUT & IMAGE TOOLKIT LOGIC
   Client-Side Canvas Image Processing Engine
   ========================================================================== */

(function () {
  // Elements
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
  const btnTriggerUpload = document.getElementById('btnTriggerUpload');
  const dropPlaceholder = document.getElementById('dropPlaceholder');
  const canvasContainer = document.getElementById('canvasContainer');
  const mainCanvas = document.getElementById('mainCanvas');
  const sliderWrap = document.getElementById('sliderWrap');
  const btnHoldCompare = document.getElementById('btnHoldCompare');

  // Control elements
  const cutoutModeSeg = document.getElementById('cutoutModeSeg');
  const bgModeSeg = document.getElementById('bgModeSeg');
  const colorSelectRow = document.getElementById('colorSelectRow');
  const blurSliderRow = document.getElementById('blurSliderRow');
  const blurRange = document.getElementById('blurRange');
  const blurVal = document.getElementById('blurVal');
  const chkShadow = document.getElementById('chkShadow');
  const chkGlow = document.getElementById('chkGlow');
  const formatSeg = document.getElementById('formatSeg');
  const btnDownload = document.getElementById('btnDownload');
  const customColorPicker = document.getElementById('customColorPicker');

  // State
  let originalImage = null;
  let cutoutCanvas = null; // Canvas containing RGBA cutout with alpha
  let currentConfig = {
    cutoutEnabled: true,
    bgMode: 'transparent', // 'transparent', 'color', 'blur'
    bgColor: '#FFFFFF',
    blurRadius: 20,
    shadowEnabled: false,
    glowEnabled: false,
    exportFormat: 'PNG',
    filename: 'artwork'
  };

  // ── 1. File Upload & Drag-and-Drop ──
  btnTriggerUpload.addEventListener('click', () => fileInput.click());
  dropZone.addEventListener('click', (e) => {
    if (e.target !== btnHoldCompare && !e.target.closest('#sliderWrap')) {
      fileInput.click();
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  });

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  });

  function handleFile(file) {
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn tệp hình ảnh hợp lệ!');
      return;
    }
    currentConfig.filename = file.name.replace(/\.[^/.]+$/, '');
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        originalImage = img;
        dropPlaceholder.style.display = 'none';
        canvasContainer.style.display = 'flex';
        sliderWrap.style.display = 'block';
        processCutoutAndRender();
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }

  // ── 2. Smart Client-Side Cutout Engine ──
  function processCutoutAndRender() {
    if (!originalImage) return;

    // Create intermediate cutout canvas
    cutoutCanvas = document.createElement('canvas');
    cutoutCanvas.width = originalImage.naturalWidth;
    cutoutCanvas.height = originalImage.naturalHeight;
    const ctx = cutoutCanvas.getContext('2d');
    ctx.drawImage(originalImage, 0, 0);

    if (currentConfig.cutoutEnabled) {
      performSmartCutout(cutoutCanvas);
    }

    renderMainDisplay();
  }

  function performSmartCutout(canvas) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    // Sample 4 corners to detect background color
    const corners = [
      getPixel(data, 0, 0, width),
      getPixel(data, width - 1, 0, width),
      getPixel(data, 0, height - 1, width),
      getPixel(data, width - 1, height - 1, width)
    ];

    const bgR = Math.round((corners[0].r + corners[1].r + corners[2].r + corners[3].r) / 4);
    const bgG = Math.round((corners[0].g + corners[1].g + corners[2].g + corners[3].g) / 4);
    const bgB = Math.round((corners[0].b + corners[1].b + corners[2].b + corners[3].b) / 4);

    // Calculate variance
    let diffSum = 0;
    for (let c of corners) {
      diffSum += Math.abs(c.r - bgR) + Math.abs(c.g - bgG) + Math.abs(c.b - bgB);
    }
    const isStudioBg = diffSum < 90;

    // Flood fill from borders
    const visited = new Uint8Array(width * height);
    const queue = [];
    const tolerance = 48; // Euclidean distance in RGB

    function matchesBg(idx) {
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];
      if (a < 30) return true;
      const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);
      return dist <= tolerance;
    }

    // Seed 4 borders
    for (let x = 0; x < width; x++) {
      let idxTop = (0 * width + x) * 4;
      if (matchesBg(idxTop)) { visited[x] = 1; queue.push([x, 0]); }
      let idxBot = ((height - 1) * width + x) * 4;
      if (matchesBg(idxBot)) { visited[(height - 1) * width + x] = 1; queue.push([x, height - 1]); }
    }

    for (let y = 0; y < height; y++) {
      let idxLeft = (y * width + 0) * 4;
      if (!visited[y * width] && matchesBg(idxLeft)) { visited[y * width] = 1; queue.push([0, y]); }
      let idxRight = (y * width + (width - 1)) * 4;
      if (!visited[y * width + width - 1] && matchesBg(idxRight)) { visited[y * width + width - 1] = 1; queue.push([width - 1, y]); }
    }

    // BFS
    let head = 0;
    while (head < queue.length) {
      const [cx, cy] = queue[head++];
      const pIdx = (cy * width + cx) * 4;
      data[pIdx + 3] = 0; // Make transparent

      const neighbors = [[cx - 1, cy], [cx + 1, cy], [cx, cy - 1], [cx, cy + 1]];
      for (let i = 0; i < 4; i++) {
        const nx = neighbors[i][0];
        const ny = neighbors[i][1];
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const nIdx = ny * width + nx;
          if (!visited[nIdx]) {
            visited[nIdx] = 1;
            if (matchesBg(nIdx * 4)) {
              queue.push([nx, ny]);
            }
          }
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
  }

  function getPixel(data, x, y, width) {
    const idx = (y * width + x) * 4;
    return { r: data[idx], g: data[idx + 1], b: data[idx + 2], a: data[idx + 3] };
  }

  // ── 3. Render Canvas with Canva Styles (BG, Shadow, Glow) ──
  function renderMainDisplay(showOriginal = false) {
    if (!originalImage) return;

    const w = originalImage.naturalWidth;
    const h = originalImage.naturalHeight;
    mainCanvas.width = w;
    mainCanvas.height = h;
    const ctx = mainCanvas.getContext('2d');
    ctx.clearRect(0, 0, w, h);

    if (showOriginal || !currentConfig.cutoutEnabled) {
      ctx.drawImage(originalImage, 0, 0);
      return;
    }

    // 1. Render Background
    if (currentConfig.bgMode === 'color') {
      ctx.fillStyle = currentConfig.bgColor;
      ctx.fillRect(0, 0, w, h);
    } else if (currentConfig.bgMode === 'blur') {
      // Draw blurred original background
      ctx.save();
      ctx.filter = `blur(${currentConfig.blurRadius}px)`;
      ctx.drawImage(originalImage, -20, -20, w + 40, h + 40);
      ctx.restore();
    }

    // 2. Render Glow / Stroke Outline
    if (currentConfig.glowEnabled && cutoutCanvas) {
      ctx.save();
      ctx.shadowColor = 'rgba(255, 255, 255, 0.95)';
      ctx.shadowBlur = 14;
      ctx.drawImage(cutoutCanvas, 0, 0);
      ctx.drawImage(cutoutCanvas, 0, 0);
      ctx.restore();
    }

    // 3. Render Soft Drop Shadow
    if (currentConfig.shadowEnabled && cutoutCanvas) {
      ctx.save();
      ctx.shadowColor = 'rgba(25, 20, 15, 0.42)';
      ctx.shadowBlur = 24;
      ctx.shadowOffsetX = 12;
      ctx.shadowOffsetY = 16;
      ctx.drawImage(cutoutCanvas, 0, 0);
      ctx.restore();
    }

    // 4. Render Cutout Foreground
    if (cutoutCanvas) {
      ctx.drawImage(cutoutCanvas, 0, 0);
    }
  }

  // ── 4. Control Bindings ──

  // Cutout On / Off
  cutoutModeSeg.querySelectorAll('.seg-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      cutoutModeSeg.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentConfig.cutoutEnabled = btn.dataset.val === 'on';
      processCutoutAndRender();
    });
  });

  // Background Mode
  bgModeSeg.querySelectorAll('.seg-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      bgModeSeg.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentConfig.bgMode = btn.dataset.val;

      colorSelectRow.style.display = currentConfig.bgMode === 'color' ? 'flex' : 'none';
      blurSliderRow.style.display = currentConfig.bgMode === 'blur' ? 'flex' : 'none';
      renderMainDisplay();
    });
  });

  // Mini Swatches
  document.querySelectorAll('.mini-swatch').forEach(swatch => {
    swatch.addEventListener('click', () => {
      document.querySelectorAll('.mini-swatch').forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
      currentConfig.bgColor = swatch.dataset.color;
      renderMainDisplay();
    });
  });

  // Swatches card on left column also changes color!
  document.querySelectorAll('.swatch-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      currentConfig.bgMode = 'color';
      currentConfig.bgColor = pill.dataset.color;
      bgModeSeg.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
      bgModeSeg.querySelector('[data-val="color"]').classList.add('active');
      colorSelectRow.style.display = 'flex';
      renderMainDisplay();
    });
  });

  customColorPicker.addEventListener('input', (e) => {
    currentConfig.bgColor = e.target.value;
    renderMainDisplay();
  });

  // Blur Range
  blurRange.addEventListener('input', (e) => {
    currentConfig.blurRadius = parseInt(e.target.value);
    blurVal.textContent = `${e.target.value}px`;
    renderMainDisplay();
  });

  // Checkboxes
  chkShadow.addEventListener('change', (e) => {
    currentConfig.shadowEnabled = e.target.checked;
    renderMainDisplay();
  });

  chkGlow.addEventListener('change', (e) => {
    currentConfig.glowEnabled = e.target.checked;
    renderMainDisplay();
  });

  // Format Segmented
  formatSeg.querySelectorAll('.seg-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      formatSeg.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentConfig.exportFormat = btn.dataset.fmt;
    });
  });

  // Hold to Compare Button
  btnHoldCompare.addEventListener('mousedown', () => renderMainDisplay(true));
  btnHoldCompare.addEventListener('mouseup', () => renderMainDisplay(false));
  btnHoldCompare.addEventListener('touchstart', () => renderMainDisplay(true));
  btnHoldCompare.addEventListener('touchend', () => renderMainDisplay(false));

  // Category Presets (quick switch)
  document.querySelectorAll('.cat-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const preset = pill.dataset.preset;
      if (preset === 'portrait') {
        currentConfig.bgMode = 'blur';
        currentConfig.shadowEnabled = true;
        currentConfig.glowEnabled = false;
      } else if (preset === 'product') {
        currentConfig.bgMode = 'color';
        currentConfig.bgColor = '#FFFFFF';
        currentConfig.shadowEnabled = true;
        currentConfig.glowEnabled = false;
      } else if (preset === 'graphic') {
        currentConfig.bgMode = 'transparent';
        currentConfig.shadowEnabled = false;
        currentConfig.glowEnabled = true;
      } else {
        currentConfig.bgMode = 'transparent';
        currentConfig.shadowEnabled = false;
        currentConfig.glowEnabled = false;
      }
      // Sync UI
      chkShadow.checked = currentConfig.shadowEnabled;
      chkGlow.checked = currentConfig.glowEnabled;
      bgModeSeg.querySelectorAll('.seg-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.val === currentConfig.bgMode);
      });
      colorSelectRow.style.display = currentConfig.bgMode === 'color' ? 'flex' : 'none';
      blurSliderRow.style.display = currentConfig.bgMode === 'blur' ? 'flex' : 'none';
      renderMainDisplay();
    });
  });

  // ── 5. Download Processed Image ──
  btnDownload.addEventListener('click', () => {
    if (!originalImage) {
      alert('Vui lòng tải ảnh lên trước!');
      return;
    }

    const fmt = currentConfig.exportFormat.toLowerCase();
    let mimeType = 'image/png';
    if (fmt === 'webp') mimeType = 'image/webp';
    if (fmt === 'jpg' || fmt === 'jpeg') mimeType = 'image/jpeg';

    // When exporting to JPG, flatten transparent backgrounds to white if needed
    let exportCanvas = mainCanvas;
    if (fmt === 'jpg' && currentConfig.bgMode === 'transparent') {
      exportCanvas = document.createElement('canvas');
      exportCanvas.width = mainCanvas.width;
      exportCanvas.height = mainCanvas.height;
      const ctx = exportCanvas.getContext('2d');
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
      ctx.drawImage(mainCanvas, 0, 0);
    }

    const link = document.createElement('a');
    link.download = `${currentConfig.filename}_canva.${fmt}`;
    link.href = exportCanvas.toDataURL(mimeType, 0.95);
    link.click();
  });

  // ── 6. Load Initial Demo Image (flower from samples if available, or placeholder) ──
  window.addEventListener('DOMContentLoaded', () => {
    const demoImg = new Image();
    demoImg.crossOrigin = 'anonymous';
    demoImg.onload = () => {
      originalImage = demoImg;
      dropPlaceholder.style.display = 'none';
      canvasContainer.style.display = 'flex';
      sliderWrap.style.display = 'block';
      processCutoutAndRender();
    };
    // Use the workspace sample image
    demoImg.src = '../samples/flower.png';
  });

})();
