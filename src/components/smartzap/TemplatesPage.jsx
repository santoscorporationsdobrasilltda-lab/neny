import React, { useState, useEffect } from 'react';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { FileText, Plus, Edit, Trash2, Save, X, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const initialForm = {
    id: '',
    nome: '',
    categoria: 'MARKETING',
    conteudo: '',
    status: 'pendente',
};

const TemplatesPage = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const {
        data: templates,
        fetchAll,
        create,
        update,
        remove,
        loading,
    } = useSupabaseCrud('smartzap_templates');

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(initialForm);

    useEffect(() => {
        if (user) {
            fetchAll(1, 1000);
        }
    }, [user, fetchAll]);

    const resetForm = () => {
        setFormData(initialForm);
        setIsEditing(false);
    };

    const handleSubmit = async () => {
        if (!user) {
            toast({
                title: 'Erro',
                description: 'Usuário não autenticado.',
                variant: 'destructive',
            });
            return;
        }

        if (!formData.nome.trim() || !formData.conteudo.trim()) {
            toast({
                title: 'Erro',
                description: 'Preencha nome e conteúdo do template.',
                variant: 'destructive',
            });
            return;
        }

        const payload = {
            user_id: user.id,
            nome: formData.nome.trim().toLowerCase().replace(/\s+/g, '_'),
            categoria: formData.categoria || 'MARKETING',
            conteudo: formData.conteudo.trim(),
            status: formData.status || 'pendente',
            updated_at: new Date().toISOString(),
        };

        const saved = formData.id
            ? await update(formData.id, payload)
            : await create(payload);

        if (saved) {
            await fetchAll(1, 1000);
            resetForm();
            toast({
                title: '✅ Template salvo',
                description: 'O template foi salvo com sucesso.',
            });
        }
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm('Deseja realmente excluir este template?');
        if (!confirmed) return;

        const success = await remove(id);
        if (success) {
            await fetchAll(1, 1000);
            toast({
                title: '🗑️ Template excluído',
            });
        }
    };

    const syncWithMeta = async () => {
        toast({
            title: '🔄 Sincronização simulada',
            description: 'A sincronização com a Meta ainda está em modo mock.',
        });
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {!isEditing ? (
                <>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <FileText className="w-6 h-6 text-indigo-600" />
                                Templates de Mensagem (HSM)
                            </h2>
                            <p className="text-sm text-slate-500">
                                Gerencie modelos de mensagens aprovados pela Meta.
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <Button variant="outline" onClick={syncWithMeta}>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Sincronizar Meta
                            </Button>

                            <Button
                                onClick={() => {
                                    setFormData(initialForm);
                                    setIsEditing(true);
                                }}
                                className="bg-indigo-600 hover:bg-indigo-700"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Novo Template
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {loading ? (
                            <div className="col-span-full bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center text-slate-500">
                                Carregando templates...
                            </div>
                        ) : templates.length === 0 ? (
                            <div className="col-span-full bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center text-slate-500">
                                Nenhum template cadastrado.
                            </div>
                        ) : (
                            templates.map((tpl) => (
                                <div key={tpl.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-slate-700">{tpl.nome}</h3>
                                        <span
                                            className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${tpl.status === 'aprovado'
                                                    ? 'bg-green-100 text-green-700'
                                                    : tpl.status === 'reprovado'
                                                        ? 'bg-red-100 text-red-700'
                                                        : 'bg-yellow-100 text-yellow-700'
                                                }`}
                                        >
                                            {tpl.status}
                                        </span>
                                    </div>

                                    <div className="text-xs text-slate-400 mb-2">
                                        Categoria: {tpl.categoria}
                                    </div>

                                    <div className="bg-slate-50 p-3 rounded border border-slate-100 text-sm text-slate-600 mb-4 h-24 overflow-y-auto whitespace-pre-wrap">
                                        {tpl.conteudo}
                                    </div>

                                    <div className="flex justify-end gap-2 border-t pt-3">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setFormData({
                                                    id: tpl.id,
                                                    nome: tpl.nome || '',
                                                    categoria: tpl.categoria || 'MARKETING',
                                                    conteudo: tpl.conteudo || '',
                                                    status: tpl.status || 'pendente',
                                                });
                                                setIsEditing(true);
                                            }}
                                        >
                                            <Edit className="w-4 h-4 text-blue-600" />
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(tpl.id)}
                                        >
                                            <Trash2 className="w-4 h-4 text-red-600" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </>
            ) : (
                <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
                    <div className="flex justify-between items-center mb-6 border-b pb-4">
                        <h3 className="text-xl font-bold text-slate-800">Editor de Template</h3>
                        <Button variant="ghost" size="sm" onClick={resetForm}>
                            <X className="w-4 h-4 mr-2" />
                            Cancelar
                        </Button>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-semibold block mb-1">
                                    Nome do Template (sem espaços)
                                </label>
                                <input
                                    className="w-full p-2 border rounded-lg"
                                    value={formData.nome}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            nome: e.target.value.toLowerCase().replace(/\s+/g, '_'),
                                        })
                                    }
                                    placeholder="ex: boas_vindas_v1"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-semibold block mb-1">
                                    Categoria Meta
                                </label>
                                <select
                                    className="w-full p-2 border rounded-lg"
                                    value={formData.categoria}
                                    onChange={(e) =>
                                        setFormData({ ...formData, categoria: e.target.value })
                                    }
                                >
                                    <option value="MARKETING">Marketing</option>
                                    <option value="UTILITY">Utilidade</option>
                                    <option value="AUTHENTICATION">Autenticação</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-semibold block mb-1">
                                Conteúdo (use {'{{var}}'} para variáveis)
                            </label>
                            <textarea
                                className="w-full p-3 border rounded-lg h-32"
                                value={formData.conteudo}
                                onChange={(e) =>
                                    setFormData({ ...formData, conteudo: e.target.value })
                                }
                                placeholder="Olá {{nome}}, seu pedido {{numero}} foi enviado!"
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                Variáveis padrão: {'{{nome}}'}, {'{{telefone}}'}
                            </p>
                        </div>

                        <div>
                            <label className="text-sm font-semibold block mb-1">Status</label>
                            <select
                                className="w-full p-2 border rounded-lg"
                                value={formData.status}
                                onChange={(e) =>
                                    setFormData({ ...formData, status: e.target.value })
                                }
                            >
                                <option value="pendente">Pendente</option>
                                <option value="aprovado">Aprovado</option>
                                <option value="reprovado">Reprovado</option>
                            </select>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button
                                onClick={handleSubmit}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                Salvar Template
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TemplatesPage;