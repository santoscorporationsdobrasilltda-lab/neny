import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  QrCode,
  AlertCircle,
  ArrowRight,
  Copy,
  Loader2,
  Beef,
  Stethoscope,
  ArrowRightLeft,
  Scale,
  UtensilsCrossed,
  Hash,
  Truck,
  CalendarDays,
  MapPin,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/customSupabaseClient';

const decodePayload = (encoded) => {
  if (!encoded) return null;

  try {
    const normalized = decodeURIComponent(encoded);
    const json = decodeURIComponent(escape(window.atob(normalized)));
    return JSON.parse(json);
  } catch {
    try {
      return JSON.parse(decodeURIComponent(encoded));
    } catch {
      try {
        return JSON.parse(encoded);
      } catch {
        return null;
      }
    }
  }
};

const buildPrettyJson = (data) => {
  try {
    return JSON.stringify(data, null, 2);
  } catch {
    return '{}';
  }
};

const formatDate = (value) => {
  if (!value) return '-';
  try {
    return new Date(`${value}`).toLocaleDateString('pt-BR');
  } catch {
    return `${value}`;
  }
};

const normalizeArray = (value) => (Array.isArray(value) ? value : []);

const emptyBundle = {
  bovino: null,
  sanidade: [],
  movimentacoes: [],
  pesagens: [],
  alimentacoes: [],
  contagens: [],
  pre_gta: [],
};

const StatCard = ({ label, value, icon: Icon }) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
    <div className="flex items-center gap-2 text-sm text-slate-500">
      {Icon ? <Icon className="w-4 h-4" /> : null}
      <span>{label}</span>
    </div>
    <div className="text-lg font-semibold text-slate-800 mt-1 break-words">{value || '-'}</div>
  </div>
);

const FieldItem = ({ label, value }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4">
    <div className="text-sm text-slate-500">{label}</div>
    <div className="text-base font-medium text-slate-800 mt-1 break-words">{value || '-'}</div>
  </div>
);

