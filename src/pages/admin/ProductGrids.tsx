import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, X, Search, Check, XCircle, ArrowUp, ArrowDown } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  main_image: string | null;
  price: number;
}

interface GridItem {
  id?: string;
  product_id: string;
  order_index: number;
  product?: Product;
}

interface Grid {
  id: string;
  title: string;
  category_id: string | null;
  order_grid: number;
  is_active: boolean;
  categories?: { name: string; slug: string };
  items?: GridItem[];
}

export const ProductGrids: React.FC = () => {
  const [grids, setGrids] = useState<Grid[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [orderGrid, setOrderGrid] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [gridItems, setGridItems] = useState<GridItem[]>([]);
  
  // Product Search State inside Modal
  const [productSearch, setProductSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [gridsRes, categoriesRes, productsRes] = await Promise.all([
        supabase
          .from('product_grids')
          .select('*, categories(name, slug)')
          .order('order_grid', { ascending: true }),
        supabase.from('categories').select('id, name, slug').eq('is_active', true).order('name'),
        supabase.from('products').select('id, name, sku, main_image, price').eq('is_active', true)
      ]);

      if (gridsRes.error) throw gridsRes.error;
      
      // Fetch items for each grid
      const gridsData = gridsRes.data || [];
      const gridsWithItems = await Promise.all(gridsData.map(async (grid) => {
        const { data: items } = await supabase
          .from('product_grid_items')
          .select('id, product_id, order_index, products(id, name, sku, main_image, price)')
          .eq('grid_id', grid.id)
          .order('order_index', { ascending: true });
        
        return {
          ...grid,
          items: items?.map(item => ({
            id: item.id,
            product_id: item.product_id,
            order_index: item.order_index,
            product: Array.isArray(item.products) ? item.products[0] : item.products
          })) || []
        };
      }));

      setGrids(gridsWithItems);
      setCategories(categoriesRes.data || []);
      setAllProducts(productsRes.data || []);
    } catch (error) {
      console.error('Error fetching grids:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (grid?: Grid) => {
    if (grid) {
      setEditingId(grid.id);
      setTitle(grid.title);
      setCategoryId(grid.category_id || '');
      setOrderGrid(grid.order_grid);
      setIsActive(grid.is_active);
      setGridItems(grid.items || []);
    } else {
      setEditingId(null);
      setTitle('');
      setCategoryId('');
      setOrderGrid(grids.length > 0 ? Math.max(...grids.map(g => g.order_grid)) + 1 : 1);
      setIsActive(true);
      setGridItems([]);
    }
    setProductSearch('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleAddProduct = (product: Product) => {
    if (gridItems.length >= 6) {
      alert('Um grid pode ter no máximo 6 produtos.');
      return;
    }
    if (gridItems.some(item => item.product_id === product.id)) {
      alert('Este produto já está no grid.');
      return;
    }
    
    setGridItems([
      ...gridItems,
      { product_id: product.id, order_index: gridItems.length, product }
    ]);
    setProductSearch(''); // limpa a busca apos adicionar
  };

  const handleRemoveProduct = (index: number) => {
    const newItems = [...gridItems];
    newItems.splice(index, 1);
    // Reordenar os índices
    newItems.forEach((item, i) => item.order_index = i);
    setGridItems(newItems);
  };

  const moveProduct = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === gridItems.length - 1) return;

    const newItems = [...gridItems];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap items
    const temp = newItems[index];
    newItems[index] = newItems[swapIndex];
    newItems[swapIndex] = temp;
    
    // Update order_index
    newItems.forEach((item, i) => item.order_index = i);
    setGridItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (gridItems.length === 0) {
      alert('Adicione pelo menos 1 produto ao grid.');
      return;
    }
    setSaving(true);

    try {
      const gridData = {
        title,
        category_id: categoryId || null,
        order_grid: orderGrid,
        is_active: isActive
      };

      let currentGridId = editingId;

      if (editingId) {
        // Atualizar grid
        const { error } = await supabase.from('product_grids').update(gridData).eq('id', editingId);
        if (error) throw error;
      } else {
        // Criar grid
        const { data, error } = await supabase.from('product_grids').insert([gridData]).select().single();
        if (error) throw error;
        currentGridId = data.id;
      }

      // Deletar items antigos (forma mais simples)
      if (editingId) {
        await supabase.from('product_grid_items').delete().eq('grid_id', editingId);
      }

      // Inserir novos itens
      const itemsToInsert = gridItems.map((item, index) => ({
        grid_id: currentGridId,
        product_id: item.product_id,
        order_index: index
      }));

      if (itemsToInsert.length > 0) {
        const { error: itemsError } = await supabase.from('product_grid_items').insert(itemsToInsert);
        if (itemsError) throw itemsError;
      }

      await fetchData();
      closeModal();
    } catch (error: any) {
      alert(`Erro: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, gridTitle: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o grid "${gridTitle}"?`)) {
      try {
        const { error } = await supabase.from('product_grids').delete().eq('id', id);
        if (error) throw error;
        await fetchData();
      } catch (error: any) {
        alert(`Erro ao excluir: ${error.message}`);
      }
    }
  };

  // Filtrar produtos para busca
  const filteredProducts = allProducts.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
    (p.sku && p.sku.toLowerCase().includes(productSearch.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Vitrines (Grids de Produtos)</h1>
        <button 
          onClick={() => openModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
        >
          <Plus size={20} />
          Nova Vitrine
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Título do Grid</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Categoria (Ver Todos)</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Qtd Produtos</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Ordem</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    <div className="flex justify-center mb-2">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    Carregando grids...
                  </td>
                </tr>
              ) : grids.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Nenhuma vitrine cadastrada.
                  </td>
                </tr>
              ) : (
                grids.map((grid) => (
                  <tr key={grid.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {grid.title}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {grid.categories ? grid.categories.name : <span className="text-slate-400 italic">Sem link</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {grid.items?.length || 0}/6
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {grid.order_grid}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        grid.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {grid.is_active ? <Check size={14} /> : <XCircle size={14} />}
                        {grid.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openModal(grid)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(grid.id, grid.title)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={18} />
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

      {/* Modal CRUD */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl my-8">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10 rounded-t-2xl">
              <h2 className="text-xl font-bold text-slate-900">
                {editingId ? 'Editar Vitrine' : 'Nova Vitrine'}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Configurações do Grid */}
                <div className="space-y-4 lg:col-span-1 border-b lg:border-b-0 lg:border-r border-slate-100 pb-6 lg:pb-0 lg:pr-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Configurações</h3>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Título do Grid</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="Ex: Mais Vendidos"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Categoria (Link 'Ver Todos')</label>
                    <select
                      value={categoryId}
                      onChange={e => setCategoryId(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="">Sem link para categoria</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Ordem</label>
                      <input
                        type="number"
                        required
                        value={orderGrid}
                        onChange={e => setOrderGrid(Number(e.target.value))}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="pt-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
                      <span className="text-sm font-medium text-slate-700">Vitrine Ativa na Home</span>
                    </label>
                  </div>
                </div>

                {/* Seleção de Produtos */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900">Produtos Selecionados ({gridItems.length}/6)</h3>
                  </div>

                  {/* Lista de Produtos Adicionados */}
                  <div className="space-y-2 min-h-[160px] bg-slate-50 p-4 rounded-xl border border-slate-200">
                    {gridItems.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-slate-400 text-sm py-8">
                        Nenhum produto adicionado ainda. Pesquise abaixo.
                      </div>
                    ) : (
                      gridItems.map((item, index) => (
                        <div key={item.product_id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                          <div className="flex items-center gap-3">
                            <span className="text-slate-400 font-medium w-4">{index + 1}.</span>
                            {item.product?.main_image ? (
                              <img src={item.product.main_image} alt="" className="w-10 h-10 object-cover rounded bg-slate-100" />
                            ) : (
                              <div className="w-10 h-10 bg-slate-100 rounded border border-slate-200" />
                            )}
                            <div>
                              <div className="text-sm font-medium text-slate-900 line-clamp-1">{item.product?.name}</div>
                              <div className="text-xs text-slate-500">{item.product?.sku}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button type="button" onClick={() => moveProduct(index, 'up')} disabled={index === 0} className="p-1 text-slate-400 hover:text-blue-600 disabled:opacity-30"><ArrowUp size={16} /></button>
                            <button type="button" onClick={() => moveProduct(index, 'down')} disabled={index === gridItems.length - 1} className="p-1 text-slate-400 hover:text-blue-600 disabled:opacity-30"><ArrowDown size={16} /></button>
                            <div className="w-px h-4 bg-slate-200 mx-1"></div>
                            <button type="button" onClick={() => handleRemoveProduct(index)} className="p-1 text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Buscar e Adicionar Novos */}
                  {gridItems.length < 6 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-slate-700">Buscar produtos para adicionar</h4>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                          type="text" 
                          placeholder="Digite o nome ou SKU do produto..." 
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          className="pl-9 pr-4 py-2 w-full border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      {productSearch.length > 1 && (
                        <div className="border border-slate-200 rounded-lg max-h-48 overflow-y-auto bg-white shadow-sm absolute z-20 w-full lg:w-auto lg:right-6 lg:left-1/3 mt-1">
                          {filteredProducts.length === 0 ? (
                            <div className="p-4 text-center text-sm text-slate-500">Nenhum produto encontrado.</div>
                          ) : (
                            filteredProducts.slice(0, 10).map(product => {
                              const isAdded = gridItems.some(i => i.product_id === product.id);
                              return (
                                <div key={product.id} className="flex items-center justify-between p-3 border-b border-slate-100 last:border-0 hover:bg-slate-50">
                                  <div className="flex items-center gap-3">
                                    {product.main_image && <img src={product.main_image} alt="" className="w-8 h-8 object-cover rounded" />}
                                    <div>
                                      <div className="text-sm font-medium text-slate-900 line-clamp-1">{product.name}</div>
                                      <div className="text-xs text-slate-500">R$ {product.price}</div>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleAddProduct(product)}
                                    disabled={isAdded}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                                      isAdded ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                                    }`}
                                  >
                                    {isAdded ? 'Adicionado' : 'Adicionar'}
                                  </button>
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white pb-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50"
                >
                  {saving ? 'Salvando...' : 'Salvar Vitrine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
