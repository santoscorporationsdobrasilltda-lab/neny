import { v4 as uuidv4 } from 'uuid';

export const mockConversas = [
  {
    id: uuidv4(),
    cliente: "Ana Silva",
    telefone: "+55 11 98888-1234",
    avatar: "AS",
    status: "active", // active, waiting, closed
    ultimoMsg: "Gostaria de saber mais sobre o plano Premium.",
    tempo: "5 min",
    mensagens: [
      { id: 1, sender: "bot", text: "Olá! Bem-vindo ao atendimento SmartZap. Como posso ajudar?", time: "10:00" },
      { id: 2, sender: "cliente", text: "Olá, estou interessada nos planos.", time: "10:01" },
      { id: 3, sender: "atendente", text: "Oi Ana! Sou o Carlos. Claro, vou te explicar nossas opções.", time: "10:02" },
      { id: 4, sender: "cliente", text: "Gostaria de saber mais sobre o plano Premium.", time: "10:05" }
    ],
    tags: ["Interesse Alto", "Vendas"],
    estagio: "Negociação"
  },
  {
    id: uuidv4(),
    cliente: "Roberto Carlos",
    telefone: "+55 21 99999-5678",
    avatar: "RC",
    status: "waiting",
    ultimoMsg: "Meu boleto não chegou.",
    tempo: "15 min",
    mensagens: [
      { id: 1, sender: "bot", text: "Olá! Bem-vindo. Digite 1 para Vendas ou 2 para Suporte.", time: "09:30" },
      { id: 2, sender: "cliente", text: "2", time: "09:31" },
      { id: 3, sender: "cliente", text: "Meu boleto não chegou.", time: "09:45" }
    ],
    tags: ["Suporte", "Financeiro"],
    estagio: "Cliente"
  },
  {
    id: uuidv4(),
    cliente: "Fernanda Lima",
    telefone: "+55 31 97777-9999",
    avatar: "FL",
    status: "active",
    ultimoMsg: "Obrigada, vou aguardar.",
    tempo: "1h",
    mensagens: [
      { id: 1, sender: "bot", text: "Olá Fernanda. Em que posso ser útil?", time: "08:00" },
      { id: 2, sender: "cliente", text: "Quero cancelar meu pedido.", time: "08:10" },
      { id: 3, sender: "atendente", text: "Entendo. Já estamos verificando o status do envio.", time: "09:00" },
      { id: 4, sender: "cliente", text: "Obrigada, vou aguardar.", time: "09:05" }
    ],
    tags: ["Suporte", "Cancelamento"],
    estagio: "Cliente"
  }
];

export const mockHistorico = Array.from({ length: 15 }).map((_, i) => ({
  id: uuidv4(),
  cliente: `Cliente ${i + 1}`,
  telefone: `+55 11 9${Math.floor(Math.random() * 10000)}-${Math.floor(Math.random() * 10000)}`,
  inicio: new Date(Date.now() - Math.random() * 1000000000).toLocaleString(),
  fim: new Date(Date.now() - Math.random() * 100000000).toLocaleString(),
  duracao: `${Math.floor(Math.random() * 30)} min`,
  atendente: ["Carlos", "Mariana", "Bot"][Math.floor(Math.random() * 3)],
  tipo: Math.random() > 0.5 ? "Vendas" : "Suporte",
  satisfacao: Math.floor(Math.random() * 5) + 1,
  transcript: "Esta é uma transcrição simulada da conversa histórica..."
}));

