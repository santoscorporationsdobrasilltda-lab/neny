import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Trash2, Save, X, Printer, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { PdfGenerator } from '@/utils/PdfGenerator';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';

const initialForm = {
  employeeId: '',
  competence: '',
  baseSalary: 0,
  earnings: 0,
  discounts: 0,
  inss: 0,
  irrf: 0,
};

const formatCurrency = (value) => {
  const number = Number(value || 0);
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(number);
};

const FolhaPagamento = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const { toast } = useToast();
  const { user } = useAuth();

  const {
    data: payrolls,
    loading: loadingPayrolls,
    fetchAll: fetchPayrolls,
    create,
    remove,
  } = useSupabaseCrud('gestao_folha_pagamento');

  const {
    data: employees,
    loading: loadingEmployees,
    fetchAll: fetchEmployees,
  } = useSupabaseCrud('gestao_rh_empresarial');

  useEffect(() => {
    if (user) {
      fetchPayrolls(1, 1000);
      fetchEmployees(1, 1000);
    }
  }, [user, fetchPayrolls, fetchEmployees]);

  const activeEmployees = useMemo(() => {
    return employees
      .filter((emp) => (emp.status || 'Ativo') === 'Ativo')
      .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR'));
  }, [employees]);

  const filteredPayrolls = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    return [...payrolls]
      .filter((p) => (p.employee_name || '').toLowerCase().includes(term))
      .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
  }, [payrolls, searchTerm]);

  const calculateTaxes = (base) => {
    const salary = Number(base || 0);
    const inss = salary * 0.11;
    const irrf = salary > 2000 ? (salary - 2000) * 0.275 : 0;
    return {
      inss: Number(inss.toFixed(2)),
      irrf: Number(irrf.toFixed(2)),
    };
  };

  const handleEmployeeSelect = (e) => {
    const empId = e.target.value;
    const emp = employees.find((item) => item.id === empId);

    if (emp) {
      const taxes = calculateTaxes(emp.salary);
      setFormData((prev) => ({
        ...prev,
        employeeId: empId,
        baseSalary: Number(emp.salary || 0),
        inss: taxes.inss,
        irrf: taxes.irrf,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        employeeId: empId,
        baseSalary: 0,
        inss: 0,
        irrf: 0,
      }));
    }
  };

  const resetForm = () => {
    setFormData(initialForm);
    setIsFormOpen(false);
  };

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

    if (!formData.employeeId || !formData.competence) {
      toast({
        title: 'Erro',
        description: 'Selecione o funcionário e a competência.',
        variant: 'destructive',
      });
      return;
    }

    const emp = employees.find((item) => item.id === formData.employeeId);
    if (!emp) {
      toast({
        title: 'Erro',
        description: 'Funcionário não encontrado.',
        variant: 'destructive',
      });
      return;
    }

    const existing = payrolls.find(
      (item) =>
        item.employee_id === formData.employeeId &&
        item.competence === formData.competence
    );

    if (existing) {
      toast({
        title: 'Erro',
        description: 'Já existe uma folha para este funcionário nesta competência.',
        variant: 'destructive',
      });
      return;
    }

    const baseSalary = Number(formData.baseSalary || 0);
    const earnings = Number(formData.earnings || 0);
    const discounts = Number(formData.discounts || 0);
    const inss = Number(formData.inss || 0);
    const irrf = Number(formData.irrf || 0);
    const netSalary = baseSalary + earnings - discounts - inss - irrf;

    const payload = {
      user_id: user.id,
      employee_id: formData.employeeId,
      employee_name: emp.name || 'Desconhecido',
      competence: formData.competence,
      base_salary: baseSalary,
      earnings,
      discounts,
      inss,
      irrf,
      net_salary: Number(netSalary.toFixed(2)),
      updated_at: new Date().toISOString(),
    };

    const saved = await create(payload);

    if (saved) {
      await fetchPayrolls(1, 1000);
      toast({ title: '✅ Folha gerada com sucesso!' });
      resetForm();
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Deseja realmente excluir esta folha?');
    if (!confirmed) return;

    const success = await remove(id);
    if (success) {
      await fetchPayrolls(1, 1000);
      toast({ title: '🗑️ Folha excluída!' });
    }
  };

  const generatePDF = (payroll) => {
    PdfGenerator.generateHolerite(
      {
        nome: payroll.employee_name,
        cargo: payroll.employee_role || payroll.role || '',
      },
      {
        competencia: payroll.competence,
        base_salary: payroll.base_salary,
        earnings: payroll.earnings,
        discounts: payroll.discounts,
        inss: payroll.inss,
        irrf: payroll.irrf,
        fgts: payroll.fgts,
        net_salary: payroll.net_salary,
        paid_at: payroll.paid_at,
        status: payroll.status,
      }
    );
  };

  const loading = loadingPayrolls || loadingEmployees;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Folha de Pagamento</h1>

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por funcionário..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white focus:outline-none"
          />
        </div>

        <Button onClick={() => setIsFormOpen(true)} className="bg-gradient-to-r from-indigo-500 to-purple-600">
          <Calculator className="w-4 h-4 mr-2" />
          Calcular Folha
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
                <label className="block text-sm font-medium text-slate-300 mb-2">Funcionário</label>
                <select
                  onChange={handleEmployeeSelect}
                  value={formData.employeeId}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                >
                  <option value="">Selecione...</option>
                  {activeEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Competência</label>
                <input
                  type="month"
                  value={formData.competence}
                  onChange={(e) => setFormData({ ...formData, competence: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Salário Base</label>
                <input
                  type="number"
                  readOnly
                  value={formData.baseSalary}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-300 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Outros Proventos</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.earnings}
                  onChange={(e) => setFormData({ ...formData, earnings: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Outros Descontos</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.discounts}
                  onChange={(e) => setFormData({ ...formData, discounts: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">INSS (Est.)</label>
                <input
                  type="number"
                  readOnly
                  value={formData.inss}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">IRRF (Est.)</label>
              <input
                type="number"
                readOnly
                value={formData.irrf}
                className="w-full md:w-1/4 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-300"
              />
            </div>

            <div className="flex gap-3 justify-end mt-4">
              <Button type="button" variant="outline" onClick={resetForm} className="border-white/20 text-white">
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>

              <Button type="submit" className="bg-gradient-to-r from-green-500 to-green-600">
                <Save className="w-4 h-4 mr-2" />
                Salvar Folha
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Funcionário</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Competência</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase">Salário Líquido</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-slate-300 uppercase">Ações</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/10">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-slate-400">
                  Carregando folhas...
                </td>
              </tr>
            ) : filteredPayrolls.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-slate-400">
                  Nenhuma folha encontrada.
                </td>
              </tr>
            ) : (
              filteredPayrolls.map((p) => (
                <tr key={p.id} className="hover:bg-white/5">
                  <td className="px-6 py-4 text-sm text-white">{p.employee_name}</td>
                  <td className="px-6 py-4 text-sm text-white">{p.competence}</td>
                  <td className="px-6 py-4 text-sm text-right text-white font-bold">
                    {formatCurrency(p.net_salary)}
                  </td>
                  <td className="px-6 py-4 text-center flex justify-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => generatePDF(p)}
                      className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                    >
                      <Printer className="w-4 h-4" />
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(p.id)}
                      className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default FolhaPagamento;