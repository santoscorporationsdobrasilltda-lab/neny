import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    Send,
    Bot,
    User,
    Search,
    Paperclip,
    MoreVertical,
    Sparkles,
    FileText,
    X,
    MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { whatsappService } from '@/services/whatsappService';

const ConversasTab = () => {
    const { toast } = useToast();
    const { user } = useAuth();

    const {
        data: conversas,
        loading: loadingConversas,
        fetchAll: fetchConversas,
        create: createConversa,
        update: updateConversa,
    } = useSupabaseCrud('smartzap_conversas');

    const {
        data: mensagens,
        loading: loadingMensagens,
        fetchAll: fetchMensagens,
        create: createMensagem,
        setData: setMensagens,
    } = useSupabaseCrud('smartzap_mensagens');

    const {
        data: templates,
        fetchAll: fetchTemplates,
    } = useSupabaseCrud('smartzap_templates');

    const [selectedChat, setSelectedChat] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [inputMsg, setInputMsg] = useState('');
    const [aiSuggestion, setAiSuggestion] = useState(null);
    const [showTemplates, setShowTemplates] = useState(false);
    const [sending, setSending] = useState(false);

    const fileInputRef = useRef(null);

    useEffect(() => {
        if (user) {
            fetchConversas(1, 1000);
            fetchMensagens(1, 2000);
            fetchTemplates(1, 1000);
        }
    }, [user, fetchConversas, fetchMensagens, fetchTemplates]);

    useEffect(() => {
        if (!selectedChat) return;

        setAiSuggestion(
            'Olá! Claro, posso te ajudar com isso. Pode me explicar um pouco melhor o que você precisa?'
        );
    }, [selectedChat]);

    const filteredConversas = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();

        return [...conversas]
            .filter((c) => {
                return (
                    (c.cliente_telefone || '').toLowerCase().includes(term) ||
                    (c.cliente_nome || '').toLowerCase().includes(term) ||
                    (c.status || '').toLowerCase().includes(term)
                );
            })
            .sort((a, b) => {
                const da = a.ultimo_contato ? new Date(a.ultimo_contato).getTime() : 0;
                const db = b.ultimo_contato ? new Date(b.ultimo_contato).getTime() : 0;
                return db - da;
            });
    }, [conversas, searchTerm]);

    const currentMessages = useMemo(() => {
        if (!selectedChat) return [];

        return [...mensagens]
            .filter((msg) => msg.conversa_id === selectedChat.id)
            .sort((a, b) => {
                const da = a.created_at ? new Date(a.created_at).getTime() : 0;
                const db = b.created_at ? new Date(b.created_at).getTime() : 0;
                return da - db;
            });
    }, [mensagens, selectedChat]);

    const handleCreateConversation = async () => {
        if (!user) return;

        const telefone = window.prompt('Digite o telefone da nova conversa:');
        if (!telefone?.trim()) return;

        const nome = window.prompt('Digite o nome do cliente (opcional):') || null;

        const payload = {
            user_id: user.id,
            cliente_nome: nome,
            cliente_telefone: telefone.trim(),
            status: 'Ativo',
            ultimo_contato: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        const created = await createConversa(payload);
        if (created) {
            await fetchConversas(1, 1000);
            toast({
                title: '✅ Conversa criada',
                description: 'A conversa foi cadastrada com sucesso.',
            });
        }
    };

    const handleSend = async () => {
        if (!inputMsg.trim() || !selectedChat || !user || sending) return;

        try {
            setSending(true);

            await whatsappService.sendWhatsAppMessage(
                selectedChat.cliente_telefone,
                inputMsg.trim(),
                selectedChat.id
            );

            await updateConversa(selectedChat.id, {
                ultimo_contato: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            });

            await fetchMensagens(1, 2000);
            await fetchConversas(1, 1000);

            setInputMsg('');
            setAiSuggestion(null);
        } catch (error) {
            toast({
                title: 'Erro ao enviar',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setSending(false);
        }
    };

    const handleInternalIncomingMock = async () => {
        if (!selectedChat || !user) return;

        const conteudo = window.prompt('Simular mensagem recebida do cliente:');
        if (!conteudo?.trim()) return;

        const created = await createMensagem({
            user_id: user.id,
            conversa_id: selectedChat.id,
            telefone: selectedChat.cliente_telefone,
            remetente: 'cliente',
            conteudo: conteudo.trim(),
            tipo: 'texto',
            status: 'recebido',
            updated_at: new Date().toISOString(),
        });

        if (created) {
            await updateConversa(selectedChat.id, {
                ultimo_contato: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            });

            await fetchMensagens(1, 2000);
            await fetchConversas(1, 1000);

            setAiSuggestion('Entendi. Posso te ajudar com mais informações sobre isso.');
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !selectedChat) return;

        toast({
            title: 'Arquivo simulado',
            description: `O arquivo ${file.name} foi adicionado à conversa (upload ainda mock).`,
        });

        e.target.value = '';
    };

    const applyTemplate = (template) => {
        setInputMsg(template.conteudo || '');
        setShowTemplates(false);
    };

    return (
        <div className="flex h-[calc(100vh-200px)] bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="w-1/3 md:w-1/4 border-r border-slate-200 flex flex-col">
                <div className="p-4 border-b border-slate-200 bg-slate-50 space-y-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Buscar nome ou telefone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <Button onClick={handleCreateConversation} className="w-full bg-green-600 hover:bg-green-700">
                        Nova conversa
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loadingConversas ? (
                        <div className="p-4 text-sm text-slate-500">Carregando conversas...</div>
                    ) : filteredConversas.length === 0 ? (
                        <div className="p-4 text-sm text-slate-500">Nenhuma conversa encontrada.</div>
                    ) : (
                        filteredConversas.map((chat) => (
                            <div
                                key={chat.id}
                                onClick={() => setSelectedChat(chat)}
                                className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${selectedChat?.id === chat.id ? 'bg-green-50 border-r-4 border-r-green-500' : ''
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold text-slate-800">
                                            {chat.cliente_nome || 'Sem nome'}
                                        </p>
                                        <p className="text-sm text-slate-500">{chat.cliente_telefone}</p>
                                    </div>

                                    <span
                                        className={`text-[10px] px-2 py-1 rounded-full ${(chat.status || '').toLowerCase() === 'ativo'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-yellow-100 text-yellow-700'
                                            }`}
                                    >
                                        {chat.status || 'Ativo'}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="flex-1 flex flex-col bg-slate-100 relative">
                {selectedChat ? (
                    <>
                        <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-slate-800">
                                    {selectedChat.cliente_nome || 'Sem nome'}
                                </h3>
                                <p className="text-sm text-slate-500">{selectedChat.cliente_telefone}</p>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={handleInternalIncomingMock}>
                                    Simular recebida
                                </Button>
                                <Button variant="ghost" size="icon">
                                    <MoreVertical className="w-5 h-5 text-slate-500" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {loadingMensagens ? (
                                <div className="text-center text-slate-500">Carregando mensagens...</div>
                            ) : currentMessages.length === 0 ? (
                                <div className="text-center text-slate-500">Nenhuma mensagem nesta conversa.</div>
                            ) : (
                                currentMessages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.remetente === 'cliente' ? 'justify-start' : 'justify-end'
                                            }`}
                                    >
                                        <div
                                            className={`max-w-[70%] rounded-xl p-3 shadow-sm ${msg.remetente === 'cliente'
                                                    ? 'bg-white text-slate-800 rounded-tl-none'
                                                    : msg.remetente === 'bot'
                                                        ? 'bg-indigo-100 text-indigo-900 rounded-tr-none'
                                                        : 'bg-green-100 text-green-900 rounded-tr-none'
                                                }`}
                                        >
                                            <div className="text-[10px] font-bold mb-1 opacity-50 flex items-center gap-1">
                                                {msg.remetente === 'bot' && <Bot className="w-3 h-3" />}
                                                {msg.remetente === 'agente' && <User className="w-3 h-3" />}
                                                {String(msg.remetente || '').toUpperCase()}
                                            </div>

                                            <p className="text-sm whitespace-pre-wrap">{msg.conteudo}</p>

                                            <div className="text-[10px] opacity-50 text-right mt-1 flex justify-end gap-1">
                                                {msg.created_at
                                                    ? new Date(msg.created_at).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })
                                                    : ''}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {aiSuggestion && (
                            <div className="absolute bottom-20 left-4 right-4 bg-purple-50 border border-purple-200 p-3 rounded-xl shadow-lg z-20">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs font-bold text-purple-700 flex items-center">
                                        <Sparkles className="w-3 h-3 mr-1" />
                                        Sugestão IA
                                    </span>

                                    <button
                                        onClick={() => setAiSuggestion(null)}
                                        className="text-slate-400 hover:text-slate-600"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                <p className="text-sm text-purple-900 mb-2">{aiSuggestion}</p>

                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        className="bg-purple-600 hover:bg-purple-700"
                                        onClick={() => {
                                            setInputMsg(aiSuggestion);
                                            setAiSuggestion(null);
                                        }}
                                    >
                                        Editar
                                    </Button>

                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="border-purple-300 text-purple-700"
                                        onClick={() => {
                                            setInputMsg('');
                                            setAiSuggestion(null);
                                        }}
                                    >
                                        Dispensar
                                    </Button>
                                </div>
                            </div>
                        )}

                        {showTemplates && (
                            <div className="absolute bottom-20 left-4 bg-white border border-slate-200 rounded-xl shadow-xl w-[340px] max-h-[280px] overflow-y-auto z-30">
                                <div className="p-3 border-b font-semibold text-slate-700">
                                    Templates
                                </div>

                                {templates.length === 0 ? (
                                    <div className="p-3 text-sm text-slate-500">
                                        Nenhum template disponível.
                                    </div>
                                ) : (
                                    templates.map((tpl) => (
                                        <button
                                            key={tpl.id}
                                            className="w-full text-left p-3 hover:bg-slate-50 border-b last:border-b-0"
                                            onClick={() => applyTemplate(tpl)}
                                        >
                                            <div className="font-medium text-slate-800">{tpl.nome}</div>
                                            <div className="text-xs text-slate-500 mt-1 line-clamp-2">
                                                {tpl.conteudo}
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        )}

                        <div className="p-4 bg-white border-t border-slate-200 flex gap-2 items-center z-10">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowTemplates(!showTemplates)}
                                title="Templates"
                            >
                                <FileText className="w-5 h-5 text-slate-400" />
                            </Button>

                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*,application/pdf"
                                onChange={handleFileUpload}
                            />

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => fileInputRef.current?.click()}
                                title="Anexar Arquivo"
                            >
                                <Paperclip className="w-5 h-5 text-slate-400" />
                            </Button>

                            <input
                                className="flex-1 border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="Digite sua mensagem..."
                                value={inputMsg}
                                onChange={(e) => setInputMsg(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            />

                            <Button
                                onClick={handleSend}
                                className="bg-green-600 hover:bg-green-700"
                                disabled={sending}
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-400 flex-col gap-2">
                        <MessageSquare className="w-12 h-12 opacity-20" />
                        <p>Selecione uma conversa para iniciar o atendimento</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConversasTab;