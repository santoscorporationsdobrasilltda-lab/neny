import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, Users, UserPlus, TrendingUp, Star, Search, Filter, Download, Eye, Edit, Trash2, Phone, Mail, MapPin
} from 'lucide-react';
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import useLocalStorage from '@/hooks/useLocalStorage';
import { v4 as uuidv4 } from 'uuid';

const Clientes = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('clientes');
  const [clients, setClients] = useLocalStorage('clients', [
    { id: uuidv4(), name: 'João Silva', email: 'joao.silva@email.com', phone: '(11) 99999-9999', city: 'São Paulo', totalPurchases: 'R$ 12.450,00', lastPurchase: '2025-09-15', status: 'Ativo', type: 'Premium' },
    { id: uuidv4(), name: 'Maria Santos', email: 'maria.santos@email.com', phone: '(11) 88888-8888', city: 'Rio de Janeiro', totalPurchases: 'R$ 8.920,50', lastPurchase: '2025-09-14', status: 'Ativo', type: 'Regular' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  const clientMetrics = useMemo(() => {
    const totalClients = clients.length;
    const activeClients = clients.filter(c => c.status === 'Ativo').length;
    const vipClients = clients.filter(c => c.type === 'VIP').length;
    return [
      { title: 'Total de Clientes', value: totalClients, change: '', icon: Users, color: 'from-blue-500 to-indigo-600' },
      { title: 'Novos este Mês', value: '0', change: '', icon: UserPlus, color: 'from-green-500 to-emerald-600' },
      { title: 'Clientes Ativos', value: activeClients, change: '', icon: TrendingUp, color: 'from-purple-500 to-violet-600' },
      { title: 'Clientes VIP', value: vipClients, change: '', icon: Star, color: 'from-orange-500 to-yellow-600' }
    ];
  }, [clients]);

  const handleOpenModal = (client = null) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };
  
  const handleSaveClient = (clientData) => {
    if (editingClient) {
      setClients(clients.map(c => c.id === editingClient.id ? { ...c, ...clientData } : c));
      toast({ title: "✅ Cliente Atualizado", description: "Os dados do cliente foram atualizados." });
    } else {
      setClients([...clients, { id: uuidv4(), ...clientData }]);
      toast({ title: "✅ Cliente Adicionado", description: "Um novo cliente foi adicionado com sucesso!" });
    }
    setIsModalOpen(false);
    setEditingClient(null);
  };
  
  const handleDelete = (id) => {
    setClients(clients.filter(c => c.id !== id));
    toast({ title: "🗑️ Cliente Excluído", description: "O cliente foi removido da sua lista." });
  };

  const getStatusClass = (status) => {
    switch (status) { case 'Ativo': return 'status-success'; case 'Inativo': return 'status-danger'; default: return 'status-info'; }
  };
  const getTypeClass = (type) => {
    switch (type) { case 'VIP': return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'; case 'Premium': return 'bg-gradient-to-r from-purple-500 to-violet-600 text-white'; case 'Regular': return 'bg-slate-100 text-slate-700'; default: return 'status-info'; }
  };
  
  const tabs = [ { id: 'clientes', label: 'Clientes' }, { id: 'segmentacao', label: 'Segmentação' }, { id: 'historico', label: 'Histórico' }, { id: 'comunicacao', label: 'Comunicação' } ];
  
  const clientGrowthData = [
    { name: 'Jan', clientes: 120 }, { name: 'Fev', clientes: 150 }, { name: 'Mar', clientes: 180 }, { name: 'Abr', clientes: 210 }, { name: 'Mai', clientes: 250 }, { name: 'Jun', clientes: 280 }
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text text-shadow">Clientes</h1>
          <p className="text-slate-600 mt-1">Gerencie seu relacionamento com clientes</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="btn-secondary"><Download className="w-4 h-4 mr-2" />Importar</Button>
          <Button variant="outline" className="btn-secondary"><Download className="w-4 h-4 mr-2" />Exportar</Button>
          <Button onClick={() => handleOpenModal()} className="btn-primary"><Plus className="w-4 h-4 mr-2" />Novo Cliente</Button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="glass-effect rounded-2xl p-1">
        <div className="flex space-x-1">
          {tabs.map((tab) => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${ activeTab === tab.id ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'}`}>{tab.label}</button>))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {clientMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (<motion.div key={metric.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 + 0.2 }} className="metric-card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-600 mb-2">{metric.title}</p>
                <p className="text-2xl font-bold text-slate-900 mb-1">{metric.value}</p>
                <div className="flex items-center gap-1 text-sm text-green-600"><span className="font-medium">{metric.change}</span></div>
              </div>
              <div className={`w-12 h-12 bg-gradient-to-r ${metric.color} rounded-xl flex items-center justify-center`}><Icon className="w-6 h-6 text-white" /></div>
            </div>
          </motion.div>);
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} className="chart-container">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Crescimento de Clientes</h3>
            <ResponsiveContainer width="100%" height={200}>
                <RechartsBarChart data={clientGrowthData}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip wrapperClassName="!bg-white/80 !backdrop-blur-sm !border-slate-200 !rounded-xl !shadow-lg" />
                    <Legend />
                    <Bar dataKey="clientes" fill="url(#clientsGradient)" radius={[4, 4, 0, 0]} />
                </RechartsBarChart>
            </ResponsiveContainer>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }} className="chart-container flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-slate-900">Segmentação por Região</h3>
              <p className="text-slate-600">Mapa de segmentação será exibido aqui</p>
            </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="glass-effect rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h3 className="text-lg font-semibold text-slate-900">Lista de Clientes</h3>
          <div className="flex items-center gap-3">
            <div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="text" placeholder="Buscar clientes..." className="input-field pl-10 w-64" /></div>
            <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-2" />Filtrar</Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-medium text-slate-600">Cliente</th><th className="text-left py-3 px-4 font-medium text-slate-600">Contato</th><th className="text-left py-3 px-4 font-medium text-slate-600">Localização</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Total Compras</th><th className="text-left py-3 px-4 font-medium text-slate-600">Última Compra</th><th className="text-left py-3 px-4 font-medium text-slate-600">Tipo</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Status</th><th className="text-left py-3 px-4 font-medium text-slate-600">Ações</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (<tr key={client.id} className="table-row">
                <td className="py-3 px-4"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center"><span className="text-white font-semibold text-sm">{client.name.split(' ').map(n => n[0]).join('')}</span></div><div><p className="font-medium text-slate-900">{client.name}</p></div></div></td>
                <td className="py-3 px-4"><div className="space-y-1"><div className="flex items-center gap-2 text-sm text-slate-600"><Mail className="w-3 h-3" /><span>{client.email}</span></div><div className="flex items-center gap-2 text-sm text-slate-600"><Phone className="w-3 h-3" /><span>{client.phone}</span></div></div></td>
                <td className="py-3 px-4"><div className="flex items-center gap-2 text-slate-700"><MapPin className="w-4 h-4" /><span>{client.city}</span></div></td>
                <td className="py-3 px-4 font-semibold text-green-600">{client.totalPurchases}</td><td className="py-3 px-4 text-slate-600">{client.lastPurchase}</td>
                <td className="py-3 px-4"><span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeClass(client.type)}`}>{client.type}</span></td>
                <td className="py-3 px-4"><span className={`status-badge ${getStatusClass(client.status)}`}>{client.status}</span></td>
                <td className="py-3 px-4"><div className="flex items-center gap-2"><Button variant="ghost" size="sm" onClick={() => handleOpenModal(client)}><Eye className="w-4 h-4" /></Button><Button variant="ghost" size="sm" onClick={() => handleOpenModal(client)}><Edit className="w-4 h-4" /></Button><Button variant="ghost" size="sm" onClick={() => handleDelete(client.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button></div></td>
              </tr>))}
            </tbody>
          </table>
        </div>
      </motion.div>
      {isModalOpen && <ClientModal client={editingClient} onSave={handleSaveClient} onClose={() => setIsModalOpen(false)} />}
      <svg>
        <defs>
          <linearGradient id="clientsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.8}/>
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

const ClientModal = ({ client, onSave, onClose }) => {
  const [name, setName] = useState(client?.name || '');
  const [email, setEmail] = useState(client?.email || '');
  const [phone, setPhone] = useState(client?.phone || '');
  const [city, setCity] = useState(client?.city || '');
  const [status, setStatus] = useState(client?.status || 'Ativo');
  const [type, setType] = useState(client?.type || 'Regular');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ name, email, phone, city, status, type, totalPurchases: client?.totalPurchases || 'R$ 0,00', lastPurchase: client?.lastPurchase || new Date().toISOString().slice(0, 10) });
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="glass-effect rounded-2xl p-8 w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold gradient-text mb-6">{client ? 'Editar' : 'Novo'} Cliente</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-2">Nome</label><input type="text" value={name} onChange={e => setName(e.target.value)} className="input-field" required /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-2">Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" required /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-2">Telefone</label><input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-2">Cidade</label><input type="text" value={city} onChange={e => setCity(e.target.value)} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-2">Status</label><select value={status} onChange={e => setStatus(e.target.value)} className="input-field"><option>Ativo</option><option>Inativo</option></select></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-2">Tipo</label><select value={type} onChange={e => setType(e.target.value)} className="input-field"><option>Regular</option><option>Premium</option><option>VIP</option></select></div>
          </div>
          <div className="flex justify-end gap-4 pt-4"><Button type="button" onClick={onClose} variant="outline" className="btn-secondary">Cancelar</Button><Button type="submit" className="btn-primary">Salvar</Button></div>
        </form>
      </div>
    </div>
  );
};

export default Clientes;