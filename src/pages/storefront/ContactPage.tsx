import React, { useState } from 'react';
import { useSettingsStore } from '../../store/settingsStore';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { settings } = useSettingsStore();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0a0d0a] pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-heading font-black text-white text-center mb-4 uppercase tracking-tight">Entre em <span className="text-[#33e36a]">Contato</span></h1>
        <p className="text-neutral-400 text-center mb-12">Tem alguma dúvida ou precisa de ajuda? Fale com nossa equipe.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Informações */}
          <div className="space-y-8">
            <div className="bg-[#141A12] p-6 rounded-2xl border border-[#1b241a]">
              <h3 className="text-xl font-heading font-bold text-white mb-6 uppercase">Informações de Contato</h3>
              
              <div className="space-y-6">
                {settings?.email && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#33e36a]/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="text-[#33e36a]" size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500 font-bold uppercase tracking-wider mb-1">E-mail</p>
                      <a href={`mailto:${settings.email}`} className="text-white hover:text-[#33e36a] transition-colors">{settings.email}</a>
                    </div>
                  </div>
                )}

                {settings?.whatsapp && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#33e36a]/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="text-[#33e36a]" size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500 font-bold uppercase tracking-wider mb-1">Telefone / WhatsApp</p>
                      <a href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#33e36a] transition-colors">
                        {settings.whatsapp}
                      </a>
                    </div>
                  </div>
                )}

                {settings?.address && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#33e36a]/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="text-[#33e36a]" size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500 font-bold uppercase tracking-wider mb-1">Endereço</p>
                      <p className="text-white">{settings.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Formulário */}
          <div className="bg-[#141A12] p-6 rounded-2xl border border-[#1b241a]">
            {success ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                <div className="w-16 h-16 bg-[#33e36a]/20 rounded-full flex items-center justify-center">
                  <Send className="text-[#33e36a]" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-white">Mensagem Enviada!</h3>
                <p className="text-neutral-400">Recebemos sua mensagem e entraremos em contato em breve.</p>
                <button onClick={() => setSuccess(false)} className="text-[#33e36a] hover:underline mt-4">Enviar outra mensagem</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1">Nome Completo</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#0a0d0a] border border-[#1b241a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#33e36a] transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1">E-mail</label>
                  <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-[#0a0d0a] border border-[#1b241a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#33e36a] transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1">Assunto</label>
                  <input type="text" required value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full bg-[#0a0d0a] border border-[#1b241a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#33e36a] transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1">Mensagem</label>
                  <textarea required rows={4} value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full bg-[#0a0d0a] border border-[#1b241a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#33e36a] transition-colors resize-none"></textarea>
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full bg-[#33e36a] hover:bg-[#11a544] text-black font-bold uppercase tracking-wider py-4 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {isSubmitting ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <><Send size={18} /> Enviar Mensagem</>}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
