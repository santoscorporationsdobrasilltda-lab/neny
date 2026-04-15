import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';

const PasswordRecoveryPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const { resetPassword } = useAuth();
    const { toast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await resetPassword(email);
            setSent(true);
            toast({ title: 'E-mail enviado', description: 'Verifique sua caixa de entrada para redefinir a senha.' });
        } catch (error) {
            toast({ title: 'Erro', description: 'Não foi possível enviar o link de recuperação.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden p-8">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-[#1e3a8a]">Recuperar Senha</h1>
                    <p className="text-[#475569] text-sm mt-2">Enviaremos um link para redefinir sua senha.</p>
                </div>

                {!sent ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm font-semibold text-[#1e293b] mb-1 block">Seu E-mail</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none" placeholder="seu@email.com" />
                            </div>
                        </div>

                        <Button type="submit" className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white py-6" disabled={loading}>
                            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Send className="w-5 h-5 mr-2" />}
                            Enviar Link
                        </Button>
                    </form>
                ) : (
                    <div className="text-center p-4 bg-green-50 text-green-800 rounded-lg border border-green-200 mb-6">
                        <p className="font-medium">Pronto! Verifique seu e-mail.</p>
                        <p className="text-sm mt-1">Se não encontrar, verifique a pasta de spam.</p>
                    </div>
                )}

                <div className="mt-6 text-center">
                    <Link to="/login" className="inline-flex items-center text-sm text-slate-500 hover:text-blue-600 font-medium">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Voltar para o Login
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default PasswordRecoveryPage;