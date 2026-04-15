import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Loader2, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

const ResetPasswordPage = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { updatePassword } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password.length < 6) {
            return toast({ title: 'Erro', description: 'A senha deve ter no mínimo 6 caracteres.', variant: 'destructive' });
        }
        if (password !== confirmPassword) {
            return toast({ title: 'Erro', description: 'As senhas não coincidem.', variant: 'destructive' });
        }

        setLoading(true);
        try {
            await updatePassword(password);
            toast({ title: 'Sucesso', description: 'Sua senha foi redefinida. Faça login.' });
            navigate('/login');
        } catch (error) {
            toast({ title: 'Erro', description: 'Falha ao redefinir a senha.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden p-8">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-[#1e3a8a]">Definir Nova Senha</h1>
                    <p className="text-[#475569] text-sm mt-2">Escolha uma nova senha segura para sua conta.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-semibold text-[#1e293b] mb-1 block">Nova Senha</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none" placeholder="••••••••" />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-[#1e293b] mb-1 block">Confirmar Nova Senha</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input required type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none" placeholder="••••••••" />
                        </div>
                    </div>

                    <Button type="submit" className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white py-6 mt-2" disabled={loading}>
                        {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <KeyRound className="w-5 h-5 mr-2" />}
                        Atualizar Senha
                    </Button>
                </form>
            </motion.div>
        </div>
    );
};

export default ResetPasswordPage;