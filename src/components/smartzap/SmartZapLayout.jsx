import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { 
    LayoutDashboard, MessageSquare, Bot, Users, 
    ShoppingBag, HelpCircle, Settings, History, Smartphone, FileText, Brain, Activity
} from 'lucide-react';

const SmartZapLayout = () => {
    const location = useLocation();

    const menuGroups = [
        {
            title: "Visão Geral",
            items: [
                { path: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            ]
        },
        {
            title: "Atendimento",
            items: [
                { path: 'conversas', label: 'Conversas ao Vivo', icon: MessageSquare },
                { path: 'conversas/historico', label: 'Histórico', icon: History },
                { path: 'clientes', label: 'Clientes', icon: Users },
            ]
        },
        {
            title: "Automação",
            items: [
                { path: 'bots/fluxos', label: 'Fluxos', icon: Bot },
                { path: 'bots/intencoes', label: 'Intenções', icon: Bot },
            ]
        },
        {
            title: "Configurações",
            items: [
                { path: 'config/whatsapp', label: 'WhatsApp API', icon: Smartphone },
                { path: 'config/templates', label: 'Templates HSM', icon: FileText },
                { path: 'config/ia-avancado', label: 'IA OpenAI/Claude', icon: Brain },
                { path: 'logs', label: 'Auditoria & Logs', icon: Activity },
            ]
        }
    ];

    return (
        <div className="space-y-6">
            <Helmet>
                <title>SmartZap | NenySoft</title>
            </Helmet>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#1e3a8a] flex items-center gap-2">
                        <MessageSquare className="w-8 h-8 text-green-500" /> SmartZap AI
                    </h1>
                    <p className="text-slate-500">WhatsApp CRM, Inteligência Artificial e Automação</p>
                </div>
            </div>

            <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
                <nav className="flex space-x-1 min-w-max">
                    {menuGroups.flatMap(group => group.items).map((tab) => {
                        const isActive = location.pathname.includes(tab.path) && (tab.path !== 'conversas' || location.pathname === '/smartzap/conversas');
                        return (
                            <NavLink
                                key={tab.path}
                                to={tab.path}
                                className={({ isActive }) => `
                                    flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap
                                    ${isActive 
                                        ? 'bg-green-50 text-green-700 border border-green-200 shadow-sm' 
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }
                                `}
                            >
                                <tab.icon className={`w-4 h-4 mr-2 ${location.pathname.includes(tab.path) ? 'text-green-600' : 'text-slate-400'}`} />
                                {tab.label}
                            </NavLink>
                        );
                    })}
                </nav>
            </div>

            <div className="min-h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Outlet />
            </div>
        </div>
    );
};

export default SmartZapLayout;