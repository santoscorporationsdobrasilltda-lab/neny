import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Star,
    TrendingUp,
    BookOpen,
    Save,
    Trash2,
    Edit,
    Search,
    X,
    Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';

const today = new Date().toISOString().split('T')[0];

const initialEvaluationForm = {
    id: '',
    funcionario_id: '',
    data_avaliacao: today,
    nota: '',
    avaliador: '',
    comentarios: '',
    status: 'Concluída',
};

const initialPromotionForm = {
    id: '',
    funcionario_id: '',
    data_promocao: today,
    cargo_anterior: '',
    cargo_novo: '',
    salario_anterior: '',
    salario_novo: '',
    motivo: '',
    observacoes: '',
};

const initialTrainingForm = {
    id: '',
    funcionario_id: '',
    titulo: '',
    fornecedor: '',
    data_inicio: '',
    data_fim: '',
    carga_horaria: '',
    status: 'Planejado',
    observacoes: '',
};

const formatDate = (value) => {
    if (!value) return '-';
    return new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR');
};

const formatCurrency = (value) => {
    const number = Number(value || 0);
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(number);
};

const GestaoPessoasTab = () => {
    const { toast } = useToast();
    const { user } = useAuth();

    const {
        data: funcionarios,
        loading: loadingFuncionarios,
        fetchAll: fetchFuncionarios,
    } = useSupabaseCrud('rh_funcionarios');

    const {
        data: evaluations,
        loading: loadingEvaluations,
        fetchAll: fetchEvaluations,
        create: createEvaluation,
        update: updateEvaluation,
        remove: removeEvaluation,
    } = useSupabaseCrud('rh_avaliacoes');

    const {
        data: promotions,
        loading: loadingPromotions,
        fetchAll: fetchPromotions,
        create: createPromotion,
        update: updatePromotion,
        remove: removePromotion,
    } = useSupabaseCrud('rh_promocoes');

    const {
        data: trainings,
        loading: loadingTrainings,
        fetchAll: fetchTrainings,
        create: createTraining,
        update: updateTraining,
        remove: removeTraining,
    } = useSupabaseCrud('rh_treinamentos');

    const [activeTab, setActiveTab] = useState('avaliacao');
    const [searchTerm, setSearchTerm] = useState('');
    const [evaluationForm, setEvaluationForm] = useState(initialEvaluationForm);
    const [promotionForm, setPromotionForm] = useState(initialPromotionForm);
    const [trainingForm, setTrainingForm] = useState(initialTrainingForm);

    useEffect(() => {
        if (user) {
            fetchFuncionarios(1, 1000);
            fetchEvaluations(1, 1000);
            fetchPromotions(1, 1000);
            fetchTrainings(1, 1000);
        }
    }, [user, fetchFuncionarios, fetchEvaluations, fetchPromotions, fetchTrainings]);

    useEffect(() => {
        setSearchTerm('');
    }, [activeTab]);

    const funcionariosOrdenados = useMemo(() => {
        return [...funcionarios].sort((a, b) =>
            (a.nome || '').localeCompare(b.nome || '', 'pt-BR')
        );
    }, [funcionarios]);

    const getFuncionarioNome = (funcionarioId) => {
        const funcionario = funcionarios.find((item) => item.id === funcionarioId);
        return funcionario?.nome || 'Colaborador não encontrado';
    };

    const resetEvaluationForm = () => setEvaluationForm(initialEvaluationForm);
    const resetPromotionForm = () => setPromotionForm(initialPromotionForm);
    const resetTrainingForm = () => setTrainingForm(initialTrainingForm);

    const filteredEvaluations = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();

        return [...evaluations]
            .filter((item) => {
                const funcionarioNome = getFuncionarioNome(item.funcionario_id).toLowerCase();
                return (
                    funcionarioNome.includes(term) ||
                    (item.avaliador || '').toLowerCase().includes(term) ||
                    (item.status || '').toLowerCase().includes(term) ||
                    (item.comentarios || '').toLowerCase().includes(term)
                );
            })
            .sort((a, b) => new Date(b.data_avaliacao) - new Date(a.data_avaliacao));
    }, [evaluations, funcionarios, searchTerm]);

    const filteredPromotions = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();

        return [...promotions]
            .filter((item) => {
                const funcionarioNome = getFuncionarioNome(item.funcionario_id).toLowerCase();
                return (
                    funcionarioNome.includes(term) ||
                    (item.cargo_anterior || '').toLowerCase().includes(term) ||
                    (item.cargo_novo || '').toLowerCase().includes(term) ||
                    (item.motivo || '').toLowerCase().includes(term)
                );
            })
            .sort((a, b) => new Date(b.data_promocao) - new Date(a.data_promocao));
    }, [promotions, funcionarios, searchTerm]);

    const filteredTrainings = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();

        return [...trainings]
            .filter((item) => {
                const funcionarioNome = getFuncionarioNome(item.funcionario_id).toLowerCase();
                return (
                    funcionarioNome.includes(term) ||
                    (item.titulo || '').toLowerCase().includes(term) ||
                    (item.fornecedor || '').toLowerCase().includes(term) ||
                    (item.status || '').toLowerCase().includes(term)
                );
            })
            .sort((a, b) => {
                const aDate = a.data_inicio ? new Date(a.data_inicio).getTime() : 0;
                const bDate = b.data_inicio ? new Date(b.data_inicio).getTime() : 0;
                return bDate - aDate;
            });
    }, [trainings, funcionarios, searchTerm]);

    const handleDelete = async (id, type) => {
        const confirmed = window.confirm(`Deseja realmente excluir este registro de ${type}?`);
        if (!confirmed) return;

        if (type === 'avaliação') {
            const success = await removeEvaluation(id);
            if (success) await fetchEvaluations(1, 1000);
            return;
        }

        if (type === 'promoção') {
            const success = await removePromotion(id);
            if (success) await fetchPromotions(1, 1000);
            return;
        }

        const success = await removeTraining(id);
        if (success) await fetchTrainings(1, 1000);
    };

    const handleEditEvaluation = (item) => {
        setEvaluationForm({
            id: item.id,
            funcionario_id: item.funcionario_id || '',
            data_avaliacao: item.data_avaliacao || today,
            nota: item.nota ?? '',
            avaliador: item.avaliador || '',
            comentarios: item.comentarios || '',
            status: item.status || 'Concluída',
        });
        setActiveTab('avaliacao');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleEditPromotion = (item) => {
        setPromotionForm({
            id: item.id,
            funcionario_id: item.funcionario_id || '',
            data_promocao: item.data_promocao || today,
            cargo_anterior: item.cargo_anterior || '',
            cargo_novo: item.cargo_novo || '',
            salario_anterior: item.salario_anterior ?? '',
            salario_novo: item.salario_novo ?? '',
            motivo: item.motivo || '',
            observacoes: item.observacoes || '',
        });
        setActiveTab('promocao');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleEditTraining = (item) => {
        setTrainingForm({
            id: item.id,
            funcionario_id: item.funcionario_id || '',
            titulo: item.titulo || '',
            fornecedor: item.fornecedor || '',
            data_inicio: item.data_inicio || '',
            data_fim: item.data_fim || '',
            carga_horaria: item.carga_horaria ?? '',
            status: item.status || 'Planejado',
            observacoes: item.observacoes || '',
        });
        setActiveTab('treinamento');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmitEvaluation = async (e) => {
        e.preventDefault();

        if (!user) {
            toast({
                title: 'Erro',
                description: 'Usuário não autenticado.',
                variant: 'destructive',
            });
            return;
        }

        if (!evaluationForm.funcionario_id || !evaluationForm.data_avaliacao) {
            toast({
                title: 'Erro',
                description: 'Selecione o colaborador e informe a data da avaliação.',
                variant: 'destructive',
            });
            return;
        }

        const nota = Number(evaluationForm.nota);
        if (Number.isNaN(nota) || nota < 0 || nota > 5) {
            toast({
                title: 'Erro',
                description: 'A nota deve estar entre 0 e 5.',
                variant: 'destructive',
            });
            return;
        }

        const payload = {
            user_id: user.id,
            funcionario_id: evaluationForm.funcionario_id,
            data_avaliacao: evaluationForm.data_avaliacao,
            nota,
            avaliador: evaluationForm.avaliador || null,
            comentarios: evaluationForm.comentarios || null,
            status: evaluationForm.status || 'Concluída',
            updated_at: new Date().toISOString(),
        };

        const saved = evaluationForm.id
            ? await updateEvaluation(evaluationForm.id, payload)
            : await createEvaluation(payload);

        if (saved) {
            await fetchEvaluations(1, 1000);
            resetEvaluationForm();
        }
    };

    const handleSubmitPromotion = async (e) => {
        e.preventDefault();

        if (!user) {
            toast({
                title: 'Erro',
                description: 'Usuário não autenticado.',
                variant: 'destructive',
            });
            return;
        }

        if (!promotionForm.funcionario_id || !promotionForm.data_promocao || !promotionForm.cargo_novo) {
            toast({
                title: 'Erro',
                description: 'Selecione o colaborador e preencha os campos obrigatórios da promoção.',
                variant: 'destructive',
            });
            return;
        }

        const payload = {
            user_id: user.id,
            funcionario_id: promotionForm.funcionario_id,
            data_promocao: promotionForm.data_promocao,
            cargo_anterior: promotionForm.cargo_anterior || null,
            cargo_novo: promotionForm.cargo_novo || null,
            salario_anterior:
                promotionForm.salario_anterior !== ''
                    ? Number(promotionForm.salario_anterior)
                    : null,
            salario_novo:
                promotionForm.salario_novo !== ''
                    ? Number(promotionForm.salario_novo)
                    : null,
            motivo: promotionForm.motivo || null,
            observacoes: promotionForm.observacoes || null,
            updated_at: new Date().toISOString(),
        };

        const saved = promotionForm.id
            ? await updatePromotion(promotionForm.id, payload)
            : await createPromotion(payload);

        if (saved) {
            await fetchPromotions(1, 1000);
            resetPromotionForm();
        }
    };

    const handleSubmitTraining = async (e) => {
        e.preventDefault();

        if (!user) {
            toast({
                title: 'Erro',
                description: 'Usuário não autenticado.',
                variant: 'destructive',
            });
            return;
        }

        if (!trainingForm.funcionario_id || !trainingForm.titulo) {
            toast({
                title: 'Erro',
                description: 'Selecione o colaborador e informe o título do treinamento.',
                variant: 'destructive',
            });
            return;
        }

        const payload = {
            user_id: user.id,
            funcionario_id: trainingForm.funcionario_id,
            titulo: trainingForm.titulo,
            fornecedor: trainingForm.fornecedor || null,
            data_inicio: trainingForm.data_inicio || null,
            data_fim: trainingForm.data_fim || null,
            carga_horaria:
                trainingForm.carga_horaria !== ''
                    ? Number(trainingForm.carga_horaria)
                    : null,
            status: trainingForm.status || 'Planejado',
            observacoes: trainingForm.observacoes || null,
            updated_at: new Date().toISOString(),
        };

        const saved = trainingForm.id
            ? await updateTraining(trainingForm.id, payload)
            : await createTraining(payload);

        if (saved) {
            await fetchTrainings(1, 1000);
            resetTrainingForm();
        }
    };

    const loading =
        loadingFuncionarios ||
        loadingEvaluations ||
        loadingPromotions ||
        loadingTrainings;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {funcionariosOrdenados.length === 0 && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4">
                    Cadastre pelo menos um funcionário no módulo de RH para usar avaliações,
                    promoções e treinamentos.
                </div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-white p-2 rounded-xl mb-6 overflow-x-auto flex justify-start h-auto gap-2 border border-slate-200 shadow-sm">
                    <TabsTrigger value="avaliacao" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg">
                        <Star className="w-4 h-4 mr-2" />
                        Avaliação de Desempenho
                    </TabsTrigger>
                    <TabsTrigger value="promocao" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Histórico de Promoções
                    </TabsTrigger>
                    <TabsTrigger value="treinamento" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Treinamentos
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="avaliacao" className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-slate-800">
                                {evaluationForm.id ? 'Editar Avaliação' : 'Nova Avaliação'}
                            </h3>

                            {evaluationForm.id && (
                                <Button variant="ghost" onClick={resetEvaluationForm}>
                                    <X className="w-4 h-4 mr-2" />
                                    Cancelar
                                </Button>
                            )}
                        </div>

                        <form onSubmit={handleSubmitEvaluation} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <select
                                className="p-2 border rounded"
                                value={evaluationForm.funcionario_id}
                                onChange={(e) =>
                                    setEvaluationForm({ ...evaluationForm, funcionario_id: e.target.value })
                                }
                                required
                            >
                                <option value="">Selecione o colaborador</option>
                                {funcionariosOrdenados.map((funcionario) => (
                                    <option key={funcionario.id} value={funcionario.id}>
                                        {funcionario.nome}
                                    </option>
                                ))}
                            </select>

                            <input
                                type="date"
                                className="p-2 border rounded"
                                value={evaluationForm.data_avaliacao}
                                onChange={(e) =>
                                    setEvaluationForm({ ...evaluationForm, data_avaliacao: e.target.value })
                                }
                                required
                            />

                            <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="5"
                                className="p-2 border rounded"
                                placeholder="Nota (0 a 5)"
                                value={evaluationForm.nota}
                                onChange={(e) =>
                                    setEvaluationForm({ ...evaluationForm, nota: e.target.value })
                                }
                                required
                            />

                            <input
                                className="p-2 border rounded"
                                placeholder="Avaliador"
                                value={evaluationForm.avaliador}
                                onChange={(e) =>
                                    setEvaluationForm({ ...evaluationForm, avaliador: e.target.value })
                                }
                            />

                            <select
                                className="p-2 border rounded"
                                value={evaluationForm.status}
                                onChange={(e) =>
                                    setEvaluationForm({ ...evaluationForm, status: e.target.value })
                                }
                            >
                                <option value="Agendada">Agendada</option>
                                <option value="Em andamento">Em andamento</option>
                                <option value="Concluída">Concluída</option>
                            </select>

                            <textarea
                                className="p-2 border rounded md:col-span-3"
                                rows={3}
                                placeholder="Comentários"
                                value={evaluationForm.comentarios}
                                onChange={(e) =>
                                    setEvaluationForm({ ...evaluationForm, comentarios: e.target.value })
                                }
                            />

                            <div className="md:col-span-3 flex justify-end gap-2">
                                {evaluationForm.id && (
                                    <Button type="button" variant="outline" onClick={resetEvaluationForm}>
                                        Cancelar
                                    </Button>
                                )}
                                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                                    <Save className="w-4 h-4 mr-2" />
                                    {evaluationForm.id ? 'Salvar alterações' : 'Salvar avaliação'}
                                </Button>
                            </div>
                        </form>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                            <h4 className="text-lg font-semibold text-slate-800">
                                Avaliações cadastradas
                            </h4>

                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    className="w-full pl-10 pr-3 py-2 border rounded-lg"
                                    placeholder="Buscar avaliação..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-slate-700">
                                    <tr>
                                        <th className="p-3 font-semibold">Colaborador</th>
                                        <th className="p-3 font-semibold">Data</th>
                                        <th className="p-3 font-semibold">Nota</th>
                                        <th className="p-3 font-semibold">Avaliador</th>
                                        <th className="p-3 font-semibold">Status</th>
                                        <th className="p-3 font-semibold">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6} className="p-6 text-center text-slate-500">
                                                Carregando...
                                            </td>
                                        </tr>
                                    ) : filteredEvaluations.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="p-6 text-center text-slate-500">
                                                Nenhuma avaliação encontrada.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredEvaluations.map((item) => (
                                            <tr key={item.id} className="border-b last:border-b-0">
                                                <td className="p-3 font-medium text-slate-800">
                                                    {getFuncionarioNome(item.funcionario_id)}
                                                </td>
                                                <td className="p-3 text-slate-700">
                                                    {formatDate(item.data_avaliacao)}
                                                </td>
                                                <td className="p-3 text-slate-700">
                                                    <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded font-semibold">
                                                        {item.nota ?? '-'}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-slate-700">
                                                    {item.avaliador || '-'}
                                                </td>
                                                <td className="p-3 text-slate-700">
                                                    {item.status || '-'}
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex gap-2">
                                                        <Button size="icon" variant="ghost" onClick={() => handleEditEvaluation(item)}>
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="text-red-600 hover:text-red-700"
                                                            onClick={() => handleDelete(item.id, 'avaliação')}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="promocao" className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-slate-800">
                                {promotionForm.id ? 'Editar Promoção' : 'Nova Promoção'}
                            </h3>

                            {promotionForm.id && (
                                <Button variant="ghost" onClick={resetPromotionForm}>
                                    <X className="w-4 h-4 mr-2" />
                                    Cancelar
                                </Button>
                            )}
                        </div>

                        <form onSubmit={handleSubmitPromotion} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <select
                                className="p-2 border rounded"
                                value={promotionForm.funcionario_id}
                                onChange={(e) =>
                                    setPromotionForm({ ...promotionForm, funcionario_id: e.target.value })
                                }
                                required
                            >
                                <option value="">Selecione o colaborador</option>
                                {funcionariosOrdenados.map((funcionario) => (
                                    <option key={funcionario.id} value={funcionario.id}>
                                        {funcionario.nome}
                                    </option>
                                ))}
                            </select>

                            <input
                                type="date"
                                className="p-2 border rounded"
                                value={promotionForm.data_promocao}
                                onChange={(e) =>
                                    setPromotionForm({ ...promotionForm, data_promocao: e.target.value })
                                }
                                required
                            />

                            <input
                                className="p-2 border rounded"
                                placeholder="Motivo"
                                value={promotionForm.motivo}
                                onChange={(e) =>
                                    setPromotionForm({ ...promotionForm, motivo: e.target.value })
                                }
                            />

                            <input
                                className="p-2 border rounded"
                                placeholder="Cargo anterior"
                                value={promotionForm.cargo_anterior}
                                onChange={(e) =>
                                    setPromotionForm({ ...promotionForm, cargo_anterior: e.target.value })
                                }
                            />

                            <input
                                className="p-2 border rounded"
                                placeholder="Novo cargo *"
                                value={promotionForm.cargo_novo}
                                onChange={(e) =>
                                    setPromotionForm({ ...promotionForm, cargo_novo: e.target.value })
                                }
                                required
                            />

                            <input
                                type="number"
                                step="0.01"
                                className="p-2 border rounded"
                                placeholder="Salário anterior"
                                value={promotionForm.salario_anterior}
                                onChange={(e) =>
                                    setPromotionForm({ ...promotionForm, salario_anterior: e.target.value })
                                }
                            />

                            <input
                                type="number"
                                step="0.01"
                                className="p-2 border rounded"
                                placeholder="Novo salário"
                                value={promotionForm.salario_novo}
                                onChange={(e) =>
                                    setPromotionForm({ ...promotionForm, salario_novo: e.target.value })
                                }
                            />

                            <textarea
                                className="p-2 border rounded md:col-span-3"
                                rows={3}
                                placeholder="Observações"
                                value={promotionForm.observacoes}
                                onChange={(e) =>
                                    setPromotionForm({ ...promotionForm, observacoes: e.target.value })
                                }
                            />

                            <div className="md:col-span-3 flex justify-end gap-2">
                                {promotionForm.id && (
                                    <Button type="button" variant="outline" onClick={resetPromotionForm}>
                                        Cancelar
                                    </Button>
                                )}
                                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                                    <Save className="w-4 h-4 mr-2" />
                                    {promotionForm.id ? 'Salvar alterações' : 'Salvar promoção'}
                                </Button>
                            </div>
                        </form>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                            <h4 className="text-lg font-semibold text-slate-800">
                                Promoções registradas
                            </h4>

                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    className="w-full pl-10 pr-3 py-2 border rounded-lg"
                                    placeholder="Buscar promoção..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-slate-700">
                                    <tr>
                                        <th className="p-3 font-semibold">Colaborador</th>
                                        <th className="p-3 font-semibold">Data</th>
                                        <th className="p-3 font-semibold">Cargo</th>
                                        <th className="p-3 font-semibold">Salário</th>
                                        <th className="p-3 font-semibold">Motivo</th>
                                        <th className="p-3 font-semibold">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6} className="p-6 text-center text-slate-500">
                                                Carregando...
                                            </td>
                                        </tr>
                                    ) : filteredPromotions.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="p-6 text-center text-slate-500">
                                                Nenhuma promoção encontrada.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredPromotions.map((item) => (
                                            <tr key={item.id} className="border-b last:border-b-0">
                                                <td className="p-3 font-medium text-slate-800">
                                                    {getFuncionarioNome(item.funcionario_id)}
                                                </td>
                                                <td className="p-3 text-slate-700">
                                                    {formatDate(item.data_promocao)}
                                                </td>
                                                <td className="p-3 text-slate-700">
                                                    {(item.cargo_anterior || '-') + ' → ' + (item.cargo_novo || '-')}
                                                </td>
                                                <td className="p-3 text-slate-700">
                                                    {(item.salario_anterior !== null && item.salario_anterior !== undefined
                                                        ? formatCurrency(item.salario_anterior)
                                                        : '-') +
                                                        ' → ' +
                                                        (item.salario_novo !== null && item.salario_novo !== undefined
                                                            ? formatCurrency(item.salario_novo)
                                                            : '-')}
                                                </td>
                                                <td className="p-3 text-slate-700">
                                                    {item.motivo || '-'}
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex gap-2">
                                                        <Button size="icon" variant="ghost" onClick={() => handleEditPromotion(item)}>
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="text-red-600 hover:text-red-700"
                                                            onClick={() => handleDelete(item.id, 'promoção')}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="treinamento" className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-slate-800">
                                {trainingForm.id ? 'Editar Treinamento' : 'Novo Treinamento'}
                            </h3>

                            {trainingForm.id && (
                                <Button variant="ghost" onClick={resetTrainingForm}>
                                    <X className="w-4 h-4 mr-2" />
                                    Cancelar
                                </Button>
                            )}
                        </div>

                        <form onSubmit={handleSubmitTraining} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <select
                                className="p-2 border rounded"
                                value={trainingForm.funcionario_id}
                                onChange={(e) =>
                                    setTrainingForm({ ...trainingForm, funcionario_id: e.target.value })
                                }
                                required
                            >
                                <option value="">Selecione o colaborador</option>
                                {funcionariosOrdenados.map((funcionario) => (
                                    <option key={funcionario.id} value={funcionario.id}>
                                        {funcionario.nome}
                                    </option>
                                ))}
                            </select>

                            <input
                                className="p-2 border rounded"
                                placeholder="Título do treinamento *"
                                value={trainingForm.titulo}
                                onChange={(e) =>
                                    setTrainingForm({ ...trainingForm, titulo: e.target.value })
                                }
                                required
                            />

                            <input
                                className="p-2 border rounded"
                                placeholder="Fornecedor / Instrutor"
                                value={trainingForm.fornecedor}
                                onChange={(e) =>
                                    setTrainingForm({ ...trainingForm, fornecedor: e.target.value })
                                }
                            />

                            <input
                                type="date"
                                className="p-2 border rounded"
                                value={trainingForm.data_inicio}
                                onChange={(e) =>
                                    setTrainingForm({ ...trainingForm, data_inicio: e.target.value })
                                }
                            />

                            <input
                                type="date"
                                className="p-2 border rounded"
                                value={trainingForm.data_fim}
                                onChange={(e) =>
                                    setTrainingForm({ ...trainingForm, data_fim: e.target.value })
                                }
                            />

                            <input
                                type="number"
                                className="p-2 border rounded"
                                placeholder="Carga horária"
                                value={trainingForm.carga_horaria}
                                onChange={(e) =>
                                    setTrainingForm({ ...trainingForm, carga_horaria: e.target.value })
                                }
                            />

                            <select
                                className="p-2 border rounded"
                                value={trainingForm.status}
                                onChange={(e) =>
                                    setTrainingForm({ ...trainingForm, status: e.target.value })
                                }
                            >
                                <option value="Planejado">Planejado</option>
                                <option value="Em andamento">Em andamento</option>
                                <option value="Concluído">Concluído</option>
                                <option value="Cancelado">Cancelado</option>
                            </select>

                            <textarea
                                className="p-2 border rounded md:col-span-3"
                                rows={3}
                                placeholder="Observações"
                                value={trainingForm.observacoes}
                                onChange={(e) =>
                                    setTrainingForm({ ...trainingForm, observacoes: e.target.value })
                                }
                            />

                            <div className="md:col-span-3 flex justify-end gap-2">
                                {trainingForm.id && (
                                    <Button type="button" variant="outline" onClick={resetTrainingForm}>
                                        Cancelar
                                    </Button>
                                )}
                                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                                    <Save className="w-4 h-4 mr-2" />
                                    {trainingForm.id ? 'Salvar alterações' : 'Salvar treinamento'}
                                </Button>
                            </div>
                        </form>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                            <h4 className="text-lg font-semibold text-slate-800">
                                Treinamentos registrados
                            </h4>

                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    className="w-full pl-10 pr-3 py-2 border rounded-lg"
                                    placeholder="Buscar treinamento..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-slate-700">
                                    <tr>
                                        <th className="p-3 font-semibold">Colaborador</th>
                                        <th className="p-3 font-semibold">Treinamento</th>
                                        <th className="p-3 font-semibold">Período</th>
                                        <th className="p-3 font-semibold">Carga</th>
                                        <th className="p-3 font-semibold">Status</th>
                                        <th className="p-3 font-semibold">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6} className="p-6 text-center text-slate-500">
                                                Carregando...
                                            </td>
                                        </tr>
                                    ) : filteredTrainings.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="p-6 text-center text-slate-500">
                                                Nenhum treinamento encontrado.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredTrainings.map((item) => (
                                            <tr key={item.id} className="border-b last:border-b-0">
                                                <td className="p-3 font-medium text-slate-800">
                                                    {getFuncionarioNome(item.funcionario_id)}
                                                </td>
                                                <td className="p-3 text-slate-700">
                                                    <div className="font-medium">{item.titulo}</div>
                                                    <div className="text-sm text-slate-500">
                                                        {item.fornecedor || '-'}
                                                    </div>
                                                </td>
                                                <td className="p-3 text-slate-700">
                                                    {item.data_inicio ? formatDate(item.data_inicio) : '-'}
                                                    {' até '}
                                                    {item.data_fim ? formatDate(item.data_fim) : '-'}
                                                </td>
                                                <td className="p-3 text-slate-700">
                                                    {item.carga_horaria ? `${item.carga_horaria}h` : '-'}
                                                </td>
                                                <td className="p-3 text-slate-700">
                                                    {item.status || '-'}
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex gap-2">
                                                        <Button size="icon" variant="ghost" onClick={() => handleEditTraining(item)}>
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="text-red-600 hover:text-red-700"
                                                            onClick={() => handleDelete(item.id, 'treinamento')}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </motion.div>
    );
};

export default GestaoPessoasTab;