import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

export const useAllowedModules = () => {
  const auth = useAuth();
  const currentUser = auth?.currentUser || auth?.user || null;

  const [loading, setLoading] = useState(true);
  const [allowedSlugs, setAllowedSlugs] = useState(['*']);
  const [client, setClient] = useState(null);
  const [hasClientBinding, setHasClientBinding] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!currentUser?.email) {
        if (!active) return;
        setAllowedSlugs(['*']);
        setClient(null);
        setHasClientBinding(false);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { data: cliente, error: clienteError } = await supabase
          .from('master_clientes')
          .select('id, nome_fantasia, status, login_email')
          .eq('login_email', currentUser.email)
          .maybeSingle();

        if (clienteError) throw clienteError;

        if (!active) return;

        if (!cliente) {
          setAllowedSlugs(['*']);
          setClient(null);
          setHasClientBinding(false);
          setLoading(false);
          return;
        }

        setClient(cliente);
        setHasClientBinding(true);

        if (cliente.status && cliente.status !== 'Ativo') {
          setAllowedSlugs([]);
          setLoading(false);
          return;
        }

        const { data: licencas, error: licencasError } = await supabase
          .from('master_clientes_modulos')
          .select('ativo, modulo:master_modulos(slug, ativo)')
          .eq('cliente_id', cliente.id)
          .eq('ativo', true);

        if (licencasError) throw licencasError;

        if (!active) return;

        const slugs = (licencas || [])
          .map((item) => item?.modulo)
          .filter((modulo) => modulo?.ativo && modulo?.slug)
          .map((modulo) => modulo.slug);

        setAllowedSlugs(slugs);
      } catch (err) {
        console.error('Falha ao carregar módulos permitidos:', err);
        if (!active) return;
        // Fallback seguro: não travar o sistema existente por erro de integração.
        setAllowedSlugs(['*']);
        setError(err);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [currentUser?.email]);

  const allowedSet = useMemo(() => new Set(allowedSlugs), [allowedSlugs]);

  const canAccess = (slug) => {
    if (!slug) return true;
    if (allowedSet.has('*')) return true;
    return allowedSet.has(slug);
  };

  return {
    loading,
    allowedSlugs,
    client,
    hasClientBinding,
    error,
    canAccess,
  };
};

export default useAllowedModules;
