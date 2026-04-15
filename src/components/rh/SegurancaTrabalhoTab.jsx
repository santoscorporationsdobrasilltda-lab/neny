import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
    ShieldAlert,
    HardHat,
    FileText,
    Save,
    Trash2,
    Search,
    Edit,
    X,
} from 'lucide-react';
import { PdfGenerator } from '@/utils/PdfGenerator';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';

const today = new Date().toISOString().split('T')[0];

const initialAcidenteForm = {
    id: '',
    funcionario_id: '',
    data_acidente: today,
    hora_acidente: '',
    local: '',
    tipo: 'Típico',
    parte_corpo: '',
    descricao: '',
    severidade: 'Leve',
    relatorio: '',
    dias_afastamento: 0,
    status: 'Aberto',
    cat_emitida: false,
};

const initialEpiForm = {
    id: '',
    funcionario_id: '',
    nome_epi: '',
    ca_numero: '',
    data_entrega: today,
    quantidade: 1,
    validade: '',
    status: 'Entregue',
    observacoes: '',
};

const initialAsoForm = {
    id: '',
    funcionario_id: '',
    tipo_aso: 'Periódico',
    data_exame: today,
    data_validade: '',
    clinica: '',
    medico: '',
    resultado: 'Apto',
    observacoes: '',
};

const formatDate = (value) => {
    if (!value) return '-';
    return new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR');
};

