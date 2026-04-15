import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';

const initialForm = {
  id: '',
  name: '',
  description: '',
  icon: '',
  status: 'active',
};

const ModuleSectorManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const { toast } = useToast();
  const { user } = useAuth();

  const {
    data: modules,
    loading,
    fetchAll,
    create,
    update,
    remove,
  } = useSupabaseCrud('admin_modules');

  useEffect(() => {
    if (user) {
      fetchAll(1, 1000);
    }
  }, [user, fetchAll]);

  const filteredModules = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    return [...modules]
      .filter((module) => {
        return (
          (module.name || '').toLowerCase().includes(term) ||
          (module.description || '').toLowerCase().includes(term) ||
          (module.icon || '').toLowerCase().includes(term) ||
          (module.status || '').toLowerCase().includes(term)
        );
      })
      .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR'));
  }, [modules, searchTerm]);

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

    if (!formData.name.trim() || !formData.description.trim()) {
      toast({
        title: 'Erro',
        description: 'Preencha nome e descrição do módulo.',
        variant: 'destructive',
      });
      return;
    }

    const payload = {
      user_id: user.id,
      name: formData.name.trim(),
      description: formData.description.trim(),
      icon: formData.icon?.trim() || null,
      status: formData.status || 'active',
      updated_at: new Date().toISOString(),
    };

    const saved = formData.id
      ? await update(formData.id, payload)
      : await create(payload);

    if (saved) {
      await fetchAll(1, 1000);
      toast({
        title: formData.id
          ? '✅ Módulo atualizado com sucesso!'
          : '✅ Módulo cadastrado com sucesso!',
      });
      resetForm();
    }
  };

  const handleEdit = (module) => {
    setFormData({
      id: module.id,
      name: module.name || '',
      description: module.description || '',
      icon: module.icon || '',
      status: module.status || 'active',
    });
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Deseja realmente excluir este módulo?');
    if (!confirmed) return;

    const success = await remove(id);
    if (success) {
      await fetchAll(1, 1000);
      toast({ title: '🗑️ Módulo excluído com sucesso!' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar módulos..."
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
          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Módulo
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
                <label className="block text-sm font-medium text-slate-300 mb-2">Nome do Módulo</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Ícone</label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="Nome do ícone Lucide"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Descrição</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
                <option value="maintenance">Manutenção</option>
              </select>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                className="border-white/20 text-white"
              >
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

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="text-center py-12 text-slate-400">
            <p>Carregando módulos...</p>
          </div>
        ) : filteredModules.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p>Nenhum módulo encontrado</p>
          </div>
        ) : (
          filteredModules.map((module, index) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 flex items-center justify-between"
            >
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">{module.name}</h3>
                <p className="text-slate-300 text-sm mt-1">{module.description}</p>

                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs text-slate-400">Ícone: {module.icon || 'N/A'}</span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${module.status === 'active'
                        ? 'bg-green-500/20 text-green-300'
                        : module.status === 'inactive'
                          ? 'bg-red-500/20 text-red-300'
                          : 'bg-yellow-500/20 text-yellow-300'
                      }`}
                  >
                    {module.status === 'active'
                      ? 'Ativo'
                      : module.status === 'inactive'
                        ? 'Inativo'
                        : 'Manutenção'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(module)}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Edit className="w-4 h-4" />
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(module.id)}
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default ModuleSectorManagement;