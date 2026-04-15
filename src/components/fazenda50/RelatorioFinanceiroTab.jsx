import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, TrendingDown, Wallet, Printer } from 'lucide-react';
import { PdfEngine } from '@/utils/PdfEngine';

const currency = (v) => `R$ ${Number(v || 0).toFixed(2)}`;

const openPrintWindow = (title, columns, rows, summaryHtml = '', selectedFarm = null) => {
  const printWindow = window.open('', '_blank', 'width=1000,height=800');
  if (!printWindow) return;
  const farmHtml = selectedFarm ? `<div class="card"><div class="muted">Fazenda</div><div><strong>${selectedFarm.nome}</strong></div><div class="muted">${[selectedFarm.sigla, selectedFarm.cidade, selectedFarm.estado].filter(Boolean).join(' • ')}</div></div>` : '';
  printWindow.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          @page { size: A4; margin: 12mm; }
          body { font-family: Arial, sans-serif; font-size: 12pt; line-height: 1.4; color: #111827; }
          h1 { font-size: 20px; margin-bottom: 12px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
          th { background: #f8fafc; }
          .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
          .card { border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px; }
          .muted { color: #64748b; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        ${summaryHtml.replace('__FARM__', farmHtml)}
        <table>
          <thead><tr>${columns.map((c) => `<th>${c}</th>`).join('')}</tr></thead>
          <tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
        </table>
        <script>window.onload = () => window.print();</script>
      </body>
    </html>
  `);
  printWindow.document.close();
};

const RelatorioFinanceiroTab = ({ transactions = [], selectedFarm = null }) => {
  const totalReceitas = transactions.filter((t) => t.tipo === 'Receita').reduce((sum, t) => sum + Number(t.valor || 0), 0);
  const totalDespesas = transactions.filter((t) => t.tipo !== 'Receita').reduce((sum, t) => sum + Number(t.valor || 0), 0);
  const saldo = totalReceitas - totalDespesas;

  const byActivity = transactions.reduce((acc, t) => {
    const key = t.centro_custo || t.categoria || 'Geral';
    if (!acc[key]) acc[key] = { key, receitas: 0, despesas: 0 };
    if (t.tipo === 'Receita') acc[key].receitas += Number(t.valor || 0);
    else acc[key].despesas += Number(t.valor || 0);
    return acc;
  }, {});
  const activityRows = Object.values(byActivity);

  const pdfRows = transactions.map((t) => [
    t.data ? new Date(t.data).toLocaleDateString('pt-BR') : '-',
    t.tipo || '-',
    t.categoria || '-',
    t.descricao || '-',
    t.fazenda || '-',
    currency(t.valor),
    t.centro_custo || '-',
  ]);

  const farmRows = selectedFarm ? [
    ['Fazenda', selectedFarm.nome || '-'],
    ['Sigla / código', [selectedFarm.sigla, selectedFarm.codigo].filter(Boolean).join(' • ') || '-'],
    ['Localização', [selectedFarm.cidade, selectedFarm.estado].filter(Boolean).join(' / ') || '-'],
    ['Responsável', selectedFarm.responsavel || '-'],
    ['Características', selectedFarm.observacoes || '-'],
  ] : [];

  const handlePdf = () => {
    const { doc, startY } = PdfEngine.createDocument({
      title: 'Demonstrativo Financeiro Rural',
      subtitle: `${selectedFarm ? `Fazenda: ${selectedFarm.nome}. ` : ''}Consolidação por atividade e movimentação financeira.`,
    });

    let currentY = startY;
    if (farmRows.length) {
      currentY = PdfEngine.addLabeledTable(doc, farmRows, { startY, head: ['Dados da Fazenda', 'Informações'], tableWidth: 182, headColor: PdfEngine.BRAND.secondary }) + 8;
    }

    currentY = PdfEngine.addLabeledTable(doc, [
      ['Receitas', currency(totalReceitas)],
      ['Despesas', currency(totalDespesas)],
      ['Saldo', currency(saldo)],
    ], { startY: currentY, head: ['Indicador', 'Valor'], tableWidth: 90, columnStyles: { 1: { halign: 'right' } } });

    currentY = PdfEngine.addDataTable(doc, ['Atividade', 'Receitas', 'Despesas', 'Resultado'], activityRows.map((row) => [
      row.key, currency(row.receitas), currency(row.despesas), currency(row.receitas - row.despesas),
    ]), { startY: currentY + 8, headColor: PdfEngine.BRAND.secondary, columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' } } });

    PdfEngine.addDataTable(doc, ['Data', 'Tipo', 'Categoria', 'Descrição', 'Fazenda', 'Valor', 'Centro de Custo'], pdfRows.length ? pdfRows : [['-', '-', '-', 'Sem movimentações', '-', '-', '-']], { startY: currentY + 8, headColor: PdfEngine.BRAND.dark, fontSize: 8, cellPadding: 2.2, columnStyles: { 5: { halign: 'right' } } });
    PdfEngine.finalize(doc, 'relatorio_financeiro_rural.pdf');
  };

  const handlePrint = () => {
    const summaryHtml = `
      <div class="summary">
        __FARM__
        <div class="card"><div class="muted">Receitas</div><div><strong>${currency(totalReceitas)}</strong></div></div>
        <div class="card"><div class="muted">Despesas</div><div><strong>${currency(totalDespesas)}</strong></div></div>
        <div class="card"><div class="muted">Saldo</div><div><strong>${currency(saldo)}</strong></div></div>
      </div>`;
    openPrintWindow('Demonstrativo Financeiro Rural', ['Data', 'Tipo', 'Categoria', 'Descrição', 'Fazenda', 'Valor', 'Centro de Custo'], pdfRows, summaryHtml, selectedFarm);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border rounded-xl p-4 shadow-sm"><div className="text-sm text-slate-500 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-emerald-600" />Receitas</div><div className="text-2xl font-bold text-emerald-700 mt-1">{currency(totalReceitas)}</div></div>
        <div className="bg-white border rounded-xl p-4 shadow-sm"><div className="text-sm text-slate-500 flex items-center gap-2"><TrendingDown className="w-4 h-4 text-red-600" />Despesas</div><div className="text-2xl font-bold text-red-700 mt-1">{currency(totalDespesas)}</div></div>
        <div className="bg-white border rounded-xl p-4 shadow-sm"><div className="text-sm text-slate-500 flex items-center gap-2"><Wallet className="w-4 h-4 text-blue-600" />Saldo</div><div className={`text-2xl font-bold mt-1 ${saldo >= 0 ? 'text-blue-700' : 'text-red-700'}`}>{currency(saldo)}</div></div>
      </div>

      <div className="bg-white border rounded-xl shadow-sm p-5">
        <div className="flex flex-col md:flex-row justify-between gap-3 mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Rentabilidade por atividade</h3>
            <p className="text-sm text-slate-500">{selectedFarm ? `Resultado financeiro da fazenda ${selectedFarm.nome}.` : 'Resultado por centro de custo/categoria.'}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}><Printer className="w-4 h-4 mr-2" />Imprimir</Button>
            <Button onClick={handlePdf} className="bg-blue-600 hover:bg-blue-700"><Download className="w-4 h-4 mr-2" />PDF</Button>
          </div>
        </div>

        <div className="overflow-x-auto border rounded-xl">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200"><tr><th className="p-3">Atividade</th><th className="p-3">Receitas</th><th className="p-3">Despesas</th><th className="p-3">Resultado</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {activityRows.length === 0 ? <tr><td colSpan="4" className="p-4 text-center text-slate-500">Sem dados para consolidar.</td></tr> : activityRows.map((row) => <tr key={row.key}><td className="p-3">{row.key}</td><td className="p-3 text-emerald-700 font-medium">{currency(row.receitas)}</td><td className="p-3 text-red-700 font-medium">{currency(row.despesas)}</td><td className={`p-3 font-semibold ${(row.receitas - row.despesas) >= 0 ? 'text-blue-700' : 'text-red-700'}`}>{currency(row.receitas - row.despesas)}</td></tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RelatorioFinanceiroTab;
