import io
import csv
from datetime import date, datetime
from typing import List, Dict, Any
from decimal import Decimal

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

from app.schemas.schemas import TransactionResponse, PnLResponse

def generate_pdf_statement_bytes(
    transactions: List[TransactionResponse],
    pnl: PnLResponse,
    period_label: str
) -> bytes:
    """
    Generates a premium, executive-grade Financial Statement PDF in memory.
    Returns the PDF raw bytes.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=1.5 * cm,
        leftMargin=1.5 * cm,
        topMargin=1.5 * cm,
        bottomMargin=1.5 * cm
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#0A1628"),
        alignment=TA_LEFT
    )
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=14,
        textColor=colors.HexColor("#1565C0"),
        alignment=TA_LEFT
    )
    meta_style = ParagraphStyle(
        'DocMeta',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=colors.HexColor("#455A64"),
        alignment=TA_RIGHT
    )
    section_style = ParagraphStyle(
        'SectionHead',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor("#0A1628"),
        spaceBefore=15,
        spaceAfter=10
    )
    cell_style = ParagraphStyle(
        'CellText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=11,
        textColor=colors.HexColor("#212121")
    )
    cell_style_bold = ParagraphStyle(
        'CellTextBold',
        parent=cell_style,
        fontName='Helvetica-Bold'
    )
    cell_style_right = ParagraphStyle(
        'CellTextRight',
        parent=cell_style,
        alignment=TA_RIGHT
    )
    header_cell_style = ParagraphStyle(
        'HeaderCell',
        parent=cell_style,
        fontName='Helvetica-Bold',
        textColor=colors.white,
        alignment=TA_CENTER
    )

    elements = []

    # 1. Header Section (Title & Meta table)
    header_data = [
        [
            Paragraph("CYBER NUTS AI ACCOUNTING", title_style),
            Paragraph(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}<br/>Period: {period_label}", meta_style)
        ],
        [
            Paragraph("Official Financial Statement & Ledger Report", subtitle_style),
            ""
        ]
    ]
    header_table = Table(header_data, colWidths=[11 * cm, 7 * cm])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
    ]))
    elements.append(header_table)
    elements.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#1565C0"), spaceAfter=15, spaceBefore=5))

    # 2. Financial Summary (P&L Box)
    elements.append(Paragraph("Executive Financial Summary", section_style))
    
    margin_pct = (float(pnl.net_profit) / float(pnl.total_income) * 100) if pnl.total_income > 0 else 0.0
    profit_color = "#2E7D32" if pnl.net_profit >= 0 else "#C62828"

    summary_data = [
        [
            Paragraph("<b>Total Revenue (Income)</b>", cell_style_bold),
            Paragraph(f"PKR {pnl.total_income:,.2f}", cell_style_right),
            Paragraph("<b>Total Operating Expenses</b>", cell_style_bold),
            Paragraph(f"PKR {pnl.total_expenses:,.2f}", cell_style_right)
        ],
        [
            Paragraph("<b>Net Profit / Munafa</b>", cell_style_bold),
            Paragraph(f"<font color='{profit_color}'><b>PKR {pnl.net_profit:,.2f}</b></font>", cell_style_right),
            Paragraph("<b>Net Profit Margin</b>", cell_style_bold),
            Paragraph(f"<b>{margin_pct:.1f}%</b>", cell_style_right)
        ]
    ]
    summary_table = Table(summary_data, colWidths=[4.5 * cm, 4.5 * cm, 4.5 * cm, 4.5 * cm])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F5F7FA")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CFD8DC")),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    elements.append(summary_table)
    elements.append(Spacer(1, 15))

    # 3. Transaction Ledger Table
    elements.append(Paragraph(f"Detailed Transaction Ledger ({len(transactions)} Records)", section_style))

    ledger_header = [
        Paragraph("Date", header_cell_style),
        Paragraph("Type", header_cell_style),
        Paragraph("Category", header_cell_style),
        Paragraph("Account", header_cell_style),
        Paragraph("Amount (PKR)", header_cell_style),
        Paragraph("Description", header_cell_style)
    ]
    
    ledger_rows = [ledger_header]
    for idx, tx in enumerate(transactions):
        type_color = "#2E7D32" if tx.type.lower() == "income" else "#C62828"
        ledger_rows.append([
            Paragraph(str(tx.date), cell_style),
            Paragraph(f"<font color='{type_color}'><b>{tx.type.upper()}</b></font>", cell_style),
            Paragraph(tx.category.name if getattr(tx, "category", None) else "N/A", cell_style),
            Paragraph(tx.account.name if getattr(tx, "account", None) else "N/A", cell_style),
            Paragraph(f"{tx.amount:,.2f}", cell_style_right),
            Paragraph(tx.description or "", cell_style)
        ])

    if len(ledger_rows) == 1:
        ledger_rows.append([Paragraph("No transactions recorded for this period.", cell_style), "", "", "", "", ""])

    ledger_table = Table(ledger_rows, colWidths=[2.2 * cm, 2.0 * cm, 2.8 * cm, 2.8 * cm, 2.8 * cm, 5.4 * cm])
    
    t_style = [
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0A1628")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E0E0E0")),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]
    # Alternating row colors
    for i in range(1, len(ledger_rows)):
        if i % 2 == 0:
            t_style.append(('BACKGROUND', (0, i), (-1, i), colors.HexColor("#F8F9FA")))
            
    ledger_table.setStyle(TableStyle(t_style))
    elements.append(ledger_table)
    elements.append(Spacer(1, 20))

    # 4. Footer Note
    footer_style = ParagraphStyle(
        'FooterNote',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8,
        textColor=colors.HexColor("#78909C"),
        alignment=TA_CENTER
    )
    elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#B0BEC5"), spaceAfter=8, spaceBefore=10))
    elements.append(Paragraph("This document is dynamically generated by Cyber Nuts AI Accounting Assistant (Powered by Gemini 2.0 / PydanticAI Engine). All calculations are deterministic and verified against double-entry database rules.", footer_style))

    doc.build(elements)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes

def generate_csv_statement_string(
    transactions: List[TransactionResponse],
    pnl: PnLResponse,
    period_label: str
) -> str:
    """
    Generates a CSV string representation of the financial statement and ledger.
    """
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Metadata headers
    writer.writerow(["# CYBER NUTS AI ACCOUNTING ASSISTANT - FINANCIAL STATEMENT"])
    writer.writerow([f"# Period: {period_label}"])
    writer.writerow([f"# Generated At: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"])
    writer.writerow([])
    
    # Summary
    writer.writerow(["EXECUTIVE SUMMARY"])
    writer.writerow(["Total Revenue (PKR)", f"{pnl.total_income:,.2f}"])
    writer.writerow(["Total Operating Expenses (PKR)", f"{pnl.total_expenses:,.2f}"])
    writer.writerow(["Net Profit / Munafa (PKR)", f"{pnl.net_profit:,.2f}"])
    margin_pct = (float(pnl.net_profit) / float(pnl.total_income) * 100) if pnl.total_income > 0 else 0.0
    writer.writerow(["Profit Margin (%)", f"{margin_pct:.1f}%"])
    writer.writerow([])
    
    # Ledger Table
    writer.writerow(["TRANSACTION LEDGER"])
    writer.writerow(["ID", "Date", "Type", "Category", "Account", "Amount (PKR)", "Description"])
    
    for tx in transactions:
        writer.writerow([
            tx.id,
            str(tx.date),
            tx.type.upper(),
            tx.category.name if getattr(tx, "category", None) else "N/A",
            tx.account.name if getattr(tx, "account", None) else "N/A",
            f"{tx.amount:.2f}",
            tx.description or ""
        ])
        
    return output.getvalue()
