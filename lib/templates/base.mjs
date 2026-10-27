// Base visual dos documentos Word da GiroHub (identidade: Manrope, navy #0F2B57, azul #0A85FF, logo oficial).
import * as D from 'docx';
import { LOGO_PNG_B64, LOGO_RATIO } from './logo.mjs';
const {
  Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell, WidthType,
  BorderStyle, ShadingType, AlignmentType, Header, Footer, PageNumber, PositionalTab,
  PositionalTabAlignment, PositionalTabRelativeTo, PositionalTabLeader, PageOrientation,
  LevelFormat, VerticalAlign, PageBreak, HeightRule, TableLayoutType,
} = D;

const C = {
  navy: '0F2B57', blue: '0A85FF', ink: '192434', grey: '657386', light: 'EBF1FA',
  zebra: 'F7F9FC', border: 'D5DEEA', amber: 'FFF4C2', red: 'B42318', redBg: 'FDECEA', white: 'FFFFFF',
};
const FONT = 'Manrope';
const LOGO = Buffer.from(LOGO_PNG_B64, 'base64');

const A4 = { w: 11906, h: 16838 };
const MARGIN = 1134;
const CW_PORTRAIT = A4.w - 2 * MARGIN; // 9638
const CW_LANDSCAPE = A4.h - 2 * MARGIN; // 14570

// ---------- rich text: **bold** and [pendente] (highlighted) ----------
function runs(text, base = {}) {
  const out = [];
  const parts = String(text).split(/(\*\*[^*]+\*\*|\[[^\]]*\])/g).filter((s) => s !== '');
  for (const part of parts) {
    if (part.startsWith('**') && part.endsWith('**')) {
      out.push(...runs(part.slice(2, -2), { ...base, bold: true }));
    } else if (part.startsWith('[') && part.endsWith(']')) {
      out.push(new TextRun({ text: part, font: FONT, ...base, shading: { type: ShadingType.CLEAR, color: 'auto', fill: 'FFE98A' } }));
    } else {
      out.push(new TextRun({ text: part, font: FONT, ...base }));
    }
  }
  return out;
}

function p(text, o = {}) {
  const base = {};
  if (o.size) base.size = o.size;
  if (o.color) base.color = o.color;
  if (o.bold) base.bold = true;
  if (o.italics) base.italics = true;
  if (o.allCaps) base.allCaps = true;
  if (o.characterSpacing) base.characterSpacing = o.characterSpacing;
  return new Paragraph({
    children: Array.isArray(text) ? text : runs(text, base),
    alignment: o.align || AlignmentType.LEFT,
    spacing: { before: o.before ?? 0, after: o.after ?? 120, line: o.line ?? 276 },
    indent: o.indent,
    keepNext: o.keepNext,
    border: o.border,
    shading: o.shading,
    numbering: o.numbering,
  });
}

const eyebrow = (t) => p(t, { size: 15, color: C.blue, bold: true, characterSpacing: 30, after: 80 });
const title = (t) => p(t, { size: 36, color: C.navy, bold: true, after: 80, line: 240 });
const subtitle = (t) => p(t, { size: 20, color: C.grey, after: 240 });
const h1 = (t) => p(t, { size: 24, color: C.navy, bold: true, before: 280, after: 120, keepNext: true });
const h2 = (t) => p(t, { size: 20, color: C.navy, bold: true, before: 200, after: 80, keepNext: true });
const body = (t, o = {}) => p(t, { size: 19, color: C.ink, ...o });
const small = (t, o = {}) => p(t, { size: 16, color: C.grey, ...o });
const bullets = (items, o = {}) => items.map((t) => p(t, { size: o.size || 19, color: C.ink, after: 60, numbering: { reference: 'bul', level: 0 } }));
const spacer = (after = 120) => new Paragraph({ children: [], spacing: { after } });
const pageBreak = () => new Paragraph({ children: [new PageBreak()] });

function callout(text, kind = 'info') {
  const map = {
    info: { line: C.blue, bg: C.light, color: C.ink },
    warn: { line: 'D99A00', bg: 'FFF8E1', color: C.ink },
    stop: { line: C.red, bg: C.redBg, color: C.ink },
  }[kind];
  const lines = Array.isArray(text) ? text : [text];
  return lines.map((t, i) => new Paragraph({
    children: runs(t, { size: 18, color: map.color }),
    shading: { type: ShadingType.CLEAR, color: 'auto', fill: map.bg },
    border: { left: { style: BorderStyle.SINGLE, size: 24, color: map.line, space: 8 } },
    indent: { left: 160, right: 160 },
    spacing: { before: i === 0 ? 120 : 0, after: i === lines.length - 1 ? 200 : 40, line: 264 },
  }));
}

const cellBorders = (color = C.border) => ({
  top: { style: BorderStyle.SINGLE, size: 4, color },
  bottom: { style: BorderStyle.SINGLE, size: 4, color },
  left: { style: BorderStyle.SINGLE, size: 4, color },
  right: { style: BorderStyle.SINGLE, size: 4, color },
});

