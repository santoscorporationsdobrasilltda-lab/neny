import React from 'react';
import RelatoriosPisciculturaAvancado from '../RelatoriosPisciculturaAvancado';

const RelatorioProducaoTab = () => {
    return (
        <div className="space-y-4">
            <div className="mb-4">
                <h2 className="text-2xl font-bold text-[#1e3a8a]">Relatório de Produção (BI)</h2>
                <p className="text-slate-500">Métricas analíticas das safras e qualidades da água.</p>
            </div>
            <RelatoriosPisciculturaAvancado />
        </div>
    );
};

export default RelatorioProducaoTab;