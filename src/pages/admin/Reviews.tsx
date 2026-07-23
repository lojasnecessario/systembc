import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Check, X, Search, Download, Upload, Trash2, Star } from 'lucide-react';
import Papa from 'papaparse';

interface Review {
  id: string;
  product_id: string;
  reviewer_name: string;
  rating: number;
  comment: string;
  image_url?: string;
  is_approved: boolean;
  created_at: string;
  products?: { name: string; sku: string };
}

interface Product {
  id: string;
  name: string;
  sku: string;
}

export const Reviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  // Formulário
  const [formData, setFormData] = useState<Partial<Review>>({
    reviewer_name: '',
    rating: 5,
    comment: '',
    is_approved: true,
  });
  const [saving, setSaving] = useState(false);
  
  // CSV Import
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reviewsRes, productsRes] = await Promise.all([
        supabase
          .from('product_reviews')
          .select('*, products(name, sku)')
          .order('created_at', { ascending: false }),
        supabase
          .from('products')
          .select('id, name, sku')
          .order('name')
      ]);

      if (reviewsRes.error) throw reviewsRes.error;
      if (productsRes.error) throw productsRes.error;

      setReviews(reviewsRes.data || []);
      setProducts(productsRes.data || []);
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('product_reviews')
        .update({ is_approved: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      await fetchData();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      alert('Erro ao alterar status da avaliação.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta avaliação?')) return;
    try {
      const { error } = await supabase.from('product_reviews').delete().eq('id', id);
      if (error) throw error;
      await fetchData();
    } catch (error) {
      console.error('Erro ao excluir:', error);
      alert('Erro ao excluir a avaliação.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'rating' ? parseFloat(value) : value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.product_id || !formData.reviewer_name || !formData.rating) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      setSaving(true);
      const { error } = await supabase.from('product_reviews').insert([formData]);
      if (error) throw error;
      
      setIsModalOpen(false);
      setFormData({ reviewer_name: '', rating: 5, comment: '', is_approved: true });
      await fetchData();
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error);
      alert('Erro ao salvar a avaliação.');
    } finally {
      setSaving(false);
    }
  };

  const downloadCSVTemplate = () => {
    const csvContent = "\uFEFFsku_produto;nome_cliente;nota;comentario;imagem_url\nSKU-EXEMPLO;João Silva;5;Ótimo produto, chegou muito rápido!;https://link-da-imagem.com/img.jpg";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "modelo_avaliacoes.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.replace(/^\uFEFF/, '').trim().toLowerCase(),
      complete: async (results: any) => {
        try {
          const rows = results.data;
          let successCount = 0;
          
          if (rows.length === 0) {
            alert("O arquivo CSV parece estar vazio ou num formato inválido.");
            setIsImporting(false);
            return;
          }

          // Busca todos os produtos para ter um mapa de SKU -> ID e Nome -> ID
          const skuToIdMap = new Map(products.map(p => [p.sku, p.id]));
          const nameToIdMap = new Map(products.map(p => [p.name.toLowerCase(), p.id]));

          const reviewsToInsert = [];
          const missingProducts = new Set<string>();

          for (const row of rows) {
            const rowSku = row.sku_produto || row.sku;
            const rowName = row.product_title || row.produto || '';
            
            let productId = null;
            if (rowSku) {
              productId = skuToIdMap.get(rowSku.trim());
            } 
            if (!productId && rowName) {
              const searchName = rowName.trim().toLowerCase();
              productId = nameToIdMap.get(searchName);
              
              // Busca aproximada (substring) caso não encontre exatamente
              if (!productId) {
                const found = products.find(p => 
                  p.name.toLowerCase().includes(searchName) || 
                  searchName.includes(p.name.toLowerCase())
                );
                if (found) productId = found.id;
              }
            }

            if (!productId) {
              console.warn(`Produto não encontrado para a linha:`, row);
              if (rowName) missingProducts.add(rowName);
              continue;
            }

            // Tratamento especial para múltiplas imagens separadas por vírgula no CSV
            let finalImageUrl = null;
            const rawImage = row.images || row.imagem_url || row.imagem || row.image;
            if (rawImage) {
              finalImageUrl = rawImage.split(',')[0].trim();
            }

            reviewsToInsert.push({
              product_id: productId,
              reviewer_name: row.author || row.nome_cliente || row.nome || 'Cliente Anônimo',
              rating: parseFloat(row.rating || row.nota || '5'),
              comment: row.content || row.comentario || '',
              image_url: finalImageUrl,
              is_approved: row.status === 'hidden' ? false : true
            });
            
            successCount++;
          }

          if (reviewsToInsert.length > 0) {
            const { error } = await supabase.from('product_reviews').insert(reviewsToInsert);
            if (error) throw error;
          }

          let msg = `Importação concluída! ${successCount} avaliações processadas.`;
          if (missingProducts.size > 0) {
            msg += `\n\nAtenção: ${missingProducts.size} produtos do CSV não foram encontrados na sua loja e foram ignorados (ex: ${Array.from(missingProducts).slice(0, 3).join(', ')}). Certifique-se de que os nomes no CSV correspondam aos produtos reais da sua loja.`;
          }
          alert(msg);
          
          fetchData();
        } catch (error: any) {
          console.error("Erro na importação:", error);
          alert("Ocorreu um erro durante a importação. Verifique o console.");
        } finally {
          setIsImporting(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      },
      error: (error: any) => {
        console.error("Erro na leitura do CSV:", error);
        alert('Erro ao ler o arquivo CSV.');
        setIsImporting(false);
      }
    });
  };

  const filteredReviews = reviews.filter(r => 
    r.reviewer_name.toLowerCase().includes(search.toLowerCase()) || 
    r.products?.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.comment.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Avaliações</h1>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar avaliações..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
            />
          </div>
          <button 
            onClick={downloadCSVTemplate}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors whitespace-nowrap"
          >
            <Download size={20} />
            Modelo CSV
          </button>
          <input 
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors whitespace-nowrap"
          >
            <Upload size={20} />
            {isImporting ? 'Importando...' : 'Importar CSV'}
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors whitespace-nowrap"
          >
            <Plus size={20} />
            Nova Avaliação
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Produto</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Cliente</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Nota</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Comentário</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-center">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Carregando avaliações...
                  </td>
                </tr>
              ) : filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Nenhuma avaliação encontrada.
                  </td>
                </tr>
              ) : (
                filteredReviews.map((review) => (
                  <tr key={review.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{review.products?.name}</td>
                    <td className="px-6 py-4 text-slate-600">{review.reviewer_name}</td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star size={16} fill="currentColor" />
                        <span className="text-slate-700">{review.rating}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 max-w-xs truncate">{review.comment}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleStatusToggle(review.id, review.is_approved)}
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          review.is_approved
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        }`}
                      >
                        {review.is_approved ? 'Aprovada' : 'Pendente'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleDelete(review.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir avaliação"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Nova Avaliação</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Produto *
                  </label>
                  <select
                    name="product_id"
                    value={formData.product_id || ''}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Selecione um produto</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (SKU: {p.sku})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nome do Cliente *
                  </label>
                  <input
                    type="text"
                    name="reviewer_name"
                    value={formData.reviewer_name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: João S."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nota (0 a 5) *
                  </label>
                  <input
                    type="number"
                    name="rating"
                    value={formData.rating}
                    onChange={handleChange}
                    min="0"
                    max="5"
                    step="0.5"
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Comentário
                  </label>
                  <textarea
                    name="comment"
                    value={formData.comment}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="O que o cliente achou do produto?"
                  />
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <input
                    type="checkbox"
                    id="is_approved"
                    name="is_approved"
                    checked={formData.is_approved}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_approved: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                  <label htmlFor="is_approved" className="text-sm font-medium text-slate-700 cursor-pointer">
                    Aprovar avaliação automaticamente
                  </label>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg transition-colors flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      Salvar Avaliação
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
