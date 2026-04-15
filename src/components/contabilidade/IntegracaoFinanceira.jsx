import React from 'react';
import { motion } from 'framer-motion';
import { Link as LinkIcon, AlertCircle } from 'lucide-react';

const IntegracaoFinanceira = () => {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h2 className="text-2xl font-bold text-black">Integração Financeira</h2>
            <div className="glass-effect p-8 rounded-xl border border-white/10 text-center">
                <LinkIcon className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Conciliação Automática</h3>
                <p className="text-slate-400">Integração de Contas a Pagar/Receber com Contabilidade em desenvolvimento.</p>
                <div className="mt-6 flex justify-center gap-4 text-left">
                    <div className="bg-white/5 p-4 rounded-lg">
                        <p className="text-sm text-slate-400">Lançamentos Pendentes</p>
                        <p className="text-2xl font-bold text-orange-400">12</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-lg">
                        <p className="text-sm text-slate-400">Conciliados (Mês)</p>
                        <p className="text-2xl font-bold text-green-400">145</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
export default IntegracaoFinanceira;