export const mockFluxos = [
  {
    id: uuidv4(),
    nome: "Boas-vindas Padrão",
    objetivo: "Triagem Inicial",
    status: true,
    steps: [
      { type: "text", content: "Olá! Bem-vindo à NenySoft." },
      { type: "options", content: "Como podemos ajudar?", options: ["Vendas", "Suporte", "Financeiro"] }
    ]
  },
  {
    id: uuidv4(),
    nome: "Qualificação de Lead",
    objetivo: "Vendas",
    status: true,
    steps: [
      { type: "text", content: "Ótimo! Qual o tamanho da sua empresa?" },
      { type: "options", content: "Selecione:", options: ["1-10", "11-50", "50+"] },
      { type: "collect", content: "Qual seu e-mail corporativo?", field: "email" }
    ]
  },
  {
    id: uuidv4(),
    nome: "Pesquisa de Satisfação",
    objetivo: "Feedback",
    status: false,
    steps: [
      { type: "text", content: "Como foi seu atendimento hoje?" },
      { type: "options", content: "Dê uma nota:", options: ["1", "2", "3", "4", "5"] }
    ]
  }
];

export const mockIntencoes = [
  { id: uuidv4(), nome: "Consultar Preço", categoria: "Vendas", exemplos: ["Quanto custa?", "Qual o valor?", "Preço do plano"], status: true },
  { id: uuidv4(), nome: "Segunda Via Boleto", categoria: "Financeiro", exemplos: ["Não recebi o boleto", "Pagar fatura", "2ª via"], status: true },
  { id: uuidv4(), nome: "Falar com Humano", categoria: "Suporte", exemplos: ["Quero falar com gente", "Atendente por favor", "Humano"], status: true },
  { id: uuidv4(), nome: "Horário de Atendimento", categoria: "Informação", exemplos: ["Estão abertos?", "Até que horas?", "Funcionamento"], status: false }
];

export const mockClientes = [
  { id: uuidv4(), nome: "Ana Silva", telefone: "+55 11 98888-1234", origem: "WhatsApp", tags: ["Vip"], estagio: "Negociação" },
  { id: uuidv4(), nome: "Roberto Carlos", telefone: "+55 21 99999-5678", origem: "Site", tags: ["Novo"], estagio: "Lead Novo" },
  { id: uuidv4(), nome: "Empresa X", telefone: "+55 41 91234-5678", origem: "Indicação", tags: ["Corporativo"], estagio: "Proposta" }
];

export const mockDeals = [
  { id: uuidv4(), cliente: "Mercado Silva", valor: "R$ 5.000", produto: "ERP Completo", estagio: "Proposta" },
  { id: uuidv4(), cliente: "Tech Solutions", valor: "R$ 12.000", produto: "Consultoria", estagio: "Negociação" },
  { id: uuidv4(), cliente: "Padaria Central", valor: "R$ 1.500", produto: "Módulo Fiscal", estagio: "Qualificação" },
  { id: uuidv4(), cliente: "Loja de Roupas A", valor: "R$ 3.000", produto: "Sistema PDV", estagio: "Lead Novo" },
  { id: uuidv4(), cliente: "Construtora Beta", valor: "R$ 25.000", produto: "Gestão de Obras", estagio: "Ganhou" }
];

export const mockBaseConhecimento = [
  { id: uuidv4(), titulo: "Como emitir NFe", categoria: "Fiscal", atualizacao: "2023-10-15", status: true, conteudo: "Passo a passo para emissão..." },
  { id: uuidv4(), titulo: "Configurar Impressora", categoria: "Técnico", atualizacao: "2023-09-20", status: true, conteudo: "Drivers necessários..." },
  { id: uuidv4(), titulo: "Política de Devolução", categoria: "Comercial", atualizacao: "2023-11-01", status: false, conteudo: "Prazo de 7 dias..." }
];

export const mockDashboardMetrics = {
  conversasAtivas: 24,
  mensagensHoje: 1842,
  leadsGerados: 15,
  vendasEstimadas: "R$ 45.200",
  chartData: [
    { name: 'Seg', mensagens: 1200 },
    { name: 'Ter', mensagens: 1500 },
    { name: 'Qua', mensagens: 1842 },
    { name: 'Qui', mensagens: 1600 },
    { name: 'Sex', mensagens: 1900 },
    { name: 'Sab', mensagens: 800 },
    { name: 'Dom', mensagens: 400 },
  ],
  pieData: [
    { name: 'Vendas', value: 65, fill: '#3b82f6' },
    { name: 'Suporte', value: 35, fill: '#ef4444' },
  ]
};