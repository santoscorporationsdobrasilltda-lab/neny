import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Shield,
  Bell,
  Palette,
  Database,
  Save,
  Eye,
  EyeOff,
  Download,
  Wifi,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { supabase } from '@/lib/customSupabaseClient';
import IntegracaoAutomacao from '@/components/configuracoes/IntegracaoAutomacao';

const defaultProfileFromUser = (currentUser) => ({
  fullName:
    currentUser?.user_metadata?.full_name ||
    currentUser?.user_metadata?.name ||
    currentUser?.email?.split('@')[0] ||
    'Usuário',
  email: currentUser?.email || '',
  phone: currentUser?.user_metadata?.phone || '',
  role:
    currentUser?.user_metadata?.role ||
    currentUser?.app_metadata?.role ||
    'Usuário',
});

const defaultNotifications = {
  newSales: true,
  lowStock: true,
  weeklyReports: true,
  systemUpdates: false,
};

const backupTables = [
  'ordem_servicos_tecnicos',
  'ordem_servicos_ordens',
  'ordem_servicos_agenda',
  'ordem_servicos_equipamentos',
  'fazenda50_bovinos',
  'fazenda50_financeiro',
  'fazenda50_sanidade',
  'fazenda50_lavouras',
  'fazenda50_defensivos',
  'piscicultura40_tanques',
  'piscicultura40_safras',
  'piscicultura40_sensores',
  'piscicultura40_leituras_agua',
  'piscicultura40_manejos',
  'piscicultura40_biometrias',
  'sac_crm_fornecedores',
  'sac_crm_atendimentos',
  'sac_crm_followups',
  'estoque_categorias',
  'estoque_fornecedores',
  'estoque_produtos',
  'estoque_movimentacoes',
  'rh_funcionarios',
  'rh_avaliacoes',
  'rh_promocoes',
  'rh_treinamentos',
  'rh_folha_pagamento',
  'rh_sst_acidentes',
  'rh_sst_epis',
  'rh_sst_aso',
  'seguranca_cftv_equipamentos',
  'seguranca_alarm_panels',
  'seguranca_alarm_events',
  'seguranca_vehicles',
  'vendas_propostas',
  'vendas_metas',
  'contabilidade_lancamentos',
  'gestao_saldos_financas',
  'gestao_contas_receber',
  'gestao_contas_pagar',
  'gestao_rh_empresarial',
  'gestao_folha_pagamento',
  'admin_profiles',
  'admin_modules',
  'configuracoes_integracoes',
  'configuracoes_perfil_usuario',
  'configuracoes_notificacoes_usuario',
];

