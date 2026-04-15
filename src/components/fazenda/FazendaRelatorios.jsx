import React from 'react';
import RelatoriosFazendaAvancado from '../fazenda50/RelatoriosFazendaAvancado';

const FazendaRelatorios = () => {
    return (
        <div className="p-6 space-y-4 max-w-7xl mx-auto">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#1e3a8a]">Relatórios Fazenda (BI)</h2>
                <p className="text-slate-500">Métricas analíticas em tempo real do agronegócio.</p>
            </div>
            <RelatoriosFazendaAvancado />
        </div>
    );
};

export default FazendaRelatorios;