const daysUntil = (date) => {
    if (!date) return null;
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const target = new Date(`${date}T00:00:00`);
    const diff = target.getTime() - todayDate.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const SegurancaTrabalhoTab = () => {
    const { toast } = useToast();
    const { user } = useAuth();

    const {
        data: funcionarios,
        loading: loadingFuncionarios,
        fetchAll: fetchFuncionarios,
    } = useSupabaseCrud('rh_funcionarios');

    const {
        data: acidentes,
        loading: loadingAcidentes,
        fetchAll: fetchAcidentes,
        create: createAcidente,
        update: updateAcidente,
        remove: removeAcidente,
    } = useSupabaseCrud('rh_sst_acidentes');

    const {
        data: epis,
        loading: loadingEpis,
        fetchAll: fetchEpis,
        create: createEpi,
        update: updateEpi,
        remove: removeEpi,
    } = useSupabaseCrud('rh_sst_epis');

    const {
        data: asos,
        loading: loadingAsos,
        fetchAll: fetchAsos,
        create: createAso,
        update: updateAso,
        remove: removeAso,
    } = useSupabaseCrud('rh_sst_aso');

    const [activeTab, setActiveTab] = useState('acidentes');
    const [searchTerm, setSearchTerm] = useState('');
    const [acidenteForm, setAcidenteForm] = useState(initialAcidenteForm);
    const [epiForm, setEpiForm] = useState(initialEpiForm);
    const [asoForm, setAsoForm] = useState(initialAsoForm);

    useEffect(() => {
        if (user) {
            fetchFuncionarios(1, 1000);
            fetchAcidentes(1, 1000);
            fetchEpis(1, 1000);
            fetchAsos(1, 1000);
        }
    }, [user, fetchFuncionarios, fetchAcidentes, fetchEpis, fetchAsos]);

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

    const resetAcidenteForm = () => setAcidenteForm(initialAcidenteForm);
    const resetEpiForm = () => setEpiForm(initialEpiForm);
    const resetAsoForm = () => setAsoForm(initialAsoForm);

    const filteredAcidentes = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();

        return [...acidentes]
            .filter((item) => {
                const nome = getFuncionarioNome(item.funcionario_id).toLowerCase();
                return (
                    nome.includes(term) ||
                    (item.descricao || '').toLowerCase().includes(term) ||
                    (item.local || '').toLowerCase().includes(term) ||
                    (item.severidade || '').toLowerCase().includes(term) ||
                    (item.status || '').toLowerCase().includes(term)
                );
            })
            .sort((a, b) => new Date(b.data_acidente) - new Date(a.data_acidente));
    }, [acidentes, funcionarios, searchTerm]);

    const filteredEpis = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();

        return [...epis]
            .filter((item) => {
                const nome = getFuncionarioNome(item.funcionario_id).toLowerCase();
                return (
                    nome.includes(term) ||
                    (item.nome_epi || '').toLowerCase().includes(term) ||
                    (item.ca_numero || '').toLowerCase().includes(term) ||
                    (item.status || '').toLowerCase().includes(term)
                );
            })
            .sort((a, b) => new Date(b.data_entrega) - new Date(a.data_entrega));
    }, [epis, funcionarios, searchTerm]);

    const filteredAsos = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();

        return [...asos]
            .filter((item) => {
                const nome = getFuncionarioNome(item.funcionario_id).toLowerCase();
                return (
                    nome.includes(term) ||
                    (item.tipo_aso || '').toLowerCase().includes(term) ||
                    (item.resultado || '').toLowerCase().includes(term) ||
                    (item.clinica || '').toLowerCase().includes(term) ||
                    (item.medico || '').toLowerCase().includes(term)
                );
            })
            .sort((a, b) => new Date(b.data_exame) - new Date(a.data_exame));
    }, [asos, funcionarios, searchTerm]);

    const summary = useMemo(() => {
        const asosAVencer = asos.filter((item) => {
            const dias = daysUntil(item.data_validade);
            return dias !== null && dias >= 0 && dias <= 30;
        }).length;

        const episVencendo = epis.filter((item) => {
            const dias = daysUntil(item.validade);
            return dias !== null && dias >= 0 && dias <= 30;
        }).length;

        const acidentesAbertos = acidentes.filter(
            (item) => (item.status || '').toLowerCase() !== 'fechado'
        ).length;

        return {
            acidentesAbertos,
            episVencendo,
            asosAVencer,
        };
    }, [acidentes, epis, asos]);

    const loading =
        loadingFuncionarios ||
        loadingAcidentes ||
        loadingEpis ||
        loadingAsos;

    const handleDelete = async (id, type) => {
        const confirmed = window.confirm(`Deseja realmente excluir este registro de ${type}?`);
        if (!confirmed) return;

        if (type === 'acidente') {
            const success = await removeAcidente(id);
            if (success) await fetchAcidentes(1, 1000);
            return;
        }

        if (type === 'epi') {
            const success = await removeEpi(id);
            if (success) await fetchEpis(1, 1000);
            return;
        }

        const success = await removeAso(id);
        if (success) await fetchAsos(1, 1000);
    };

    const handleEditAcidente = (item) => {
        setAcidenteForm({
            id: item.id,
            funcionario_id: item.funcionario_id || '',
            data_acidente: item.data_acidente || today,
            hora_acidente: item.hora_acidente || '',
            local: item.local || '',
            tipo: item.tipo || 'Típico',
            parte_corpo: item.parte_corpo || '',
            descricao: item.descricao || '',
            severidade: item.severidade || 'Leve',
            relatorio: item.relatorio || '',
            dias_afastamento: item.dias_afastamento ?? 0,
            status: item.status || 'Aberto',
            cat_emitida: !!item.cat_emitida,
        });
        setActiveTab('acidentes');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleEditEpi = (item) => {
        setEpiForm({
            id: item.id,
            funcionario_id: item.funcionario_id || '',
            nome_epi: item.nome_epi || '',
            ca_numero: item.ca_numero || '',
            data_entrega: item.data_entrega || today,
            quantidade: item.quantidade ?? 1,
            validade: item.validade || '',
            status: item.status || 'Entregue',
            observacoes: item.observacoes || '',
        });
        setActiveTab('epis');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleEditAso = (item) => {
        setAsoForm({
            id: item.id,
            funcionario_id: item.funcionario_id || '',
            tipo_aso: item.tipo_aso || 'Periódico',
            data_exame: item.data_exame || today,
            data_validade: item.data_validade || '',
            clinica: item.clinica || '',
            medico: item.medico || '',
            resultado: item.resultado || 'Apto',
            observacoes: item.observacoes || '',
        });
        setActiveTab('aso');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmitAcidente = async (e) => {
        e.preventDefault();

        if (!user) {
            toast({
                title: 'Erro',
                description: 'Usuário não autenticado.',
                variant: 'destructive',
            });
            return;
        }

        if (!acidenteForm.funcionario_id || !acidenteForm.data_acidente || !acidenteForm.descricao) {
            toast({
                title: 'Erro',
                description: 'Selecione o colaborador e preencha data e descrição do acidente.',
                variant: 'destructive',
            });
            return;
        }

        const payload = {
            user_id: user.id,
            funcionario_id: acidenteForm.funcionario_id,
            data_acidente: acidenteForm.data_acidente,
            hora_acidente: acidenteForm.hora_acidente || null,
            local: acidenteForm.local || null,
            tipo: acidenteForm.tipo || 'Típico',
            parte_corpo: acidenteForm.parte_corpo || null,
            descricao: acidenteForm.descricao,
            severidade: acidenteForm.severidade || 'Leve',
            relatorio: acidenteForm.relatorio || null,
            dias_afastamento: Number(acidenteForm.dias_afastamento || 0),
            status: acidenteForm.status || 'Aberto',
            cat_emitida: !!acidenteForm.cat_emitida,
            updated_at: new Date().toISOString(),
        };

        const saved = acidenteForm.id
            ? await updateAcidente(acidenteForm.id, payload)
            : await createAcidente(payload);

        if (saved) {
            await fetchAcidentes(1, 1000);
            resetAcidenteForm();
        }
    };

    const handleSubmitEpi = async (e) => {
        e.preventDefault();

        if (!user) {
            toast({
                title: 'Erro',
                description: 'Usuário não autenticado.',
                variant: 'destructive',
            });
            return;
        }

        if (!epiForm.funcionario_id || !epiForm.nome_epi || !epiForm.data_entrega) {
            toast({
                title: 'Erro',
                description: 'Selecione o colaborador e preencha EPI e data de entrega.',
                variant: 'destructive',
            });
            return;
        }

        const payload = {
            user_id: user.id,
            funcionario_id: epiForm.funcionario_id,
            nome_epi: epiForm.nome_epi,
            ca_numero: epiForm.ca_numero || null,
            data_entrega: epiForm.data_entrega,
            quantidade: Number(epiForm.quantidade || 1),
            validade: epiForm.validade || null,
            status: epiForm.status || 'Entregue',
            observacoes: epiForm.observacoes || null,
            updated_at: new Date().toISOString(),
        };

        const saved = epiForm.id
            ? await updateEpi(epiForm.id, payload)
            : await createEpi(payload);

        if (saved) {
            await fetchEpis(1, 1000);
            resetEpiForm();
        }
    };

    const handleSubmitAso = async (e) => {
        e.preventDefault();

        if (!user) {
            toast({
                title: 'Erro',
                description: 'Usuário não autenticado.',
                variant: 'destructive',
            });
            return;
        }

        if (!asoForm.funcionario_id || !asoForm.tipo_aso || !asoForm.data_exame) {
            toast({
                title: 'Erro',
                description: 'Selecione o colaborador e preencha tipo e data do ASO.',
                variant: 'destructive',
            });
            return;
        }

        const payload = {
            user_id: user.id,
            funcionario_id: asoForm.funcionario_id,
            tipo_aso: asoForm.tipo_aso,
            data_exame: asoForm.data_exame,
            data_validade: asoForm.data_validade || null,
            clinica: asoForm.clinica || null,
            medico: asoForm.medico || null,
            resultado: asoForm.resultado || 'Apto',
            observacoes: asoForm.observacoes || null,
            updated_at: new Date().toISOString(),
        };

        const saved = asoForm.id
            ? await updateAso(asoForm.id, payload)
            : await createAso(payload);

        if (saved) {
            await fetchAsos(1, 1000);
            resetAsoForm();
        }
    };

    const gerarPdfCAT = async (acidente) => {
        const colaborador = getFuncionarioNome(acidente.funcionario_id);
        const funcionario = funcionarios.find((item) => item.id === acidente.funcionario_id) || { nome: colaborador };

        PdfGenerator.generateCAT(acidente, funcionario);

        if (!acidente.cat_emitida) {
            await updateAcidente(acidente.id, {
                cat_emitida: true,
                updated_at: new Date().toISOString(),
            });
            await fetchAcidentes(1, 1000);
        }

        toast({
            title: 'CAT gerada',
            description: 'O PDF foi gerado com sucesso.',
        });
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {funcionariosOrdenados.length === 0 && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4">
                    Cadastre pelo menos um funcionário no módulo de RH para usar SST, EPIs e ASO.
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                    <div className="text-sm text-slate-500 mb-1">Acidentes em aberto</div>
                    <div className="text-2xl font-bold text-slate-800">{summary.acidentesAbertos}</div>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                    <div className="text-sm text-slate-500 mb-1">EPIs vencendo em 30 dias</div>
                    <div className="text-2xl font-bold text-slate-800">{summary.episVencendo}</div>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                    <div className="text-sm text-slate-500 mb-1">ASOs a vencer em 30 dias</div>
                    <div className="text-2xl font-bold text-slate-800">{summary.asosAVencer}</div>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-white p-2 rounded-xl mb-6 overflow-x-auto flex justify-start h-auto gap-2 border border-slate-200 shadow-sm">
                    <TabsTrigger value="acidentes" className="data-[state=active]:bg-red-600 data-[state=active]:text-white rounded-lg">
                        <ShieldAlert className="w-4 h-4 mr-2" />
                        Acidentes & CAT
                    </TabsTrigger>
                    <TabsTrigger value="epis" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white rounded-lg">
                        <HardHat className="w-4 h-4 mr-2" />
                        Gestão de EPIs
                    </TabsTrigger>
                    <TabsTrigger value="aso" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg">
                        <FileText className="w-4 h-4 mr-2" />
                        ASO & Exames
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="acidentes" className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-slate-800">
                                {acidenteForm.id ? 'Editar acidente' : 'Registrar acidente'}
                            </h3>

                            {acidenteForm.id && (
                                <Button variant="ghost" onClick={resetAcidenteForm}>
                                    <X className="w-4 h-4 mr-2" />
                                    Cancelar
                                </Button>
                            )}
                        </div>

                        <form onSubmit={handleSubmitAcidente} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <select
                                className="p-2 border rounded"
                                value={acidenteForm.funcionario_id}
                                onChange={(e) =>
                                    setAcidenteForm({ ...acidenteForm, funcionario_id: e.target.value })
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
                                value={acidenteForm.data_acidente}
                                onChange={(e) =>
                                    setAcidenteForm({ ...acidenteForm, data_acidente: e.target.value })
                                }
                                required
                            />

                            <input
                                type="time"
                                className="p-2 border rounded"
                                value={acidenteForm.hora_acidente}
                                onChange={(e) =>
                                    setAcidenteForm({ ...acidenteForm, hora_acidente: e.target.value })
                                }
                            />

                            <input
                                className="p-2 border rounded"
                                placeholder="Local"
                                value={acidenteForm.local}
                                onChange={(e) =>
                                    setAcidenteForm({ ...acidenteForm, local: e.target.value })
                                }
                            />

                            <select
                                className="p-2 border rounded"
                                value={acidenteForm.tipo}
                                onChange={(e) =>
                                    setAcidenteForm({ ...acidenteForm, tipo: e.target.value })
                                }
                            >
                                <option value="Típico">Típico</option>
                                <option value="Trajeto">Trajeto</option>
                                <option value="Doença Ocupacional">Doença Ocupacional</option>
                            </select>

                            <select
                                className="p-2 border rounded"
                                value={acidenteForm.severidade}
                                onChange={(e) =>
                                    setAcidenteForm({ ...acidenteForm, severidade: e.target.value })
                                }
                            >
                                <option value="Leve">Leve</option>
                                <option value="Moderado">Moderado</option>
                                <option value="Grave">Grave</option>
                                <option value="Fatal">Fatal</option>
                            </select>

                            <input
                                className="p-2 border rounded"
                                placeholder="Parte do corpo atingida"
                                value={acidenteForm.parte_corpo}
                                onChange={(e) =>
                                    setAcidenteForm({ ...acidenteForm, parte_corpo: e.target.value })
                                }
                            />

                            <input
                                type="number"
                                min="0"
                                className="p-2 border rounded"
                                placeholder="Dias de afastamento"
                                value={acidenteForm.dias_afastamento}
                                onChange={(e) =>
                                    setAcidenteForm({ ...acidenteForm, dias_afastamento: e.target.value })
                                }
                            />

                            <select
                                className="p-2 border rounded"
                                value={acidenteForm.status}
                                onChange={(e) =>
                                    setAcidenteForm({ ...acidenteForm, status: e.target.value })
                                }
                            >
                                <option value="Aberto">Aberto</option>
                                <option value="Investigando">Investigando</option>
                                <option value="Fechado">Fechado</option>
                            </select>

                            <textarea
                                className="p-2 border rounded md:col-span-3"
                                rows={3}
                                placeholder="Descrição do acidente *"
                                value={acidenteForm.descricao}
                                onChange={(e) =>
                                    setAcidenteForm({ ...acidenteForm, descricao: e.target.value })
                                }
                                required
                            />

                            <textarea
                                className="p-2 border rounded md:col-span-3"
                                rows={3}
                                placeholder="Relatório / providências"
                                value={acidenteForm.relatorio}
                                onChange={(e) =>
                                    setAcidenteForm({ ...acidenteForm, relatorio: e.target.value })
                                }
                            />

                            <div className="md:col-span-3 flex justify-end gap-2">
                                {acidenteForm.id && (
                                    <Button type="button" variant="outline" onClick={resetAcidenteForm}>
                                        Cancelar
                                    </Button>
                                )}
                                <Button type="submit" className="bg-red-600 hover:bg-red-700">
                                    <Save className="w-4 h-4 mr-2" />
                                    {acidenteForm.id ? 'Salvar alterações' : 'Salvar registro'}
                                </Button>
                            </div>
                        </form>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                            <h4 className="text-lg font-semibold text-slate-800">Histórico de acidentes</h4>

                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    className="w-full pl-10 pr-3 py-2 border rounded-lg"
                                    placeholder="Buscar acidente..."
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
                                        <th className="p-3 font-semibold">Local</th>
                                        <th className="p-3 font-semibold">Severidade</th>
                                        <th className="p-3 font-semibold">Status</th>
                                        <th className="p-3 font-semibold">CAT</th>
                                        <th className="p-3 font-semibold">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={7} className="p-6 text-center text-slate-500">
                                                Carregando...
                                            </td>
                                        </tr>
                                    ) : filteredAcidentes.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="p-6 text-center text-slate-500">
                                                Nenhum acidente encontrado.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredAcidentes.map((item) => (
                                            <tr key={item.id} className="border-b last:border-b-0 align-top">
                                                <td className="p-3 font-medium text-slate-800">
                                                    {getFuncionarioNome(item.funcionario_id)}
                                                    <div className="text-xs text-slate-500 mt-1">
                                                        {item.descricao || '-'}
                                                    </div>
                                                </td>
                                                <td className="p-3 text-slate-700">
                                                    {formatDate(item.data_acidente)}
                                                    <div className="text-xs text-slate-500 mt-1">
                                                        {item.hora_acidente || '-'}
                                                    </div>
                                                </td>
                                                <td className="p-3 text-slate-700">{item.local || '-'}</td>
                                                <td className="p-3 text-slate-700">{item.severidade || '-'}</td>
                                                <td className="p-3 text-slate-700">{item.status || '-'}</td>
                                                <td className="p-3 text-slate-700">
                                                    {item.cat_emitida ? 'Emitida' : 'Pendente'}
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex flex-wrap gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => gerarPdfCAT(item)}
                                                        >
                                                            <FileText className="w-4 h-4 mr-2" />
                                                            Gerar CAT
                                                        </Button>

                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            onClick={() => handleEditAcidente(item)}
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Button>

                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="text-red-600 hover:text-red-700"
                                                            onClick={() => handleDelete(item.id, 'acidente')}
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

                <TabsContent value="epis" className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-slate-800">
                                {epiForm.id ? 'Editar entrega de EPI' : 'Registrar entrega de EPI'}
                            </h3>

                            {epiForm.id && (
                                <Button variant="ghost" onClick={resetEpiForm}>
                                    <X className="w-4 h-4 mr-2" />
                                    Cancelar
                                </Button>
                            )}
                        </div>

                        <form onSubmit={handleSubmitEpi} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <select
                                className="p-2 border rounded"
                                value={epiForm.funcionario_id}
                                onChange={(e) =>
                                    setEpiForm({ ...epiForm, funcionario_id: e.target.value })
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
                                placeholder="Nome do EPI *"
                                value={epiForm.nome_epi}
                                onChange={(e) =>
                                    setEpiForm({ ...epiForm, nome_epi: e.target.value })
                                }
                                required
                            />

                            <input
                                className="p-2 border rounded"
                                placeholder="Número do CA"
                                value={epiForm.ca_numero}
                                onChange={(e) =>
                                    setEpiForm({ ...epiForm, ca_numero: e.target.value })
                                }
                            />

                            <input
                                type="date"
                                className="p-2 border rounded"
                                value={epiForm.data_entrega}
                                onChange={(e) =>
                                    setEpiForm({ ...epiForm, data_entrega: e.target.value })
                                }
                                required
                            />

                            <input
                                type="number"
                                min="1"
                                className="p-2 border rounded"
                                placeholder="Quantidade"
                                value={epiForm.quantidade}
                                onChange={(e) =>
                                    setEpiForm({ ...epiForm, quantidade: e.target.value })
                                }
                            />

                            <input
                                type="date"
                                className="p-2 border rounded"
                                value={epiForm.validade}
                                onChange={(e) =>
                                    setEpiForm({ ...epiForm, validade: e.target.value })
                                }
                            />

                            <select
                                className="p-2 border rounded"
                                value={epiForm.status}
                                onChange={(e) =>
                                    setEpiForm({ ...epiForm, status: e.target.value })
                                }
                            >
                                <option value="Entregue">Entregue</option>
                                <option value="Em uso">Em uso</option>
                                <option value="Substituído">Substituído</option>
                                <option value="Vencido">Vencido</option>
                            </select>

                            <textarea
                                className="p-2 border rounded md:col-span-3"
                                rows={3}
                                placeholder="Observações"
                                value={epiForm.observacoes}
                                onChange={(e) =>
                                    setEpiForm({ ...epiForm, observacoes: e.target.value })
                                }
                            />

                            <div className="md:col-span-3 flex justify-end gap-2">
                                {epiForm.id && (
                                    <Button type="button" variant="outline" onClick={resetEpiForm}>
                                        Cancelar
                                    </Button>
                                )}
                                <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
                                    <Save className="w-4 h-4 mr-2" />
                                    {epiForm.id ? 'Salvar alterações' : 'Salvar entrega'}
                                </Button>
                            </div>
                        </form>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                            <h4 className="text-lg font-semibold text-slate-800">Entregas de EPI</h4>

                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    className="w-full pl-10 pr-3 py-2 border rounded-lg"
                                    placeholder="Buscar EPI..."
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
                                        <th className="p-3 font-semibold">EPI</th>
                                        <th className="p-3 font-semibold">Entrega</th>
                                        <th className="p-3 font-semibold">Validade</th>
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
                                    ) : filteredEpis.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="p-6 text-center text-slate-500">
                                                Nenhum EPI encontrado.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredEpis.map((item) => {
                                            const dias = daysUntil(item.validade);

                                            return (
                                                <tr key={item.id} className="border-b last:border-b-0">
                                                    <td className="p-3 font-medium text-slate-800">
                                                        {getFuncionarioNome(item.funcionario_id)}
                                                    </td>
                                                    <td className="p-3 text-slate-700">
                                                        <div className="font-medium">{item.nome_epi}</div>
                                                        <div className="text-xs text-slate-500">
                                                            CA: {item.ca_numero || '-'} • Qtd: {item.quantidade || 1}
                                                        </div>
                                                    </td>
                                                    <td className="p-3 text-slate-700">
                                                        {formatDate(item.data_entrega)}
                                                    </td>
                                                    <td className="p-3 text-slate-700">
                                                        {item.validade ? formatDate(item.validade) : '-'}
                                                        <div className="text-xs text-slate-500 mt-1">
                                                            {dias === null
                                                                ? ''
                                                                : dias < 0
                                                                    ? 'Vencido'
                                                                    : `${dias} dia(s)`}
                                                        </div>
                                                    </td>
                                                    <td className="p-3 text-slate-700">{item.status || '-'}</td>
                                                    <td className="p-3">
                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                onClick={() => handleEditEpi(item)}
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="text-red-600 hover:text-red-700"
                                                                onClick={() => handleDelete(item.id, 'epi')}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="aso" className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-slate-800">
                                {asoForm.id ? 'Editar ASO' : 'Registrar ASO'}
                            </h3>

                            {asoForm.id && (
                                <Button variant="ghost" onClick={resetAsoForm}>
                                    <X className="w-4 h-4 mr-2" />
                                    Cancelar
                                </Button>
                            )}
                        </div>

                        <form onSubmit={handleSubmitAso} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <select
                                className="p-2 border rounded"
                                value={asoForm.funcionario_id}
                                onChange={(e) =>
                                    setAsoForm({ ...asoForm, funcionario_id: e.target.value })
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

                            <select
                                className="p-2 border rounded"
                                value={asoForm.tipo_aso}
                                onChange={(e) =>
                                    setAsoForm({ ...asoForm, tipo_aso: e.target.value })
                                }
                            >
                                <option value="Admissional">Admissional</option>
                                <option value="Periódico">Periódico</option>
                                <option value="Retorno ao Trabalho">Retorno ao Trabalho</option>
                                <option value="Mudança de Função">Mudança de Função</option>
                                <option value="Demissional">Demissional</option>
                            </select>

                            <select
                                className="p-2 border rounded"
                                value={asoForm.resultado}
                                onChange={(e) =>
                                    setAsoForm({ ...asoForm, resultado: e.target.value })
                                }
                            >
                                <option value="Apto">Apto</option>
                                <option value="Apto com restrição">Apto com restrição</option>
                                <option value="Inapto">Inapto</option>
                            </select>

                            <input
                                type="date"
                                className="p-2 border rounded"
                                value={asoForm.data_exame}
                                onChange={(e) =>
                                    setAsoForm({ ...asoForm, data_exame: e.target.value })
                                }
                                required
                            />

                            <input
                                type="date"
                                className="p-2 border rounded"
                                value={asoForm.data_validade}
                                onChange={(e) =>
                                    setAsoForm({ ...asoForm, data_validade: e.target.value })
                                }
                            />

                            <input
                                className="p-2 border rounded"
                                placeholder="Clínica"
                                value={asoForm.clinica}
                                onChange={(e) =>
                                    setAsoForm({ ...asoForm, clinica: e.target.value })
                                }
                            />

                            <input
                                className="p-2 border rounded"
                                placeholder="Médico responsável"
                                value={asoForm.medico}
                                onChange={(e) =>
                                    setAsoForm({ ...asoForm, medico: e.target.value })
                                }
                            />

                            <textarea
                                className="p-2 border rounded md:col-span-3"
                                rows={3}
                                placeholder="Observações"
                                value={asoForm.observacoes}
                                onChange={(e) =>
                                    setAsoForm({ ...asoForm, observacoes: e.target.value })
                                }
                            />

                            <div className="md:col-span-3 flex justify-end gap-2">
                                {asoForm.id && (
                                    <Button type="button" variant="outline" onClick={resetAsoForm}>
                                        Cancelar
                                    </Button>
                                )}
                                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                                    <Save className="w-4 h-4 mr-2" />
                                    {asoForm.id ? 'Salvar alterações' : 'Salvar ASO'}
                                </Button>
                            </div>
                        </form>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                            <h4 className="text-lg font-semibold text-slate-800">Controle de ASO</h4>

                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    className="w-full pl-10 pr-3 py-2 border rounded-lg"
                                    placeholder="Buscar ASO..."
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
                                        <th className="p-3 font-semibold">Tipo</th>
                                        <th className="p-3 font-semibold">Exame</th>
                                        <th className="p-3 font-semibold">Validade</th>
                                        <th className="p-3 font-semibold">Resultado</th>
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
                                    ) : filteredAsos.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="p-6 text-center text-slate-500">
                                                Nenhum ASO encontrado.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredAsos.map((item) => {
                                            const dias = daysUntil(item.data_validade);

                                            return (
                                                <tr key={item.id} className="border-b last:border-b-0">
                                                    <td className="p-3 font-medium text-slate-800">
                                                        {getFuncionarioNome(item.funcionario_id)}
                                                    </td>
                                                    <td className="p-3 text-slate-700">{item.tipo_aso || '-'}</td>
                                                    <td className="p-3 text-slate-700">
                                                        {formatDate(item.data_exame)}
                                                        <div className="text-xs text-slate-500 mt-1">
                                                            {item.clinica || '-'}
                                                        </div>
                                                    </td>
                                                    <td className="p-3 text-slate-700">
                                                        {item.data_validade ? formatDate(item.data_validade) : '-'}
                                                        <div className="text-xs text-slate-500 mt-1">
                                                            {dias === null
                                                                ? ''
                                                                : dias < 0
                                                                    ? 'Vencido'
                                                                    : `${dias} dia(s)`}
                                                        </div>
                                                    </td>
                                                    <td className="p-3 text-slate-700">
                                                        {item.resultado || '-'}
                                                        <div className="text-xs text-slate-500 mt-1">
                                                            {item.medico || '-'}
                                                        </div>
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                onClick={() => handleEditAso(item)}
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="text-red-600 hover:text-red-700"
                                                                onClick={() => handleDelete(item.id, 'aso')}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
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

export default SegurancaTrabalhoTab;