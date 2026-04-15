import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableCell, TableRow, WidthType } from 'docx';

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};

const formatCurrency = (value) => {
    if (typeof value !== 'number') return 'R$ 0,00';
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const exportToExcel = (data) => {
    const { rawData } = data;
    const wb = XLSX.utils.book_new();

    const financialSheet = XLSX.utils.json_to_sheet(rawData.transactions.map(t => ({
        'Data': formatDate(t.date),
        'Descrição': t.description,
        'Categoria': t.category,
        'Tipo': t.type,
        'Valor': t.amount,
        'Status': t.status,
    })));
    XLSX.utils.book_append_sheet(wb, financialSheet, 'Financeiro');
    
    const bovinosSheet = XLSX.utils.json_to_sheet(rawData.bovinos.map(a => ({
        'ID Brinco': a.serialNumber,
        'Nome': a.name,
        'Data de Nascimento': formatDate(a.birthDate),
        'Raça': a.breed,
        'Peso (kg)': a.weight,
        'Status': a.status,
    })));
    XLSX.utils.book_append_sheet(wb, bovinosSheet, 'Bovinos');
    
    const suinosSheet = XLSX.utils.json_to_sheet(rawData.suinos.map(a => ({
        'ID Brinco': a.serialNumber,
        'Data de Nascimento': formatDate(a.birthDate),
        'Raça': a.breed,
        'Peso (kg)': a.weight,
        'Status': a.status,
    })));
    XLSX.utils.book_append_sheet(wb, suinosSheet, 'Suinos');
    
    const frangosSheet = XLSX.utils.json_to_sheet(rawData.frangos.map(a => ({
        'Lote': a.lote,
        'Quantidade': a.quantity,
        'Data de Chegada': formatDate(a.arrivalDate),
        'Linhagem': a.lineage,
        'Status': a.status,
    })));
    XLSX.utils.book_append_sheet(wb, frangosSheet, 'Frangos');

    const lavourasSheet = XLSX.utils.json_to_sheet(rawData.lavouras.map(l => ({
        'Cultura': l.crop,
        'Área (ha)': l.hectares,
        'Data de Plantio': formatDate(l.plantingDate),
        'Status': l.status,
    })));
    XLSX.utils.book_append_sheet(wb, lavourasSheet, 'Lavouras');

    const sanidadeAnimalSheet = XLSX.utils.json_to_sheet(rawData.eventosAnimais.map(e => ({
        'Data': formatDate(e.date),
        'Tipo': e.eventType,
        'Animal/Lote ID': e.animalId,
        'Produto/Motivo': e.product,
        'Profissional': e.professional,
    })));
    XLSX.utils.book_append_sheet(wb, sanidadeAnimalSheet, 'Sanidade Animal');

    const sanidadeLavouraSheet = XLSX.utils.json_to_sheet(rawData.eventosLavouras.map(e => ({
        'Data': formatDate(e.date),
        'Tipo': e.eventType,
        'Lavoura ID': e.lavouraId,
        'Produto/Motivo': e.product,
        'Profissional': e.professional,
    })));
    XLSX.utils.book_append_sheet(wb, sanidadeLavouraSheet, 'Sanidade Lavoura');

    XLSX.writeFile(wb, 'Relatorio_Fazenda_5.0.xlsx');
};

export const exportToWord = (data) => {
    const { financialData, animalInventoryData, cropAreaData, animalHealthData, cropHealthData } = data;
    
    const children = [
        new Paragraph({
            children: [new TextRun({ text: 'Relatório Geral - Fazenda 5.0', bold: true, size: 32 })],
            heading: HeadingLevel.TITLE,
            spacing: { after: 400 },
        }),

        new Paragraph({
            children: [new TextRun({ text: 'Resumo Financeiro', bold: true, size: 24 })],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
        }),
        ...financialData.map(item => new Paragraph({ text: `${item.name}: ${formatCurrency(item.value)}`, bullet: { level: 0 } })),

        new Paragraph({
            children: [new TextRun({ text: 'Inventário Animal', bold: true, size: 24 })],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
        }),
        ...animalInventoryData.map(item => new Paragraph({ text: `${item.name}: ${item.value} unidades`, bullet: { level: 0 } })),

        new Paragraph({
            children: [new TextRun({ text: 'Distribuição de Lavouras', bold: true, size: 24 })],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
        }),
        ...cropAreaData.map(item => new Paragraph({ text: `${item.name}: ${item.hectares} ha`, bullet: { level: 0 } })),

        new Paragraph({
            children: [new TextRun({ text: 'Eventos de Sanidade Animal', bold: true, size: 24 })],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
        }),
        ...animalHealthData.map(item => new Paragraph({ text: `${item.name}: ${item.value} eventos`, bullet: { level: 0 } })),

        new Paragraph({
            children: [new TextRun({ text: 'Eventos de Sanidade da Lavoura', bold: true, size: 24 })],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
        }),
        ...cropHealthData.map(item => new Paragraph({ text: `${item.name}: ${item.value} eventos`, bullet: { level: 0 } })),
    ];

    const doc = new Document({
        sections: [{
            properties: {},
            children: children,
        }],
    });

    Packer.toBlob(doc).then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'Relatorio_Fazenda_5.0.docx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    });
};