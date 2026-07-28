"""
CREATIVE PDF Generator — AI Accounting Research Paper
Premium multi-color design with cover page, sidebar accents,
styled tables, code blocks, pull-quotes, and a watermark.

Requirements: pip install reportlab
"""

import os
import re
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, PageBreak, Preformatted, KeepTogether
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY, TA_RIGHT
from reportlab.platypus.flowables import Flowable
from reportlab.pdfgen import canvas as pdfcanvas

# ─── Paths ────────────────────────────────────────────────────────────────────
INPUT_MD   = os.path.join(os.path.dirname(__file__), "01_Research_Paper.md")
OUTPUT_PDF = os.path.join(
    os.path.dirname(__file__), "..",
    "Final_Research_Paper_AI_Accounting_Assistant.pdf"
)

# ─── Premium Color Palette ────────────────────────────────────────────────────
C_NAVY        = colors.HexColor("#0A1628")   # deep navy background
C_NAVY_MID    = colors.HexColor("#112244")   # mid navy
C_BLUE        = colors.HexColor("#1565C0")   # primary blue
C_BLUE_LIGHT  = colors.HexColor("#1E88E5")   # lighter blue
C_TEAL        = colors.HexColor("#00838F")   # teal accent
C_TEAL_LIGHT  = colors.HexColor("#00BCD4")   # bright teal
C_GOLD        = colors.HexColor("#F9A825")   # gold accent
C_GOLD_LIGHT  = colors.HexColor("#FFD54F")   # light gold
C_PURPLE      = colors.HexColor("#4527A0")   # purple
C_GREEN       = colors.HexColor("#2E7D32")   # success green
C_DARK        = colors.HexColor("#1A1A2E")   # near black
C_GRAY_DARK   = colors.HexColor("#37474F")   # dark gray text
C_GRAY_MID    = colors.HexColor("#78909C")   # medium gray
C_GRAY_LIGHT  = colors.HexColor("#ECEFF1")   # very light gray bg
C_WHITE       = colors.white
C_ACCENT_LINE = colors.HexColor("#00BCD4")   # teal line accents
C_TBL_HEADER  = colors.HexColor("#0D2B5E")   # table header
C_TBL_ALT     = colors.HexColor("#E8F4FD")   # table alt row


