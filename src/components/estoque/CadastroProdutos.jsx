import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  Boxes,
  Barcode,
  BadgeDollarSign,
  AlertTriangle,
  Layers,
  History,
  Copy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { supabase } from '@/lib/customSupabaseClient';

const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));

const createInitialForm = () => ({
  id: '',
  nome: '',
  sku: '',
  codigo_barras: '',
  categoria: '',
  marca: '',
  unidade: 'un',
  quantidade: 0,
  estoque_minimo: 0,
  preco_custo: 0,
  preco_venda: 0,
  margem_lucro: 0,
  status: 'Ativo',
  localizacao: '',
  fornecedor_nome: '',
  descricao: '',
  imagem_url: '',
});

const createVariationForm = () => ({
  id: '',
  nome: '',
  sku: '',
  codigo_barras: '',
  adicional_preco: 0,
  estoque: 0,
  status: 'Ativa',
});

const createPriceTierForm = () => ({
  id: '',
  nome_tabela: '',
  preco: 0,
  minimo_quantidade: 1,
  ativo: true,
});

const createComboForm = () => ({
  id: '',
  produto_filho_id: '',
  quantidade: 1,
  observacoes: '',
});

const ProductModal = ({
  formData,
  setFormData,
  onClose,
  onSubmit,
  isEditing,
  submitting,
  variationForm,
  setVariationForm,
  handleSaveVariation,
  editingVariation,
  variations,
  handleEditVariation,
  handleDeleteVariation,
  priceTierForm,
  setPriceTierForm,
  handleSavePriceTier,
  editingPriceTier,
  priceTiers,
  handleEditPriceTier,
  handleDeletePriceTier,
  comboForm,
  setComboForm,
  handleSaveCombo,
  editingCombo,
  combos,
  handleEditCombo,
  handleDeleteCombo,
  productOptions,
  canManageAdvanced,
}) => {
  const marginPreview = useMemo(() => {
    const custo = Number(formData.preco_custo || 0);
    const venda = Number(formData.preco_venda || 0);
    if (!custo || venda <= custo) return 0;
    return ((venda - custo) / custo) * 100;
  }, [formData.preco_custo, formData.preco_venda]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="min-h-full flex items-start justify-center py-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-6xl bg-white rounded-[28px] shadow-[0_24px_80px_rgba(15,23,42,0.18)] border border-slate-200 overflow-hidden"
        >
          <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-white via-slate-50 to-blue-50 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{isEditing ? 'Editar produto' : 'Novo produto'}</h2>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">Cadastro comercial com estoque, variações, preços e composição.</p>
            </div>
            <Button variant="outline" className="border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shadow-sm" onClick={onClose}>Fechar</Button>
          </div>

          <div className="p-6 space-y-8 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.05),_transparent_28%),linear-gradient(to_bottom,_#ffffff,_#f8fbff)]">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-semibold text-slate-700">Nome do produto</span>
                  <input className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 bg-white shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none" value={formData.nome} onChange={(e) => setFormData((prev) => ({ ...prev, nome: e.target.value }))} />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700">SKU</span>
                  <div className="flex gap-2">
                    <input className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 bg-white shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none" value={formData.sku} onChange={(e) => setFormData((prev) => ({ ...prev, sku: e.target.value }))} />
                    <Button type="button" variant="outline" className="border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shadow-sm" onClick={() => setFormData((prev) => ({ ...prev, sku: prev.sku || `SKU-${Date.now().toString().slice(-6)}` }))}>Gerar</Button>
                  </div>
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700">Código de barras</span>
                  <input className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 bg-white shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none" value={formData.codigo_barras} onChange={(e) => setFormData((prev) => ({ ...prev, codigo_barras: e.target.value }))} />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700">Categoria</span>
                  <input className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 bg-white shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none" value={formData.categoria} onChange={(e) => setFormData((prev) => ({ ...prev, categoria: e.target.value }))} />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700">Marca</span>
                  <input className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 bg-white shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none" value={formData.marca} onChange={(e) => setFormData((prev) => ({ ...prev, marca: e.target.value }))} />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700">Unidade</span>
                  <select className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 bg-white shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none" value={formData.unidade} onChange={(e) => setFormData((prev) => ({ ...prev, unidade: e.target.value }))}>
                    <option value="un">Unidade</option>
                    <option value="kg">Kg</option>
                    <option value="cx">Caixa</option>
                    <option value="pct">Pacote</option>
                    <option value="lt">Litro</option>
                    <option value="m">Metro</option>
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700">Status</span>
                  <select className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 bg-white shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none" value={formData.status} onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}>
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                    <option value="Descontinuado">Descontinuado</option>
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700">Quantidade em estoque</span>
                  <input type="number" min="0" step="0.01" className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 bg-white shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none" value={formData.quantidade} onChange={(e) => setFormData((prev) => ({ ...prev, quantidade: e.target.value }))} />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700">Estoque mínimo</span>
                  <input type="number" min="0" step="0.01" className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 bg-white shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none" value={formData.estoque_minimo} onChange={(e) => setFormData((prev) => ({ ...prev, estoque_minimo: e.target.value }))} />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700">Preço de custo</span>
                  <input type="number" min="0" step="0.01" className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 bg-white shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none" value={formData.preco_custo} onChange={(e) => setFormData((prev) => ({ ...prev, preco_custo: e.target.value }))} />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700">Preço de venda</span>
                  <input type="number" min="0" step="0.01" className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 bg-white shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none" value={formData.preco_venda} onChange={(e) => setFormData((prev) => ({ ...prev, preco_venda: e.target.value, margem_lucro: marginPreview.toFixed(2) }))} />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700">Margem (%)</span>
                  <input type="number" min="0" step="0.01" className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 bg-white shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none" value={formData.margem_lucro} onChange={(e) => setFormData((prev) => ({ ...prev, margem_lucro: e.target.value }))} />
                </label>
                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-semibold text-slate-700">Fornecedor principal</span>
                  <input className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 bg-white shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none" value={formData.fornecedor_nome} onChange={(e) => setFormData((prev) => ({ ...prev, fornecedor_nome: e.target.value }))} />
                </label>
                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-semibold text-slate-700">Localização no estoque</span>
                  <input className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 bg-white shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none" value={formData.localizacao} onChange={(e) => setFormData((prev) => ({ ...prev, localizacao: e.target.value }))} />
                </label>
                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-semibold text-slate-700">Imagem (URL)</span>
                  <input className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 bg-white shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none" value={formData.imagem_url} onChange={(e) => setFormData((prev) => ({ ...prev, imagem_url: e.target.value }))} />
                </label>
                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-semibold text-slate-700">Descrição</span>
                  <textarea rows="4" className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 bg-white shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none" value={formData.descricao} onChange={(e) => setFormData((prev) => ({ ...prev, descricao: e.target.value }))} />
                </label>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-sm">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">Resumo comercial</h3>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">Prévia rápida para tomada de decisão.</p>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-white/95 border border-slate-200 rounded-[22px] p-4 shadow-sm">
                    <div className="text-sm text-slate-500">Preço de venda</div>
                    <div className="text-2xl font-bold text-slate-900">{formatCurrency(formData.preco_venda)}</div>
                  </div>
                  <div className="bg-white/95 border border-slate-200 rounded-[22px] p-4 shadow-sm">
                    <div className="text-sm text-slate-500">Margem estimada</div>
                    <div className="text-2xl font-bold text-emerald-600">{Number(marginPreview || formData.margem_lucro || 0).toFixed(2)}%</div>
                  </div>
                  <div className={`border rounded-[22px] p-4 shadow-sm ${Number(formData.quantidade || 0) <= Number(formData.estoque_minimo || 0) ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'}`}>
                    <div className="text-sm text-slate-500">Situação do estoque</div>
                    <div className={`text-xl font-bold ${Number(formData.quantidade || 0) <= Number(formData.estoque_minimo || 0) ? 'text-amber-700' : 'text-slate-900'}`}>
                      {Number(formData.quantidade || 0) <= Number(formData.estoque_minimo || 0) ? 'Atenção: estoque baixo' : 'Estoque saudável'}
                    </div>
                  </div>
                </div>
                <div className="border-t border-slate-200 pt-4 space-y-3 text-sm text-slate-600">
                  <div className="flex justify-between"><span>SKU</span><span className="font-medium text-slate-800">{formData.sku || '-'}</span></div>
                  <div className="flex justify-between"><span>Código de barras</span><span className="font-medium text-slate-800">{formData.codigo_barras || '-'}</span></div>
                  <div className="flex justify-between"><span>Unidade</span><span className="font-medium text-slate-800">{formData.unidade || '-'}</span></div>
                  <div className="flex justify-between"><span>Fornecedor</span><span className="font-medium text-slate-800">{formData.fornecedor_nome || '-'}</span></div>
                </div>
              </div>
            </div>

            {canManageAdvanced && (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 tracking-tight">Variações</h3>
                      <p className="text-sm text-slate-500">Cor, tamanho, modelo ou versão.</p>
                    </div>
                    <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">{variations.length}</span>
                  </div>
                  <div className="space-y-3">
                    <input className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 bg-white shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none" placeholder="Nome da variação" value={variationForm.nome} onChange={(e) => setVariationForm((prev) => ({ ...prev, nome: e.target.value }))} />
                    <div className="grid grid-cols-2 gap-3">
                      <input className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 bg-white shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none" placeholder="SKU da variação" value={variationForm.sku} onChange={(e) => setVariationForm((prev) => ({ ...prev, sku: e.target.value }))} />
                      <input className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 bg-white shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none" placeholder="Código de barras" value={variationForm.codigo_barras} onChange={(e) => setVariationForm((prev) => ({ ...prev, codigo_barras: e.target.value }))} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input type="number" step="0.01" className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 bg-white shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none" placeholder="Adicional de preço" value={variationForm.adicional_preco} onChange={(e) => setVariationForm((prev) => ({ ...prev, adicional_preco: e.target.value }))} />
                      <input type="number" step="0.01" className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 bg-white shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none" placeholder="Estoque" value={variationForm.estoque} onChange={(e) => setVariationForm((prev) => ({ ...prev, estoque: e.target.value }))} />
                    </div>
                    <Button type="button" className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleSaveVariation}>{editingVariation ? 'Salvar variação' : 'Adicionar variação'}</Button>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                    {variations.map((variation) => (
                      <div key={variation.id} className="bg-white border border-slate-200 rounded-xl p-3">
                        <div className="flex justify-between gap-3">
                          <div>
                            <div className="font-semibold text-slate-800">{variation.nome}</div>
                            <div className="text-xs text-slate-500">SKU {variation.sku || '-'} • Estoque {variation.estoque || 0}</div>
                          </div>
                          <div className="flex gap-1">
                            <Button type="button" size="icon" variant="ghost" onClick={() => handleEditVariation(variation)}><Edit className="w-4 h-4" /></Button>
                            <Button type="button" size="icon" variant="ghost" onClick={() => handleDeleteVariation(variation.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 tracking-tight">Tabelas de preço</h3>
                      <p className="text-sm text-slate-500">Atacado, varejo, revenda e promoções.</p>
                    </div>
                    <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">{priceTiers.length}</span>
                  </div>
                  <div className="space-y-3">
                    <input className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 bg-white shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none" placeholder="Nome da tabela" value={priceTierForm.nome_tabela} onChange={(e) => setPriceTierForm((prev) => ({ ...prev, nome_tabela: e.target.value }))} />
                    <div className="grid grid-cols-2 gap-3">
                      <input type="number" step="0.01" className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 bg-white shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none" placeholder="Preço" value={priceTierForm.preco} onChange={(e) => setPriceTierForm((prev) => ({ ...prev, preco: e.target.value }))} />
                      <input type="number" min="1" className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 bg-white shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none" placeholder="Qtd. mínima" value={priceTierForm.minimo_quantidade} onChange={(e) => setPriceTierForm((prev) => ({ ...prev, minimo_quantidade: e.target.value }))} />
                    </div>
                    <Button type="button" className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={handleSavePriceTier}>{editingPriceTier ? 'Salvar tabela' : 'Adicionar tabela de preço'}</Button>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                    {priceTiers.map((tier) => (
                      <div key={tier.id} className="bg-white border border-slate-200 rounded-xl p-3">
                        <div className="flex justify-between gap-3">
                          <div>
                            <div className="font-semibold text-slate-800">{tier.nome_tabela}</div>
                            <div className="text-xs text-slate-500">{formatCurrency(tier.preco)} • Qtd. mínima {tier.minimo_quantidade}</div>
                          </div>
                          <div className="flex gap-1">
                            <Button type="button" size="icon" variant="ghost" onClick={() => handleEditPriceTier(tier)}><Edit className="w-4 h-4" /></Button>
                            <Button type="button" size="icon" variant="ghost" onClick={() => handleDeletePriceTier(tier.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 tracking-tight">Kits / Combos</h3>
                      <p className="text-sm text-slate-500">Composição do produto com outros itens.</p>
                    </div>
                    <span className="px-2 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-semibold">{combos.length}</span>
                  </div>
                  <div className="space-y-3">
                    <select className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 bg-white shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none" value={comboForm.produto_filho_id} onChange={(e) => setComboForm((prev) => ({ ...prev, produto_filho_id: e.target.value }))}>
                      <option value="">Selecione um produto componente</option>
                      {productOptions.map((opt) => <option key={opt.id} value={opt.id}>{opt.nome} {opt.sku ? `- ${opt.sku}` : ''}</option>)}
                    </select>
                    <div className="grid grid-cols-2 gap-3">
                      <input type="number" min="1" step="0.01" className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 bg-white shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none" placeholder="Quantidade" value={comboForm.quantidade} onChange={(e) => setComboForm((prev) => ({ ...prev, quantidade: e.target.value }))} />
                      <input className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 bg-white shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none" placeholder="Observações" value={comboForm.observacoes} onChange={(e) => setComboForm((prev) => ({ ...prev, observacoes: e.target.value }))} />
                    </div>
                    <Button type="button" className="w-full bg-violet-600 hover:bg-violet-700" onClick={handleSaveCombo}>{editingCombo ? 'Salvar composição' : 'Adicionar ao kit'}</Button>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                    {combos.map((combo) => (
                      <div key={combo.id} className="bg-white border border-slate-200 rounded-xl p-3">
                        <div className="flex justify-between gap-3">
                          <div>
                            <div className="font-semibold text-slate-800">{combo.produto_filho_nome || 'Componente'}</div>
                            <div className="text-xs text-slate-500">Qtd. {combo.quantidade} {combo.observacoes ? `• ${combo.observacoes}` : ''}</div>
                          </div>
                          <div className="flex gap-1">
                            <Button type="button" size="icon" variant="ghost" onClick={() => handleEditCombo(combo)}><Edit className="w-4 h-4" /></Button>
                            <Button type="button" size="icon" variant="ghost" onClick={() => handleDeleteCombo(combo.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
            <Button variant="outline" className="border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shadow-sm" onClick={onClose}>Cancelar</Button>
            <Button className="bg-[#2563eb] hover:bg-[#1d4ed8] shadow-sm" onClick={onSubmit} disabled={submitting}>{submitting ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Cadastrar produto'}</Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const CadastroProdutos = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: produtos, loading, fetchAll, create, update, remove } = useSupabaseCrud('estoque_produtos');

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(createInitialForm());

  const [variations, setVariations] = useState([]);
  const [priceTiers, setPriceTiers] = useState([]);
  const [combos, setCombos] = useState([]);
  const [variationForm, setVariationForm] = useState(createVariationForm());
  const [priceTierForm, setPriceTierForm] = useState(createPriceTierForm());
  const [comboForm, setComboForm] = useState(createComboForm());
  const [editingVariation, setEditingVariation] = useState(null);
  const [editingPriceTier, setEditingPriceTier] = useState(null);
  const [editingCombo, setEditingCombo] = useState(null);

  useEffect(() => {
    if (user) fetchAll(1, 1000);
  }, [user, fetchAll]);

  const categories = useMemo(() => {
    const values = [...new Set(produtos.map((item) => item.categoria).filter(Boolean))];
    return ['Todas', ...values];
  }, [produtos]);

  const filteredProducts = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return produtos
      .filter((item) => categoryFilter === 'Todas' || (item.categoria || '') === categoryFilter)
      .filter((item) => statusFilter === 'Todos' || (item.status || 'Ativo') === statusFilter)
      .filter((item) => {
        const text = `${item.nome || ''} ${item.sku || ''} ${item.categoria || ''} ${item.localizacao || ''} ${item.codigo_barras || ''}`.toLowerCase();
        return text.includes(term);
      })
      .sort((a, b) => (a.nome || '').localeCompare(b.nome || '', 'pt-BR'));
  }, [produtos, searchTerm, categoryFilter, statusFilter]);

  const stats = useMemo(() => {
    const totalProdutos = produtos.length;
    const totalEstoque = produtos.reduce((acc, item) => acc + Number(item.quantidade || 0), 0);
    const valorCusto = produtos.reduce((acc, item) => acc + (Number(item.quantidade || 0) * Number(item.preco_custo || 0)), 0);
    const valorVenda = produtos.reduce((acc, item) => acc + (Number(item.quantidade || 0) * Number(item.preco_venda || 0)), 0);
    const estoqueBaixo = produtos.filter((item) => Number(item.quantidade || 0) <= Number(item.estoque_minimo || 0)).length;
    return { totalProdutos, totalEstoque, valorCusto, valorVenda, estoqueBaixo };
  }, [produtos]);

  const resetAdvanced = () => {
    setVariations([]);
    setPriceTiers([]);
    setCombos([]);
    setVariationForm(createVariationForm());
    setPriceTierForm(createPriceTierForm());
    setComboForm(createComboForm());
    setEditingVariation(null);
    setEditingPriceTier(null);
    setEditingCombo(null);
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData(createInitialForm());
    resetAdvanced();
    setIsModalOpen(true);
  };

  const loadAdvancedData = async (productId) => {
    const [variationResp, priceResp, comboResp] = await Promise.all([
      supabase.from('estoque_produto_variacoes').select('*').eq('produto_id', productId).order('created_at', { ascending: false }),
      supabase.from('estoque_produto_precos').select('*').eq('produto_id', productId).order('minimo_quantidade', { ascending: true }),
      supabase.from('estoque_produto_componentes').select('*, produto_filho:produto_filho_id(nome, sku)').eq('produto_pai_id', productId).order('created_at', { ascending: false }),
    ]);

    setVariations((variationResp.data || []).map((item) => ({ ...item })));
    setPriceTiers((priceResp.data || []).map((item) => ({ ...item })));
    setCombos((comboResp.data || []).map((item) => ({
      ...item,
      produto_filho_nome: item.produto_filho?.nome || '',
    })));
  };

  const openEditModal = async (product) => {
    setEditingProduct(product);
    setFormData({
      id: product.id,
      nome: product.nome || '',
      sku: product.sku || '',
      codigo_barras: product.codigo_barras || '',
      categoria: product.categoria || '',
      marca: product.marca || '',
      unidade: product.unidade || 'un',
      quantidade: Number(product.quantidade || 0),
      estoque_minimo: Number(product.estoque_minimo || 0),
      preco_custo: Number(product.preco_custo || 0),
      preco_venda: Number(product.preco_venda || 0),
      margem_lucro: Number(product.margem_lucro || 0),
      status: product.status || 'Ativo',
      localizacao: product.localizacao || '',
      fornecedor_nome: product.fornecedor_nome || '',
      descricao: product.descricao || '',
      imagem_url: product.imagem_url || '',
    });
    resetAdvanced();
    await loadAdvancedData(product.id);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async () => {
    if (!user) return;
    if (!formData.nome.trim()) {
      toast({ title: 'Erro', description: 'Informe o nome do produto.', variant: 'destructive' });
      return;
    }

    const payload = {
      user_id: user.id,
      nome: formData.nome.trim(),
      sku: formData.sku?.trim() || null,
      categoria: formData.categoria?.trim() || null,
      quantidade: Number(formData.quantidade || 0),
      preco_custo: Number(formData.preco_custo || 0),
      preco_venda: Number(formData.preco_venda || 0),
      localizacao: formData.localizacao?.trim() || null,
      codigo_barras: formData.codigo_barras?.trim() || null,
      unidade: formData.unidade || 'un',
      estoque_minimo: Number(formData.estoque_minimo || 0),
      margem_lucro: Number(formData.margem_lucro || 0),
      status: formData.status || 'Ativo',
      descricao: formData.descricao?.trim() || null,
      imagem_url: formData.imagem_url?.trim() || null,
      marca: formData.marca?.trim() || null,
      fornecedor_nome: formData.fornecedor_nome?.trim() || null,
      updated_at: new Date().toISOString(),
    };

    try {
      setSubmitting(true);
      let saved;
      if (editingProduct) {
        saved = await update(editingProduct.id, payload);
      } else {
        saved = await create(payload);
      }
      if (!saved?.id) throw new Error('Não foi possível salvar o produto.');

      if (!editingProduct && Number(payload.preco_venda) > 0) {
        await supabase.from('estoque_produto_historico_precos').insert({
          user_id: user.id,
          produto_id: saved.id,
          preco_custo: payload.preco_custo,
          preco_venda: payload.preco_venda,
          margem_lucro: payload.margem_lucro,
          origem: 'cadastro_inicial',
        });
      }

      if (editingProduct && (Number(editingProduct.preco_venda || 0) !== Number(payload.preco_venda) || Number(editingProduct.preco_custo || 0) !== Number(payload.preco_custo))) {
        await supabase.from('estoque_produto_historico_precos').insert({
          user_id: user.id,
          produto_id: editingProduct.id,
          preco_custo: payload.preco_custo,
          preco_venda: payload.preco_venda,
          margem_lucro: payload.margem_lucro,
          origem: 'atualizacao_manual',
        });
      }

      await fetchAll(1, 1000);
      setIsModalOpen(false);
      setSubmitting(false);
      setEditingProduct(null);
      setFormData(createInitialForm());
      resetAdvanced();
    } catch (error) {
      setSubmitting(false);
      toast({ title: 'Erro ao salvar', description: error.message || 'Falha ao salvar produto.', variant: 'destructive' });
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Deseja excluir este produto?')) return;
    await remove(id);
    await fetchAll(1, 1000);
  };

  const saveRow = async ({ table, payload, editingId, reset, reload }) => {
    if (!user || !editingProduct?.id) return;
    if (editingId) {
      const { error } = await supabase.from(table).update({ ...payload, updated_at: new Date().toISOString() }).eq('id', editingId);
      if (error) throw error;
    } else {
      const { error } = await supabase.from(table).insert({ ...payload, user_id: user.id });
      if (error) throw error;
    }
    reset();
    await reload(editingProduct.id);
  };

  const handleSaveVariation = async () => {
    try {
      if (!variationForm.nome.trim()) {
        toast({ title: 'Erro', description: 'Informe o nome da variação.', variant: 'destructive' });
        return;
      }
      await saveRow({
        table: 'estoque_produto_variacoes',
        payload: {
          produto_id: editingProduct.id,
          nome: variationForm.nome.trim(),
          sku: variationForm.sku?.trim() || null,
          codigo_barras: variationForm.codigo_barras?.trim() || null,
          adicional_preco: Number(variationForm.adicional_preco || 0),
          estoque: Number(variationForm.estoque || 0),
          status: variationForm.status || 'Ativa',
        },
        editingId: editingVariation?.id,
        reset: () => {
          setVariationForm(createVariationForm());
          setEditingVariation(null);
        },
        reload: loadAdvancedData,
      });
    } catch (error) {
      toast({ title: 'Erro', description: error.message || 'Não foi possível salvar a variação.', variant: 'destructive' });
    }
  };

  const handleSavePriceTier = async () => {
    try {
      if (!priceTierForm.nome_tabela.trim()) {
        toast({ title: 'Erro', description: 'Informe o nome da tabela de preço.', variant: 'destructive' });
        return;
      }
      await saveRow({
        table: 'estoque_produto_precos',
        payload: {
          produto_id: editingProduct.id,
          nome_tabela: priceTierForm.nome_tabela.trim(),
          preco: Number(priceTierForm.preco || 0),
          minimo_quantidade: Number(priceTierForm.minimo_quantidade || 1),
          ativo: !!priceTierForm.ativo,
        },
        editingId: editingPriceTier?.id,
        reset: () => {
          setPriceTierForm(createPriceTierForm());
          setEditingPriceTier(null);
        },
        reload: loadAdvancedData,
      });
    } catch (error) {
      toast({ title: 'Erro', description: error.message || 'Não foi possível salvar a tabela de preço.', variant: 'destructive' });
    }
  };

  const handleSaveCombo = async () => {
    try {
      if (!comboForm.produto_filho_id) {
        toast({ title: 'Erro', description: 'Selecione um produto componente.', variant: 'destructive' });
        return;
      }
      await saveRow({
        table: 'estoque_produto_componentes',
        payload: {
          produto_pai_id: editingProduct.id,
          produto_filho_id: comboForm.produto_filho_id,
          quantidade: Number(comboForm.quantidade || 1),
          observacoes: comboForm.observacoes?.trim() || null,
        },
        editingId: editingCombo?.id,
        reset: () => {
          setComboForm(createComboForm());
          setEditingCombo(null);
        },
        reload: loadAdvancedData,
      });
    } catch (error) {
      toast({ title: 'Erro', description: error.message || 'Não foi possível salvar a composição.', variant: 'destructive' });
    }
  };

  const deleteAdvanced = async (table, id, reload) => {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) {
      toast({ title: 'Erro', description: error.message || 'Não foi possível excluir.', variant: 'destructive' });
      return;
    }
    await reload(editingProduct.id);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Produtos</h1>
          <p className="text-slate-500 mt-1">Cadastro comercial avançado para produtos, preços, variações e kits.</p>
        </div>
        <Button className="bg-[#2563eb] hover:bg-[#1d4ed8] shadow-sm" onClick={openCreateModal}><Plus className="w-4 h-4 mr-2" />Novo produto</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-[24px] p-5 shadow-sm"><div className="flex justify-between items-center"><span className="text-sm text-slate-500">Produtos</span><Package className="w-5 h-5 text-blue-500" /></div><div className="text-2xl font-bold text-slate-900 mt-2">{stats.totalProdutos}</div></div>
        <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-[24px] p-5 shadow-sm"><div className="flex justify-between items-center"><span className="text-sm text-slate-500">Saldo em estoque</span><Boxes className="w-5 h-5 text-indigo-500" /></div><div className="text-2xl font-bold text-slate-900 mt-2">{stats.totalEstoque}</div></div>
        <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-[24px] p-5 shadow-sm"><div className="flex justify-between items-center"><span className="text-sm text-slate-500">Valor de custo</span><BadgeDollarSign className="w-5 h-5 text-emerald-500" /></div><div className="text-xl font-bold text-slate-900 mt-2">{formatCurrency(stats.valorCusto)}</div></div>
        <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-[24px] p-5 shadow-sm"><div className="flex justify-between items-center"><span className="text-sm text-slate-500">Valor de venda</span><Layers className="w-5 h-5 text-violet-500" /></div><div className="text-xl font-bold text-slate-900 mt-2">{formatCurrency(stats.valorVenda)}</div></div>
        <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-[24px] p-5 shadow-sm"><div className="flex justify-between items-center"><span className="text-sm text-slate-500">Estoque baixo</span><AlertTriangle className="w-5 h-5 text-amber-500" /></div><div className="text-2xl font-bold text-amber-700 mt-2">{stats.estoqueBaixo}</div></div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[26px] p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr,0.8fr,0.8fr] gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input className="w-full border border-slate-300 rounded-xl pl-10 pr-3 py-2.5 text-slate-800 bg-white shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none" placeholder="Buscar por nome, SKU, categoria, localização ou código de barras..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <select className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 bg-white shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <select className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 bg-white shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="Todos">Todos os status</option>
            <option value="Ativo">Ativo</option>
            <option value="Inativo">Inativo</option>
            <option value="Descontinuado">Descontinuado</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/90 text-slate-700">
              <tr>
                <th className="p-3 font-semibold tracking-tight">Produto</th>
                <th className="p-3 font-semibold tracking-tight">SKU / Código</th>
                <th className="p-3 font-semibold tracking-tight">Categoria</th>
                <th className="p-3 font-semibold tracking-tight">Estoque</th>
                <th className="p-3 font-semibold tracking-tight">Preços</th>
                <th className="p-3 font-semibold tracking-tight">Status</th>
                <th className="p-3 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="p-6 text-center text-slate-500">Carregando produtos...</td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan="7" className="p-6 text-center text-slate-500">Nenhum produto encontrado.</td></tr>
              ) : filteredProducts.map((item) => (
                <tr key={item.id} className="border-b last:border-b-0">
                  <td className="p-3">
                    <div className="font-semibold text-slate-900">{item.nome}</div>
                    <div className="text-xs text-slate-500">{item.marca || 'Sem marca'} {item.localizacao ? `• ${item.localizacao}` : ''}</div>
                    {item.descricao ? <div className="text-xs text-slate-400 line-clamp-1 mt-1">{item.descricao}</div> : null}
                  </td>
                  <td className="p-3 text-slate-700">
                    <div>{item.sku || '-'}</div>
                    <div className="text-xs text-slate-500">{item.codigo_barras || '-'}</div>
                  </td>
                  <td className="p-3 text-slate-700">{item.categoria || '-'}</td>
                  <td className="p-3">
                    <div className="font-semibold text-slate-900">{Number(item.quantidade || 0)} {item.unidade || 'un'}</div>
                    <div className={`text-xs ${Number(item.quantidade || 0) <= Number(item.estoque_minimo || 0) ? 'text-amber-600 font-semibold' : 'text-slate-500'}`}>Mínimo {Number(item.estoque_minimo || 0)}</div>
                  </td>
                  <td className="p-3 text-slate-700">
                    <div>Custo: {formatCurrency(item.preco_custo)}</div>
                    <div className="font-semibold text-slate-900">Venda: {formatCurrency(item.preco_venda)}</div>
                  </td>
                  <td className="p-3">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${item.status === 'Ativo' ? 'bg-emerald-100 text-emerald-700' : item.status === 'Descontinuado' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'}`}>{item.status || 'Ativo'}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => navigator.clipboard?.writeText(item.sku || item.codigo_barras || item.nome)}><Copy className="w-4 h-4 text-slate-500" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => openEditModal(item)}><Edit className="w-4 h-4 text-blue-600" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(item.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <ProductModal
          formData={formData}
          setFormData={setFormData}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSaveProduct}
          isEditing={!!editingProduct}
          submitting={submitting}
          variationForm={variationForm}
          setVariationForm={setVariationForm}
          handleSaveVariation={handleSaveVariation}
          editingVariation={editingVariation}
          variations={variations}
          handleEditVariation={(item) => { setEditingVariation(item); setVariationForm({ ...item }); }}
          handleDeleteVariation={(id) => deleteAdvanced('estoque_produto_variacoes', id, loadAdvancedData)}
          priceTierForm={priceTierForm}
          setPriceTierForm={setPriceTierForm}
          handleSavePriceTier={handleSavePriceTier}
          editingPriceTier={editingPriceTier}
          priceTiers={priceTiers}
          handleEditPriceTier={(item) => { setEditingPriceTier(item); setPriceTierForm({ ...item }); }}
          handleDeletePriceTier={(id) => deleteAdvanced('estoque_produto_precos', id, loadAdvancedData)}
          comboForm={comboForm}
          setComboForm={setComboForm}
          handleSaveCombo={handleSaveCombo}
          editingCombo={editingCombo}
          combos={combos}
          handleEditCombo={(item) => { setEditingCombo(item); setComboForm({ id: item.id, produto_filho_id: item.produto_filho_id, quantidade: item.quantidade, observacoes: item.observacoes || '' }); }}
          handleDeleteCombo={(id) => deleteAdvanced('estoque_produto_componentes', id, loadAdvancedData)}
          productOptions={produtos.filter((p) => p.id !== editingProduct?.id)}
          canManageAdvanced={!!editingProduct}
        />
      )}
    </motion.div>
  );
};

export default CadastroProdutos;
