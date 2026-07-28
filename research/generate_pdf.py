"""
PDF Generator for AI Accounting Research Paper
Converts 01_Research_Paper.md into a styled PDF.
Requires: pip install reportlab markdown2
"""

import os
import re
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, PageBreak, Preformatted
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY

# ─── Constants ────────────────────────────────────────────────────────────────
INPUT_MD  = os.path.join(os.path.dirname(__file__), "01_Research_Paper.md")
OUTPUT_PDF = os.path.join(
    os.path.dirname(__file__),
    "..", "Final_Research_Paper_AI_Accounting_Assistant.pdf"
)

# ─── Color Palette ────────────────────────────────────────────────────────────
NAVY        = colors.HexColor("#0D1B2A")
ACCENT_BLUE = colors.HexColor("#1E88E5")
ACCENT_TEAL = colors.HexColor("#00ACC1")
LIGHT_GRAY  = colors.HexColor("#F4F6F9")
MID_GRAY    = colors.HexColor("#B0BEC5")
DARK_GRAY   = colors.HexColor("#37474F")
WHITE       = colors.white
TABLE_HEADER_BG = colors.HexColor("#1E3A5F")
TABLE_ALT_ROW   = colors.HexColor("#EBF5FB")


def build_styles():
    """Return a dict of all custom ParagraphStyles."""
    base = getSampleStyleSheet()

    styles = {
        "title": ParagraphStyle(
            "CustomTitle",
            fontName="Helvetica-Bold",
            fontSize=22,
            textColor=WHITE,
            alignment=TA_CENTER,
            spaceAfter=6,
            leading=28,
        ),
        "subtitle": ParagraphStyle(
            "CustomSubtitle",
            fontName="Helvetica",
            fontSize=13,
            textColor=colors.HexColor("#B0D4F1"),
            alignment=TA_CENTER,
            spaceAfter=4,
            leading=18,
        ),
        "meta": ParagraphStyle(
            "Meta",
            fontName="Helvetica",
            fontSize=10,
            textColor=colors.HexColor("#CFE2F3"),
            alignment=TA_CENTER,
            spaceAfter=2,
        ),
        "h1": ParagraphStyle(
            "H1",
            fontName="Helvetica-Bold",
            fontSize=16,
            textColor=ACCENT_BLUE,
            spaceBefore=18,
            spaceAfter=6,
            leading=22,
        ),
        "h2": ParagraphStyle(
            "H2",
            fontName="Helvetica-Bold",
            fontSize=13,
            textColor=NAVY,
            spaceBefore=14,
            spaceAfter=4,
            leading=18,
        ),
        "h3": ParagraphStyle(
            "H3",
            fontName="Helvetica-Bold",
            fontSize=11,
            textColor=DARK_GRAY,
            spaceBefore=10,
            spaceAfter=3,
            leading=16,
        ),
        "body": ParagraphStyle(
            "Body",
            fontName="Helvetica",
            fontSize=10,
            textColor=DARK_GRAY,
            alignment=TA_JUSTIFY,
            spaceAfter=6,
            leading=16,
        ),
        "bullet": ParagraphStyle(
            "Bullet",
            fontName="Helvetica",
            fontSize=10,
            textColor=DARK_GRAY,
            leftIndent=18,
            spaceBefore=2,
            spaceAfter=2,
            leading=15,
            bulletIndent=8,
        ),
        "code": ParagraphStyle(
            "Code",
            fontName="Courier",
            fontSize=8,
            textColor=DARK_GRAY,
            backColor=LIGHT_GRAY,
            leftIndent=12,
            rightIndent=12,
            spaceBefore=6,
            spaceAfter=6,
            leading=12,
        ),
        "abstract_label": ParagraphStyle(
            "AbstractLabel",
            fontName="Helvetica-Bold",
            fontSize=11,
            textColor=ACCENT_TEAL,
            spaceAfter=4,
        ),
    }
    return styles


