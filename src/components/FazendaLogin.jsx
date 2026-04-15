import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, User, Lock, Eye, EyeOff, Tractor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useModuleAuth } from '@/contexts/ModuleAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';

const FazendaLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const { login } = useModuleAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/fazenda';

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        const user = login('fazenda', username, password);
        if (user) {
            toast({
                title: `🌱 Bem-vindo ao Fazenda 5.0, ${user.username}!`,
                description: 'Acesso autorizado.',
            });
            navigate(from, { replace: true });
        } else {
            setError('Usuário ou senha inválidos para este módulo.');
            toast({
                title: '❌ Acesso Negado',
                description: 'Credenciais incorretas para o Módulo Fazenda 5.0.',
                variant: 'destructive'
            });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center backdrop-pattern p-4">
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-full max-w-md glass-effect rounded-2xl shadow-2xl p-8"
            >
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 pulse-glow-green">
                        <Tractor className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold gradient-text-green">Fazenda 5.0</h1>
                    <p className="text-slate-500">Acesso exclusivo ao módulo</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Usuário Fazenda"
                            className="input-field pl-12"
                            required
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Senha Fazenda"
                            className="input-field pl-12 pr-12"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                    
                    {error && (
                        <motion.p
                            initial={{ y: -10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="text-red-500 text-sm font-medium text-center"
                        >
                            {error}
                        </motion.p>
                    )}

                    <Button type="submit" className="w-full btn-success text-lg py-6">
                        <LogIn className="w-5 h-5 mr-2" />
                        Entrar no Módulo
                    </Button>
                </form>
                <div className="text-center mt-6">
                    <button onClick={() => navigate('/login')} className="text-sm text-blue-600 hover:underline">
                        Voltar para o login principal
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default FazendaLogin;