function cell(content, { w, fill, bold, color, size = 17, span, align, vAlign } = {}) {
  const items = Array.isArray(content) ? content : [content];
  const children = items.map((t) => (t instanceof Paragraph ? t : new Paragraph({
    children: runs(t ?? '', { size, color: color || C.ink, bold }),
    alignment: align || AlignmentType.LEFT,
    spacing: { before: 0, after: 40, line: 252 },
  })));
  return new TableCell({
    children,
    width: { size: w, type: WidthType.DXA },
    columnSpan: span,
    shading: fill ? { type: ShadingType.CLEAR, color: 'auto', fill } : undefined,
    borders: cellBorders(),
    margins: { top: 70, bottom: 50, left: 90, right: 90 },
    verticalAlign: vAlign || VerticalAlign.TOP,
  });
}

/**
 * table({ widths:[...], header:[...], rows:[ [..] | {group:'texto'} ], size })
 */
function table({ widths, header, rows, size = 17, zebra = true }) {
  const total = widths.reduce((a, b) => a + b, 0);
  const trs = [];
  if (header) {
    trs.push(new TableRow({
      tableHeader: true,
      cantSplit: true,
      children: header.map((h, i) => cell(h, { w: widths[i], fill: C.navy, color: C.white, bold: true, size })),
    }));
  }
  let z = 0;
  rows.forEach((r) => {
    if (r && r.group) {
      z = 0;
      trs.push(new TableRow({
        cantSplit: true,
        children: [cell(r.group, { w: total, span: widths.length, fill: C.light, color: C.navy, bold: true, size })],
      }));
      return;
    }
    const fill = zebra && z % 2 === 1 ? C.zebra : undefined;
    z += 1;
    trs.push(new TableRow({
      cantSplit: true,
      children: r.map((v, i) => {
        if (v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Paragraph)) {
          return cell(v.t, { w: widths[i], fill: v.fill || fill, bold: v.bold, color: v.color, size });
        }
        return cell(v, { w: widths[i], fill, size });
      }),
    }));
  });
  return new Table({
    width: { size: total, type: WidthType.DXA },
    columnWidths: widths,
    layout: TableLayoutType.FIXED,
    rows: trs,
  });
}

function kv(rows, width, { labelW = 2600, size = 17 } = {}) {
  return table({ widths: [labelW, width - labelW], rows: rows.map(([k, v]) => [{ t: k, bold: true, color: C.navy, fill: C.light }, v]), size, zebra: false });
}

// ---------- header / footer ----------
function header(rightText, cw) {
  const h = 30;
  return new Header({
    children: [new Paragraph({
      children: [
        new ImageRun({ type: 'png', data: LOGO, transformation: { width: Math.round(h * LOGO_RATIO), height: h }, altText: { title: 'GiroHub', description: 'Logo GiroHub', name: 'logo' } }),
        new TextRun({ children: [new D.Tab(), rightText], font: FONT, size: 15, color: C.grey }),
      ],
      tabStops: [{ type: D.TabStopType.RIGHT, position: cw }],
      border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: C.blue, space: 6 } },
      spacing: { after: 120 },
    })],
  });
}

function footer(leftText, cw) {
  return new Footer({
    children: [new Paragraph({
      children: [
        ...runs(leftText, { size: 14, color: C.grey }),
        new TextRun({ children: [new D.Tab(), 'Página ', PageNumber.CURRENT, ' de ', PageNumber.TOTAL_PAGES], font: FONT, size: 14, color: C.grey }),
      ],
      tabStops: [{ type: D.TabStopType.RIGHT, position: cw }],
      border: { top: { style: BorderStyle.SINGLE, size: 4, color: C.border, space: 6 } },
    })],
  });
}

function build({ children, landscape = false, headerText, footerText, docTitle }) {
  const page = landscape
    ? { size: { width: A4.w, height: A4.h, orientation: PageOrientation.LANDSCAPE }, margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN, header: 500, footer: 500 } }
    : { size: { width: A4.w, height: A4.h }, margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN, header: 500, footer: 500 } };
  const doc = new Document({
    creator: 'GiroHub · Licitações',
    title: docTitle,
    description: 'Minuta v0.1 para revisão — CRMV-ES Dispensa Eletrônica 51/2026',
    styles: { default: { document: { run: { font: FONT, size: 19, color: C.ink } } } },
    numbering: { config: [{ reference: 'bul', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 220 } }, run: { color: C.blue } } }] }] },
    sections: [{ properties: { page }, headers: { default: header(headerText, landscape ? CW_LANDSCAPE : CW_PORTRAIT) }, footers: { default: footer(footerText, landscape ? CW_LANDSCAPE : CW_PORTRAIT) }, children }],
  });
  return Packer.toBuffer(doc);
}

export { D, C, runs, p, eyebrow, title, subtitle, h1, h2, body, small, bullets, spacer, pageBreak, callout, table, kv, build, CW_PORTRAIT, CW_LANDSCAPE, AlignmentType };
