import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign, Users, FileText, TrendingUp, CreditCard, Wallet,
  Calculator, Building, FileSignature, ClipboardList, ShoppingBag,
  BarChart3, Menu, X
} from 'lucide-react';

const GestaoEmpresarialLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { path: 'saldos-financas', label: 'Saldos e Finanças', icon: DollarSign },
    { path: 'rh-empresarial', label: 'RH Empresarial', icon: Users },
    { path: 'folha-pagamento', label: 'Folha de Pagamento', icon: FileText },
    { path: 'dre', label: 'DRE', icon: TrendingUp },
    { path: 'contas-pagar', label: 'Contas a Pagar', icon: CreditCard },
    { path: 'contas-receber', label: 'Contas a Receber', icon: Wallet },
    { path: 'gestao-customia', label: 'Gestão de Custos', icon: Calculator },
    { path: 'conciliacao-bancaria', label: 'Conciliação Bancária', icon: Building },
    { path: 'contratos', label: 'Contratos', icon: FileSignature },
    { path: 'ordem-servicos', label: 'Ordens de Serviço', icon: ClipboardList },
    { path: 'vendas', label: 'Vendas', icon: ShoppingBag },
    { path: 'relatorios', label: 'Relatórios', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            className="w-72 bg-white border-r border-slate-200 p-5 overflow-y-auto shadow-sm"
          >
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 mb-2">NenySoft</p>
              <h2 className="text-xl font-bold text-slate-900">Gestão Empresarial</h2>
              <p className="text-sm text-slate-500">ERP integrado com foco operacional e financeiro</p>
            </div>

            <div className="space-y-1">
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-200 px-4 md:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg md:text-xl font-bold text-slate-900">Painel empresarial</h1>
            <p className="text-sm text-slate-500">Operação, financeiro, vendas e relatórios em um único fluxo.</p>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-100 transition-colors"
            type="button"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default GestaoEmpresarialLayout;
