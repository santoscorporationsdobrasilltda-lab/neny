import React, { useEffect, useMemo, useState } from 'react';
import { Search, Clock3, User, Building2, ClipboardList } from 'lucide-react';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleString('pt-BR');
};

const HistoricoTab = () => {
  const { user } = useAuth();

  const { data: atendimentos, loading: loadingAtendimentos, fetchAll: fetchAtendimentos } = useSupabaseCrud('sac_crm_atendimentos');
  const { data: followups, loading: loadingFollowups, fetchAll: fetchFollowups } = useSupabaseCrud('sac_crm_followups');
  const { data: clientes, fetchAll: fetchClientes } = useSupabaseCrud('sac_crm_clientes');
  const { data: fornecedores, fetchAll: fetchFornecedores } = useSupabaseCrud('sac_crm_fornecedores');

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      fetchAtendimentos(1, 2000);
      fetchFollowups(1, 2000);
      fetchClientes(1, 1000);
      fetchFornecedores(1, 1000);
    }
  }, [user, fetchAtendimentos, fetchFollowups, fetchClientes, fetchFornecedores]);

  const getClienteNome = (id) => clientes.find((c) => c.id === id)?.nome || 'Cliente';
  const getFornecedorNome = (id) => fornecedores.find((f) => f.id === id)?.nome || 'Fornecedor';

  const timeline = useMemo(() => {
    const eventosAtendimento = atendimentos.map((item) => ({
      id: `at-${item.id}`,
      tipo: 'Atendimento',
      titulo: item.assunto || 'Atendimento',
      descricao: item.descricao || item.observacoes || '',
      responsavel: item.responsavel || '',
      status: item.status || '',
      data: item.created_at || item.data_inicio || null,
      referencia:
        item.cliente_id
          ? getClienteNome(item.cliente_id)
          : item.fornecedor_id
            ? getFornecedorNome(item.fornecedor_id)
            : '-',
    }));

    const eventosFollowup = followups.map((item) => ({
      id: `fu-${item.id}`,
      tipo: 'Follow-up',
      titulo: item.tipo_acao || 'Follow-up',
      descricao: item.descricao || '',
      responsavel: item.responsavel || '',
      status: item.status || '',
      data: item.created_at || item.data_prevista || null,
      referencia:
        item.cliente_id
          ? getClienteNome(item.cliente_id)
          : item.fornecedor_id
            ? getFornecedorNome(item.fornecedor_id)
            : '-',
    }));

    return [...eventosAtendimento, ...eventosFollowup]
      .filter((item) => {
        const term = searchTerm.toLowerCase().trim();
        return (
          (item.tipo || '').toLowerCase().includes(term) ||
          (item.titulo || '').toLowerCase().includes(term) ||
          (item.descricao || '').toLowerCase().includes(term) ||
          (item.referencia || '').toLowerCase().includes(term) ||
          (item.status || '').toLowerCase().includes(term) ||
          (item.responsavel || '').toLowerCase().includes(term)
        );
      })
      .sort((a, b) => {
        const da = a.data ? new Date(a.data).getTime() : 0;
        const db = b.data ? new Date(b.data).getTime() : 0;
        return db - da;
      });
  }, [atendimentos, followups, clientes, fornecedores, searchTerm]);

  const loading = loadingAtendimentos || loadingFollowups;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Histórico SAC/CRM</h2>
        <p className="text-sm text-slate-500">Linha do tempo de atendimentos e follow-ups.</p>
      </div>

      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          className="w-full pl-10 pr-3 py-2 border rounded-lg"
          placeholder="Buscar histórico..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-6">
        {loading ? (
          <div className="text-center text-slate-500 py-8">Carregando histórico...</div>
        ) : timeline.length === 0 ? (
          <div className="text-center text-slate-500 py-8">Nenhum evento encontrado.</div>
        ) : (
          <div className="space-y-4">
            {timeline.map((item) => (
              <div key={item.id} className="border rounded-xl p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700 text-xs">
                        {item.tipo}
                      </span>
                      <span className="font-semibold text-slate-800">{item.titulo}</span>
                    </div>

                    <div className="text-sm text-slate-500 flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      {item.referencia}
                    </div>

                    {item.responsavel && (
                      <div className="text-sm text-slate-500 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {item.responsavel}
                      </div>
                    )}

                    {item.descricao && (
                      <div className="text-sm text-slate-700 whitespace-pre-wrap">
                        {item.descricao}
                      </div>
                    )}
                  </div>

                  <div className="text-right space-y-2">
                    <div className="text-xs text-slate-500 flex items-center gap-1 justify-end">
                      <Clock3 className="w-3 h-3" />
                      {formatDate(item.data)}
                    </div>

                    {item.status && (
                      <div className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600 inline-block">
                        {item.status}
                      </div>
                    )}
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