import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
    FileText,
    Calculator,
    Search,
    Plus,
    Trash2,
    Edit,
    X,
    Users,
    Wallet,
    BadgeDollarSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { PdfGenerator } from '@/utils/PdfGenerator';
import { CalculosFinanceiros } from '@/utils/CalculosFinanceiros';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/customSupabaseClient';

const now = new Date();
const currentMonth = now.getMonth() + 1;
const currentYear = now.getFullYear();
const today = now.toISOString().split('T')[0];

const initialForm = {
    id: '',
    funcionario_id: '',
    mes: currentMonth,
    ano: currentYear,
    salario_base: '',
    proventos: 0,
    descontos: 0,
    data_pagamento: today,
    status: 'Processada',
    observacoes: '',
};

const monthOptions = [
    { value: 1, label: '01' },
    { value: 2, label: '02' },
    { value: 3, label: '03' },
    { value: 4, label: '04' },
    { value: 5, label: '05' },
    { value: 6, label: '06' },
    { value: 7, label: '07' },
    { value: 8, label: '08' },
    { value: 9, label: '09' },
    { value: 10, label: '10' },
    { value: 11, label: '11' },
    { value: 12, label: '12' },
];

const formatCurrency = (value) => {
    const number = Number(value || 0);
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(number);
};

const formatCompetencia = (mes, ano) => {
    return `${String(mes).padStart(2, '0')}/${ano}`;
};

