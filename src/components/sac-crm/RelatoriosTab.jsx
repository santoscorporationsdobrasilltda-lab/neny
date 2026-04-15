import React from 'react';
import RelatoriosSACAvancado from './RelatoriosSACAvancado';

const RelatoriosTab = () => {
    return (
        <div className="space-y-4">
            <div className="mb-4">
                <h2 className="text-2xl font-bold text-[#1e3a8a]">Relatórios Avançados (BI)</h2>
                <p className="text-slate-500">Análise de métricas e exportação de dados do SAC e CRM.</p>
            </div>
            <RelatoriosSACAvancado />
        </div>
    );
};

export default RelatoriosTab;