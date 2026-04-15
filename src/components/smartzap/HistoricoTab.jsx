import React, { useEffect, useMemo, useState } from 'react';
import { Search, Filter, Clock3, MessageSquare, Bot, User, Phone } from 'lucide-react';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';

const HistoricoTab = () => {
  const { user } = useAuth();

  const {
    data: mensagens,
    loading,
    fetchAll,
  } = useSupabaseCrud('smartzap_mensagens');

  const [searchTerm, setSearchTerm] = useState('');
  const [senderFilter, setSenderFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todos');

  useEffect(() => {
    if (user) {
      fetchAll(1, 3000);
    }
  }, [user, fetchAll]);

  const filteredMessages = useMemo(() => {
    return [...mensagens]
      .filter((msg) => {
        const term = searchTerm.toLowerCase().trim();

        const matchesSearch =
          (msg.telefone || '').toLowerCase().includes(term) ||
          (msg.conteudo || '').toLowerCase().includes(term) ||
          (msg.remetente || '').toLowerCase().includes(term);

        const matchesSender =
          senderFilter === 'todos' ? true : msg.remetente === senderFilter;

        const matchesStatus =
          statusFilter === 'todos' ? true : msg.status === statusFilter;

        return matchesSearch && matchesSender && matchesStatus;
      })
      .sort((a, b) => {
        const da = a.created_at ? new Date(a.created_at).getTime() : 0;
        const db = b.created_at ? new Date(b.created_at).getTime() : 0;
        return db - da;
      });
  }, [mensagens, searchTerm, senderFilter, statusFilter]);

  const summary = useMemo(() => {
    return {
      total: mensagens.length,
      cliente: mensagens.filter((m) => m.remetente === 'cliente').length,
      agente: mensagens.filter((m) => m.remetente === 'agente').length,
      bot: mensagens.filter((m) => m.remetente === 'bot').length,
    };
  }, [mensagens]);

  const getSenderIcon = (sender) => {
    if (sender === 'cliente') return <Phone className="w-4 h-4 text-green-600" />;
    if (sender === 'bot') return <Bot className="w-4 h-4 text-purple-600" />;
    return <User className="w-4 h-4 text-blue-600" />;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border shadow-sm">
          <div className="text-sm text-slate-500">Total</div>
          <div className="text-2xl font-bold text-slate-800">{summary.total}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border shadow-sm">
          <div className="text-sm text-slate-500">Cliente</div>
          <div className="text-2xl font-bold text-green-700">{summary.cliente}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border shadow-sm">
          <div className="text-sm text-slate-500">Agente</div>
          <div className="text-2xl font-bold text-blue-700">{summary.agente}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border shadow-sm">
          <div className="text-sm text-slate-500">Bot</div>
          <div className="text-2xl font-bold text-purple-700">{summary.bot}</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800">Histórico de Mensagens</h2>

          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                className="pl-10 pr-3 py-2 border rounded-lg w-full md:w-72"
                placeholder="Buscar telefone, conteúdo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="border rounded-lg px-3 py-2"
              value={senderFilter}
              onChange={(e) => setSenderFilter(e.target.value)}
            >
              <option value="todos">Todos remetentes</option>
              <option value="cliente">Cliente</option>
              <option value="agente">Agente</option>
              <option value="bot">Bot</option>
            </select>

            <select
              className="border rounded-lg px-3 py-2"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="todos">Todos status</option>
              <option value="recebido">Recebido</option>
              <option value="pendente">Pendente</option>
              <option value="enviado">Enviado</option>
              <option value="erro">Erro</option>
              <option value="enviando">Enviando</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10 text-slate-500">Carregando histórico...</div>
        ) : filteredMessages.length === 0 ? (
          <div className="text-center py-10 text-slate-500">Nenhuma mensagem encontrada.</div>
        ) : (
          <div className="space-y-3">
            {filteredMessages.map((msg) => (
              <div
                key={msg.id}
                className="border rounded-xl p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{getSenderIcon(msg.remetente)}</div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-800">
                          {String(msg.remetente || '').toUpperCase()}
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                          {msg.tipo || 'texto'}
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                          {msg.status || 'pendente'}
                        </span>
                      </div>

                      <div className="text-sm text-slate-500 mt-1">
                        {msg.telefone || 'Sem telefone'}
                      </div>

                      <div className="text-sm text-slate-700 mt-2 whitespace-pre-wrap">
                        {msg.conteudo || '[sem conteúdo]'}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 flex items-center gap-1 whitespace-nowrap">
                    <Clock3 className="w-3 h-3" />
                    {msg.created_at
                      ? new Date(msg.created_at).toLocaleString('pt-BR')
                      : '-'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoricoTab;