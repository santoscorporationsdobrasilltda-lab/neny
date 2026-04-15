import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, PieChart, FileText, Download, Calendar, Filter, Eye, Share2, Printer, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useRead } from '@/hooks/useRead';

const Relatorios = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');

  const { data: pedidos = [], loading: loadingPedidos } = useRead('vendas_pedidos');
  const { data: financeiro = [], loading: loadingFinanceiro } = useRead('financeiro_lancamentos');
  const { data: estoque = [], loading: loadingEstoque } = useRead('estoque_produtos');
  const { data: clientes = [], loading: loadingClientes } = useRead('sac_crm_clientes');

  const loading = loadingPedidos || loadingFinanceiro || loadingEstoque || loadingClientes;

  const reportMetrics = useMemo(() => {
    const receitas = financeiro.filter((item) => (item?.tipo || '').toLowerCase() === 'receita');
    const despesas = financeiro.filter((item) => (item?.tipo || '').toLowerCase() === 'despesa');
    return [
      { title: 'Pedidos de venda', value: String(pedidos.length), icon: FileText, color: 'from-blue-500 to-indigo-600' },
      { title: 'Lançamentos financeiros', value: String(financeiro.length), icon: BarChart3, color: 'from-green-500 to-emerald-600' },
      { title: 'Produtos em estoque', value: String(estoque.length), icon: PieChart, color: 'from-purple-500 to-violet-600' },
      { title: 'Clientes cadastrados', value: String(clientes.length), icon: TrendingUp, color: 'from-orange-500 to-red-600' },
      { title: 'Receitas', value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(receitas.reduce((acc, item) => acc + Number(item?.valor || 0), 0)), icon: TrendingUp, color: 'from-emerald-500 to-green-600' },
      { title: 'Despesas', value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(despesas.reduce((acc, item) => acc + Number(item?.valor || 0), 0)), icon: BarChart3, color: 'from-rose-500 to-red-600' },
    ];
  }, [pedidos, financeiro, estoque, clientes]);

  const availableReports = useMemo(() => ([
    { id: 1, name: 'Relatório de Vendas', description: 'Pedidos e evolução de vendas.', type: 'Vendas', status: pedidos.length ? 'Atualizado' : 'Sem dados', icon: TrendingUp },
    { id: 2, name: 'Análise Financeira', description: 'Receitas, despesas e saldo.', type: 'Financeiro', status: financeiro.length ? 'Atualizado' : 'Sem dados', icon: BarChart3 },
    { id: 3, name: 'Inventário de Estoque', description: 'Situação atual dos produtos.', type: 'Estoque', status: estoque.length ? 'Atualizado' : 'Sem dados', icon: PieChart },
    { id: 4, name: 'Base de Clientes', description: 'Visão consolidada dos clientes.', type: 'Clientes', status: clientes.length ? 'Atualizado' : 'Sem dados', icon: FileText },
  ]), [pedidos.length, financeiro.length, estoque.length, clientes.length]);

  const recentReports = useMemo(() => ([
    { id: 1, name: 'Pedidos de Vendas', type: 'Tela', size: `${pedidos.length} registros`, date: new Date().toLocaleDateString('pt-BR') },
    { id: 2, name: 'Financeiro', type: 'Tela', size: `${financeiro.length} registros`, date: new Date().toLocaleDateString('pt-BR') },
  ]), [pedidos.length, financeiro.length]);

  const handleAction = (action, item = null) => {
    toast({ title: `📊 ${action}`, description: item ? `Ação em "${item.name}" executada.` : 'Ação executada com sucesso.' });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Atualizado': return 'status-success';
      case 'Pendente': return 'status-warning';
      default: return 'status-info';
    }
  };
  const getFileTypeIcon = (type) => (type === 'PDF' ? '📄' : type === 'Excel' ? '📊' : '📁');
  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'vendas', label: 'Vendas' },
    { id: 'financeiro', label: 'Financeiro' },
    { id: 'personalizados', label: 'Personalizados' },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text text-shadow">Relatórios</h1>
          <p className="text-slate-600 mt-1">Análises e insights consolidados dos módulos principais.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => handleAction('Agendar Relatório')} className="btn-secondary"><Calendar className="w-4 h-4 mr-2" />Agendar</Button>
          <Button variant="outline" onClick={() => handleAction('Novo Dashboard')} className="btn-secondary"><BarChart3 className="w-4 h-4 mr-2" />Dashboard</Button>
          <Button onClick={() => handleAction('Novo Relatório')} className="btn-primary"><FileText className="w-4 h-4 mr-2" />Novo Relatório</Button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="glass-effect rounded-2xl p-1">
        <div className="flex space-x-1">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${activeTab === tab.id ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </motion.div>

      {loading ? <div className="glass-effect rounded-2xl p-6 text-slate-700">Carregando métricas e relatórios...</div> : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <motion.div key={`${metric.title}-${index}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 + 0.15 }} className="metric-card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-600 mb-2">{metric.title}</p>
                  <p className="text-2xl font-bold text-slate-900 mb-1 break-words">{metric.value}</p>
                </div>
                <div className={`w-12 h-12 bg-gradient-to-r ${metric.color} rounded-xl flex items-center justify-center`}><Icon className="w-6 h-6 text-white" /></div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-effect rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900">Relatórios Disponíveis</h3>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => handleAction('Atualizar Todos')}><RefreshCw className="w-4 h-4 mr-2" />Atualizar</Button>
            <Button variant="outline" size="sm" onClick={() => handleAction('Filtrar Relatórios')}><Filter className="w-4 h-4 mr-2" />Filtrar</Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {availableReports.map((report, index) => {
            const Icon = report.icon;
            return (
              <motion.div key={report.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.08 + 0.45 }} className="bg-white/60 backdrop-blur-sm border border-white/20 rounded-xl p-6 card-hover">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center"><Icon className="w-5 h-5 text-white" /></div>
                    <div><h4 className="font-semibold text-slate-900">{report.name}</h4><p className="text-sm text-slate-600">{report.description}</p></div>
                  </div>
                  <span className={`status-badge ${getStatusClass(report.status)}`}>{report.status}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-600 mb-4"><span>Tipo: {report.type}</span><span>{report.status}</span></div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleAction('Visualizar', report)} className="flex-1"><Eye className="w-4 h-4 mr-2" />Visualizar</Button>
                  <Button variant="outline" size="sm" onClick={() => handleAction('Gerar', report)} className="flex-1"><RefreshCw className="w-4 h-4 mr-2" />Gerar</Button>
                  <Button variant="outline" size="sm" onClick={() => handleAction('Exportar', report)}><Download className="w-4 h-4" /></Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="glass-effect rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900">Painel operacional rápido</h3>
          <Button variant="ghost" onClick={() => handleAction('Ver Todos os Relatórios')}>Ver todos</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-medium text-slate-600">Painel</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Tipo</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Volume</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Atualizado</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Ações</th>
              </tr>
            </thead>
            <tbody>
              {recentReports.map((report) => (
                <tr key={report.id} className="table-row">
                  <td className="py-3 px-4"><div className="flex items-center gap-3"><span className="text-2xl">{getFileTypeIcon(report.type)}</span><span className="font-medium text-slate-900">{report.name}</span></div></td>
                  <td className="py-3 px-4"><span className="status-badge status-info">{report.type}</span></td>
                  <td className="py-3 px-4 text-slate-600">{report.size}</td>
                  <td className="py-3 px-4 text-slate-600">{report.date}</td>
                  <td className="py-3 px-4"><div className="flex items-center gap-2"><Button variant="ghost" size="sm" onClick={() => handleAction('Baixar', report)}><Download className="w-4 h-4" /></Button><Button variant="ghost" size="sm" onClick={() => handleAction('Compartilhar', report)}><Share2 className="w-4 h-4" /></Button><Button variant="ghost" size="sm" onClick={() => handleAction('Imprimir', report)}><Printer className="w-4 h-4" /></Button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Relatorios;