def make_cover_page(styles):
    """Build the cover page elements."""
    elements = []
    # Title box background (simulated with a table)
    cover_data = [[
        Paragraph("AI-Powered Accounting &amp; Finance Assistant", styles["title"]),
    ]]
    cover_table = Table(cover_data, colWidths=[17 * cm])
    cover_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), NAVY),
        ("TOPPADDING",    (0, 0), (-1, -1), 28),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 28),
        ("LEFTPADDING",   (0, 0), (-1, -1), 18),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 18),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [NAVY]),
    ]))
    elements.append(cover_table)
    elements.append(Spacer(1, 12))

    subtitle_data = [[
        Paragraph("A Research Paper on AI Automation in Accounting Workflows", styles["subtitle"])
    ]]
    sub_table = Table(subtitle_data, colWidths=[17 * cm])
    sub_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), ACCENT_BLUE),
        ("TOPPADDING",    (0, 0), (-1, -1), 12),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
        ("LEFTPADDING",   (0, 0), (-1, -1), 18),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 18),
    ]))
    elements.append(sub_table)
    elements.append(Spacer(1, 30))

    meta_items = [
        ("Submission Date", datetime.now().strftime("%B %Y")),
        ("Assignment", "Full-Stack AI Developer Intern — Phase 1 Research"),
        ("Framework", "PydanticAI + FastAPI + Next.js + Supabase"),
        ("Primary AI Model", "Google Gemini 2.0 Flash"),
    ]
    meta_data = [[Paragraph(f"<b>{k}:</b>  {v}", ParagraphStyle(
        "MetaRow", fontName="Helvetica", fontSize=11, textColor=DARK_GRAY,
        leading=16,
    ))] for k, v in meta_items]
    meta_table = Table(meta_data, colWidths=[17 * cm])
    meta_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), LIGHT_GRAY),
        ("TOPPADDING",    (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING",   (0, 0), (-1, -1), 20),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 20),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [LIGHT_GRAY, WHITE]),
        ("BOX", (0, 0), (-1, -1), 1, MID_GRAY),
        ("LINEBELOW", (0, 0), (-1, -2), 0.5, MID_GRAY),
    ]))
    elements.append(meta_table)
    elements.append(PageBreak())
    return elements


def render_table_from_md(lines, styles):
    """Parse a markdown table block and return a ReportLab Table."""
    rows = []
    is_header = True
    for line in lines:
        if re.match(r"^\|[-| :]+\|$", line.strip()):
            is_header = False
            continue
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        rows.append(cells)

    if not rows:
        return None

    # Determine column widths (equal distribution)
    num_cols = len(rows[0])
    col_width = 16.5 * cm / num_cols

    # Build paragraph cells
    para_rows = []
    for i, row in enumerate(rows):
        style_name = "Helvetica-Bold" if i == 0 else "Helvetica"
        color = WHITE if i == 0 else DARK_GRAY
        para_row = [
            Paragraph(cell, ParagraphStyle(
                f"TC_{i}_{j}",
                fontName=style_name,
                fontSize=8,
                textColor=color,
                leading=12,
                wordWrap="CJK",
            ))
            for j, cell in enumerate(row)
        ]
        para_rows.append(para_row)

    t = Table(para_rows, colWidths=[col_width] * num_cols, repeatRows=1)
    ts = [
        ("BACKGROUND",    (0, 0), (-1, 0),  TABLE_HEADER_BG),
        ("TEXTCOLOR",     (0, 0), (-1, 0),  WHITE),
        ("FONTNAME",      (0, 0), (-1, 0),  "Helvetica-Bold"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, TABLE_ALT_ROW]),
        ("GRID",          (0, 0), (-1, -1),  0.4, MID_GRAY),
        ("TOPPADDING",    (0, 0), (-1, -1),  5),
        ("BOTTOMPADDING", (0, 0), (-1, -1),  5),
        ("LEFTPADDING",   (0, 0), (-1, -1),  6),
        ("RIGHTPADDING",  (0, 0), (-1, -1),  6),
        ("VALIGN",        (0, 0), (-1, -1),  "MIDDLE"),
    ]
    t.setStyle(TableStyle(ts))
    return t


