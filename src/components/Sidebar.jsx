import React, { useMemo, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    DollarSign,
    ShoppingCart,
    Archive,
    Users,
    Settings,
    Wrench,
    ChevronDown,
    ChevronRight,
    LogOut,
    Briefcase,
    Calculator,
    Truck,
    BarChart2,
    BookOpen,
    Tractor,
    Fish,
    Shield,
    MessageSquare,
    Eye,
    Droplets,
    ClipboardList,
    Sprout,
    Box,
    FileText,
    Bot,
    QrCode,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { useAllowedModules } from '@/hooks/useAllowedModules';

const Sidebar = ({ isSidebarOpen }) => {
    const auth = useAuth();
    const logoutFn = auth?.logout || auth?.signOut;
    const navigate = useNavigate();
    const { toast } = useToast();
    const { client, loading: modulesLoading, canAccess } = useAllowedModules();

    const [openSubmenu, setOpenSubmenu] = useState('gestao');

    const handleLogout = async () => {
        try {
            if (logoutFn) {
                await logoutFn();
            }
            navigate('/login');
            toast({
                title: 'Logout realizado',
                description: 'Até logo!',
            });
        } catch (error) {
            console.error(error);
            toast({
                title: 'Erro ao sair',
                description: 'Não foi possível encerrar a sessão.',
                variant: 'destructive',
            });
        }
    };

    const toggleMenu = (menuId) => {
        setOpenSubmenu((prev) => (prev === menuId ? null : menuId));
    };

    const menuItems = [
        {
            title: 'Dashboard',
            icon: LayoutDashboard,
            path: '/dashboard',
            type: 'link',
            slug: null,
        },
        {
            title: 'SAC / CRM',
            icon: MessageSquare,
            path: '/sac-crm',
            type: 'link',
            slug: 'sac_crm',
        },
        {
            title: 'Ordem de Serviços',
            icon: FileText,
            path: '/ordem-servicos',
            type: 'link',
            slug: 'ordem_servicos',
        },
        {
            title: 'Fazenda 5.0',
            icon: Tractor,
            type: 'submenu',
            id: 'fazenda50',
            slug: 'fazenda50',
            items: [
                { title: 'Dashboard Rural', path: '/fazenda50/dashboard', icon: LayoutDashboard },
                { title: 'Bovinos & QR', path: '/fazenda50/bovinos', icon: Tractor },
                { title: 'Leitor Agro', path: '/fazenda50/leitor', icon: QrCode },
                { title: 'Sanidade Animal', path: '/fazenda50/sanidade', icon: ClipboardList },
                { title: 'Lavouras & Def.', path: '/fazenda50/lavouras', icon: Sprout },
                { title: 'Gestão Financeira', path: '/fazenda50/financeiro', icon: DollarSign },
                { title: 'Relatórios Agro', path: '/fazenda50/relatorios', icon: BarChart2 },
            ],
        },
        {
            title: 'Piscicultura 4.0',
            icon: Fish,
            type: 'submenu',
            id: 'piscicultura40',
            slug: 'piscicultura40',
            items: [
                { title: 'Tanques & IoT', path: '/piscicultura40/tanques', icon: Box },
                { title: 'Monitoramento', path: '/piscicultura40/monitoramento', icon: Droplets },
                { title: 'Safras', path: '/piscicultura40/safras', icon: Sprout },
                { title: 'Manejo & Prod.', path: '/piscicultura40/manejo', icon: ClipboardList },
            ],
        },
        {
            title: 'Segurança - Monitoramento',
            icon: Shield,
            type: 'submenu',
            id: 'seguranca-monitoramento',
            slug: 'seguranca_monitoramento',
            items: [
                { title: 'Painel Monitoramento', path: '/seguranca-monitoramento/painel', icon: Eye },
                { title: 'Config. Câmeras', path: '/seguranca-monitoramento/cameras', icon: Settings },
                { title: 'IA Config', path: '/seguranca-monitoramento/ia-config', icon: Bot },
                { title: 'Eventos IA', path: '/seguranca-monitoramento/ia-eventos', icon: Eye },
                { title: 'Central Alarmes', path: '/seguranca-monitoramento/alarmes', icon: Shield },
                { title: 'Alarmes Config', path: '/seguranca-monitoramento/alarmes-config', icon: Settings },
                { title: 'Rastreamento Veicular', path: '/seguranca-monitoramento/rastreamento', icon: Truck },
                { title: 'Rastreamento Config', path: '/seguranca-monitoramento/rastreamento-config', icon: Settings },
            ],
        },
        {
            title: 'Segurança Eletrônica',
            icon: Users,
            path: '/seguranca-eletronica',
            type: 'link',
            slug: 'seguranca_eletronica',
        },
        {
            title: 'SmartZap',
            icon: Bot,
            path: '/smartzap',
            type: 'link',
            slug: 'smartzap',
        },
        {
            title: 'Gestão Empresarial',
            icon: Briefcase,
            type: 'submenu',
            id: 'gestao',
            slug: 'gestao_empresarial',
            items: [
                { title: 'Financeiro', path: '/financeiro', icon: DollarSign },
                { title: 'Contabilidade', path: '/contabilidade', icon: BookOpen },
                { title: 'Vendas', path: '/vendas', icon: ShoppingCart },
                { title: 'Estoque', path: '/estoque', icon: Archive },
                { title: 'RH', path: '/rh', icon: Users },
                { title: 'Ordem de Serviço (Antigo)', path: '/ordem-servicos-old', icon: Wrench },
                { title: 'Compras', path: '/compras', icon: Truck },
            ],
        },
        {
            title: 'Relatórios e BI',
            icon: BarChart2,
            path: '/relatorios',
            type: 'link',
            slug: 'relatorios_bi',
        },
        {
            title: 'Utilitários',
            icon: Calculator,
            path: '/utilitarios',
            type: 'link',
            slug: 'utilitarios',
        },
        {
            title: 'Configurações',
            icon: Settings,
            path: '/configuracoes',
            type: 'link',
            slug: 'configuracoes',
        },
    ];

    const visibleMenuItems = useMemo(() => {
        if (modulesLoading) {
            // Evita "flash" de permissões mostrando tudo enquanto carrega
            return menuItems.filter((item) => item.slug === null);
        }

        return menuItems.filter((item) => canAccess(item.slug));
    }, [modulesLoading, canAccess]);

    return (
        <motion.aside
            className={`fixed left-0 top-0 h-screen bg-white border-r border-slate-200 text-[#1e293b] flex flex-col transition-all duration-300 z-50 ${isSidebarOpen ? 'w-64' : 'w-20'
                }`}
            initial={false}
            animate={{ width: isSidebarOpen ? '16rem' : '5rem' }}
        >
            <div className="p-6 border-b border-slate-200 bg-white">
                <div className="flex items-center justify-center">
                    {isSidebarOpen ? (
                        <span className="text-2xl font-bold text-[#1e3a8a]">
                            Neny<span className="text-[#3b82f6]">Soft</span>
                        </span>
                    ) : (
                        <span className="text-2xl font-bold text-[#1e3a8a]">N</span>
                    )}
                </div>

                {isSidebarOpen && client?.nome_fantasia ? (
                    <div className="mt-3 rounded-xl bg-blue-50 px-3 py-2 text-xs text-blue-900 border border-blue-100">
                        <div className="font-semibold">Cliente vinculado</div>
                        <div className="truncate">{client.nome_fantasia}</div>
                    </div>
                ) : null}
            </div>

            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
                {visibleMenuItems.map((item, index) => {
                    if (item.type === 'link') {
                        return (
                            <NavLink
                                key={`${item.title}-${index}`}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                        ? 'bg-[#3b82f6] text-white shadow-md font-medium'
                                        : 'text-[#64748b] hover:bg-slate-100 hover:text-[#1e3a8a]'
                                    } ${!isSidebarOpen ? 'justify-center' : ''}`
                                }
                                title={!isSidebarOpen ? item.title : ''}
                            >
                                <item.icon
                                    className={`w-5 h-5 ${isSidebarOpen ? 'mr-3' : 'mx-auto'
                                        }`}
                                />
                                {isSidebarOpen && <span className="font-medium text-sm">{item.title}</span>}
                            </NavLink>
                        );
                    }

                    if (item.type === 'submenu') {
                        const isOpen = openSubmenu === item.id;

                        return (
                            <div key={`${item.id}-${index}`} className="space-y-1">
                                <button
                                    type="button"
                                    onClick={() => isSidebarOpen && toggleMenu(item.id)}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 text-[#64748b] hover:bg-slate-100 hover:text-[#1e3a8a] ${!isSidebarOpen ? 'justify-center' : ''
                                        }`}
                                    title={!isSidebarOpen ? item.title : ''}
                                >
                                    <div className="flex items-center">
                                        <item.icon className={`w-5 h-5 ${isSidebarOpen ? 'mr-3' : ''}`} />
                                        {isSidebarOpen && <span className="font-medium text-sm">{item.title}</span>}
                                    </div>

                                    {isSidebarOpen &&
                                        (isOpen ? (
                                            <ChevronDown className="w-4 h-4" />
                                        ) : (
                                            <ChevronRight className="w-4 h-4" />
                                        ))}
                                </button>

                                <AnimatePresence>
                                    {isSidebarOpen && isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden pl-4 space-y-1"
                                        >
                                            {item.items.map((subItem, subIndex) => (
                                                <NavLink
                                                    key={`${subItem.path}-${subIndex}`}
                                                    to={subItem.path}
                                                    className={({ isActive }) =>
                                                        `flex items-center px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${isActive
                                                            ? 'bg-blue-50 text-[#3b82f6] font-semibold border-l-4 border-[#3b82f6]'
                                                            : 'text-[#64748b] hover:text-[#1e3a8a] hover:bg-slate-50'
                                                        }`
                                                    }
                                                >
                                                    <subItem.icon className="w-4 h-4 mr-3 opacity-70" />
                                                    {subItem.title}
                                                </NavLink>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    }

                    return null;
                })}
            </nav>

            <div className="p-4 border-t border-slate-200 bg-white">
                <button
                    type="button"
                    onClick={handleLogout}
                    className={`flex items-center w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors ${!isSidebarOpen ? 'justify-center' : ''
                        }`}
                    title="Sair"
                >
                    <LogOut className={`w-5 h-5 ${isSidebarOpen ? 'mr-3' : ''}`} />
                    {isSidebarOpen && <span className="font-medium text-sm">Sair do Sistema</span>}
                </button>
            </div>
        </motion.aside>
    );
};

export default Sidebar;