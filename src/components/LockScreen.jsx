import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const LockScreen = ({ module }) => {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(false);
    const { checkPassword } = useAuth();
    const { toast } = useToast();

    const handleSubmit = (e) => {
        e.preventDefault();
        setError(false);
        if (checkPassword(module, password)) {
            toast({
                title: `✅ Módulo ${module} Desbloqueado!`,
                description: 'Acesso concedido com sucesso.',
            });
        } else {
            setError(true);
            toast({
                title: '❌ Acesso Negado',
                description: 'A senha informada está incorreta.',
                variant: 'destructive'
            });
        }
    };

    return (
        <motion.div 
            className="w-full h-full flex flex-col items-center justify-center p-6 glass-effect rounded-2xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-rose-600 rounded-full flex items-center justify-center mb-6">
                <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Módulo Protegido</h1>
            <p className="text-slate-600 mb-6 text-center">
                Para acessar o módulo <span className="font-bold capitalize">{module}</span>, por favor, insira a senha.
            </p>
            <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
                <div className="relative">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Digite a senha"
                        className={`input-field pr-12 text-center ${error ? 'border-red-500' : ''}`}
                    />
                    <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>
                <Button type="submit" className="w-full btn-primary">
                    <Lock className="w-4 h-4 mr-2" />
                    Desbloquear
                </Button>
            </form>
             {error && (
                <motion.p 
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-red-500 text-sm mt-4 font-medium"
                >
                    Senha incorreta. Tente novamente.
                </motion.p>
            )}
        </motion.div>
    );
};

export default LockScreen;