import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ModulesSelection from './ModulesSelection';
import ModuleLogin from './ModuleLogin';
import ModuleDashboard from './ModuleDashboard';

const ModuleLoginRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<ModulesSelection />} />
      <Route path="/:moduloId/login" element={<ModuleLogin />} />
      <Route path="/:moduloId/dashboard" element={<ModuleDashboard />} />
      <Route path="*" element={<Navigate to="/modulos" />} />
    </Routes>
  );
};

export default ModuleLoginRouter;