const FolhaPagamentoTab = () => {
    const { toast } = useToast();
    const { user } = useAuth();

    const {
        data: folhas,
        loading: loadingFolhas,
        fetchAll: fetchFolhas,
        create,
        update,
        remove,
    } = useSupabaseCrud('rh_folha_pagamento');

    const {
        data: funcionarios,
        loading: loadingFuncionarios,
        fetchAll: fetchFuncionarios,
    } = useSupabaseCrud('rh_funcionarios');

    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState(initialForm);
    const [selectedMes, setSelectedMes] = useState(currentMonth);
    const [selectedAno, setSelectedAno] = useState(currentYear);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (user) {
            fetchFolhas(1, 1000);
            fetchFuncionarios(1, 1000);
        }
    }, [user, fetchFolhas, fetchFuncionarios]);

    const funcionariosOrdenados = useMemo(() => {
        return [...funcionarios].sort((a, b) =>
            (a.nome || '').localeCompare(b.nome || '', 'pt-BR')
        );
    }, [funcionarios]);

    const funcionariosAtivos = useMemo(() => {
        return funcionariosOrdenados.filter(
            (item) => !item.status || item.status.toLowerCase() !== 'inativo'
        );
    }, [funcionariosOrdenados]);

    const getFuncionario = (funcionarioId) => {
        return funcionarios.find((item) => item.id === funcionarioId);
    };

    const calcularValores = (dados) => {
        const salarioBase = Number(dados.salario_base || 0);
        const proventos = Number(dados.proventos || 0);
        const descontosExtras = Number(dados.descontos || 0);

        const bruto = salarioBase + proventos;
        const inss = CalculosFinanceiros.calcularINSS(bruto);
        const baseIrrf = Math.max(0, bruto - inss);
        const irrf = CalculosFinanceiros.calcularIRRF(baseIrrf);
        const fgts = CalculosFinanceiros.calcularFGTS(bruto);
        const liquido = Number((bruto - inss - irrf - descontosExtras).toFixed(2));

        return {
            salarioBase,
            proventos,
            bruto,
            inss,
            irrf,
            fgts,
            descontosExtras,
            liquido,
        };
    };

    const calculoAtual = useMemo(() => calcularValores(formData), [formData]);

    const resetForm = () => {
        setFormData({
            ...initialForm,
            mes: selectedMes,
            ano: selectedAno,
        });
    };

    const folhasFiltradas = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();

        return [...folhas]
            .filter((item) => Number(item.mes) === Number(selectedMes) && Number(item.ano) === Number(selectedAno))
            .filter((item) => {
                const funcionario = getFuncionario(item.funcionario_id);
                const nome = funcionario?.nome?.toLowerCase() || '';
                const cargo = funcionario?.cargo?.toLowerCase() || '';
                const status = (item.status || '').toLowerCase();

                return (
                    nome.includes(term) ||
                    cargo.includes(term) ||
                    status.includes(term) ||
                    formatCompetencia(item.mes, item.ano).includes(term)
                );
            })
            .sort((a, b) => {
                const nomeA = getFuncionario(a.funcionario_id)?.nome || '';
                const nomeB = getFuncionario(b.funcionario_id)?.nome || '';
                return nomeA.localeCompare(nomeB, 'pt-BR');
            });
    }, [folhas, searchTerm, selectedMes, selectedAno, funcionarios]);

    const totais = useMemo(() => {
        return folhasFiltradas.reduce(
            (acc, item) => {
                acc.bruto += Number(item.salario_base || 0) + Number(item.proventos || 0);
                acc.liquido += Number(item.liquido || 0);
                acc.fgts += Number(item.fgts || 0);
                return acc;
            },
            { bruto: 0, liquido: 0, fgts: 0 }
        );
    }, [folhasFiltradas]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            toast({
                title: 'Erro',
                description: 'Usuário não autenticado.',
                variant: 'destructive',
            });
            return;
        }

        if (!formData.funcionario_id || !formData.mes || !formData.ano) {
            toast({
                title: 'Erro',
                description: 'Selecione o colaborador e a competência.',
                variant: 'destructive',
            });
            return;
        }

        const duplicado = folhas.find(
            (item) =>
                item.id !== formData.id &&
                item.funcionario_id === formData.funcionario_id &&
                Number(item.mes) === Number(formData.mes) &&
                Number(item.ano) === Number(formData.ano)
        );

        if (duplicado) {
            toast({
                title: 'Registro duplicado',
                description: 'Já existe uma folha para este colaborador nesta competência.',
                variant: 'destructive',
            });
            return;
        }

        const valores = calcularValores(formData);

        const payload = {
            user_id: user.id,
            funcionario_id: formData.funcionario_id,
            mes: Number(formData.mes),
            ano: Number(formData.ano),
            salario_base: valores.salarioBase,
            proventos: valores.proventos,
            descontos: valores.descontosExtras,
            inss: valores.inss,
            irrf: valores.irrf,
            fgts: valores.fgts,
            liquido: valores.liquido,
            data_pagamento: formData.data_pagamento || null,
            status: formData.status || 'Processada',
            observacoes: formData.observacoes || null,
            updated_at: new Date().toISOString(),
        };

        const saved = formData.id
            ? await update(formData.id, payload)
            : await create(payload);

        if (saved) {
            await fetchFolhas(1, 1000);
            resetForm();
        }
    };

    const handleEdit = (folha) => {
        setFormData({
            id: folha.id,
            funcionario_id: folha.funcionario_id || '',
            mes: folha.mes || currentMonth,
            ano: folha.ano || currentYear,
            salario_base: Number(folha.salario_base || 0),
            proventos: Number(folha.proventos || 0),
            descontos: Number(folha.descontos || 0),
            data_pagamento: folha.data_pagamento || today,
            status: folha.status || 'Processada',
            observacoes: folha.observacoes || '',
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm('Deseja realmente excluir esta folha de pagamento?');
        if (!confirmed) return;

        const success = await remove(id);
        if (success) {
            await fetchFolhas(1, 1000);
        }
    };

    const handleProcessMonthly = async () => {
        if (!user) {
            toast({
                title: 'Erro',
                description: 'Usuário não autenticado.',
                variant: 'destructive',
            });
            return;
        }

        if (funcionariosAtivos.length === 0) {
            toast({
                title: 'Sem colaboradores',
                description: 'Cadastre funcionários ativos antes de processar a folha.',
                variant: 'destructive',
            });
            return;
        }

        const existentes = folhas.filter(
            (item) => Number(item.mes) === Number(selectedMes) && Number(item.ano) === Number(selectedAno)
        );

        const funcionariosSemFolha = funcionariosAtivos.filter(
            (funcionario) => !existentes.some((folha) => folha.funcionario_id === funcionario.id)
        );

        if (funcionariosSemFolha.length === 0) {
            toast({
                title: 'Competência já processada',
                description: 'Todos os colaboradores ativos já possuem folha nesta competência.',
            });
            return;
        }

        const payloads = funcionariosSemFolha.map((funcionario) => {
            const salarioBase = Number(funcionario.salario || 0);
            const bruto = salarioBase;
            const inss = CalculosFinanceiros.calcularINSS(bruto);
            const baseIrrf = Math.max(0, bruto - inss);
            const irrf = CalculosFinanceiros.calcularIRRF(baseIrrf);
            const fgts = CalculosFinanceiros.calcularFGTS(bruto);
            const liquido = Number((bruto - inss - irrf).toFixed(2));

            return {
                user_id: user.id,
                funcionario_id: funcionario.id,
                mes: Number(selectedMes),
                ano: Number(selectedAno),
                salario_base: salarioBase,
                proventos: 0,
                descontos: 0,
                inss,
                irrf,
                fgts,
                liquido,
                data_pagamento: null,
                status: 'Processada',
                observacoes: null,
            };
        });

        try {
            setProcessing(true);

            const { error } = await supabase
                .from('rh_folha_pagamento')
                .insert(payloads);

            if (error) throw error;

            await fetchFolhas(1, 1000);

            toast({
                title: 'Folha processada',
                description: `${payloads.length} folha(s) criada(s) para ${formatCompetencia(selectedMes, selectedAno)}.`,
            });
        } catch (err) {
            toast({
                title: 'Erro ao processar folha',
                description: err.message,
                variant: 'destructive',
            });
        } finally {
            setProcessing(false);
        }
    };

    const handleGenerateHolerite = (folha) => {
        const funcionario = getFuncionario(folha.funcionario_id);

        if (!funcionario) {
            toast({
                title: 'Funcionário não encontrado',
                description: 'Não foi possível localizar os dados do colaborador para gerar o holerite.',
                variant: 'destructive',
            });
            return;
        }

        const bruto = Number(folha.salario_base || 0) + Number(folha.proventos || 0);

        const dadosHolerite = {
            competencia: formatCompetencia(folha.mes, folha.ano),
            salario_bruto: bruto.toFixed(2),
            inss: Number(folha.inss || 0).toFixed(2),
            irrf: Number(folha.irrf || 0).toFixed(2),
            fgts: Number(folha.fgts || 0).toFixed(2),
            outros_descontos: Number(folha.descontos || 0).toFixed(2),
            outros_proventos: Number(folha.proventos || 0).toFixed(2),
            salario_liquido: Number(folha.liquido || 0).toFixed(2),
        };

        const funcionarioPdf = {
            nome: funcionario.nome || 'Funcionário',
            id: funcionario.cpf || funcionario.id,
            cargo: funcionario.cargo || '',
            departamento: '',
            dataAdmissao: funcionario.data_admissao || '',
        };

        PdfGenerator.generateHolerite(funcionarioPdf, dadosHolerite);

        toast({
            title: 'Holerite gerado',
            description: 'O PDF foi gerado com sucesso.',
        });
    };

    const loading = loadingFolhas || loadingFuncionarios;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {funcionariosAtivos.length === 0 && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4">
                    Não há funcionários ativos cadastrados no RH para processar a folha.
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-500">Folhas da competência</span>
                        <FileText className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold text-slate-800">{folhasFiltradas.length}</div>
                    <div className="text-sm text-slate-500 mt-1">
                        {formatCompetencia(selectedMes, selectedAno)}
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-500">Total bruto</span>
                        <BadgeDollarSign className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div className="text-2xl font-bold text-slate-800">
                        {formatCurrency(totais.bruto)}
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-500">Total líquido</span>
                        <Wallet className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold text-slate-800">
                        {formatCurrency(totais.liquido)}
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">Processamento mensal</h3>
                        <p className="text-sm text-slate-500">
                            Gere automaticamente a folha dos funcionários ativos para a competência selecionada.
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-3">
                        <select
                            className="p-2 border rounded-lg"
                            value={selectedMes}
                            onChange={(e) => setSelectedMes(Number(e.target.value))}
                        >
                            {monthOptions.map((month) => (
                                <option key={month.value} value={month.value}>
                                    {month.label}
                                </option>
                            ))}
                        </select>

                        <input
                            type="number"
                            className="p-2 border rounded-lg w-full md:w-32"
                            value={selectedAno}
                            onChange={(e) => setSelectedAno(Number(e.target.value))}
                        />

                        <Button
                            onClick={handleProcessMonthly}
                            className="bg-green-600 hover:bg-green-700"
                            disabled={processing}
                        >
                            <Calculator className="w-4 h-4 mr-2" />
                            {processing ? 'Processando...' : 'Processar folha mensal'}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-slate-800">
                        {formData.id ? 'Editar folha individual' : 'Nova folha individual'}
                    </h3>

                    {formData.id && (
                        <Button variant="ghost" onClick={resetForm}>
                            <X className="w-4 h-4 mr-2" />
                            Cancelar
                        </Button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <select
                        className="p-2 border rounded"
                        value={formData.funcionario_id}
                        onChange={(e) => {
                            const funcionario = getFuncionario(e.target.value);
                            setFormData((prev) => ({
                                ...prev,
                                funcionario_id: e.target.value,
                                salario_base: funcionario?.salario ?? prev.salario_base,
                            }));
                        }}
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
                        value={formData.mes}
                        onChange={(e) => setFormData({ ...formData, mes: Number(e.target.value) })}
                        required
                    >
                        {monthOptions.map((month) => (
                            <option key={month.value} value={month.value}>
                                {month.label}
                            </option>
                        ))}
                    </select>

                    <input
                        type="number"
                        className="p-2 border rounded"
                        value={formData.ano}
                        onChange={(e) => setFormData({ ...formData, ano: Number(e.target.value) })}
                        required
                    />

                    <input
                        type="date"
                        className="p-2 border rounded"
                        value={formData.data_pagamento}
                        onChange={(e) => setFormData({ ...formData, data_pagamento: e.target.value })}
                    />

                    <input
                        type="number"
                        step="0.01"
                        className="p-2 border rounded"
                        placeholder="Salário base"
                        value={formData.salario_base}
                        onChange={(e) => setFormData({ ...formData, salario_base: e.target.value })}
                        required
                    />

                    <input
                        type="number"
                        step="0.01"
                        className="p-2 border rounded"
                        placeholder="Proventos"
                        value={formData.proventos}
                        onChange={(e) => setFormData({ ...formData, proventos: e.target.value })}
                    />

                    <input
                        type="number"
                        step="0.01"
                        className="p-2 border rounded"
                        placeholder="Outros descontos"
                        value={formData.descontos}
                        onChange={(e) => setFormData({ ...formData, descontos: e.target.value })}
                    />

                    <select
                        className="p-2 border rounded"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                        <option value="Processada">Processada</option>
                        <option value="Pendente">Pendente</option>
                        <option value="Pago">Pago</option>
                        <option value="Cancelada">Cancelada</option>
                    </select>

                    <textarea
                        className="p-2 border rounded md:col-span-4"
                        rows={3}
                        placeholder="Observações"
                        value={formData.observacoes}
                        onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    />

                    <div className="md:col-span-4 grid grid-cols-1 md:grid-cols-5 gap-3">
                        <div className="bg-slate-50 rounded-lg border p-3">
                            <div className="text-xs text-slate-500">INSS</div>
                            <div className="font-semibold text-slate-800">
                                {formatCurrency(calculoAtual.inss)}
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-lg border p-3">
                            <div className="text-xs text-slate-500">IRRF</div>
                            <div className="font-semibold text-slate-800">
                                {formatCurrency(calculoAtual.irrf)}
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-lg border p-3">
                            <div className="text-xs text-slate-500">FGTS</div>
                            <div className="font-semibold text-slate-800">
                                {formatCurrency(calculoAtual.fgts)}
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-lg border p-3">
                            <div className="text-xs text-slate-500">Bruto</div>
                            <div className="font-semibold text-slate-800">
                                {formatCurrency(calculoAtual.bruto)}
                            </div>
                        </div>

                        <div className="bg-green-50 rounded-lg border border-green-200 p-3">
                            <div className="text-xs text-green-700">Líquido</div>
                            <div className="font-semibold text-green-800">
                                {formatCurrency(calculoAtual.liquido)}
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-4 flex justify-end gap-2">
                        {formData.id && (
                            <Button type="button" variant="outline" onClick={resetForm}>
                                Cancelar
                            </Button>
                        )}

                        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                            <Plus className="w-4 h-4 mr-2" />
                            {formData.id ? 'Salvar alterações' : 'Salvar folha'}
                        </Button>
                    </div>
                </form>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800">Histórico da competência</h3>
                        <p className="text-sm text-slate-500">
                            {formatCompetencia(selectedMes, selectedAno)}
                        </p>
                    </div>

                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            className="w-full pl-10 pr-3 py-2 border rounded-lg"
                            placeholder="Buscar colaborador, cargo ou status..."
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
                                <th className="p-3 font-semibold">Competência</th>
                                <th className="p-3 font-semibold">Bruto</th>
                                <th className="p-3 font-semibold">Líquido</th>
                                <th className="p-3 font-semibold">Pagamento</th>
                                <th className="p-3 font-semibold">Status</th>
                                <th className="p-3 font-semibold text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="p-6 text-center text-slate-500">
                                        Carregando...
                                    </td>
                                </tr>
                            ) : folhasFiltradas.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-6 text-center text-slate-500">
                                        Nenhuma folha encontrada para a competência selecionada.
                                    </td>
                                </tr>
                            ) : (
                                folhasFiltradas.map((folha) => {
                                    const funcionario = getFuncionario(folha.funcionario_id);
                                    const bruto = Number(folha.salario_base || 0) + Number(folha.proventos || 0);

                                    return (
                                        <tr key={folha.id} className="border-b last:border-b-0">
                                            <td className="p-3">
                                                <div className="font-medium text-slate-800">
                                                    {funcionario?.nome || 'Colaborador'}
                                                </div>
                                                <div className="text-sm text-slate-500">
                                                    {funcionario?.cargo || '-'}
                                                </div>
                                            </td>
                                            <td className="p-3 text-slate-700">
                                                {formatCompetencia(folha.mes, folha.ano)}
                                            </td>
                                            <td className="p-3 text-slate-700">
                                                {formatCurrency(bruto)}
                                            </td>
                                            <td className="p-3 text-green-700 font-semibold">
                                                {formatCurrency(folha.liquido)}
                                            </td>
                                            <td className="p-3 text-slate-700">
                                                {folha.data_pagamento
                                                    ? new Date(`${folha.data_pagamento}T12:00:00`).toLocaleDateString('pt-BR')
                                                    : '-'}
                                            </td>
                                            <td className="p-3 text-slate-700">
                                                {folha.status || '-'}
                                            </td>
                                            <td className="p-3">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() => handleEdit(folha)}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>

                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleGenerateHolerite(folha)}
                                                    >
                                                        <FileText className="w-4 h-4 mr-2" />
                                                        Holerite
                                                    </Button>

                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="text-red-600 hover:text-red-700"
                                                        onClick={() => handleDelete(folha.id)}
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
        </motion.div>
    );
};

export default FolhaPagamentoTab;