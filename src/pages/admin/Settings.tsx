import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { uploadImage } from '../../utils/upload';
import { Save, Image as ImageIcon } from 'lucide-react';

interface StoreSettings {
  id: string;
  name: string;
  logo: string | null;
  primary_color: string;
  secondary_color: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  facebook: string;
  email: string;
  address: string;
  business_hours: string;
  footer_text: string;
}

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);

  // Form fields
  const [formData, setFormData] = useState<Partial<StoreSettings>>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .limit(1)
        .single();
        
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is no rows
      
      if (data) {
        setSettings(data);
        setFormData(data);
        setCurrentImageUrl(data.logo);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let finalImageUrl = currentImageUrl;

      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile);
        if (uploadedUrl) finalImageUrl = uploadedUrl;
      }

      const updatedData = {
        ...formData,
        logo: finalImageUrl
      };

      if (settings?.id) {
        const { error } = await supabase.from('store_settings').update(updatedData).eq('id', settings.id);
        if (error) throw error;
        await supabase.from('activity_logs').insert([{ action: 'updated_settings', entity_type: 'settings', details: updatedData }]);
      } else {
        const { error } = await supabase.from('store_settings').insert([updatedData]);
        if (error) throw error;
      }

      alert('Configurações salvas com sucesso!');
      await fetchSettings();
    } catch (error: any) {
      alert(`Erro: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Configurações da Loja</h1>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
          
          {/* Identidade Visual */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4 border-b pb-2">Identidade Visual</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Loja</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Logo da Loja</label>
                <div className="flex items-start gap-4">
                  <div className="w-24 h-24 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center p-2">
                    {currentImageUrl && !imageFile ? (
                      <img src={currentImageUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                    ) : imageFile ? (
                      <span className="text-xs text-blue-600 text-center font-medium">Nova Logo</span>
                    ) : (
                      <ImageIcon size={24} className="text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) setImageFile(e.target.files[0]);
                      }}
                      className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="text-xs text-slate-500 mt-2">Recomendado: 200x200px, PNG com fundo transparente.</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cor Primária</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      name="primary_color"
                      value={formData.primary_color || '#1d4ed8'}
                      onChange={handleChange}
                      className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                    />
                    <input
                      type="text"
                      name="primary_color"
                      value={formData.primary_color || ''}
                      onChange={handleChange}
                      className="w-24 px-2 py-1 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cor Secundária</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      name="secondary_color"
                      value={formData.secondary_color || '#9333ea'}
                      onChange={handleChange}
                      className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                    />
                    <input
                      type="text"
                      name="secondary_color"
                      value={formData.secondary_color || ''}
                      onChange={handleChange}
                      className="w-24 px-2 py-1 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contato e Redes Sociais */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4 border-b pb-2">Contato e Redes Sociais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">E-mail de Contato</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Telefone / WhatsApp</label>
                <input
                  type="text"
                  name="whatsapp"
                  value={formData.whatsapp || ''}
                  onChange={handleChange}
                  placeholder="Ex: (11) 99999-9999"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Instagram URL</label>
                <input
                  type="url"
                  name="instagram"
                  value={formData.instagram || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Facebook URL</label>
                <input
                  type="url"
                  name="facebook"
                  value={formData.facebook || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Endereço e Rodapé */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4 border-b pb-2">Informações Adicionais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Endereço Físico</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Horário de Funcionamento</label>
                <input
                  type="text"
                  name="business_hours"
                  value={formData.business_hours || ''}
                  onChange={handleChange}
                  placeholder="Ex: Seg a Sex, 09h as 18h"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Texto do Rodapé</label>
                <textarea
                  name="footer_text"
                  value={formData.footer_text || ''}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-200">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Save size={20} />
              )}
              {saving ? 'Salvando...' : 'Salvar Configurações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
