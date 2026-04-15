import React, { useEffect, useMemo } from 'react';
import { Fish, Scale, TrendingUp, Calendar } from 'lucide-react';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';

const ProducaoTab = () => {
    const { user } = useAuth();

    const { data: tanques, fetchAll: fetchTanques } = useSupabaseCrud('piscicultura40_tanques');
    const { data: safras, fetchAll: fetchSafras } = useSupabaseCrud('piscicultura40_safras');
    const { data: biometrias, fetchAll: fetchBiometrias } = useSupabaseCrud('piscicultura40_biometrias');

    useEffect(() => {
        if (user) {
            fetchTanques();
            fetchSafras();
            fetchBiometrias();
        }
    }, [user, fetchTanques, fetchSafras, fetchBiometrias]);

    const tanqueData = useMemo(() => {
        return tanques.map((tanque) => {
            const activeSafra = safras.find(
                (s) => s.tanque_id === tanque.id && s.status === 'Ativa'
            );

            const latestBiometria = [...biometrias]
                .filter((b) => b.tanque_id === tanque.id)
                .sort((a, b) => {
                    const da = a.data ? new Date(a.data).getTime() : 0;
                    const db = b.data ? new Date(b.data).getTime() : 0;
                    return db - da;
                })[0];

            const concludedSafras = safras.filter(
                (s) => s.tanque_id === tanque.id && s.status === 'Concluída'
            );

            const totalProduction = concludedSafras.reduce(
                (sum, s) => sum + Number(s.producao_total || 0),
                0
            );

            let daysInProduction = 0;
            if (activeSafra?.data_povoamento) {
                const start = new Date(activeSafra.data_povoamento);
                const now = new Date();
                const diff = now.getTime() - start.getTime();
                daysInProduction = Math.floor(diff / (1000 * 60 * 60 * 24));
            }

            let estimatedBiomass = 0;
            if (activeSafra && latestBiometria?.peso_medio) {
                estimatedBiomass =
                    (Number(activeSafra.quantidade_inicial || 0) * Number(latestBiometria.peso_medio || 0)) /
                    1000;
            }

            return {
                tanque,
                activeSafra,
                latestBiometria,
                totalProduction,
                daysInProduction,
                estimatedBiomass,
            };
        });
    }, [tanques, safras, biometrias]);

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-800">Painel de Produção Consolidada</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tanqueData.map(({ tanque, activeSafra, latestBiometria, totalProduction, daysInProduction, estimatedBiomass }) => (
                    <div
                        key={tanque.id}
                        className="bg-white p-6 rounded-xl shadow-sm border border-slate-200"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="font-bold text-lg text-slate-800">{tanque.codigo}</h4>
                                <p className="text-sm text-slate-500">
                                    {tanque.especie} - {tanque.tipo}
                                </p>
                            </div>

                            <span
                                className={`px-2 py-1 rounded text-xs font-bold ${activeSafra
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-slate-100 text-slate-500'
                                    }`}
                            >
                                {activeSafra ? 'Produzindo' : 'Parado'}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="bg-slate-50 p-3 rounded border border-slate-100">
                                <p className="text-slate-500 flex items-center gap-1">
                                    <Scale className="w-3 h-3" />
                                    Peso Médio
                                </p>
                                <p className="font-bold text-slate-800 text-lg">
                                    {latestBiometria?.peso_medio || 0} g
                                </p>
                            </div>

                            <div className="bg-slate-50 p-3 rounded border border-slate-100">
                                <p className="text-slate-500 flex items-center gap-1">
                                    <Fish className="w-3 h-3" />
                                    Estoque Est.
                                </p>
                                <p className="font-bold text-blue-600 text-lg">
                                    {estimatedBiomass.toFixed(1)} kg
                                </p>
                            </div>

                            <div className="bg-slate-50 p-3 rounded border border-slate-100">
                                <p className="text-slate-500 flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" />
                                    Prod. Acum.
                                </p>
                                <p className="font-bold text-green-600 text-lg">
                                    {totalProduction.toFixed(1)} kg
                                </p>
                            </div>

                            <div className="bg-slate-50 p-3 rounded border border-slate-100">
                                <p className="text-slate-500 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    Dias Prod.
                                </p>
                                <p className="font-bold text-slate-800 text-lg">{daysInProduction}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200">
                    <h3 className="font-semibold text-slate-700">Visão Geral Detalhada</h3>
                </div>

                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                        <tr>
                            <th className="p-4">Tanque</th>
                            <th className="p-4">Espécie</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Peso Médio (g)</th>
                            <th className="p-4">Biomassa (kg)</th>
                            <th className="p-4">Produção Total (kg)</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                        {tanqueData.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-slate-500">
                                    Nenhum dado de produção encontrado.
                                </td>
                            </tr>
                        ) : (
                            tanqueData.map(
                                ({ tanque, activeSafra, latestBiometria, totalProduction, estimatedBiomass }) => (
                                    <tr key={tanque.id} className="hover:bg-slate-50">
                                        <td className="p-4 font-bold">{tanque.codigo}</td>
                                        <td className="p-4">{tanque.especie}</td>
                                        <td className="p-4">
                                            <span
                                                className={`px-2 py-0.5 rounded text-xs ${activeSafra
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'text-slate-400'
                                                    }`}
                                            >
                                                {activeSafra ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </td>
                                        <td className="p-4">{latestBiometria?.peso_medio || '-'}</td>
                                        <td className="p-4">
                                            {estimatedBiomass > 0 ? estimatedBiomass.toFixed(1) : '-'}
                                        </td>
                                        <td className="p-4">{totalProduction.toFixed(1)}</td>
                                    </tr>
                                )
                            )
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProducaoTab;