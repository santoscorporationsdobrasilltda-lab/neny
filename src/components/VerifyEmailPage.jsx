import React from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const VerifyEmailPage = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden p-8 text-center">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                    <Mail className="w-8 h-8 text-blue-600" />
                </div>
                
                <h1 className="text-2xl font-bold text-[#1e3a8a] mb-2">Verifique seu e-mail</h1>
                <p className="text-[#475569] text-sm mb-6">
                    Enviamos um link de confirmação para o seu e-mail. Por favor, clique no link para ativar sua conta e acessar o sistema.
                </p>

                <Button variant="outline" className="w-full mb-4">
                    Reenviar e-mail
                </Button>

                <Link to="/login" className="inline-flex items-center text-sm text-slate-500 hover:text-blue-600 font-medium">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Voltar para o Login
                </Link>
            </motion.div>
        </div>
    );
};

export default VerifyEmailPage;