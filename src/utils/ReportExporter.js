import { PdfEngine } from './PdfEngine';

const escapeHtml = (value = '') => String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const normalizeColumns = (columns = []) => columns.map((col) => (typeof col === 'string' ? col : col?.label || col?.header || col?.key || 'Coluna'));
const normalizeRows = (data = [], columns = []) => data.map((item)=> columns.map((col)=> { if (typeof col === 'string') return item?.[col] ?? '-'; const key = col?.key || col?.accessor || col?.field; return key ? item?.[key] ?? '-' : '-'; }));
const buildSubtitle = (subtitle, filters = {}) => {
  const filterLine = filters && Object.keys(filters).length ? Object.entries(filters).filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== '').map(([key, value]) => `${key}: ${value}`).join(' • ') : '';
  return [subtitle, filterLine].filter(Boolean).join(' • ');
};

const companyHtml = (companyProfile) => {
  if (!companyProfile) return '';
  const endereco = [companyProfile.logradouro, companyProfile.numero, companyProfile.complemento, companyProfile.bairro, companyProfile.cidade, companyProfile.estado, companyProfile.cep].filter(Boolean).join(', ');
  return `
    <div class="meta" style="grid-template-columns: repeat(2, minmax(0, 1fr)); margin-top: 0;">
      <div class="meta-card"><strong>Empresa</strong>${escapeHtml(companyProfile.nome_fantasia || companyProfile.razao_social || '-')}</div>
      <div class="meta-card"><strong>Regime tributário</strong>${escapeHtml(companyProfile.regime_tributacao || '-')}</div>
      <div class="meta-card"><strong>CNPJ</strong>${escapeHtml(companyProfile.cnpj || '-')}</div>
      <div class="meta-card"><strong>IE / IM</strong>${escapeHtml([companyProfile.inscricao_estadual, companyProfile.inscricao_municipal].filter(Boolean).join(' / ') || '-')}</div>
      <div class="meta-card" style="grid-column: 1 / -1;"><strong>Endereço</strong>${escapeHtml(endereco || '-')}</div>
    </div>`;
};

export const openPrintWindow = ({ title, subtitle = '', columns = [], rows = [], footer = '', companyProfile = null, summaryRows = [] }) => {
  const safeTitle = title || 'Relatório';
  const tableHead = columns.map((col) => `<th>${escapeHtml(col)}</th>`).join('');
  const tableRows = rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell ?? '-')}</td>`).join('')}</tr>`).join('');
  const printWindow = window.open('', '_blank', 'width=1100,height=800'); if (!printWindow) return;
  printWindow.document.write(`
    <html><head><title>${escapeHtml(safeTitle)}</title><style>
      @page { size: A4; margin: 12mm; } @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
      body { font-family: Inter, Arial, sans-serif; font-size: 12pt; line-height: 1.45; color: #0f172a; margin: 0; background: #fff; }
      .header { background: #1e3a8a; color: #fff; padding: 18px 22px; } .header h1 { margin: 0 0 6px; font-size: 20pt; } .header p { margin: 0; opacity: .92; font-size: 10.5pt; }
      .container { padding: 10mm 8mm 6mm; } .meta { display:grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin-bottom: 16px; }
      .meta-card { border: 1px solid #cbd5e1; border-radius: 10px; padding: 10px; background: #f8fafc; } .meta-card strong { display:block; margin-bottom:4px; font-size: 10pt; color:#1e3a8a; }
      table { width:100%; border-collapse:collapse; table-layout:auto; } th, td { border:1px solid #cbd5e1; padding:8px; text-align:left; vertical-align:top; } th { background:#1e3a8a; color:#fff; } tbody tr:nth-child(even) { background:#f8fafc; } .footer { margin-top:14px; color:#475569; font-size:10pt; }
    </style></head><body>
      <div class="header"><h1>${escapeHtml(safeTitle)}</h1><p>${escapeHtml(subtitle || 'Documento emitido pelo Neny Software System')}</p></div>
      <div class="container">
        ${companyHtml(companyProfile)}
        <div class="meta">
          <div class="meta-card"><strong>Registros</strong>${rows.length}</div>
          <div class="meta-card"><strong>Emitido em</strong>${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}</div>
          <div class="meta-card"><strong>Sistema</strong>Neny Software System</div>
        </div>
        ${summaryRows?.length ? `<table style="margin-bottom:16px"><thead><tr><th>Resumo</th><th>Valor</th></tr></thead><tbody>${summaryRows.map(r=>`<tr><td>${escapeHtml(r[0])}</td><td>${escapeHtml(r[1])}</td></tr>`).join('')}</tbody></table>` : ''}
        <table><thead><tr>${tableHead}</tr></thead><tbody>${tableRows || `<tr><td colspan="${columns.length || 1}">Nenhum registro.</td></tr>`}</tbody></table>
        ${footer ? `<p class="footer">${escapeHtml(footer)}</p>` : ''}
      </div><script>window.onload=function(){window.print();};</script></body></html>`);
  printWindow.document.close();
};

export const exportTablePdf = ({ title, subtitle = '', columns = [], rows = [], filename = 'relatorio.pdf', footer = '', orientation = 'p', companyProfile = null, summaryRows = [] }) => {
  const { doc, startY } = PdfEngine.createDocument({ title: title || 'Relatório', subtitle: subtitle || 'Documento emitido pelo Neny Software System', orientation, companyProfile });
  let currentY = PdfEngine.addLabeledTable(doc, [
    ['Registros', rows.length],
    ['Emitido em', `${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`],
    ['Origem', 'Neny Software System'],
  ], { startY, head: ['Resumo', 'Informação'], tableWidth: 182, headColor: PdfEngine.BRAND.secondary });
  if (summaryRows?.length) {
    currentY = PdfEngine.addLabeledTable(doc, summaryRows, { startY: currentY + 8, head: ['Indicador', 'Valor'], tableWidth: 182, headColor: PdfEngine.BRAND.primary });
  }
  PdfEngine.addDataTable(doc, columns, rows, { startY: currentY + 8, emptyText: 'Nenhum registro encontrado.' });
  PdfEngine.finalize(doc, filename, footer || 'Relatório emitido pelo Neny Software System');
};

const exportToPDF = (title, filters = {}, data = [], columns = [], extra = {}) => exportTablePdf({ title, subtitle: buildSubtitle('', filters), columns: normalizeColumns(columns), rows: normalizeRows(data, columns), filename: `${title || 'relatorio'}.pdf`, companyProfile: extra.companyProfile, summaryRows: extra.summaryRows || [] });

const exportToExcel = (filename, filters = {}, data = [], columns = []) => {
  const headers = normalizeColumns(columns); const rows = normalizeRows(data, columns);
  const filterRows = Object.entries(filters || {}).filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== '').map(([key, value]) => [`# ${key}`, value]);
  const csvLines = [...filterRows.map((row) => row.join(';')), ...(filterRows.length ? [''] : []), headers.join(';'), ...rows.map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g,'""')}"`).join(';'))];
  const blob = new Blob(['\uFEFF' + csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `${filename || 'relatorio'}.csv`; link.click(); URL.revokeObjectURL(url);
};

export const ReportExporter = { exportToPDF, exportToExcel, openPrintWindow, exportTablePdf };
