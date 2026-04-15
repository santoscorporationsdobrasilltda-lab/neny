import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';

const STORAGE_KEY = 'fazenda50:selectedFarmId';
const FazendaContext = createContext(null);

const normalize = (value) => String(value || '').trim().toLowerCase();

export const FazendaProvider = ({ children }) => {
  const { user } = useAuth();
  const { data: fazendas, fetchAll: fetchFazendas } = useSupabaseCrud('fazenda50_fazendas');
  const [selectedFarmId, setSelectedFarmIdState] = useState(() => {
    if (typeof window === 'undefined') return '';
    return window.localStorage.getItem(STORAGE_KEY) || '';
  });

  useEffect(() => {
    if (user) fetchFazendas(1, 1000);
  }, [user, fetchFazendas]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (selectedFarmId) window.localStorage.setItem(STORAGE_KEY, selectedFarmId);
    else window.localStorage.removeItem(STORAGE_KEY);
  }, [selectedFarmId]);

  useEffect(() => {
    if (!fazendas.length) {
      if (selectedFarmId) setSelectedFarmIdState('');
      return;
    }

    if (selectedFarmId && fazendas.some((item) => item.id === selectedFarmId)) return;
    setSelectedFarmIdState('');
  }, [fazendas, selectedFarmId]);

  const setSelectedFarmId = useCallback((value) => {
    setSelectedFarmIdState(value || '');
  }, []);

  const selectedFarm = useMemo(
    () => fazendas.find((item) => item.id === selectedFarmId) || null,
    [fazendas, selectedFarmId]
  );

  const getFarmByRecord = useCallback(
    (record) => {
      if (!record) return null;
      if (record.fazenda_id) {
        const byId = fazendas.find((item) => item.id === record.fazenda_id);
        if (byId) return byId;
      }

      const text = normalize(record.fazenda || record.fazenda_nome || record.farm_name);
      if (!text) return null;
      return (
        fazendas.find((item) => [item.nome, item.codigo, item.sigla].filter(Boolean).some((value) => normalize(value) === text)) || null
      );
    },
    [fazendas]
  );

  const matchesSelectedFarm = useCallback(
    (record) => {
      if (!selectedFarmId) return true;
      if (!record) return false;
      if (record.fazenda_id === selectedFarmId) return true;
      const resolved = getFarmByRecord(record);
      return resolved?.id === selectedFarmId;
    },
    [selectedFarmId, getFarmByRecord]
  );

  const value = useMemo(
    () => ({
      fazendas,
      refreshFazendas: fetchFazendas,
      selectedFarmId,
      setSelectedFarmId,
      selectedFarm,
      getFarmByRecord,
      matchesSelectedFarm,
      hasSelectedFarm: Boolean(selectedFarmId),
    }),
    [fazendas, fetchFazendas, selectedFarmId, setSelectedFarmId, selectedFarm, getFarmByRecord, matchesSelectedFarm]
  );

  return <FazendaContext.Provider value={value}>{children}</FazendaContext.Provider>;
};

export const useFazendaContext = () => {
  const context = useContext(FazendaContext);
  if (!context) throw new Error('useFazendaContext deve ser usado dentro de FazendaProvider');
  return context;
};
