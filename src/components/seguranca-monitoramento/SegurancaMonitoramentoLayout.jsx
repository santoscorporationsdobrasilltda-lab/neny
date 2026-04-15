import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Shield, Eye, Settings, Bell, MapPin, Brain, Activity, Radio } from 'lucide-react';

const SegurancaMonitoramentoLayout = () => {
    const location = useLocation();

    const tabs = [
        { path: 'painel', label: 'Monitoramento', icon: Eye },
        { path: 'cameras', label: 'Dispositivos', icon: Settings },
        { path: 'ia-config', label: 'Config. IA', icon: Brain },
        { path: 'ia-eventos', label: 'Eventos IA', icon: Activity },
        { path: 'alarmes', label: 'Central Alarmes', icon: Bell },
        { path: 'alarmes-config', label: 'Config. Alarmes', icon: Settings },
        { path: 'rastreamento', label: 'Rastreamento', icon: MapPin },
        { path: 'rastreamento-config', label: 'Config. Rastrea.', icon: Radio },
    ];

    return (
        <div className="space-y-6">
            <Helmet>
                <title>Segurança e Monitoramento | NenySoft</title>
            </Helmet>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#1e3a8a] flex items-center gap-2">
                        <Shield className="w-8 h-8" /> Segurança Eletrônica
                    </h1>
                    <p className="text-slate-500">Monitoramento, IA, Alarmes e Rastreamento Integrado</p>
                </div>
            </div>

            <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
                <nav className="flex space-x-1 min-w-max">
                    {tabs.map((tab) => {
                        const isActive = location.pathname.includes(tab.path);
                        return (
                            <NavLink
                                key={tab.path}
                                to={tab.path}
                                className={`
                                    flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                                    ${isActive 
                                        ? 'bg-blue-50 text-blue-700 shadow-sm' 
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }
                                `}
                            >
                                <tab.icon className={`w-4 h-4 mr-2 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                                {tab.label}
                            </NavLink>
                        );
                    })}
                </nav>
            </div>

            <div className="min-h-[600px]">
                <Outlet />
            </div>
        </div>
    );
};

export default SegurancaMonitoramentoLayout;