import React, { useEffect, useMemo } from 'react';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import {
    Users,
    FileText,
    Activity,
    ShieldAlert,
    BarChart2,
    DollarSign,
    Edit,
    Trash2,
    UserPlus,
} from 'lucide-react';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

import RHDashboard from './RHDashboard';
import FuncionarioForm from './FuncionarioForm';
import FolhaPagamentoTab from './FolhaPagamentoTab';
import GestaoPessoasTab from './GestaoPessoasTab';
import SegurancaTrabalhoTab from './SegurancaTrabalhoTab';
import GestaoCustos from './GestaoCustos';

const formatCurrency = (value) =>
    new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(Number(value || 0));

const formatDate = (value) => {
    if (!value) return '-';
    return new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR');
};

const statusClass = (status) => {
    if (status === 'Ativo') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (status === 'Inativo') return 'bg-slate-100 text-slate-700 border-slate-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
};

const FuncionariosList = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isOpen, setIsOpen] = React.useState(false);
    const [editingEmployee, setEditingEmployee] = React.useState(null);
    const [searchTerm, setSearchTerm] = React.useState('');

    const {
        data: funcionarios,
        loading,
        fetchAll,
        create,
        update,
        remove,
    } = useSupabaseCrud('rh_funcionarios');

    useEffect(() => {
        if (user) {
            fetchAll(1, 1000);
        }
    }, [user, fetchAll]);

    const filteredFuncionarios = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();
        return [...funcionarios]
            .filter((item) => {
                return (
                    (item.nome || '').toLowerCase().includes(term) ||
                    (item.cpf || '').toLowerCase().includes(term) ||
                    (item.cargo || '').toLowerCase().includes(term) ||
                    (item.status || '').toLowerCase().includes(term)
                );
            })
            .sort((a, b) => (a.nome || '').localeCompare(b.nome || '', 'pt-BR'));
    }, [funcionarios, searchTerm]);

    const handleCloseForm = () => {
        setIsOpen(false);
        setEditingEmployee(null);
    };

    const handleSave = async (formData) => {
        if (!user) {
            toast({ title: 'Erro', description: 'Usuário não autenticado.', variant: 'destructive' });
            return false;
        }

        const payload = {
            user_id: user.id,
            nome: formData.nome?.trim() || null,
            cpf: formData.cpf?.trim() || null,
            cargo: (formData.cargo || '').trim() || null,
            salario: Number(formData.salarioBase || 0),
            data_admissao: formData.dataAdmissao || null,
            status: formData.status || 'Ativo',
            updated_at: new Date().toISOString(),
        };

        if (!payload.nome) {
            toast({ title: 'Erro', description: 'Informe o nome do funcionário.', variant: 'destructive' });
            return false;
        }

        const result = editingEmployee?.id ? await update(editingEmployee.id, payload) : await create(payload);

        if (result) {
            await fetchAll(1, 1000);
            handleCloseForm();
            toast({
                title: 'Sucesso',
                description: editingEmployee ? 'Funcionário atualizado com sucesso.' : 'Funcionário cadastrado com sucesso.',
            });
            return true;
        }

        return false;
    };

    const handleEdit = (employee) => {
        setEditingEmployee(employee);
        setIsOpen(true);
    };

    const handleDelete = async (employee) => {
        const confirmed = window.confirm(`Deseja realmente excluir ${employee.nome || 'este funcionário'}?`);
        if (!confirmed) return;
        const ok = await remove(employee.id);
        if (ok) {
            await fetchAll(1, 1000);
            toast({ title: 'Excluído', description: 'Funcionário removido com sucesso.' });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-[#1e3a8a]">Funcionários</h1>
                    <p className="text-sm text-slate-500">Cadastro alinhado ao schema atual de colaboradores.</p>
                </div>
                <div className="flex gap-3 w-full lg:w-auto">
                    <input
                        type="text"
                        placeholder="Buscar funcionário..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full lg:w-72 px-4 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                    <Button onClick={() => { setEditingEmployee(null); setIsOpen(true); }} className="bg-[#3b82f6] text-white whitespace-nowrap">
                        <UserPlus className="w-4 h-4 mr-2" /> Novo Funcionário
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <div className="text-sm text-slate-500">Total</div>
                    <div className="text-2xl font-bold text-slate-900">{funcionarios.length}</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <div className="text-sm text-slate-500">Ativos</div>
                    <div className="text-2xl font-bold text-emerald-700">{funcionarios.filter((f) => f.status === 'Ativo').length}</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <div className="text-sm text-slate-500">Inativos</div>
                    <div className="text-2xl font-bold text-slate-700">{funcionarios.filter((f) => f.status === 'Inativo').length}</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <div className="text-sm text-slate-500">Salário base total</div>
                    <div className="text-xl font-bold text-[#1e3a8a]">
                        {formatCurrency(funcionarios.reduce((sum, item) => sum + Number(item.salario || 0), 0))}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[860px]">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="p-4 text-sm font-semibold text-slate-700">Nome</th>
                                <th className="p-4 text-sm font-semibold text-slate-700">CPF</th>
                                <th className="p-4 text-sm font-semibold text-slate-700">Cargo</th>
                                <th className="p-4 text-sm font-semibold text-slate-700">Salário</th>
                                <th className="p-4 text-sm font-semibold text-slate-700">Admissão</th>
                                <th className="p-4 text-sm font-semibold text-slate-700">Status</th>
                                <th className="p-4 text-sm font-semibold text-slate-700 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="p-6 text-center text-slate-500">Carregando funcionários...</td>
                                </tr>
                            ) : filteredFuncionarios.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-6 text-center text-slate-500">Nenhum funcionário encontrado.</td>
                                </tr>
                            ) : (
                                filteredFuncionarios.map((employee) => (
                                    <tr key={employee.id} className="border-t border-slate-200 hover:bg-slate-50/70 transition-colors">
                                        <td className="p-4">
                                            <div className="font-semibold text-slate-900">{employee.nome || '-'}</div>
                                        </td>
                                        <td className="p-4 text-slate-600">{employee.cpf || '-'}</td>
                                        <td className="p-4 text-slate-700">{employee.cargo || '-'}</td>
                                        <td className="p-4 text-slate-700">{formatCurrency(employee.salario)}</td>
                                        <td className="p-4 text-slate-600">{formatDate(employee.data_admissao)}</td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-medium ${statusClass(employee.status)}`}>
                                                {employee.status || '-'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex justify-end gap-2">
                                                <Button size="icon" variant="ghost" onClick={() => handleEdit(employee)}>
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="text-red-600" onClick={() => handleDelete(employee)}>
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

            {isOpen && <FuncionarioForm funcionario={editingEmployee} onClose={handleCloseForm} onSave={handleSave} />}
        </div>
    );
};

const RecursosHumanos = () => {
    const location = useLocation();
    const currentPath = location.pathname.split('/').pop();
    const isRoot = currentPath === 'rh' || currentPath === '';

    const getVariant = (path) => {
        if (path === 'dashboard' && isRoot) return 'default';
        return currentPath === path ? 'default' : 'ghost';
    };

    return (
        <>
            <Helmet>
                <title>RH - Neny Software</title>
            </Helmet>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
                    <div>
                        <h1 className="text-3xl font-bold text-[#1e3a8a]">Recursos Humanos</h1>
                        <p className="text-[#64748b]">Gestão de Pessoas e Departamento Pessoal</p>
                    </div>
                </div>

                <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm overflow-x-auto mb-6">
                    <div className="flex space-x-2 min-w-max">
                        <Link to="/rh"><Button variant={isRoot ? 'default' : 'ghost'} size="sm"><BarChart2 className="w-4 h-4 mr-2" /> Dashboard</Button></Link>
                        <Link to="funcionarios"><Button variant={getVariant('funcionarios')} size="sm"><Users className="w-4 h-4 mr-2" /> Funcionários</Button></Link>
                        <Link to="gestao-pessoas"><Button variant={getVariant('gestao-pessoas')} size="sm"><Activity className="w-4 h-4 mr-2" /> Gestão Pessoas</Button></Link>
                        <Link to="folha"><Button variant={getVariant('folha')} size="sm"><FileText className="w-4 h-4 mr-2" /> Folha & Pagto</Button></Link>
                        <Link to="seguranca"><Button variant={getVariant('seguranca')} size="sm"><ShieldAlert className="w-4 h-4 mr-2" /> SST & Riscos</Button></Link>
                        <Link to="custos"><Button variant={getVariant('custos')} size="sm"><DollarSign className="w-4 h-4 mr-2" /> Custos</Button></Link>
                    </div>
                </div>

                <div className="min-h-[500px]">
                    <Routes>
                        <Route index element={<RHDashboard />} />
                        <Route path="funcionarios" element={<FuncionariosList />} />
                        <Route path="gestao-pessoas" element={<GestaoPessoasTab />} />
                        <Route path="folha" element={<FolhaPagamentoTab />} />
                        <Route path="seguranca" element={<SegurancaTrabalhoTab />} />
                        <Route path="custos" element={<GestaoCustos />} />
                        <Route path="*" element={<Navigate to="/rh" />} />
                    </Routes>
                </div>
            </div>
        </>
    );
};

export default RecursosHumanos;
