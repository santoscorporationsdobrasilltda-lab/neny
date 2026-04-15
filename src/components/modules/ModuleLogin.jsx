import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { LogIn, User, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Helmet } from 'react-helmet';
import { allModulesList } from '@/data/modulesData';

const ModuleLogin = () => {
  const { moduloId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const module = allModulesList.find(m => m.id === moduloId);
  const Icon = module?.icon;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate login - no actual authentication
    setTimeout(() => {
      localStorage.setItem(`neny_module_${moduloId}_user`, JSON.stringify({ username, moduloId }));
      
      toast({
        title: '✅ Login realizado!',
        description: `Bem-vindo ao módulo ${module?.label}`,
      });
      
      navigate(`/modulos/${moduloId}/dashboard`);
      setLoading(false);
    }, 800);
  };

  if (!module) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">Módulo não encontrado</div>;
  }

  return (
    <>
      <Helmet>
        <title>{module.label} - Login | Neny Software</title>
        <meta name="description" content={`Acesso ao módulo ${module.label}`} />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <button
            onClick={() => navigate('/modulos')}
            className="flex items-center text-slate-300 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar aos módulos
          </button>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-8">
            <div className="flex flex-col items-center mb-8">
              <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mb-4">
                <Icon className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">{module.label}</h1>
              <p className="text-slate-300 text-center">{module.description}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Usuário"
                  className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Senha"
                  className="w-full pl-12 pr-12 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-6 rounded-xl transition-all"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Entrando...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <LogIn className="w-5 h-5 mr-2" />
                    Entrar
                  </span>
                )}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default ModuleLogin;