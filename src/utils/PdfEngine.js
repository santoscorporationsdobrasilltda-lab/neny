import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const BRAND = {
  primary: [30, 58, 138],
  secondary: [59, 130, 246],
  dark: [15, 23, 42],
  slate: [71, 85, 105],
  border: [203, 213, 225],
  soft: [248, 250, 252],
  success: [22, 163, 74],
  danger: [220, 38, 38],
};

const asText = (value, fallback = '-') => {
  if (value === null || value === undefined || value === '') return fallback;
  return String(value);
};

const asMoney = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));
const asDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return asText(value);
  return date.toLocaleDateString('pt-BR');
};
const sanitizeFilename = (value, fallback = 'documento') => {
  const normalized = asText(value, fallback).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9._-]+/g, '_').replace(/^_+|_+$/g, '');
  return normalized || fallback;
};

const addPageFooters = (doc, footerText = 'Documento gerado pelo Neny Software System') => {
  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    const height = doc.internal.pageSize.getHeight();
    const width = doc.internal.pageSize.getWidth();
    doc.setDrawColor(...BRAND.border);
    doc.line(14, height - 14, width - 14, height - 14);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...BRAND.slate);
    doc.text(footerText, 14, height - 8);
    doc.text(`Página ${page} de ${pageCount}`, width - 14, height - 8, { align: 'right' });
  }
};

const addParagraph = (doc, text, startY, options = {}) => {
  const width = options.width || 180;
  const x = options.x || 14;
  const fontSize = options.fontSize || 10;
  const color = options.color || BRAND.dark;
  const lineHeight = options.lineHeight || 5;
  const lines = doc.splitTextToSize(asText(text), width);
  doc.setFont('helvetica', options.bold ? 'bold' : 'normal');
  doc.setFontSize(fontSize);
  doc.setTextColor(...color);
  doc.text(lines, x, startY);
  return startY + lines.length * lineHeight;
};

const addLabeledTable = (doc, rows, options = {}) => {
  autoTable(doc, {
    startY: options.startY || 44,
    head: [options.head || ['Campo', 'Valor']],
    body: rows,
    theme: 'grid',
    tableWidth: options.tableWidth || 'auto',
    styles: { font: 'helvetica', fontSize: options.fontSize || 9, cellPadding: options.cellPadding || 3, lineColor: BRAND.border, lineWidth: 0.1, textColor: BRAND.dark, valign: 'middle', overflow: 'linebreak' },
    headStyles: { fillColor: options.headColor || BRAND.primary, textColor: [255,255,255], fontStyle: 'bold' },
    columnStyles: options.columnStyles,
    margin: options.margin || { left: 14, right: 14 },
  });
  return doc.lastAutoTable.finalY;
};

const addDataTable = (doc, columns, rows, options = {}) => {
  autoTable(doc, {
    startY: options.startY || 44,
    head: [columns],
    body: rows.length ? rows : [[options.emptyText || 'Nenhum registro encontrado.']],
    theme: 'grid',
    styles: { font: 'helvetica', fontSize: options.fontSize || 8.5, cellPadding: options.cellPadding || 2.8, lineColor: BRAND.border, lineWidth: 0.1, textColor: BRAND.dark, overflow: 'linebreak', valign: 'middle' },
    bodyStyles: { fillColor: [255,255,255] },
    alternateRowStyles: { fillColor: BRAND.soft },
    headStyles: { fillColor: options.headColor || BRAND.primary, textColor: [255,255,255], fontStyle: 'bold' },
    columnStyles: options.columnStyles,
    margin: options.margin || { left: 14, right: 14 },
  });
  return doc.lastAutoTable.finalY;
};

const addCompanyBox = (doc, companyProfile = {}, startY = 44) => {
  if (!companyProfile || Object.keys(companyProfile).length === 0) return startY;
  const rows = [
    ['Empresa', companyProfile.nome_fantasia || companyProfile.razao_social || '-'],
    ['Razão social', companyProfile.razao_social || '-'],
    ['CNPJ', companyProfile.cnpj || '-'],
    ['Regime tributário', companyProfile.regime_tributacao || '-'],
    ['IE / IM', [companyProfile.inscricao_estadual, companyProfile.inscricao_municipal].filter(Boolean).join(' / ') || '-'],
    ['Endereço', [companyProfile.logradouro, companyProfile.numero, companyProfile.complemento, companyProfile.bairro, companyProfile.cidade, companyProfile.estado, companyProfile.cep].filter(Boolean).join(', ') || '-'],
  ];
  return addLabeledTable(doc, rows, { startY, head: ['Dados da Empresa', 'Informações'], tableWidth: 182, headColor: BRAND.secondary });
};

export const PdfEngine = {
  BRAND, asText, asMoney, asDate, sanitizeFilename,
  createDocument({ title, subtitle = '', companyName = 'Neny Software System', generatedAt = new Date(), orientation = 'p', format = 'a4', companyProfile = null }) {
    const doc = new jsPDF({ orientation, format, unit: 'mm' });
    const width = doc.internal.pageSize.getWidth();
    doc.setFillColor(...BRAND.primary); doc.rect(0,0,width,28,'F');
    doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(18); doc.text(companyName,14,16);
    doc.setFontSize(9); doc.setFont('helvetica','normal');
    doc.text(`Gerado em ${new Date(generatedAt).toLocaleDateString('pt-BR')} às ${new Date(generatedAt).toLocaleTimeString('pt-BR')}`, width-14, 16, { align:'right' });
    doc.setTextColor(...BRAND.dark); doc.setFont('helvetica','bold'); doc.setFontSize(16); doc.text(asText(title),14,38);
    let currentY = 44;
    if (subtitle) {
      doc.setFont('helvetica','normal'); doc.setFontSize(9.5); doc.setTextColor(...BRAND.slate);
      const subtitleLines = doc.splitTextToSize(subtitle, width - 28); doc.text(subtitleLines,14,currentY); currentY += subtitleLines.length * 4.5 + 2;
    }
    doc.setDrawColor(...BRAND.border); doc.line(14,currentY,width-14,currentY);
    currentY += 6;
    if (companyProfile) currentY = addCompanyBox(doc, companyProfile, currentY) + 6;
    return { doc, startY: currentY };
  },
  addCompanyBox,
  addSectionTitle(doc, text, startY) { doc.setFont('helvetica','bold'); doc.setFontSize(11.5); doc.setTextColor(...BRAND.primary); doc.text(asText(text),14,startY); return startY + 5; },
  addParagraph, addLabeledTable, addDataTable,
  finalize(doc, filename, footerText) { addPageFooters(doc, footerText); const safe = sanitizeFilename(filename, 'documento'); doc.save(safe.toLowerCase().endsWith('.pdf') ? safe : `${safe}.pdf`); },
};
