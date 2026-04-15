import { useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import * as XLSX from 'xlsx';

export const useExportData = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = async (tableName) => {
        const { data, error } = await supabase.from(tableName).select('*');
        if (error) throw error;
        return data.map(row => ({ id: row.id, ...row.data, created_at: row.created_at }));
    };

    const exportCSV = async (tableName, fileName = 'export.csv') => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchData(tableName);
            if (data.length === 0) return;
            const headers = Object.keys(data[0]).join(',');
            const rows = data.map(obj => Object.values(obj).map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')).join('\n');
            const csv = `${headers}\n${rows}`;
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = fileName;
            link.click();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const exportXLSX = async (tableName, fileName = 'export.xlsx') => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchData(tableName);
            if (data.length === 0) return;
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Dados");
            XLSX.writeFile(wb, fileName);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return { exportCSV, exportXLSX, loading, error };
};