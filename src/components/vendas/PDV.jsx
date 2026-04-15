import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingCart,
  CreditCard,
  User,
  Box,
  Search,
  Plus,
  Minus,
  Trash2,
  Printer,
  Percent,
  Receipt,
  Wallet,
  Package,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { openPrintWindow } from '@/utils/ReportExporter';

const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));

const SummaryCard = ({ icon: Icon, label, value, tone = 'blue' }) => {
  const styles = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-2 text-xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`rounded-xl border px-3 py-3 ${styles[tone] || styles.blue}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
};

const PDV = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: produtos, loading: loadingProdutos, fetchAll: fetchProdutos, update: updateProduto } = useSupabaseCrud('estoque_produtos');
  const { data: parametros = [], fetchAll: fetchParametros } = useSupabaseCrud('admin_parametros');
  const { create: createPedido } = useSupabaseCrud('vendas_pedidos');
  const { create: createItemPedido } = useSupabaseCrud('vendas_itens_pedido');

  const [searchTerm, setSearchTerm] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [cliente, setCliente] = useState('Consumidor Final');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Dinheiro');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProdutos(1, 1000);
      fetchParametros(1, 10);
    }
  }, [user, fetchProdutos, fetchParametros]);

  const companyProfile = useMemo(() => {
    const info = Array.isArray(parametros) ? parametros[0] : null;
    if (!info) return null;
    return {
      nome_fantasia: info.company_name || 'Neny Software System',
      razao_social: info.company_name || null,
      cnpj: info.cnpj || null,
      email: info.email || null,
      telefone: info.phone || null,
      logradouro: info.address || null,
      cidade: info.city || null,
      estado: info.state || null,
    };
  }, [parametros]);

  const filteredProducts = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return [...produtos]
      .filter((p) => Number(p.quantidade || 0) > 0)
      .filter((p) =>
        (p.nome || '').toLowerCase().includes(term) ||
        (p.sku || '').toLowerCase().includes(term) ||
        (p.categoria || '').toLowerCase().includes(term)
      )
      .sort((a, b) => (a.nome || '').localeCompare(b.nome || '', 'pt-BR'));
  }, [produtos, searchTerm]);

  const subtotal = useMemo(() => cartItems.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0), [cartItems]);
  const discountAmount = useMemo(() => subtotal * (Number(discountPercent || 0) / 100), [subtotal, discountPercent]);
  const total = useMemo(() => Math.max(0, subtotal - discountAmount), [subtotal, discountAmount]);

  const addToCart = (produto) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === produto.id);
      if (existing) {
        if (existing.quantity >= Number(produto.quantidade || 0)) return prev;
        return prev.map((item) =>
          item.id === produto.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: produto.id,
          name: produto.nome || 'Produto',
          sku: produto.sku || '',
          unitPrice: Number(produto.preco_venda || produto.preco_custo || 0),
          quantity: 1,
          stock: Number(produto.quantidade || 0),
        },
      ];
    });
  };

  const updateCartQuantity = (productId, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id !== productId) return item;
          const nextQuantity = item.quantity + delta;
          if (nextQuantity <= 0) return null;
          if (nextQuantity > item.stock) return item;
          return { ...item, quantity: nextQuantity };
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
    setDiscountPercent(0);
  };

  const printReceipt = (pedidoId, currentCart, totalValue, discountValue) => {
    openPrintWindow({
      title: 'Comprovante de Venda',
      subtitle: `Pedido ${pedidoId} • Cliente: ${cliente} • Pagamento: ${paymentMethod}`,
      columns: ['Item', 'SKU', 'Qtd.', 'Unitário', 'Subtotal'],
      rows: currentCart.map((item) => [
        item.name,
        item.sku || '-',
        item.quantity,
        formatCurrency(item.unitPrice),
        formatCurrency(item.quantity * item.unitPrice),
      ]),
      footer: `Subtotal: ${formatCurrency(subtotal)} • Desconto: ${formatCurrency(discountValue)} • Total: ${formatCurrency(totalValue)}`,
      companyProfile,
      summaryRows: [
        ['Cliente', cliente],
        ['Pagamento', paymentMethod],
        ['Itens', currentCart.reduce((acc, item) => acc + item.quantity, 0)],
        ['Desconto', formatCurrency(discountValue)],
        ['Total', formatCurrency(totalValue)],
      ],
    });
  };

  const handleFinalizeSale = async () => {
    if (!user) return;
    if (cartItems.length === 0) {
      toast({ title: 'Carrinho vazio', description: 'Adicione produtos antes de finalizar.', variant: 'destructive' });
      return;
    }

    try {
      setSubmitting(true);

      const pedido = await createPedido({
        user_id: user.id,
        cliente: cliente.trim() || 'Consumidor Final',
        data_pedido: new Date().toISOString(),
        status: 'Finalizado',
        valor_total: Number(total.toFixed(2)),
        updated_at: new Date().toISOString(),
      });

      if (!pedido?.id) throw new Error('Não foi possível criar o pedido.');

      for (const item of cartItems) {
        await createItemPedido({
          user_id: user.id,
          pedido_id: pedido.id,
          produto: item.name,
          quantidade: item.quantity,
          preco_unitario: item.unitPrice,
          subtotal: Number((item.quantity * item.unitPrice).toFixed(2)),
          updated_at: new Date().toISOString(),
        });

        const produtoAtual = produtos.find((p) => p.id === item.id);
        if (produtoAtual) {
          const novaQuantidade = Math.max(0, Number(produtoAtual.quantidade || 0) - item.quantity);
          await updateProduto(item.id, {
            quantidade: novaQuantidade,
            updated_at: new Date().toISOString(),
          });
        }
      }

      printReceipt(pedido.id, cartItems, total, discountAmount);
      setCartItems([]);
      setDiscountPercent(0);
      setCliente('Consumidor Final');
      await fetchProdutos(1, 1000);
      toast({ title: 'Venda finalizada', description: 'Pedido salvo com sucesso.' });
    } catch (error) {
      toast({ title: 'Erro ao finalizar', description: error.message || 'Falha ao registrar a venda.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SummaryCard icon={Package} label="Produtos disponíveis" value={filteredProducts.length} tone="blue" />
        <SummaryCard icon={ShoppingCart} label="Itens no carrinho" value={cartItems.reduce((acc, item) => acc + item.quantity, 0)} tone="emerald" />
        <SummaryCard icon={Wallet} label="Total da venda" value={formatCurrency(total)} tone="amber" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Catálogo para PDV</h2>
                <p className="text-sm text-slate-500">Pesquise por nome, SKU ou categoria e adicione ao carrinho.</p>
              </div>
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-slate-900 shadow-sm focus:border-blue-300"
                  placeholder="Digite SKU, categoria ou nome do produto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {loadingProdutos ? (
              <div className="col-span-full rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
                Carregando produtos...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
                Nenhum produto disponível para o PDV.
              </div>
            ) : (
              filteredProducts.map((produto) => (
                <div key={produto.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
                      <Box className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      Estoque: {Number(produto.quantidade || 0)}
                    </span>
                  </div>
                  <div className="mt-4">
                    <h3 className="font-semibold text-slate-900">{produto.nome}</h3>
                    <p className="mt-1 text-xs text-slate-500">SKU: {produto.sku || '-'}</p>
                    <p className="mt-1 text-xs text-slate-500">{produto.categoria || 'Sem categoria'}</p>
                  </div>
                  <div className="mt-4 text-2xl font-bold text-emerald-600">
                    {formatCurrency(produto.preco_venda || produto.preco_custo || 0)}
                  </div>
                  <Button className="mt-4 w-full bg-blue-600 hover:bg-blue-700" onClick={() => addToCart(produto)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Carrinho</h2>
              <p className="text-sm text-slate-500">Fechamento rápido da venda</p>
            </div>
            <div className="rounded-xl bg-slate-100 p-3 text-slate-600">
              <ShoppingCart className="h-5 w-5" />
            </div>
          </div>

          <div className="space-y-4 p-5">
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 shadow-sm"
              placeholder="Cliente"
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-slate-900 shadow-sm"
                  placeholder="Desconto %"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                />
              </div>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-slate-900 shadow-sm"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option>Dinheiro</option>
                  <option>Pix</option>
                  <option>Cartão</option>
                  <option>Boleto</option>
                </select>
              </div>
            </div>

            <div className="max-h-[360px] space-y-3 overflow-y-auto pr-1 custom-scrollbar">
              {cartItems.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
                  Nenhum item no carrinho.
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-medium text-slate-900">{item.name}</h4>
                        <p className="text-xs text-slate-500">SKU: {item.sku || '-'}</p>
                        <p className="mt-1 text-sm font-semibold text-emerald-600">{formatCurrency(item.unitPrice)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="rounded-lg border border-red-100 bg-white p-2 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button size="icon" variant="outline" onClick={() => updateCartQuantity(item.id, -1)}>
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="min-w-[30px] text-center font-semibold text-slate-900">{item.quantity}</span>
                        <Button size="icon" variant="outline" onClick={() => updateCartQuantity(item.id, 1)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <span className="font-bold text-slate-900">{formatCurrency(item.quantity * item.unitPrice)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal</span>
                <strong>{formatCurrency(subtotal)}</strong>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Desconto</span>
                <strong>- {formatCurrency(discountAmount)}</strong>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold text-slate-900">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="border-slate-200" onClick={clearCart}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Limpar
              </Button>
              <Button variant="outline" className="border-slate-200" onClick={() => printReceipt('prévia', cartItems, total, discountAmount)}>
                <Printer className="mr-2 h-4 w-4" />
                Prévia
              </Button>
            </div>

            <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={handleFinalizeSale} disabled={submitting}>
              <Receipt className="mr-2 h-4 w-4" />
              {submitting ? 'Finalizando...' : 'Finalizar venda'}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PDV;
