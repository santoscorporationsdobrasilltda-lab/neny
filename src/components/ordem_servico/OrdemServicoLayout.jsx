import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
    FileText,
    Users,
    Calendar,
    BarChart2,
    ClipboardList,
    DollarSign,
    Package,
    Truck,
    Paperclip,
    Cpu,
    MapPin,
} from 'lucide-react';

const OrdemServicoLayout = () => {
    const location = useLocation();

    const tabs = [
        { path: 'ordens-servico', label: 'Ordens de Serviço', icon: FileText },
        { path: 'cadastro-tecnicos', label: 'Técnicos', icon: Users },
        { path: 'agenda-escalas', label: 'Agenda e Escalas', icon: Calendar },
        { path: 'atividades', label: 'Atividades', icon: ClipboardList },
        { path: 'financeiro-os', label: 'Financeiro', icon: DollarSign },
        { path: 'materiais', label: 'Materiais', icon: Package },
        { path: 'estoque-tecnico', label: 'Estoque Técnico', icon: Truck },
        { path: 'anexos', label: 'Anexos', icon: Paperclip },
        { path: 'equipamentos', label: 'Equipamentos', icon: Cpu },
        { path: 'localizacao', label: 'Localização', icon: MapPin },
        { path: 'relatorios-os', label: 'Relatórios', icon: BarChart2 },
    ];

    return (
        <div className="space-y-6">
            <Helmet>
                <title>Gestão de OS | NenySoft</title>
            </Helmet>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#1e3a8a] flex items-center gap-2">
                        <FileText className="w-8 h-8" /> Gestão de Ordens de Serviço
                    </h1>
                    <p className="text-slate-500">Controle operacional, financeiro e gerencial de chamados e técnicos</p>
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
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
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

export default OrdemServicoLayout;
