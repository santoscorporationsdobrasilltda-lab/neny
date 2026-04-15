import React, { useEffect, useMemo, useState } from 'react';
import { Paperclip, Upload, Search, Trash2, ExternalLink, FileImage, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const BUCKET = 'ordem-servicos-anexos';

const initialForm = {
    id: '',
    ordem_id: '',
    descricao: '',
};

const AnexosTab = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const { data: anexos, fetchAll: fetchAnexos, create: createAnexo, remove: removeAnexo } = useSupabaseCrud('ordem_servicos_anexos');
    const { data: ordens, fetchAll: fetchOrdens } = useSupabaseCrud('ordem_servicos_ordens');

    const [form, setForm] = useState(initialForm);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (user) {
            fetchAnexos(1, 2000);
            fetchOrdens(1, 1000);
        }
    }, [user, fetchAnexos, fetchOrdens]);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return anexos;
        return anexos.filter((item) => {
            const ordem = ordens.find((o) => o.id === item.ordem_id);
            return [item.nome_arquivo, item.tipo, item.descricao, ordem?.cliente]
                .filter(Boolean)
                .some((v) => String(v).toLowerCase().includes(term));
        });
    }, [anexos, ordens, search]);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!user) return;
        if (!form.ordem_id || !selectedFile) {
            toast({ title: 'Dados obrigatórios', description: 'Selecione a OS e o arquivo.', variant: 'destructive' });
            return;
        }

        setUploading(true);
        try {
            const ext = selectedFile.name.split('.').pop();
            const safeName = selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
            const path = `${user.id}/${form.ordem_id}/${Date.now()}_${safeName}`;

            const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, selectedFile, {
                cacheControl: '3600',
                upsert: false,
            });
            if (uploadError) throw uploadError;

            const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(path);

            await createAnexo({
                user_id: user.id,
                ordem_id: form.ordem_id,
                nome_arquivo: selectedFile.name,
                url: publicData.publicUrl,
                tipo: selectedFile.type || ext || 'arquivo',
                descricao: form.descricao.trim() || null,
                updated_at: new Date().toISOString(),
            });

            setForm(initialForm);
            setSelectedFile(null);
            fetchAnexos(1, 2000);
        } catch (error) {
            console.error(error);
            toast({ title: 'Erro ao enviar', description: error.message || 'Não foi possível enviar o arquivo.', variant: 'destructive' });
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (item) => {
        if (!window.confirm('Excluir este anexo?')) return;
        try {
            const marker = `${user.id}/${item.ordem_id}/`;
            const filePath = item.url.includes(marker) ? item.url.split(`/storage/v1/object/public/${BUCKET}/`)[1] : null;
            if (filePath) {
                await supabase.storage.from(BUCKET).remove([filePath]);
            }
        } catch (e) {
            console.warn('Falha ao remover do bucket, seguindo para metadados.', e);
        }
        await removeAnexo(item.id);
        fetchAnexos(1, 2000);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-[380px,1fr] gap-6">
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4 h-fit">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Upload de evidências</h3>
                            <p className="text-sm text-slate-500">Fotos, comprovantes e documentos da OS.</p>
                        </div>
                        <Paperclip className="w-6 h-6 text-purple-500" />
                    </div>
                    <form onSubmit={handleUpload} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-slate-700">OS</label>
                            <select className="w-full mt-1 p-2 border rounded-lg" value={form.ordem_id} onChange={(e) => setForm((p) => ({ ...p, ordem_id: e.target.value }))}>
                                <option value="">Selecione a OS</option>
                                {ordens.map((ordem) => (
                                    <option key={ordem.id} value={ordem.id}>{ordem.cliente} — {String(ordem.id).slice(0, 8)}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700">Arquivo</label>
                            <input type="file" className="w-full mt-1 p-2 border rounded-lg bg-white" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                            {selectedFile ? <p className="text-xs text-slate-500 mt-1">Selecionado: {selectedFile.name}</p> : null}
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700">Descrição</label>
                            <textarea className="w-full mt-1 p-2 border rounded-lg min-h-[90px]" value={form.descricao} onChange={(e) => setForm((p) => ({ ...p, descricao: e.target.value }))} placeholder="Ex: Foto final da instalação, comprovante de visita..." />
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit" disabled={uploading}><Upload className="w-4 h-4 mr-2" />{uploading ? 'Enviando...' : 'Enviar anexo'}</Button>
                        </div>
                    </form>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Anexos cadastrados</h3>
                            <p className="text-sm text-slate-500">Arquivos vinculados às ordens de serviço.</p>
                        </div>
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input className="w-full pl-9 pr-3 py-2 border rounded-lg" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar anexo..." />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filtered.map((item) => {
                            const ordem = ordens.find((o) => o.id === item.ordem_id);
                            const isImage = String(item.tipo || '').startsWith('image/');
                            return (
                                <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600">
                                                {isImage ? <FileImage className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-medium text-slate-800 truncate">{item.nome_arquivo}</div>
                                                <div className="text-xs text-slate-500 truncate">{ordem?.cliente || String(item.ordem_id).slice(0, 8)}</div>
                                            </div>
                                        </div>
                                    </div>
                                    {item.descricao ? <p className="text-sm text-slate-600">{item.descricao}</p> : null}
                                    <div className="flex gap-2 flex-wrap">
                                        <Button asChild size="sm" variant="outline">
                                            <a href={item.url} target="_blank" rel="noreferrer"><ExternalLink className="w-4 h-4 mr-2" />Abrir</a>
                                        </Button>
                                        <Button size="sm" variant="destructive" onClick={() => handleDelete(item)}><Trash2 className="w-4 h-4 mr-2" />Excluir</Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnexosTab;
