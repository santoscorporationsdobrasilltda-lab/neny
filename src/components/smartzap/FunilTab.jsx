import React, { useEffect, useMemo } from 'react';
import { BarChart3, Users } from 'lucide-react';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';

const etapas = ['Novo', 'Qualificação', 'Proposta', 'Fechado', 'Pós-venda'];

const FunilTab = () => {
  const { user } = useAuth();
  const { data: clientes, loading, fetchAll } = useSupabaseCrud('smartzap_clientes');

  useEffect(() => {
    if (user) fetchAll(1, 1000);
  }, [user, fetchAll]);

  const funil = useMemo(() => {
    return etapas.map((etapa) => ({
      etapa,
      total: clientes.filter((c) => (c.estagio || 'Novo') === etapa).length,
      itens: clientes.filter((c) => (c.estagio || 'Novo') === etapa),
    }));
  }, [clientes]);

  const max = Math.max(...funil.map((f) => f.total), 1);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-600" />
          Funil de Conversão
        </h2>
        <p className="text-sm text-slate-500">Distribuição dos clientes por estágio.</p>
      </div>

      {loading ? (
        <div className="bg-white p-8 rounded-xl border shadow-sm text-center text-slate-500">
          Carregando funil...
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
          {funil.map((col) => (
            <div key={col.etapa} className="bg-white rounded-xl border shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold text-slate-800">{col.etapa}</div>
                <div className="text-sm bg-slate-100 text-slate-700 px-2 py-1 rounded-full">
                  {col.total}
                </div>
              </div>

              <div className="h-2 rounded bg-slate-100 mb-4 overflow-hidden">
                <div
                  className="h-full bg-indigo-500"
                  style={{ width: `${(col.total / max) * 100}%` }}
                />
              </div>

              <div className="space-y-2">
                {col.itens.length === 0 ? (
                  <div className="text-sm text-slate-400">Sem clientes nesta etapa.</div>
                ) : (
                  col.itens.map((cliente) => (
                    <div key={cliente.id} className="border rounded-lg p-3 bg-slate-50">
                      <div className="font-medium text-slate-800">{cliente.nome || 'Sem nome'}</div>
                      <div className="text-sm text-slate-500">{cliente.telefone || '-'}</div>
                      {cliente.tags && (
                        <div className="text-xs text-slate-400 mt-1">{cliente.tags}</div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FunilTab;