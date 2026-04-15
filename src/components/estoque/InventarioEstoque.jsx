import React, { useEffect, useMemo, useState } from 'react';
import { Package, Download, Search, Boxes, Wallet, Tag, Printer, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';
import { exportTablePdf, openPrintWindow, ReportExporter } from '@/utils/ReportExporter';

const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));

const StatCard = ({ icon: Icon, label, value, tone = 'slate' }) => {
  const styles = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    orange: 'bg-orange-50 text-orange-700 border-orange-100',
    slate: 'bg-slate-50 text-slate-700 border-slate-200',
  };
  return (
    <div className={`rounded-2xl border p-4 ${styles[tone] || styles.slate}`}>
      <div className="flex items-center justify-between mb-3"><Icon className="w-5 h-5" /></div>
      <div className="text-xs uppercase tracking-wide font-semibold opacity-80">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
};

const InventarioEstoque = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: produtos, loading, fetchAll } = useSupabaseCrud('estoque_produtos');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  useEffect(() => {
    if (user) fetchAll(1, 1000);
  }, [user, fetchAll]);

  const categorias = useMemo(
    () => [...new Set((produtos || []).map((p) => p.categoria).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b))),
    [produtos]
  );

  const produtosFiltrados = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return [...(produtos || [])]
      .filter((produto) => {
        const quantidade = Number(produto.quantidade || 0);
        const estoqueMinimo = Number(produto.estoque_minimo || 0);
        const baixoEstoque = estoqueMinimo > 0 && quantidade <= estoqueMinimo;
        const semEstoque = quantidade <= 0;
        const matchesSearch = [produto.nome, produto.sku, produto.categoria, produto.localizacao, produto.codigo_barras]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(term));
        const matchesCategoria = !categoriaFilter || (produto.categoria || '') === categoriaFilter;
        const matchesStatus =
          statusFilter === 'todos' ||
          (statusFilter === 'baixo' && baixoEstoque && quantidade > 0) ||
          (statusFilter === 'zerado' && semEstoque) ||
          (statusFilter === 'ok' && !baixoEstoque && !semEstoque);
        return matchesSearch && matchesCategoria && matchesStatus;
      })
      .sort((a, b) => String(a.nome || '').localeCompare(String(b.nome || '')));
  }, [produtos, searchTerm, categoriaFilter, statusFilter]);

  const stats = useMemo(() => {
    const total = produtosFiltrados.length;
    const totalUnidades = produtosFiltrados.reduce((acc, p) => acc + Number(p.quantidade || 0), 0);
    const valorCusto = produtosFiltrados.reduce((acc, p) => acc + Number(p.quantidade || 0) * Number(p.preco_custo || 0), 0);
    const valorVenda = produtosFiltrados.reduce((acc, p) => acc + Number(p.quantidade || 0) * Number(p.preco_venda || 0), 0);
    const baixoEstoque = produtosFiltrados.filter((p) => Number(p.estoque_minimo || 0) > 0 && Number(p.quantidade || 0) <= Number(p.estoque_minimo || 0) && Number(p.quantidade || 0) > 0).length;
    const zerados = produtosFiltrados.filter((p) => Number(p.quantidade || 0) <= 0).length;
    return { total, totalUnidades, valorCusto, valorVenda, baixoEstoque, zerados };
  }, [produtosFiltrados]);

  const rows = produtosFiltrados.map((produto) => {
    const quantidade = Number(produto.quantidade || 0);
    const precoCusto = Number(produto.preco_custo || 0);
    const total = quantidade * precoCusto;
    const estoqueMinimo = Number(produto.estoque_minimo || 0);
    const status = quantidade <= 0 ? 'Sem estoque' : estoqueMinimo > 0 && quantidade <= estoqueMinimo ? 'Baixo estoque' : 'Normal';
    return [
      produto.sku || '-',
      produto.nome || '-',
      produto.categoria || '-',
      quantidade,
      formatCurrency(precoCusto),
      formatCurrency(total),
      produto.localizacao || '-',
      status,
    ];
  });

  const exportPdf = () => {
    exportTablePdf({
      title: 'Inventário de Estoque',
      subtitle: `Produtos: ${stats.total} | Unidades: ${stats.totalUnidades} | Valor de custo: ${formatCurrency(stats.valorCusto)}`,
      columns: ['SKU', 'Produto', 'Categoria', 'Qtd.', 'Custo', 'Total', 'Localização', 'Status'],
      rows,
      filename: 'inventario_estoque.pdf',
    });
  };

  const printInventario = () => {
    openPrintWindow({
      title: 'Inventário de Estoque',
      subtitle: `Produtos: ${stats.total} | Unidades: ${stats.totalUnidades} | Valor de custo: ${formatCurrency(stats.valorCusto)}`,
      columns: ['SKU', 'Produto', 'Categoria', 'Qtd.', 'Custo', 'Total', 'Localização', 'Status'],
      rows,
    });
  };

  const exportExcel = () => {
    const data = produtosFiltrados.map((produto) => ({
      sku: produto.sku || '-',
      nome: produto.nome || '-',
      categoria: produto.categoria || '-',
      quantidade: Number(produto.quantidade || 0),
      preco_custo: Number(produto.preco_custo || 0),
      total_custo: Number(produto.quantidade || 0) * Number(produto.preco_custo || 0),
      localizacao: produto.localizacao || '-',
    }));
    ReportExporter.exportToExcel('inventario_estoque', {}, data, [
      { key: 'sku', label: 'SKU' },
      { key: 'nome', label: 'Produto' },
      { key: 'categoria', label: 'Categoria' },
      { key: 'quantidade', label: 'Qtd.' },
      { key: 'preco_custo', label: 'Custo' },
      { key: 'total_custo', label: 'Total' },
      { key: 'localizacao', label: 'Localização' },
    ]);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        <StatCard icon={Boxes} label="Produtos" value={stats.total} tone="blue" />
        <StatCard icon={Package} label="Unidades" value={stats.totalUnidades} tone="slate" />
        <StatCard icon={Wallet} label="Valor de custo" value={formatCurrency(stats.valorCusto)} tone="emerald" />
        <StatCard icon={Tag} label="Valor de venda" value={formatCurrency(stats.valorVenda)} tone="blue" />
        <StatCard icon={AlertTriangle} label="Baixo / zerado" value={`${stats.baixoEstoque} / ${stats.zerados}`} tone="orange" />
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-4">
          <div>
            <h3 className="text-xl font-semibold text-slate-800">Inventário de Estoque</h3>
            <p className="text-sm text-slate-500 mt-1">Consulte o saldo atual, identifique baixo estoque e exporte o inventário.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={printInventario}><Printer className="w-4 h-4 mr-2" /> Imprimir</Button>
            <Button variant="outline" onClick={exportPdf}><Download className="w-4 h-4 mr-2" /> PDF</Button>
            <Button variant="outline" onClick={exportExcel}>Excel</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 mb-4">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full border rounded-xl pl-10 pr-3 py-2.5" placeholder="Buscar por produto, SKU, categoria ou localização" />
          </div>
          <select value={categoriaFilter} onChange={(e) => setCategoriaFilter(e.target.value)} className="border rounded-xl px-3 py-2.5">
            <option value="">Todas as categorias</option>
            {categorias.map((categoria) => <option key={categoria} value={categoria}>{categoria}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border rounded-xl px-3 py-2.5">
            <option value="todos">Todos os status</option>
            <option value="ok">Estoque normal</option>
            <option value="baixo">Baixo estoque</option>
            <option value="zerado">Sem estoque</option>
          </select>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="p-3 font-semibold">SKU</th>
                <th className="p-3 font-semibold">Produto</th>
                <th className="p-3 font-semibold">Categoria</th>
                <th className="p-3 font-semibold">Qtd.</th>
                <th className="p-3 font-semibold">Estoque mínimo</th>
                <th className="p-3 font-semibold">Custo</th>
                <th className="p-3 font-semibold">Total</th>
                <th className="p-3 font-semibold">Localização</th>
                <th className="p-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="p-6 text-center text-slate-500">Carregando inventário...</td></tr>
              ) : produtosFiltrados.length === 0 ? (
                <tr><td colSpan={9} className="p-6 text-center text-slate-500">Nenhum produto encontrado.</td></tr>
              ) : (
                produtosFiltrados.map((produto) => {
                  const quantidade = Number(produto.quantidade || 0);
                  const precoCusto = Number(produto.preco_custo || 0);
                  const total = quantidade * precoCusto;
                  const estoqueMinimo = Number(produto.estoque_minimo || 0);
                  const isZero = quantidade <= 0;
                  const isLow = !isZero && estoqueMinimo > 0 && quantidade <= estoqueMinimo;
                  return (
                    <tr key={produto.id} className="border-t border-slate-100">
                      <td className="p-3 text-slate-700">{produto.sku || '-'}</td>
                      <td className="p-3 font-medium text-slate-800">{produto.nome || '-'}</td>
                      <td className="p-3 text-slate-700">{produto.categoria || '-'}</td>
                      <td className="p-3 text-slate-700">{quantidade}</td>
                      <td className="p-3 text-slate-700">{estoqueMinimo || '-'}</td>
                      <td className="p-3 text-slate-700">{formatCurrency(precoCusto)}</td>
                      <td className="p-3 text-slate-700">{formatCurrency(total)}</td>
                      <td className="p-3 text-slate-700">{produto.localizacao || '-'}</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${isZero ? 'bg-red-50 text-red-700' : isLow ? 'bg-orange-50 text-orange-700' : 'bg-emerald-50 text-emerald-700'}`}>
                          {isZero ? 'Sem estoque' : isLow ? 'Baixo estoque' : 'Normal'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventarioEstoque;
