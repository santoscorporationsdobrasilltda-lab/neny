import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SmartZapLayout from './SmartZapLayout';
import SmartZapDashboard from './SmartZapDashboard';
import ConversasTab from './ConversasTab';
import HistoricoTab from './HistoricoTab';
import FluxosTab from './FluxosTab';
import IntencoesTab from './IntencoesTab';
import ClientesTab from './ClientesTab';
import FunilTab from './FunilTab';
import BaseConhecimentoTab from './BaseConhecimentoTab';
import ConfigIATab from './ConfigIATab';
import WhatsAppConfigPage from './WhatsAppConfigPage';
import TemplatesPage from './TemplatesPage';
import AIConfigPage from './AIConfigPage';
import LogsPage from './LogsPage';

const SmartZapRouter = () => {
    return (
        <Routes>
            <Route path="/" element={<SmartZapLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<SmartZapDashboard />} />
                <Route path="conversas" element={<ConversasTab />} />
                <Route path="conversas/historico" element={<HistoricoTab />} />
                <Route path="bots/fluxos" element={<FluxosTab />} />
                <Route path="bots/intencoes" element={<IntencoesTab />} />
                <Route path="clientes" element={<ClientesTab />} />
                <Route path="vendas/funil" element={<FunilTab />} />
                <Route path="suporte/base-conhecimento" element={<BaseConhecimentoTab />} />
                <Route path="config/ia" element={<ConfigIATab />} />
                
                {/* Advanced Config Routes */}
                <Route path="config/whatsapp" element={<WhatsAppConfigPage />} />
                <Route path="config/templates" element={<TemplatesPage />} />
                <Route path="config/ia-avancado" element={<AIConfigPage />} />
                <Route path="logs" element={<LogsPage />} />
            </Route>
        </Routes>
    );
};

export default SmartZapRouter;