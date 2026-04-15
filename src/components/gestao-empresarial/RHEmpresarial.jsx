import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';

const initialForm = {
  id: '',
  name: '',
  cpf: '',
  role: '',
  sector: '',
  workload: '',
  admissionDate: '',
  salary: '',
  employmentType: 'CLT',
  status: 'Ativo',
};

const formatCurrency = (value) => {
  const number = Number(value || 0);
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(number);
};

const RHEmpresarial = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const { toast } = useToast();
  const { user } = useAuth();

  const {
    data: employees,
    loading,
    fetchAll,
    create,
    update,
    remove,
  } = useSupabaseCrud('gestao_rh_empresarial');

  useEffect(() => {
    if (user) {
      fetchAll(1, 1000);
    }
  }, [user, fetchAll]);

  const filteredEmployees = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    return [...employees]
      .filter((employee) => {
        return (
          (employee.name || '').toLowerCase().includes(term) ||
          (employee.sector || '').toLowerCase().includes(term) ||
          (employee.role || '').toLowerCase().includes(term) ||
          (employee.cpf || '').toLowerCase().includes(term) ||
          (employee.employment_type || '').toLowerCase().includes(term)
        );
      })
      .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR'));
  }, [employees, searchTerm]);

  const totalAtivos = useMemo(() => {
    return employees.filter((emp) => (emp.status || 'Ativo') === 'Ativo').length;
  }, [employees]);

  const folhaMensal = useMemo(() => {
    return employees
      .filter((emp) => (emp.status || 'Ativo') === 'Ativo')
      .reduce((acc, emp) => acc + Number(emp.salary || 0), 0);
  }, [employees]);

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

    if (
      !formData.name.trim() ||
      !formData.cpf.trim() ||
      !formData.role.trim() ||
      !formData.sector.trim() ||
      !formData.workload.trim() ||
      !formData.admissionDate ||
      formData.salary === ''
    ) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    const payload = {
      user_id: user.id,
      name: formData.name.trim(),
      cpf: formData.cpf.trim(),
      role: formData.role.trim(),
      sector: formData.sector.trim(),
      workload: formData.workload.trim(),
      admission_date: formData.admissionDate,
      salary: Number(formData.salary || 0),
      employment_type: formData.employmentType || 'CLT',
      status: formData.status || 'Ativo',
      updated_at: new Date().toISOString(),
    };

    const saved = formData.id
      ? await update(formData.id, payload)
      : await create(payload);

    if (saved) {
      await fetchAll(1, 1000);
      toast({ title: formData.id ? '✅ Funcionário atualizado!' : '✅ Funcionário cadastrado!' });
      resetForm();
    }
  };

  const handleEdit = (employee) => {
    setFormData({
      id: employee.id,
      name: employee.name || '',
      cpf: employee.cpf || '',
      role: employee.role || '',
      sector: employee.sector || '',
      workload: employee.workload || '',
      admissionDate: employee.admission_date || '',
      salary: employee.salary ?? '',
      employmentType: employee.employment_type || 'CLT',
      status: employee.status || 'Ativo',
    });
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Deseja realmente excluir este funcionário?');
    if (!confirmed) return;

    const success = await remove(id);
    if (success) {
      await fetchAll(1, 1000);
      toast({ title: '🗑️ Funcionário excluído!' });
    }
  };

  const resetForm = () => {
    setFormData(initialForm);
    setIsFormOpen(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <h1 className="text-3xl font-bold text-white">RH Empresarial</h1>

        <div className="flex gap-3 flex-wrap">
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl px-4 py-3">
            <p className="text-xs text-blue-200">Funcionários ativos</p>
            <p className="text-lg font-bold text-white">{totalAtivos}</p>
          </div>

          <div className="bg-green-500/20 border border-green-500/30 rounded-xl px-4 py-3">
            <p className="text-xs text-green-200">Folha base mensal</p>
            <p className="text-lg font-bold text-white">{formatCurrency(folhaMensal)}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar funcionários..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <Button
          onClick={() => {
            setFormData(initialForm);
            setIsFormOpen(true);
          }}
          className="bg-gradient-to-r from-indigo-500 to-purple-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Funcionário
        </Button>
      </div>

      {isFormOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Nome Completo</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">CPF</label>
                <input
                  type="text"
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Cargo</label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Setor</label>
                <input
                  type="text"
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Carga Horária</label>
                <input
                  type="text"
                  value={formData.workload}
                  onChange={(e) => setFormData({ ...formData, workload: e.target.value })}
                  placeholder="Ex: 40h/semana"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Data de Admissão</label>
                <input
                  type="date"
                  value={formData.admissionDate}
                  onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Salário (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Vínculo</label>
                <select
                  value={formData.employmentType}
                  onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="CLT">CLT</option>
                  <option value="PJ">PJ</option>
                  <option value="Estagiário">Estagiário</option>
                  <option value="Temporário">Temporário</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={resetForm} className="border-white/20 text-white">
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>

              <Button type="submit" className="bg-gradient-to-r from-green-500 to-green-600">
                <Save className="w-4 h-4 mr-2" />
                {formData.id ? 'Atualizar' : 'Salvar'}
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Cargo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Setor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Vínculo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase">Salário</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-300 uppercase">Ações</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-400">
                    Carregando funcionários...
                  </td>
                </tr>
              ) : filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-white/5">
                  <td className="px-6 py-4 text-sm text-white">{emp.name}</td>
                  <td className="px-6 py-4 text-sm text-white">{emp.role}</td>
                  <td className="px-6 py-4 text-sm text-white">{emp.sector}</td>
                  <td className="px-6 py-4 text-sm text-white">{emp.employment_type}</td>
                  <td className="px-6 py-4 text-sm text-white">{emp.status || 'Ativo'}</td>
                  <td className="px-6 py-4 text-sm text-right text-white">
                    {formatCurrency(emp.salary)}
                  </td>
                  <td className="px-6 py-4 text-sm text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(emp)}
                        className="border-white/20 text-white"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(emp.id)}
                        className="border-red-500/50 text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && filteredEmployees.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <p>Nenhum funcionário encontrado</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default RHEmpresarial;