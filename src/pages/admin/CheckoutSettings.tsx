import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Plus, Edit2, Trash2, Check, X, Star } from 'lucide-react';
import { uploadImage } from '../../utils/upload';

interface CheckoutSettingsData {
  id: string;
  marquee_text: string;
  marquee_active: boolean;
  marquee_bg_color?: string;
  marquee_text_color?: string;
  sales_notification_active: boolean;
}

interface CheckoutReviewData {
  id: string;
  description: string;
  rating: number;
  is_active: boolean;
  image_url?: string;
}

const TABS = [
  'Checkout', 'Reviews', 'Notificações'
];

export const CheckoutSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Reviews');
  const [settings, setSettings] = useState<CheckoutSettingsData | null>(null);
  const [reviews, setReviews] = useState<CheckoutReviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  // Review Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<CheckoutReviewData | null>(null);
  const [reviewForm, setReviewForm] = useState({ description: '', rating: 5, is_active: true, image_url: '' });
  const [reviewImageFile, setReviewImageFile] = useState<File | null>(null);
  const [isUploadingReviewImage, setIsUploadingReviewImage] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('checkout_settings')
        .select('*')
        .limit(1)
        .single();
      
      if (settingsData) {
        setSettings(settingsData);
      } else if (settingsError && settingsError.code !== 'PGRST116') {
        console.error('Erro ao buscar configurações:', settingsError);
      } else {
        // Tabela vazia (PGRST116)
        setSettings({
          id: '', // Indicates it needs to be inserted
          marquee_text: '🔥 OFERTA POR TEMPO LIMITADO! GARANTA O SEU AGORA COM DESCONTO.',
          marquee_active: false,
          marquee_bg_color: '#dc2626',
          marquee_text_color: '#ffffff',
          sales_notification_active: false
        });
      }

      // Fetch Reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('checkout_reviews')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!reviewsError && reviewsData) {
        setReviews(reviewsData);
      }
    } catch (err) {
      console.error('Erro geral ao buscar dados do checkout', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    setSavingSettings(true);
    try {
      const payload = {
        marquee_text: settings.marquee_text,
        marquee_active: settings.marquee_active,
        marquee_bg_color: settings.marquee_bg_color || '#dc2626',
        marquee_text_color: settings.marquee_text_color || '#ffffff',
        sales_notification_active: settings.sales_notification_active
      };

      if (settings.id) {
        const { error } = await supabase
          .from('checkout_settings')
          .update(payload)
          .eq('id', settings.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('checkout_settings')
          .insert([payload])
          .select()
          .single();
        if (error) throw error;
        if (data) setSettings(data);
      }
      
      alert('Configurações salvas com sucesso!');
    } catch (err: any) {
      console.error(err);
      alert('Erro ao salvar: ' + (err.message || JSON.stringify(err)));
    } finally {
      setSavingSettings(false);
    }
  };

  const handleToggleReviewStatus = async (review: CheckoutReviewData) => {
    try {
      const { error } = await supabase
        .from('checkout_reviews')
        .update({ is_active: !review.is_active })
        .eq('id', review.id);
      
      if (error) throw error;
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar o status do review.');
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta avaliação?')) return;
    try {
      const { error } = await supabase.from('checkout_reviews').delete().eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir a avaliação.');
    }
  };

  const openReviewModal = (review?: CheckoutReviewData) => {
    setReviewImageFile(null);
    if (review) {
      setEditingReview(review);
      setReviewForm({ description: review.description, rating: review.rating, is_active: review.is_active, image_url: review.image_url || '' });
    } else {
      setEditingReview(null);
      setReviewForm({ description: '', rating: 5, is_active: true, image_url: '' });
    }
    setIsModalOpen(true);
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUploadingReviewImage(true);
      let finalImageUrl = reviewForm.image_url;
      
      if (reviewImageFile) {
        const uploadedUrl = await uploadImage(reviewImageFile);
        if (uploadedUrl) finalImageUrl = uploadedUrl;
      }

      const payload = {
        ...reviewForm,
        image_url: finalImageUrl
      };

      if (editingReview) {
        const { error } = await supabase
          .from('checkout_reviews')
          .update(payload)
          .eq('id', editingReview.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('checkout_reviews')
          .insert([payload]);
        if (error) throw error;
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar avaliação.');
    } finally {
      setIsUploadingReviewImage(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-2 border-slate-800 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-slate-900">Configurações do Checkout</h1>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto space-x-2 border-b border-gray-200 pb-2 custom-scrollbar">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-t-lg font-medium text-sm whitespace-nowrap transition-colors ${
              activeTab === tab
                ? 'bg-slate-100 text-slate-900 border-b-2 border-slate-900'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[400px]">
        
        {/* TAB: CHECKOUT */}
        {activeTab === 'Checkout' && (
          <div className="p-6 md:p-8 space-y-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 border-b pb-2">Letreiro (Marquee)</h2>
            {settings ? (
              <div className="space-y-4 max-w-2xl">
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-slate-700">Ativar Letreiro no topo do Checkout?</label>
                  <button
                    onClick={() => setSettings({ ...settings, marquee_active: !settings.marquee_active })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.marquee_active ? 'bg-emerald-500' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.marquee_active ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Texto do Letreiro</label>
                  <input
                    type="text"
                    value={settings.marquee_text}
                    onChange={(e) => setSettings({ ...settings, marquee_text: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: OFERTA POR TEMPO LIMITADO!"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Cor de Fundo</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={settings.marquee_bg_color || '#dc2626'}
                        onChange={(e) => setSettings({ ...settings, marquee_bg_color: e.target.value })}
                        className="h-10 w-14 cursor-pointer border-0 rounded"
                      />
                      <span className="text-sm text-gray-500 uppercase">{settings.marquee_bg_color || '#dc2626'}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Cor do Texto</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={settings.marquee_text_color || '#ffffff'}
                        onChange={(e) => setSettings({ ...settings, marquee_text_color: e.target.value })}
                        className="h-10 w-14 cursor-pointer border-0 rounded"
                      />
                      <span className="text-sm text-gray-500 uppercase">{settings.marquee_text_color || '#ffffff'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleSaveSettings}
                    disabled={savingSettings}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    {savingSettings ? 'Salvando...' : <><Save size={18} /> Salvar Alterações</>}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-red-500">Configurações não encontradas. Certifique-se de que rodou o script SQL.</p>
            )}
          </div>
        )}

        {/* TAB: NOTIFICAÇÕES */}
        {activeTab === 'Notificações' && (
          <div className="p-6 md:p-8 space-y-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 border-b pb-2">Contador de Vendas (Notificação Pop-up)</h2>
            {settings ? (
              <div className="space-y-4 max-w-2xl">
                <p className="text-sm text-gray-600 mb-4">
                  Esta funcionalidade cria pop-ups falsos de vendas gerando nomes aleatórios (ex: "Victor comprou [nome do produto]") a cada poucos segundos para gerar prova social no checkout.
                </p>
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-slate-700">Ativar Notificações de Vendas?</label>
                  <button
                    onClick={() => setSettings({ ...settings, sales_notification_active: !settings.sales_notification_active })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.sales_notification_active ? 'bg-emerald-500' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.sales_notification_active ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                
                <div className="pt-4">
                  <button
                    onClick={handleSaveSettings}
                    disabled={savingSettings}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    {savingSettings ? 'Salvando...' : <><Save size={18} /> Salvar Alterações</>}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-red-500">Configurações não encontradas. Certifique-se de que rodou o script SQL.</p>
            )}
          </div>
        )}

        {/* TAB: REVIEWS */}
        {activeTab === 'Reviews' && (
          <div className="p-0">
            <div className="p-4 flex justify-end">
              <button
                onClick={() => openReviewModal()}
                className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-full font-medium transition-colors flex items-center gap-2 text-sm"
              >
                <Plus size={18} /> ADICIONAR
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-t border-slate-100">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/2">Descrição</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Avaliação</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reviews.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                        Nenhuma avaliação cadastrada para o checkout.
                      </td>
                    </tr>
                  ) : (
                    reviews.map((review) => (
                      <tr key={review.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-slate-700 font-medium truncate max-w-md">
                          {review.description}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-orange-400">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={16} fill={i < review.rating ? 'currentColor' : 'none'} className={i < review.rating ? 'text-orange-400' : 'text-gray-300'} />
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleReviewStatus(review)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              review.is_active ? 'bg-emerald-500' : 'bg-gray-300'
                            }`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${review.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-3 text-slate-400">
                            <button onClick={() => openReviewModal(review)} className="hover:text-blue-600 transition-colors">
                              <Edit2 size={18} />
                            </button>
                            <button onClick={() => handleDeleteReview(review.id)} className="hover:text-red-600 transition-colors">
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
        )}

        {/* OUTRAS ABAS (Placeholder) */}
        {!['Checkout', 'Notificações', 'Reviews'].includes(activeTab) && (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <h3 className="text-xl font-medium text-slate-800 mb-2">{activeTab}</h3>
            <p className="text-slate-500">As configurações desta aba estarão disponíveis em breve.</p>
          </div>
        )}
      </div>

      {/* Modal Add/Edit Review */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">
                {editingReview ? 'Editar Avaliação' : 'Nova Avaliação'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSaveReview} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição do Review</label>
                <textarea
                  value={reviewForm.description}
                  onChange={(e) => setReviewForm({ ...reviewForm, description: e.target.value })}
                  required
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: Produto excelente, chegou rápido!"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Foto da Avaliação (Opcional)</label>
                {(reviewForm.image_url || reviewImageFile) && (
                  <div className="mb-3">
                    <img 
                      src={reviewImageFile ? URL.createObjectURL(reviewImageFile) : reviewForm.image_url} 
                      alt="Preview" 
                      className="h-20 w-20 object-cover rounded-md border border-slate-200 shadow-sm"
                    />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setReviewImageFile(e.target.files[0]);
                    }
                  }}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nota (1 a 5)</label>
                <select
                  value={reviewForm.rating}
                  onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={5}>5 Estrelas</option>
                  <option value={4}>4 Estrelas</option>
                  <option value={3}>3 Estrelas</option>
                  <option value={2}>2 Estrelas</option>
                  <option value={1}>1 Estrela</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="review_active"
                  checked={reviewForm.is_active}
                  onChange={(e) => setReviewForm({ ...reviewForm, is_active: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <label htmlFor="review_active" className="text-sm text-slate-700">Avaliação Ativa</label>
              </div>

              <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isUploadingReviewImage}
                  className="px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-70"
                >
                  {isUploadingReviewImage ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Check size={18} />
                  )}
                  {isUploadingReviewImage ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
