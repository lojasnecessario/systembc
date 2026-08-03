import React, { useState, useEffect } from 'react';
import { Star, StarHalf, User } from 'lucide-react';
import Papa from 'papaparse';
import { supabase } from '../../lib/supabase';
import { uploadImage } from '../../utils/upload';

interface ProductReviewsProps {
  productId: string | number;
  productHandle: string;
}

interface Review {
  id: string;
  product_id: string | number;
  reviewer_name: string;
  rating: number;
  comment: string;
  image_url: string | null;
  created_at: string;
  is_approved: boolean;
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({ productId, productHandle }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(5);

  const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, comment: '' });
  const [reviewImageFile, setReviewImageFile] = useState<File | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        // 1. Fetch from Supabase
        const { data: dbReviewsData } = await supabase
          .from('product_reviews')
          .select('*')
          .eq('product_id', productId)
          .eq('is_approved', true)
          .order('created_at', { ascending: false });

        let dbReviews: Review[] = dbReviewsData || [];

        // 2. Fetch from CSV
        const response = await fetch('/lai-product-reviews-1775614937.csv');
        
        if (!response.ok) {
          throw new Error('Could not fetch CSV');
        }
        
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const csvRows = results.data as any[];
            // Filter by product_handle matching our product
            const filteredRows = csvRows.filter(row => row.product_handle === productHandle && row.status === 'approved');
            
            const csvReviews: Review[] = filteredRows.map(row => ({
              id: row.review_id,
              product_id: row.product_id,
              reviewer_name: row.author,
              rating: Number(row.rating),
              comment: row.content,
              image_url: row.images && row.images.trim() !== '' ? row.images : null,
              created_at: row.date,
              is_approved: true
            }));

            // Merge and sort by date descending
            const mergedReviews = [...dbReviews, ...csvReviews].sort((a, b) => {
              return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });

            setReviews(mergedReviews);
            setLoading(false);
          },
          error: (error: any) => {
            console.error('Error parsing CSV', error);
            setReviews(dbReviews);
            setLoading(false);
          }
        });
      } catch (error) {
        console.error('Error fetching reviews', error);
        setLoading(false);
      }
    };

    if (productId && productHandle) {
      fetchReviews();
    }
  }, [productId, productHandle]);

  const averageRating = reviews.length > 0 
    ? reviews.reduce((acc, r) => acc + Number(r.rating), 0) / reviews.length 
    : 0;

  const renderStars = (rating: number, size = 16) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} size={size} className="fill-[#33e36a] text-[#33e36a]" />);
    }
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" size={size} className="fill-[#33e36a] text-[#33e36a]" />);
    }
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} size={size} className="text-neutral-600" />);
    }
    return stars;
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.name || !reviewForm.rating) {
      setReviewMessage('Por favor, preencha o nome e a nota.');
      return;
    }
    try {
      setIsSubmittingReview(true);
      let uploadedImageUrl = null;
      if (reviewImageFile) {
        uploadedImageUrl = await uploadImage(reviewImageFile);
      }
      const { error } = await supabase.from('product_reviews').insert([{
        product_id: productId,
        reviewer_name: reviewForm.name,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        image_url: uploadedImageUrl,
        is_approved: false
      }]);
      if (error) throw error;
      setReviewMessage('Avaliação enviada com sucesso! Ela aparecerá após ser aprovada.');
      setReviewForm({ name: '', rating: 5, comment: '' });
      setReviewImageFile(null);
    } catch (error) {
      console.error('Erro ao enviar avaliação:', error);
      setReviewMessage('Erro ao enviar avaliação. Tente novamente.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const visibleReviews = reviews.slice(0, visibleCount);

  return (
    <div className="mt-8 bg-[#0f130e] border border-[#1b241a] rounded-3xl overflow-hidden shadow-lg" id="reviews">
      <div className="p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <Star className="text-[#33e36a]" size={28} />
          <h2 className="text-2xl font-heading font-bold text-[#eef4ea] uppercase">Avaliações de Clientes</h2>
        </div>

        {/* Resumo */}
        <div className="flex items-center gap-4 mb-8 p-4 bg-[#141A12] rounded-xl border border-[#1b241a]">
          <div className="text-4xl font-heading font-bold text-[#eef4ea]">
            {averageRating.toFixed(1).replace('.', ',')}
          </div>
          <div>
            <div className="flex gap-1 mb-1">
              {renderStars(averageRating, 18)}
            </div>
            <div className="text-[#8b977f] text-sm">
              Baseado em {reviews.length} {reviews.length === 1 ? 'avaliação' : 'avaliações'}
            </div>
          </div>
        </div>

        {/* Lista de Avaliações */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-[#33e36a] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-4 mb-8">
            {visibleReviews.length > 0 ? (
              visibleReviews.map((review) => (
                <div key={review.id} className="p-4 bg-[#141A12] border border-[#1b241a] rounded-xl">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#1b241a] flex items-center justify-center text-[#33e36a]">
                        <User size={16} />
                      </div>
                      <div>
                        <div className="text-[#eef4ea] font-medium text-sm">{review.reviewer_name}</div>
                        <div className="text-[#8b977f] text-xs">Comprador Verificado</div>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {renderStars(review.rating, 14)}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-[#8b977f] text-sm mt-3 leading-relaxed">
                      "{review.comment}"
                    </p>
                  )}
                  {review.image_url && (
                    <div className="mt-3">
                      <img 
                        src={review.image_url} 
                        alt={`Foto da avaliação de ${review.reviewer_name}`}
                        className="w-24 h-24 object-cover rounded-lg border border-[#1b241a] shadow-sm hover:scale-150 origin-bottom-left md:origin-center transition-transform duration-300 z-10 relative cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-[#8b977f]">
                <Star size={32} className="mx-auto mb-3 opacity-20" />
                <p>Seja o primeiro a avaliar este produto!</p>
              </div>
            )}
            
            {reviews.length > visibleCount && (
              <div className="text-center pt-4">
                <button 
                  onClick={() => setVisibleCount(prev => prev + 5)}
                  className="px-6 py-2 border border-[#33e36a] text-[#33e36a] rounded-xl font-bold uppercase tracking-wide text-sm hover:bg-[#33e36a] hover:text-black transition-colors cursor-pointer"
                >
                  Ver Mais Avaliações
                </button>
              </div>
            )}
          </div>
        )}

        {/* Formulário */}
        <div className="pt-6 border-t border-[#1b241a]">
          <h3 className="text-xl font-heading font-bold text-[#eef4ea] mb-4">Deixe sua Avaliação</h3>
          
          {reviewMessage && (
            <div className={`p-3 rounded-lg mb-4 text-sm font-medium ${
              reviewMessage.includes('sucesso') 
                ? 'bg-[#33e36a]/10 text-[#33e36a] border border-[#33e36a]/20' 
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>
              {reviewMessage}
            </div>
          )}

          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#8b977f] text-sm mb-1">Seu Nome</label>
                <input
                  type="text"
                  required
                  value={reviewForm.name}
                  onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                  className="w-full bg-[#141A12] border border-[#1b241a] rounded-xl px-4 py-3 text-[#eef4ea] focus:outline-none focus:border-[#33e36a] transition-colors"
                  placeholder="Como quer ser chamado?"
                />
              </div>
              <div>
                <label className="block text-[#8b977f] text-sm mb-1">Nota (1 a 5)</label>
                <select
                  required
                  value={reviewForm.rating}
                  onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                  className="w-full bg-[#141A12] border border-[#1b241a] rounded-xl px-4 py-3 text-[#eef4ea] focus:outline-none focus:border-[#33e36a] transition-colors appearance-none cursor-pointer"
                >
                  <option value="5">5 Estrelas - Excelente</option>
                  <option value="4">4 Estrelas - Muito Bom</option>
                  <option value="3">3 Estrelas - Bom</option>
                  <option value="2">2 Estrelas - Regular</option>
                  <option value="1">1 Estrela - Ruim</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[#8b977f] text-sm mb-1">Comentário (opcional)</label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                className="w-full bg-[#141A12] border border-[#1b241a] rounded-xl px-4 py-3 text-[#eef4ea] focus:outline-none focus:border-[#33e36a] transition-colors resize-none"
                rows={3}
                placeholder="O que você achou do produto?"
              />
            </div>
            <div>
              <label className="block text-[#8b977f] text-sm mb-1">Adicionar Foto (opcional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) setReviewImageFile(e.target.files[0]);
                }}
                className="w-full text-xs text-[#8b977f] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#1b241a] file:text-[#eef4ea] hover:file:bg-[#33e36a] hover:file:text-black cursor-pointer transition-colors"
              />
              {reviewImageFile && <p className="text-xs text-[#33e36a] mt-2">Imagem selecionada: {reviewImageFile.name}</p>}
            </div>
            <button
              type="submit"
              disabled={isSubmittingReview}
              className="w-full bg-neutral-800 hover:bg-[#33e36a] text-[#eef4ea] hover:text-[#06250f] disabled:opacity-50 font-bold uppercase tracking-wide py-4 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmittingReview ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Star size={18} />
                  Enviar Avaliação
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
