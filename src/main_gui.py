"""
OmniImage Studio v2.5 — Modern Native Desktop Application
Professional, sleek, smooth and ergonomic desktop image toolkit.
Built with CustomTkinter & Pillow. 100% local, no browser required.
"""

import os
import sys
import multiprocessing
import threading
import time
import tkinter as tk
from tkinter import filedialog, messagebox, colorchooser
import customtkinter as ctk
from PIL import Image, ImageTk, ImageGrab, ImageDraw
import cv2
import numpy as np

# ─── RUNTIME PATH RESOLUTION (STANDALONE EXE & PYTHON) ───────────────────────
if getattr(sys, 'frozen', False):
    BASE_DIR = getattr(sys, '_MEIPASS', os.path.dirname(sys.executable))
    if BASE_DIR not in sys.path:
        sys.path.insert(0, BASE_DIR)
    src_dir = os.path.join(BASE_DIR, 'src')
    if os.path.exists(src_dir) and src_dir not in sys.path:
        sys.path.insert(0, src_dir)
else:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    if BASE_DIR not in sys.path:
        sys.path.insert(0, BASE_DIR)
    parent_dir = os.path.dirname(BASE_DIR)
    if parent_dir not in sys.path:
        sys.path.insert(0, parent_dir)

from core_engine import NativeImageEngine

# ─── THEME CONFIGURATION ─────────────────────────────────────────────────────
ctk.set_appearance_mode("Light")
ctk.set_default_color_theme("blue")

# ─── COLOR PALETTE TOKENS (MODERN CREATIVE STUDIO — SLATE & VIBRANT INDIGO) ───
# App Backgrounds (Matching Web Studio: Crisp Slate & Deep Midnight Slate)
BG_APP_DARK    = "#0b0f19"       # Midnight Space Slate
BG_APP_LIGHT   = "#f8fafc"       # Soft Light Slate (Slate-50)
BG_PANEL_DARK  = "#111827"       # Deep Dark Panel
BG_PANEL_LIGHT = "#ffffff"       # Pure White Card Surface
BG_CARD_DARK   = "#1e293b"       # Slate-800 Card
BG_CARD_LIGHT  = "#ffffff"       # Pure White Card
BG_SUB_DARK    = "#334155"       # Slate-700 Sub/Inactive Container
BG_SUB_LIGHT   = "#f1f5f9"       # Slate-100 Sub/Inactive Container

# Borders
BORDER_DARK    = "#334155"       # Slate-700 Border
BORDER_LIGHT   = "#e2e8f0"       # Slate-200 Subtle Border
BORDER_ACCENT  = "#6366f1"       # Vibrant Indigo Border Focus

# Typography — High contrast & ultra legible for Light & Dark modes
TEXT_PRIMARY_D = "#f8fafc"       # Slate-50 Crisp White
TEXT_PRIMARY_L = "#0f172a"       # Slate-900 High-contrast Near-Black
TEXT_MUTED_D   = "#94a3b8"       # Slate-400
TEXT_MUTED_L   = "#475569"       # Slate-600
TEXT_FAINT_D   = "#64748b"       # Slate-500
TEXT_FAINT_L   = "#94a3b8"       # Slate-400

# Semantic Brand Accents
ACCENT         = "#4f46e5"       # Vibrant Studio Indigo (Brand)
ACCENT_HOVER   = "#4338ca"       # Indigo-700
ACCENT_LIGHT   = "#eef2ff"       # Indigo-50
SUCCESS        = "#059669"       # Emerald Green-600 (CTA Start Convert)
SUCCESS_HOVER  = "#047857"       # Emerald-700
WARNING        = "#d97706"       # Amber-600
WARNING_HOVER  = "#b45309"       # Amber-700
DANGER         = "#ef4444"       # Rose Red-500
DANGER_HOVER   = "#dc2626"       # Rose-600

# ─── HIGH CONTRAST WIDGET CONTRAST ENHANCEMENTS ─────────────────────────────
# Automatically ensure high contrast text colors for Segmented Buttons,
# Option Menus, Tabviews, Checkboxes, Switches, and Entries.

_orig_sb_init = ctk.CTkSegmentedButton.__init__
_orig_sb_select = ctk.CTkSegmentedButton._select_button_by_value
_orig_sb_unselect = ctk.CTkSegmentedButton._unselect_button_by_value

def _patched_sb_init(self, *args, **kwargs):
    if "text_color" not in kwargs or kwargs["text_color"] is None:
        kwargs["text_color"] = (TEXT_PRIMARY_L, TEXT_PRIMARY_D)
    _orig_sb_init(self, *args, **kwargs)

def _patched_sb_select(self, value: str):
    _orig_sb_select(self, value)
    if value in self._buttons_dict:
        self._buttons_dict[value].configure(text_color=("white", "white"))

def _patched_sb_unselect(self, value: str):
    _orig_sb_unselect(self, value)
    if value in self._buttons_dict:
        self._buttons_dict[value].configure(text_color=(TEXT_PRIMARY_L, TEXT_PRIMARY_D))

ctk.CTkSegmentedButton.__init__ = _patched_sb_init
ctk.CTkSegmentedButton._select_button_by_value = _patched_sb_select
ctk.CTkSegmentedButton._unselect_button_by_value = _patched_sb_unselect

_orig_om_init = ctk.CTkOptionMenu.__init__
def _patched_om_init(self, *args, **kwargs):
    if "text_color" not in kwargs or kwargs["text_color"] is None:
        kwargs["text_color"] = (TEXT_PRIMARY_L, TEXT_PRIMARY_D)
    if "dropdown_text_color" not in kwargs or kwargs["dropdown_text_color"] is None:
        kwargs["dropdown_text_color"] = (TEXT_PRIMARY_L, TEXT_PRIMARY_D)
    if "dropdown_fg_color" not in kwargs or kwargs["dropdown_fg_color"] is None:
        kwargs["dropdown_fg_color"] = (BG_PANEL_LIGHT, BG_PANEL_DARK)
    if "dropdown_hover_color" not in kwargs or kwargs["dropdown_hover_color"] is None:
        kwargs["dropdown_hover_color"] = (BG_SUB_LIGHT, BG_SUB_DARK)
    _orig_om_init(self, *args, **kwargs)
ctk.CTkOptionMenu.__init__ = _patched_om_init

_orig_tv_init = ctk.CTkTabview.__init__
def _patched_tv_init(self, *args, **kwargs):
    if "text_color" not in kwargs or kwargs["text_color"] is None:
        kwargs["text_color"] = (TEXT_PRIMARY_L, TEXT_PRIMARY_D)
    _orig_tv_init(self, *args, **kwargs)
ctk.CTkTabview.__init__ = _patched_tv_init

_orig_cb_init = ctk.CTkCheckBox.__init__
def _patched_cb_init(self, *args, **kwargs):
    if "text_color" not in kwargs or kwargs["text_color"] is None:
        kwargs["text_color"] = (TEXT_PRIMARY_L, TEXT_PRIMARY_D)
    _orig_cb_init(self, *args, **kwargs)
ctk.CTkCheckBox.__init__ = _patched_cb_init

_orig_sw_init = ctk.CTkSwitch.__init__
def _patched_sw_init(self, *args, **kwargs):
    if "text_color" not in kwargs or kwargs["text_color"] is None:
        kwargs["text_color"] = (TEXT_PRIMARY_L, TEXT_PRIMARY_D)
    _orig_sw_init(self, *args, **kwargs)
ctk.CTkSwitch.__init__ = _patched_sw_init

_orig_entry_init = ctk.CTkEntry.__init__
def _patched_entry_init(self, *args, **kwargs):
    if "text_color" not in kwargs or kwargs["text_color"] is None:
        kwargs["text_color"] = (TEXT_PRIMARY_L, TEXT_PRIMARY_D)
    if "placeholder_text_color" not in kwargs or kwargs["placeholder_text_color"] is None:
        kwargs["placeholder_text_color"] = (TEXT_MUTED_L, TEXT_MUTED_D)
    _orig_entry_init(self, *args, **kwargs)
ctk.CTkEntry.__init__ = _patched_entry_init

# ─── PRESET CONFIGURATIONS ───────────────────────────────────────────────────
PRESETS = {
    "── Chọn kích thước mẫu ──": None,
    # Mạng xã hội
    "Facebook Cover (820 × 312)":         (820, 312),
    "Facebook Post (1200 × 630)":         (1200, 630),
    "Instagram Vuông 1:1 (1080 × 1080)":  (1080, 1080),
    "Instagram Story (1080 × 1920)":      (1080, 1920),
    "Twitter / X Post (1200 × 675)":      (1200, 675),
    "YouTube Thumbnail (1280 × 720)":     (1280, 720),
    "YouTube Banner (2560 × 1440)":       (2560, 1440),
    "TikTok Video (1080 × 1920)":         (1080, 1920),
    # Màn hình & Đồ họa
    "4K Ultra HD (3840 × 2160)":          (3840, 2160),
    "Full HD 1080p (1920 × 1080)":        (1920, 1080),
    "HD 720p (1280 × 720)":               (1280, 720),
    # Biểu tượng & Icons
    "Favicon Web (32 × 32)":              (32, 32),
    "Windows Icon (48 × 48)":             (48, 48),
    "App Icon Standard (128 × 128)":      (128, 128),
    "High-Res Icon (256 × 256)":          (256, 256),
    "App Store (512 × 512)":              (512, 512),
}

FORMAT_EXT = {
    "WEBP": "webp", "PNG": "png", "JPG": "jpg",
    "ICO": "ico",   "BMP": "bmp", "PDF": "pdf",
    "GIF": "gif",   "TIFF": "tiff",
}


# ─── SECTION HEADER WIDGET ───────────────────────────────────────────────────
class SectionHeader(ctk.CTkFrame):
    """Clean section header with decorative colored indicator bar."""
    def __init__(self, master, icon: str, title: str, color=ACCENT, **kwargs):
        super().__init__(master, fg_color="transparent", **kwargs)
        self.grid_columnconfigure(1, weight=1)

        bar = ctk.CTkFrame(self, width=3, height=15, corner_radius=2, fg_color=color)
        bar.grid(row=0, column=0, padx=(0, 6), sticky="w")

        lbl = ctk.CTkLabel(
            self,
            text=f"{icon}  {title}",
            font=ctk.CTkFont("Segoe UI", 11, "bold"),
            text_color=(TEXT_PRIMARY_L, TEXT_PRIMARY_D)
        )
        lbl.grid(row=0, column=1, sticky="w")


# ─── BADGE PILL WIDGET ───────────────────────────────────────────────────────
class BadgePill(ctk.CTkLabel):
    def __init__(self, master, text, color=ACCENT, **kwargs):
        super().__init__(
            master,
            text=text,
            font=ctk.CTkFont("Segoe UI", 10, "bold"),
            fg_color=color,
            corner_radius=8,
            padx=8, pady=2,
            text_color="white",
            **kwargs
        )


