import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Banknote, Link2, Unlink2, GitCompareArrows, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import useLocalStorage from '@/hooks/useLocalStorage';
import { v4 as uuidv4 } from 'uuid';

const mockBankTransactions = [
    { id: uuidv4(), date: '2025-09-15', description: 'TRANSF PIX - SOJA LTDA', amount: 7500, type: 'credit' },
    { id: uuidv4(), date: '2025-09-12', description: 'PAG FORN AGROINSUMOS', amount: -1200, type: 'debit' },
    { id: uuidv4(), date: '2025-09-11', description: 'COMPRA CARTAO - POSTO FAZENDAO', amount: -350, type: 'debit' },
    { id: uuidv4(), date: '2025-09-06', description: 'DEB AUT - OFICINA DIESEL', amount: -800, type: 'debit' },
    { id: uuidv4(), date: '2025-09-02', description: 'TRANSF PIX - JOAO SILVA', amount: 2500, type: 'credit' },
];

const BankConnectModal = ({ onClose, onConnect }) => {
    const [connecting, setConnecting] = useState(false);
    const banks = ['Banco do Brasil', 'Bradesco', 'Itaú', 'Santander', 'Caixa', 'Sicoob'];

    const handleConnect = (bank) => {
        setConnecting(true);
        setTimeout(() => {
            onConnect(bank);
            setConnecting(false);
            onClose();
        }, 1500);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="glass-effect rounded-2xl p-8 w-full max-w-2xl"
                onClick={e => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold gradient-text mb-6">Conectar Conta Bancária</h2>
                <p className="text-slate-600 mb-6">Selecione seu banco para simular a importação do extrato. Esta é uma demonstração e não utiliza dados reais.</p>
                {connecting ? (
                    <div className="flex flex-col items-center justify-center h-48">
                        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                        <p className="mt-4 text-slate-600">Conectando...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {banks.map(bank => (
                            <button key={bank} onClick={() => handleConnect(bank)} className="p-4 bg-white/50 rounded-lg shadow-sm hover:bg-white hover:shadow-lg transition-all text-center font-semibold text-slate-800">
                                {bank}
                            </button>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

const ConciliacaoBancaria = () => {
    const { toast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [connectedBank, setConnectedBank] = useLocalStorage('fazenda_connected_bank', null);
    const [bankTransactions, setBankTransactions] = useLocalStorage('fazenda_bank_transactions', []);
    const [internalTransactions] = useLocalStorage('fazenda_transactions', []);
    const [reconciledPairs, setReconciledPairs] = useLocalStorage('fazenda_reconciled_pairs', []);

    const [selectedInternal, setSelectedInternal] = useState(null);
    const [selectedBank, setSelectedBank] = useState(null);

    const handleConnect = (bank) => {
        setConnectedBank(bank);
        setBankTransactions(mockBankTransactions);
        toast({
            title: `✅ Conectado ao ${bank}!`,
            description: "Extrato bancário simulado importado com sucesso.",
        });
    };

    const handleDisconnect = () => {
        setConnectedBank(null);
        setBankTransactions([]);
        setReconciledPairs([]);
        toast({ title: "🔌 Desconectado", description: "A conexão com o banco foi removida." });
    };

    const handleReconcile = () => {
        if (selectedInternal && selectedBank) {
            setReconciledPairs([...reconciledPairs, { internalId: selectedInternal, bankId: selectedBank }]);
            setSelectedInternal(null);
            setSelectedBank(null);
            toast({ title: "🤝 Lançamentos conciliados!", variant: "success" });
        } else {
            toast({ title: "⚠️ Seleção incompleta", description: "Selecione um lançamento de cada lado para conciliar.", variant: "destructive" });
        }
    };

    const unreconciledInternal = useMemo(() => internalTransactions.filter(t => !reconciledPairs.some(p => p.internalId === t.id)), [internalTransactions, reconciledPairs]);
    const unreconciledBank = useMemo(() => bankTransactions.filter(t => !reconciledPairs.some(p => p.bankId === t.id)), [bankTransactions, reconciledPairs]);

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-2xl font-bold text-slate-800">Conciliação Bancária</h2>
                {!connectedBank ? (
                    <Button onClick={() => setIsModalOpen(true)} className="btn-primary">
                        <Link2 className="w-4 h-4 mr-2" /> Conectar Banco
                    </Button>
                ) : (
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-green-600 font-semibold">
                            <Banknote className="w-5 h-5" /> Conectado ao {connectedBank}
                        </div>
                        <Button onClick={handleDisconnect} variant="destructive" size="sm">
                            <Unlink2 className="w-4 h-4 mr-2" /> Desconectar
                        </Button>
                    </div>
                )}
            </div>

            {!connectedBank ? (
                <div className="glass-effect rounded-2xl p-12 text-center">
                    <Banknote className="mx-auto h-12 w-12 text-slate-400" />
                    <h3 className="mt-4 text-lg font-medium text-slate-800">Nenhum banco conectado</h3>
                    <p className="mt-1 text-sm text-slate-500">Conecte uma conta para começar a conciliação.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="flex flex-col items-center gap-4">
                         <Button onClick={handleReconcile} disabled={!selectedInternal || !selectedBank} className="btn-success shadow-lg">
                            <GitCompareArrows className="w-5 h-5 mr-2" /> Conciliar Selecionados
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="glass-effect rounded-2xl p-4">
                            <h3 className="font-bold text-lg text-slate-800 mb-4 text-center">Lançamentos Web Zoe</h3>
                            <div className="space-y-2 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
                                {unreconciledInternal.map(t => (
                                    <div key={t.id} onClick={() => setSelectedInternal(t.id)} className={`p-3 rounded-lg cursor-pointer border-2 ${selectedInternal === t.id ? 'border-blue-500 bg-blue-50' : 'border-transparent bg-white/60 hover:bg-white'}`}>
                                        <div className="flex justify-between items-center">
                                            <p className="font-medium text-slate-800 flex-1 truncate">{t.description}</p>
                                            <p className={`font-semibold ml-2 ${t.type === 'Receita' ? 'text-green-600' : 'text-red-600'}`}>
                                                R$ {t.amount.toLocaleString('pt-BR')}
                                            </p>
                                        </div>
                                        <p className="text-sm text-slate-500">{t.date}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="glass-effect rounded-2xl p-4">
                            <h3 className="font-bold text-lg text-slate-800 mb-4 text-center">Extrato Bancário ({connectedBank})</h3>
                            <div className="space-y-2 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
                                {unreconciledBank.map(t => (
                                    <div key={t.id} onClick={() => setSelectedBank(t.id)} className={`p-3 rounded-lg cursor-pointer border-2 ${selectedBank === t.id ? 'border-purple-500 bg-purple-50' : 'border-transparent bg-white/60 hover:bg-white'}`}>
                                        <div className="flex justify-between items-center">
                                            <p className="font-medium text-slate-800 flex-1 truncate">{t.description}</p>
                                            <p className={`font-semibold ml-2 ${t.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                                R$ {Math.abs(t.amount).toLocaleString('pt-BR')}
                                            </p>
                                        </div>
                                        <p className="text-sm text-slate-500">{t.date}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {reconciledPairs.length > 0 && (
                 <div className="glass-effect rounded-2xl p-6">
                    <h3 className="font-bold text-lg text-green-600 mb-4 flex items-center gap-2"><Check /> Lançamentos Conciliados</h3>
                     <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                         {reconciledPairs.map(p => {
                            const internal = internalTransactions.find(t => t.id === p.internalId);
                            const bank = bankTransactions.find(t => t.id === p.bankId);
                            if (!internal || !bank) return null;
                            return (
                                <div key={p.internalId} className="p-2 bg-green-50/50 rounded-lg flex items-center justify-between gap-4">
                                    <p className="text-sm text-slate-700 flex-1 truncate">{internal.description}</p>
                                    <GitCompareArrows className="text-green-500"/>
                                    <p className="text-sm text-slate-700 flex-1 truncate">{bank.description}</p>
                                </div>
                            )
                         })}
                    </div>
                 </div>
            )}


            {isModalOpen && <BankConnectModal onClose={() => setIsModalOpen(false)} onConnect={handleConnect} />}
        </motion.div>
    );
};

export default ConciliacaoBancaria;