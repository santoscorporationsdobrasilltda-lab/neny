import React, { useMemo, useState } from 'react';
import { X, Clock3, ShieldCheck, ArrowRightLeft, CalendarRange, Scale, UtensilsCrossed, Hash, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('pt-BR');
};

const BovinoHistoricoModal = ({
  animal,
  historicoSanitario = [],
  movimentacoes = [],
  pesagens = [],
  alimentacoes = [],
  contagens = [],
  preGtas = [],
  onClose,
}) => {
  const [periodFilter, setPeriodFilter] = useState('todos');
  const [typeFilter, setTypeFilter] = useState('todos');

  const timeline = useMemo(() => {
    const unified = [
      ...historicoSanitario.map((item) => ({
        id: `san-${item.id}`,
        grupo: 'sanidade',
        tipo: 'Sanidade',
        data: item.data,
        titulo: item.tipo_evento || 'Evento sanitário',
        descricao: `${item.produto || '-'} • Dose: ${item.dose || '-'} • Resp.: ${item.responsavel || '-'}${item.observacoes ? ` • Obs.: ${item.observacoes}` : ''}`,
        proximaData: item.proxima_data || null,
        icone: 'sanidade',
      })),
      ...movimentacoes.map((item) => ({
        id: `mov-${item.id}`,
        grupo: 'movimentacao',
        tipo: 'Movimentação',
        data: item.data,
        titulo: item.tipo_movimentacao || 'Movimentação',
        descricao: `Origem: ${item.origem || '-'} • Destino: ${item.destino || '-'} • Motivo: ${item.motivo || '-'}${item.observacoes ? ` • Obs.: ${item.observacoes}` : ''}`,
        icone: 'movimentacao',
      })),
      ...pesagens.map((item) => ({
        id: `pes-${item.id}`,
        grupo: 'pesagem',
        tipo: 'Pesagem',
        data: item.data,
        titulo: `${item.peso ?? '-'} ${item.unidade || 'kg'}`,
        descricao: `Tipo: ${item.tipo_pesagem || '-'} • Ganho: ${item.ganho_peso ?? '-'} • Resp.: ${item.responsavel || '-'}${item.observacoes ? ` • Obs.: ${item.observacoes}` : ''}`,
        icone: 'pesagem',
      })),
      ...alimentacoes.map((item) => ({
        id: `ali-${item.id}`,
        grupo: 'alimentacao',
        tipo: 'Alimentação',
        data: item.data,
        titulo: item.tipo_alimentacao || 'Alimentação adicional',
        descricao: `Produto: ${item.produto || '-'} • Quantidade: ${item.quantidade ?? '-'} ${item.unidade || ''} • Frequência: ${item.frequencia || '-'}${item.observacoes ? ` • Obs.: ${item.observacoes}` : ''}`,
        icone: 'alimentacao',
      })),
      ...contagens.map((item) => ({
        id: `con-${item.id}`,
        grupo: 'contagem',
        tipo: 'Contagem',
        data: item.data,
        titulo: `${item.tipo_local || '-'} • ${item.quantidade ?? '-'} animal(is)`,
        descricao: `Local: ${item.local_nome || '-'} • Resp.: ${item.responsavel || '-'}${item.observacoes ? ` • Obs.: ${item.observacoes}` : ''}`,
        icone: 'contagem',
      })),
      ...preGtas.map((item) => ({
        id: `gta-${item.id}`,
        grupo: 'pre_gta',
        tipo: 'Pré-GTA',
        data: item.data_prevista,
        titulo: item.finalidade || 'Pré-registro de GTA',
        descricao: `Origem: ${item.origem || '-'} • Destino: ${item.destino || '-'} • Status: ${item.status || '-'}${item.observacoes ? ` • Obs.: ${item.observacoes}` : ''}`,
        icone: 'pre_gta',
      })),
    ];

    const now = new Date();
    const periodDays = periodFilter === '30' ? 30 : periodFilter === '90' ? 90 : null;

    return unified
      .filter((item) => {
        if (typeFilter !== 'todos' && item.grupo !== typeFilter) return false;
        if (!periodDays || !item.data) return true;
        const diff = (now - new Date(item.data)) / (1000 * 60 * 60 * 24);
        return diff <= periodDays;
      })
      .sort((a, b) => {
        const da = a.data ? new Date(a.data).getTime() : 0;
        const db = b.data ? new Date(b.data).getTime() : 0;
        return db - da;
      });
  }, [historicoSanitario, movimentacoes, pesagens, alimentacoes, contagens, preGtas, periodFilter, typeFilter]);

  const summary = useMemo(() => {
    const nextCare = historicoSanitario
      .filter((item) => item.proxima_data)
      .sort((a, b) => new Date(a.proxima_data) - new Date(b.proxima_data))[0];

    const currentLocation = movimentacoes
      .filter((item) => item.destino)
      .sort((a, b) => new Date(b.data || 0) - new Date(a.data || 0))[0];

    return {
      eventosSanitarios: historicoSanitario.length,
      movimentacoes: movimentacoes.length,
      pesagens: pesagens.length,
      alimentacoes: alimentacoes.length,
      proximoCuidado: nextCare?.proxima_data || null,
      localAtual: currentLocation?.destino || animal?.fazenda || animal?.lote || '-',
    };
  }, [historicoSanitario, movimentacoes, pesagens, alimentacoes, animal]);

  const renderIcon = (type) => {
    switch (type) {
      case 'sanidade':
        return <ShieldCheck className="w-5 h-5 text-emerald-600" />;
      case 'movimentacao':
        return <ArrowRightLeft className="w-5 h-5 text-blue-600" />;
      case 'pesagem':
        return <Scale className="w-5 h-5 text-violet-600" />;
      case 'alimentacao':
        return <UtensilsCrossed className="w-5 h-5 text-amber-600" />;
      case 'contagem':
        return <Hash className="w-5 h-5 text-slate-600" />;
      case 'pre_gta':
        return <Truck className="w-5 h-5 text-indigo-600" />;
      default:
        return <Clock3 className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[92vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Rastreabilidade do Animal</h3>
            <p className="text-sm text-slate-500">
              {animal?.nome || '-'} • Brinco {animal?.brinco || '-'}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(92vh-80px)] space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 border">
              <div className="text-sm text-slate-500">Categoria</div>
              <div className="font-semibold text-slate-800">{animal?.categoria || '-'}</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border">
              <div className="text-sm text-slate-500">Lote</div>
              <div className="font-semibold text-slate-800">{animal?.lote || '-'}</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border">
              <div className="text-sm text-slate-500">Status</div>
              <div className="font-semibold text-slate-800">{animal?.status || '-'}</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border">
              <div className="text-sm text-slate-500">Raça</div>
              <div className="font-semibold text-slate-800">{animal?.raca || '-'}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
              <div className="text-sm text-emerald-700">Eventos sanitários</div>
              <div className="text-2xl font-bold text-emerald-800">{summary.eventosSanitarios}</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <div className="text-sm text-blue-700">Movimentações</div>
              <div className="text-2xl font-bold text-blue-800">{summary.movimentacoes}</div>
            </div>
            <div className="bg-violet-50 rounded-xl p-4 border border-violet-100">
              <div className="text-sm text-violet-700">Pesagens</div>
              <div className="text-2xl font-bold text-violet-800">{summary.pesagens}</div>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
              <div className="text-sm text-amber-700">Alimentações</div>
              <div className="text-2xl font-bold text-amber-800">{summary.alimentacoes}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 border">
              <div className="text-sm text-slate-500">Próximo cuidado</div>
              <div className="font-semibold text-slate-800">{formatDate(summary.proximoCuidado)}</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border">
              <div className="text-sm text-slate-500">Local atual</div>
              <div className="font-semibold text-slate-800">{summary.localAtual}</div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <h4 className="text-lg font-bold text-slate-800">Linha do tempo consolidada</h4>
            <div className="flex flex-col md:flex-row gap-3">
              <select className="p-2 border rounded-lg" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="todos">Todos os tipos</option>
                <option value="sanidade">Somente sanidade</option>
                <option value="movimentacao">Somente movimentações</option>
                <option value="pesagem">Somente pesagens</option>
                <option value="alimentacao">Somente alimentação</option>
                <option value="contagem">Somente contagens</option>
                <option value="pre_gta">Somente pré-GTA</option>
              </select>
              <select className="p-2 border rounded-lg" value={periodFilter} onChange={(e) => setPeriodFilter(e.target.value)}>
                <option value="todos">Todo o período</option>
                <option value="30">Últimos 30 dias</option>
                <option value="90">Últimos 90 dias</option>
              </select>
            </div>
          </div>

          {timeline.length === 0 ? (
            <div className="border rounded-xl p-6 text-center text-slate-500">
              Nenhum histórico disponível para este animal.
            </div>
          ) : (
            <div className="space-y-3">
              {timeline.map((item) => (
                <div key={item.id} className="border rounded-xl p-4 bg-white">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">{renderIcon(item.icone)}</div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                            {item.tipo}
                          </span>
                          <span className="font-semibold text-slate-800">{item.titulo}</span>
                        </div>
                        <div className="text-sm text-slate-600 mt-2 whitespace-pre-wrap">{item.descricao}</div>
                        {item.proximaData && (
                          <div className="text-xs text-amber-700 mt-2 flex items-center gap-1">
                            <CalendarRange className="w-3 h-3" />
                            Próxima data: {formatDate(item.proximaData)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-slate-500 flex items-center gap-1 whitespace-nowrap">
                      <Clock3 className="w-3 h-3" />
                      {formatDate(item.data)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BovinoHistoricoModal;
