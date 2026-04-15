import React, { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { PdfEngine } from '@/utils/PdfEngine';
import { Button } from '@/components/ui/button';
import { Printer, Download, X } from 'lucide-react';

const fmtDate = (v) => (v ? new Date(v).toLocaleDateString('pt-BR') : '-');

const normalizeRows = (rows, fallbackRow) => (rows.length ? rows : [fallbackRow]);

const BovinoQRModal = ({ animal, onClose }) => {
    const qrRef = useRef(null);
    const historico = animal?.historico || [];
    const movimentacoes = animal?.movimentacoes || [];
    const pesagens = animal?.pesagens || [];
    const alimentacoes = animal?.alimentacoes || [];
    const contagens = animal?.contagens || [];
    const preGtas = animal?.preGtas || [];
    const fazendaData = animal?.fazendaData || null;

    const buildQrPayload = () => ({
        id: animal.id,
        nome: animal.nome,
        brinco: animal.brinco,
        categoria: animal.categoria,
        raca: animal.raca,
        lote: animal.lote,
        fazenda: animal.fazenda || fazendaData?.nome || null,
        fazenda_sigla: fazendaData?.sigla || null,
        fazenda_cidade: fazendaData?.cidade || null,
        fazenda_estado: fazendaData?.estado || null,
        observacoes: animal.observacoes || null,
        tipo: 'bovino',
        rota: `/fazenda50/bovinos?animal=${animal.id}`,
    });

    const buildQrValue = () => {
        const payload = buildQrPayload();
        const json = JSON.stringify(payload);

        if (typeof window === 'undefined') return json;

        try {
            const encoded = window.btoa(unescape(encodeURIComponent(json)));
            return `${window.location.origin}/fazenda50/qr?id=${encodeURIComponent(animal.id)}&payload=${encodeURIComponent(encoded)}`;
        } catch {
            return json;
        }
    };

    const addSectionTable = (doc, title, columns, rows, currentY, headColor) => {
        let nextY = PdfEngine.addSectionTitle(doc, title, currentY);
        nextY = PdfEngine.addDataTable(doc, columns, rows, {
            startY: nextY + 1,
            headColor,
            fontSize: 8,
            cellPadding: 2.4,
        });
        return nextY + 8;
    };

    const downloadPDF = () => {
        const { doc, startY } = PdfEngine.createDocument({
            title: 'Ficha Técnica do Animal',
            subtitle: `${animal.nome || '-'} • Brinco ${animal.brinco || '-'}`,
        });
        const canvas = qrRef.current?.querySelector('canvas');
        const qrImage = canvas ? canvas.toDataURL('image/png') : null;

        const infoRows = [
            ['Nome', animal.nome || '-'],
            ['Brinco', animal.brinco || '-'],
            ['Categoria', animal.categoria || '-'],
            ['Raça', animal.raca || '-'],
            ['Lote', animal.lote || '-'],
            ['Fazenda', animal.fazenda || fazendaData?.nome || '-'],
            ['Sigla / código', [fazendaData?.sigla, fazendaData?.codigo].filter(Boolean).join(' • ') || '-'],
            ['Localização da fazenda', [fazendaData?.cidade, fazendaData?.estado].filter(Boolean).join(' / ') || '-'],
            ['Responsável da fazenda', fazendaData?.responsavel || '-'],
            ['Características da fazenda', fazendaData?.observacoes || '-'],
            ['Origem', animal.origem || '-'],
            ['Status', animal.status || '-'],
            ['Nascimento', fmtDate(animal.nascimento)],
            ['Observações', animal.observacoes || '-'],
        ];

        let currentY = PdfEngine.addLabeledTable(doc, infoRows, {
            startY,
            tableWidth: 110,
            headColor: PdfEngine.BRAND.primary,
        });

        if (qrImage) {
            doc.addImage(qrImage, 'PNG', 145, startY + 2, 48, 48);
            doc.setFontSize(9);
            doc.setTextColor(...PdfEngine.BRAND.slate);
            doc.text('QR de identificação', 169, startY + 57, { align: 'center' });
        }

        currentY = addSectionTable(
            doc,
            'Histórico Sanitário Individual',
            ['Data', 'Evento', 'Produto', 'Dose', 'Próxima data', 'Responsável'],
            normalizeRows(
                historico.map((item) => [
                    fmtDate(item.data),
                    item.tipo_evento || '-',
                    item.produto || '-',
                    item.dose || '-',
                    fmtDate(item.proxima_data),
                    item.responsavel || '-',
                ]),
                ['-', 'Sem histórico sanitário registrado', '-', '-', '-', '-']
            ),
            Math.max(currentY + 8, startY + 64),
            PdfEngine.BRAND.secondary
        );

        currentY = addSectionTable(
            doc,
            'Histórico de Movimentação',
            ['Data', 'Tipo', 'Origem', 'Destino', 'Motivo', 'Observações'],
            normalizeRows(
                movimentacoes.map((item) => [
                    fmtDate(item.data),
                    item.tipo_movimentacao || '-',
                    item.origem || '-',
                    item.destino || '-',
                    item.motivo || '-',
                    item.observacoes || '-',
                ]),
                ['-', 'Sem movimentações registradas', '-', '-', '-', '-']
            ),
            currentY,
            [37, 99, 235]
        );

        currentY = addSectionTable(
            doc,
            'Registro de Pesagem',
            ['Data', 'Peso', 'Unidade', 'Tipo', 'Ganho', 'Responsável'],
            normalizeRows(
                pesagens.map((item) => [
                    fmtDate(item.data),
                    item.peso ?? '-',
                    item.unidade || '-',
                    item.tipo_pesagem || '-',
                    item.ganho_peso ?? '-',
                    item.responsavel || '-',
                ]),
                ['-', 'Sem pesagens registradas', '-', '-', '-', '-']
            ),
            currentY,
            [124, 58, 237]
        );

        currentY = addSectionTable(
            doc,
            'Alimentação Adicional',
            ['Data', 'Tipo', 'Produto', 'Quantidade', 'Frequência', 'Responsável'],
            normalizeRows(
                alimentacoes.map((item) => [
                    fmtDate(item.data),
                    item.tipo_alimentacao || '-',
                    item.produto || '-',
                    `${item.quantidade ?? '-'} ${item.unidade || ''}`.trim(),
                    item.frequencia || '-',
                    item.responsavel || '-',
                ]),
                ['-', 'Sem alimentações registradas', '-', '-', '-', '-']
            ),
            currentY,
            [217, 119, 6]
        );

        currentY = addSectionTable(
            doc,
            'Histórico de Contagem em Curral ou Pasto',
            ['Data', 'Tipo local', 'Local', 'Quantidade', 'Responsável', 'Observações'],
            normalizeRows(
                contagens.map((item) => [
                    fmtDate(item.data),
                    item.tipo_local || '-',
                    item.local_nome || '-',
                    item.quantidade ?? '-',
                    item.responsavel || '-',
                    item.observacoes || '-',
                ]),
                ['-', 'Sem contagens registradas', '-', '-', '-', '-']
            ),
            currentY,
            [71, 85, 105]
        );

        addSectionTable(
            doc,
            'Pré-Registro de GTA',
            ['Data prevista', 'Finalidade', 'Origem', 'Destino', 'Status', 'Transportador'],
            normalizeRows(
                preGtas.map((item) => [
                    fmtDate(item.data_prevista),
                    item.finalidade || '-',
                    item.origem || '-',
                    item.destino || '-',
                    item.status || '-',
                    item.transportador || '-',
                ]),
                ['-', 'Sem pré-registros de GTA', '-', '-', '-', '-']
            ),
            currentY,
            [79, 70, 229]
        );

        PdfEngine.finalize(doc, `ficha_${String(animal.nome || 'animal').replace(/\s+/g, '_')}_${String(animal.brinco || 'id')}.pdf`);
    };

    const handlePrint = () => {
        const content = document.getElementById('printable-bovino-area');
        const w = window.open('', '_blank', 'width=1000,height=800');
        if (!w) return;
        w.document.write(`
      <html>
        <head>
          <title>Ficha Técnica do Animal</title>
          <style>
            @page { size: A4; margin: 12mm; }
            body { font-family: Arial, sans-serif; font-size: 12pt; color: #111827; line-height: 1.4; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
            th { background: #f8fafc; }
            .pill { display:inline-block;padding:4px 8px;background:#dbeafe;color:#1e3a8a;border-radius:999px;font-size:11px; }
            .section-title { margin-top: 24px; font-size: 18px; font-weight: bold; color: #1e3a8a; }
          </style>
        </head>
        <body>${content.innerHTML}<script>window.onload = () => window.print();</script></body>
      </html>
    `);
        w.document.close();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[92vh] overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800">Ficha Técnica & QR do Animal</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-6 overflow-y-auto max-h-[calc(92vh-88px)]">
                    <div id="printable-bovino-area" className="space-y-6">
                        <div className="flex flex-col md:flex-row justify-between gap-6">
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold text-[#1e3a8a]">{animal.nome || '-'}</h2>
                                <p className="text-slate-600 font-mono text-sm">Brinco: {animal.brinco || '-'}</p>
                                <span className="pill">{animal.categoria || 'Sem categoria'}</span>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 pt-3 text-sm text-slate-700">
                                    <p><strong>Raça:</strong> {animal.raca || '-'}</p>
                                    <p><strong>Lote:</strong> {animal.lote || '-'}</p>
                                    <p><strong>Fazenda:</strong> {animal.fazenda || fazendaData?.nome || '-'}</p>
                                    <p><strong>Sigla/Código:</strong> {[fazendaData?.sigla, fazendaData?.codigo].filter(Boolean).join(' • ') || '-'}</p>
                                    <p><strong>Localização:</strong> {[fazendaData?.cidade, fazendaData?.estado].filter(Boolean).join(' / ') || '-'}</p>
                                    <p><strong>Responsável:</strong> {fazendaData?.responsavel || '-'}</p>
                                    <p><strong>Origem:</strong> {animal.origem || '-'}</p>
                                    <p><strong>Status:</strong> {animal.status || '-'}</p>
                                    <p><strong>Nascimento:</strong> {fmtDate(animal.nascimento)}</p>
                                </div>
                                <div className="pt-2 text-sm text-slate-700 space-y-1">
                                    <div><strong>Observações:</strong> {animal.observacoes || '-'}</div>
                                    {fazendaData?.observacoes ? <div><strong>Características da fazenda:</strong> {fazendaData.observacoes}</div> : null}
                                </div>
                            </div>
                            <div ref={qrRef} className="bg-white p-4 rounded-lg shadow-inner border border-slate-200 self-start">
                                <QRCodeCanvas value={buildQrValue()} size={180} level="H" includeMargin />
                                <p className="text-center text-xs text-slate-500 mt-2">Identificação do animal</p>
                            </div>
                        </div>

                        <div>
                            <h4 className="section-title text-lg font-bold text-slate-800 mb-3">Histórico Sanitário Individual</h4>
                            <div className="overflow-x-auto border rounded-xl">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="p-3">Data</th>
                                            <th className="p-3">Evento</th>
                                            <th className="p-3">Produto</th>
                                            <th className="p-3">Dose</th>
                                            <th className="p-3">Próxima data</th>
                                            <th className="p-3">Responsável</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {historico.length === 0 ? (
                                            <tr><td colSpan="6" className="p-4 text-center text-slate-500">Nenhum evento sanitário registrado para este animal.</td></tr>
                                        ) : historico.map((item) => (
                                            <tr key={item.id}>
                                                <td className="p-3">{fmtDate(item.data)}</td>
                                                <td className="p-3">{item.tipo_evento || '-'}</td>
                                                <td className="p-3">{item.produto || '-'}</td>
                                                <td className="p-3">{item.dose || '-'}</td>
                                                <td className="p-3">{fmtDate(item.proxima_data)}</td>
                                                <td className="p-3">{item.responsavel || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div>
                            <h4 className="section-title text-lg font-bold text-slate-800 mb-3">Histórico de Movimentação</h4>
                            <div className="overflow-x-auto border rounded-xl">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="p-3">Data</th>
                                            <th className="p-3">Tipo</th>
                                            <th className="p-3">Origem</th>
                                            <th className="p-3">Destino</th>
                                            <th className="p-3">Motivo</th>
                                            <th className="p-3">Observações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {movimentacoes.length === 0 ? (
                                            <tr><td colSpan="6" className="p-4 text-center text-slate-500">Nenhuma movimentação registrada para este animal.</td></tr>
                                        ) : movimentacoes.map((item) => (
                                            <tr key={item.id}>
                                                <td className="p-3">{fmtDate(item.data)}</td>
                                                <td className="p-3">{item.tipo_movimentacao || '-'}</td>
                                                <td className="p-3">{item.origem || '-'}</td>
                                                <td className="p-3">{item.destino || '-'}</td>
                                                <td className="p-3">{item.motivo || '-'}</td>
                                                <td className="p-3">{item.observacoes || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div>
                            <h4 className="section-title text-lg font-bold text-slate-800 mb-3">Registro de Pesagem</h4>
                            <div className="overflow-x-auto border rounded-xl">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="p-3">Data</th>
                                            <th className="p-3">Peso</th>
                                            <th className="p-3">Unidade</th>
                                            <th className="p-3">Tipo</th>
                                            <th className="p-3">Ganho</th>
                                            <th className="p-3">Responsável</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {pesagens.length === 0 ? (
                                            <tr><td colSpan="6" className="p-4 text-center text-slate-500">Nenhuma pesagem registrada para este animal.</td></tr>
                                        ) : pesagens.map((item) => (
                                            <tr key={item.id}>
                                                <td className="p-3">{fmtDate(item.data)}</td>
                                                <td className="p-3">{item.peso ?? '-'}</td>
                                                <td className="p-3">{item.unidade || '-'}</td>
                                                <td className="p-3">{item.tipo_pesagem || '-'}</td>
                                                <td className="p-3">{item.ganho_peso ?? '-'}</td>
                                                <td className="p-3">{item.responsavel || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div>
                            <h4 className="section-title text-lg font-bold text-slate-800 mb-3">Alimentação Adicional</h4>
                            <div className="overflow-x-auto border rounded-xl">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="p-3">Data</th>
                                            <th className="p-3">Tipo</th>
                                            <th className="p-3">Produto</th>
                                            <th className="p-3">Quantidade</th>
                                            <th className="p-3">Frequência</th>
                                            <th className="p-3">Responsável</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {alimentacoes.length === 0 ? (
                                            <tr><td colSpan="6" className="p-4 text-center text-slate-500">Nenhum registro de alimentação para este animal.</td></tr>
                                        ) : alimentacoes.map((item) => (
                                            <tr key={item.id}>
                                                <td className="p-3">{fmtDate(item.data)}</td>
                                                <td className="p-3">{item.tipo_alimentacao || '-'}</td>
                                                <td className="p-3">{item.produto || '-'}</td>
                                                <td className="p-3">{item.quantidade ?? '-'} {item.unidade || ''}</td>
                                                <td className="p-3">{item.frequencia || '-'}</td>
                                                <td className="p-3">{item.responsavel || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div>
                            <h4 className="section-title text-lg font-bold text-slate-800 mb-3">Histórico de Contagem em Curral ou Pasto</h4>
                            <div className="overflow-x-auto border rounded-xl">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="p-3">Data</th>
                                            <th className="p-3">Tipo do local</th>
                                            <th className="p-3">Local</th>
                                            <th className="p-3">Quantidade</th>
                                            <th className="p-3">Responsável</th>
                                            <th className="p-3">Observações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {contagens.length === 0 ? (
                                            <tr><td colSpan="6" className="p-4 text-center text-slate-500">Nenhuma contagem registrada para este animal.</td></tr>
                                        ) : contagens.map((item) => (
                                            <tr key={item.id}>
                                                <td className="p-3">{fmtDate(item.data)}</td>
                                                <td className="p-3">{item.tipo_local || '-'}</td>
                                                <td className="p-3">{item.local_nome || '-'}</td>
                                                <td className="p-3">{item.quantidade ?? '-'}</td>
                                                <td className="p-3">{item.responsavel || '-'}</td>
                                                <td className="p-3">{item.observacoes || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div>
                            <h4 className="section-title text-lg font-bold text-slate-800 mb-3">Pré-Registro de GTA</h4>
                            <div className="overflow-x-auto border rounded-xl">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="p-3">Data prevista</th>
                                            <th className="p-3">Finalidade</th>
                                            <th className="p-3">Origem</th>
                                            <th className="p-3">Destino</th>
                                            <th className="p-3">Status</th>
                                            <th className="p-3">Transportador</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {preGtas.length === 0 ? (
                                            <tr><td colSpan="6" className="p-4 text-center text-slate-500">Nenhum pré-registro de GTA para este animal.</td></tr>
                                        ) : preGtas.map((item) => (
                                            <tr key={item.id}>
                                                <td className="p-3">{fmtDate(item.data_prevista)}</td>
                                                <td className="p-3">{item.finalidade || '-'}</td>
                                                <td className="p-3">{item.origem || '-'}</td>
                                                <td className="p-3">{item.destino || '-'}</td>
                                                <td className="p-3">{item.status || '-'}</td>
                                                <td className="p-3">{item.transportador || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full mt-6">
                        <Button onClick={handlePrint} variant="outline" className="w-full border-slate-300"><Printer className="w-4 h-4 mr-2" /> Imprimir</Button>
                        <Button onClick={downloadPDF} className="w-full bg-[#3b82f6] text-white"><Download className="w-4 h-4 mr-2" /> Baixar PDF</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BovinoQRModal;
