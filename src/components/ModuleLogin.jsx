import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, User, Lock, Eye, EyeOff, Loader2, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useModuleAuth } from '@/contexts/ModuleAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate, Link } from 'react-router-dom';
import PasswordRecoveryDialog from './PasswordRecoveryDialog';

const ModuleLogin = () => {
    const { login } = useModuleAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isRecoveryDialogOpen, setRecoveryDialogOpen] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            const loggedInUser = await login(username, password);
            if (loggedInUser) {
                toast({
                    title: `✅ Acesso Liberado!`,
                    description: `Bem-vindo ao módulo ${loggedInUser.module}, ${loggedInUser.username}!`,
                });
                navigate(`/${loggedInUser.module}`);
            } else {
                throw new Error("Usuário ou senha inválidos.");
            }
        } catch (err) {
            setError(err.message);
            toast({
                title: '❌ Acesso Negado',
                description: 'Verifique suas credenciais e tente novamente.',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="min-h-screen flex items-center justify-center backdrop-pattern p-4">
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="w-full max-w-md glass-effect rounded-2xl shadow-2xl p-8"
                >
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-r from-gray-500 to-gray-700 rounded-2xl flex items-center justify-center mb-4">
                            <Briefcase className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold gradient-text">Acesso de Módulo</h1>
                        <p className="text-slate-500">Login para usuários de módulos específicos</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Seu nome de usuário"
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
                                placeholder="Sua senha"
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
                            <motion.p initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-red-500 text-sm font-medium text-center">
                                {error}
                            </motion.p>
                        )}

                        <Button type="submit" className="w-full btn-primary text-lg py-6" disabled={loading}>
                            {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <LogIn className="w-5 h-5 mr-2" />}
                            {loading ? 'Entrando...' : 'Entrar no Módulo'}
                        </Button>
                    </form>
                    <div className="text-center mt-6 flex flex-col items-center gap-4">
                        <button onClick={() => setRecoveryDialogOpen(true)} className="text-sm text-blue-600 hover:underline">
                            Esqueceu sua senha?
                        </button>
                         <Link to="/login" className="text-sm text-indigo-600 hover:underline">
                            Voltar para o login principal
                        </Link>
                    </div>
                </motion.div>
            </div>
            <PasswordRecoveryDialog open={isRecoveryDialogOpen} onOpenChange={setRecoveryDialogOpen} />
        </>
    );
};

export default ModuleLogin;