def md_to_elements(md_text, styles):
    """Convert markdown text to a list of ReportLab flowables."""
    elements = []
    lines = md_text.split("\n")
    i = 0
    in_code_block = False
    code_lines = []
    table_lines = []
    in_table = False

    while i < len(lines):
        line = lines[i]

        # ── Code blocks ──────────────────────────────────────────────────────
        if line.strip().startswith("```"):
            if not in_code_block:
                in_code_block = True
                code_lines = []
            else:
                in_code_block = False
                code_text = "\n".join(code_lines)
                elements.append(Spacer(1, 4))
                elements.append(Preformatted(code_text, styles["code"]))
                elements.append(Spacer(1, 4))
                code_lines = []
            i += 1
            continue

        if in_code_block:
            code_lines.append(line)
            i += 1
            continue

        # ── Markdown tables ──────────────────────────────────────────────────
        if line.strip().startswith("|"):
            table_lines.append(line)
            i += 1
            continue
        else:
            if table_lines:
                t = render_table_from_md(table_lines, styles)
                if t:
                    elements.append(Spacer(1, 6))
                    elements.append(t)
                    elements.append(Spacer(1, 8))
                table_lines = []

        # ── Headings ─────────────────────────────────────────────────────────
        if line.startswith("# "):
            text = line[2:].strip()
            if "Abstract" in text:
                elements.append(Spacer(1, 6))
                elements.append(Paragraph("Abstract", styles["h1"]))
            else:
                elements.append(Paragraph(text, styles["h1"]))

        elif line.startswith("## "):
            text = line[3:].strip()
            elements.append(HRFlowable(width="100%", thickness=0.5, color=MID_GRAY, spaceAfter=4))
            elements.append(Paragraph(text, styles["h2"]))

        elif line.startswith("### "):
            text = line[4:].strip()
            elements.append(Paragraph(text, styles["h3"]))

        elif line.startswith("#### "):
            text = line[5:].strip()
            elements.append(Paragraph(
                f"<b>{text}</b>",
                ParagraphStyle("H4", fontName="Helvetica-Bold", fontSize=10,
                               textColor=ACCENT_TEAL, spaceBefore=8, spaceAfter=3)
            ))

        # ── Horizontal rule ──────────────────────────────────────────────────
        elif line.strip().startswith("---"):
            elements.append(Spacer(1, 6))
            elements.append(HRFlowable(width="100%", thickness=1, color=ACCENT_BLUE))
            elements.append(Spacer(1, 6))

        # ── Bullet points ────────────────────────────────────────────────────
        elif line.strip().startswith("- ") or line.strip().startswith("* "):
            text = line.strip()[2:].strip()
            text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
            text = re.sub(r"`(.+?)`", r"<font name='Courier'>\1</font>", text)
            elements.append(Paragraph(f"• {text}", styles["bullet"]))

        # ── Numbered lists ───────────────────────────────────────────────────
        elif re.match(r"^\d+\. ", line.strip()):
            text = re.sub(r"^\d+\. ", "", line.strip())
            text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
            elements.append(Paragraph(f"&nbsp;&nbsp;{text}", styles["bullet"]))

        # ── Empty line ───────────────────────────────────────────────────────
        elif line.strip() == "":
            elements.append(Spacer(1, 5))

        # ── Regular paragraph ────────────────────────────────────────────────
        else:
            text = line.strip()
            if not text:
                i += 1
                continue
            # Inline bold
            text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
            # Inline code
            text = re.sub(r"`(.+?)`", r"<font name='Courier'>\1</font>", text)
            # Skip pure metadata lines (from front matter)
            if text.startswith("**Prepared by:**") or text.startswith("**Internship") \
                    or text.startswith("**Date:**") or text.startswith("**Assignment:**"):
                elements.append(Paragraph(text, styles["meta"]))
            else:
                elements.append(Paragraph(text, styles["body"]))

        i += 1

    # Flush any remaining table
    if table_lines:
        t = render_table_from_md(table_lines, styles)
        if t:
            elements.append(t)
            elements.append(Spacer(1, 8))

    return elements


def add_page_number(canvas, doc):
    """Footer callback to draw page numbers."""
    canvas.saveState()
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(MID_GRAY)
    page_num = f"Page {doc.page}"
    canvas.drawRightString(A4[0] - 2 * cm, 1.2 * cm, page_num)
    canvas.drawString(2 * cm, 1.2 * cm, "AI-Powered Accounting & Finance Assistant — Research Paper")
    canvas.setStrokeColor(ACCENT_BLUE)
    canvas.setLineWidth(0.5)
    canvas.line(2 * cm, 1.5 * cm, A4[0] - 2 * cm, 1.5 * cm)
    canvas.restoreState()


def generate_pdf():
    """Main entry point: read markdown and generate PDF."""
    print(f"Reading: {INPUT_MD}")
    with open(INPUT_MD, "r", encoding="utf-8") as f:
        md_text = f.read()

    # Remove the front-matter title block (we build our own cover)
    # Strip lines up to and including the second "---" separator
    parts = md_text.split("---", 3)
    if len(parts) >= 3:
        md_body = parts[-1]
    else:
        md_body = md_text

    styles = build_styles()

    doc = SimpleDocTemplate(
        os.path.normpath(OUTPUT_PDF),
        pagesize=A4,
        rightMargin=2 * cm,
        leftMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2.5 * cm,
        title="AI-Powered Accounting & Finance Assistant — Research Paper",
        author="Intern Submission",
        subject="Phase 1 Research — AI Accounting Assistant",
    )

    story = []
    story += make_cover_page(styles)
    story += md_to_elements(md_body, styles)

    doc.build(story, onFirstPage=add_page_number, onLaterPages=add_page_number)
    print(f"\n[SUCCESS] PDF generated: {os.path.normpath(OUTPUT_PDF)}")
    print(f"   Pages: see file for exact count")


if __name__ == "__main__":
    generate_pdf()