# ─── Sidebar Accent Flowable ─────────────────────────────────────────────────
class SidebarParagraph(Flowable):
    """Paragraph with a colored left sidebar bar."""
    def __init__(self, text, bar_color=C_BLUE_LIGHT, bg_color=None,
                 font="Helvetica", font_size=10, text_color=C_GRAY_DARK,
                 padding=10, width=None):
        super().__init__()
        self.text = text
        self.bar_color = bar_color
        self.bg_color = bg_color
        self.font = font
        self.font_size = font_size
        self.text_color = text_color
        self.padding = padding
        self._width = width or (A4[0] - 4 * cm)
        self._height = None

    def wrap(self, availWidth, availHeight):
        self._width = availWidth
        # Estimate height
        chars_per_line = max(1, int((availWidth - self.padding * 2 - 8) / (self.font_size * 0.55)))
        lines = max(1, len(self.text) // chars_per_line + 1)
        self._height = lines * self.font_size * 1.4 + self.padding * 2
        return (availWidth, self._height)

    def draw(self):
        c = self.canv
        w, h = self._width, self._height
        # Background
        if self.bg_color:
            c.setFillColor(self.bg_color)
            c.roundRect(0, 0, w, h, 4, fill=1, stroke=0)
        # Sidebar bar
        c.setFillColor(self.bar_color)
        c.roundRect(0, 0, 5, h, 2, fill=1, stroke=0)
        # Text
        c.setFillColor(self.text_color)
        c.setFont(self.font, self.font_size)
        text_x = self.padding + 6
        text_y = h - self.padding - self.font_size
        # Simple word wrap
        words = self.text.split()
        line = ""
        max_w = w - text_x - self.padding
        for word in words:
            test = (line + " " + word).strip()
            if c.stringWidth(test, self.font, self.font_size) < max_w:
                line = test
            else:
                c.drawString(text_x, text_y, line)
                text_y -= self.font_size * 1.4
                line = word
        if line:
            c.drawString(text_x, text_y, line)


class GradientRect(Flowable):
    """A horizontal gradient rectangle (simulated with stripes)."""
    def __init__(self, width, height, color1, color2, stripes=40):
        super().__init__()
        self.width = width
        self.height = height
        self.color1 = color1
        self.color2 = color2
        self.stripes = stripes

    def wrap(self, aw, ah):
        return (self.width, self.height)

    def draw(self):
        c = self.canv
        r1, g1, b1 = self.color1.red, self.color1.green, self.color1.blue
        r2, g2, b2 = self.color2.red, self.color2.green, self.color2.blue
        stripe_w = self.width / self.stripes
        for i in range(self.stripes):
            t = i / self.stripes
            r = r1 + (r2 - r1) * t
            g = g1 + (g2 - g1) * t
            b = b1 + (b2 - b1) * t
            c.setFillColorRGB(r, g, b)
            c.rect(i * stripe_w, 0, stripe_w + 0.5, self.height, fill=1, stroke=0)


# ─── Style Factory ───────────────────────────────────────────────────────────
def build_styles():
    return {
        "cover_title": ParagraphStyle("CoverTitle",
            fontName="Helvetica-Bold", fontSize=28, textColor=C_WHITE,
            alignment=TA_CENTER, leading=36, spaceAfter=8),
        "cover_subtitle": ParagraphStyle("CoverSub",
            fontName="Helvetica", fontSize=14, textColor=C_TEAL_LIGHT,
            alignment=TA_CENTER, leading=20, spaceAfter=6),
        "cover_meta": ParagraphStyle("CoverMeta",
            fontName="Helvetica", fontSize=11, textColor=C_GOLD_LIGHT,
            alignment=TA_CENTER, leading=18),
        "h1": ParagraphStyle("H1",
            fontName="Helvetica-Bold", fontSize=17, textColor=C_BLUE,
            spaceBefore=20, spaceAfter=8, leading=24,
            borderPad=0),
        "h2": ParagraphStyle("H2",
            fontName="Helvetica-Bold", fontSize=13, textColor=C_NAVY_MID,
            spaceBefore=15, spaceAfter=5, leading=18),
        "h3": ParagraphStyle("H3",
            fontName="Helvetica-Bold", fontSize=11, textColor=C_TEAL,
            spaceBefore=10, spaceAfter=3, leading=16),
        "h4": ParagraphStyle("H4",
            fontName="Helvetica-Bold", fontSize=10, textColor=C_PURPLE,
            spaceBefore=8, spaceAfter=2, leading=14),
        "body": ParagraphStyle("Body",
            fontName="Helvetica", fontSize=10, textColor=C_GRAY_DARK,
            alignment=TA_JUSTIFY, spaceAfter=6, leading=16),
        "bullet": ParagraphStyle("Bullet",
            fontName="Helvetica", fontSize=10, textColor=C_GRAY_DARK,
            leftIndent=20, spaceBefore=2, spaceAfter=2, leading=15,
            bulletIndent=8),
        "code": ParagraphStyle("Code",
            fontName="Courier", fontSize=8, textColor=C_NAVY,
            backColor=C_GRAY_LIGHT, leftIndent=10, rightIndent=10,
            spaceBefore=6, spaceAfter=6, leading=12),
        "meta_text": ParagraphStyle("MetaText",
            fontName="Helvetica", fontSize=10, textColor=C_GRAY_DARK, leading=16),
        "section_number": ParagraphStyle("SectionNum",
            fontName="Helvetica-Bold", fontSize=40, textColor=C_GRAY_LIGHT,
            alignment=TA_RIGHT),
        "toc_item": ParagraphStyle("TOC",
            fontName="Helvetica", fontSize=10, textColor=C_GRAY_DARK,
            leftIndent=12, leading=18),
        "toc_h2": ParagraphStyle("TOCH2",
            fontName="Helvetica-Bold", fontSize=10, textColor=C_BLUE,
            leftIndent=0, leading=20, spaceBefore=4),
        "chip": ParagraphStyle("Chip",
            fontName="Helvetica-Bold", fontSize=9, textColor=C_WHITE,
            alignment=TA_CENTER),
        "abstract": ParagraphStyle("Abstract",
            fontName="Helvetica", fontSize=10, textColor=C_GRAY_DARK,
            alignment=TA_JUSTIFY, leading=16, leftIndent=10, rightIndent=10),
    }


# ─── Cover Page ──────────────────────────────────────────────────────────────
def make_cover(styles, page_width, page_height):
    story = []

    # Full-bleed dark navy gradient header block (simulated with table)
    header_content = [
        [Paragraph("AI-Powered Accounting", styles["cover_title"])],
        [Paragraph("&amp; Finance Assistant", styles["cover_title"])],
        [Spacer(1, 8)],
        [Paragraph("A Research Paper on AI Automation in Accounting Workflows",
                   styles["cover_subtitle"])],
    ]
    header_tbl = Table(header_content, colWidths=[page_width - 4*cm])
    header_tbl.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), C_NAVY),
        ("TOPPADDING",    (0, 0), (-1, -1), 30),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("LEFTPADDING",   (0, 0), (-1, -1), 25),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 25),
    ]))
    story.append(header_tbl)

    # Gold gradient accent strip
    story.append(GradientRect(page_width - 4*cm, 8, C_GOLD, C_TEAL))
    story.append(Spacer(1, 18))

    # Keyword chips row
    chips = ["PydanticAI", "FastAPI", "Next.js", "Supabase", "Gemini 2.0 Flash", "Python uv"]
    chip_cells = []
    for chip in chips:
        p = Paragraph(chip, styles["chip"])
        chip_cells.append(p)
    chip_row = [chip_cells]
    chip_widths = [(page_width - 4*cm) / len(chips)] * len(chips)
    chip_tbl = Table(chip_row, colWidths=chip_widths)
    chip_tbl.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), C_BLUE),
        ("TOPPADDING",    (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING",   (0, 0), (-1, -1), 4),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 4),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1),
         [C_BLUE, C_TEAL, C_PURPLE, C_BLUE, C_TEAL, C_PURPLE]),
        ("ALIGN",         (0, 0), (-1, -1), "CENTER"),
        ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
    ]))
    story.append(chip_tbl)
    story.append(Spacer(1, 24))

    # Meta info box
    meta_rows = [
        ["Prepared By",    "Muhammad Talha Khan"],
        ["Organization",   "Cyber Nuts"],
        ["Submission Date", datetime.now().strftime("%B %Y")],
        ["Assignment",     "Full-Stack AI Developer Intern — Phase 1"],
        ["Primary Model",  "Google Gemini 2.0 Flash"],
        ["Framework",      "PydanticAI + FastAPI + Next.js + Supabase"],
    ]
    para_rows = []
    for label, value in meta_rows:
        para_rows.append([
            Paragraph(f"<b>{label}</b>", ParagraphStyle("MetaL",
                fontName="Helvetica-Bold", fontSize=10, textColor=C_WHITE)),
            Paragraph(value, ParagraphStyle("MetaV",
                fontName="Helvetica", fontSize=10, textColor=C_GOLD_LIGHT)),
        ])
    meta_tbl = Table(para_rows, colWidths=[5*cm, (page_width - 4*cm - 5*cm)])
    meta_tbl.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), C_NAVY_MID),
        ("TOPPADDING",    (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
        ("LEFTPADDING",   (0, 0), (-1, -1), 16),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 16),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [C_NAVY_MID, C_NAVY]),
        ("LINEBELOW",     (0, 0), (-1, -2), 0.4, colors.HexColor("#1E3A6A")),
        ("BOX",           (0, 0), (-1, -1), 1, C_TEAL),
    ]))
    story.append(meta_tbl)
    story.append(Spacer(1, 20))

    # Bottom teal accent line + watermark text
    story.append(GradientRect(page_width - 4*cm, 4, C_TEAL, C_BLUE))
    story.append(Spacer(1, 10))
    story.append(Paragraph(
        "CONFIDENTIAL — Internship Submission Document — Cyber Nuts 2026",
        ParagraphStyle("Footer", fontName="Helvetica", fontSize=8,
                       textColor=C_GRAY_MID, alignment=TA_CENTER)
    ))
    story.append(PageBreak())
    return story


