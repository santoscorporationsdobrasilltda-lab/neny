import React, { useRef } from 'react';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';
import { motion } from 'framer-motion';

const QRCodeDisplay = ({ value, title, onClose }) => {
  const qrRef = useRef();

  const downloadQRCode = () => {
    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    
    let downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = `${title ? title.replace(/\s+/g, '_') : 'qrcode'}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl p-6 w-full max-w-sm text-center shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-900">{title || 'QR Code'}</h3>
            <Button variant="ghost" size="sm" onClick={onClose}><X className="w-4 h-4"/></Button>
        </div>
        
        <div className="flex justify-center mb-6" ref={qrRef}>
            <QRCode 
                value={value || "https://neny.systems"} 
                size={200}
                level={"H"}
                includeMargin={true}
            />
        </div>
        
        <div className="text-xs text-slate-500 mb-4 break-all">
            {value}
        </div>

        <Button onClick={downloadQRCode} className="w-full bg-indigo-600 hover:bg-indigo-700">
            <Download className="w-4 h-4 mr-2" /> Baixar Imagem
        </Button>
      </motion.div>
    </div>
  );
};

export default QRCodeDisplay;