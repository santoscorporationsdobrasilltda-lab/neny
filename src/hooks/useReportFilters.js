import { useState, useCallback } from 'react';

export const useReportFilters = (initialState = {}) => {
    const defaultFilters = {
        data_inicio: '',
        data_fim: '',
        status: 'Todos',
        tipo: 'Todos',
        ...initialState
    };

    const [filters, setFilters] = useState(defaultFilters);

    const setFilter = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const resetFilters = () => setFilters(defaultFilters);

    const applyFilters = useCallback((data, dateField = 'created_at') => {
        if (!data || !Array.isArray(data)) return [];

        return data.filter(item => {
            let isValid = true;

            // Date filtering
            if (filters.data_inicio) {
                const itemDate = new Date(item[dateField]);
                const startDate = new Date(filters.data_inicio);
                if (itemDate < startDate) isValid = false;
            }
            if (filters.data_fim) {
                const itemDate = new Date(item[dateField]);
                const endDate = new Date(filters.data_fim);
                endDate.setHours(23, 59, 59, 999);
                if (itemDate > endDate) isValid = false;
            }

            // Status filtering
            if (filters.status && filters.status !== 'Todos') {
                if (item.status !== filters.status) isValid = false;
            }

            // Tipo filtering
            if (filters.tipo && filters.tipo !== 'Todos') {
                if (item.tipo !== filters.tipo && item.tipo_atendimento !== filters.tipo) isValid = false;
            }

            return isValid;
        });
    }, [filters]);

    return { filters, setFilter, resetFilters, applyFilters };
};