# ─── Table of Contents Page ──────────────────────────────────────────────────
def make_toc(styles, page_width):
    story = []
    toc_header = Table([[Paragraph("Table of Contents", ParagraphStyle(
        "TOCH", fontName="Helvetica-Bold", fontSize=20, textColor=C_WHITE,
        alignment=TA_CENTER))]],
        colWidths=[page_width - 4*cm])
    toc_header.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), C_BLUE),
        ("TOPPADDING",    (0, 0), (-1, -1), 14),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 14),
        ("LEFTPADDING",   (0, 0), (-1, -1), 20),
    ]))
    story.append(toc_header)
    story.append(GradientRect(page_width - 4*cm, 5, C_GOLD, C_TEAL))
    story.append(Spacer(1, 16))

    toc_items = [
        ("1.", "Introduction", False),
        ("2.", "Core Responsibilities of an Accountant / CA", False),
        ("", "2.1 Daily Tasks", True),
        ("", "2.2 Monthly Tasks", True),
        ("", "2.3 Yearly & Ongoing Tasks", True),
        ("3.", "AI Automation Feasibility Mapping", False),
        ("4.", "Agentic AI Frameworks — Comparative Analysis", False),
        ("", "4.1 OpenAI Agents SDK", True),
        ("", "4.2 LangGraph", True),
        ("", "4.3 CrewAI", True),
        ("", "4.4 PydanticAI / Custom Tool-Calling Loop (Our Choice)", True),
        ("5.", "AI Model Selection", False),
        ("6.", "System Architecture", False),
        ("7.", "Derived Feature List", False),
        ("8.", "Conclusion", False),
        ("9.", "References", False),
    ]

    for num, title, is_sub in toc_items:
        if is_sub:
            row = [
                Paragraph("", styles["toc_item"]),
                Paragraph(f"&nbsp;&nbsp;&nbsp;{num} {title}", styles["toc_item"]),
                Paragraph("· · · · ·", ParagraphStyle("Dots",
                    fontName="Helvetica", fontSize=8, textColor=C_GRAY_MID,
                    alignment=TA_RIGHT)),
            ]
        else:
            row = [
                Paragraph(f"<b>{num}</b>", ParagraphStyle("TocNum",
                    fontName="Helvetica-Bold", fontSize=11, textColor=C_BLUE)),
                Paragraph(f"<b>{title}</b>", styles["toc_h2"]),
                Paragraph("· · · · ·", ParagraphStyle("Dots",
                    fontName="Helvetica", fontSize=8, textColor=C_GRAY_MID,
                    alignment=TA_RIGHT)),
            ]
        toc_row_tbl = Table([row], colWidths=[1.2*cm, 13*cm, 2*cm])
        toc_row_tbl.setStyle(TableStyle([
            ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING",    (0, 0), (-1, -1), 5 if not is_sub else 2),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5 if not is_sub else 2),
            ("LINEBELOW",     (0, 0), (-1, -1), 0.3, C_GRAY_LIGHT),
        ]))
        story.append(toc_row_tbl)

    story.append(PageBreak())
    return story


