import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { uploadImage } from '../../utils/upload';
import { Save } from 'lucide-react';

const HIGHLIGHT_BANNER_TITLE = '__DESTAQUE_PRINCIPAL__';

export const HighlightsAdmin: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bannerId, setBannerId] = useState<string | null>(null);

  const [title, setTitle] = useState('TEM JOGO PRA TODO BOLSO');
  const [subtitle, setSubtitle] = useState('Escolha quanto quer gastar e a gente mostra os melhores títulos naquela faixa.');
  const [tagText, setTagText] = useState('% COMPRE POR FAIXA DE PREÇO');
  
  const [cards, setCards] = useState<{image: string, link: string, file: File | null}[]>([
    { image: '', link: '', file: null },
    { image: '', link: '', file: null },
    { image: '', link: '', file: null }
  ]);

  useEffect(() => {
    fetchHighlightBanner();
  }, []);

  const fetchHighlightBanner = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('title', HIGHLIGHT_BANNER_TITLE)
        .limit(1)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data) {
        setBannerId(data.id);
        
        try {
          const parsedData = JSON.parse(data.subtitle || '{}');
          setTitle(parsedData.title || 'TEM JOGO PRA TODO BOLSO');
          setSubtitle(parsedData.subtitle || 'Escolha quanto quer gastar e a gente mostra os melhores títulos naquela faixa.');
          setTagText(parsedData.tagText || '% COMPRE POR FAIXA DE PREÇO');
          
          if (parsedData.cards && Array.isArray(parsedData.cards)) {
            const loadedCards = parsedData.cards.map((c: any) => ({
              image: c.image || '',
              link: c.link || '',
              file: null
            }));
            while (loadedCards.length < 3) {
              loadedCards.push({ image: '', link: '', file: null });
            }
            setCards(loadedCards.slice(0, 3));
          } else {
            // Legacy migration
            setCards([
              { image: data.image || '', link: data.link || '', file: null },
              { image: '', link: '', file: null },
              { image: '', link: '', file: null }
            ]);
          }
        } catch (e) {
          // Fallback
        }
      }
    } catch (error) {
      console.error('Error fetching highlight banner:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardChange = (index: number, field: 'link' | 'file', value: any) => {
    const newCards = [...cards];
    newCards[index] = { ...newCards[index], [field]: value };
    setCards(newCards);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if at least one card has an image
    const hasAtLeastOneImage = cards.some(c => c.image || c.file);
    if (!hasAtLeastOneImage) {
      alert("É obrigatório ter pelo menos uma imagem para os destaques.");
      return;
    }
    
    setSaving(true);

    try {
      const processedCards = await Promise.all(cards.map(async (card) => {
        let finalImageUrl = card.image;
        if (card.file) {
          const uploadedUrl = await uploadImage(card.file);
          if (uploadedUrl) finalImageUrl = uploadedUrl;
        }
        return {
          image: finalImageUrl,
          link: card.link
        };
      }));

      const configData = JSON.stringify({
        title,
        subtitle,
        tagText,
        cards: processedCards
      });

      const bannerData = {
        title: HIGHLIGHT_BANNER_TITLE,
        subtitle: configData,
        link: processedCards[0]?.link || '',
        image: processedCards[0]?.image || '',
        order_grid: 9999,
        is_active: true
      };

      if (bannerId) {
        const { error } = await supabase.from('banners').update(bannerData).eq('id', bannerId);
        if (error) throw error;
        await supabase.from('activity_logs').insert([{ action: 'updated_highlight', entity_type: 'banner', entity_id: bannerId }]);
      } else {
        const { data, error } = await supabase.from('banners').insert([bannerData]).select().single();
        if (error) throw error;
        setBannerId(data.id);
        await supabase.from('activity_logs').insert([{ action: 'created_highlight', entity_type: 'banner', entity_id: data.id }]);
      }

      alert('Seção de destaques salva com sucesso!');
      await fetchHighlightBanner();
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
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Seção de Destaques</h1>
          <p className="text-slate-500 mt-1">Configure até 3 banners para a seção de destaques (exibida abaixo de Sobre Nós).</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
          
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4 border-b pb-2">Textos da Seção</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Tag Superior (Verde)</label>
                <input
                  type="text"
                  value={tagText}
                  onChange={(e) => setTagText(e.target.value)}
                  className="w-full max-w-md px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Título Grande</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full max-w-2xl px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                />
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Subtítulo Explicativo</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full max-w-2xl px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4 border-b pb-2">Cards Promocionais (Banners)</h3>
            <p className="text-sm text-slate-500 mb-6">Você pode adicionar até 3 cards. Em desktops eles ficarão lado a lado, e em celulares ficarão empilhados.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {cards.map((card, index) => (
                <div key={index} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                  <h4 className="font-bold text-slate-700 mb-3">Card {index + 1}</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-2">Imagem (Recomendado: Vertical/Quadrada)</label>
                      {card.image && !card.file && (
                        <div className="relative w-full aspect-[4/5] rounded-lg overflow-hidden border border-slate-200 bg-white mb-2">
                          <img src={card.image} alt={`Card ${index + 1}`} className="w-full h-full object-cover" />
                        </div>
                      )}
                      {card.file && (
                        <div className="w-full aspect-[4/5] bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center border border-blue-200 font-medium mb-2 text-xs text-center px-2">
                          Nova imagem selecionada
                        </div>
                      )}
                      {!card.image && !card.file && (
                        <div className="w-full aspect-[4/5] bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200 border-dashed mb-2 text-xs text-slate-400">
                          Sem imagem
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            handleCardChange(index, 'file', e.target.files[0]);
                          }
                        }}
                        className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Link</label>
                      <input
                        type="text"
                        value={card.link}
                        onChange={(e) => handleCardChange(index, 'link', e.target.value)}
                        placeholder="/categoria"
                        className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
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
              {saving ? 'Salvando...' : 'Salvar Destaques'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

