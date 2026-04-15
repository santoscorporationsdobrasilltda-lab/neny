import React, { useEffect, useMemo } from 'react';
import {
    MessageCircle,
    Send,
    AlertTriangle,
    FileText,
    Bot,
    Clock3,
} from 'lucide-react';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';

const StatCard = ({ icon, title, value, subtitle }) => (
    <div className="bg-white p-5 rounded-xl border shadow-sm">
        <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">{title}</span>
            {icon}
        </div>
        <div className="text-2xl font-bold text-slate-800">{value}</div>
        {subtitle ? <div className="text-xs text-slate-500 mt-1">{subtitle}</div> : null}
    </div>
);

const SmartZapDashboard = () => {
    const { user } = useAuth();

    const {
        data: conversas,
        fetchAll: fetchConversas,
        loading: loadingConversas,
    } = useSupabaseCrud('smartzap_conversas');

    const {
        data: mensagens,
        fetchAll: fetchMensagens,
        loading: loadingMensagens,
    } = useSupabaseCrud('smartzap_mensagens');

    const {
        data: logs,
        fetchAll: fetchLogs,
        loading: loadingLogs,
    } = useSupabaseCrud('smartzap_logs');

    const {
        data: templates,
        fetchAll: fetchTemplates,
        loading: loadingTemplates,
    } = useSupabaseCrud('smartzap_templates');

    useEffect(() => {
        if (user) {
            fetchConversas(1, 1000);
            fetchMensagens(1, 3000);
            fetchLogs(1, 1000);
            fetchTemplates(1, 1000);
        }
    }, [user, fetchConversas, fetchMensagens, fetchLogs, fetchTemplates]);

    const metrics = useMemo(() => {
        const conversasAtivas = conversas.filter(
            (c) => String(c.status || '').toLowerCase() === 'ativo'
        ).length;

        const mensagensEnviadas = mensagens.filter(
            (m) => m.remetente === 'agente' && m.status === 'enviado'
        ).length;

        const mensagensErro = mensagens.filter((m) => m.status === 'erro').length;

        const logsErro = logs.filter((l) =>
            String(l.tipo || l.level || '').toLowerCase().includes('erro')
        ).length;

        const templatesAprovados = templates.filter(
            (t) => String(t.status || '').toLowerCase() === 'aprovado'
        ).length;

        const mensagensBot = mensagens.filter((m) => m.remetente === 'bot').length;

        return {
            conversasAtivas,
            mensagensEnviadas,
            mensagensErro,
            logsErro,
            templatesAprovados,
            mensagensBot,
        };
    }, [conversas, mensagens, logs, templates]);

    const recentConversations = useMemo(() => {
        return [...conversas]
            .sort((a, b) => {
                const da = (a.ultimo_contato || a.updated_at || a.created_at) ? new Date(a.ultimo_contato || a.updated_at || a.created_at).getTime() : 0;
                const db = (b.ultimo_contato || b.updated_at || b.created_at) ? new Date(b.ultimo_contato || b.updated_at || b.created_at).getTime() : 0;
                return db - da;
            })
            .slice(0, 5);
    }, [conversas]);

    const recentLogs = useMemo(() => {
        return [...logs]
            .sort((a, b) => {
                const da = (a.created_at || a.timestamp) ? new Date(a.created_at || a.timestamp).getTime() : 0;
                const db = (b.created_at || b.timestamp) ? new Date(b.created_at || b.timestamp).getTime() : 0;
                return db - da;
            })
            .slice(0, 5);
    }, [logs]);

    const loading =
        loadingConversas || loadingMensagens || loadingLogs || loadingTemplates;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Dashboard SmartZap</h1>
                <p className="text-slate-500">Visão geral do atendimento e automação.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <StatCard
                    icon={<MessageCircle className="w-5 h-5 text-green-600" />}
                    title="Conversas ativas"
                    value={metrics.conversasAtivas}
                />
                <StatCard
                    icon={<Send className="w-5 h-5 text-blue-600" />}
                    title="Mensagens enviadas"
                    value={metrics.mensagensEnviadas}
                />
                <StatCard
                    icon={<AlertTriangle className="w-5 h-5 text-red-600" />}
                    title="Erros de envio"
                    value={metrics.mensagensErro}
                    subtitle={metrics.logsErro ? `${metrics.logsErro} logs com erro` : undefined}
                />
                <StatCard
                    icon={<FileText className="w-5 h-5 text-indigo-600" />}
                    title="Templates aprovados"
                    value={metrics.templatesAprovados}
                />
                <StatCard
                    icon={<Bot className="w-5 h-5 text-purple-600" />}
                    title="Mensagens do bot"
                    value={metrics.mensagensBot}
                />
                <StatCard
                    icon={<Clock3 className="w-5 h-5 text-slate-600" />}
                    title="Logs recentes"
                    value={logs.length}
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4">
                        Conversas recentes
                    </h2>

                    {loading ? (
                        <div className="text-slate-500">Carregando...</div>
                    ) : recentConversations.length === 0 ? (
                        <div className="text-slate-500">Nenhuma conversa encontrada.</div>
                    ) : (
                        <div className="space-y-3">
                            {recentConversations.map((conv) => (
                                <div
                                    key={conv.id}
                                    className="border rounded-lg p-3 flex items-center justify-between"
                                >
                                    <div>
                                        <div className="font-medium text-slate-800">
                                            {conv.cliente_nome || 'Sem nome'}
                                        </div>
                                        <div className="text-sm text-slate-500">
                                            {conv.cliente_telefone}
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600 inline-block">
                                            {conv.status || 'Ativo'}
                                        </div>
                                        <div className="text-xs text-slate-500 mt-1">
                                            {(conv.ultimo_contato || conv.updated_at || conv.created_at)
                                                ? new Date(conv.ultimo_contato || conv.updated_at || conv.created_at).toLocaleString('pt-BR')
                                                : '-'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4">
                        Logs recentes
                    </h2>

                    {loading ? (
                        <div className="text-slate-500">Carregando...</div>
                    ) : recentLogs.length === 0 ? (
                        <div className="text-slate-500">Nenhum log encontrado.</div>
                    ) : (
                        <div className="space-y-3">
                            {recentLogs.map((log) => (
                                <div key={log.id} className="border rounded-lg p-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="font-medium text-slate-800">
                                            {log.titulo || log.tipo || 'Log'}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            {(log.created_at || log.timestamp)
                                                ? new Date(log.created_at || log.timestamp).toLocaleString('pt-BR')
                                                : '-'}
                                        </div>
                                    </div>
                                    <div className="text-sm text-slate-500 mt-1">
                                        {log.mensagem || log.descricao || 'Sem descrição'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SmartZapDashboard;