const RecordsTable = ({ title, subtitle, icon: Icon, columns, rows, emptyText }) => (
  <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
    <div className="p-5 border-b bg-slate-50 flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
        {Icon ? <Icon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
      </div>
      <div>
        <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>
    </div>

    {rows.length ? (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="text-left font-medium px-4 py-3 whitespace-nowrap">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id || `${title}-${index}`} className="border-t border-slate-200 align-top">
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3 text-slate-700 whitespace-pre-wrap">
                    {row[column.key] || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <div className="p-5 text-sm text-slate-500">{emptyText}</div>
    )}
  </section>
);

const BovinoQrPublicPage = () => {
  const location = useLocation();
  const [bundle, setBundle] = useState(emptyBundle);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const payload = useMemo(() => decodePayload(params.get('payload')), [params]);

  const bovinoId = useMemo(() => params.get('id') || payload?.id || null, [params, payload]);

  useEffect(() => {
    let active = true;

    const fetchPublicBundle = async () => {
      if (!bovinoId) {
        setBundle(emptyBundle);
        setFetchError('');
        return;
      }

      setLoading(true);
      setFetchError('');

      try {
        const { data, error } = await supabase.rpc('public_get_bovino_qr_bundle', {
          p_bovino_id: bovinoId,
        });

        if (error) throw error;
        if (!active) return;

        setBundle({
          bovino: data?.bovino || null,
          sanidade: normalizeArray(data?.sanidade),
          movimentacoes: normalizeArray(data?.movimentacoes),
          pesagens: normalizeArray(data?.pesagens),
          alimentacoes: normalizeArray(data?.alimentacoes),
          contagens: normalizeArray(data?.contagens),
          pre_gta: normalizeArray(data?.pre_gta),
        });
      } catch (error) {
        if (!active) return;
        setFetchError(error?.message || 'Não foi possível carregar o conteúdo completo do animal.');
        setBundle(emptyBundle);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchPublicBundle();

    return () => {
      active = false;
    };
  }, [bovinoId]);

  const bovino = useMemo(() => {
    const dbAnimal = bundle.bovino;

    if (dbAnimal) {
      return {
        ...dbAnimal,
        nome: dbAnimal.nome || payload?.nome,
        brinco: dbAnimal.brinco || payload?.brinco,
      };
    }

    if (payload) {
      return {
        id: payload.id || '-',
        nome: payload.nome || '-',
        brinco: payload.brinco || '-',
        categoria: payload.categoria || '-',
        raca: payload.raca || '-',
        data_nascimento: payload.data_nascimento || payload.nascimento || null,
        origem: payload.origem || '-',
        lote: payload.lote || '-',
        fazenda: payload.fazenda || '-',
        status: payload.status || '-',
        observacoes: payload.observacoes || '-',
      };
    }

    return null;
  }, [bundle.bovino, payload]);

  const publicData = useMemo(() => ({
    bovino,
    sanidade: bundle.sanidade,
    movimentacoes: bundle.movimentacoes,
    pesagens: bundle.pesagens,
    alimentacoes: bundle.alimentacoes,
    contagens: bundle.contagens,
    pre_gta: bundle.pre_gta,
  }), [bovino, bundle]);

  const prettyJson = useMemo(() => buildPrettyJson(publicData), [publicData]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prettyJson);
    } catch {
      // noop
    }
  };

  const sanidadeRows = useMemo(
    () => bundle.sanidade.map((item) => ({
      id: item.id,
      data: formatDate(item.data),
      tipo_evento: item.tipo_evento || '-',
      produto: item.produto || '-',
      dose: item.dose || '-',
      responsavel: item.responsavel || '-',
      proxima_data: formatDate(item.proxima_data),
      observacoes: item.observacoes || '-',
    })),
    [bundle.sanidade]
  );

  const movimentacaoRows = useMemo(
    () => bundle.movimentacoes.map((item) => ({
      id: item.id,
      data: formatDate(item.data),
      tipo_movimentacao: item.tipo_movimentacao || '-',
      origem: item.origem || '-',
      destino: item.destino || '-',
      motivo: item.motivo || '-',
      observacoes: item.observacoes || '-',
    })),
    [bundle.movimentacoes]
  );

  const pesagemRows = useMemo(
    () => bundle.pesagens.map((item) => ({
      id: item.id,
      data: formatDate(item.data),
      peso: item.peso != null ? `${item.peso} ${item.unidade || 'kg'}` : '-',
      tipo_pesagem: item.tipo_pesagem || '-',
      ganho_peso: item.ganho_peso != null ? item.ganho_peso : '-',
      responsavel: item.responsavel || '-',
      observacoes: item.observacoes || '-',
    })),
    [bundle.pesagens]
  );

  const alimentacaoRows = useMemo(
    () => bundle.alimentacoes.map((item) => ({
      id: item.id,
      data: formatDate(item.data),
      tipo_alimentacao: item.tipo_alimentacao || '-',
      produto: item.produto || '-',
      quantidade: item.quantidade != null ? `${item.quantidade} ${item.unidade || 'kg'}` : '-',
      frequencia: item.frequencia || '-',
      periodo: item.periodo || '-',
      responsavel: item.responsavel || '-',
      observacoes: item.observacoes || '-',
    })),
    [bundle.alimentacoes]
  );

  const contagemRows = useMemo(
    () => bundle.contagens.map((item) => ({
      id: item.id,
      data: formatDate(item.data),
      tipo_local: item.tipo_local || '-',
      local_nome: item.local_nome || '-',
      quantidade: item.quantidade != null ? item.quantidade : '-',
      responsavel: item.responsavel || '-',
      observacoes: item.observacoes || '-',
    })),
    [bundle.contagens]
  );

  const preGtaRows = useMemo(
    () => bundle.pre_gta.map((item) => ({
      id: item.id,
      data_prevista: formatDate(item.data_prevista),
      finalidade: item.finalidade || '-',
      origem: item.origem || '-',
      destino: item.destino || '-',
      quantidade_animais: item.quantidade_animais != null ? item.quantidade_animais : '-',
      transportador: item.transportador || '-',
      motorista: item.motorista || '-',
      placa_veiculo: item.placa_veiculo || '-',
      status: item.status || '-',
      observacoes: item.observacoes || '-',
    })),
    [bundle.pre_gta]
  );

  if (!bovino && !payload && !loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center space-y-4">
          <div className="mx-auto w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
            <AlertCircle className="w-7 h-7 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">QR inválido ou vazio</h1>
            <p className="text-slate-500 mt-2">Não foi possível ler o conteúdo deste QR Code.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-sm font-medium">
                <QrCode className="w-4 h-4" /> Consulta pública do brinco
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Ficha pública do animal</h1>
              <p className="text-slate-500">
                Identificação digital e histórico público do animal lido pelo QR Code.
              </p>
            </div>
            {payload?.rota ? (
              <Button asChild className="bg-[#3b82f6] hover:bg-[#2563eb] text-white">
                <Link to={payload.rota}>
                  Abrir ficha no sistema <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            ) : null}
          </div>

          {loading ? (
            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-8 flex items-center justify-center gap-3 text-slate-600">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Carregando ficha pública do animal...</span>
            </div>
          ) : null}

          {fetchError ? (
            <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800 text-sm">
              {fetchError}
              {payload ? ' Exibindo as informações disponíveis no QR.' : ''}
            </div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-8">
            <StatCard label="Nome" value={bovino?.nome || '-'} icon={Beef} />
            <StatCard label="Brinco" value={bovino?.brinco || '-'} icon={QrCode} />
            <StatCard label="Categoria" value={bovino?.categoria || '-'} icon={Hash} />
            <StatCard label="Status" value={bovino?.status || '-'} icon={CalendarDays} />
          </div>
        </div>

        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b bg-slate-50 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
              <Beef className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Dados do animal</h2>
              <p className="text-sm text-slate-500">Informações principais do cadastro do bovino.</p>
            </div>
          </div>

          <div className="p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <FieldItem label="ID" value={bovino?.id} />
            <FieldItem label="Raça" value={bovino?.raca} />
            <FieldItem label="Nascimento" value={formatDate(bovino?.data_nascimento || bovino?.nascimento)} />
            <FieldItem label="Origem" value={bovino?.origem} />
            <FieldItem label="Lote" value={bovino?.lote} />
            <FieldItem label="Fazenda" value={bovino?.fazenda} />
            <FieldItem label="Criado em" value={formatDate(bovino?.created_at)} />
            <FieldItem label="Atualizado em" value={formatDate(bovino?.updated_at)} />
            <FieldItem label="Observações" value={bovino?.observacoes} />
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard label="Sanidade" value={`${bundle.sanidade.length} registro(s)`} icon={Stethoscope} />
          <StatCard label="Movimentações" value={`${bundle.movimentacoes.length} registro(s)`} icon={ArrowRightLeft} />
          <StatCard label="Pesagens" value={`${bundle.pesagens.length} registro(s)`} icon={Scale} />
          <StatCard label="Alimentação" value={`${bundle.alimentacoes.length} registro(s)`} icon={UtensilsCrossed} />
          <StatCard label="Contagens" value={`${bundle.contagens.length} registro(s)`} icon={MapPin} />
          <StatCard label="Pré-GTA" value={`${bundle.pre_gta.length} registro(s)`} icon={Truck} />
        </div>

        <RecordsTable
          title="Histórico sanitário"
          subtitle="Vacinas, medicamentos e eventos sanitários registrados para este animal."
          icon={Stethoscope}
          columns={[
            { key: 'data', label: 'Data' },
            { key: 'tipo_evento', label: 'Evento' },
            { key: 'produto', label: 'Produto' },
            { key: 'dose', label: 'Dose' },
            { key: 'responsavel', label: 'Responsável' },
            { key: 'proxima_data', label: 'Próxima data' },
            { key: 'observacoes', label: 'Observações' },
          ]}
          rows={sanidadeRows}
          emptyText="Ainda não há registros sanitários públicos para este animal."
        />

        <RecordsTable
          title="Histórico de movimentação"
          subtitle="Entradas, transferências, vendas, descartes e outros movimentos do animal."
          icon={ArrowRightLeft}
          columns={[
            { key: 'data', label: 'Data' },
            { key: 'tipo_movimentacao', label: 'Tipo' },
            { key: 'origem', label: 'Origem' },
            { key: 'destino', label: 'Destino' },
            { key: 'motivo', label: 'Motivo' },
            { key: 'observacoes', label: 'Observações' },
          ]}
          rows={movimentacaoRows}
          emptyText="Ainda não há movimentações públicas para este animal."
        />

        <RecordsTable
          title="Registro de pesagem"
          subtitle="Pesagens lançadas para acompanhamento do desenvolvimento do animal."
          icon={Scale}
          columns={[
            { key: 'data', label: 'Data' },
            { key: 'peso', label: 'Peso' },
            { key: 'tipo_pesagem', label: 'Tipo de pesagem' },
            { key: 'ganho_peso', label: 'Ganho de peso' },
            { key: 'responsavel', label: 'Responsável' },
            { key: 'observacoes', label: 'Observações' },
          ]}
          rows={pesagemRows}
          emptyText="Ainda não há pesagens públicas para este animal."
        />

        <RecordsTable
          title="Alimentação adicional"
          subtitle="Informações de suplementação e alimentação complementar do animal."
          icon={UtensilsCrossed}
          columns={[
            { key: 'data', label: 'Data' },
            { key: 'tipo_alimentacao', label: 'Tipo' },
            { key: 'produto', label: 'Produto' },
            { key: 'quantidade', label: 'Quantidade' },
            { key: 'frequencia', label: 'Frequência' },
            { key: 'periodo', label: 'Período' },
            { key: 'responsavel', label: 'Responsável' },
            { key: 'observacoes', label: 'Observações' },
          ]}
          rows={alimentacaoRows}
          emptyText="Ainda não há registros públicos de alimentação adicional para este animal."
        />

        <RecordsTable
          title="Contagem em curral ou pasto"
          subtitle="Registros de contagem e conferência em curral ou pasto."
          icon={MapPin}
          columns={[
            { key: 'data', label: 'Data' },
            { key: 'tipo_local', label: 'Tipo de local' },
            { key: 'local_nome', label: 'Local' },
            { key: 'quantidade', label: 'Quantidade' },
            { key: 'responsavel', label: 'Responsável' },
            { key: 'observacoes', label: 'Observações' },
          ]}
          rows={contagemRows}
          emptyText="Ainda não há registros públicos de contagem para este animal."
        />

        <RecordsTable
          title="Pré-registro de GTA"
          subtitle="Informações públicas de preparação para transporte do animal."
          icon={Truck}
          columns={[
            { key: 'data_prevista', label: 'Data prevista' },
            { key: 'finalidade', label: 'Finalidade' },
            { key: 'origem', label: 'Origem' },
            { key: 'destino', label: 'Destino' },
            { key: 'quantidade_animais', label: 'Qtd. animais' },
            { key: 'transportador', label: 'Transportador' },
            { key: 'motorista', label: 'Motorista' },
            { key: 'placa_veiculo', label: 'Placa' },
            { key: 'status', label: 'Status' },
            { key: 'observacoes', label: 'Observações' },
          ]}
          rows={preGtaRows}
          emptyText="Ainda não há pré-registros públicos de GTA para este animal."
        />

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <details>
            <summary className="cursor-pointer list-none flex items-center justify-between gap-3 p-5 bg-slate-50 border-b">
              <div>
                <h2 className="font-semibold text-slate-800">JSON técnico da ficha pública</h2>
                <p className="text-sm text-slate-500">Conteúdo estruturado usado para a visualização desta página.</p>
              </div>
              <Button type="button" variant="outline" onClick={(e) => { e.preventDefault(); handleCopy(); }}>
                <Copy className="w-4 h-4 mr-2" /> Copiar JSON
              </Button>
            </summary>
            <pre className="p-4 md:p-6 text-sm text-slate-800 overflow-x-auto bg-white">{prettyJson}</pre>
          </details>
        </div>
      </div>
    </div>
  );
};

export default BovinoQrPublicPage;
