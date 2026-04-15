import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
  Tractor,
  LayoutDashboard,
  Stethoscope,
  Sprout,
  DollarSign,
  Beef,
  FileText,
  QrCode,
  Building2,
  MapPin,
  Layers3,
} from 'lucide-react';
import { FazendaProvider, useFazendaContext } from './FazendaContext';

const LayoutContent = () => {
  const location = useLocation();
  const { fazendas, selectedFarmId, setSelectedFarmId, selectedFarm } = useFazendaContext();

  const tabs = [
    { path: 'dashboard', label: 'Dashboard Rural', icon: LayoutDashboard },
    { path: 'fazendas', label: 'Fazendas', icon: Building2 },
    { path: 'bovinos', label: 'Bovinos & QR', icon: Beef },
    { path: 'leitor', label: 'Leitor Agro', icon: QrCode },
    { path: 'sanidade', label: 'Sanidade Animal', icon: Stethoscope },
    { path: 'lavouras', label: 'Lavouras & Defensivos', icon: Sprout },
    { path: 'financeiro', label: 'Financeiro Rural', icon: DollarSign },
    { path: 'relatorios', label: 'Relatórios Agro', icon: FileText },
  ];

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Fazenda 5.0 | NenySoft</title>
      </Helmet>

      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1e3a8a] flex items-center gap-2">
            <Tractor className="w-8 h-8" /> Fazenda 5.0
          </h1>
          <p className="text-slate-500">Gestão agropecuária com visão consolidada por fazenda.</p>
        </div>

        <div className="w-full xl:w-auto grid grid-cols-1 md:grid-cols-[minmax(280px,1fr)_auto] gap-3 items-end">
          <div>
            <label className="text-xs uppercase tracking-wide text-slate-500 block mb-1">Fazenda em foco</label>
            <select
              className="w-full xl:w-[320px] p-2.5 border rounded-xl bg-white"
              value={selectedFarmId}
              onChange={(e) => setSelectedFarmId(e.target.value)}
            >
              <option value="">Todas as fazendas</option>
              {fazendas.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nome} {item.sigla ? `• ${item.sigla}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 min-w-[240px]">
            <div className="text-xs uppercase tracking-wide text-slate-500">Status do filtro</div>
            <div className="font-semibold text-slate-800 mt-1 flex items-center gap-2">
              <Layers3 className="w-4 h-4 text-blue-600" />
              {selectedFarm ? selectedFarm.nome : 'Visão consolidada'}
            </div>
            <div className="text-sm text-slate-500 mt-1">
              {selectedFarm
                ? [selectedFarm.sigla, selectedFarm.cidade, selectedFarm.estado].filter(Boolean).join(' • ') || 'Fazenda selecionada'
                : 'Os dashboards e cadastros mostram o consolidado geral.'}
            </div>
          </div>
        </div>
      </div>

      {selectedFarm && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500">Fazenda</div>
            <div className="font-semibold text-slate-800 mt-1">{selectedFarm.nome}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500">Sigla / código</div>
            <div className="font-semibold text-slate-800 mt-1">{[selectedFarm.sigla, selectedFarm.codigo].filter(Boolean).join(' • ') || '-'}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500">Localização</div>
            <div className="font-semibold text-slate-800 mt-1 flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" />{[selectedFarm.cidade, selectedFarm.estado].filter(Boolean).join(' / ') || '-'}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500">Responsável</div>
            <div className="font-semibold text-slate-800 mt-1">{selectedFarm.responsavel || '-'}</div>
          </div>
          {selectedFarm.observacoes && (
            <div className="md:col-span-4 text-sm text-slate-600 border-t border-slate-100 pt-3">
              <strong className="text-slate-700">Características:</strong> {selectedFarm.observacoes}
            </div>
          )}
        </div>
      )}

      <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        <nav className="flex space-x-1 min-w-max">
          {tabs.map((tab) => {
            const isActive = location.pathname.includes(tab.path);
            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive ? 'bg-[#3b82f6] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
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

const Fazenda50Layout = () => (
  <FazendaProvider>
    <LayoutContent />
  </FazendaProvider>
);

export default Fazenda50Layout;
