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
  description: '',
  level: 'user',
  permissions: '',
};

const ProfilesPermissions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const { toast } = useToast();
  const { user } = useAuth();

  const {
    data: profiles,
    loading,
    fetchAll,
    create,
    update,
    remove,
  } = useSupabaseCrud('admin_profiles');

  useEffect(() => {
    if (user) {
      fetchAll(1, 1000);
    }
  }, [user, fetchAll]);

  const filteredProfiles = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    return [...profiles]
      .filter((profile) => {
        return (
          (profile.name || '').toLowerCase().includes(term) ||
          (profile.description || '').toLowerCase().includes(term) ||
          (profile.level || '').toLowerCase().includes(term) ||
          (profile.permissions || '').toLowerCase().includes(term)
        );
      })
      .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR'));
  }, [profiles, searchTerm]);

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
        description: 'Preencha nome e descrição do perfil.',
        variant: 'destructive',
      });
      return;
    }

    const payload = {
      user_id: user.id,
      name: formData.name.trim(),
      description: formData.description.trim(),
      level: formData.level || 'user',
      permissions: formData.permissions?.trim() || null,
      updated_at: new Date().toISOString(),
    };

    const saved = formData.id
      ? await update(formData.id, payload)
      : await create(payload);

    if (saved) {
      await fetchAll(1, 1000);
      toast({
        title: formData.id
          ? '✅ Perfil atualizado com sucesso!'
          : '✅ Perfil cadastrado com sucesso!',
      });
      resetForm();
    }
  };

  const handleEdit = (profile) => {
    setFormData({
      id: profile.id,
      name: profile.name || '',
      description: profile.description || '',
      level: profile.level || 'user',
      permissions: profile.permissions || '',
    });
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Deseja realmente excluir este perfil?');
    if (!confirmed) return;

    const success = await remove(id);
    if (success) {
      await fetchAll(1, 1000);
      toast({ title: '🗑️ Perfil excluído com sucesso!' });
    }
  };

  const resetForm = () => {
    setFormData(initialForm);
    setIsFormOpen(false);
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
            placeholder="Buscar perfis..."
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
          Novo Perfil
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
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nome do Perfil
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Nível</label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="admin">Administrador</option>
                  <option value="manager">Gerente</option>
                  <option value="user">Usuário</option>
                  <option value="guest">Convidado</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Descrição</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Permissões (separadas por vírgula)
              </label>
              <input
                type="text"
                value={formData.permissions}
                onChange={(e) => setFormData({ ...formData, permissions: e.target.value })}
                placeholder="Ex: leitura, escrita, exclusão"
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
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
            <p>Carregando perfis...</p>
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p>Nenhum perfil encontrado</p>
          </div>
        ) : (
          filteredProfiles.map((profile, index) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 flex items-center justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-white">{profile.name}</h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-indigo-500/20 text-indigo-300">
                    {profile.level}
                  </span>
                </div>

                <p className="text-slate-300 text-sm mt-1">{profile.description}</p>

                {profile.permissions && (
                  <p className="text-xs text-slate-400 mt-2">
                    Permissões: {profile.permissions}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(profile)}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Edit className="w-4 h-4" />
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(profile.id)}
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

export default ProfilesPermissions;