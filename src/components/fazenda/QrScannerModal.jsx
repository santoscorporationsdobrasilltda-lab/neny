import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { QrCode, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const QrScannerModal = ({ onClose, onScanSuccess }) => {
    const [scanResult, setScanResult] = useState('');
    const { toast } = useToast();

    const handleSimulateScan = () => {
        // In a real application, this would use the camera.
        // Here, we'll just simulate a successful scan with a predefined value.
        const simulatedData = `BR-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
        setScanResult(simulatedData);
        onScanSuccess(simulatedData);
        toast({ title: 'Simulação de Leitura', description: 'QR Code simulado lido com sucesso.' });
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="glass-effect rounded-2xl p-6 w-full max-w-md relative"
                onClick={e => e.stopPropagation()}
            >
                <Button variant="ghost" size="icon" className="absolute top-4 right-4" onClick={onClose}>
                    <X className="h-6 w-6" />
                </Button>
                
                <h2 className="text-2xl font-bold gradient-text mb-4 text-center">Leitor de QR Code</h2>
                <p className="text-slate-600 mb-6 text-center">Aponte para o QR Code do animal. <br/>(Demonstração)</p>

                <div className="w-full aspect-square bg-slate-800 rounded-lg flex items-center justify-center mb-6">
                    <div className="relative w-2/3 h-2/3">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400 rounded-tl-lg"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400 rounded-tr-lg"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400 rounded-bl-lg"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400 rounded-br-lg"></div>
                        <div className="w-full h-1 bg-red-500 absolute top-1/2 animate-scan"></div>
                    </div>
                </div>

                <Button onClick={handleSimulateScan} className="w-full btn-primary">
                    <QrCode className="w-5 h-5 mr-2"/>
                    Simular Leitura
                </Button>
            </motion.div>
        </div>
    );
};

export default QrScannerModal;