const Configuracoes = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('perfil');
  const [showPassword, setShowPassword] = useState(false);
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const { currentUser, updatePassword } = useAuth();

  const {
    data: profileRows,
    fetchAll: fetchProfileRows,
    create: createProfile,
    update: updateProfile,
  } = useSupabaseCrud('configuracoes_perfil_usuario');

  const {
    data: notificationRows,
    fetchAll: fetchNotificationRows,
    create: createNotifications,
    update: updateNotifications,
  } = useSupabaseCrud('configuracoes_notificacoes_usuario');

  const [profile, setProfile] = useState(defaultProfileFromUser(currentUser));
  const [notifications, setNotifications] = useState(defaultNotifications);
  const [saving, setSaving] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchProfileRows(1, 10);
      fetchNotificationRows(1, 10);
    }
  }, [currentUser, fetchProfileRows, fetchNotificationRows]);

  useEffect(() => {
    if (!currentUser) return;

    const profileRow = profileRows[0];

    setProfile(
      profileRow
        ? {
          fullName: profileRow.full_name || '',
          email: profileRow.email || currentUser.email || '',
          phone: profileRow.phone || '',
          role: profileRow.role || 'Usuário',
        }
        : defaultProfileFromUser(currentUser)
    );
  }, [profileRows, currentUser]);

  useEffect(() => {
    const notificationRow = notificationRows[0];

    setNotifications(
      notificationRow
        ? {
          newSales: !!notificationRow.new_sales,
          lowStock: !!notificationRow.low_stock,
          weeklyReports: !!notificationRow.weekly_reports,
          systemUpdates: !!notificationRow.system_updates,
        }
        : defaultNotifications
    );
  }, [notificationRows]);

  const profileRowId = useMemo(() => profileRows[0]?.id || null, [profileRows]);
  const notificationRowId = useMemo(() => notificationRows[0]?.id || null, [notificationRows]);

  const handleProfileActionChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotifications((prev) => ({ ...prev, [name]: checked }));
  };

  const handleGenericAction = (title) => {
    toast({
      title: `⚙️ ${title}`,
      description: 'Esta funcionalidade será implementada em breve.',
    });
  };

  const handleSave = async () => {
    if (!currentUser) {
      toast({
        title: 'Erro',
        description: 'Usuário não autenticado.',
        variant: 'destructive',
      });
      return;
    }

    if (!profile.fullName?.trim()) {
      toast({
        title: 'Erro',
        description: 'O nome do perfil é obrigatório.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    try {
      const profilePayload = {
        user_id: currentUser.id,
        full_name: profile.fullName.trim(),
        email: profile.email?.trim() || currentUser.email || null,
        phone: profile.phone?.trim() || null,
        role: profile.role?.trim() || 'Usuário',
        updated_at: new Date().toISOString(),
      };

      const notificationsPayload = {
        user_id: currentUser.id,
        new_sales: !!notifications.newSales,
        low_stock: !!notifications.lowStock,
        weekly_reports: !!notifications.weeklyReports,
        system_updates: !!notifications.systemUpdates,
        updated_at: new Date().toISOString(),
      };

      const savedProfile = profileRowId
        ? await updateProfile(profileRowId, profilePayload)
        : await createProfile(profilePayload);

      const savedNotifications = notificationRowId
        ? await updateNotifications(notificationRowId, notificationsPayload)
        : await createNotifications(notificationsPayload);

      if (savedProfile && savedNotifications) {
        await fetchProfileRows(1, 10);
        await fetchNotificationRows(1, 10);
        toast({
          title: '✅ Configurações Salvas',
          description: 'Suas alterações foram salvas com sucesso.',
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async () => {
    if (!securityForm.newPassword || !securityForm.confirmPassword) {
      toast({
        title: 'Erro',
        description: 'Preencha a nova senha e a confirmação.',
        variant: 'destructive',
      });
      return;
    }

    if (securityForm.newPassword.length < 6) {
      toast({
        title: 'Erro',
        description: 'A nova senha deve ter pelo menos 6 caracteres.',
        variant: 'destructive',
      });
      return;
    }

    if (securityForm.newPassword !== securityForm.confirmPassword) {
      toast({
        title: 'Erro',
        description: 'A confirmação da senha não confere.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updatePassword(securityForm.newPassword);
      setSecurityForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      toast({
        title: '✅ Senha atualizada',
        description: 'Sua senha foi alterada com sucesso.',
      });
    } catch (error) {
      toast({
        title: '❌ Erro ao alterar senha',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleBackup = async () => {
    if (!currentUser) {
      toast({
        title: 'Erro',
        description: 'Usuário não autenticado.',
        variant: 'destructive',
      });
      return;
    }

    setBackupLoading(true);

    try {
      const backup = {
        generated_at: new Date().toISOString(),
        user_id: currentUser.id,
        email: currentUser.email || '',
        data: {},
        warnings: {},
      };

      for (const table of backupTables) {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .eq('user_id', currentUser.id);

        if (error) {
          backup.warnings[table] = error.message;
        } else {
          backup.data[table] = data || [];
        }
      }

      const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: 'application/json',
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_webzoe_${(currentUser.email || 'usuario').replace(/[@.]/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: '✅ Backup Gerado',
        description: 'Seu backup foi baixado com sucesso.',
      });
    } catch (error) {
      toast({
        title: '❌ Erro no Backup',
        description: 'Não foi possível gerar o backup.',
        variant: 'destructive',
      });
    } finally {
      setBackupLoading(false);
    }
  };

  const tabs = [
    { id: 'perfil', label: 'Perfil', icon: User },
    { id: 'seguranca', label: 'Segurança', icon: Shield },
    { id: 'notificacoes', label: 'Notificações', icon: Bell },
    { id: 'aparencia', label: 'Aparência', icon: Palette },
    { id: 'sistema', label: 'Sistema', icon: Database },
    { id: 'integracao_automacao', label: 'Integrações & Automação', icon: Wifi },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'perfil':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-900">{profile.fullName}</h3>
                <p className="text-slate-600">{profile.email}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => handleGenericAction('Alterar Foto')}
                >
                  Alterar Foto
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nome Completo</label>
                <input
                  type="text"
                  name="fullName"
                  value={profile.fullName}
                  onChange={handleProfileActionChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleProfileActionChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Telefone</label>
                <input
                  type="tel"
                  name="phone"
                  value={profile.phone}
                  onChange={handleProfileActionChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Cargo</label>
                <input
                  type="text"
                  name="role"
                  value={profile.role}
                  onChange={handleProfileActionChange}
                  className="input-field"
                />
              </div>
            </div>
          </div>
        );

      case 'seguranca':
        return (
          <div className="space-y-6">
            <div className="glass-effect rounded-xl p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Alterar Senha</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Senha Atual</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={securityForm.currentPassword}
                      onChange={(e) =>
                        setSecurityForm((prev) => ({
                          ...prev,
                          currentPassword: e.target.value,
                        }))
                      }
                      className="input-field pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nova Senha</label>
                  <input
                    type="password"
                    value={securityForm.newPassword}
                    onChange={(e) =>
                      setSecurityForm((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Confirmar Nova Senha</label>
                  <input
                    type="password"
                    value={securityForm.confirmPassword}
                    onChange={(e) =>
                      setSecurityForm((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    className="input-field"
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={handlePasswordSave} className="btn-primary">
                    Atualizar Senha
                  </Button>
                </div>
              </div>
            </div>

            <div className="glass-effect rounded-xl p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Autenticação de Dois Fatores</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-700">Adicione uma camada extra de segurança</p>
                  <p className="text-sm text-slate-500">Requer verificação por SMS ou app</p>
                </div>
                <Button variant="outline" onClick={() => handleGenericAction('Configurar 2FA')}>
                  Configurar
                </Button>
              </div>
            </div>
          </div>
        );

      case 'notificacoes':
        return (
          <div className="space-y-6">
            <div className="glass-effect rounded-xl p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Configurações de Notificação</h3>

              <div className="space-y-4">
                {Object.entries({
                  newSales: 'Novas vendas',
                  lowStock: 'Produtos com baixo estoque',
                  weeklyReports: 'Relatórios semanais',
                  systemUpdates: 'Atualizações do sistema',
                }).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-slate-700">{label}</span>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name={key}
                        checked={notifications[key]}
                        onChange={handleNotificationChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'sistema':
        return (
          <div className="space-y-6">
            <div className="glass-effect rounded-xl p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Backup de Dados</h3>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-slate-700">Faça o backup dos dados já migrados para o Supabase.</p>
                  <p className="text-sm text-slate-500">
                    Um arquivo JSON será baixado para o seu computador.
                  </p>
                </div>

                <Button variant="outline" onClick={handleBackup} disabled={backupLoading}>
                  <Download className="w-4 h-4 mr-2" />
                  {backupLoading ? 'Gerando...' : 'Fazer Backup'}
                </Button>
              </div>
            </div>
          </div>
        );

      case 'aparencia':
        return (
          <div className="text-center p-8">
            <Palette className="w-16 h-16 mx-auto text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold">Em breve</h3>
            <p className="text-slate-500">A personalização da aparência estará disponível em breve.</p>
          </div>
        );

      case 'integracao_automacao':
        return <IntegracaoAutomacao />;

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text text-shadow">Configurações</h1>
          <p className="text-slate-600 mt-1">Gerencie as configurações da sua conta e do sistema</p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={handleSave} className="btn-primary" disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-effect rounded-2xl p-4 h-fit"
        >
          <nav className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left transition-all duration-200 ${activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="lg:col-span-3 glass-effect rounded-2xl p-8"
        >
          {renderTabContent()}
        </motion.div>
      </div>
    </div>
  );
};

export default Configuracoes;