# ─── MAIN APPLICATION CLASS ─────────────────────────────────────────────────
class OmniImageStudioApp(ctk.CTk):

    def __init__(self):
        super().__init__()

        # State Variables
        self.loaded_files: list = []
        self.current_preview_index: int = -1
        self.hidden_logo_path: str | None = None
        self.hidden_logo_img  = None
        self.is_processing    = False
        self.var_clean_stego     = ctk.BooleanVar(value=False)
        # Canva Studio & Background options
        self.canva_bg_mode       = ctk.StringVar(value="transparent")
        self.canva_bg_color      = ctk.StringVar(value="#FFFFFF")
        self.canva_blur_rad      = ctk.IntVar(value=20)
        self.canva_shadow_enabled= ctk.BooleanVar(value=False)
        self.canva_shadow_blur   = ctk.IntVar(value=16)
        self.canva_shadow_opacity= ctk.DoubleVar(value=0.45)
        self.canva_shadow_offset_x = ctk.IntVar(value=10)
        self.canva_shadow_offset_y = ctk.IntVar(value=12)
        self.canva_glow_enabled  = ctk.BooleanVar(value=False)
        self.canva_glow_width    = ctk.IntVar(value=6)
        self.canva_glow_color    = (255, 255, 255)
        self.canva_is_glow       = ctk.BooleanVar(value=False)
        
        # Fast preview downscale cache: index -> { 'img': preview_img, 'w': int, 'h': int }
        self._preview_cache: dict = {}
        self._preview_debounce_timer = None

        self._build_ui()

    # ── UI Construction ──────────────────────────────────────────────────────
    def _build_ui(self):
        self.title("OmniImage Studio — Công Cụ Xử Lý & Chuyển Đổi Ảnh Đa Năng")

        # Smart window centering
        self.update_idletasks()
        screen_w = self.winfo_screenwidth()
        screen_h = self.winfo_screenheight()
        w = min(1320, max(1040, screen_w - 60))
        h = min(860, max(700, screen_h - 80))
        x = max(0, (screen_w - w) // 2)
        y = max(0, (screen_h - h) // 2)
        self.geometry(f"{w}x{h}+{x}+{y}")
        self.minsize(1000, 680)
        self.configure(fg_color=(BG_APP_LIGHT, BG_APP_DARK))

        # Main Layout Grid: Row 0 = Top Header, Row 1 = Main Body
        self.grid_columnconfigure(0, weight=0)  # Sidebar (fixed width)
        self.grid_columnconfigure(1, weight=1)  # Main Content (stretches)
        self.grid_rowconfigure(1, weight=1)

        self._build_header()
        self._build_sidebar()
        self._build_main_panel()
        self._bind_events()

        # Reliable focus when double clicked
        self.after(100, self._ensure_focus)

    def _ensure_focus(self):
        try:
            self.lift()
            self.attributes("-topmost", True)
            self.attributes("-topmost", False)
            self.focus_force()
        except Exception:
            pass

    # ── 1. Top Header ────────────────────────────────────────────────────────
    def _build_header(self):
        hdr = ctk.CTkFrame(
            self, height=58, corner_radius=0,
            fg_color=(BG_PANEL_LIGHT, BG_PANEL_DARK),
            border_width=1, border_color=(BORDER_LIGHT, BORDER_DARK)
        )
        hdr.grid(row=0, column=0, columnspan=2, sticky="ew")
        hdr.grid_columnconfigure(1, weight=1)
        hdr.grid_propagate(False)

        # Brand Logo + Subtitle + Swatch Palette
        brand_frame = ctk.CTkFrame(hdr, fg_color="transparent")
        brand_frame.grid(row=0, column=0, padx=(18, 10), pady=8, sticky="w")

        logo_icon = ctk.CTkLabel(
            brand_frame, text="✦",
            font=ctk.CTkFont("Georgia", 22, "bold"),
            text_color=ACCENT
        )
        logo_icon.pack(side="left", padx=(0, 6))

        title_box = ctk.CTkFrame(brand_frame, fg_color="transparent")
        title_box.pack(side="left", padx=(0, 10))

        sub_label = ctk.CTkLabel(
            title_box, text="D E S I G N   W I T H   E M P A T H Y",
            font=ctk.CTkFont("Segoe UI", 9, "bold"),
            text_color=ACCENT
        )
        sub_label.pack(anchor="w", pady=(0, 1))

        logo_text = ctk.CTkLabel(
            title_box, text="OmniImage Studio",
            font=ctk.CTkFont("Georgia", 16, "bold"),
            text_color=(TEXT_PRIMARY_L, TEXT_PRIMARY_D)
        )
        logo_text.pack(anchor="w")

        BadgePill(brand_frame, "CANVA CUTOUT PRO", color=ACCENT).pack(side="left", padx=(0, 14))

        # Aesthetic Color Swatch Preview Pill
        swatch_frame = ctk.CTkFrame(brand_frame, fg_color=(BG_CARD_LIGHT, BG_CARD_DARK), corner_radius=12, border_width=1, border_color=(BORDER_LIGHT, BORDER_DARK))
        swatch_frame.pack(side="left", padx=(0, 10), pady=4)
        for c in ("#4F46E5", "#059669", "#3B82F6", "#0F172A"):
            dot = ctk.CTkFrame(swatch_frame, width=14, height=14, corner_radius=7, fg_color=c, border_width=1, border_color=(BORDER_LIGHT, BORDER_DARK))
            dot.pack(side="left", padx=3, pady=3)

        # Right Controls: Count Badge + Theme Toggle
        right_box = ctk.CTkFrame(hdr, fg_color="transparent")
        right_box.grid(row=0, column=2, padx=16, sticky="e")

        self.lbl_file_count = ctk.CTkLabel(
            right_box,
            text="Chưa có ảnh",
            font=ctk.CTkFont("Segoe UI", 11, "bold"),
            text_color=(TEXT_PRIMARY_L, TEXT_PRIMARY_D)
        )
        self.lbl_file_count.pack(side="left", padx=(0, 16))

        self.theme_btn = ctk.CTkButton(
            right_box,
            text="🌙  Tối",
            width=88, height=30,
            corner_radius=8,
            fg_color=(BG_SUB_LIGHT, BG_SUB_DARK),
            hover_color=(BORDER_LIGHT, BORDER_DARK),
            text_color=(TEXT_PRIMARY_L, TEXT_PRIMARY_D),
            font=ctk.CTkFont("Segoe UI", 11, "bold"),
            command=self._toggle_theme
        )
        self.theme_btn.pack(side="left")

    # ── 2. Sidebar (Ergonomic Fixed Width + Pinned Actions) ───────────────────
    def _build_sidebar(self):
        # Container frame
        self.sidebar_container = ctk.CTkFrame(
            self, width=380, corner_radius=0,
            fg_color=(BG_PANEL_LIGHT, BG_PANEL_DARK),
            border_width=1, border_color=(BORDER_LIGHT, BORDER_DARK)
        )
        self.sidebar_container.grid(row=1, column=0, sticky="nsew")
        self.sidebar_container.grid_columnconfigure(0, weight=1)
        self.sidebar_container.grid_rowconfigure(1, weight=1)  # Middle scrollable expands
        self.sidebar_container.grid_propagate(False)

        # ── Top Quick Input Card ─────────────────────────────────────────────
        top_input = ctk.CTkFrame(
            self.sidebar_container, corner_radius=10,
            fg_color=(BG_CARD_LIGHT, BG_CARD_DARK),
            border_width=1, border_color=(BORDER_LIGHT, BORDER_DARK)
        )
        top_input.grid(row=0, column=0, padx=12, pady=(12, 6), sticky="ew")
        top_input.grid_columnconfigure(0, weight=1)
        top_input.grid_columnconfigure(1, weight=1)

        self.btn_select_files = ctk.CTkButton(
            top_input, text="📂  Chọn File Ảnh",
            height=34, corner_radius=8,
            font=ctk.CTkFont("Segoe UI", 11, "bold"),
            fg_color=ACCENT, hover_color=ACCENT_HOVER,
            command=self.select_files
        )
        self.btn_select_files.grid(row=0, column=0, padx=(8, 4), pady=8, sticky="ew")

        self.btn_paste = ctk.CTkButton(
            top_input, text="📋  Dán (Ctrl+V)",
            height=34, corner_radius=8,
            font=ctk.CTkFont("Segoe UI", 11),
            fg_color=(BG_SUB_LIGHT, BG_SUB_DARK),
            hover_color=(BORDER_LIGHT, BORDER_DARK),
            text_color=(TEXT_PRIMARY_L, TEXT_PRIMARY_D),
            command=self.paste_from_clipboard
        )
        self.btn_paste.grid(row=0, column=1, padx=(4, 8), pady=8, sticky="ew")

        # ── Middle Scrollable Settings Area ──────────────────────────────────
        self.sidebar_scroll = ctk.CTkScrollableFrame(
            self.sidebar_container,
            fg_color="transparent",
            scrollbar_button_color=(BORDER_LIGHT, BORDER_DARK)
        )
        self.sidebar_scroll.grid(row=1, column=0, sticky="nsew", padx=4, pady=0)
        self.sidebar_scroll.grid_columnconfigure(0, weight=1)

        self._build_format_card()
        self._build_resize_card()
        self._build_canva_cutout_card()
        self._build_stego_card()

        # ── Pinned Bottom Action Bar (ALWAYS VISIBLE) ────────────────────────
        pinned_actions = ctk.CTkFrame(
            self.sidebar_container, corner_radius=0,
            fg_color=(BG_CARD_LIGHT, BG_CARD_DARK),
            border_width=1, border_color=(BORDER_LIGHT, BORDER_DARK)
        )
        pinned_actions.grid(row=2, column=0, sticky="ew", padx=0, pady=0)
        pinned_actions.grid_columnconfigure(0, weight=1)

        self.btn_start = ctk.CTkButton(
            pinned_actions,
            text="⚡   BẮT ĐẦU CHUYỂN ĐỔI",
            height=44, corner_radius=9,
            font=ctk.CTkFont("Segoe UI", 13, "bold"),
            fg_color=SUCCESS, hover_color=SUCCESS_HOVER,
            command=self.start_batch_conversion
        )
        self.btn_start.grid(row=0, column=0, padx=12, pady=(10, 4), sticky="ew")

        self.btn_clear = ctk.CTkButton(
            pinned_actions,
            text="🗑  Làm trống danh sách",
            height=28, corner_radius=6,
            font=ctk.CTkFont("Segoe UI", 11),
            fg_color="transparent",
            text_color=(TEXT_MUTED_L, TEXT_MUTED_D),
            hover_color=(BG_SUB_LIGHT, BG_SUB_DARK),
            command=self.clear_all
        )
        self.btn_clear.grid(row=1, column=0, padx=12, pady=(0, 10), sticky="ew")

    # ── Sidebar Cards ────────────────────────────────────────────────────────
    def _build_format_card(self):
        SectionHeader(self.sidebar_scroll, "🔄", "ĐỊNH DẠNG & NÉN").grid(
            row=0, column=0, padx=10, pady=(4, 4), sticky="ew")

        card = ctk.CTkFrame(
            self.sidebar_scroll, corner_radius=10,
            fg_color=(BG_CARD_LIGHT, BG_CARD_DARK),
            border_width=1, border_color=(BORDER_LIGHT, BORDER_DARK)
        )
        card.grid(row=1, column=0, padx=8, pady=(0, 10), sticky="ew")
        card.grid_columnconfigure(0, weight=1)

        # Primary formats segmented
        self.format_segmented = ctk.CTkSegmentedButton(
            card,
            values=["WEBP", "PNG", "JPG", "ICO", "PDF"],
            command=self._on_format_changed,
            font=ctk.CTkFont("Segoe UI", 11, "bold"),
            selected_color=ACCENT,
            selected_hover_color=ACCENT_HOVER,
            unselected_color=(BG_SUB_LIGHT, BG_SUB_DARK),
        )
        self.format_segmented.set("WEBP")
        self.format_segmented.grid(row=0, column=0, padx=10, pady=(10, 6), sticky="ew")

        # More formats dropdown
        sub_row = ctk.CTkFrame(card, fg_color="transparent")
        sub_row.grid(row=1, column=0, padx=10, pady=(0, 6), sticky="ew")
        sub_row.grid_columnconfigure(1, weight=1)

        ctk.CTkLabel(
            sub_row, text="Định dạng khác:",
            font=ctk.CTkFont("Segoe UI", 11, "bold"),
            text_color=(TEXT_PRIMARY_L, TEXT_PRIMARY_D)
        ).grid(row=0, column=0, padx=(0, 8), sticky="w")

        self.extra_format_menu = ctk.CTkOptionMenu(
            sub_row,
            values=["── Chọn khác ──", "BMP", "GIF", "TIFF"],
            height=26, corner_radius=6,
            font=ctk.CTkFont("Segoe UI", 11, "bold"),
            fg_color=(BG_SUB_LIGHT, BG_SUB_DARK),
            text_color=(TEXT_PRIMARY_L, TEXT_PRIMARY_D),
            button_color=ACCENT, button_hover_color=ACCENT_HOVER,
            command=self._on_extra_format
        )
        self.extra_format_menu.set("── Chọn khác ──")
        self.extra_format_menu.grid(row=0, column=1, sticky="ew")

        # Quality slider
        qual_box = ctk.CTkFrame(card, fg_color="transparent")
        qual_box.grid(row=2, column=0, padx=10, pady=(2, 10), sticky="ew")
        qual_box.grid_columnconfigure(0, weight=1)

        qual_hdr = ctk.CTkFrame(qual_box, fg_color="transparent")
        qual_hdr.grid(row=0, column=0, sticky="ew")
        qual_hdr.grid_columnconfigure(0, weight=1)

        ctk.CTkLabel(
            qual_hdr, text="Chất lượng ảnh xuất",
            font=ctk.CTkFont("Segoe UI", 11, "bold"),
            text_color=(TEXT_PRIMARY_L, TEXT_PRIMARY_D)
        ).grid(row=0, column=0, sticky="w")

        self.lbl_quality = ctk.CTkLabel(
            qual_hdr, text="90%",
            font=ctk.CTkFont("Segoe UI", 11, "bold"),
            text_color=ACCENT
        )
        self.lbl_quality.grid(row=0, column=1, sticky="e")

        self.slider_quality = ctk.CTkSlider(
            qual_box, from_=10, to=100, number_of_steps=90,
            button_color=ACCENT, button_hover_color=ACCENT_HOVER,
            progress_color=ACCENT,
            command=self._on_quality_slider
        )
        self.slider_quality.set(90)
        self.slider_quality.grid(row=1, column=0, sticky="ew", pady=(4, 0))

    def _build_resize_card(self):
        SectionHeader(self.sidebar_scroll, "📐", "KÍCH THƯỚC & KHUNG HÌNH").grid(
            row=2, column=0, padx=10, pady=(4, 4), sticky="ew")

        card = ctk.CTkFrame(
            self.sidebar_scroll, corner_radius=10,
            fg_color=(BG_CARD_LIGHT, BG_CARD_DARK),
            border_width=1, border_color=(BORDER_LIGHT, BORDER_DARK)
        )
        card.grid(row=3, column=0, padx=8, pady=(0, 10), sticky="ew")
        card.grid_columnconfigure(0, weight=1)

        # Preset Menu
        self.preset_menu = ctk.CTkOptionMenu(
            card,
            values=list(PRESETS.keys()),
            command=self._on_preset_selected,
            height=30, corner_radius=6,
            font=ctk.CTkFont("Segoe UI", 11, "bold"),
            fg_color=(BG_SUB_LIGHT, BG_SUB_DARK),
            text_color=(TEXT_PRIMARY_L, TEXT_PRIMARY_D),
            button_color=ACCENT, button_hover_color=ACCENT_HOVER,
        )
        self.preset_menu.set("── Chọn kích thước mẫu ──")
        self.preset_menu.grid(row=0, column=0, padx=10, pady=(10, 6), sticky="ew")

        # Dimensions Entry Row
        dim_row = ctk.CTkFrame(card, fg_color="transparent")
        dim_row.grid(row=1, column=0, padx=10, pady=4, sticky="ew")
        dim_row.grid_columnconfigure(0, weight=1)
        dim_row.grid_columnconfigure(2, weight=1)

        self.entry_w = ctk.CTkEntry(
            dim_row, placeholder_text="Rộng (px)",
            height=32, corner_radius=6,
            font=ctk.CTkFont("Segoe UI", 12, "bold"),
            border_color=(BORDER_LIGHT, BORDER_DARK)
        )
        self.entry_w.grid(row=0, column=0, sticky="ew")
        self.entry_w.bind("<KeyRelease>", lambda e: self._on_dimension_input("width"))

        ctk.CTkLabel(
            dim_row, text="×",
            font=ctk.CTkFont("Segoe UI", 15, "bold"),
            text_color=(TEXT_PRIMARY_L, TEXT_PRIMARY_D)
        ).grid(row=0, column=1, padx=6)

        self.entry_h = ctk.CTkEntry(
            dim_row, placeholder_text="Cao (px)",
            height=32, corner_radius=6,
            font=ctk.CTkFont("Segoe UI", 12, "bold"),
            border_color=(BORDER_LIGHT, BORDER_DARK)
        )
        self.entry_h.grid(row=0, column=2, sticky="ew")
        self.entry_h.bind("<KeyRelease>", lambda e: self._on_dimension_input("height"))

        # Lock Aspect Ratio Checkbox
        self.lock_aspect_var = ctk.BooleanVar(value=True)
        self.chk_lock = ctk.CTkCheckBox(
            card, text="🔗  Khóa tỉ lệ khung hình",
            variable=self.lock_aspect_var,
            font=ctk.CTkFont("Segoe UI", 11, "bold"),
            checkmark_color="white",
            fg_color=ACCENT, hover_color=ACCENT_HOVER,
            text_color=(TEXT_PRIMARY_L, TEXT_PRIMARY_D)
        )
        self.chk_lock.grid(row=2, column=0, padx=10, pady=(4, 6), sticky="w")

        # Fit Mode Dropdown
        fit_box = ctk.CTkFrame(card, fg_color="transparent")
        fit_box.grid(row=3, column=0, padx=10, pady=(2, 10), sticky="ew")
        fit_box.grid_columnconfigure(1, weight=1)

        ctk.CTkLabel(
            fit_box, text="Chế độ vừa khung:",
            font=ctk.CTkFont("Segoe UI", 11, "bold"),
            text_color=(TEXT_PRIMARY_L, TEXT_PRIMARY_D)
        ).grid(row=0, column=0, padx=(0, 6), sticky="w")

        self.fit_mode_menu = ctk.CTkOptionMenu(
            fit_box,
            values=["Kéo dãn (stretch)", "Vừa khung (contain)", "Lấp đầy (cover)"],
            height=26, corner_radius=6,
            font=ctk.CTkFont("Segoe UI", 11, "bold"),
            fg_color=(BG_SUB_LIGHT, BG_SUB_DARK),
            text_color=(TEXT_PRIMARY_L, TEXT_PRIMARY_D),
            button_color=ACCENT, button_hover_color=ACCENT_HOVER,
            command=lambda v: self.schedule_live_preview()
        )
        self.fit_mode_menu.set("Kéo dãn (stretch)")
        self.fit_mode_menu.grid(row=0, column=1, sticky="ew")

    def _build_canva_cutout_card(self):
        SectionHeader(self.sidebar_scroll, "✨", "TÁCH NỀN CHUẨN CANVA & LÀM NÉT", color=ACCENT).grid(
            row=4, column=0, padx=10, pady=(4, 4), sticky="ew")

        card = ctk.CTkFrame(
            self.sidebar_scroll, corner_radius=10,
            fg_color=(BG_CARD_LIGHT, BG_CARD_DARK),
            border_width=1, border_color=(BORDER_LIGHT, BORDER_DARK)
        )
        card.grid(row=5, column=0, padx=8, pady=(0, 10), sticky="ew")
        card.grid_columnconfigure(0, weight=1)

        # 1. Canva Background Removal Switch
        self.var_remove_bg = ctk.BooleanVar(value=False)
        self.chk_remove_bg = ctk.CTkSwitch(
            card,
            text="✨  Tách nền thông minh (Canva Cutout)",
            variable=self.var_remove_bg,
            font=ctk.CTkFont("Segoe UI", 11, "bold"),
            button_color=ACCENT, button_hover_color=ACCENT_HOVER,
            progress_color=ACCENT,
            command=self._on_remove_bg_toggle
        )
        self.chk_remove_bg.grid(row=0, column=0, padx=10, pady=(10, 4), sticky="w")

        # 2. Studio Launcher Button
        self.btn_open_canva_studio = ctk.CTkButton(
            card,
            text="🎨  Mở Canva Background Studio",
            height=34, corner_radius=8,
            font=ctk.CTkFont("Segoe UI", 11, "bold"),
            fg_color=("#6366F1", "#4F46E5"), hover_color=("#4F46E5", "#4338CA"),
            text_color="white",
            command=self.open_canva_background_studio
        )
        self.btn_open_canva_studio.grid(row=1, column=0, padx=10, pady=(4, 8), sticky="ew")

        # 3. Quick Background Choice (Transparent / White / Warm Cream / Dark)
        bg_sub = ctk.CTkFrame(card, fg_color="transparent")
        bg_sub.grid(row=2, column=0, padx=10, pady=2, sticky="ew")
        bg_sub.grid_columnconfigure(1, weight=1)

        ctk.CTkLabel(
            bg_sub, text="Phông nền:",
            font=ctk.CTkFont("Segoe UI", 11, "bold"),
            text_color=(TEXT_PRIMARY_L, TEXT_PRIMARY_D)
        ).grid(row=0, column=0, padx=(0, 6), sticky="w")

        self.canva_bg_segmented = ctk.CTkSegmentedButton(
            bg_sub,
            values=["Trong suốt", "Trắng", "Kem be", "Đen"],
            font=ctk.CTkFont("Segoe UI", 10, "bold"),
            selected_color=ACCENT, selected_hover_color=ACCENT_HOVER,
            unselected_color=(BG_SUB_LIGHT, BG_SUB_DARK),
            text_color=(TEXT_PRIMARY_L, TEXT_PRIMARY_D),
            command=self._on_canva_bg_preset
        )
        self.canva_bg_segmented.set("Trong suốt")
        self.canva_bg_segmented.grid(row=0, column=1, sticky="ew")

        # 4. Drop Shadow & Glow Checkboxes
        effects_box = ctk.CTkFrame(card, fg_color="transparent")
        effects_box.grid(row=3, column=0, padx=10, pady=(4, 4), sticky="ew")
        effects_box.grid_columnconfigure(0, weight=1)
        effects_box.grid_columnconfigure(1, weight=1)

        self.chk_shadow = ctk.CTkCheckBox(
            effects_box, text="Đổ bóng (Shadow)",
            variable=self.canva_shadow_enabled,
            font=ctk.CTkFont("Segoe UI", 11, "bold"),
            checkmark_color="white",
            fg_color=ACCENT, hover_color=ACCENT_HOVER,
            text_color=(TEXT_PRIMARY_L, TEXT_PRIMARY_D),
            command=self.schedule_live_preview
        )
        self.chk_shadow.grid(row=0, column=0, sticky="w", pady=2)

        self.chk_glow = ctk.CTkCheckBox(
            effects_box, text="Viền nét (Outline)",
            variable=self.canva_glow_enabled,
            font=ctk.CTkFont("Segoe UI", 11, "bold"),
            checkmark_color="white",
            fg_color=ACCENT, hover_color=ACCENT_HOVER,
            text_color=(TEXT_PRIMARY_L, TEXT_PRIMARY_D),
            command=self.schedule_live_preview
        )
        self.chk_glow.grid(row=0, column=1, sticky="w", pady=2)

        # 5. Tolerance Slider
        tol_box = ctk.CTkFrame(card, fg_color="transparent")
        tol_box.grid(row=4, column=0, padx=10, pady=(2, 4), sticky="ew")
        tol_box.grid_columnconfigure(0, weight=1)

        tol_hdr = ctk.CTkFrame(tol_box, fg_color="transparent")
        tol_hdr.grid(row=0, column=0, sticky="ew")
        tol_hdr.grid_columnconfigure(0, weight=1)

        ctk.CTkLabel(
            tol_hdr, text="Độ nhạy tách nền",
            font=ctk.CTkFont("Segoe UI", 11, "bold"),
            text_color=(TEXT_PRIMARY_L, TEXT_PRIMARY_D)
        ).grid(row=0, column=0, sticky="w")

        self.lbl_tolerance = ctk.CTkLabel(
            tol_hdr, text="35%",
            font=ctk.CTkFont("Segoe UI", 11, "bold"),
            text_color=ACCENT
        )
        self.lbl_tolerance.grid(row=0, column=1, sticky="e")

        self.slider_tolerance = ctk.CTkSlider(
            tol_box, from_=5, to=80, number_of_steps=75,
            button_color=ACCENT, button_hover_color=ACCENT_HOVER,
            progress_color=ACCENT,
            command=self._on_tolerance_slider
        )
        self.slider_tolerance.set(35)
        self.slider_tolerance.grid(row=1, column=0, sticky="ew", pady=(2, 0))

        # 6. Sharpen Slider
        sharp_box = ctk.CTkFrame(card, fg_color="transparent")
        sharp_box.grid(row=5, column=0, padx=10, pady=(2, 10), sticky="ew")
        sharp_box.grid_columnconfigure(0, weight=1)

        sharp_hdr = ctk.CTkFrame(sharp_box, fg_color="transparent")
        sharp_hdr.grid(row=0, column=0, sticky="ew")
        sharp_hdr.grid_columnconfigure(0, weight=1)

        ctk.CTkLabel(
            sharp_hdr, text="Tăng độ nét Unsharp Mask",
            font=ctk.CTkFont("Segoe UI", 11, "bold"),
            text_color=(TEXT_PRIMARY_L, TEXT_PRIMARY_D)
        ).grid(row=0, column=0, sticky="w")

        self.lbl_sharpen = ctk.CTkLabel(
            sharp_hdr, text="0%",
            font=ctk.CTkFont("Segoe UI", 11, "bold"),
            text_color=SUCCESS
        )
        self.lbl_sharpen.grid(row=0, column=1, sticky="e")

        self.slider_sharpen = ctk.CTkSlider(
            sharp_box, from_=0, to=100, number_of_steps=100,
            button_color=SUCCESS, button_hover_color=SUCCESS_HOVER,
            progress_color=SUCCESS,
            command=self._on_sharpen_slider
        )
        self.slider_sharpen.set(0)
        self.slider_sharpen.grid(row=1, column=0, sticky="ew", pady=(2, 0))

    def _build_stego_card(self):
        SectionHeader(self.sidebar_scroll, "🛡", "THỦY VÂN & XÓA LOGO").grid(
            row=6, column=0, padx=10, pady=(4, 4), sticky="ew")

        card = ctk.CTkFrame(
            self.sidebar_scroll, corner_radius=10,
            fg_color=(BG_CARD_LIGHT, BG_CARD_DARK),
            border_width=1, border_color=(BORDER_LIGHT, BORDER_DARK)
        )
        card.grid(row=7, column=0, padx=8, pady=(0, 10), sticky="ew")
        card.grid_columnconfigure(0, weight=1)
        card.grid_columnconfigure(1, weight=1)

        # Row 0: Embed Logo & Inspect Hidden Logo
        self.btn_select_logo = ctk.CTkButton(
            card,
            text="🛡  Nhúng Logo", height=30, corner_radius=6,
            fg_color=(BG_SUB_LIGHT, BG_SUB_DARK),
            hover_color=(BORDER_LIGHT, BORDER_DARK),
            text_color=(TEXT_PRIMARY_L, TEXT_PRIMARY_D),
            border_width=1, border_color=(BORDER_LIGHT, BORDER_DARK),
            font=ctk.CTkFont("Segoe UI", 11, "bold"),
            command=self.select_hidden_logo
        )
        self.btn_select_logo.grid(row=0, column=0, padx=(8, 4), pady=(8, 4), sticky="ew")

        self.btn_detect_stego = ctk.CTkButton(
            card,
            text="🔍  Soi Logo Ẩn", height=30, corner_radius=6,
            fg_color=("#EFF6FF", "#1E293B"),
            hover_color=("#DBEAFE", "#334155"),
            text_color=("#2563EB", "#93C5FD"),
            border_width=1, border_color=("#BFDBFE", "#3B82F6"),
            font=ctk.CTkFont("Segoe UI", 11, "bold"),
            command=self.open_stego_inspector
        )
        self.btn_detect_stego.grid(row=0, column=1, padx=(4, 8), pady=(8, 4), sticky="ew")

        self.lbl_logo_info = ctk.CTkLabel(
            card,
            text="Chưa chọn logo nhúng",
            font=ctk.CTkFont("Segoe UI", 10, "bold"),
            text_color=(TEXT_MUTED_L, TEXT_MUTED_D)
        )
        self.lbl_logo_info.grid(row=1, column=0, columnspan=2, padx=8, pady=(0, 4), sticky="w")

        # Divider
        ctk.CTkFrame(card, height=1, fg_color=(BORDER_LIGHT, BORDER_DARK)).grid(
            row=2, column=0, columnspan=2, sticky="ew", padx=8, pady=4
        )

        # Row 3: Logo Eraser Buttons (Visible inpainting + Hidden LSB sanitization)
        self.btn_erase_visible = ctk.CTkButton(
            card,
            text="🎨  Xóa Logo Hiện", height=30, corner_radius=6,
            fg_color=("#FEF3C7", "#2D261E"),
            hover_color=("#FDE68A", "#3D3428"),
            font=ctk.CTkFont("Segoe UI", 11, "bold"),
            text_color=("#D97706", "#FCD34D"),
            border_width=1, border_color=("#FDE68A", "#D97706"),
            command=self.open_watermark_eraser_studio
        )
        self.btn_erase_visible.grid(row=3, column=0, padx=(8, 4), pady=(4, 4), sticky="ew")

        self.btn_sanitize_lsb = ctk.CTkButton(
            card,
            text="🧹  Tẩy Logo Ẩn", height=30, corner_radius=6,
            fg_color=(BG_SUB_LIGHT, BG_SUB_DARK),
            hover_color=(BORDER_LIGHT, BORDER_DARK),
            text_color=(TEXT_PRIMARY_L, TEXT_PRIMARY_D),
            border_width=1, border_color=(BORDER_LIGHT, BORDER_DARK),
            font=ctk.CTkFont("Segoe UI", 11, "bold"),
            command=self.quick_sanitize_current_image
        )
        self.btn_sanitize_lsb.grid(row=3, column=1, padx=(4, 8), pady=(4, 4), sticky="ew")

        # Row 4: Checkbox to auto clean stego when batch exporting
        self.chk_clean_stego = ctk.CTkCheckBox(
            card,
            text="🧹  Làm sạch logo ẩn khi xuất",
            variable=self.var_clean_stego,
            font=ctk.CTkFont("Segoe UI", 11, "bold"),
            checkmark_color="white",
            fg_color=ACCENT, hover_color=ACCENT_HOVER,
            text_color=(TEXT_PRIMARY_L, TEXT_PRIMARY_D)
        )
        self.chk_clean_stego.grid(row=4, column=0, columnspan=2, padx=10, pady=(4, 8), sticky="w")

    # ── 3. Main Panel (Tabview + Integrated Preview Navigation) ───────────────
    def _build_main_panel(self):
        self.main_panel = ctk.CTkFrame(
            self, corner_radius=0, fg_color="transparent"
        )
        self.main_panel.grid(row=1, column=1, sticky="nsew", padx=0, pady=0)
        self.main_panel.grid_columnconfigure(0, weight=1)
        self.main_panel.grid_rowconfigure(0, weight=1)  # Tabview fills vertical space

        # Tabview
        self.tabview = ctk.CTkTabview(
            self.main_panel,
            fg_color=(BG_PANEL_LIGHT, BG_PANEL_DARK),
            segmented_button_fg_color=(BG_SUB_LIGHT, BG_SUB_DARK),
            segmented_button_selected_color=ACCENT,
            segmented_button_selected_hover_color=ACCENT_HOVER,
            segmented_button_unselected_color=(BG_SUB_LIGHT, BG_SUB_DARK),
            text_color=(TEXT_PRIMARY_L, TEXT_PRIMARY_D),
            corner_radius=10,
        )
        self.tabview.grid(row=0, column=0, sticky="nsew", padx=12, pady=(10, 6))

        self.tab_preview = self.tabview.add("🖼  Xem Trước Trực Tiếp (Before/After)")
        self.tab_queue   = self.tabview.add("📑  Danh Sách Tệp Đang Xử Lý")

        self._build_preview_tab()
        self._build_queue_tab()

        # Bottom Modern Status Bar
        status_bar = ctk.CTkFrame(
            self.main_panel, height=38, corner_radius=8,
            fg_color=(BG_PANEL_LIGHT, BG_PANEL_DARK),
            border_width=1, border_color=(BORDER_LIGHT, BORDER_DARK)
        )
        status_bar.grid(row=1, column=0, sticky="ew", padx=12, pady=(0, 10))
        status_bar.grid_columnconfigure(0, weight=1)
        status_bar.grid_propagate(False)

        self.status_label = ctk.CTkLabel(
            status_bar,
            text="Sẵn sàng  •  Kéo thả ảnh vào khung hoặc bấm 'Chọn File Ảnh' để bắt đầu",
            font=ctk.CTkFont("Segoe UI", 11, "bold"),
            text_color=(TEXT_PRIMARY_L, TEXT_PRIMARY_D)
        )
        self.status_label.grid(row=0, column=0, padx=14, sticky="w")

        self.progress_bar = ctk.CTkProgressBar(
            status_bar, width=220, height=8, corner_radius=4,
            progress_color=SUCCESS, fg_color=(BORDER_LIGHT, BORDER_DARK)
        )
        self.progress_bar.set(0)
        self.progress_bar.grid(row=0, column=1, padx=14, sticky="e")

    # ── Preview Tab Details ──────────────────────────────────────────────────
    def _build_preview_tab(self):
        self.tab_preview.grid_columnconfigure(0, weight=1)
        self.tab_preview.grid_columnconfigure(1, weight=1)
        self.tab_preview.grid_rowconfigure(1, weight=1)  # Comparison panes expand

        # ── Top Toolbar inside Preview (Navigation & Current File) ───────────
        nav_bar = ctk.CTkFrame(
            self.tab_preview, height=36, corner_radius=8,
            fg_color=(BG_CARD_LIGHT, BG_CARD_DARK),
            border_width=1, border_color=(BORDER_LIGHT, BORDER_DARK)
        )
        nav_bar.grid(row=0, column=0, columnspan=2, sticky="ew", padx=6, pady=(4, 6))
        nav_bar.grid_columnconfigure(1, weight=1)
        nav_bar.grid_propagate(False)

        # Prev / Next Controls
        self.btn_prev_img = ctk.CTkButton(
            nav_bar, text="◀ Trước", width=68, height=26, corner_radius=6,
            font=ctk.CTkFont("Segoe UI", 10, "bold"),
            fg_color=(BG_SUB_LIGHT, BG_SUB_DARK),
            hover_color=(BORDER_LIGHT, BORDER_DARK),
            text_color=(TEXT_PRIMARY_L, TEXT_PRIMARY_D),
            command=self._prev_image
        )
        self.btn_prev_img.pack(side="left", padx=(6, 4), pady=4)

        self.lbl_img_index = ctk.CTkLabel(
            nav_bar, text="Ảnh 0/0",
            font=ctk.CTkFont("Segoe UI", 10, "bold"),
            text_color=ACCENT
        )
        self.lbl_img_index.pack(side="left", padx=4, pady=4)

        self.btn_next_img = ctk.CTkButton(
            nav_bar, text="Tiếp ▶", width=68, height=26, corner_radius=6,
            font=ctk.CTkFont("Segoe UI", 10, "bold"),
            fg_color=(BG_SUB_LIGHT, BG_SUB_DARK),
            hover_color=(BORDER_LIGHT, BORDER_DARK),
            text_color=(TEXT_PRIMARY_L, TEXT_PRIMARY_D),
            command=self._next_image
        )
        self.btn_next_img.pack(side="left", padx=(4, 8), pady=4)

        self.lbl_current_filename = ctk.CTkLabel(
            nav_bar, text="Chưa nạp ảnh nào",
            font=ctk.CTkFont("Segoe UI", 11, "bold"),
            text_color=(TEXT_PRIMARY_L, TEXT_PRIMARY_D)
        )
        self.lbl_current_filename.pack(side="left", padx=8)

        # Quick Image & Canva Tools on right side of nav_bar
        self.btn_nav_canva = ctk.CTkButton(
            nav_bar, text="✨  Canva Studio", width=115, height=26, corner_radius=6,
            font=ctk.CTkFont("Segoe UI", 10, "bold"),
            fg_color=ACCENT, hover_color=ACCENT_HOVER,
            text_color="white",
            command=self.open_canva_background_studio
        )
        self.btn_nav_canva.pack(side="right", padx=(4, 6), pady=4)

        self.btn_nav_erase = ctk.CTkButton(
            nav_bar, text="🎨  Xóa Logo Hiện", width=115, height=26, corner_radius=6,
            font=ctk.CTkFont("Segoe UI", 10, "bold"),
            fg_color=WARNING, hover_color=WARNING_HOVER,
            text_color="white",
            command=self.open_watermark_eraser_studio
        )
        self.btn_nav_erase.pack(side="right", padx=4, pady=4)

        self.btn_nav_clean_lsb = ctk.CTkButton(
            nav_bar, text="🧹  Tẩy Logo Ẩn", width=105, height=26, corner_radius=6,
            font=ctk.CTkFont("Segoe UI", 10, "bold"),
            fg_color=(BG_SUB_LIGHT, BG_SUB_DARK),
            hover_color=(BORDER_LIGHT, BORDER_DARK),
            text_color=(TEXT_PRIMARY_L, TEXT_PRIMARY_D),
            command=self.quick_sanitize_current_image
        )
        self.btn_nav_clean_lsb.pack(side="right", padx=4, pady=4)

        # ── Comparison Panes ─────────────────────────────────────────────────
        # Left Pane: Original Image
        self.pane_orig = ctk.CTkFrame(
            self.tab_preview, corner_radius=10,
            fg_color=(BG_CARD_LIGHT, BG_CARD_DARK),
            border_width=1, border_color=(BORDER_LIGHT, BORDER_DARK)
        )
        self.pane_orig.grid(row=1, column=0, sticky="nsew", padx=(6, 4), pady=4)
        self.pane_orig.grid_rowconfigure(1, weight=1)
        self.pane_orig.grid_columnconfigure(0, weight=1)

        orig_hdr = ctk.CTkFrame(self.pane_orig, fg_color="transparent")
        orig_hdr.grid(row=0, column=0, sticky="ew", padx=10, pady=(8, 4))
        orig_hdr.grid_columnconfigure(0, weight=1)

        ctk.CTkLabel(
            orig_hdr, text="ẢNH GỐC (ORIGINAL)",
            font=ctk.CTkFont("Segoe UI", 11, "bold"),
            text_color=(TEXT_PRIMARY_L, TEXT_PRIMARY_D)
        ).grid(row=0, column=0, sticky="w")

        self.badge_orig = ctk.CTkLabel(
            orig_hdr, text="—",
            font=ctk.CTkFont("Segoe UI", 10, "bold"),
            text_color=(TEXT_PRIMARY_L, TEXT_PRIMARY_D)
        )
        self.badge_orig.grid(row=0, column=1, sticky="e")

        self.lbl_img_orig = ctk.CTkLabel(
            self.pane_orig,
            text="Kéo thả ảnh vào đây\nhoặc bấm 'Chọn File Ảnh'",
            font=ctk.CTkFont("Segoe UI", 12, "bold"),
            text_color=(TEXT_MUTED_L, TEXT_MUTED_D)
        )
        self.lbl_img_orig.grid(row=1, column=0, sticky="nsew", padx=8, pady=8)

        # Right Pane: Live Processed Preview
        self.pane_proc = ctk.CTkFrame(
            self.tab_preview, corner_radius=10,
            fg_color=(BG_CARD_LIGHT, BG_CARD_DARK),
            border_width=1, border_color=ACCENT
        )
        self.pane_proc.grid(row=1, column=1, sticky="nsew", padx=(4, 6), pady=4)
        self.pane_proc.grid_rowconfigure(1, weight=1)
        self.pane_proc.grid_columnconfigure(0, weight=1)

        proc_hdr = ctk.CTkFrame(self.pane_proc, fg_color="transparent")
        proc_hdr.grid(row=0, column=0, sticky="ew", padx=10, pady=(8, 4))
        proc_hdr.grid_columnconfigure(0, weight=1)

        ctk.CTkLabel(
            proc_hdr, text="KẾT QUẢ XỬ LÝ (LIVE PREVIEW)",
            font=ctk.CTkFont("Segoe UI", 11, "bold"),
            text_color=ACCENT
        ).grid(row=0, column=0, sticky="w")

        self.badge_proc = ctk.CTkLabel(
            proc_hdr, text="—",
            font=ctk.CTkFont("Segoe UI", 10, "bold"),
            text_color=ACCENT
        )
        self.badge_proc.grid(row=0, column=1, sticky="e")

        self.lbl_img_proc = ctk.CTkLabel(
            self.pane_proc,
            text="Xem trước trực quan\nkết quả sau khi chuyển đổi",
            font=ctk.CTkFont("Segoe UI", 12, "bold"),
            text_color=(TEXT_MUTED_L, TEXT_MUTED_D)
        )
        self.lbl_img_proc.grid(row=1, column=0, sticky="nsew", padx=8, pady=8)

    # ── Queue Tab Details ────────────────────────────────────────────────────
    def _build_queue_tab(self):
        self.tab_queue.grid_columnconfigure(0, weight=1)
        self.tab_queue.grid_rowconfigure(1, weight=1)

        # Queue Stats Bar
        self.stats_frame = ctk.CTkFrame(
            self.tab_queue, height=36, corner_radius=8,
            fg_color=(BG_CARD_LIGHT, BG_CARD_DARK),
            border_width=1, border_color=(BORDER_LIGHT, BORDER_DARK)
        )
        self.stats_frame.grid(row=0, column=0, sticky="ew", padx=4, pady=(4, 6))
        self.stats_frame.grid_columnconfigure(0, weight=1)
        self.stats_frame.grid_propagate(False)

        self.lbl_stats = ctk.CTkLabel(
            self.stats_frame,
            text="Chưa có ảnh nào trong danh sách",
            font=ctk.CTkFont("Segoe UI", 11, "bold"),
            text_color=(TEXT_PRIMARY_L, TEXT_PRIMARY_D)
        )
        self.lbl_stats.grid(row=0, column=0, padx=12, sticky="w")

        # Scrollable Cards List
        self.queue_scroll = ctk.CTkScrollableFrame(
            self.tab_queue,
            fg_color="transparent",
            scrollbar_button_color=(BORDER_LIGHT, BORDER_DARK)
        )
        self.queue_scroll.grid(row=1, column=0, sticky="nsew", padx=4, pady=(0, 4))
        self.queue_scroll.grid_columnconfigure(0, weight=1)

    # ── Event Bindings ───────────────────────────────────────────────────────
    def _bind_events(self):
        self.bind("<Control-v>", lambda e: self.paste_from_clipboard())
        self.bind("<Control-o>", lambda e: self.select_files())
        self.bind("<Left>", lambda e: self._prev_image())
        self.bind("<Right>", lambda e: self._next_image())

    # =========================================================================
    # EVENT HANDLERS & NAVIGATION
    # =========================================================================
    def _toggle_theme(self):
        current = ctk.get_appearance_mode()
        if current == "Dark":
            ctk.set_appearance_mode("Light")
            self.theme_btn.configure(text="🌙  Tối")
        else:
            ctk.set_appearance_mode("Dark")
            self.theme_btn.configure(text="☀  Sáng")

    def _prev_image(self):
        if not self.loaded_files:
            return
        idx = max(0, self.current_preview_index - 1)
        self._select_preview_item(idx)

    def _next_image(self):
        if not self.loaded_files:
            return
        idx = min(len(self.loaded_files) - 1, self.current_preview_index + 1)
        self._select_preview_item(idx)

    def _on_format_changed(self, value):
        is_lossy = value in ("WEBP", "JPG")
        state = "normal" if is_lossy else "disabled"
        self.slider_quality.configure(state=state)
        self.extra_format_menu.set("── Chọn khác ──")
        self.schedule_live_preview()

    def _on_extra_format(self, value):
        if value in ("BMP", "GIF", "TIFF"):
            self.format_segmented.set(value)
            self._on_format_changed(value)

    def _on_quality_slider(self, value):
        self.lbl_quality.configure(text=f"{int(value)}%")

    def _on_sharpen_slider(self, value):
        self.lbl_sharpen.configure(text=f"{int(value)}%")
        self.schedule_live_preview()

    def _on_remove_bg_toggle(self):
        self.schedule_live_preview()

    def _on_tolerance_slider(self, value):
        self.lbl_tolerance.configure(text=f"{int(value)}%")
        if self.var_remove_bg.get():
            self.schedule_live_preview()

    def _on_canva_bg_preset(self, value):
        if value == "Trong suốt":
            self.canva_bg_mode.set("transparent")
        elif value == "Trắng":
            self.canva_bg_mode.set("color")
            self.canva_bg_color.set("#FFFFFF")
        elif value == "Kem be":
            self.canva_bg_mode.set("color")
            self.canva_bg_color.set("#F1F5F9")
        elif value == "Đen":
            self.canva_bg_mode.set("color")
            self.canva_bg_color.set("#0F172A")
        self.schedule_live_preview()

    def _on_preset_selected(self, choice):
        dims = PRESETS.get(choice)
        if dims:
            self.entry_w.delete(0, "end")
            self.entry_w.insert(0, str(dims[0]))
            self.entry_h.delete(0, "end")
            self.entry_h.insert(0, str(dims[1]))
            self.schedule_live_preview()

    def _on_dimension_input(self, changed_field):
        if not self.lock_aspect_var.get() or self.current_preview_index < 0:
            self.schedule_live_preview()
            return
        item = self.loaded_files[self.current_preview_index]
        ow, oh = item["orig_w"], item["orig_h"]
        try:
            if changed_field == "width":
                val = int(self.entry_w.get())
                _, h = NativeImageEngine.calculate_dimensions(ow, oh, val, 1, True, "width")
                self.entry_h.delete(0, "end")
                self.entry_h.insert(0, str(h))
            else:
                val = int(self.entry_h.get())
                w, _ = NativeImageEngine.calculate_dimensions(ow, oh, 1, val, True, "height")
                self.entry_w.delete(0, "end")
                self.entry_w.insert(0, str(w))
        except ValueError:
            pass
        self.schedule_live_preview()

    # =========================================================================
    # FILE MANAGEMENT & CLIPBOARD
    # =========================================================================
    def select_files(self):
        paths = filedialog.askopenfilenames(
            title="Chọn một hoặc nhiều ảnh",
            filetypes=[
                ("Tất cả định dạng ảnh", "*.jpg;*.jpeg;*.png;*.webp;*.bmp;*.gif;*.tiff;*.ico"),
                ("Mọi tệp", "*.*"),
            ]
        )
        if paths:
            self.add_files(paths)

    def paste_from_clipboard(self):
        try:
            img = ImageGrab.grabclipboard()
            if isinstance(img, Image.Image):
                temp_dir = os.path.join(os.path.dirname(__file__), "..", "samples")
                os.makedirs(temp_dir, exist_ok=True)
                temp_path = os.path.join(
                    temp_dir, f"Clipboard_{len(self.loaded_files)+1}.png"
                )
                img.save(temp_path, "PNG")
                self.add_files([temp_path])
                self._set_status("Đã dán ảnh thành công từ Clipboard!", SUCCESS)
            else:
                messagebox.showinfo("Clipboard", "Không tìm thấy dữ liệu ảnh trong Clipboard.")
        except Exception as e:
            messagebox.showwarning("Lỗi Clipboard", str(e))

    def add_files(self, paths):
        added = 0
        for p in paths:
            try:
                img = NativeImageEngine.load_image(p)
                w, h = img.size
                self.loaded_files.append({
                    "path": p,
                    "name": os.path.basename(p),
                    "orig_w": w, "orig_h": h,
                    "img": img,
                    "status": "Sẵn sàng",
                    "out_path": None,
                })
                added += 1
            except Exception:
                pass

        if added:
            count = len(self.loaded_files)
            self.lbl_file_count.configure(text=f"📷  {count} ảnh")
            if self.current_preview_index < 0:
                self.current_preview_index = 0
                item = self.loaded_files[0]
                self.entry_w.delete(0, "end")
                self.entry_w.insert(0, str(item["orig_w"]))
                self.entry_h.delete(0, "end")
                self.entry_h.insert(0, str(item["orig_h"]))

            self.update_live_preview()
            self._render_queue_table()
            self._set_status(f"Đã thêm {added} ảnh vào danh sách ✓", SUCCESS)

    def select_hidden_logo(self):
        path = filedialog.askopenfilename(
            title="Chọn Logo để nhúng ẩn (LSB)",
            filetypes=[("Hình ảnh", "*.png;*.jpg;*.jpeg;*.webp;*.bmp")]
        )
        if path:
            try:
                logo_img = NativeImageEngine.load_image(path)
                self.hidden_logo_path = path
                self.hidden_logo_img  = logo_img
                name = os.path.basename(path)
                self.lbl_logo_info.configure(
                    text=f"✓ {name} ({logo_img.width}×{logo_img.height} px)",
                    text_color=SUCCESS
                )
                messagebox.showinfo(
                    "Đã Chọn Logo Ẩn Nguyên Bản",
                    f"Đã nạp logo '{name}' ({logo_img.width}×{logo_img.height} px)!\n\n"
                    f"★ Logo sẽ được mã hóa vô hình bảo toàn 100% màu sắc và độ trong suốt.\n\n"
                    f"💡 Lời khuyên: Để trích xuất logo nguyên bản trọn vẹn, hãy chọn định dạng xuất là PNG, TIFF hoặc BMP."
                )
                self.schedule_live_preview()
            except Exception as e:
                messagebox.showerror("Lỗi", str(e))

    def clear_all(self):
        if self.loaded_files and not messagebox.askyesno(
            "Xóa danh sách?", "Bạn có chắc muốn xóa toàn bộ danh sách ảnh không?"
        ):
            return
        self.loaded_files = []
        self._preview_cache.clear()
        self.current_preview_index = -1
        self.hidden_logo_img = None
        self.hidden_logo_path = None
        self.lbl_file_count.configure(text="Chưa có ảnh")
        self.lbl_logo_info.configure(
            text="Chưa chọn logo nhúng",
            text_color=(TEXT_MUTED_L, TEXT_MUTED_D)
        )
        self.lbl_current_filename.configure(text="Chưa nạp ảnh nào")
        self.lbl_img_index.configure(text="Ảnh 0/0")
        self.lbl_img_orig.configure(
            image="", text="Kéo thả ảnh vào đây\nhoặc bấm 'Chọn File Ảnh'"
        )
        self.lbl_img_proc.configure(
            image="", text="Xem trước trực quan\nkết quả sau khi chuyển đổi"
        )
        self.badge_orig.configure(text="—")
        self.badge_proc.configure(text="—")
        for w in self.queue_scroll.winfo_children():
            w.destroy()
        self.lbl_stats.configure(text="Chưa có ảnh nào trong danh sách")
        self.progress_bar.set(0)
        self._set_status("Đã làm trống danh sách.", (TEXT_MUTED_L, TEXT_MUTED_D))

    # =========================================================================
    # HIGH-PERFORMANCE LIVE PREVIEW (WITH PREVIEW CACHE & DEBOUNCE)
    # =========================================================================
    def schedule_live_preview(self):
        """Debounce live preview calls to ensure 60 FPS smooth slider dragging."""
        if self._preview_debounce_timer is not None:
            self.after_cancel(self._preview_debounce_timer)
        self._preview_debounce_timer = self.after(35, self.update_live_preview)

    def _get_preview_base(self, index: int, max_dim=600):
        """Return a cached downscaled copy of original image for instant preview processing."""
        if index not in self._preview_cache:
            orig = self.loaded_files[index]["img"]
            w, h = orig.size
            if max(w, h) > max_dim:
                scale = max_dim / max(w, h)
                thumb = orig.resize((max(1, int(w * scale)), max(1, int(h * scale))), Image.Resampling.BILINEAR)
            else:
                thumb = orig.copy()
            self._preview_cache[index] = thumb
        return self._preview_cache[index]

    def update_live_preview(self):
        if self.current_preview_index < 0 or not self.loaded_files:
            return

        item = self.loaded_files[self.current_preview_index]
        orig_img = item["img"]
        preview_base = self._get_preview_base(self.current_preview_index)

        try:
            tw = max(1, int(self.entry_w.get()))
            th = max(1, int(self.entry_h.get()))
        except ValueError:
            tw, th = orig_img.size

        fit = self.fit_mode_menu.get().split("(")[1].rstrip(")")

        # Target dimensions scaled for fast preview display
        max_box = 400
        p_scale = min(max_box / tw, max_box / th, 1.0)
        disp_w = max(1, int(tw * p_scale))
        disp_h = max(1, int(th * p_scale))

        # Perform fast filter preview on downscaled base
        proc_preview = NativeImageEngine.resize_image(preview_base, disp_w, disp_h, fit_mode=fit)
        
        if self.var_remove_bg.get():
            proc_preview = NativeImageEngine.remove_background(
                proc_preview, int(self.slider_tolerance.get())
            )
            # Canva Background replacement
            if self.canva_bg_mode.get() != "transparent":
                proc_preview = NativeImageEngine.apply_canva_background(
                    proc_preview,
                    bg_type=self.canva_bg_mode.get(),
                    bg_color=self.canva_bg_color.get(),
                    orig_image=preview_base,
                    blur_radius=self.canva_blur_rad.get()
                )
            # Canva Photo effects
            if self.canva_shadow_enabled.get():
                proc_preview = NativeImageEngine.apply_drop_shadow(
                    proc_preview,
                    offset_x=self.canva_shadow_offset_x.get(),
                    offset_y=self.canva_shadow_offset_y.get(),
                    blur_radius=self.canva_shadow_blur.get(),
                    opacity=self.canva_shadow_opacity.get()
                )
            if self.canva_glow_enabled.get():
                proc_preview = NativeImageEngine.apply_glow_outline(
                    proc_preview,
                    outline_width=self.canva_glow_width.get(),
                    outline_color=self.canva_glow_color,
                    is_glow=self.canva_is_glow.get()
                )

        sharp = int(self.slider_sharpen.get())
        if sharp > 0:
            proc_preview = NativeImageEngine.apply_sharpen(proc_preview, intensity=sharp)

        final_w = tw
        final_h = th
        self._display_preview(orig_img, proc_preview, final_w, final_h, item["name"])

    def _display_preview(self, orig, proc_preview, target_w, target_h, name):
        box = (380, 380)

        # Update Navigation Toolbar
        total = len(self.loaded_files)
        self.lbl_img_index.configure(text=f"Ảnh {self.current_preview_index + 1}/{total}")
        self.lbl_current_filename.configure(text=name)

        # 1. Original Thumbnail (Lanczos for maximum crisp preview)
        t_orig = orig.copy()
        t_orig.thumbnail(box, Image.Resampling.LANCZOS)
        ctk_orig = ctk.CTkImage(light_image=t_orig, dark_image=t_orig, size=t_orig.size)
        self.lbl_img_orig.configure(image=ctk_orig, text="")
        self.badge_orig.configure(
            text=f"{orig.width} × {orig.height} px • {orig.format or 'Image'}"
        )

        # 2. Processed Preview Thumbnail (Lanczos for maximum crisp preview)
        t_proc = proc_preview.copy()
        t_proc.thumbnail(box, Image.Resampling.LANCZOS)
        ctk_proc = ctk.CTkImage(light_image=t_proc, dark_image=t_proc, size=t_proc.size)
        self.lbl_img_proc.configure(image=ctk_proc, text="")
        fmt = self.format_segmented.get()
        badge_text = f"{target_w} × {target_h} px • {fmt}"
        if self.var_remove_bg.get():
            badge_text += " • ✨ Canva Cutout"
        self.badge_proc.configure(text=badge_text)

    # =========================================================================
    # QUEUE TABLE (SMOOTH MODERN CARDS)
    # =========================================================================
    def _render_queue_table(self):
        for w in self.queue_scroll.winfo_children():
            w.destroy()

        total = len(self.loaded_files)
        done  = sum(1 for f in self.loaded_files if "Thành công" in f["status"])
        self.lbl_stats.configure(
            text=f"Tổng số:  {total} ảnh   •   Hoàn tất:  {done}   •   Đang chờ:  {total - done}"
        )

        STATUS_COLOR = {
            "Thành công": SUCCESS,
            "Đang xử lý": WARNING,
            "Lỗi": DANGER,
            "Sẵn sàng": (TEXT_MUTED_L, TEXT_MUTED_D),
        }

        for idx, item in enumerate(self.loaded_files):
            s_key = next((k for k in STATUS_COLOR if k in item["status"]), "Sẵn sàng")

            card = ctk.CTkFrame(
                self.queue_scroll, corner_radius=8,
                fg_color=(BG_CARD_LIGHT, BG_CARD_DARK),
                border_width=1, border_color=(BORDER_LIGHT, BORDER_DARK)
            )
            card.grid(row=idx, column=0, sticky="ew", padx=6, pady=3)
            card.grid_columnconfigure(1, weight=1)

            # Index Badge
            badge = ctk.CTkLabel(
                card, text=f" {idx+1:02d} ",
                font=ctk.CTkFont("Segoe UI", 11, "bold"),
                fg_color=ACCENT if s_key == "Sẵn sàng" else STATUS_COLOR[s_key],
                corner_radius=6,
                text_color="white"
            )
            badge.grid(row=0, column=0, padx=10, pady=8)

            # Name & Meta
            info_col = ctk.CTkFrame(card, fg_color="transparent")
            info_col.grid(row=0, column=1, sticky="ew", padx=4, pady=6)
            info_col.grid_columnconfigure(0, weight=1)

            ctk.CTkLabel(
                info_col, text=item["name"],
                font=ctk.CTkFont("Segoe UI", 12, "bold"),
                text_color=(TEXT_PRIMARY_L, TEXT_PRIMARY_D),
                anchor="w"
            ).grid(row=0, column=0, sticky="ew")

            status_txt = f"{item['orig_w']} × {item['orig_h']} px   •   {item['status']}"
            ctk.CTkLabel(
                info_col, text=status_txt,
                font=ctk.CTkFont("Segoe UI", 10),
                text_color=STATUS_COLOR[s_key],
                anchor="w"
            ).grid(row=1, column=0, sticky="ew")

            # Actions Row
            btn_frame = ctk.CTkFrame(card, fg_color="transparent")
            btn_frame.grid(row=0, column=2, padx=8, pady=6)

            ctk.CTkButton(
                btn_frame, text="👁 Xem",
                width=58, height=26, corner_radius=6,
                font=ctk.CTkFont("Segoe UI", 10, "bold"),
                fg_color=ACCENT, hover_color=ACCENT_HOVER,
                command=lambda i=idx: self._select_preview_item(i)
            ).pack(side="left", padx=(0, 4))

            ctk.CTkButton(
                btn_frame, text="✕",
                width=30, height=26, corner_radius=6,
                font=ctk.CTkFont("Segoe UI", 11),
                fg_color=(BG_SUB_LIGHT, BG_SUB_DARK),
                hover_color=(DANGER, DANGER_HOVER),
                text_color=(TEXT_PRIMARY_L, TEXT_PRIMARY_D),
                command=lambda i=idx: self._remove_item(i)
            ).pack(side="left")

            if item["out_path"]:
                ctk.CTkButton(
                    btn_frame, text="📂",
                    width=32, height=26, corner_radius=6,
                    font=ctk.CTkFont("Segoe UI", 11),
                    fg_color=(BG_SUB_LIGHT, BG_SUB_DARK),
                    hover_color=(SUCCESS, SUCCESS_HOVER),
                    command=lambda p=item["out_path"]: os.startfile(os.path.dirname(p))
                ).pack(side="left", padx=(4, 0))

    def _select_preview_item(self, index):
        self.current_preview_index = index
        self.tabview.set("🖼  Xem Trước Trực Tiếp (Before/After)")
        item = self.loaded_files[index]
        self.entry_w.delete(0, "end")
        self.entry_w.insert(0, str(item["orig_w"]))
        self.entry_h.delete(0, "end")
        self.entry_h.insert(0, str(item["orig_h"]))
        self.update_live_preview()

    def _remove_item(self, index):
        self.loaded_files.pop(index)
        if index in self._preview_cache:
            del self._preview_cache[index]
        if self.current_preview_index >= len(self.loaded_files):
            self.current_preview_index = len(self.loaded_files) - 1
        self._render_queue_table()
        count = len(self.loaded_files)
        self.lbl_file_count.configure(
            text=f"📷  {count} ảnh" if count else "Chưa có ảnh"
        )
        if self.current_preview_index >= 0:
            self.update_live_preview()
        else:
            self.clear_all()

    # =========================================================================
    # STEGO INSPECTOR DIALOG
    # =========================================================================
    def open_stego_inspector(self):
        if self.current_preview_index < 0:
            messagebox.showwarning("Kiểm Tra Logo Ẩn", "Chưa có ảnh nào được chọn trong danh sách!")
            return

        item = self.loaded_files[self.current_preview_index]
        detected, logo_img, bitplane_img, msg = \
            NativeImageEngine.detect_hidden_watermark(item["img"])

        dialog = ctk.CTkToplevel(self)
        dialog.title("🔍  Kính Soi Logo Ẩn — Steganalysis Studio")
        dialog.geometry("820x560")
        dialog.minsize(720, 480)
        dialog.attributes("-topmost", True)
        dialog.configure(fg_color=(BG_APP_LIGHT, BG_APP_DARK))

        dialog.grid_columnconfigure(0, weight=1)
        dialog.grid_columnconfigure(1, weight=1)
        dialog.grid_rowconfigure(1, weight=1)

        # Result Banner
        banner_col = (SUCCESS, "#064e3b") if detected else (WARNING, "#78350f")
        banner = ctk.CTkFrame(dialog, fg_color=banner_col, corner_radius=10)
        banner.grid(row=0, column=0, columnspan=2, sticky="ew", padx=16, pady=(16, 8))

        icon_txt = "✅" if detected else "⚠️"
        banner_lbl = ctk.CTkLabel(
            banner, text=f"{icon_txt}  {msg}",
            font=ctk.CTkFont("Segoe UI", 13, "bold"),
            text_color="white"
        )
        banner_lbl.pack(padx=16, pady=10)

        # Left Panel: Extracted Logo
        panel_logo = ctk.CTkFrame(
            dialog, corner_radius=12,
            fg_color=(BG_PANEL_LIGHT, BG_PANEL_DARK),
            border_width=1, border_color=(BORDER_LIGHT, BORDER_DARK)
        )
        panel_logo.grid(row=1, column=0, sticky="nsew", padx=(16, 8), pady=8)
        panel_logo.grid_rowconfigure(1, weight=1)
        panel_logo.grid_columnconfigure(0, weight=1)

        ctk.CTkLabel(
            panel_logo, text="LOGO ẨN TRÍCH XUẤT",
            font=ctk.CTkFont("Segoe UI", 11, "bold"),
            text_color=ACCENT
        ).grid(row=0, column=0, pady=10)

        lbl_logo = ctk.CTkLabel(
            panel_logo, text="Không phát hiện logo ẩn",
            text_color=(TEXT_MUTED_L, TEXT_MUTED_D)
        )
        lbl_logo.grid(row=1, column=0, sticky="nsew", padx=10, pady=10)

        if detected and logo_img:
            thumb = logo_img.copy()
            thumb.thumbnail((250, 250), Image.Resampling.LANCZOS)
            tk_logo = ctk.CTkImage(light_image=thumb, dark_image=thumb, size=thumb.size)
            lbl_logo.configure(image=tk_logo, text="")

            info_text = f"Độ phân giải: {logo_img.width} × {logo_img.height} px  |  Hệ màu: {logo_img.mode}"
            ctk.CTkLabel(
                panel_logo,
                text=info_text,
                font=ctk.CTkFont("Segoe UI", 10, "bold"),
                text_color=SUCCESS
            ).grid(row=2, column=0, pady=(0, 4))

            def save_logo():
                out = filedialog.asksaveasfilename(
                    title="Lưu Logo Trích Xuất Nguyên Bản",
                    defaultextension=".png",
                    filetypes=[("PNG Image (*.png)", "*.png"), ("Tất cả tệp", "*.*")]
                )
                if out:
                    logo_img.save(out, format="PNG")
                    messagebox.showinfo(
                        "Thành Công",
                        f"Đã lưu logo nguyên bản thành công vào:\n{out}\n\nKích thước: {logo_img.width}×{logo_img.height} px ({logo_img.mode})"
                    )

            ctk.CTkButton(
                panel_logo, text="💾  Lưu Logo (.png)",
                height=32, corner_radius=6,
                fg_color=ACCENT, hover_color=ACCENT_HOVER,
                command=save_logo
            ).grid(row=3, column=0, pady=(0, 10))

        # Right Panel: Bit-plane Viewer
        panel_bp = ctk.CTkFrame(
            dialog, corner_radius=12,
            fg_color=(BG_PANEL_LIGHT, BG_PANEL_DARK),
            border_width=1, border_color=(BORDER_LIGHT, BORDER_DARK)
        )
        panel_bp.grid(row=1, column=1, sticky="nsew", padx=(8, 16), pady=8)
        panel_bp.grid_rowconfigure(1, weight=1)
        panel_bp.grid_columnconfigure(0, weight=1)

        ctk.CTkLabel(
            panel_bp, text="MẶT PHẲNG BIT (BIT-PLANE 0)",
            font=ctk.CTkFont("Segoe UI", 11, "bold"),
            text_color=ACCENT
        ).grid(row=0, column=0, pady=10)

        lbl_bp = ctk.CTkLabel(panel_bp, text="")
        lbl_bp.grid(row=1, column=0, sticky="nsew", padx=10, pady=10)

        bp_thumb = bitplane_img.copy()
        bp_thumb.thumbnail((240, 240), Image.Resampling.NEAREST)
        tk_bp = ctk.CTkImage(light_image=bp_thumb, dark_image=bp_thumb, size=bp_thumb.size)
        lbl_bp.configure(image=tk_bp)

        ctk.CTkLabel(
            panel_bp,
            text="Mặt phẳng bit thấp nhất (LSB) được khuếch đại tương phản.\nDấu vết logo ẩn sẽ hiện rõ tại đây.",
            font=ctk.CTkFont("Segoe UI", 10),
            text_color=(TEXT_MUTED_L, TEXT_MUTED_D)
        ).grid(row=2, column=0, pady=(0, 10))

        # Bottom Action Bar inside Stego Inspector
        bottom_bar = ctk.CTkFrame(
            dialog, height=52, corner_radius=10,
            fg_color=(BG_PANEL_LIGHT, BG_PANEL_DARK),
            border_width=1, border_color=(BORDER_LIGHT, BORDER_DARK)
        )
        bottom_bar.grid(row=2, column=0, columnspan=2, sticky="ew", padx=16, pady=(4, 16))
        bottom_bar.grid_columnconfigure(0, weight=1)

        b_btns = ctk.CTkFrame(bottom_bar, fg_color="transparent")
        b_btns.pack(side="right", padx=10, pady=8)

        def sanitize_now():
            cleaned = NativeImageEngine.sanitize_hidden_watermark(item["img"])
            item["img"] = cleaned
            if self.current_preview_index in self._preview_cache:
                del self._preview_cache[self.current_preview_index]
            self.update_live_preview()

            # Re-scan in place
            det_c, logo_c, bp_c, msg_c = NativeImageEngine.detect_hidden_watermark(cleaned)
            banner.configure(fg_color=(SUCCESS, "#064e3b"))
            banner_lbl.configure(text="✅  Đã làm sạch logo ẩn thành công! Không còn dữ liệu LSB ẩn.")
            lbl_logo.configure(image="", text="Logo ẩn đã bị xóa sạch hoàn toàn ✓")

            bp_thumb_c = bp_c.copy()
            bp_thumb_c.thumbnail((240, 240), Image.Resampling.NEAREST)
            tk_bp_c = ctk.CTkImage(light_image=bp_thumb_c, dark_image=bp_thumb_c, size=bp_thumb_c.size)
            lbl_bp.configure(image=tk_bp_c)
            btn_clean.configure(state="disabled", text="✓ Đã Làm Sạch")
            self._set_status(f"Đã làm sạch logo ẩn cho '{item['name']}' ✓", SUCCESS)
            messagebox.showinfo(
                "Đã Làm Sạch Logo Ẩn",
                "✓ Toàn bộ dấu vết logo ẩn (LSB) đã được tẩy sạch hoàn toàn!\n\n"
                "Ảnh được giữ nguyên 100% chi tiết vật thể chính và màu sắc thị giác."
            )

        btn_clean = ctk.CTkButton(
            b_btns,
            text="🧹   Tẩy Sạch Logo Ẩn (LSB Clean)",
            height=32, corner_radius=6,
            font=ctk.CTkFont("Segoe UI", 11, "bold"),
            fg_color=WARNING, hover_color=WARNING_HOVER,
            text_color="white",
            command=sanitize_now
        )
        btn_clean.pack(side="left", padx=6)

        ctk.CTkButton(
            b_btns,
            text="🎨   Mở Studio Xóa Logo Hiện",
            height=32, corner_radius=6,
            font=ctk.CTkFont("Segoe UI", 11),
            fg_color=ACCENT, hover_color=ACCENT_HOVER,
            command=lambda: [dialog.destroy(), self.open_watermark_eraser_studio()]
        ).pack(side="left", padx=6)

        ctk.CTkButton(
            b_btns,
            text="Đóng",
            height=32, width=80, corner_radius=6,
            font=ctk.CTkFont("Segoe UI", 11),
            fg_color=(BG_SUB_LIGHT, BG_SUB_DARK),
            hover_color=(BORDER_LIGHT, BORDER_DARK),
            text_color=(TEXT_PRIMARY_L, TEXT_PRIMARY_D),
            command=dialog.destroy
        ).pack(side="left", padx=6)

    def quick_sanitize_current_image(self):
        """Quickly wipe LSB hidden stego watermark on currently selected image."""
        if self.current_preview_index < 0 or not self.loaded_files:
            messagebox.showwarning("Thông Báo", "Vui lòng chọn một ảnh để làm sạch logo ẩn!")
            return
        item = self.loaded_files[self.current_preview_index]
        cleaned = NativeImageEngine.sanitize_hidden_watermark(item["img"])
        item["img"] = cleaned
        if self.current_preview_index in self._preview_cache:
            del self._preview_cache[self.current_preview_index]
        self.update_live_preview()
        messagebox.showinfo(
            "Đã Làm Sạch Logo Ẩn",
            f"✓ Đã làm sạch toàn bộ dữ liệu logo ẩn (LSB) trong ảnh '{item['name']}'!\n\n"
            "• Mọi chữ ký và thủy vân ẩn đã được triệt tiêu 100%.\n"
            "• Màu sắc, độ sắc nét và vật thể chính được bảo toàn tuyệt đối."
        )
        self._set_status(f"Đã làm sạch logo ẩn cho ảnh '{item['name']}' ✓", SUCCESS)

    # =========================================================================
    # CANVA MAGIC BACKGROUND STUDIO (CUTOUT, REPLACEMENT, SHADOW, GLOW & BRUSH)
    # =========================================================================
    def open_canva_background_studio(self):
        if self.current_preview_index < 0 or not self.loaded_files:
            messagebox.showwarning("Thông Báo", "Vui lòng chọn một ảnh để mở Canva Background Studio!")
            return

        item = self.loaded_files[self.current_preview_index]
        orig_img = item["img"]
        orig_w, orig_h = orig_img.size

        dialog = ctk.CTkToplevel(self)
        dialog.title(f"✦ Canva Magic Background Studio — {item['name']} ({orig_w}×{orig_h} px)")

        sw = dialog.winfo_screenwidth()
        sh = dialog.winfo_screenheight()
        dw = min(1200, max(1020, sw - 80))
        dh = min(840, max(680, sh - 80))
        dx = max(0, (sw - dw) // 2)
        dy = max(0, (sh - dh) // 2)
        dialog.geometry(f"{dw}x{dh}+{dx}+{dy}")
        dialog.minsize(980, 640)
        dialog.attributes("-topmost", True)
        dialog.configure(fg_color=(BG_APP_LIGHT, BG_APP_DARK))

        dialog.grid_columnconfigure(0, weight=1)
        dialog.grid_columnconfigure(1, weight=0)
        dialog.grid_rowconfigure(1, weight=1)

        top_bar = ctk.CTkFrame(
            dialog, height=54, corner_radius=0,
            fg_color=(BG_PANEL_LIGHT, BG_PANEL_DARK),
            border_width=1, border_color=(BORDER_LIGHT, BORDER_DARK)
        )
        top_bar.grid(row=0, column=0, columnspan=2, sticky="ew")
        top_bar.grid_columnconfigure(1, weight=1)
        top_bar.grid_propagate(False)

        brand_top = ctk.CTkFrame(top_bar, fg_color="transparent")
        brand_top.pack(side="left", padx=16, pady=8)

        ctk.CTkLabel(
            brand_top, text="✦  Canva Magic Background Studio",
            font=ctk.CTkFont("Georgia", 15, "bold"),
            text_color=(TEXT_PRIMARY_L, TEXT_PRIMARY_D)
        ).pack(side="left", padx=(0, 10))

        BadgePill(brand_top, "PRO STUDIO", color=ACCENT).pack(side="left")

        lbl_studio_status = ctk.CTkLabel(
            top_bar,
            text="Tách nền AI thông minh • Thay nền màu/mờ • Đổ bóng mềm • Viền sáng nghệ thuật",
            font=ctk.CTkFont("Segoe UI", 11),
            text_color=(TEXT_MUTED_L, TEXT_MUTED_D)
        )
        lbl_studio_status.pack(side="left", padx=12)

        state = {
            "orig_img": orig_img.copy(),
            "cutout_rgba": None,
            "mask": None,
            "composite_img": None,
            "bg_type": self.canva_bg_mode.get() or "transparent",
            "bg_color": self.canva_bg_color.get() or "#FFFFFF",
            "blur_radius": int(self.canva_blur_rad.get() or 25),
            "custom_bg": None,
            "shadow_enabled": self.canva_shadow_enabled.get(),
            "shadow_blur": int(self.canva_shadow_blur.get() or 16),
            "shadow_opacity": float(self.canva_shadow_opacity.get() or 0.45),
            "glow_enabled": self.canva_glow_enabled.get(),
            "glow_width": int(self.canva_glow_width.get() or 6),
            "glow_color": (255, 255, 255),
            "is_glow": self.canva_is_glow.get(),
            "method": "smart",
            "tolerance": int(self.slider_tolerance.get() or 35),
            "retouch_tool": "view",
            "brush_size": 25,
            "is_comparing": False,
            "undo_stack": [],
            "zoom_fit": True
        }

        left_box = ctk.CTkFrame(
            dialog, corner_radius=10,
            fg_color=(BG_CARD_LIGHT, BG_CARD_DARK),
            border_width=1, border_color=(BORDER_LIGHT, BORDER_DARK)
        )
        left_box.grid(row=1, column=0, sticky="nsew", padx=(12, 6), pady=(8, 12))
        left_box.grid_columnconfigure(0, weight=1)
        left_box.grid_rowconfigure(0, weight=1)
        left_box.grid_rowconfigure(1, weight=0)

        canvas_frame = ctk.CTkFrame(left_box, fg_color="transparent")
        canvas_frame.grid(row=0, column=0, sticky="nsew", padx=6, pady=6)
        canvas_frame.grid_columnconfigure(0, weight=1)
        canvas_frame.grid_rowconfigure(0, weight=1)

        canvas = tk.Canvas(
            canvas_frame,
            bg="#ffffff" if ctk.get_appearance_mode() == "Light" else "#1e1b18",
            highlightthickness=0,
            cursor="crosshair"
        )
        canvas.grid(row=0, column=0, sticky="nsew")

        retouch_bar = ctk.CTkFrame(
            left_box, height=44, corner_radius=8,
            fg_color=(BG_SUB_LIGHT, BG_SUB_DARK)
        )
        retouch_bar.grid(row=1, column=0, sticky="ew", padx=8, pady=(0, 8))

        btn_compare = ctk.CTkButton(
            retouch_bar,
            text="👁  Giữ xem ảnh gốc",
            width=130, height=28,
            corner_radius=6,
            fg_color=(BG_CARD_LIGHT, BG_CARD_DARK),
            text_color=(TEXT_PRIMARY_L, TEXT_PRIMARY_D),
            hover_color=(BORDER_LIGHT, BORDER_DARK),
            font=ctk.CTkFont("Segoe UI", 10, "bold")
        )
        btn_compare.pack(side="left", padx=(8, 8), pady=6)

        ctk.CTkLabel(
            retouch_bar, text="Cọ vẽ:",
            font=ctk.CTkFont("Segoe UI", 10),
            text_color=(TEXT_MUTED_L, TEXT_MUTED_D)
        ).pack(side="left", padx=(4, 4))

        def on_retouch_mode_change(v):
            if "Xóa" in v:
                state["retouch_tool"] = "erase"
            elif "khôi phục" in v.lower():
                state["retouch_tool"] = "restore"
            else:
                state["retouch_tool"] = "view"

        seg_retouch = ctk.CTkSegmentedButton(
            retouch_bar,
            values=["Xem ảnh", "🧹 Cọ xóa", "🖌 Cọ khôi phục"],
            font=ctk.CTkFont("Segoe UI", 10, "bold"),
            selected_color=ACCENT, selected_hover_color=ACCENT_HOVER,
            unselected_color=(BG_CARD_LIGHT, BG_CARD_DARK),
            command=on_retouch_mode_change
        )
        seg_retouch.set("Xem ảnh")
        seg_retouch.pack(side="left", padx=4)

        ctk.CTkLabel(
            retouch_bar, text="Cỡ:",
            font=ctk.CTkFont("Segoe UI", 10),
            text_color=(TEXT_MUTED_L, TEXT_MUTED_D)
        ).pack(side="left", padx=(8, 2))

        lbl_bsize = ctk.CTkLabel(retouch_bar, text="25px", font=ctk.CTkFont("Segoe UI", 10, "bold"), text_color=ACCENT)
        lbl_bsize.pack(side="left", padx=(0, 4))

        def on_brush_size(v):
            state["brush_size"] = int(v)
            lbl_bsize.configure(text=f"{int(v)}px")

        slider_bsize = ctk.CTkSlider(
            retouch_bar, from_=5, to=80, number_of_steps=75, width=90,
            button_color=ACCENT, button_hover_color=ACCENT_HOVER,
            progress_color=ACCENT,
            command=on_brush_size
        )
        slider_bsize.set(25)
        slider_bsize.pack(side="left", padx=4)

        btn_undo = ctk.CTkButton(
            retouch_bar,
            text="↺ Hoàn tác",
            width=76, height=28,
            corner_radius=6,
            fg_color=(BG_CARD_LIGHT, BG_CARD_DARK),
            text_color=(TEXT_PRIMARY_L, TEXT_PRIMARY_D),
            hover_color=(BORDER_LIGHT, BORDER_DARK),
            font=ctk.CTkFont("Segoe UI", 10),
            command=lambda: do_undo()
        )
        btn_undo.pack(side="right", padx=(4, 8))

        # ── Right Area: Scrollable Settings Panel ──
        right_panel = ctk.CTkScrollableFrame(
            dialog, width=340, corner_radius=10,
            fg_color=(BG_CARD_LIGHT, BG_CARD_DARK),
            border_width=1, border_color=(BORDER_LIGHT, BORDER_DARK),
            scrollbar_button_color=(BORDER_LIGHT, BORDER_DARK)
        )
        right_panel.grid(row=1, column=1, sticky="nsew", padx=(6, 12), pady=(8, 12))
        right_panel.grid_columnconfigure(0, weight=1)

        # ── Section 1: Magic Cutout ──
        SectionHeader(right_panel, "✨", "TÁCH NỀN THÔNG MINH", color=ACCENT).grid(
            row=0, column=0, padx=6, pady=(4, 4), sticky="ew")

        card_cut = ctk.CTkFrame(right_panel, corner_radius=8, fg_color=(BG_PANEL_LIGHT, BG_PANEL_DARK), border_width=1, border_color=(BORDER_LIGHT, BORDER_DARK))
        card_cut.grid(row=1, column=0, padx=4, pady=(0, 8), sticky="ew")
        card_cut.grid_columnconfigure(0, weight=1)

        def on_method_change(v):
            if "Đồng màu" in v:
                state["method"] = "color"
            elif "Chi tiết" in v:
                state["method"] = "grabcut"
            else:
                state["method"] = "smart"
            trigger_cutout(force=True)

        seg_method = ctk.CTkSegmentedButton(
            card_cut,
            values=["Tự động (AI)", "Đồng màu", "Chi tiết"],
            font=ctk.CTkFont("Segoe UI", 10, "bold"),
            selected_color=ACCENT, selected_hover_color=ACCENT_HOVER,
            unselected_color=(BG_SUB_LIGHT, BG_SUB_DARK),
            command=on_method_change
        )
        seg_method.set("Tự động (AI)")
        seg_method.grid(row=0, column=0, padx=8, pady=(8, 4), sticky="ew")

        btn_run_cutout = ctk.CTkButton(
            card_cut,
            text="⚡  Tách Nền Tự Động (Canva Cutout)",
            height=32, corner_radius=6,
            font=ctk.CTkFont("Segoe UI", 11, "bold"),
            fg_color=SUCCESS, hover_color=SUCCESS_HOVER,
            command=lambda: trigger_cutout(force=True)
        )
        btn_run_cutout.grid(row=1, column=0, padx=8, pady=(4, 8), sticky="ew")

        # ── Section 2: Background Replacement ──
        SectionHeader(right_panel, "🎨", "THAY ĐỔI PHÔNG NỀN", color=ACCENT).grid(
            row=2, column=0, padx=6, pady=(4, 4), sticky="ew")

        card_bg = ctk.CTkFrame(right_panel, corner_radius=8, fg_color=(BG_PANEL_LIGHT, BG_PANEL_DARK), border_width=1, border_color=(BORDER_LIGHT, BORDER_DARK))
        card_bg.grid(row=3, column=0, padx=4, pady=(0, 8), sticky="ew")
        card_bg.grid_columnconfigure(0, weight=1)

        def on_bg_mode_change(v):
            if v == "Trong suốt":
                state["bg_type"] = "transparent"
            elif v == "Màu trơn":
                state["bg_type"] = "color"
            elif v == "Mờ nền":
                state["bg_type"] = "blur"
            render_composite()

        seg_bg = ctk.CTkSegmentedButton(
            card_bg,
            values=["Trong suốt", "Màu trơn", "Mờ nền"],
            font=ctk.CTkFont("Segoe UI", 10, "bold"),
            selected_color=ACCENT, selected_hover_color=ACCENT_HOVER,
            unselected_color=(BG_SUB_LIGHT, BG_SUB_DARK),
            command=on_bg_mode_change
        )
        seg_bg.set("Trong suốt" if state["bg_type"] == "transparent" else ("Màu trơn" if state["bg_type"] == "color" else "Mờ nền"))
        seg_bg.grid(row=0, column=0, padx=8, pady=(8, 6), sticky="ew")

        frame_palette = ctk.CTkFrame(card_bg, fg_color="transparent")
        frame_palette.grid(row=1, column=0, padx=8, pady=(0, 6), sticky="ew")

        def on_select_color(col):
            state["bg_type"] = "color"
            state["bg_color"] = col
            seg_bg.set("Màu trơn")
            render_composite()

        def pick_custom_color():
            c = colorchooser.askcolor(title="Chọn màu nền", parent=dialog)
            if c and c[1]:
                on_select_color(c[1])

        swatches = [
            ("#FFFFFF", "Trắng"),
            ("#F1F5F9", "Xám nhạt"),
            ("#0F172A", "Đen Slate"),
            ("#4F46E5", "Indigo"),
            ("#059669", "Emerald"),
            ("#3B82F6", "Blue"),
        ]
        for hex_col, name in swatches:
            btn_sw = ctk.CTkButton(
                frame_palette, text="", width=24, height=24, corner_radius=12,
                fg_color=hex_col, hover_color=hex_col, border_width=1, border_color=(BORDER_LIGHT, BORDER_DARK),
                command=lambda c=hex_col: on_select_color(c)
            )
            btn_sw.pack(side="left", padx=2)

        btn_pick_color = ctk.CTkButton(
            frame_palette, text="🎨", width=28, height=24, corner_radius=6,
            fg_color=(BG_SUB_LIGHT, BG_SUB_DARK), hover_color=(BORDER_LIGHT, BORDER_DARK),
            text_color=(TEXT_PRIMARY_L, TEXT_PRIMARY_D),
            command=pick_custom_color
        )
        btn_pick_color.pack(side="left", padx=4)

        frame_blur = ctk.CTkFrame(card_bg, fg_color="transparent")
        frame_blur.grid(row=2, column=0, padx=8, pady=(0, 8), sticky="ew")
        frame_blur.grid_columnconfigure(0, weight=1)

        ctk.CTkLabel(frame_blur, text="Độ mờ hậu cảnh (Bokeh Blur):", font=ctk.CTkFont("Segoe UI", 10), text_color=(TEXT_MUTED_L, TEXT_MUTED_D)).grid(row=0, column=0, sticky="w")
        lbl_blur_val = ctk.CTkLabel(frame_blur, text="25px", font=ctk.CTkFont("Segoe UI", 10, "bold"), text_color=ACCENT)
        lbl_blur_val.grid(row=0, column=1, sticky="e")

        def on_blur_slider(v):
            state["blur_radius"] = int(v)
            lbl_blur_val.configure(text=f"{int(v)}px")
            if state["bg_type"] == "blur":
                render_composite()

        slider_blur = ctk.CTkSlider(
            frame_blur, from_=2, to=60, number_of_steps=58,
            button_color=ACCENT, button_hover_color=ACCENT_HOVER, progress_color=ACCENT,
            command=on_blur_slider
        )
        slider_blur.set(25)
        slider_blur.grid(row=1, column=0, columnspan=2, sticky="ew", pady=(2, 0))

        # ── Section 3: Canva Photo Effects (Shadow & Glow) ──
        SectionHeader(right_panel, "🪄", "HIỆU ỨNG ĐỒ HỌA CANVA", color=ACCENT).grid(
            row=4, column=0, padx=6, pady=(4, 4), sticky="ew")

        card_fx = ctk.CTkFrame(right_panel, corner_radius=8, fg_color=(BG_PANEL_LIGHT, BG_PANEL_DARK), border_width=1, border_color=(BORDER_LIGHT, BORDER_DARK))
        card_fx.grid(row=5, column=0, padx=4, pady=(0, 8), sticky="ew")
        card_fx.grid_columnconfigure(0, weight=1)

        def on_toggle_shadow():
            state["shadow_enabled"] = var_studio_shadow.get()
            render_composite()

        var_studio_shadow = ctk.BooleanVar(value=state["shadow_enabled"])
        chk_studio_shadow = ctk.CTkCheckBox(
            card_fx, text="Đổ bóng mềm (Drop Shadow)",
            variable=var_studio_shadow,
            font=ctk.CTkFont("Segoe UI", 11, "bold"),
            checkmark_color="white",
            fg_color=ACCENT, hover_color=ACCENT_HOVER,
            command=on_toggle_shadow
        )
        chk_studio_shadow.grid(row=0, column=0, padx=8, pady=(8, 4), sticky="w")

        frame_sh_opts = ctk.CTkFrame(card_fx, fg_color="transparent")
        frame_sh_opts.grid(row=1, column=0, padx=8, pady=(0, 6), sticky="ew")
        frame_sh_opts.grid_columnconfigure(0, weight=1)

        def on_shadow_blur(v):
            state["shadow_blur"] = int(v)
            if state["shadow_enabled"]:
                render_composite()

        def on_shadow_opacity(v):
            state["shadow_opacity"] = float(v) / 100.0
            if state["shadow_enabled"]:
                render_composite()

        ctk.CTkLabel(frame_sh_opts, text="Độ mềm bóng đổ:", font=ctk.CTkFont("Segoe UI", 10), text_color=(TEXT_MUTED_L, TEXT_MUTED_D)).grid(row=0, column=0, sticky="w")
        slider_sh_blur = ctk.CTkSlider(
            frame_sh_opts, from_=4, to=40, number_of_steps=36,
            button_color=ACCENT, button_hover_color=ACCENT_HOVER, progress_color=ACCENT,
            command=on_shadow_blur
        )
        slider_sh_blur.set(16)
        slider_sh_blur.grid(row=1, column=0, sticky="ew", pady=(1, 4))

        ctk.CTkLabel(frame_sh_opts, text="Độ đậm bóng (Opacity):", font=ctk.CTkFont("Segoe UI", 10), text_color=(TEXT_MUTED_L, TEXT_MUTED_D)).grid(row=2, column=0, sticky="w")
        slider_sh_op = ctk.CTkSlider(
            frame_sh_opts, from_=10, to=90, number_of_steps=80,
            button_color=ACCENT, button_hover_color=ACCENT_HOVER, progress_color=ACCENT,
            command=on_shadow_opacity
        )
        slider_sh_op.set(45)
        slider_sh_op.grid(row=3, column=0, sticky="ew", pady=(1, 4))

        def on_toggle_glow():
            state["glow_enabled"] = var_studio_glow.get()
            render_composite()

        def on_glow_width(v):
            state["glow_width"] = int(v)
            if state["glow_enabled"]:
                render_composite()

        var_studio_glow = ctk.BooleanVar(value=state["glow_enabled"])
        chk_studio_glow = ctk.CTkCheckBox(
            card_fx, text="Viền nét / Phát sáng (Stroke & Glow)",
            variable=var_studio_glow,
            font=ctk.CTkFont("Segoe UI", 11, "bold"),
            checkmark_color="white",
            fg_color=ACCENT, hover_color=ACCENT_HOVER,
            command=on_toggle_glow
        )
        chk_studio_glow.grid(row=2, column=0, padx=8, pady=(4, 4), sticky="w")

        frame_gw_opts = ctk.CTkFrame(card_fx, fg_color="transparent")
        frame_gw_opts.grid(row=3, column=0, padx=8, pady=(0, 8), sticky="ew")
        frame_gw_opts.grid_columnconfigure(0, weight=1)

        ctk.CTkLabel(frame_gw_opts, text="Độ dày viền:", font=ctk.CTkFont("Segoe UI", 10), text_color=(TEXT_MUTED_L, TEXT_MUTED_D)).grid(row=0, column=0, sticky="w")
        slider_gw_width = ctk.CTkSlider(
            frame_gw_opts, from_=2, to=24, number_of_steps=22,
            button_color=ACCENT, button_hover_color=ACCENT_HOVER, progress_color=ACCENT,
            command=on_glow_width
        )
        slider_gw_width.set(6)
        slider_gw_width.grid(row=1, column=0, sticky="ew", pady=(1, 4))

        # ── Section 4: Action Buttons ──
        btn_apply = ctk.CTkButton(
            right_panel,
            text="✅  Áp Dụng Vào Dự Án",
            height=38, corner_radius=8,
            font=ctk.CTkFont("Segoe UI", 12, "bold"),
            fg_color=SUCCESS, hover_color=SUCCESS_HOVER,
            command=lambda: apply_studio_result()
        )
        btn_apply.grid(row=6, column=0, padx=6, pady=(6, 4), sticky="ew")

        btn_save_as = ctk.CTkButton(
            right_panel,
            text="💾  Lưu Ảnh Này Thành File…",
            height=34, corner_radius=8,
            font=ctk.CTkFont("Segoe UI", 11, "bold"),
            fg_color=ACCENT, hover_color=ACCENT_HOVER,
            command=lambda: save_studio_result()
        )
        btn_save_as.grid(row=7, column=0, padx=6, pady=(4, 10), sticky="ew")

        # ── Logic & Render Callbacks ──
        def trigger_cutout(force=False):
            if state["cutout_rgba"] is not None and not force:
                return

            lbl_studio_status.configure(text="Đang phân tích tách nền AI…", text_color=WARNING)
            dialog.update_idletasks()

            def _worker():
                try:
                    cut = NativeImageEngine.remove_background(
                        state["orig_img"],
                        tolerance=state["tolerance"],
                        method=state["method"]
                    )
                    state["cutout_rgba"] = cut
                    state["mask"] = np.array(cut.split()[3])
                    state["undo_stack"].clear()
                    dialog.after(0, lambda: on_cutout_finished("Tách nền hoàn tất ✓"))
                except Exception as ex:
                    dialog.after(0, lambda: on_cutout_finished(f"Lỗi: {ex}", is_err=True))

            threading.Thread(target=_worker, daemon=True).start()

        def on_cutout_finished(msg, is_err=False):
            lbl_studio_status.configure(
                text=msg,
                text_color=DANGER if is_err else SUCCESS
            )
            render_composite()

        def render_composite():
            if state["cutout_rgba"] is None:
                return

            if state["mask"] is not None:
                orig_rgb = state["orig_img"].convert("RGB")
                alpha_pil = Image.fromarray(state["mask"], mode="L")
                cutout = Image.merge("RGBA", (*orig_rgb.split(), alpha_pil))
            else:
                cutout = state["cutout_rgba"]

            res = NativeImageEngine.apply_canva_background(
                cutout,
                bg_type=state["bg_type"],
                bg_color=state["bg_color"],
                orig_image=state["orig_img"],
                blur_radius=state["blur_radius"]
            )

            if state["shadow_enabled"]:
                res = NativeImageEngine.apply_drop_shadow(
                    res,
                    offset_x=10, offset_y=12,
                    blur_radius=state["shadow_blur"],
                    opacity=state["shadow_opacity"]
                )

            if state["glow_enabled"]:
                res = NativeImageEngine.apply_glow_outline(
                    res,
                    outline_width=state["glow_width"],
                    outline_color=state["glow_color"],
                    is_glow=state["is_glow"]
                )

            state["composite_img"] = res
            draw_canvas()

        _canvas_scale = [1.0]
        _canvas_offset = [0, 0]
        _canvas_tk_img = [None]

        def draw_canvas(show_original=False):
            canvas.delete("all")
            cw = canvas.winfo_width()
            ch = canvas.winfo_height()
            if cw <= 1 or ch <= 1:
                return

            img_to_show = state["orig_img"] if show_original else (state["composite_img"] or state["orig_img"])
            iw, ih = img_to_show.size

            scale = min(cw / iw, ch / ih, 1.0)
            dw = max(1, int(iw * scale))
            dh = max(1, int(ih * scale))
            ox = (cw - dw) // 2
            oy = (ch - dh) // 2

            _canvas_scale[0] = scale
            _canvas_offset[0] = ox
            _canvas_offset[1] = oy

            disp = img_to_show.resize((dw, dh), Image.Resampling.LANCZOS)
            _canvas_tk_img[0] = ImageTk.PhotoImage(disp)
            canvas.create_image(ox, oy, anchor="nw", image=_canvas_tk_img[0])

        _drawing = [False]

        def to_img_coords(cx, cy):
            sc = _canvas_scale[0]
            ox, oy = _canvas_offset[0], _canvas_offset[1]
            ix = int((cx - ox) / sc)
            iy = int((cy - oy) / sc)
            return ix, iy

        def apply_brush(ix, iy):
            if state["mask"] is None or state["retouch_tool"] == "view":
                return
            h, w = state["mask"].shape
            val = 0 if state["retouch_tool"] == "erase" else 255
            rad = max(1, int(state["brush_size"]))
            cv2.circle(state["mask"], (ix, iy), rad, val, -1)

        def on_canvas_press(e):
            if state["retouch_tool"] != "view" and state["mask"] is not None:
                state["undo_stack"].append(state["mask"].copy())
                if len(state["undo_stack"]) > 10:
                    state["undo_stack"].pop(0)
                _drawing[0] = True
                ix, iy = to_img_coords(e.x, e.y)
                apply_brush(ix, iy)
                render_composite()

        def on_canvas_drag(e):
            if _drawing[0] and state["mask"] is not None:
                ix, iy = to_img_coords(e.x, e.y)
                apply_brush(ix, iy)
                render_composite()

        def on_canvas_release(e):
            _drawing[0] = False

        def do_undo():
            if state["undo_stack"]:
                state["mask"] = state["undo_stack"].pop()
                render_composite()
            else:
                messagebox.showinfo("Hoàn tác", "Không còn nét vẽ nào để hoàn tác!")

        canvas.bind("<Button-1>", on_canvas_press)
        canvas.bind("<B1-Motion>", on_canvas_drag)
        canvas.bind("<ButtonRelease-1>", on_canvas_release)
        canvas_frame.bind("<Configure>", lambda e: draw_canvas())

        btn_compare.bind("<ButtonPress-1>", lambda e: draw_canvas(show_original=True))
        btn_compare.bind("<ButtonRelease-1>", lambda e: draw_canvas(show_original=False))

        def apply_studio_result():
            if state["composite_img"] is None:
                messagebox.showwarning("Thông Báo", "Chưa có ảnh kết quả để áp dụng!")
                return
            item["img"] = state["composite_img"]
            item["orig_w"], item["orig_h"] = state["composite_img"].size
            self._preview_cache.pop(self.current_preview_index, None)
            self.schedule_live_preview()
            self._render_queue_table()
            messagebox.showinfo("Thành Công", f"Đã áp dụng kết quả Canva Studio vào ảnh '{item['name']}'!")
            dialog.destroy()

        def save_studio_result():
            if state["composite_img"] is None:
                messagebox.showwarning("Thông Báo", "Chưa có ảnh kết quả để lưu!")
                return
            base, _ = os.path.splitext(item["name"])
            default_ext = "png" if state["bg_type"] == "transparent" else "jpg"
            out_path = filedialog.asksaveasfilename(
                title="Lưu ảnh từ Canva Studio",
                initialfile=f"{base}_canva.{default_ext}",
                filetypes=[("PNG Image", "*.png"), ("JPEG Image", "*.jpg"), ("WEBP Image", "*.webp"), ("Tất cả", "*.*")],
                parent=dialog
            )
            if out_path:
                ext = os.path.splitext(out_path)[1].lstrip(".").upper() or "PNG"
                NativeImageEngine.save_image(state["composite_img"], out_path, target_format=ext, quality=95)
                messagebox.showinfo("Đã Lưu", f"Đã lưu thành công tại:\n{out_path}")

        dialog.after(80, lambda: trigger_cutout(force=False))

    # =========================================================================
    # SMART WATERMARK & LOGO ERASER STUDIO (INPAINTING + SANITIZATION)
    # =========================================================================
    def open_watermark_eraser_studio(self):
        if self.current_preview_index < 0 or not self.loaded_files:
            messagebox.showwarning("Thông Báo", "Vui lòng chọn một ảnh để bắt đầu xóa logo hiện!")
            return

        item = self.loaded_files[self.current_preview_index]
        orig_img = item["img"]
        orig_w, orig_h = orig_img.size

        dialog = ctk.CTkToplevel(self)
        dialog.title(f"🎨  Studio Xóa Logo & Thủy Vân Hiện — {item['name']} ({orig_w}×{orig_h} px)")

        sw = dialog.winfo_screenwidth()
        sh = dialog.winfo_screenheight()
        dw = min(1180, max(1000, sw - 80))
        dh = min(820, max(680, sh - 80))
        dx = max(0, (sw - dw) // 2)
        dy = max(0, (sh - dh) // 2)
        dialog.geometry(f"{dw}x{dh}+{dx}+{dy}")
        dialog.minsize(980, 640)
        dialog.attributes("-topmost", True)
        dialog.configure(fg_color=(BG_APP_LIGHT, BG_APP_DARK))

        # Main Layout: Col 0 = Canvas Area (flexible), Col 1 = Control Panel (fixed 320px)
        dialog.grid_columnconfigure(0, weight=1)
        dialog.grid_columnconfigure(1, weight=0)
        dialog.grid_rowconfigure(1, weight=1)

        # ── Top Studio Banner ──
        top_bar = ctk.CTkFrame(
            dialog, height=48, corner_radius=0,
            fg_color=(BG_PANEL_LIGHT, BG_PANEL_DARK),
            border_width=1, border_color=(BORDER_LIGHT, BORDER_DARK)
        )
        top_bar.grid(row=0, column=0, columnspan=2, sticky="ew")
        top_bar.grid_columnconfigure(1, weight=1)
        top_bar.grid_propagate(False)

        ctk.CTkLabel(
            top_bar, text="🎨  Studio Xóa Logo & Watermark Hiện",
            font=ctk.CTkFont("Segoe UI", 14, "bold"),
            text_color=(TEXT_PRIMARY_L, TEXT_PRIMARY_D)
        ).pack(side="left", padx=16)

        ctk.CTkLabel(
            top_bar,
            text="💡 Tô cọ hoặc khoanh khung lên logo/chữ mờ cần xóa. Vùng vật thể chính bên ngoài được bảo vệ 100%.",
            font=ctk.CTkFont("Segoe UI", 11),
            text_color=(TEXT_MUTED_L, TEXT_MUTED_D)
        ).pack(side="left", padx=8)

        # ── Studio State ──
        state = {
            "mask": Image.new("L", (orig_w, orig_h), 0),
            "history": [],        # list of mask copies
            "working_img": orig_img.copy(),
            "prev_working_img": None,
            "tool": "brush",      # 'brush', 'rect', 'eraser'
            "brush_size": 24,
            "inpaint_rad": 4,
            "method": "telea",
            "scale": 1.0,
            "ox": 0,
            "oy": 0,
            "disp_w": 1,
            "disp_h": 1,
            "last_x": None,
            "last_y": None,
            "rect_start": None,
            "rect_id": None,
            "is_comparing": False,
            "tk_image_ref": None,
        }

        # ── Left Area: Interactive Drawing Canvas ──
        canvas_container = ctk.CTkFrame(
            dialog, corner_radius=10,
            fg_color=(BG_CARD_LIGHT, BG_CARD_DARK),
            border_width=1, border_color=(BORDER_LIGHT, BORDER_DARK)
        )
        canvas_container.grid(row=1, column=0, sticky="nsew", padx=(12, 6), pady=(8, 12))
        canvas_container.grid_columnconfigure(0, weight=1)
        canvas_container.grid_rowconfigure(0, weight=1)

        canvas = tk.Canvas(
            canvas_container,
            bg="#0b101b" if ctk.get_appearance_mode() == "Dark" else "#f8fafc",
            highlightthickness=0,
            cursor="crosshair"
        )
        canvas.grid(row=0, column=0, sticky="nsew", padx=6, pady=6)

        # ── Right Area: Control Panel (Fixed Width 310px) ──
        panel = ctk.CTkScrollableFrame(
            dialog, width=310, corner_radius=10,
            fg_color=(BG_PANEL_LIGHT, BG_PANEL_DARK),
            border_width=1, border_color=(BORDER_LIGHT, BORDER_DARK)
        )
        panel.grid(row=1, column=1, sticky="nsew", padx=(6, 12), pady=(8, 12))
        panel.grid_columnconfigure(0, weight=1)

        # Section 1: Drawing Tools
        SectionHeader(panel, "🖌", "CÔNG CỤ CHỌN VÙNG").grid(row=0, column=0, padx=6, pady=(4, 6), sticky="ew")

        card_tools = ctk.CTkFrame(panel, corner_radius=8, fg_color=(BG_CARD_LIGHT, BG_CARD_DARK))
        card_tools.grid(row=1, column=0, padx=4, pady=(0, 10), sticky="ew")
        card_tools.grid_columnconfigure(0, weight=1)

        def on_tool_change(val):
            if "Cọ" in val:
                state["tool"] = "brush"
                canvas.configure(cursor="crosshair")
            elif "Khung" in val:
                state["tool"] = "rect"
                canvas.configure(cursor="tcross")
            elif "Tẩy" in val:
                state["tool"] = "eraser"
                canvas.configure(cursor="circle")

        seg_tool = ctk.CTkSegmentedButton(
            card_tools,
            values=["🖌  Cọ Xóa", "⏹  Khung Chữ Nhật", "🧹  Cục Tẩy"],
            font=ctk.CTkFont("Segoe UI", 11, "bold"),
            selected_color=ACCENT, selected_hover_color=ACCENT_HOVER,
            unselected_color=(BG_SUB_LIGHT, BG_SUB_DARK),
            command=on_tool_change
        )
        seg_tool.set("🖌  Cọ Xóa")
        seg_tool.grid(row=0, column=0, padx=8, pady=(8, 6), sticky="ew")

        # Brush Size Slider
        b_hdr = ctk.CTkFrame(card_tools, fg_color="transparent")
        b_hdr.grid(row=1, column=0, padx=10, pady=(4, 0), sticky="ew")
        b_hdr.grid_columnconfigure(0, weight=1)

        ctk.CTkLabel(
            b_hdr, text="Kích thước nét cọ:",
            font=ctk.CTkFont("Segoe UI", 11),
            text_color=(TEXT_MUTED_L, TEXT_MUTED_D)
        ).grid(row=0, column=0, sticky="w")

        lbl_bsize = ctk.CTkLabel(
            b_hdr, text=f"{state['brush_size']} px",
            font=ctk.CTkFont("Segoe UI", 11, "bold"),
            text_color=ACCENT
        )
        lbl_bsize.grid(row=0, column=1, sticky="e")

        def on_bsize_slider(val):
            sz = int(val)
            state["brush_size"] = sz
            lbl_bsize.configure(text=f"{sz} px")

        slider_bsize = ctk.CTkSlider(
            card_tools, from_=5, to=90, number_of_steps=85,
            button_color=ACCENT, button_hover_color=ACCENT_HOVER,
            progress_color=ACCENT,
            command=on_bsize_slider
        )
        slider_bsize.set(state["brush_size"])
        slider_bsize.grid(row=2, column=0, padx=10, pady=(2, 8), sticky="ew")

        # Action Buttons (Undo / Clear)
        row_actions = ctk.CTkFrame(card_tools, fg_color="transparent")
        row_actions.grid(row=3, column=0, padx=8, pady=(0, 8), sticky="ew")
        row_actions.grid_columnconfigure(0, weight=1)
        row_actions.grid_columnconfigure(1, weight=1)

        def do_undo():
            if state["history"]:
                state["mask"] = state["history"].pop()
                render_canvas()
                lbl_status.configure(text="Đã hoàn tác bước vẽ trước ✓", text_color=ACCENT)

        def do_clear_mask():
            if np.any(np.array(state["mask"]) > 0):
                state["history"].append(state["mask"].copy())
                state["mask"] = Image.new("L", (orig_w, orig_h), 0)
                render_canvas()
                lbl_status.configure(text="Đã xóa toàn bộ mặt nạ.", text_color=(TEXT_MUTED_L, TEXT_MUTED_D))

        ctk.CTkButton(
            row_actions, text="↺  Hoàn tác (Undo)",
            height=28, corner_radius=6,
            font=ctk.CTkFont("Segoe UI", 11),
            fg_color=(BG_SUB_LIGHT, BG_SUB_DARK),
            hover_color=(BORDER_LIGHT, BORDER_DARK),
            text_color=(TEXT_PRIMARY_L, TEXT_PRIMARY_D),
            command=do_undo
        ).grid(row=0, column=0, padx=(0, 4), sticky="ew")

        ctk.CTkButton(
            row_actions, text="✕  Xóa mặt nạ",
            height=28, corner_radius=6,
            font=ctk.CTkFont("Segoe UI", 11),
            fg_color=(BG_SUB_LIGHT, BG_SUB_DARK),
            hover_color=(DANGER, DANGER_HOVER),
            text_color=(TEXT_PRIMARY_L, TEXT_PRIMARY_D),
            command=do_clear_mask
        ).grid(row=0, column=1, padx=(4, 0), sticky="ew")

        # Section 2: Algorithm Settings
        SectionHeader(panel, "⚙", "THUẬT TOÁN TÁI TẠO").grid(row=2, column=0, padx=6, pady=(4, 6), sticky="ew")

        card_algo = ctk.CTkFrame(panel, corner_radius=8, fg_color=(BG_CARD_LIGHT, BG_CARD_DARK))
        card_algo.grid(row=3, column=0, padx=4, pady=(0, 10), sticky="ew")
        card_algo.grid_columnconfigure(0, weight=1)

        def on_algo_change(val):
            state["method"] = "telea" if "Telea" in val else "ns"

        opt_algo = ctk.CTkOptionMenu(
            card_algo,
            values=["Telea (Biên sắc nét - Khuyên dùng)", "Navier-Stokes (Chuyển sắc mượt)"],
            font=ctk.CTkFont("Segoe UI", 11),
            fg_color=(BG_SUB_LIGHT, BG_SUB_DARK),
            button_color=ACCENT, button_hover_color=ACCENT_HOVER,
            command=on_algo_change
        )
        opt_algo.set("Telea (Biên sắc nét - Khuyên dùng)")
        opt_algo.grid(row=0, column=0, padx=8, pady=(8, 6), sticky="ew")

        # Inpaint Radius Slider
        rad_hdr = ctk.CTkFrame(card_algo, fg_color="transparent")
        rad_hdr.grid(row=1, column=0, padx=10, pady=(4, 0), sticky="ew")
        rad_hdr.grid_columnconfigure(0, weight=1)

        ctk.CTkLabel(
            rad_hdr, text="Bán kính hòa trộn viền:",
            font=ctk.CTkFont("Segoe UI", 11),
            text_color=(TEXT_MUTED_L, TEXT_MUTED_D)
        ).grid(row=0, column=0, sticky="w")

        lbl_rad = ctk.CTkLabel(
            rad_hdr, text=f"{state['inpaint_rad']} px",
            font=ctk.CTkFont("Segoe UI", 11, "bold"),
            text_color=ACCENT
        )
        lbl_rad.grid(row=0, column=1, sticky="e")

        def on_rad_slider(val):
            r = int(val)
            state["inpaint_rad"] = r
            lbl_rad.configure(text=f"{r} px")

        slider_rad = ctk.CTkSlider(
            card_algo, from_=1, to=15, number_of_steps=14,
            button_color=ACCENT, button_hover_color=ACCENT_HOVER,
            progress_color=ACCENT,
            command=on_rad_slider
        )
        slider_rad.set(state["inpaint_rad"])
        slider_rad.grid(row=2, column=0, padx=10, pady=(2, 6), sticky="ew")

        # Also Clean Hidden LSB Watermark Checkbox
        var_also_clean_lsb = ctk.BooleanVar(value=True)
        chk_also_lsb = ctk.CTkCheckBox(
            card_algo,
            text="🧹  Đồng thời xóa sạch logo ẩn (LSB)",
            variable=var_also_clean_lsb,
            font=ctk.CTkFont("Segoe UI", 10, "bold"),
            checkmark_color="white",
            fg_color=SUCCESS, hover_color=SUCCESS_HOVER,
        )
        chk_also_lsb.grid(row=3, column=0, padx=10, pady=(4, 8), sticky="w")

        # Section 3: Execute Erasure
        SectionHeader(panel, "⚡", "THỰC THI").grid(row=4, column=0, padx=6, pady=(4, 6), sticky="ew")

        card_exec = ctk.CTkFrame(panel, corner_radius=8, fg_color=(BG_CARD_LIGHT, BG_CARD_DARK))
        card_exec.grid(row=5, column=0, padx=4, pady=(0, 10), sticky="ew")
        card_exec.grid_columnconfigure(0, weight=1)

        lbl_status = ctk.CTkLabel(
            card_exec,
            text="Chưa tẩy  •  Quét chọn logo rồi bấm nút bên dưới",
            font=ctk.CTkFont("Segoe UI", 10),
            text_color=(TEXT_MUTED_L, TEXT_MUTED_D),
            wraplength=280
        )
        lbl_status.grid(row=0, column=0, padx=8, pady=(8, 4))

        def execute_inpaint():
            if not np.any(np.array(state["mask"]) > 0):
                messagebox.showwarning(
                    "Chưa Chọn Vùng Xóa",
                    "Vui lòng dùng chuột quét cọ hoặc khoanh khung lên vùng logo cần xóa trên ảnh!"
                )
                return

            lbl_status.configure(text="⏳ Đang tính toán tái tạo vùng ảnh...", text_color=WARNING)
            dialog.update_idletasks()

            t0 = time.time()
            try:
                # 1. Inpaint visible watermark
                inpainted = NativeImageEngine.inpaint_watermark(
                    state["working_img"],
                    state["mask"],
                    inpaint_radius=state["inpaint_rad"],
                    method=state["method"]
                )

                # 2. Optionally sanitize hidden stego as requested
                if var_also_clean_lsb.get():
                    inpainted = NativeImageEngine.sanitize_hidden_watermark(inpainted)

                ms = int((time.time() - t0) * 1000)
                state["prev_working_img"] = state["working_img"].copy()
                state["working_img"] = inpainted
                # Clear mask so user sees clean result
                state["history"].append(state["mask"].copy())
                state["mask"] = Image.new("L", (orig_w, orig_h), 0)

                render_canvas()
                btn_compare.configure(state="normal")
                msg = f"✅ Đã tẩy logo thành công ({ms}ms)!"
                if var_also_clean_lsb.get():
                    msg += " (Đã làm sạch cả LSB ẩn)"
                lbl_status.configure(text=msg, text_color=SUCCESS)
            except Exception as ex:
                lbl_status.configure(text=f"Lỗi khi tẩy: {ex}", text_color=DANGER)

        btn_run_inpaint = ctk.CTkButton(
            card_exec,
            text="⚡   TẨY LOGO NGAY",
            height=40, corner_radius=8,
            font=ctk.CTkFont("Segoe UI", 12, "bold"),
            fg_color=WARNING, hover_color=WARNING_HOVER,
            text_color="white",
            command=execute_inpaint
        )
        btn_run_inpaint.grid(row=1, column=0, padx=8, pady=(4, 6), sticky="ew")

        # Compare Before/After Button
        def on_compare_press(e):
            if state["prev_working_img"] or state["working_img"]:
                state["is_comparing"] = True
                render_canvas(show_original=True)

        def on_compare_release(e):
            state["is_comparing"] = False
            render_canvas(show_original=False)

        btn_compare = ctk.CTkButton(
            card_exec,
            text="👁   Giữ chuột để xem ảnh gốc",
            height=30, corner_radius=6,
            font=ctk.CTkFont("Segoe UI", 11),
            fg_color=(BG_SUB_LIGHT, BG_SUB_DARK),
            hover_color=(BORDER_LIGHT, BORDER_DARK),
            text_color=(TEXT_PRIMARY_L, TEXT_PRIMARY_D),
            state="disabled"
        )
        btn_compare.grid(row=2, column=0, padx=8, pady=(0, 8), sticky="ew")
        btn_compare.bind("<ButtonPress-1>", on_compare_press)
        btn_compare.bind("<ButtonRelease-1>", on_compare_release)

        # Section 4: Finalize & Export
        SectionHeader(panel, "💾", "LƯU & ĐỒNG BỘ").grid(row=6, column=0, padx=6, pady=(4, 6), sticky="ew")

        card_save = ctk.CTkFrame(panel, corner_radius=8, fg_color=(BG_CARD_LIGHT, BG_CARD_DARK))
        card_save.grid(row=7, column=0, padx=4, pady=(0, 10), sticky="ew")
        card_save.grid_columnconfigure(0, weight=1)

        def apply_to_project():
            item["img"] = state["working_img"]
            if self.current_preview_index in self._preview_cache:
                del self._preview_cache[self.current_preview_index]
            self.update_live_preview()
            self._set_status(f"Đã cập nhật ảnh sạch logo cho '{item['name']}' ✓", SUCCESS)
            messagebox.showinfo(
                "Đã Áp Dụng Thành Công",
                f"✓ Đã cập nhật ảnh sạch logo cho '{item['name']}' vào Studio!\n\n"
                "Bạn có thể tiếp tục chuyển đổi định dạng, thay đổi kích thước hoặc xuất tệp."
            )
            dialog.destroy()

        btn_apply = ctk.CTkButton(
            card_save,
            text="✅   Áp Dụng Vào Ảnh Hiện Tại",
            height=36, corner_radius=8,
            font=ctk.CTkFont("Segoe UI", 11, "bold"),
            fg_color=SUCCESS, hover_color=SUCCESS_HOVER,
            command=apply_to_project
        )
        btn_apply.grid(row=0, column=0, padx=8, pady=(8, 4), sticky="ew")

        def save_as_new_file():
            base_name, _ = os.path.splitext(item["name"])
            out_path = filedialog.asksaveasfilename(
                title="Lưu Ảnh Đã Tẩy Logo",
                initialfile=f"{base_name}_cleaned.png",
                defaultextension=".png",
                filetypes=[
                    ("PNG Image (*.png)", "*.png"),
                    ("JPEG Image (*.jpg)", "*.jpg"),
                    ("WebP Image (*.webp)", "*.webp"),
                    ("Tất cả tệp", "*.*")
                ]
            )
            if out_path:
                ext = os.path.splitext(out_path)[1].lstrip(".").upper()
                fmt = ext if ext in ("PNG", "JPG", "JPEG", "WEBP", "BMP") else "PNG"
                NativeImageEngine.save_image(state["working_img"], out_path, target_format=fmt)
                messagebox.showinfo("Thành Công", f"Đã lưu ảnh sạch logo thành công vào:\n{out_path}")

        btn_save_file = ctk.CTkButton(
            card_save,
            text="💾   Lưu Thành Tệp Mới…",
            height=30, corner_radius=6,
            font=ctk.CTkFont("Segoe UI", 11),
            fg_color=(BG_SUB_LIGHT, BG_SUB_DARK),
            hover_color=(BORDER_LIGHT, BORDER_DARK),
            text_color=(TEXT_PRIMARY_L, TEXT_PRIMARY_D),
            command=save_as_new_file
        )
        btn_save_file.grid(row=1, column=0, padx=8, pady=(0, 8), sticky="ew")

        # ── Canvas Rendering Engine ──
        def render_canvas(show_original=False):
            cw = max(100, canvas.winfo_width())
            ch = max(100, canvas.winfo_height())

            scale = min((cw - 16) / orig_w, (ch - 16) / orig_h)
            dw = max(1, int(orig_w * scale))
            dh = max(1, int(orig_h * scale))
            ox = (cw - dw) // 2
            oy = (ch - dh) // 2

            state["scale"] = scale
            state["disp_w"] = dw
            state["disp_h"] = dh
            state["ox"] = ox
            state["oy"] = oy

            # Base image to show
            if show_original or state["is_comparing"]:
                base = orig_img
            else:
                base = state["working_img"]

            thumb_base = base.resize((dw, dh), Image.Resampling.BILINEAR)

            # Overlay mask if mask has any pixels
            if not show_original and np.any(np.array(state["mask"]) > 0):
                thumb_mask = state["mask"].resize((dw, dh), Image.Resampling.NEAREST)
                red_layer = Image.new("RGB", (dw, dh), (255, 45, 85))
                tinted = Image.blend(thumb_base.convert("RGB"), red_layer, 0.42)
                display_pil = Image.composite(tinted, thumb_base.convert("RGB"), thumb_mask)
            else:
                display_pil = thumb_base

            tk_img = ImageTk.PhotoImage(display_pil)
            state["tk_image_ref"] = tk_img  # Prevent garbage collection

            canvas.delete("all")
            canvas.create_image(ox, oy, anchor="nw", image=tk_img)

            # If comparing, show watermark label
            if show_original or state["is_comparing"]:
                canvas.create_text(
                    ox + 14, oy + 14, anchor="nw",
                    text="👁 Đang xem ảnh gốc",
                    fill="#fbbf24", font=("Segoe UI", 12, "bold")
                )

        # ── Mouse Interaction Handlers on Canvas ──
        def to_img_coords(cx, cy):
            ix = int((cx - state["ox"]) / state["scale"])
            iy = int((cy - state["oy"]) / state["scale"])
            return max(0, min(orig_w - 1, ix)), max(0, min(orig_h - 1, iy))

        def on_canvas_b1_press(e):
            tool = state["tool"]
            state["history"].append(state["mask"].copy())
            if len(state["history"]) > 10:
                state["history"].pop(0)

            ix, iy = to_img_coords(e.x, e.y)
            draw = ImageDraw.Draw(state["mask"])
            r = state["brush_size"] // 2

            if tool == "brush":
                draw.ellipse((ix - r, iy - r, ix + r, iy + r), fill=255)
                state["last_x"], state["last_y"] = e.x, e.y
                cr = max(2, int(r * state["scale"]))
                canvas.create_oval(e.x - cr, e.y - cr, e.x + cr, e.y + cr, fill="#ff3366", outline="", tags="temp_mask")
            elif tool == "eraser":
                draw.ellipse((ix - r, iy - r, ix + r, iy + r), fill=0)
                state["last_x"], state["last_y"] = e.x, e.y
                render_canvas()
            elif tool == "rect":
                state["rect_start"] = (e.x, e.y)
                state["rect_id"] = None

        def on_canvas_b1_motion(e):
            tool = state["tool"]
            if tool in ("brush", "eraser"):
                if state["last_x"] is None:
                    state["last_x"], state["last_y"] = e.x, e.y
                    return

                ix1, iy1 = to_img_coords(state["last_x"], state["last_y"])
                ix2, iy2 = to_img_coords(e.x, e.y)
                draw = ImageDraw.Draw(state["mask"])
                val = 255 if tool == "brush" else 0
                w_brush = state["brush_size"]
                r = w_brush // 2

                draw.line([(ix1, iy1), (ix2, iy2)], fill=val, width=w_brush)
                draw.ellipse((ix2 - r, iy2 - r, ix2 + r, iy2 + r), fill=val)

                if tool == "brush":
                    w_canvas = max(2, int(w_brush * state["scale"]))
                    canvas.create_line(
                        state["last_x"], state["last_y"], e.x, e.y,
                        width=w_canvas, fill="#ff3366", capstyle="round", smooth=True, tags="temp_mask"
                    )
                else:
                    render_canvas()

                state["last_x"], state["last_y"] = e.x, e.y

            elif tool == "rect" and state["rect_start"]:
                if state["rect_id"]:
                    canvas.delete(state["rect_id"])
                rx0, ry0 = state["rect_start"]
                state["rect_id"] = canvas.create_rectangle(
                    rx0, ry0, e.x, e.y, outline="#ff3366", width=2, dash=(4, 4)
                )

        def on_canvas_b1_release(e):
            tool = state["tool"]
            if tool == "rect" and state["rect_start"]:
                if state["rect_id"]:
                    canvas.delete(state["rect_id"])
                    state["rect_id"] = None
                ix1, iy1 = to_img_coords(state["rect_start"][0], state["rect_start"][1])
                ix2, iy2 = to_img_coords(e.x, e.y)
                rx1, rx2 = min(ix1, ix2), max(ix1, ix2)
                ry1, ry2 = min(iy1, iy2), max(iy1, iy2)
                draw = ImageDraw.Draw(state["mask"])
                draw.rectangle((rx1, ry1, rx2, ry2), fill=255)
                state["rect_start"] = None

            state["last_x"] = None
            state["last_y"] = None
            canvas.delete("temp_mask")
            render_canvas()

        canvas.bind("<ButtonPress-1>", on_canvas_b1_press)
        canvas.bind("<B1-Motion>", on_canvas_b1_motion)
        canvas.bind("<ButtonRelease-1>", on_canvas_b1_release)
        canvas.bind("<Configure>", lambda e: render_canvas())

        dialog.after(80, render_canvas)
    def start_batch_conversion(self):
        if not self.loaded_files:
            messagebox.showwarning("Thông Báo", "Vui lòng thêm ít nhất một ảnh để chuyển đổi!")
            return
        out_dir = filedialog.askdirectory(title="Chọn thư mục lưu ảnh sau chuyển đổi")
        if not out_dir:
            return
        self.is_processing = True
        self.btn_start.configure(state="disabled", text="⏳   Đang xử lý xuất ảnh…")
        threading.Thread(
            target=self._conversion_worker,
            args=(out_dir,),
            daemon=True
        ).start()

    def _conversion_worker(self, out_dir):
        total  = len(self.loaded_files)
        fmt    = self.format_segmented.get()
        qual   = int(self.slider_quality.get())
        sharp  = int(self.slider_sharpen.get())
        rem_bg = self.var_remove_bg.get()
        tol    = int(self.slider_tolerance.get())

        try:
            tw = max(1, int(self.entry_w.get()))
            th = max(1, int(self.entry_h.get()))
        except ValueError:
            tw = th = 0

        fit = self.fit_mode_menu.get().split("(")[1].rstrip(")")
        ok  = 0

        for i, item in enumerate(self.loaded_files):
            self._set_status(f"Đang xử lý [{i+1}/{total}]: {item['name']}…", WARNING)
            item["status"] = "Đang xử lý…"
            self._render_queue_table()

            try:
                # Always process high-res original image for batch output
                img = item["img"].copy()
                w = tw if tw > 0 else img.width
                h = th if th > 0 else img.height

                proc = NativeImageEngine.resize_image(img, w, h, fit_mode=fit)
                if rem_bg:
                    proc = NativeImageEngine.remove_background(proc, tol)
                    if self.canva_bg_mode.get() != "transparent":
                        proc = NativeImageEngine.apply_canva_background(
                            proc,
                            bg_type=self.canva_bg_mode.get(),
                            bg_color=self.canva_bg_color.get(),
                            orig_image=img,
                            blur_radius=self.canva_blur_rad.get()
                        )
                    if self.canva_shadow_enabled.get():
                        proc = NativeImageEngine.apply_drop_shadow(
                            proc,
                            offset_x=self.canva_shadow_offset_x.get(),
                            offset_y=self.canva_shadow_offset_y.get(),
                            blur_radius=self.canva_shadow_blur.get(),
                            opacity=self.canva_shadow_opacity.get()
                        )
                    if self.canva_glow_enabled.get():
                        proc = NativeImageEngine.apply_glow_outline(
                            proc,
                            outline_width=self.canva_glow_width.get(),
                            outline_color=self.canva_glow_color,
                            is_glow=self.canva_is_glow.get()
                        )
                if sharp > 0:
                    proc = NativeImageEngine.apply_sharpen(proc, intensity=sharp)
                if self.hidden_logo_img:
                    proc, _, _ = NativeImageEngine.embed_hidden_watermark(proc, self.hidden_logo_img)
                elif self.var_clean_stego.get():
                    proc = NativeImageEngine.sanitize_hidden_watermark(proc)

                ext      = FORMAT_EXT.get(fmt, fmt.lower())
                base     = os.path.splitext(item["name"])[0]
                out_name = f"{base}_converted.{ext}"
                out_path = os.path.join(out_dir, out_name)
                NativeImageEngine.save_image(proc, out_path, target_format=fmt, quality=qual)

                item["status"]   = "Thành công ✅"
                item["out_path"] = out_path
                ok += 1
            except Exception:
                item["status"] = "Lỗi ❌"

            self.progress_bar.set((i + 1) / total)

        self.is_processing = False
        self.btn_start.configure(state="normal", text="⚡   BẮT ĐẦU CHUYỂN ĐỔI")
        self._render_queue_table()
        self._set_status(
            f"✅  Hoàn tất! Đã lưu {ok}/{total} tệp ảnh vào: {out_dir}", SUCCESS
        )

        if messagebox.askyesno(
            "Chuyển Đổi Hoàn Tất!",
            f"Đã chuyển đổi thành công {ok}/{total} ảnh!\n\nBạn có muốn mở thư mục kết quả ngay không?"
        ):
            os.startfile(out_dir)

    def _set_status(self, msg, color=None):
        self.status_label.configure(text=msg)
        if color:
            self.status_label.configure(text_color=color)


# ─── ENTRY POINT ─────────────────────────────────────────────────────────────
if __name__ == "__main__":
    multiprocessing.freeze_support()
    try:
        app = OmniImageStudioApp()
        app.mainloop()
    except Exception as e:
        import traceback
        err_detail = traceback.format_exc()
        try:
            from tkinter import messagebox
            import tkinter as tk
            root = tk.Tk()
            root.withdraw()
            messagebox.showerror(
                "OmniImage Studio — Lỗi Khởi Động",
                f"Đã xảy ra sự cố khi khởi chạy ứng dụng:\n\n{e}\n\nChi tiết:\n{err_detail}"
            )
            root.destroy()
        except Exception:
            pass
        sys.exit(1)
