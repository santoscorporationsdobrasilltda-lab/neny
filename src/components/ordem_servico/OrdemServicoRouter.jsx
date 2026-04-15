import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import OrdemServicoLayout from './OrdemServicoLayout';
import TecnicosTab from './TecnicosTab';
import OrdensServicoTab from './OrdensServicoTab';
import AgendaEscalasTab from './AgendaEscalasTab';
import RelatoriosOSTab from './RelatoriosOSTab';
import AtividadesTab from './AtividadesTab';
import FinanceiroOSTab from './FinanceiroOSTab';
import MateriaisTab from './MateriaisTab';
import MateriaisTecnicoTab from './MateriaisTecnicoTab';
import AnexosTab from './AnexosTab';
import EquipamentosTab from './EquipamentosTab';
import LocalizacaoTab from './LocalizacaoTab';

const OrdemServicoRouter = () => {
    return (
        <Routes>
            <Route path="/" element={<OrdemServicoLayout />}>
                <Route index element={<Navigate to="ordens-servico" replace />} />
                <Route path="ordens-servico" element={<OrdensServicoTab />} />
                <Route path="cadastro-tecnicos" element={<TecnicosTab />} />
                <Route path="agenda-escalas" element={<AgendaEscalasTab />} />
                <Route path="atividades" element={<AtividadesTab />} />
                <Route path="financeiro-os" element={<FinanceiroOSTab />} />
                <Route path="materiais" element={<MateriaisTab />} />
                <Route path="estoque-tecnico" element={<MateriaisTecnicoTab />} />
                <Route path="anexos" element={<AnexosTab />} />
                <Route path="equipamentos" element={<EquipamentosTab />} />
                <Route path="localizacao" element={<LocalizacaoTab />} />
                <Route path="relatorios-os" element={<RelatoriosOSTab />} />
            </Route>
        </Routes>
    );
};

export default OrdemServicoRouter;
