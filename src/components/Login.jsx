import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, User, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const { login } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await login(email, password);
            navigate('/dashboard');
            toast({
                title: "Login realizado",
                description: "Bem-vindo ao sistema Neny.",
            });
        } catch (err) {
            toast({
                title: '❌ Falha no Login',
                description: "Credenciais inválidas.",
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
            >
                <div className="p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-[#1e3a8a] mb-2">Neny System</h1>
                        <p className="text-[#475569]">Faça login para continuar</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-[#1e293b]">Email</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94a3b8]" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="seu@email.com"
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 text-[#111827] focus:ring-2 focus:ring-[#3b82f6] outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-semibold text-[#1e293b]">Senha</label>
                                <Link to="/forgot-password" className="text-xs text-blue-600 hover:underline">Recuperar Senha</Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94a3b8]" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••"
                                    className="w-full pl-10 pr-12 py-3 rounded-lg border border-slate-300 text-[#111827] focus:ring-2 focus:ring-[#3b82f6] outline-none transition-all"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#475569]"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                        
                        <Button 
                            type="submit" 
                            className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white py-6 text-lg font-semibold rounded-xl shadow-md transition-all duration-300" 
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <LogIn className="w-5 h-5 mr-2" />}
                            {loading ? 'Autenticando...' : 'Entrar'}
                        </Button>
                    </form>
                    
                    <div className="mt-6 text-center text-sm text-slate-500">
                        Não tem uma conta? <Link to="/signup" className="text-blue-600 font-semibold hover:underline">Criar Conta</Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;