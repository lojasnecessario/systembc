import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { uploadImage } from '../../utils/upload';
import { Plus, Edit2, Trash2, X, Image as ImageIcon, Check, XCircle } from 'lucide-react';

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string | null;
  link: string;
  order_grid: number;
  is_active: boolean;
}

export const Banners: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [link, setLink] = useState('');
  const [orderGrid, setOrderGrid] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('order_grid', { ascending: true });
        
      if (error) throw error;
      setBanners(data || []);
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (banner?: Banner) => {
    if (banner) {
      setEditingId(banner.id);
      setTitle(banner.title);
      setSubtitle(banner.subtitle || '');
      setLink(banner.link || '');
      setOrderGrid(banner.order_grid);
      setIsActive(banner.is_active);
      setCurrentImageUrl(banner.image);
    } else {
      setEditingId(null);
      setTitle('');
      setSubtitle('');
      setLink('');
      setOrderGrid(banners.length > 0 ? Math.max(...banners.map(b => b.order_grid)) + 1 : 1);
      setIsActive(true);
      setCurrentImageUrl(null);
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imageFile && !currentImageUrl) {
      alert("É obrigatório selecionar uma imagem para o banner.");
      return;
    }
    
    setSaving(true);

    try {
      let finalImageUrl = currentImageUrl;

      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile);
        if (uploadedUrl) finalImageUrl = uploadedUrl;
      }

      const bannerData = {
        title,
        subtitle,
        link,
        image: finalImageUrl,
        order_grid: orderGrid,
        is_active: isActive
      };

      if (editingId) {
        const { error } = await supabase.from('banners').update(bannerData).eq('id', editingId);
        if (error) throw error;
        await supabase.from('activity_logs').insert([{ action: 'updated_banner', entity_type: 'banner', entity_id: editingId, details: bannerData }]);
      } else {
        const { data, error } = await supabase.from('banners').insert([bannerData]).select().single();
        if (error) throw error;
        await supabase.from('activity_logs').insert([{ action: 'created_banner', entity_type: 'banner', entity_id: data.id, details: bannerData }]);
      }

      await fetchBanners();
      closeModal();
    } catch (error: any) {
      alert(`Erro: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, bannerTitle: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o banner "${bannerTitle}"?`)) {
      try {
        const { error } = await supabase.from('banners').delete().eq('id', id);
        if (error) throw error;
        await supabase.from('activity_logs').insert([{ action: 'deleted_banner', entity_type: 'banner', entity_id: id, details: { title: bannerTitle } }]);
        await fetchBanners();
      } catch (error: any) {
        alert(`Erro ao excluir: ${error.message}`);
      }
    }
  };

  const toggleActive = async (banner: Banner) => {
    try {
      const { error } = await supabase.from('banners').update({ is_active: !banner.is_active }).eq('id', banner.id);
      if (error) throw error;
      await fetchBanners();
    } catch (error: any) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Banners</h1>
        <button 
          onClick={() => openModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
        >
          <Plus size={20} />
          Novo Banner
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Banner</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Info</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Ordem</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    <div className="flex justify-center mb-2">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    Carregando...
                  </td>
                </tr>
              ) : banners.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Nenhum banner encontrado.
                  </td>
                </tr>
              ) : (
                banners.map((banner) => (
                  <tr key={banner.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      {banner.image ? (
                        <img src={banner.image} alt={banner.title} className="w-32 h-16 object-cover rounded border border-slate-200" />
                      ) : (
                        <div className="w-32 h-16 bg-slate-100 rounded flex items-center justify-center text-slate-400 border border-slate-200">
                          <ImageIcon size={20} />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{banner.title}</div>
                      <div className="text-xs text-slate-500">{banner.link || 'Sem link'}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {banner.order_grid}
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => toggleActive(banner)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          banner.is_active ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {banner.is_active ? <Check size={14} /> : <XCircle size={14} />}
                        {banner.is_active ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openModal(banner)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(banner.id, banner.title)}
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">
                {editingId ? 'Editar Banner' : 'Novo Banner'}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subtítulo (Opcional)</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Link de Destino (Opcional)</label>
                <input
                  type="text"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="Ex: /categoria/playstation"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ordem</label>
                  <input
                    type="number"
                    required
                    value={orderGrid}
                    onChange={(e) => setOrderGrid(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-slate-700">Banner Ativo</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Imagem do Banner</label>
                <div className="space-y-3">
                  {currentImageUrl && !imageFile && (
                    <img src={currentImageUrl} alt="Preview" className="w-full h-32 object-cover rounded-lg border border-slate-200" />
                  )}
                  {imageFile && (
                    <div className="w-full h-32 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center border border-blue-200 text-sm font-medium">
                      Nova imagem selecionada
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setImageFile(e.target.files[0]);
                      }
                    }}
                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50"
                >
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
