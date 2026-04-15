import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SegurancaMonitoramentoLayout from './SegurancaMonitoramentoLayout';
import MonitoramentoTab from './MonitoramentoTab';
import CamerasConfigTab from './CamerasConfigTab';
import AlarmesTab from './AlarmesTab';
import RastreamentoTab from './RastreamentoTab';
import IAConfigTab from './IAConfigTab';
import EventosIATab from './EventosIATab';
import AlarmeConfigTab from './AlarmeConfigTab';
import RastreamentoConfigTab from './RastreamentoConfigTab';

const SegurancaMonitoramentoRouter = () => {
    return (
        <Routes>
            <Route path="/" element={<SegurancaMonitoramentoLayout />}>
                <Route index element={<Navigate to="painel" replace />} />
                <Route path="painel" element={<MonitoramentoTab />} />
                <Route path="cameras" element={<CamerasConfigTab />} />
                <Route path="ia-config" element={<IAConfigTab />} />
                <Route path="ia-eventos" element={<EventosIATab />} />
                <Route path="alarmes" element={<AlarmesTab />} />
                <Route path="alarmes-config" element={<AlarmeConfigTab />} />
                <Route path="rastreamento" element={<RastreamentoTab />} />
                <Route path="rastreamento-config" element={<RastreamentoConfigTab />} />
            </Route>
        </Routes>
    );
};

export default SegurancaMonitoramentoRouter;