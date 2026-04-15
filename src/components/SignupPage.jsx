import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User, Phone, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate, Link } from 'react-router-dom';

const SignupPage = () => {
    const [formData, setFormData] = useState({
        nome_completo: '',
        email: '',
        telefone: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const { signUp } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.password.length < 6) {
            return toast({ title: 'Erro', description: 'A senha deve ter no mínimo 6 caracteres.', variant: 'destructive' });
        }
        if (formData.password !== formData.confirmPassword) {
            return toast({ title: 'Erro', description: 'As senhas não coincidem.', variant: 'destructive' });
        }
        
        setLoading(true);
        try {
            await signUp(formData.email, formData.password, {
                data: {
                    nome_completo: formData.nome_completo,
                    telefone: formData.telefone,
                }
            });
            toast({ title: 'Conta criada!', description: 'Cadastro realizado com sucesso.' });
            navigate('/verify-email');
        } catch (error) {
            toast({ title: 'Erro no cadastro', description: 'Ocorreu um erro ao criar a conta. Tente novamente.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="p-8">
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-[#1e3a8a]">Criar Conta</h1>
                        <p className="text-[#475569] text-sm mt-1">Preencha seus dados para acessar o sistema</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-[#1e293b] mb-1 block">Nome Completo</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input required name="nome_completo" value={formData.nome_completo} onChange={handleChange} className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none" placeholder="João da Silva" />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-[#1e293b] mb-1 block">E-mail</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none" placeholder="joao@exemplo.com" />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-[#1e293b] mb-1 block">Telefone</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input name="telefone" value={formData.telefone} onChange={handleChange} className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none" placeholder="(00) 00000-0000" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-[#1e293b] mb-1 block">Senha</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input required type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none" placeholder="••••••" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-[#1e293b] mb-1 block">Confirmar</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input required type={showPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none" placeholder="••••••" />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <Button type="submit" className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white mt-4" disabled={loading}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
                            Cadastrar
                        </Button>
                    </form>
                    
                    <div className="mt-4 text-center text-sm">
                        <Link to="/login" className="text-blue-600 font-semibold hover:underline">Voltar para Login</Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default SignupPage;