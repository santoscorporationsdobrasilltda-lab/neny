import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Save, X, UserPlus, Briefcase, Wallet, Calendar, BadgeCheck } from 'lucide-react';

const buildInitialState = (funcionario) => ({
    nome: funcionario?.nome || '',
    cpf: funcionario?.cpf || '',
    cargo: funcionario?.cargo || funcionario?.funcao || '',
    salarioBase: funcionario?.salario ?? funcionario?.salarioBase ?? '',
    dataAdmissao: funcionario?.data_admissao || funcionario?.dataAdmissao || '',
    status: funcionario?.status || 'Ativo',
});

const formatCurrency = (value) =>
    new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(Number(value || 0));

const FuncionarioForm = ({ funcionario, onSave, onClose }) => {
    const [formData, setFormData] = useState(buildInitialState(funcionario));
    const [saving, setSaving] = useState(false);

    const isEditing = Boolean(funcionario?.id);

    const salaryPreview = useMemo(() => formatCurrency(formData.salarioBase), [formData.salarioBase]);

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const ok = await onSave?.(formData);
            if (!ok) setSaving(false);
        } catch (error) {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.18 }}
                className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 text-[#1e3a8a] font-semibold text-sm mb-2">
                                <UserPlus className="w-4 h-4" />
                                Cadastro de colaborador
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">
                                {isEditing ? 'Editar funcionário' : 'Novo funcionário'}
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">
                                Formulário alinhado ao schema atual de <code className="bg-slate-100 px-1.5 py-0.5 rounded">rh_funcionarios</code>.
                            </p>
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={onClose}>
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-4">
                            <div className="flex items-center gap-2 text-slate-700 font-semibold mb-3">
                                <BadgeCheck className="w-4 h-4" /> Dados principais
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className="space-y-2 md:col-span-2">
                                    <span className="text-sm font-medium text-slate-700">Nome completo</span>
                                    <input
                                        value={formData.nome}
                                        onChange={(e) => handleChange('nome', e.target.value)}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm"
                                        placeholder="Nome do colaborador"
                                        required
                                    />
                                </label>

                                <label className="space-y-2">
                                    <span className="text-sm font-medium text-slate-700">CPF</span>
                                    <input
                                        value={formData.cpf}
                                        onChange={(e) => handleChange('cpf', e.target.value)}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm"
                                        placeholder="000.000.000-00"
                                    />
                                </label>

                                <label className="space-y-2">
                                    <span className="text-sm font-medium text-slate-700">Status</span>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => handleChange('status', e.target.value)}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm bg-white"
                                    >
                                        <option value="Ativo">Ativo</option>
                                        <option value="Inativo">Inativo</option>
                                    </select>
                                </label>
                            </div>
                        </div>

                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 md:col-span-2">
                            <div className="flex items-center gap-2 text-slate-700 font-semibold mb-3">
                                <Briefcase className="w-4 h-4" /> Dados contratuais
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className="space-y-2">
                                    <span className="text-sm font-medium text-slate-700">Cargo</span>
                                    <input
                                        value={formData.cargo}
                                        onChange={(e) => handleChange('cargo', e.target.value)}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm"
                                        placeholder="Ex: Analista Administrativo"
                                        required
                                    />
                                </label>

                                <label className="space-y-2">
                                    <span className="text-sm font-medium text-slate-700">Data de admissão</span>
                                    <input
                                        type="date"
                                        value={formData.dataAdmissao}
                                        onChange={(e) => handleChange('dataAdmissao', e.target.value)}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm"
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 md:col-span-2">
                            <div className="flex items-center gap-2 text-slate-700 font-semibold mb-3">
                                <Wallet className="w-4 h-4" /> Dados salariais
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                                <label className="space-y-2">
                                    <span className="text-sm font-medium text-slate-700">Salário base (R$)</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.salarioBase}
                                        onChange={(e) => handleChange('salarioBase', e.target.value)}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm"
                                        placeholder="0,00"
                                    />
                                </label>

                                <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                                    <div className="flex items-center gap-2 text-blue-800 text-sm font-medium mb-1">
                                        <Calendar className="w-4 h-4" /> Prévia do valor
                                    </div>
                                    <div className="text-xl font-bold text-blue-900">{salaryPreview}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                        Esta ficha foi simplificada para refletir apenas os campos realmente persistidos na tabela atual do RH.
                    </div>
                </form>

                <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button type="button" onClick={handleSubmit} className="bg-[#3b82f6] text-white" disabled={saving}>
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Cadastrar funcionário'}
                    </Button>
                </div>
            </motion.div>
        </div>
    );
};

export default FuncionarioForm;
