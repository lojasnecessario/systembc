export const legalPages: Record<string, { title: string; content: string }> = {
  'politica-de-privacidade': {
    title: 'Política de Privacidade',
    content: `
      <p class="mb-4">A <strong>{{empresa_nome}}</strong> valoriza a sua privacidade e se compromete a proteger os dados pessoais de nossos clientes e visitantes. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos suas informações ao utilizar nosso e-commerce, em conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD - Lei nº 13.709/2018).</p>
      
      <h2 class="text-xl font-bold mt-8 mb-4 text-white">Objetivo da Política</h2>
      <p class="mb-4">O objetivo deste documento é fornecer transparência sobre o tratamento dos seus dados pessoais. Queremos que você compreenda de forma clara quais informações coletamos, por que as coletamos e como você pode gerenciar e exercer seus direitos em relação aos seus dados.</p>
      
      <h2 class="text-xl font-bold mt-8 mb-4 text-white">Dados Pessoais Coletados</h2>
      <p class="mb-4">Para oferecer nossos produtos e melhorar sua experiência, podemos coletar os seguintes dados pessoais:</p>
      <ul class="list-disc pl-6 mb-4 space-y-2 text-neutral-400">
        <li><strong>Dados cadastrais:</strong> Nome completo, CPF, data de nascimento.</li>
        <li><strong>Dados de contato:</strong> E-mail, telefone (como celular/WhatsApp), endereço completo para entrega e faturamento.</li>
        <li><strong>Dados de navegação:</strong> Endereço IP, tipo de navegador, páginas visitadas, tempo de permanência no site.</li>
        <li><strong>Dados de pagamento:</strong> Informações parciais de cartão de crédito (mascaradas por segurança), método de pagamento escolhido.</li>
      </ul>
      
      <h2 class="text-xl font-bold mt-8 mb-4 text-white">Como os Dados São Coletados</h2>
      <ul class="list-disc pl-6 mb-4 space-y-2 text-neutral-400">
        <li><strong>Diretamente de você:</strong> Quando você realiza um cadastro, faz uma compra, assina nossa newsletter ou entra em contato conosco.</li>
        <li><strong>Automaticamente:</strong> Por meio de cookies e tecnologias semelhantes quando você navega em nosso site.</li>
        <li><strong>Por terceiros:</strong> Através de parceiros de pagamento ou plataformas de redes sociais caso você utilize o login social (quando disponível).</li>
      </ul>
      
      <h2 class="text-xl font-bold mt-8 mb-4 text-white">Finalidade do Tratamento dos Dados</h2>
      <ul class="list-disc pl-6 mb-4 space-y-2 text-neutral-400">
        <li>Processar, faturar e enviar seus pedidos.</li>
        <li>Comunicar o status das suas compras e responder a eventuais dúvidas.</li>
        <li>Melhorar a segurança do nosso site e prevenir fraudes.</li>
        <li>Cumprir obrigações legais ou regulatórias.</li>
        <li>Enviar ofertas, novidades e promoções (apenas com o seu consentimento prévio).</li>
        <li>Personalizar e aprimorar sua experiência de navegação e compra.</li>
      </ul>

      <h2 class="text-xl font-bold mt-8 mb-4 text-white">Compartilhamento e Cookies</h2>
      <p class="mb-4">Compartilhamos dados necessários com gateways de pagamento (que possuem certificação PCI Compliance) e transportadoras. Utilizamos cookies para otimizar sua navegação, veja nossa Política de Cookies para mais detalhes.</p>

      <h2 class="text-xl font-bold mt-8 mb-4 text-white">Direitos do Titular</h2>
      <p class="mb-4">Você pode solicitar acesso, correção, anonimização ou exclusão dos seus dados a qualquer momento entrando em contato pelo nosso canal de atendimento.</p>
      
      <h2 class="text-xl font-bold mt-8 mb-4 text-white">Contato</h2>
      <p class="mb-4">Em caso de dúvidas: <br>
      E-mail: {{empresa_email}} <br>
      Telefone: {{empresa_telefone}} <br>
      CNPJ: {{empresa_cnpj}}
      </p>
    `
  },
  'termos-de-uso': {
    title: 'Termos de Uso',
    content: `
      <p class="mb-4">Ao acessar e utilizar o site da <strong>{{empresa_nome}}</strong>, você concorda integralmente com estes Termos de Uso. Caso não concorde com qualquer disposição aqui presente, recomendamos que não utilize nossos serviços.</p>
      
      <h2 class="text-xl font-bold mt-8 mb-4 text-white">Cadastro do Usuário</h2>
      <p class="mb-4">Para realizar compras, o Usuário deverá criar uma conta preenchendo o formulário de cadastro com informações exatas. É de responsabilidade do Usuário manter o sigilo de seu login e senha.</p>
      
      <h2 class="text-xl font-bold mt-8 mb-4 text-white">Processo de Compra e Pagamentos</h2>
      <p class="mb-4">O contrato de compra é formalizado quando o pagamento é aprovado. Oferecemos pagamento por cartão de crédito e PIX. Todas as transações passam por análise antifraude.</p>
      
      <h2 class="text-xl font-bold mt-8 mb-4 text-white">Responsabilidades</h2>
      <p class="mb-4">A <strong>{{empresa_nome}}</strong> compromete-se a entregar os produtos adquiridos e proteger os dados do cliente. O cliente compromete-se a fornecer informações verídicas e não utilizar o site para fins ilegais.</p>
      
      <h2 class="text-xl font-bold mt-8 mb-4 text-white">Propriedade Intelectual</h2>
      <p class="mb-4">Todo o conteúdo deste site (textos, imagens, logos) é propriedade exclusiva da <strong>{{empresa_nome}}</strong>, sendo proibida sua reprodução.</p>
      
      <h2 class="text-xl font-bold mt-8 mb-4 text-white">Contato e Foro</h2>
      <p class="mb-4">Estes termos são regidos pelas leis do Brasil. Fica eleito o foro de {{empresa_cidade}} - {{empresa_estado}} para dirimir dúvidas. Contato: {{empresa_email}}.</p>
    `
  },
  'politica-de-troca-e-devolucao': {
    title: 'Política de Troca e Devolução',
    content: `
      <p class="mb-4">A <strong>{{empresa_nome}}</strong> garante a total satisfação de seus clientes. Nossa política é baseada no Código de Defesa do Consumidor.</p>
      
      <h2 class="text-xl font-bold mt-8 mb-4 text-white">Direito de Arrependimento (7 Dias)</h2>
      <p class="mb-4">Conforme o art. 49 do CDC, você tem até 7 dias corridos após o recebimento do produto para desistir da compra. O valor será integralmente restituído.</p>
      
      <h2 class="text-xl font-bold mt-8 mb-4 text-white">Produtos com Defeito</h2>
      <p class="mb-4">Se o produto apresentar defeito de fabricação, o prazo para solicitação é de até 90 dias para bens duráveis e 30 dias para não duráveis.</p>
      
      <h2 class="text-xl font-bold mt-8 mb-4 text-white">Condições para Troca e Devolução</h2>
      <ul class="list-disc pl-6 mb-4 space-y-2 text-neutral-400">
        <li>Ser devolvido na embalagem original (quando possível).</li>
        <li>Estar acompanhado de acessórios e manuais.</li>
        <li>Não apresentar indícios de mau uso.</li>
        <li>Acompanhar a nota fiscal.</li>
      </ul>
      
      <h2 class="text-xl font-bold mt-8 mb-4 text-white">Procedimento</h2>
      <p class="mb-4">Entre em contato pelo e-mail {{empresa_email}} ou WhatsApp {{empresa_whatsapp}} informando o número do pedido. Forneceremos as instruções para o envio reverso gratuito (em casos de defeito ou arrependimento).</p>
      
      <p class="mb-4">O prazo para conclusão da troca/reembolso é de até 30 dias corridos após recebermos o produto em nossa central.</p>
    `
  },
  'politica-de-reembolso': {
    title: 'Política de Reembolso',
    content: `
      <p class="mb-4">Esta Política esclarece em quais situações você tem direito à devolução do valor pago na <strong>{{empresa_nome}}</strong>.</p>
      
      <h2 class="text-xl font-bold mt-8 mb-4 text-white">Forma de Reembolso</h2>
      <ul class="list-disc pl-6 mb-4 space-y-2 text-neutral-400">
        <li><strong>Cartão de Crédito:</strong> O estorno será solicitado à administradora e pode constar em até 2 faturas subsequentes.</li>
        <li><strong>PIX:</strong> Reembolso em até 5 dias úteis após a aprovação da devolução na mesma conta.</li>
        <li><strong>Boleto:</strong> Depósito em até 10 dias úteis na conta do titular do pedido.</li>
      </ul>
      
      <h2 class="text-xl font-bold mt-8 mb-4 text-white">Situações Aplicáveis</h2>
      <p class="mb-4">Arrependimento em até 7 dias, produto com defeito irrecuperável, ou cancelamento antes do envio.</p>
      
      <h2 class="text-xl font-bold mt-8 mb-4 text-white">Atendimento</h2>
      <p class="mb-4">Dúvidas? Fale conosco: {{empresa_email}} ou {{empresa_telefone}}.</p>
    `
  },
  'politica-de-cookies': {
    title: 'Política de Cookies',
    content: `
      <p class="mb-4">Nós da <strong>{{empresa_nome}}</strong> usamos cookies para melhorar sua experiência, conforme a LGPD.</p>
      
      <h2 class="text-xl font-bold mt-8 mb-4 text-white">O que são Cookies</h2>
      <p class="mb-4">São pequenos arquivos salvos no seu dispositivo para lembrar preferências (como itens no carrinho) e otimizar navegação.</p>
      
      <h2 class="text-xl font-bold mt-8 mb-4 text-white">Tipos de Cookies Utilizados</h2>
      <ul class="list-disc pl-6 mb-4 space-y-2 text-neutral-400">
        <li><strong>Necessários:</strong> Essenciais para o site funcionar (ex: checkout).</li>
        <li><strong>Funcionais:</strong> Memorizam escolhas (ex: idioma).</li>
        <li><strong>Estatísticos:</strong> Coletam dados anônimos de uso (ex: Google Analytics).</li>
        <li><strong>Marketing:</strong> Anúncios personalizados (ex: Meta Pixel, Google Ads).</li>
      </ul>
      
      <h2 class="text-xl font-bold mt-8 mb-4 text-white">Gerenciamento</h2>
      <p class="mb-4">Você pode desativar os cookies nas configurações do seu navegador, mas partes do site (como o carrinho) podem parar de funcionar corretamente.</p>
      <p class="mb-4">Contato: {{empresa_email}}</p>
    `
  },
  'aviso-de-seguranca': {
    title: 'Aviso de Segurança',
    content: `
      <p class="mb-4">A <strong>{{empresa_nome}}</strong> garante que sua compra é totalmente segura.</p>
      
      <h2 class="text-xl font-bold mt-8 mb-4 text-white">Navegação Segura (SSL)</h2>
      <p class="mb-4">Nosso site utiliza HTTPS, criptografando todos os seus dados pessoais e senhas.</p>
      
      <h2 class="text-xl font-bold mt-8 mb-4 text-white">Pagamentos</h2>
      <p class="mb-4">Não armazenamos números completos de cartão de crédito. Todo o processamento é feito em ambiente seguro e certificado (PCI-DSS).</p>
      
      <h2 class="text-xl font-bold mt-8 mb-4 text-white">Cuidado com Fraudes</h2>
      <p class="mb-4">Nossos contatos oficiais são pelo e-mail com domínio {{empresa_site}}. Nunca pediremos sua senha ou transferência para contas de pessoas físicas.</p>
      
      <p class="mb-4">Em caso de suspeita de fraude, denuncie para {{empresa_email}}.</p>
    `
  }
};
