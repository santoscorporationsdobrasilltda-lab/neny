import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Maximize2, Grid, Layout, VideoOff } from 'lucide-react';

const MonitoramentoTab = () => {
    const [devices, setDevices] = useState([]);
    const [layout, setLayout] = useState(4); // 1, 4, 8, 16, 32
    const [selectedCameras, setSelectedCameras] = useState({}); // { slotIndex: deviceId }

    useEffect(() => {
        const storedDevices = localStorage.getItem('seguranca_dispositivos');
        if (storedDevices) setDevices(JSON.parse(storedDevices));

        const storedPrefs = localStorage.getItem('seguranca_layout_prefs');
        if (storedPrefs) {
            const prefs = JSON.parse(storedPrefs);
            setLayout(prefs.layout || 4);
            setSelectedCameras(prefs.selectedCameras || {});
        }
    }, []);

    const savePrefs = (newLayout, newSelection) => {
        const prefs = { layout: newLayout, selectedCameras: newSelection };
        localStorage.setItem('seguranca_layout_prefs', JSON.stringify(prefs));
    };

    const handleLayoutChange = (newLayout) => {
        setLayout(newLayout);
        savePrefs(newLayout, selectedCameras);
    };

    const handleCameraAssign = (slotIndex, deviceId) => {
        const newSelection = { ...selectedCameras, [slotIndex]: deviceId };
        setSelectedCameras(newSelection);
        savePrefs(layout, newSelection);
    };

    const getGridClass = () => {
        switch (layout) {
            case 1: return 'grid-cols-1';
            case 4: return 'grid-cols-2 md:grid-cols-2';
            case 8: return 'grid-cols-2 md:grid-cols-4'; // Hybrid 2 rows
            case 16: return 'grid-cols-2 md:grid-cols-4';
            case 32: return 'grid-cols-4 md:grid-cols-8';
            default: return 'grid-cols-2';
        }
    };

    return (
        <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-4 justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-700">Layout:</span>
                    <Button variant={layout === 1 ? 'default' : 'outline'} size="sm" onClick={() => handleLayoutChange(1)}>1</Button>
                    <Button variant={layout === 4 ? 'default' : 'outline'} size="sm" onClick={() => handleLayoutChange(4)}>4</Button>
                    <Button variant={layout === 8 ? 'default' : 'outline'} size="sm" onClick={() => handleLayoutChange(8)}>8</Button>
                    <Button variant={layout === 16 ? 'default' : 'outline'} size="sm" onClick={() => handleLayoutChange(16)}>16</Button>
                    <Button variant={layout === 32 ? 'default' : 'outline'} size="sm" onClick={() => handleLayoutChange(32)}>32</Button>
                </div>
                <div className="text-sm text-slate-500">
                    <span className="w-3 h-3 rounded-full bg-green-500 inline-block mr-1"></span> Online
                    <span className="w-3 h-3 rounded-full bg-red-500 inline-block ml-3 mr-1"></span> Offline
                </div>
            </div>

            <div className={`grid gap-2 ${getGridClass()} h-[calc(100vh-280px)] min-h-[500px] bg-slate-900 p-2 rounded-xl`}>
                {Array.from({ length: layout }).map((_, index) => {
                    const cameraId = selectedCameras[index];
                    const camera = devices.find(d => d.id === cameraId);

                    return (
                        <div key={index} className="bg-black relative rounded border border-slate-700 flex flex-col group overflow-hidden">
                            {/* Video Placeholder */}
                            <div className="flex-1 flex items-center justify-center text-slate-500 relative bg-slate-900">
                                {camera ? (
                                    <div className="text-center">
                                        <div className="text-white font-bold">{camera.nome}</div>
                                        <div className="text-xs text-slate-400">{camera.ipHost}</div>
                                        <div className="mt-2 text-xs animate-pulse text-red-500 flex items-center justify-center gap-1">
                                            <div className="w-2 h-2 bg-red-500 rounded-full"></div> REC
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <VideoOff className="w-8 h-8 mb-2 opacity-50"/>
                                        <span className="text-xs">Sem Sinal</span>
                                    </div>
                                )}
                                
                                {/* Overlay Controls */}
                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <select 
                                        className="bg-slate-800 text-white text-xs p-1 rounded border border-slate-600 max-w-[120px]"
                                        value={cameraId || ''}
                                        onChange={(e) => handleCameraAssign(index, e.target.value)}
                                    >
                                        <option value="">Selecionar...</option>
                                        {devices.map(d => (
                                            <option key={d.id} value={d.id}>{d.nome}</option>
                                        ))}
                                    </select>
                                    <div className="flex gap-1">
                                        <button className="p-1 hover:bg-slate-700 rounded text-white"><ZoomIn className="w-3 h-3"/></button>
                                        <button className="p-1 hover:bg-slate-700 rounded text-white"><ZoomOut className="w-3 h-3"/></button>
                                        <button className="p-1 hover:bg-slate-700 rounded text-white"><Maximize2 className="w-3 h-3"/></button>
                                    </div>
                                </div>
                                
                                {/* Status Indicator */}
                                <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${camera?.status === 'Ativo' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`}></div>
                                
                                {/* Timestamp */}
                                <div className="absolute top-2 left-2 text-[10px] font-mono text-white/80 bg-black/40 px-1 rounded">
                                    {new Date().toLocaleTimeString()}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MonitoramentoTab;