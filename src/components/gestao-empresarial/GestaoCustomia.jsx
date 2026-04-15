import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, BarChart } from 'lucide-react';

const GestaoCustomia = () => {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Gestão de Custos</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/10 p-6 rounded-xl border border-white/20">
                    <h3 className="text-white font-bold mb-4 flex items-center"><PieChart className="mr-2"/> Centros de Custo</h3>
                    <ul className="space-y-3 text-slate-300">
                        <li className="flex justify-between"><span>Administrativo</span> <span>R$ 12.500,00</span></li>
                        <li className="flex justify-between"><span>Comercial</span> <span>R$ 8.200,00</span></li>
                        <li className="flex justify-between"><span>Operacional</span> <span>R$ 45.000,00</span></li>
                        <li className="flex justify-between"><span>TI</span> <span>R$ 5.300,00</span></li>
                    </ul>
                </div>
                <div className="bg-white/10 p-6 rounded-xl border border-white/20">
                     <h3 className="text-white font-bold mb-4 flex items-center"><BarChart className="mr-2"/> Custo por Produto (Estimado)</h3>
                     <p className="text-slate-400 text-sm mb-4">Baseado nos apontamentos de produção e compras recentes.</p>
                     {/* Placeholder for chart */}
                     <div className="h-40 bg-white/5 rounded flex items-center justify-center text-slate-500">
                        Gráfico de Análise de Custos
                     </div>
                </div>
            </div>
        </motion.div>
    );
};

export default GestaoCustomia;