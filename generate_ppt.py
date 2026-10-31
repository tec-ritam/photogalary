import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

def create_deck():
    prs = Presentation()
    # 16:9 widescreen dimensions
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Colors
    BG_DARK = RGBColor(15, 23, 42)        # #0F172A Dark Slate
    BG_CARD = RGBColor(30, 41, 59)        # #1E293B Card Background
    BG_CARD_LIGHT = RGBColor(51, 65, 85)  # #334155
    PRIMARY_BLUE = RGBColor(66, 133, 244) # Google / PixVerse Blue
    ACCENT_PURPLE = RGBColor(121, 40, 202)# PixVerse Purple
    ACCENT_PINK = RGBColor(255, 0, 128)   # PixVerse Pink
    TEXT_LIGHT = RGBColor(248, 250, 252)  # Off-white
    TEXT_MUTED = RGBColor(148, 163, 184)  # Slate 400
    ACCENT_GREEN = RGBColor(52, 168, 83)  # Success Green
    ACCENT_AMBER = RGBColor(251, 188, 4)  # Warning Amber
    BORDER_COLOR = RGBColor(51, 65, 85)

    def set_slide_background(slide, color=BG_DARK):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), prs.slide_width, prs.slide_height)
        bg.fill.solid()
        bg.fill.fore_color.rgb = color
        bg.line.fill.background()
        return bg

    def add_header(slide, title_text, category_text="PIXVERSE ARCHITECTURE & FUNCTIONALITY"):
        # Category pill/badge
        badge = slide.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(8), Inches(0.35))
        tf_b = badge.text_frame
        tf_b.word_wrap = True
        p_b = tf_b.paragraphs[0]
        p_b.text = category_text.upper()
        p_b.font.size = Pt(11)
        p_b.font.bold = True
        p_b.font.color.rgb = PRIMARY_BLUE

        # Main Title
        title = slide.shapes.add_textbox(Inches(0.8), Inches(0.85), Inches(11.5), Inches(0.8))
        tf = title.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title_text
        p.font.size = Pt(26)
        p.font.bold = True
        p.font.color.rgb = TEXT_LIGHT

    def create_card(slide, left, top, width, height, bg_color=BG_CARD):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = bg_color
        card.line.color.rgb = BORDER_COLOR
        card.line.width = Pt(1)
        return card

    # ==========================================
    # SLIDE 1: Title Slide
    # ==========================================
    s1 = prs.slides.add_slide(blank_layout)
    set_slide_background(s1, RGBColor(10, 15, 30))

    # Decorative header element
    dec = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.8), Inches(1.2), Inches(0.08))
    dec.fill.solid()
    dec.fill.fore_color.rgb = ACCENT_PURPLE
    dec.line.fill.background()

    # Title
    t_box = s1.shapes.add_textbox(Inches(0.8), Inches(2.1), Inches(11.5), Inches(2.2))
    tf1 = t_box.text_frame
    tf1.word_wrap = True
    p1 = tf1.paragraphs[0]
    p1.text = "PixVerse Cloud Photo Gallery"
    p1.font.size = Pt(44)
    p1.font.bold = True
    p1.font.color.rgb = TEXT_LIGHT

    p1_sub = tf1.add_paragraph()
    p1_sub.text = "Comprehensive Architecture, Working Functions & Technical Feature Specification"
    p1_sub.font.size = Pt(20)
    p1_sub.font.color.rgb = PRIMARY_BLUE
    p1_sub.space_before = Pt(12)

    # Info Card at bottom
    c1 = create_card(s1, Inches(0.8), Inches(4.8), Inches(11.7), Inches(1.8))
    c1_tf = c1.text_frame
    c1_tf.word_wrap = True
    
    cp1 = c1_tf.paragraphs[0]
    cp1.text = "⚡ System Overview"
    cp1.font.size = Pt(14)
    cp1.font.bold = True
    cp1.font.color.rgb = ACCENT_AMBER

    cp2 = c1_tf.add_paragraph()
    cp2.text = "• Inspired by Google Photos (Material Design 3) with dynamic timeline grouping & story highlights."
    cp2.font.size = Pt(13)
    cp2.font.color.rgb = TEXT_LIGHT
    cp2.space_before = Pt(6)

    cp3 = c1_tf.add_paragraph()
    cp3.text = "• Powered by Supabase PostgreSQL 17 Database, Supabase Storage Bucket, and React 19 Frontend."
    cp3.font.size = Pt(13)
    cp3.font.color.rgb = TEXT_LIGHT

    cp4 = c1_tf.add_paragraph()
    cp4.text = "• Production deployment configured for Netlify SPA with dual-mode offline resilience."
    cp4.font.size = Pt(13)
    cp4.font.color.rgb = TEXT_LIGHT

    # ==========================================
    # SLIDE 2: Executive Summary & Highlights
    # ==========================================
    s2 = prs.slides.add_slide(blank_layout)
    set_slide_background(s2)
    add_header(s2, "Executive Summary & Core Value Propositions", "PLATFORM CAPABILITIES")

    pillars = [
        ("Google Photos UX", "Material Design 3 interface with date-grouped timeline stream, memories stories carousel, interactive lightboxes, and integrated image editor.", ACCENT_PURPLE),
        ("Supabase Cloud Backend", "Direct integration with hosted PostgreSQL 17 database, Row Level Security (RLS) policies, and high-performance public storage CDN.", PRIMARY_BLUE),
        ("Smart Upload & Categorization", "Photo upload dialog with auto-selected 'My Uploads' default category, custom title support, and instant custom category creation.", ACCENT_GREEN),
        ("Zero-Loss Category Deletion", "Users can delete custom categories safely; the system automatically reassigns all photos to 'My Uploads' with zero data loss.", ACCENT_AMBER)
    ]

    for i, (title, desc, color) in enumerate(pillars):
        x = Inches(0.8 + (i * 2.97))
        card = create_card(s2, x, Inches(1.8), Inches(2.8), Inches(4.8))
        tf = card.text_frame
        tf.word_wrap = True

        p = tf.paragraphs[0]
        p.text = f"0{i+1}"
        p.font.size = Pt(20)
        p.font.bold = True
        p.font.color.rgb = color

        p2 = tf.add_paragraph()
        p2.text = title
        p2.font.size = Pt(16)
        p2.font.bold = True
        p2.font.color.rgb = TEXT_LIGHT
        p2.space_before = Pt(8)

        p3 = tf.add_paragraph()
        p3.text = desc
        p3.font.size = Pt(12)
        p3.font.color.rgb = TEXT_MUTED
        p3.space_before = Pt(12)

    # ==========================================
    # SLIDE 3: System Architecture & Tech Stack
    # ==========================================
    s3 = prs.slides.add_slide(blank_layout)
    set_slide_background(s3)
    add_header(s3, "Full Stack Architecture & Cloud Infrastructure", "TECHNICAL STACK")

    # Left Column: Frontend
    c_fe = create_card(s3, Inches(0.8), Inches(1.8), Inches(3.7), Inches(5.0))
    tf = c_fe.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "🖥️ Client-Side Layer (React 19)"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = PRIMARY_BLUE

    items_fe = [
        ("React 19 & Vite 8", "High speed build & HMR client engine"),
        ("Material Symbols & Icons", "Google Material Design visual language"),
        ("CSS Variables & Themes", "Light/Dark mode & Google Sans typography"),
        ("Dual-Mode Storage", "Supabase live cloud sync + local cache fallback"),
        ("Netlify Ready", "netlify.toml + public/_redirects SPA support")
    ]
    for h, b in items_fe:
        p_h = tf.add_paragraph()
        p_h.text = f"• {h}"
        p_h.font.size = Pt(13)
        p_h.font.bold = True
        p_h.font.color.rgb = TEXT_LIGHT
        p_h.space_before = Pt(8)
        p_b = tf.add_paragraph()
        p_b.text = f"   {b}"
        p_b.font.size = Pt(11)
        p_b.font.color.rgb = TEXT_MUTED

    # Middle Column: Supabase Cloud Database
    c_be = create_card(s3, Inches(4.8), Inches(1.8), Inches(3.7), Inches(5.0))
    tf = c_be.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "⚡ Database & Cloud Storage"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = ACCENT_PURPLE

    items_be = [
        ("Supabase PostgreSQL 17", "Project 'pixverse-gallery' in ap-south-1"),
        ("Supabase Storage CDN", "Bucket 'photos' with public image URLs"),
        ("Row Level Security (RLS)", "Configured read/write access policies"),
        ("Database Tables", "profiles, categories, photos, features"),
        ("Schema Migrations", "Automated SQL migration pipeline via CLI")
    ]
    for h, b in items_be:
        p_h = tf.add_paragraph()
        p_h.text = f"• {h}"
        p_h.font.size = Pt(13)
        p_h.font.bold = True
        p_h.font.color.rgb = TEXT_LIGHT
        p_h.space_before = Pt(8)
        p_b = tf.add_paragraph()
        p_b.text = f"   {b}"
        p_b.font.size = Pt(11)
        p_b.font.color.rgb = TEXT_MUTED

    # Right Column: Deployment & Security
    c_dp = create_card(s3, Inches(8.8), Inches(1.8), Inches(3.7), Inches(5.0))
    tf = c_dp.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "🔒 Security & DevOps"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = ACCENT_GREEN

    items_dp = [
        ("Environment Variables", "VITE_SUPABASE_URL & ANON_KEY bindings"),
        ("JWT Client Auth", "Bearer token session storage & recovery"),
        ("Zero-Dependency Mode", "Self-contained browser DB fallback"),
        ("Content-Security & RLS", "MIME type verification & safe updates"),
        ("Sub-second Build", "Optimized Vite bundling built in 234ms")
    ]
    for h, b in items_dp:
        p_h = tf.add_paragraph()
        p_h.text = f"• {h}"
        p_h.font.size = Pt(13)
        p_h.font.bold = True
        p_h.font.color.rgb = TEXT_LIGHT
        p_h.space_before = Pt(8)
        p_b = tf.add_paragraph()
        p_b.text = f"   {b}"
        p_b.font.size = Pt(11)
        p_b.font.color.rgb = TEXT_MUTED

    # ==========================================
    # SLIDE 4: Full-Fledged Authentication System
    # ==========================================
    s4 = prs.slides.add_slide(blank_layout)
    set_slide_background(s4)
    add_header(s4, "Full-Fledged Authentication & Profile Management", "FEATURE DEEP DIVE")

    auth_features = [
        ("Multi-Tab Auth Modal", [
            "Seamless tabs: Sign In, Create Account, 1-Click Demo, and Forgot Password.",
            "Material 3 styling with clean modal backdrop and keyboard shortcuts.",
            "Clear validation error alerts and success confirmation banners."
        ]),
        ("Password Security & UX", [
            "Live password strength meter (Weak / Medium / Strong) with dynamic progress bar.",
            "Validation badges for 6+ characters, numbers, and uppercase characters.",
            "Interactive visibility toggle (eye icon) and password confirmation match check."
        ]),
        ("1-Click Demo Fast Access", [
            "Demo Member: username 'demo' | password 'password123' (General User)",
            "Alex Rivera: username 'alex' | password 'alex2026' (Pro Photographer)",
            "Instant evaluation for Netlify reviewers without registration friction."
        ]),
        ("User Profile & Customization", [
            "Account Popover displaying user role badge, email, and photo library shortcuts.",
            "Profile management dialog to update display name, email, and bio.",
            "8 Material avatar color swatches dynamically saved to user record in Postgres."
        ])
    ]

    for i, (title, points) in enumerate(auth_features):
        row = i // 2
        col = i % 2
        x = Inches(0.8 + (col * 5.95))
        y = Inches(1.8 + (row * 2.55))
        card = create_card(s4, x, y, Inches(5.75), Inches(2.35))
        tf = card.text_frame
        tf.word_wrap = True

        p = tf.paragraphs[0]
        p.text = f"🔑 {title}"
        p.font.size = Pt(15)
        p.font.bold = True
        p.font.color.rgb = PRIMARY_BLUE

        for pt in points:
            p_pt = tf.add_paragraph()
            p_pt.text = f"• {pt}"
            p_pt.font.size = Pt(11.5)
            p_pt.font.color.rgb = TEXT_LIGHT
            p_pt.space_before = Pt(4)

    # ==========================================
    # SLIDE 5: Upload & Category Selection System
    # ==========================================
    s5 = prs.slides.add_slide(blank_layout)
    set_slide_background(s5)
    add_header(s5, "Photo Upload Pipeline & Category Assignment", "WORKING FUNCTION")

    # Workflow steps across the slide
    steps = [
        ("Step 1: Selection", "User clicks 'Upload' and selects single or multiple image files (JPG, PNG, WebP). Thumbnails and sizes are calculated.", PRIMARY_BLUE),
        ("Step 2: Category Modal", "Interactive upload modal launches. Default category is automatically pre-selected as 'My Uploads' per user specification.", ACCENT_AMBER),
        ("Step 3: Customization", "User can keep 'My Uploads', select another existing category chip, or type a brand new custom category and title.", ACCENT_PURPLE),
        ("Step 4: Cloud Pipeline", "Uploads binary to Supabase Storage ('photos' bucket), fetches public CDN URL, and writes metadata row to Postgres.", ACCENT_GREEN)
    ]

    for i, (title, desc, color) in enumerate(steps):
        x = Inches(0.8 + (i * 2.97))
        card = create_card(s5, x, Inches(1.8), Inches(2.8), Inches(3.2))
        tf = card.text_frame
        tf.word_wrap = True

        p = tf.paragraphs[0]
        p.text = f"0{i+1}"
        p.font.size = Pt(22)
        p.font.bold = True
        p.font.color.rgb = color

        p2 = tf.add_paragraph()
        p2.text = title
        p2.font.size = Pt(15)
        p2.font.bold = True
        p2.font.color.rgb = TEXT_LIGHT
        p2.space_before = Pt(6)

        p3 = tf.add_paragraph()
        p3.text = desc
        p3.font.size = Pt(11.5)
        p3.font.color.rgb = TEXT_MUTED
        p3.space_before = Pt(8)

    # Bottom Callout Box
    c_bot = create_card(s5, Inches(0.8), Inches(5.3), Inches(11.7), Inches(1.6))
    tf_b = c_bot.text_frame
    tf_b.word_wrap = True
    pb1 = tf_b.paragraphs[0]
    pb1.text = "💡 Architectural Guarantee: Dual Storage Path"
    pb1.font.size = Pt(14)
    pb1.font.bold = True
    pb1.font.color.rgb = ACCENT_AMBER

    pb2 = tf_b.add_paragraph()
    pb2.text = "1. Cloud Path: High-resolution binaries are saved in Supabase S3-compatible cloud storage, generating permanent CDN URLs."
    pb2.font.size = Pt(12)
    pb2.font.color.rgb = TEXT_LIGHT
    pb2.space_before = Pt(4)

    pb3 = tf_b.add_paragraph()
    pb3.text = "2. Offline / Standalone Path: If network fails, local storage cache persists photos immediately so uploads are never lost."
    pb3.font.size = Pt(12)
    pb3.font.color.rgb = TEXT_LIGHT

    # ==========================================
    # SLIDE 6: Safe Category Deletion System
    # ==========================================
    s6 = prs.slides.add_slide(blank_layout)
    set_slide_background(s6)
    add_header(s6, "Safe Category Deletion System (Zero Photo Loss)", "DATA INTEGRITY")

    c_left = create_card(s6, Inches(0.8), Inches(1.8), Inches(5.7), Inches(5.0))
    tf = c_left.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "🛡️ Safe Deletion Logic & Workflow"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = ACCENT_GREEN

    points_del = [
        ("Protected System Categories", "Default categories ('All', 'Favorites', 'My Uploads') are protected from accidental removal."),
        ("One-Click Trigger Points", "Delete buttons (×) are embedded in top filter chips, Explore view cards, and Album collection tiles."),
        ("User Confirmation Safeguard", "A confirmation dialog warns the user that photos will be safely reassigned to 'My Uploads'."),
        ("Atomic Database Update", "Executes SQL: UPDATE photos SET category = 'My Uploads' WHERE category = ?; followed by DELETE FROM categories."),
        ("Real-time State Refresh", "UI chip selections and photo streams automatically refresh without requiring a manual page reload.")
    ]
    for h, b in points_del:
        ph = tf.add_paragraph()
        ph.text = f"• {h}"
        ph.font.size = Pt(12.5)
        ph.font.bold = True
        ph.font.color.rgb = TEXT_LIGHT
        ph.space_before = Pt(8)
        pb = tf.add_paragraph()
        pb.text = f"   {b}"
        pb.font.size = Pt(11)
        pb.font.color.rgb = TEXT_MUTED

    c_right = create_card(s6, Inches(6.8), Inches(1.8), Inches(5.7), Inches(5.0))
    tf_r = c_right.text_frame
    tf_r.word_wrap = True
    pr = tf_r.paragraphs[0]
    pr.text = "📊 State Transition Diagram"
    pr.font.size = Pt(16)
    pr.font.bold = True
    pr.font.color.rgb = PRIMARY_BLUE

    diagram_steps = [
        ("1. User Action", "User clicks delete icon on custom category 'Travel'"),
        ("2. Dialog Prompt", "Confirms category removal while guaranteeing photo preservation"),
        ("3. Postgres Query 1", "UPDATE photos SET category = 'My Uploads' WHERE category = 'Travel'"),
        ("4. Postgres Query 2", "DELETE FROM categories WHERE name = 'Travel'"),
        ("5. State Sync", "Active filter switches to 'All'; photos remain accessible in 'My Uploads'")
    ]
    for step, desc in diagram_steps:
        ps = tf_r.add_paragraph()
        ps.text = f"▶ {step}"
        ps.font.size = Pt(12.5)
        ps.font.bold = True
        ps.font.color.rgb = ACCENT_AMBER
        ps.space_before = Pt(8)
        pd = tf_r.add_paragraph()
        pd.text = f"   {desc}"
        pd.font.size = Pt(11)
        pd.font.color.rgb = TEXT_LIGHT

    # ==========================================
    # SLIDE 7: Timeline, Memories & Photo Viewer
    # ==========================================
    s7 = prs.slides.add_slide(blank_layout)
    set_slide_background(s7)
    add_header(s7, "Google Photos Stream, Memories & Lightbox", "VIEWING EXPERIENCE")

    features_view = [
        ("Date-Grouped Timeline", "Photos automatically sort and cluster into date headings: 'Today', 'Yesterday', 'Month Year', and 'Earlier', mimicking Google Photos' stream.", PRIMARY_BLUE),
        ("Memories Stories Bar", "Instagram/Google Photos style story highlights: '1 Year Ago', 'Best of Nature', 'Travel Journeys', and 'Your Favorites' with 4.5s auto-advance.", ACCENT_PURPLE),
        ("Fullscreen Lightbox", "High-fidelity modal with multi-level zoom (1x to 2.5x), smooth arrow key keyboard navigation, image metadata info, and fast download.", ACCENT_PINK),
        ("Integrated Photo Editor", "Real-time client-side image editor with preset filters (Vivid, Warm, Cool, Noir) and fine adjustments for Brightness, Contrast, Saturation, Warmth.", ACCENT_GREEN)
    ]

    for i, (title, desc, color) in enumerate(features_view):
        x = Inches(0.8 + (i * 2.97))
        card = create_card(s7, x, Inches(1.8), Inches(2.8), Inches(4.8))
        tf = card.text_frame
        tf.word_wrap = True

        p = tf.paragraphs[0]
        p.text = "📸"
        p.font.size = Pt(24)

        p2 = tf.add_paragraph()
        p2.text = title
        p2.font.size = Pt(16)
        p2.font.bold = True
        p2.font.color.rgb = color
        p2.space_before = Pt(8)

        p3 = tf.add_paragraph()
        p3.text = desc
        p3.font.size = Pt(12)
        p3.font.color.rgb = TEXT_LIGHT
        p3.space_before = Pt(12)

    # ==========================================
    # SLIDE 8: Selection, Favorites & Trash Lifecycle
    # ==========================================
    s8 = prs.slides.add_slide(blank_layout)
    set_slide_background(s8)
    add_header(s8, "Batch Multi-Selection, Favorites & Trash Lifecycle", "COLLECTION CONTROLS")

    ops = [
        ("Multi-Selection Mode", "Hover checkboxes allow selecting multiple photos simultaneously. Floating top action bar displays selection count, select all, batch star, and batch trash.", PRIMARY_BLUE),
        ("Instant Favorites (Starred)", "One-click star icon toggles favorite status both locally and on Supabase database. Dedicated 'Favorites' sidebar tab filters all starred moments.", ACCENT_AMBER),
        ("Two-Stage Trash Safety", "Moving a photo to Trash is soft-deleted (is_trashed = true). Photos stay recoverable in the Trash tab without cluttering the main stream.", ACCENT_PURPLE),
        ("Restore or Permanent Delete", "From the Trash view, users can restore photos back to their original albums or permanently delete records and assets from Supabase.", RGBColor(234, 67, 53))
    ]

    for i, (title, desc, color) in enumerate(ops):
        x = Inches(0.8 + (i * 2.97))
        card = create_card(s8, x, Inches(1.8), Inches(2.8), Inches(4.8))
        tf = card.text_frame
        tf.word_wrap = True

        p = tf.paragraphs[0]
        p.text = "⭐" if i == 1 else ("🗑️" if i >= 2 else "☑️")
        p.font.size = Pt(24)

        p2 = tf.add_paragraph()
        p2.text = title
        p2.font.size = Pt(16)
        p2.font.bold = True
        p2.font.color.rgb = color
        p2.space_before = Pt(8)

        p3 = tf.add_paragraph()
        p3.text = desc
        p3.font.size = Pt(12)
        p3.font.color.rgb = TEXT_LIGHT
        p3.space_before = Pt(12)

    # ==========================================
    # SLIDE 9: Supabase Database Schema & Storage
    # ==========================================
    s9 = prs.slides.add_slide(blank_layout)
    set_slide_background(s9)
    add_header(s9, "Supabase Cloud Database Schema & Policies", "POSTGRES SPECIFICATION")

    # Tables overview
    tables = [
        ("public.photos", "Primary asset table: id (text), title, category, url, date_added, rating, is_favorite, is_trashed, album, user_id, uploader_name, size, dimensions.", PRIMARY_BLUE),
        ("public.profiles", "User identity table: id (text), username, email, name, role ('Member' | 'Pro Photographer'), avatar_color, avatar_url, bio, created_at.", ACCENT_PURPLE),
        ("public.categories", "Category registry: id (identity), name (unique), created_at. Pre-seeded with Nature, Travel, Architecture, Abstract, Portraits, My Uploads.", ACCENT_GREEN),
        ("storage.buckets ('photos')", "Public image bucket storing binary assets with 50MB file size limit and strict MIME validation (JPEG, PNG, WebP, GIF).", ACCENT_AMBER)
    ]

    for i, (tbl, details, col) in enumerate(tables):
        row = i // 2
        col_idx = i % 2
        x = Inches(0.8 + (col_idx * 5.95))
        y = Inches(1.8 + (row * 2.55))
        card = create_card(s9, x, y, Inches(5.75), Inches(2.35))
        tf = card.text_frame
        tf.word_wrap = True

        p = tf.paragraphs[0]
        p.text = f"🗃️ {tbl}"
        p.font.size = Pt(15)
        p.font.bold = True
        p.font.color.rgb = col

        p_desc = tf.add_paragraph()
        p_desc.text = details
        p_desc.font.size = Pt(12)
        p_desc.font.color.rgb = TEXT_LIGHT
        p_desc.space_before = Pt(8)

    # ==========================================
    # SLIDE 10: Netlify Deployment & DevOps Guide
    # ==========================================
    s10 = prs.slides.add_slide(blank_layout)
    set_slide_background(s10)
    add_header(s10, "Netlify Production Deployment & Environment Variables", "DEVOPS GUIDE")

    c1 = create_card(s10, Inches(0.8), Inches(1.8), Inches(5.7), Inches(5.0))
    tf1 = c1.text_frame
    tf1.word_wrap = True
    p1 = tf1.paragraphs[0]
    p1.text = "🚀 Netlify Deployment Options"
    p1.font.size = Pt(16)
    p1.font.bold = True
    p1.font.color.rgb = PRIMARY_BLUE

    opts = [
        ("Option A: Drag & Drop (Zero Setup)", "Run 'npm run build' locally. Drag the generated 'dist/' folder directly into app.netlify.com/drop. The site goes live immediately!"),
        ("Option B: Git-Connected CI/CD", "Push repository to GitHub. Netlify reads 'netlify.toml' automatically: build command is 'npm run build' and publish directory is 'dist'."),
        ("Single Page App (SPA) Routing", "Configured '_redirects' file ensures client-side deep links and refreshes route to /index.html with status 200.")
    ]
    for h, b in opts:
        ph = tf1.add_paragraph()
        ph.text = f"• {h}"
        ph.font.size = Pt(13)
        ph.font.bold = True
        ph.font.color.rgb = TEXT_LIGHT
        ph.space_before = Pt(10)
        pb = tf1.add_paragraph()
        pb.text = f"   {b}"
        pb.font.size = Pt(11)
        pb.font.color.rgb = TEXT_MUTED

    c2 = create_card(s10, Inches(6.8), Inches(1.8), Inches(5.7), Inches(5.0))
    tf2 = c2.text_frame
    tf2.word_wrap = True
    p2 = tf2.paragraphs[0]
    p2.text = "🔐 Environment Variable Configuration"
    p2.font.size = Pt(16)
    p2.font.bold = True
    p2.font.color.rgb = ACCENT_AMBER

    envs = [
        ("VITE_SUPABASE_URL", "https://ioojwbryftvwpvlcnskq.supabase.co", "Connects Vite client to your dedicated Supabase instance."),
        ("VITE_SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI...", "Public client key for authenticated API requests."),
        ("VITE_SUPABASE_PROJECT_ID", "ioojwbryftvwpvlcnskq", "Project reference ID for dashboard & CLI bindings.")
    ]
    for key, val, note in envs:
        pk = tf2.add_paragraph()
        pk.text = f"Key: {key}"
        pk.font.size = Pt(13)
        pk.font.bold = True
        pk.font.color.rgb = ACCENT_GREEN
        pk.space_before = Pt(10)

        pv = tf2.add_paragraph()
        pv.text = f"Value: {val[:35]}..."
        pv.font.size = Pt(11)
        pv.font.color.rgb = TEXT_LIGHT

        pn = tf2.add_paragraph()
        pn.text = f"Purpose: {note}"
        pn.font.size = Pt(10.5)
        pn.font.color.rgb = TEXT_MUTED

    # ==========================================
    # SLIDE 11: Summary & Conclusion
    # ==========================================
    s11 = prs.slides.add_slide(blank_layout)
    set_slide_background(s11, RGBColor(10, 15, 30))

    t_box = s11.shapes.add_textbox(Inches(0.8), Inches(1.5), Inches(11.5), Inches(1.5))
    tf_end = t_box.text_frame
    tf_end.word_wrap = True
    pe1 = tf_end.paragraphs[0]
    pe1.text = "PixVerse — Ready for Production"
    pe1.font.size = Pt(36)
    pe1.font.bold = True
    pe1.font.color.rgb = TEXT_LIGHT

    pe2 = tf_end.add_paragraph()
    pe2.text = "All requested features are fully developed, verified, and backed by live cloud storage."
    pe2.font.size = Pt(18)
    pe2.font.color.rgb = PRIMARY_BLUE
    pe2.space_before = Pt(8)

    # Checklist Card
    c_check = create_card(s11, Inches(0.8), Inches(3.2), Inches(11.7), Inches(3.5))
    tf_c = c_check.text_frame
    tf_c.word_wrap = True

    checks = [
        "✅ Full-Fledged Authentication: Register, Sign In, Show/Hide Password, Strength Meter, 1-Click Demo accounts.",
        "✅ Supabase PostgreSQL & Storage: Live cloud persistence, dedicated 'photos' bucket with public image URLs.",
        "✅ Smart Category Upload: Category modal with 'My Uploads' default selection & custom category creation.",
        "✅ Safe Category Deletion: Zero-photo-loss architecture reassigns photos safely to 'My Uploads'.",
        "✅ Google Photos Experience: Date-grouped timeline, story highlights carousel, lightbox, and photo editor.",
        "✅ Netlify Optimized: Instant deployment via drag-and-drop or git with netlify.toml and SPA redirects."
    ]

    p_init = tf_c.paragraphs[0]
    p_init.text = "Feature Completion Checklist:"
    p_init.font.size = Pt(15)
    p_init.font.bold = True
    p_init.font.color.rgb = ACCENT_AMBER

    for chk in checks:
        pc = tf_c.add_paragraph()
        pc.text = chk
        pc.font.size = Pt(12.5)
        pc.font.color.rgb = TEXT_LIGHT
        pc.space_before = Pt(6)

    output_path = r"E:\full stack\fsproject\photogalary\PixVerse_Full_Functionality_Presentation.pptx"
    prs.save(output_path)
    print(f"Presentation successfully created at: {output_path}")

if __name__ == "__main__":
    create_deck()
