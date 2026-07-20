import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { legalPages } from '../../data/legalPages';

export const LegalPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  if (!slug || !legalPages[slug]) {
    return <Navigate to="/" replace />;
  }

  const page = legalPages[slug];

  // Em um caso real, você pode substituir os placeholders com dados reais da loja.
  // Por agora, vamos manter ou substituir por dados estáticos.
  const contentReplaced = page.content
    .replace(/{{empresa_nome}}/g, 'Black Core')
    .replace(/{{empresa_email}}/g, 'contato@blackcore.com.br')
    .replace(/{{empresa_telefone}}/g, '(11) 99999-9999')
    .replace(/{{empresa_cnpj}}/g, '00.000.000/0001-00')
    .replace(/{{empresa_endereco}}/g, 'Av. Paulista, 1000 - São Paulo, SP')
    .replace(/{{empresa_whatsapp}}/g, '(11) 99999-9999')
    .replace(/{{empresa_cidade}}/g, 'São Paulo')
    .replace(/{{empresa_estado}}/g, 'SP')
    .replace(/{{empresa_site}}/g, 'blackcore.com.br');

  return (
    <div className="bg-neutral-900 min-h-screen pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-6 md:px-8">
        <h1 className="text-3xl md:text-5xl font-black text-white mb-10 tracking-tight">
          {page.title}
        </h1>
        <div 
          className="text-neutral-300 leading-relaxed space-y-6 bg-black/40 p-8 rounded-2xl border border-white/5"
          dangerouslySetInnerHTML={{ __html: contentReplaced }}
        />
      </div>
    </div>
  );
};
