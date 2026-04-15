import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, Settings, FileText, Users, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Helmet } from 'react-helmet';
import { allModulesList } from '@/data/modulesData';

const ModuleDashboard = () => {
  const { moduloId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const module = allModulesList.find(m => m.id === moduloId);
  const Icon = module?.icon;

  useEffect(() => {
    const user = localStorage.getItem(`neny_module_${moduloId}_user`);
    if (!user) {
      navigate(`/modulos/${moduloId}/login`);
    }
  }, [moduloId, navigate]);

  const handleLogout = () => {
    localStorage.removeItem(`neny_module_${moduloId}_user`);
    toast({
      title: '👋 Até logo!',
      description: 'Logout realizado com sucesso',
    });
    navigate(`/modulos/${moduloId}/login`);
  };

  if (!module) {
    return null;
  }

  const quickActions = [
    { icon: FileText, label: 'Documentos', color: 'from-blue-500 to-blue-600' },
    { icon: Users, label: 'Usuários', color: 'from-green-500 to-green-600' },
    { icon: BarChart3, label: 'Relatórios', color: 'from-purple-500 to-purple-600' },
    { icon: Settings, label: 'Configurações', color: 'from-orange-500 to-orange-600' },
  ];

  return (
    <>
      <Helmet>
        <title>{module.label} - Dashboard | Neny Software</title>
        <meta name="description" content={`Painel do módulo ${module.label}`} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
        <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{module.label}</h1>
                <p className="text-sm text-slate-300">Dashboard</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {quickActions.map((action, index) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 cursor-pointer hover:bg-white/20 transition-all hover:scale-105"
              >
                <div className={`inline-flex p-3 bg-gradient-to-br ${action.color} rounded-lg mb-4`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">{action.label}</h3>
                <p className="text-sm text-slate-300 mt-1">Acesso rápido</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 text-center"
          >
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-white mb-4">Bem-vindo ao {module.label}</h2>
              <p className="text-slate-300 mb-6">{module.description}</p>
              <p className="text-slate-400 text-sm">
                🚧 Este módulo está em desenvolvimento. As funcionalidades completas estarão disponíveis em breve.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default ModuleDashboard;