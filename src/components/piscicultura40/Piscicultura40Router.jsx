import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Piscicultura40Layout from './Piscicultura40Layout';
import TanquesManager from './TanquesManager';
import LeituraAguaTab from './LeituraAguaTab';
import SafrasTab from './SafrasTab';
import ManejoManager from './ManejoManager';

const Piscicultura40Router = () => {
    return (
        <Routes>
            <Route path="/" element={<Piscicultura40Layout />}>
                <Route index element={<Navigate to="tanques" replace />} />
                <Route path="tanques" element={<TanquesManager />} />
                <Route path="monitoramento" element={<LeituraAguaTab />} />
                <Route path="safras" element={<SafrasTab />} />
                <Route path="manejo" element={<ManejoManager />} />
            </Route>
        </Routes>
    );
};

export default Piscicultura40Router;