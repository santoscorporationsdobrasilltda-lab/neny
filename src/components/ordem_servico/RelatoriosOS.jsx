import React from 'react';
import { BarChart, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

const RelatoriosOS = () => {
    return (
        <div className="glass-effect p-8 text-center rounded-xl border border-white/10">
            <BarChart className="w-12 h-12 text-pink-400 mx-auto mb-4"/>
            <h3 className="text-xl font-bold text-white mb-2">Relatórios de Serviço</h3>
            <p className="text-slate-400 mb-6"> Gere relatórios gerenciais de produtividade e faturamento.</p>
            <Button className="bg-pink-600"><Download className="w-4 h-4 mr-2"/> Exportar Relatório</Button>
        </div>
    );
};
export default RelatoriosOS;