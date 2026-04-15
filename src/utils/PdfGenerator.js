import { PdfEngine } from './PdfEngine';

const formatCompetencia = (mes, ano) => `${String(mes || '').padStart(2, '0')}/${ano || '-'}`;

const number = (value) => Number(value || 0);

export const PdfGenerator = {
  generateHeader: (doc, title, companyName = 'Neny Software System') => {
    const { doc: builtDoc, startY } = PdfEngine.createDocument({ title, companyName });
    // Keep backward compatibility for rare legacy direct use.
    Object.assign(doc, builtDoc);
    return startY;
  },

  generateHolerite: (funcionario, dados) => {
    const nome = funcionario?.nome || funcionario?.employee_name || 'Colaborador';
    const competencia = formatCompetencia(dados?.mes, dados?.ano) || dados?.competencia || '-';
    const salarioBase = number(dados?.salario_bruto ?? dados?.salarioBase ?? dados?.base_salary);
    const proventos = number(dados?.proventos ?? dados?.earnings);
    const descontosExtras = number(dados?.descontos ?? dados?.discounts);
    const inss = number(dados?.inss);
    const irrf = number(dados?.irrf);
    const fgts = number(dados?.fgts);
    const liquido = number(dados?.salario_liquido ?? dados?.liquido ?? dados?.net_salary);
    const bruto = salarioBase + proventos;

    const { doc, startY } = PdfEngine.createDocument({
      title: 'Demonstrativo de Pagamento Mensal',
      subtitle: `${nome} • Competência ${competencia}`,
    });

    let currentY = PdfEngine.addLabeledTable(
      doc,
      [
        ['Colaborador', nome],
        ['CPF', funcionario?.cpf || '-'],
        ['Cargo', funcionario?.cargo || funcionario?.role || '-'],
        ['Competência', competencia],
        ['Data de pagamento', PdfEngine.asDate(dados?.data_pagamento || dados?.paid_at)],
        ['Status', dados?.status || '-'],
      ],
      { startY, tableWidth: 182 }
    );

    currentY = PdfEngine.addSectionTitle(doc, 'Composição da Folha', currentY + 10);

    currentY = PdfEngine.addDataTable(
      doc,
      ['Descrição', 'Vencimentos', 'Descontos'],
      [
        ['Salário Base', PdfEngine.asMoney(salarioBase), ''],
        ['Outros Proventos', PdfEngine.asMoney(proventos), ''],
        ['INSS', '', PdfEngine.asMoney(inss)],
        ['IRRF', '', PdfEngine.asMoney(irrf)],
        ['Outros Descontos', '', PdfEngine.asMoney(descontosExtras)],
      ],
      {
        startY: currentY + 2,
        columnStyles: {
          1: { halign: 'right' },
          2: { halign: 'right' },
        },
      }
    );

    currentY = PdfEngine.addLabeledTable(
      doc,
      [
        ['Salário Bruto', PdfEngine.asMoney(bruto)],
        ['FGTS', PdfEngine.asMoney(fgts)],
        ['Salário Líquido', PdfEngine.asMoney(liquido)],
      ],
      {
        startY: currentY + 8,
        head: ['Resumo', 'Valor'],
        tableWidth: 100,
        columnStyles: { 1: { halign: 'right' } },
        headColor: PdfEngine.BRAND.secondary,
      }
    );

    if (dados?.observacoes) {
      currentY = PdfEngine.addSectionTitle(doc, 'Observações', currentY + 10);
      PdfEngine.addParagraph(doc, dados.observacoes, currentY + 2, { width: 182, fontSize: 9.5, color: PdfEngine.BRAND.slate });
    }

    PdfEngine.finalize(doc, `Holerite_${nome}_${competencia}.pdf`, 'Holerite gerado pelo Neny Software System');
  },

  generateBalancete: (contas, periodo) => {
    const rows = (contas || []).map((c) => [
      c.codigo || '-',
      c.nome || '-',
      c.tipo || c.natureza || '-',
      PdfEngine.asMoney(c.saldo),
    ]);
    const companyProfile = typeof periodo === 'object' ? periodo.companyProfile : null;
    const periodoLabel = typeof periodo === 'object' ? periodo.periodo : periodo;
    const { doc, startY } = PdfEngine.createDocument({
      title: 'Balancete de Verificação',
      subtitle: `Período: ${periodoLabel || '-'}`,
      companyProfile,
    });

    PdfEngine.addDataTable(doc, ['Código', 'Conta', 'Tipo', 'Saldo'], rows, {
      startY,
      columnStyles: { 3: { halign: 'right' } },
    });

    PdfEngine.finalize(doc, 'Balancete.pdf');
  },

  generateDRE: (dados, periodo) => {
    const receitaBruta = number(dados?.receitaBruta ?? dados?.revenue);
    const deducoes = number(dados?.deducoes);
    const receitaLiquida = number(dados?.receitaLiquida ?? receitaBruta - deducoes);
    const custos = number(dados?.custos ?? dados?.costs);
    const lucroBruto = number(dados?.lucroBruto ?? receitaLiquida - custos);
    const despesas = number(dados?.despesas ?? dados?.expenses);
    const resultado = number(dados?.resultado ?? dados?.netProfit ?? lucroBruto - despesas);

    const companyProfile = typeof periodo === 'object' ? periodo.companyProfile : null;
    const periodoLabel = typeof periodo === 'object' ? periodo.periodo : periodo;
    const { doc, startY } = PdfEngine.createDocument({
      title: 'Demonstração do Resultado do Exercício (DRE)',
      subtitle: `Período: ${periodoLabel || '-'}`,
      companyProfile,
    });

    PdfEngine.addDataTable(
      doc,
      ['Descrição', 'Valor'],
      [
        ['Receita Bruta', PdfEngine.asMoney(receitaBruta)],
        ['(-) Deduções', PdfEngine.asMoney(deducoes)],
        ['(=) Receita Líquida', PdfEngine.asMoney(receitaLiquida)],
        ['(-) Custos', PdfEngine.asMoney(custos)],
        ['(=) Lucro Bruto', PdfEngine.asMoney(lucroBruto)],
        ['(-) Despesas Operacionais', PdfEngine.asMoney(despesas)],
        ['(=) Resultado Líquido', PdfEngine.asMoney(resultado)],
      ],
      { startY, columnStyles: { 1: { halign: 'right' } } }
    );

    PdfEngine.finalize(doc, 'DRE.pdf');
  },

  generateInventario: (produtos) => {
    const rows = (produtos || []).map((p) => {
      const preco = number(String(p.price || p.preco_venda || p.preco_custo || 0).replace(/[^\d,.-]/g, '').replace(',', '.'));
      const qtd = number(p.stock ?? p.quantidade);
      return [
        p.sku || '-',
        p.name || p.nome || '-',
        p.category || p.categoria || '-',
        String(qtd),
        PdfEngine.asMoney(preco),
        PdfEngine.asMoney(qtd * preco),
      ];
    });
    const totalValue = (produtos || []).reduce((acc, p) => {
      const preco = number(String(p.price || p.preco_venda || p.preco_custo || 0).replace(/[^\d,.-]/g, '').replace(',', '.'));
      const qtd = number(p.stock ?? p.quantidade);
      return acc + qtd * preco;
    }, 0);
    const companyProfile = Array.isArray(produtos) && produtos.companyProfile ? produtos.companyProfile : null;
    const { doc, startY } = PdfEngine.createDocument({ title: 'Inventário de Estoque', companyProfile });
    let currentY = PdfEngine.addDataTable(doc, ['SKU', 'Produto', 'Categoria', 'Qtd', 'Unitário', 'Total'], rows, {
      startY,
      columnStyles: { 3: { halign: 'right' }, 4: { halign: 'right' }, 5: { halign: 'right' } },
    });
    PdfEngine.addLabeledTable(doc, [['Valor total do estoque', PdfEngine.asMoney(totalValue)]], {
      startY: currentY + 8,
      head: ['Resumo', 'Valor'],
      tableWidth: 90,
      columnStyles: { 1: { halign: 'right' } },
      headColor: PdfEngine.BRAND.secondary,
    });
    PdfEngine.finalize(doc, 'Inventario.pdf');
  },

  generateOS: (os) => {
    const { doc, startY } = PdfEngine.createDocument({
      title: `Ordem de Serviço #${(os?.id ? String(os.id).slice(0, 8) : 'N/A')}`,
      subtitle: `${os?.status || '-'} • ${PdfEngine.asDate(os?.date || os?.data_prevista || os?.data_execucao)}`,
      companyProfile: os?.companyProfile || null,
    });

    let currentY = PdfEngine.addLabeledTable(doc, [
      ['Cliente', os?.client || os?.cliente || '-'],
      ['Técnico', os?.technician || os?.tecnico_nome || '-'],
      ['Prioridade', os?.priority || os?.prioridade || '-'],
      ['Tipo de Serviço', os?.serviceType || os?.tipo_servico || '-'],
      ['Endereço', os?.address || os?.endereco || '-'],
      ['Contato', os?.contact || os?.contato || '-'],
    ], { startY, tableWidth: 182 });

    currentY = PdfEngine.addSectionTitle(doc, 'Descrição do Serviço', currentY + 10);
    currentY = PdfEngine.addParagraph(doc, os?.service || os?.descricao || 'Sem descrição registrada.', currentY + 2, { width: 182 });

    if (os?.observacoes) {
      currentY = PdfEngine.addSectionTitle(doc, 'Observações', currentY + 8);
      PdfEngine.addParagraph(doc, os.observacoes, currentY + 2, { width: 182, color: PdfEngine.BRAND.slate });
    }

    PdfEngine.finalize(doc, `OS_${os?.id || 'registro'}.pdf`);
  },

  generateRelatorioFinanceiro: (data = [], filters = {}) => {
    const receitas = data.filter((i) => (i.type || i.tipo) === 'receita');
    const despesas = data.filter((i) => (i.type || i.tipo) === 'despesa');
    const totalReceitas = receitas.reduce((acc, item) => acc + number(item.amount || item.valor), 0);
    const totalDespesas = despesas.reduce((acc, item) => acc + number(item.amount || item.valor), 0);
    const saldo = totalReceitas - totalDespesas;
    const subtitle = [
      filters?.startDate ? `Início: ${PdfEngine.asDate(filters.startDate)}` : null,
      filters?.endDate ? `Fim: ${PdfEngine.asDate(filters.endDate)}` : null,
      filters?.category && filters.category !== 'all' ? `Categoria: ${filters.category}` : null,
    ].filter(Boolean).join(' • ');
    const { doc, startY } = PdfEngine.createDocument({ title: 'Relatório Financeiro', subtitle, companyProfile: filters?.companyProfile || null });
    let currentY = PdfEngine.addLabeledTable(doc, [
      ['Receitas', PdfEngine.asMoney(totalReceitas)],
      ['Despesas', PdfEngine.asMoney(totalDespesas)],
      ['Saldo Líquido', PdfEngine.asMoney(saldo)],
    ], { startY, tableWidth: 90, head: ['Indicador', 'Valor'], columnStyles: { 1: { halign: 'right' } } });

    const rows = data.map((item) => [
      PdfEngine.asDate(item.date || item.data),
      item.description || item.descricao || '-',
      item.category || item.categoria || '-',
      item.type || item.tipo || '-',
      PdfEngine.asMoney(item.amount || item.valor),
    ]);
    PdfEngine.addDataTable(doc, ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor'], rows, {
      startY: currentY + 8,
      columnStyles: { 4: { halign: 'right' } },
    });
    PdfEngine.finalize(doc, 'Relatorio_Financeiro.pdf');
  },

  generateCAT: (acidente, funcionario = {}) => {
    const colaborador = funcionario?.nome || funcionario?.name || 'Colaborador';
    const { doc, startY } = PdfEngine.createDocument({
      title: 'Comunicação de Acidente de Trabalho (CAT)',
      subtitle: `${colaborador} • ${PdfEngine.asDate(acidente?.data_acidente || acidente?.data)}`,
    });
    let currentY = PdfEngine.addLabeledTable(doc, [
      ['Colaborador', colaborador],
      ['CPF', funcionario?.cpf || '-'],
      ['Data do acidente', PdfEngine.asDate(acidente?.data_acidente || acidente?.data)],
      ['Hora', acidente?.hora_acidente || acidente?.hora || '-'],
      ['Local', acidente?.local || '-'],
      ['Tipo', acidente?.tipo || '-'],
      ['Parte do corpo', acidente?.parte_corpo || acidente?.parteCorpo || '-'],
      ['Severidade', acidente?.severidade || '-'],
      ['Dias de afastamento', PdfEngine.asText(acidente?.dias_afastamento ?? 0)],
      ['Status', acidente?.status || '-'],
    ], { startY, headColor: PdfEngine.BRAND.danger, tableWidth: 182 });

    currentY = PdfEngine.addSectionTitle(doc, 'Descrição do Acidente', currentY + 10);
    currentY = PdfEngine.addParagraph(doc, acidente?.descricao || '-', currentY + 2, { width: 182 });

    currentY = PdfEngine.addSectionTitle(doc, 'Relato / Providências', currentY + 8);
    PdfEngine.addParagraph(doc, acidente?.relatorio || acidente?.observacoes || '-', currentY + 2, { width: 182, color: PdfEngine.BRAND.slate });

    PdfEngine.finalize(doc, `CAT_${colaborador}_${acidente?.data_acidente || acidente?.data || 'registro'}.pdf`);
  },
};
