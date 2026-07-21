import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { uploadImage } from '../../utils/upload';
import { Plus, Edit2, Trash2, X, Image as ImageIcon, Search, Download, Upload } from 'lucide-react';
import Papa from 'papaparse';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category_id: string | null;
  brand_id: string | null;
  price: number;
  promotional_price: number | null;
  stock: number;
  sku: string;
  main_image: string | null;
  images: string[];
  order_grid: number;
  is_featured: boolean;
  is_new: boolean;
  is_active: boolean;

  categories?: { name: string };
  brands?: { name: string };
}

export const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [brands, setBrands] = useState<{id: string, name: string}[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  // Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    is_active: true,
    is_featured: false,
    is_new: false,
    order_grid: 0,
    price: 0,
    stock: 0,
    images: [],

  });
  
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [productsRes, categoriesRes, brandsRes] = await Promise.all([
        supabase
          .from('products')
          .select('*, categories(name), brands(name)')
          .order('created_at', { ascending: false }),
        supabase.from('categories').select('id, name').order('name'),
        supabase.from('brands').select('id, name').order('name')
      ]);

      if (productsRes.error) throw productsRes.error;
      
      setProducts(productsRes.data || []);
      setCategories(categoriesRes.data || []);
      setBrands(brandsRes.data || []);
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSVTemplate = () => {
    // Adicionamos o BOM (\uFEFF) para o Excel reconhecer os acentos (UTF-8) corretamente
    // E usamos ponto-e-vírgula (;) pois é o padrão do Excel no Brasil para separar colunas
    const csvContent = "\uFEFFsku;name;price;promotional_price;stock;description\nSKU-EXEMPLO;Camiseta Teste;99,90;79,90;10;Uma camiseta de teste super legal";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "modelo_produtos.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: function(h: string) {
        const header = h.trim().toLowerCase();
        // Mapeamento automático de cabeçalhos do Shopify para o nosso formato
        if (header === 'variant sku') return 'sku';
        if (header === 'title') return 'name';
        if (header === 'variant price') return 'price';
        if (header === 'variant compare at price') return 'promotional_price';
        if (header === 'variant inventory qty') return 'stock';
        if (header === 'body (html)') return 'description';
        if (header === 'image src') return 'main_image';
        if (header === 'handle') return 'handle'; // Mantém o handle para usar como fallback de SKU
        return header;
      },
      complete: async (results: any) => {
        try {
          const rows = results.data as any[];
          let successCount = 0;
          
          if (rows.length === 0) {
            alert("O arquivo CSV parece estar vazio ou num formato inválido.");
            setIsImporting(false);
            return;
          }

          for (const row of rows) {
            // Shopify às vezes deixa a coluna name (Title) vazia em linhas de variantes/imagens adicionais.
            // O fallback para SKU será o 'handle' do Shopify caso a pessoa não tenha cadastrado SKU lá.
            const rowSku = row.sku || row.handle;
            if (!rowSku) continue; // Pula se realmente não tiver identificador

            // Pula se não for a linha principal do produto (Shopify) e não tiver nome
            if (!row.name && !row.sku) continue; 

            const parseNumber = (val: any) => {
              if (!val) return null;
              if (typeof val === 'number') return val;
              if (typeof val === 'string') {
                const cleaned = val.replace(',', '.').replace(/[^0-9.-]+/g, '');
                const num = parseFloat(cleaned);
                return isNaN(num) ? null : num;
              }
              return null;
            };

            const finalName = String(row.name || row.handle).trim();

            const productData: any = {
              name: finalName,
              slug: generateSlug(finalName),
              sku: String(rowSku).trim(),
              price: parseNumber(row.price) || 0,
              promotional_price: parseNumber(row.promotional_price),
              stock: parseInt(String(row.stock || '0').replace(/[^0-9-]/g, ''), 10) || 0,
              description: row.description ? String(row.description).trim() : '',
              is_active: true,
              order_grid: 1
            };

            if (row.main_image) {
              productData.main_image = String(row.main_image).trim();
            }
            if (row.images) {
              productData.images = String(row.images).split(',').map((url: string) => url.trim()).filter(Boolean);
            }

            // Verifica se o produto com esse SKU já existe
            const { data: existingProduct } = await supabase
              .from('products')
              .select('id')
              .eq('sku', row.sku)
              .single();

            if (existingProduct) {
              // Atualiza produto existente
              const updateData = {
                price: productData.price,
                promotional_price: productData.promotional_price,
                stock: productData.stock,
                description: productData.description,
                ...(productData.main_image && { main_image: productData.main_image }),
                ...(productData.images && { images: productData.images })
              };

              await supabase
                .from('products')
                .update(updateData)
                .eq('id', existingProduct.id);
            } else {
              // Insere novo produto
              await supabase
                .from('products')
                .insert([productData]);
            }
            successCount++;
          }
          
          if (successCount === 0 && rows.length > 0) {
            const detectedHeaders = Object.keys(rows[0]).join(' | ');
            alert(`A planilha foi lida, mas nenhum produto foi importado.\n\nVerifique se o arquivo possui um cabeçalho válido do Shopify ou do nosso modelo.\nColunas encontradas pelo sistema: [ ${detectedHeaders} ]`);
          } else {
            alert(`Importação concluída! ${successCount} produtos processados.`);
          }
          fetchData(); // Recarrega a tabela
        } catch (error: any) {
          console.error("Erro na importação:", error);
          alert("Ocorreu um erro durante a importação. Verifique o console.");
        } finally {
          setIsImporting(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      },
      error: (error: any) => {
        console.error("Erro na leitura do CSV:", error);
        alert('Erro ao ler o arquivo CSV: ' + error.message);
        setIsImporting(false);
      }
    });
  };

  const generateSlug = (text: string) => {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'price' || name === 'promotional_price' || name === 'stock' || name === 'order_grid') {
      let numericValue: number | null = null;
      if (value !== '') {
        const cleaned = value.replace(',', '.').replace(/[^0-9.-]+/g, '');
        numericValue = parseFloat(cleaned);
        if (isNaN(numericValue)) numericValue = null;
      }
      setFormData(prev => ({ ...prev, [name]: value === '' ? '' : (numericValue !== null ? value : prev[name as keyof typeof prev]) }));
    } else {
      setFormData(prev => {
        const newData = { ...prev, [name]: value };
        if (name === 'name' && !editingId) {
          newData.slug = generateSlug(value);
        }
        return newData;
      });
    }
  };

  const openModal = (product?: Product) => {
    if (product) {
      setEditingId(product.id);
      setFormData({
        name: product.name,
        slug: product.slug,
        description: product.description || '',
        category_id: product.category_id,
        brand_id: product.brand_id,
        price: product.price,
        promotional_price: product.promotional_price,
        stock: product.stock,
        sku: product.sku || '',
        main_image: product.main_image,
        images: product.images || [],
        order_grid: product.order_grid,
        is_featured: product.is_featured,
        is_new: product.is_new,
        is_active: product.is_active,

      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        category_id: '',
        brand_id: '',
        price: 0,
        promotional_price: null,
        stock: 0,
        sku: '',
        main_image: null,
        images: [],
        order_grid: products.length > 0 ? Math.max(...products.map(p => p.order_grid)) + 1 : 1,
        is_featured: false,
        is_new: false,
        is_active: true,

      });
    }
    setMainImageFile(null);
    setGalleryFiles([]);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let finalMainImage = formData.main_image;
      let finalGallery = [...(formData.images || [])];

      // Upload main image
      if (mainImageFile) {
        const uploadedUrl = await uploadImage(mainImageFile);
        if (uploadedUrl) finalMainImage = uploadedUrl;
      }

      // Upload gallery images
      if (galleryFiles.length > 0) {
        const uploadPromises = galleryFiles.map(file => uploadImage(file));
        const uploadedUrls = await Promise.all(uploadPromises);
        finalGallery = [...finalGallery, ...uploadedUrls.filter((url): url is string => url !== null)];
      }

      const productData = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        category_id: formData.category_id || null,
        brand_id: formData.brand_id || null,
        price: typeof (formData.price as any) === 'string' ? parseFloat((formData.price as any).replace(',', '.').replace(/[^0-9.-]+/g, '')) || 0 : Number(formData.price) || 0,
        promotional_price: typeof (formData.promotional_price as any) === 'string' && formData.promotional_price ? parseFloat((formData.promotional_price as any).replace(',', '.').replace(/[^0-9.-]+/g, '')) : (formData.promotional_price ? Number(formData.promotional_price) : null),
        stock: typeof (formData.stock as any) === 'string' ? parseInt((formData.stock as any).replace(/[^0-9-]/g, ''), 10) || 0 : Number(formData.stock) || 0,
        sku: formData.sku,
        main_image: finalMainImage,
        images: finalGallery,
        order_grid: formData.order_grid,
        is_featured: formData.is_featured,
        is_new: formData.is_new,
        is_active: formData.is_active,

      };

      let savedProduct;

      if (editingId) {
        const { data, error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingId)
          .select()
          .single();

        if (error) throw error;
        savedProduct = data;
        await supabase.from('activity_logs').insert([{ action: 'updated_product', entity_type: 'product', entity_id: editingId, details: { name: productData.name } }]);
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert([productData])
          .select()
          .single();

        if (error) throw error;
        savedProduct = data;
        await supabase.from('activity_logs').insert([{ action: 'created_product', entity_type: 'product', entity_id: savedProduct.id, details: { name: productData.name } }]);
      }

      await fetchData();
      closeModal();
    } catch (error: any) {
      alert(`Erro: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o produto "${name}"?`)) {
      try {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) throw error;
        await supabase.from('activity_logs').insert([{ action: 'deleted_product', entity_type: 'product', entity_id: id, details: { name } }]);
        await fetchData();
      } catch (error: any) {
        alert(`Erro ao excluir: ${error.message}`);
      }
    }
  };

  const removeGalleryImage = (index: number) => {
    const newImages = [...(formData.images || [])];
    newImages.splice(index, 1);
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku?.toLowerCase().includes(search.toLowerCase()) ||
    p.categories?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Produtos</h1>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar produtos..." 
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
            onClick={() => openModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors whitespace-nowrap"
          >
            <Plus size={20} />
            Novo Produto
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 w-20">Foto</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Produto</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Categoria</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Preço</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Estoque</th>
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
                    Carregando produtos...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Nenhum produto encontrado.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className={`hover:bg-slate-50 transition-colors ${!product.is_active ? 'opacity-60' : ''}`}>
                    <td className="px-6 py-4">
                      {product.main_image ? (
                        <img src={product.main_image} alt={product.name} className="w-12 h-12 object-cover rounded-lg border border-slate-200" />
                      ) : (
                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 border border-slate-200">
                          <ImageIcon size={20} />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 line-clamp-1">{product.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        {product.sku && <span className="text-xs text-slate-500 font-mono">SKU: {product.sku}</span>}
                        {product.is_featured && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-800 uppercase tracking-wide">Destaque</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {product.categories?.name || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.promotional_price || product.price)}
                      </div>
                      {product.promotional_price && (
                        <div className="text-xs text-slate-400 line-through">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.stock > 10 ? 'bg-emerald-100 text-emerald-800' : 
                        product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.stock} un
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openModal(product)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id, product.name)}
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
                {editingId ? 'Editar Produto' : 'Novo Produto'}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Coluna Esquerda - Infos Básicas */}
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Produto</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Slug (URL)</label>
                    <input
                      type="text"
                      name="slug"
                      required
                      value={formData.slug || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-900"
                    />
                  </div>



                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                    <textarea
                      name="description"
                      rows={5}
                      value={formData.description || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Preço Normal (R$)</label>
                      <input
                        type="text"
                        inputMode="decimal"
                        name="price"
                        required
                        value={formData.price ?? ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Preço Promocional (Opcional)</label>
                      <input
                        type="text"
                        inputMode="decimal"
                        name="promotional_price"
                        value={formData.promotional_price ?? ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Estoque (un)</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        name="stock"
                        required
                        value={formData.stock ?? ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">SKU</label>
                      <input
                        type="text"
                        name="sku"
                        value={formData.sku ?? ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Coluna Direita - Organização e Imagens */}
                <div className="space-y-6">
                  
                  {/* Categorias e Marcas */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                      <select
                        name="category_id"
                        value={formData.category_id || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                      >
                        <option value="">Sem categoria</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Marca</label>
                      <select
                        name="brand_id"
                        value={formData.brand_id || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                      >
                        <option value="">Sem marca</option>
                        {brands.map(b => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Ordem (Grid)</label>
                      <input
                        type="number"
                        name="order_grid"
                        value={formData.order_grid || 0}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Status */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded" />
                      <span className="text-sm font-medium text-slate-700">Produto Ativo</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded" />
                      <span className="text-sm font-medium text-slate-700">Destaque na Home</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" name="is_new" checked={formData.is_new} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded" />
                      <span className="text-sm font-medium text-slate-700">Tag "Lançamento"</span>
                    </label>
                  </div>

                  {/* Imagens */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Imagem Principal</label>
                      <div className="flex gap-4 items-center">
                        <div className="w-20 h-20 bg-slate-100 rounded-lg border border-slate-300 flex items-center justify-center overflow-hidden shrink-0">
                          {mainImageFile ? (
                            <span className="text-[10px] text-center text-blue-600 font-medium p-1">Nova Imagem</span>
                          ) : formData.main_image ? (
                            <img src={formData.main_image} alt="Main" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="text-slate-400" />
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) setMainImageFile(e.target.files[0]);
                          }}
                          className="w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Galeria de Imagens</label>
                      
                      {/* Existing Gallery Images */}
                      {(formData.images?.length || 0) > 0 && (
                        <div className="flex gap-2 mb-3 flex-wrap">
                          {formData.images?.map((url, idx) => (
                            <div key={idx} className="relative group w-14 h-14 rounded border border-slate-200 overflow-hidden">
                              <img src={url} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => removeGalleryImage(idx)}
                                className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          if (e.target.files) {
                            setGalleryFiles(Array.from(e.target.files));
                          }
                        }}
                        className="w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      {galleryFiles.length > 0 && (
                        <p className="text-xs text-blue-600 mt-2">{galleryFiles.length} nova(s) imagem(ns) selecionada(s) para upload.</p>
                      )}
                    </div>
                  </div>

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
                  {saving ? 'Salvando...' : 'Salvar Produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
