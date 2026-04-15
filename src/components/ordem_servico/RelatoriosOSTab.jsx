import React from 'react';
import RelatoriosOSAvancado from './RelatoriosOSAvancado';

const RelatoriosOSTab = () => {
    return (
        <div className="space-y-4">
            <div className="mb-4">
                <h2 className="text-2xl font-bold text-[#1e3a8a]">Relatórios de Operação (BI)</h2>
                <p className="text-slate-500">Métricas completas e exportação do módulo de Ordens de Serviço.</p>
            </div>
            <RelatoriosOSAvancado />
        </div>
    );
};

export default RelatoriosOSTab;