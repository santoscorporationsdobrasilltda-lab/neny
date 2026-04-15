import React, { useEffect, useMemo, useState } from 'react';
import { QrCode, ScanLine, Search, ArrowRight, ClipboardPaste, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';

const normalize = (value) => String(value || '').trim();

const LeitorAgroTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { data: bovinos, fetchAll } = useSupabaseCrud('fazenda50_bovinos');

  const [qrInput, setQrInput] = useState('');
  const [scannerInput, setScannerInput] = useState('');
  const [lastRead, setLastRead] = useState(null);
  const [recentReads, setRecentReads] = useState([]);

  useEffect(() => {
    if (user) fetchAll(1, 1000);
  }, [user, fetchAll]);

  const bovinosIndex = useMemo(() => {
    const byId = new Map();
    const byBrinco = new Map();
    bovinos.forEach((animal) => {
      if (animal.id) byId.set(String(animal.id), animal);
      if (animal.brinco) byBrinco.set(String(animal.brinco).toLowerCase(), animal);
    });
    return { byId, byBrinco };
  }, [bovinos]);

  const resolveAnimal = (rawValue) => {
    const raw = normalize(rawValue);
    if (!raw) return { ok: false, reason: 'Nenhum código informado.' };

    let parsed = null;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = null;
    }

    if (!parsed) {
      try {
        const url = new URL(raw);
        const payloadParam = url.searchParams.get('payload');
        if (payloadParam) {
          const decoded = decodeURIComponent(escape(window.atob(decodeURIComponent(payloadParam))));
          parsed = JSON.parse(decoded);
        }
      } catch {
        parsed = parsed || null;
      }
    }

    const candidates = [];
    if (parsed && typeof parsed === 'object') {
      if (parsed.tipo && String(parsed.tipo).toLowerCase() !== 'bovino') {
        return { ok: false, reason: 'QR lido, mas não pertence a um bovino.' };
      }
      if (parsed.id) candidates.push({ type: 'id', value: String(parsed.id) });
      if (parsed.brinco) candidates.push({ type: 'brinco', value: String(parsed.brinco) });
    }

    candidates.push({ type: 'id', value: raw });
    candidates.push({ type: 'brinco', value: raw });

    for (const candidate of candidates) {
      if (candidate.type === 'id' && bovinosIndex.byId.has(candidate.value)) {
        return { ok: true, animal: bovinosIndex.byId.get(candidate.value), source: parsed ? 'qr' : 'scanner' };
      }
      if (candidate.type === 'brinco' && bovinosIndex.byBrinco.has(candidate.value.toLowerCase())) {
        return { ok: true, animal: bovinosIndex.byBrinco.get(candidate.value.toLowerCase()), source: parsed ? 'qr' : 'scanner' };
      }
    }

    return { ok: false, reason: 'Código não reconhecido no pacote agro.' };
  };

  const openAnimal = (animal, source) => {
    const item = {
      id: `${animal.id}-${Date.now()}`,
      source,
      animalId: animal.id,
      brinco: animal.brinco,
      nome: animal.nome,
      at: new Date().toISOString(),
    };
    setLastRead(item);
    setRecentReads((prev) => [item, ...prev.filter((x) => x.animalId !== animal.id)].slice(0, 6));
    navigate(`/fazenda50/bovinos?animal=${animal.id}`);
  };

  const handleResolve = (raw, source) => {
    const result = resolveAnimal(raw);
    if (!result.ok) {
      toast({ title: 'Leitura não reconhecida', description: result.reason, variant: 'destructive' });
      setLastRead({ source, error: result.reason, at: new Date().toISOString() });
      return;
    }

    toast({
      title: 'Animal reconhecido',
      description: `${result.animal.brinco || '-'} • ${result.animal.nome || 'Sem nome'}`,
    });
    openAnimal(result.animal, source);
  };

  const handleScannerKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleResolve(scannerInput, 'scanner');
      setScannerInput('');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Leitor Agro</h2>
        <p className="text-slate-500">Cole o payload do QR ou use um scanner modo teclado para localizar rapidamente um bovino.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 text-slate-800 font-semibold">
            <QrCode className="w-5 h-5 text-[#1e3a8a]" /> Leitura de QR
          </div>
          <textarea
            className="w-full min-h-[180px] border rounded-xl p-3 text-sm"
            placeholder='Cole aqui o conteúdo do QR (JSON com id/brinco do animal)'
            value={qrInput}
            onChange={(e) => setQrInput(e.target.value)}
          />
          <div className="flex gap-3">
            <Button onClick={() => handleResolve(qrInput, 'qr')} className="bg-[#3b82f6] hover:bg-[#2563eb] text-white">
              <Search className="w-4 h-4 mr-2" /> Identificar animal
            </Button>
            <Button
              variant="outline"
              onClick={() => setQrInput(JSON.stringify({ tipo: 'bovino', id: bovinos[0]?.id || '', brinco: bovinos[0]?.brinco || '' }, null, 2))}
            >
              <ClipboardPaste className="w-4 h-4 mr-2" /> Exemplo
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 text-slate-800 font-semibold">
            <ScanLine className="w-5 h-5 text-emerald-700" /> Scanner modo teclado
          </div>
          <input
            className="w-full border rounded-xl p-3"
            placeholder="Escaneie ou digite o brinco/ID e pressione Enter"
            value={scannerInput}
            onChange={(e) => setScannerInput(e.target.value)}
            onKeyDown={handleScannerKeyDown}
          />
          <p className="text-sm text-slate-500">Use para leitores que digitam automaticamente o código no campo.</p>

          <div className="rounded-xl border p-4 bg-slate-50 min-h-[140px]">
            {lastRead?.animalId ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-emerald-700 font-semibold"><CheckCircle2 className="w-4 h-4" /> Última leitura reconhecida</div>
                <div className="text-sm text-slate-700"><strong>Brinco:</strong> {lastRead.brinco || '-'}</div>
                <div className="text-sm text-slate-700"><strong>Animal:</strong> {lastRead.nome || '-'}</div>
                <div className="text-sm text-slate-500">Origem: {lastRead.source}</div>
              </div>
            ) : lastRead?.error ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-red-700 font-semibold"><AlertCircle className="w-4 h-4" /> Leitura inválida</div>
                <div className="text-sm text-slate-600">{lastRead.error}</div>
              </div>
            ) : (
              <div className="text-sm text-slate-500">Nenhuma leitura processada ainda.</div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-slate-50 font-semibold text-slate-800">Leituras recentes</div>
        <div className="divide-y divide-slate-100">
          {recentReads.length === 0 ? (
            <div className="p-4 text-slate-500">Sem leituras recentes.</div>
          ) : recentReads.map((item) => (
            <div key={item.id} className="p-4 flex items-center justify-between gap-4">
              <div>
                <div className="font-medium text-slate-800">{item.brinco || '-'} • {item.nome || '-'}</div>
                <div className="text-sm text-slate-500">{new Date(item.at).toLocaleString('pt-BR')} • origem: {item.source}</div>
              </div>
              <Button variant="outline" onClick={() => navigate(`/fazenda50/bovinos?animal=${item.animalId}`)}>
                Abrir ficha <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeitorAgroTab;