# ─── Section Header Banner ───────────────────────────────────────────────────
def section_banner(number, title, styles, page_width, color=C_BLUE):
    row = [[
        Paragraph(str(number), ParagraphStyle("Num",
            fontName="Helvetica-Bold", fontSize=24, textColor=C_GOLD,
            alignment=TA_CENTER)),
        Paragraph(title, ParagraphStyle("BannerTitle",
            fontName="Helvetica-Bold", fontSize=14, textColor=C_WHITE,
            leading=20)),
    ]]
    tbl = Table(row, colWidths=[1.5*cm, (page_width - 4*cm - 1.5*cm)])
    tbl.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), color),
        ("TOPPADDING",    (0, 0), (-1, -1), 12),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
        ("LEFTPADDING",   (0, 0), (-1, -1), 14),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 14),
        ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
    ]))
    return [tbl, GradientRect(page_width - 4*cm, 4, C_GOLD, C_TEAL), Spacer(1, 10)]


def format_md(text):
    text = re.sub(r"\*\*(.*?)\*\*", r"<b>\1</b>", text)
    text = re.sub(r"\*(.*?)\*", r"<i>\1</i>", text)
    text = text.replace("**", "").replace("*", "")
    return text

# ─── Markdown Table Renderer ─────────────────────────────────────────────────
def render_md_table(lines, page_width):
    rows = []
    header_done = False
    for line in lines:
        if re.match(r"^\|[-| :]+\|$", line.strip()):
            header_done = True
            continue
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        rows.append(cells)

    if not rows:
        return None

    num_cols = len(rows[0])
    col_w = (page_width - 4*cm) / num_cols

    para_rows = []
    for i, row in enumerate(rows):
        is_header = (i == 0)
        pr = []
        for cell in row:
            cell_clean = format_md(cell)
            pr.append(Paragraph(cell_clean, ParagraphStyle(
                f"TC{i}",
                fontName="Helvetica-Bold" if is_header else "Helvetica",
                fontSize=8 if not is_header else 8,
                textColor=C_WHITE if is_header else C_GRAY_DARK,
                leading=12, wordWrap="CJK")))
        para_rows.append(pr)

    t = Table(para_rows, colWidths=[col_w] * num_cols, repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND",     (0, 0), (-1, 0),  C_TBL_HEADER),
        ("FONTNAME",       (0, 0), (-1, 0),  "Helvetica-Bold"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [C_WHITE, C_TBL_ALT]),
        ("GRID",           (0, 0), (-1, -1),  0.4, C_GRAY_MID),
        ("TOPPADDING",     (0, 0), (-1, -1),  6),
        ("BOTTOMPADDING",  (0, 0), (-1, -1),  6),
        ("LEFTPADDING",    (0, 0), (-1, -1),  7),
        ("RIGHTPADDING",   (0, 0), (-1, -1),  7),
        ("VALIGN",         (0, 0), (-1, -1),  "MIDDLE"),
        ("LINEBELOW",      (0, 0), (-1, 0),   1.5, C_GOLD),
    ]))
    return t


# ─── Markdown → Flowables ────────────────────────────────────────────────────
def md_to_flowables(md_text, styles, page_width):
    elements = []
    lines = md_text.split("\n")
    i = 0
    in_code = False
    code_lines = []
    table_lines = []
    section_num = 0

    while i < len(lines):
        line = lines[i]

        # Code block toggle
        if line.strip().startswith("```"):
            if not in_code:
                in_code = True
                code_lines = []
            else:
                in_code = False
                code_text = "\n".join(code_lines)
                # Styled code box
                code_tbl = Table([[Preformatted(code_text, ParagraphStyle(
                    "CodeInner", fontName="Courier", fontSize=8,
                    textColor=C_NAVY, leading=11))]],
                    colWidths=[page_width - 4*cm])
                code_tbl.setStyle(TableStyle([
                    ("BACKGROUND",    (0, 0), (-1, -1), C_GRAY_LIGHT),
                    ("BOX",           (0, 0), (-1, -1), 1, C_ACCENT_LINE),
                    ("LEFTPADDING",   (0, 0), (-1, -1), 10),
                    ("RIGHTPADDING",  (0, 0), (-1, -1), 10),
                    ("TOPPADDING",    (0, 0), (-1, -1), 8),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ]))
                elements.append(Spacer(1, 5))
                elements.append(code_tbl)
                elements.append(Spacer(1, 5))
            i += 1
            continue

        if in_code:
            code_lines.append(line)
            i += 1
            continue

        # Markdown table accumulation
        if line.strip().startswith("|"):
            table_lines.append(line)
            i += 1
            continue
        else:
            if table_lines:
                t = render_md_table(table_lines, page_width)
                if t:
                    elements.append(Spacer(1, 6))
                    elements.append(t)
                    elements.append(Spacer(1, 10))
                table_lines = []

        stripped = line.strip()

        # H1 — Section banner
        if line.startswith("# ") and not line.startswith("## "):
            text = line[2:].strip()
            # Skip the document title (already on cover)
            if "AI-Powered Accounting" in text:
                i += 1
                continue
            section_num += 1
            elements += section_banner(section_num, text, styles,
                                       page_width, C_BLUE)

        # H2 — Subsection with teal left bar
        elif line.startswith("## "):
            text = line[3:].strip()
            if text in ("Abstract", "Table of Contents"):
                i += 1
                continue
            elements.append(Spacer(1, 8))
            elements.append(HRFlowable(width="100%", thickness=0.5,
                                       color=C_GRAY_LIGHT, spaceAfter=4))
            elements.append(Paragraph(text, styles["h2"]))

        # H3
        elif line.startswith("### "):
            text = line[4:].strip()
            sb_row = Table([[Paragraph(text, ParagraphStyle("H3Inner",
                fontName="Helvetica-Bold", fontSize=11,
                textColor=C_WHITE, leading=16))]],
                colWidths=[page_width - 4*cm])
            sb_row.setStyle(TableStyle([
                ("BACKGROUND",    (0, 0), (-1, -1), C_TEAL),
                ("TOPPADDING",    (0, 0), (-1, -1), 7),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
                ("LEFTPADDING",   (0, 0), (-1, -1), 12),
                ("RIGHTPADDING",  (0, 0), (-1, -1), 12),
            ]))
            elements.append(Spacer(1, 8))
            elements.append(sb_row)
            elements.append(Spacer(1, 5))

        # H4
        elif line.startswith("#### "):
            text = line[5:].strip()
            text = format_md(text)
            elements.append(Paragraph(text, styles["h4"]))

        # Horizontal rule
        elif stripped.startswith("---"):
            elements.append(Spacer(1, 5))
            elements.append(HRFlowable(width="100%", thickness=1.5,
                                       color=C_BLUE_LIGHT))
            elements.append(Spacer(1, 5))

        # Bullet
        elif stripped.startswith("- ") or stripped.startswith("* "):
            text = stripped[2:].strip()
            text = format_md(text)
            text = re.sub(r"`(.+?)`",
                          r"<font name='Courier' color='#0D2B5E'>\1</font>", text)
            elements.append(Paragraph(
                f'<font color="#1E88E5">&#9654;</font>  {text}',
                styles["bullet"]))

        # Numbered list
        elif re.match(r"^\d+\. ", stripped):
            num_text = re.sub(r"^\d+\. ", "", stripped)
            num_only = re.match(r"^(\d+)\.", stripped).group(1)
            num_text = format_md(num_text)
            row = [[
                Paragraph(f"<b>{num_only}</b>", ParagraphStyle("NumCircle",
                    fontName="Helvetica-Bold", fontSize=9,
                    textColor=C_WHITE, alignment=TA_CENTER)),
                Paragraph(num_text, ParagraphStyle("NumBody",
                    fontName="Helvetica", fontSize=10,
                    textColor=C_GRAY_DARK, leading=15)),
            ]]
            row_tbl = Table(row, colWidths=[0.6*cm, page_width - 4*cm - 0.8*cm])
            row_tbl.setStyle(TableStyle([
                ("BACKGROUND",    (0, 0), (0, 0), C_BLUE_LIGHT),
                ("TOPPADDING",    (0, 0), (-1, -1), 3),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
                ("LEFTPADDING",   (0, 0), (0, 0), 3),
                ("LEFTPADDING",   (1, 0), (1, 0), 8),
                ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
            ]))
            elements.append(row_tbl)
            elements.append(Spacer(1, 2))

        # Empty line
        elif stripped == "":
            elements.append(Spacer(1, 4))

        # Meta/front-matter lines
        elif stripped.startswith("**Prepared by:**") or \
             stripped.startswith("**Internship") or \
             stripped.startswith("**Date:**") or \
             stripped.startswith("**Assignment:**") or \
             stripped.startswith("**Version:**") or \
             stripped.startswith("**Branch:**") or \
             stripped.startswith("**Status:**"):
            pass  # Skip — already on cover

        # Regular paragraph
        else:
            text = stripped
            text = format_md(text)
            text = re.sub(r"`(.+?)`",
                          r"<font name='Courier' color='#0D2B5E'>\1</font>", text)
            # Pull quote: lines starting with > (abstract etc.)
            if text.startswith(">"):
                text = text.lstrip("> ").strip()
                pq = Table([[Paragraph(text, ParagraphStyle("PQ",
                    fontName="Helvetica", fontSize=10,
                    textColor=C_NAVY, leading=16, alignment=TA_JUSTIFY))]],
                    colWidths=[page_width - 4*cm])
                pq.setStyle(TableStyle([
                    ("BACKGROUND",    (0, 0), (-1, -1), C_TBL_ALT),
                    ("BOX",           (0, 0), (-1, -1), 2, C_GOLD),
                    ("LEFTPADDING",   (0, 0), (-1, -1), 14),
                    ("RIGHTPADDING",  (0, 0), (-1, -1), 14),
                    ("TOPPADDING",    (0, 0), (-1, -1), 10),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
                ]))
                elements.append(Spacer(1, 5))
                elements.append(pq)
                elements.append(Spacer(1, 5))
            else:
                elements.append(Paragraph(text, styles["body"]))

        i += 1

    # Flush table
    if table_lines:
        t = render_md_table(table_lines, page_width)
        if t:
            elements.append(t)
            elements.append(Spacer(1, 8))

    return elements


