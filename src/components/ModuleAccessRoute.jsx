import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAllowedModules } from '@/hooks/useAllowedModules';

const ModuleAccessRoute = ({ moduleSlug, children }) => {
  const { loading, canAccess } = useAllowedModules();

  if (loading) {
    return (
      <div className="w-full min-h-[240px] flex items-center justify-center text-slate-500">
        Verificando licença do módulo...
      </div>
    );
  }

  if (!canAccess(moduleSlug)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ModuleAccessRoute;
