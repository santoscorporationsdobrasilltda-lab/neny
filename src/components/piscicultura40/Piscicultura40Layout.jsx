import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Fish, Activity, Sprout, ClipboardList, Settings, Droplets } from 'lucide-react';

const Piscicultura40Layout = () => {
    const location = useLocation();

    const tabs = [
        { path: 'tanques', label: 'Tanques & Sensores', icon: Settings },
        { path: 'monitoramento', label: 'Monitoramento Água', icon: Droplets },
        { path: 'safras', label: 'Gestão de Safras', icon: Sprout },
        { path: 'manejo', label: 'Manejo & Produção', icon: ClipboardList },
    ];

    return (
        <div className="space-y-6">
            <Helmet>
                <title>Piscicultura 4.0 | NenySoft</title>
            </Helmet>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#1e3a8a] flex items-center gap-2">
                        <Fish className="w-8 h-8" /> Piscicultura 4.0
                    </h1>
                    <p className="text-slate-500">Gestão Avançada de Aquicultura e IoT</p>
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
                                        ? 'bg-[#3b82f6] text-white shadow-sm' 
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }
                                `}
                            >
                                <tab.icon className={`w-4 h-4 mr-2 ${isActive ? 'text-white' : 'text-slate-400'}`} />
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

export default Piscicultura40Layout;