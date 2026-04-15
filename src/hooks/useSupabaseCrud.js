import { useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const validateData = (tableName, data) => {
    const errors = [];
    if (!data) errors.push('Dados não fornecidos.');
    return errors;
};

const extractErrorMessage = (err, fallback) => {
    if (!err) return fallback;
    if (typeof err === 'string') return err;
    return err.message || err.error_description || err.details || fallback;
};

const tryOrder = async (query, from, to) => {
    const orderAttempts = [
        ['created_at', false],
        ['updated_at', false],
        ['id', false],
    ];

    for (const [column, ascending] of orderAttempts) {
        const { data, error, count } = await query.order(column, { ascending }).range(from, to);
        if (!error) return { data, count };
        const message = extractErrorMessage(error, 'Erro ao ordenar registros.');
        const missingColumn = /column .* does not exist|could not find the column/i.test(message);
        if (!missingColumn) throw error;
    }

    const { data, error, count } = await query.range(from, to);
    if (error) throw error;
    return { data, count };
};

export const useSupabaseCrud = (tableName) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { toast } = useToast();

    const fetchAll = useCallback(async (page = 1, limit = 20, searchCol = null, searchVal = null) => {
        setLoading(true);
        setError(null);

        try {
            let query = supabase.from(tableName).select('*', { count: 'exact' });

            if (searchCol && searchVal) {
                query = query.ilike(searchCol, `%${searchVal}%`);
            }

            const from = Math.max(0, (page - 1) * limit);
            const to = from + Math.max(1, limit) - 1;
            const { data: result, count } = await tryOrder(query, from, to);

            setData(Array.isArray(result) ? result : []);
            return { data: Array.isArray(result) ? result : [], count: count || 0 };
        } catch (err) {
            const message = extractErrorMessage(err, 'Não foi possível carregar os dados.');
            setError(message);
            toast({ title: 'Erro ao buscar dados', description: message, variant: 'destructive' });
            return { data: [], count: 0 };
        } finally {
            setLoading(false);
        }
    }, [tableName, toast]);

    const create = async (newData) => {
        setLoading(true);
        setError(null);

        const validationErrors = validateData(tableName, newData);
        if (validationErrors.length > 0) {
            const message = validationErrors.join(', ');
            setError(message);
            toast({ title: 'Erro de validação', description: message, variant: 'destructive' });
            setLoading(false);
            return null;
        }

        try {
            const { data: insertedData, error: insertError } = await supabase
                .from(tableName)
                .insert([newData])
                .select()
                .single();

            if (insertError) throw insertError;
            setData((prev) => [insertedData, ...prev]);
            toast({ title: 'Sucesso', description: 'Registro criado com sucesso.' });
            return insertedData;
        } catch (err) {
            const message = extractErrorMessage(err, 'Não foi possível criar o registro.');
            setError(message);
            toast({ title: 'Erro ao criar', description: message, variant: 'destructive' });
            return null;
        } finally {
            setLoading(false);
        }
    };

    const update = async (id, updatedData) => {
        setLoading(true);
        setError(null);

        try {
            const { data: result, error: updateError } = await supabase
                .from(tableName)
                .update(updatedData)
                .eq('id', id)
                .select()
                .single();

            if (updateError) throw updateError;
            setData((prev) => prev.map((item) => (item.id === id ? result : item)));
            toast({ title: 'Sucesso', description: 'Registro atualizado com sucesso.' });
            return result;
        } catch (err) {
            const message = extractErrorMessage(err, 'Não foi possível atualizar o registro.');
            setError(message);
            toast({ title: 'Erro ao atualizar', description: message, variant: 'destructive' });
            return null;
        } finally {
            setLoading(false);
        }
    };

    const remove = async (id) => {
        setLoading(true);
        setError(null);

        try {
            const { error: deleteError } = await supabase.from(tableName).delete().eq('id', id);
            if (deleteError) throw deleteError;

            setData((prev) => prev.filter((item) => item.id !== id));
            toast({ title: 'Sucesso', description: 'Registro excluído com sucesso.' });
            return true;
        } catch (err) {
            const message = extractErrorMessage(err, 'Não foi possível excluir o registro.');
            setError(message);
            toast({ title: 'Erro ao excluir', description: message, variant: 'destructive' });
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { data, loading, error, fetchAll, create, update, remove, setData };
};