# ─── Page Canvas Callbacks ───────────────────────────────────────────────────
class PageDecorator:
    def __init__(self, width, height):
        self.width = width
        self.height = height

    def __call__(self, canv, doc):
        self._draw(canv, doc)

    def _draw(self, canv, doc):
        w, h = self.width, self.height
        canv.saveState()

        # Left sidebar accent bar
        canv.setFillColor(C_NAVY)
        canv.rect(0, 0, 0.8 * cm, h, fill=1, stroke=0)
        # Gold dot on sidebar
        canv.setFillColor(C_GOLD)
        canv.circle(0.4 * cm, h / 2, 0.15 * cm, fill=1, stroke=0)
        canv.setFillColor(C_TEAL_LIGHT)
        canv.circle(0.4 * cm, h / 2 + 0.5 * cm, 0.08 * cm, fill=1, stroke=0)
        canv.circle(0.4 * cm, h / 2 - 0.5 * cm, 0.08 * cm, fill=1, stroke=0)

        # Footer bar
        canv.setFillColor(C_NAVY)
        canv.rect(0, 0, w, 1.4 * cm, fill=1, stroke=0)
        # Footer gold line
        canv.setFillColor(C_GOLD)
        canv.rect(0, 1.4 * cm, w, 0.12 * cm, fill=1, stroke=0)

        # Footer text
        canv.setFont("Helvetica", 8)
        canv.setFillColor(C_GRAY_LIGHT)
        canv.drawString(1.2 * cm, 0.55 * cm,
                        "AI-Powered Accounting & Finance Assistant  |  Muhammad Talha Khan  |  Cyber Nuts")
        canv.setFillColor(C_GOLD)
        canv.drawRightString(w - 1 * cm, 0.55 * cm, f"Page {doc.page}")

        # Header line
        canv.setFillColor(C_BLUE)
        canv.rect(0, h - 0.8 * cm, w, 0.8 * cm, fill=1, stroke=0)
        canv.setFillColor(C_GOLD)
        canv.rect(0, h - 0.82 * cm, w, 0.12 * cm, fill=1, stroke=0)
        canv.setFont("Helvetica-Bold", 8)
        canv.setFillColor(C_WHITE)
        canv.drawRightString(w - 1.5 * cm, h - 0.58 * cm,
                             "Phase 1 Research  |  Intern Assignment  |  July 2026")

        canv.restoreState()


# ─── Main ────────────────────────────────────────────────────────────────────
def generate_pdf():
    print(f"Reading: {INPUT_MD}")
    with open(INPUT_MD, "r", encoding="utf-8") as f:
        md_text = f.read()

    page_width, page_height = A4
    styles = build_styles()
    decorator = PageDecorator(page_width, page_height)

    doc = SimpleDocTemplate(
        os.path.normpath(OUTPUT_PDF),
        pagesize=A4,
        leftMargin=1.8 * cm,
        rightMargin=1.5 * cm,
        topMargin=1.8 * cm,
        bottomMargin=2.2 * cm,
        title="AI-Powered Accounting & Finance Assistant — Research Paper",
        author="Muhammad Talha Khan",
        subject="Phase 1 Research — Cyber Nuts Internship",
        creator="ReportLab PDF Generator",
    )

    story = []
    story += make_cover(styles, page_width, page_height)
    story += make_toc(styles, page_width)
    story += md_to_flowables(md_text, styles, page_width)

    doc.build(story, onFirstPage=decorator, onLaterPages=decorator)
    print(f"\n[SUCCESS] PDF generated: {os.path.normpath(OUTPUT_PDF)}")


if __name__ == "__main__":
    generate_pdf()
