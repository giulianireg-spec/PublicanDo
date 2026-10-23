// src/i18n/faq.ts
// Preguntas frecuentes en inglés y portugués, por id. El español vive en FAQScreen.
// Si falta una traducción se muestra el texto en español.

type FaqText = Record<string, [question: string, answer: string]>;

const en: FaqText = {
  '1': [
    'What is GuianDo?',
    'GuianDo was born with a simple mission: helping you discover the world around you.\n\nIf you travel somewhere new, GuianDo helps you plan your stay: where to eat, where to sleep, what to visit and what to experience. If you already know your city, GuianDo invites you to see it with fresh eyes.\n\nWe are a community of people who share places, create guides and build together a living map of real experiences.',
  ],
  '2': [
    'Is GuianDo free?',
    'Yes, GuianDo is completely free for everyone. You can search places, save favorites, create listings and build travel guides without paying anything.\n\nWe believe discovering and sharing shouldn\'t cost anything.',
  ],
  '3': [
    'Where is it available?',
    'GuianDo works all over Argentina. There are already places in all 23 provinces and in the City of Buenos Aires: national parks, towns, museums, festivals and much more. Córdoba, where we started, is the province with the most places for now.\n\nAnyone can add places anywhere in the country. If your town still has few places, you can be the one who puts it on the map!',
  ],
  '4': [
    'How does the place search work?',
    'There are two search modes:\n\n📍 Near me — GuianDo uses your GPS to show nearby places. You can set the search radius: 5 km, 10 km, 25 km or 50 km.\n\n🗺️ By town — You search a specific town wherever you are. Ideal for planning before a trip.\n\nIn both modes you can filter by category and subcategory, and show only places that are open now.',
  ],
  '5': [
    'What kind of places can I find?',
    'GuianDo has 8 main categories:\n\n🍽️ Food & drink — restaurants, cafés, bars, ice cream shops, bakeries, take-away\n🏨 Lodging — hotels, hostels, cabins, apart-hotels, campsites\n🎭 Culture — museums, theaters, historic buildings, cultural centers\n🎉 Events — festivals, fairs, shows\n🌳 Nature — parks, reserves, rivers, viewpoints, mountains\n🎯 Experiences — tours, adventure, workshops, activities\n🛍️ Shopping — crafts, markets, malls, local shops\n🌙 Nightlife — clubs, pubs, folk music venues, cocktail bars',
  ],
  '6': [
    'How do I add a place?',
    'Adding a place is simple:\n\n1. Create an account or sign in\n2. Tap the "+" button on the main screen\n3. Fill in the name, category and description\n4. Add photos\n5. Set the location and opening hours\n6. Submit — your listing will be reviewed and approved within 24 hours.\n\nThe more details you add, the more useful it is for whoever finds it.',
  ],
  '7': [
    'How many listings can I create?',
    'There is no limit. You can add as many places as you like. Each listing can include photos, detailed opening hours, full contact information, an exact location and a formatted description.',
  ],
  '8': [
    'Why is my listing "Pending"?',
    'Every listing is reviewed to make sure the content is real, useful and respectful. They are usually approved within 24 hours.\n\nIf your listing needs changes, you\'ll get a comment explaining what to fix. You can edit it and resubmit as many times as you need.',
  ],
  '9': [
    'What content is NOT allowed?',
    'We don\'t allow:\n\n• False or misleading content\n• Places that don\'t exist or have closed\n• Spam or duplicate listings\n• Offensive or inappropriate content\n• Deliberately wrong contact information\n• Content that violates the rights of others\n\nGuianDo is a community built on trust. Content quality depends on all of us.',
  ],
  '10': [
    'Can I edit my listing after publishing it?',
    'Yes, you can edit your listings anytime from "My listings" in your profile. If the listing was already approved and you make important changes, it goes back to review to keep quality high.',
  ],
  '11': [
    'Can I add opening hours?',
    'Yes, and it\'s very useful. You can set the hours day by day, with opening and closing times. GuianDo then shows automatically whether the place is "Open" or "Closed", which helps a lot when people plan their visit.',
  ],
  '12': [
    'What are guides?',
    'Guides are itineraries made by real people, for real people.\n\nYou can create a guide with up to 10 stops: "Buenos Aires in 2 days", "Quebrada de Humahuaca in 2 days", "The best cafés in Nueva Córdoba", "A weekend in Bariloche".\n\nEach stop has its description, estimated time, location and personal tips. They are the difference between a generic trip and a memorable experience.',
  ],
  '13': [
    'What are guides for?',
    'Guides are useful in two ways:\n\n🧳 For travelers — If you go somewhere you don\'t know, a guide gives you a concrete plan. No need to search a thousand websites: someone who has been there put it together for you.\n\n🏙️ For locals — If you live in a town, creating guides is a way to share what you love about it with visitors. It\'s rediscovering your surroundings with pride.',
  ],
  '14': [
    'How do I create a guide?',
    'In the "Guides" section, tap "+" and:\n\n1. Add a title and description\n2. Choose the category (food, culture, adventure, etc.)\n3. Add between 2 and 10 stops\n4. For each stop you can link a place already on GuianDo, or add a custom one with its own description and photo\n5. Set the estimated time at each stop\n6. Publish and share\n\nThe more detailed your guide, the more value it gives to the people who use it.',
  ],
  '15': [
    'Are guides moderated?',
    'It depends on the content:\n\n✅ If every stop is a place already approved on GuianDo, the guide is published automatically (if your account is verified).\n\n⏳ If you add custom stops for places that aren\'t in the app, the guide is reviewed to make sure the information is accurate.',
  ],
  '16': [
    'Can I rate other people\'s guides?',
    'Yes. After using a guide you can rate it from 1 to 5. The best-rated guides are featured so more people discover them. It\'s how the community rewards good content.',
  ],
  '17': [
    'Can I edit a guide I already published?',
    'Yes, from "My guides" in your profile you can edit any of your guides: change stops, update descriptions, adjust estimated times or add new stops. If the guide was already approved and you make changes, it goes back to review.',
  ],
  '18': [
    'How do I create an account?',
    'You can sign up in two ways:\n\n1. With your email and a password\n2. With your Google account (faster)\n\nWith an account you can add places, create guides, save favorites, collect stamps and get notified when your listings are approved.',
  ],
  '19': [
    'I forgot my password, what do I do?',
    'On the sign-in screen, tap "Forgot your password?" and enter your email. If it\'s registered, we\'ll send you a 6-digit code to create a new password. Check your spam folder if it doesn\'t arrive within a few minutes.',
  ],
  '20': [
    'What is a "verified" user?',
    'Verified users are people who have consistently published quality content. Their listings and guides are approved automatically, without manual review.\n\nIt recognizes the trust they have earned in the community. The GuianDo team grants this distinction.',
  ],
  '21': [
    'How do I delete my account?',
    'In your profile, at the bottom of the screen, tap "Delete my account" and confirm. You can also request it at guiando.com.ar/eliminar-cuenta or by writing to soporte@guiando.com.ar.\n\nKeep in mind that:\n\n• Your account, listings, guides, stamps and ratings are deleted\n• This can\'t be undone',
  ],
  '22': [
    'How do you check that places are real?',
    'Every listing is reviewed by hand before it appears in the app. We check:\n\n• That the information is consistent and complete\n• That the photos match the place\n• That the contact details are valid\n\nAlso, any user can report a listing with wrong or outdated information.',
  ],
  '23': [
    'How do I report a place with wrong information?',
    'Very simple:\n\n1. Open the listing\n2. Tap the flag icon (⚑) in the top corner\n3. Choose the reason\n4. Optionally add more details\n\nOur team reviews reports within 24 hours. Thanks for helping keep GuianDo reliable.',
  ],
  '24': [
    'Is my data safe?',
    'Yes. We take privacy very seriously:\n\n• All connections are encrypted (HTTPS)\n• Passwords are stored with a secure hash\n• We don\'t sell your personal data\n• To show ads and measure app usage, Google (AdMob and Firebase) receives the device identifier plus usage and crash data\n• Your precise location is only used to show nearby places and validate stamps\n• We comply with Argentina\'s personal data protection laws\n\nYou can read our full Privacy Policy from your profile.',
  ],
  '25': [
    'I found my business listed, how do I claim it?',
    'If someone listed your business and you want to manage it yourself:\n\n1. Create an account with your business email\n2. Write to soporte@guiando.com.ar\n3. Send us proof that it\'s your business (photo, utility bill, etc.)\n4. We transfer the listing to your account within 24–48 hours\n\nIt\'s completely free and gives you full control over the information.',
  ],
  '26': [
    'What are stamps?',
    'Every place on GuianDo has its stamp. When you are there, open the place and tap "Collect": the stamp is added to "Visited places" in your profile, sorted by category and subcategory. From there you can share your collection as an image.\n\nFestivals and dated events have one stamp per edition.',
  ],
  '27': [
    'Why can\'t I collect a place\'s stamp?',
    'The stamp is enabled only when you can collect it. It may be disabled for one of these reasons:\n\n• You aren\'t close enough yet. The distance depends on the type of place: up to 200 m for Nature, 150 m for Events, 100 m for Experiences, 60 m for Shopping, 40 m for Culture and 25 m for Food & drink, Lodging and Nightlife.\n\n• The GPS signal is weak. Indoors or between tall buildings GPS can be off by tens of meters: try outdoors or near a window and wait a few seconds.\n\n• GuianDo doesn\'t have location permission, or your phone\'s GPS is off.\n\n• It\'s a festival or fair outside its dates: those stamps can only be collected while the event is on.\n\n• You have a mock location app turned on.\n\nIf you have no data signal you can still collect it: it stays pending and is validated automatically when you\'re back online.',
  ],
  '28': [
    'How do titles work?',
    'Your stamps earn you titles for each town, province and category, based on the share of places you visited:\n\n• 1 to 15%: Rookie\n• 16 to 40%: Seasoned\n• 41 to 85%: Expert\n• 86 to 99%: Supreme\n• 100%: Master\n\nFor example, if you visited every Nature place in Córdoba you are "Master nature lover of Córdoba". Since GuianDo keeps adding places, the percentage can go down: there\'s always something new to see! Your titles are in "Visited places", in your profile.',
  ],
  '29': [
    'Can I display a GuianDo QR code at my business?',
    'Yes, for free. In "My listings", under each approved place, tap "Kit QR para imprimir": an A4 sheet opens with your place\'s name and a QR code that leads straight to your listing.\n\nPrint it or save it as a PDF and put it at the entrance, the register or on the tables. Anyone who scans it can see your listing, how to get there and collect your place\'s stamp.',
  ],
};

const pt: FaqText = {
  '1': [
    'O que é o GuianDo?',
    'O GuianDo nasceu com uma missão simples: ajudar você a descobrir o mundo ao seu redor.\n\nSe você viaja para um lugar novo, o GuianDo ajuda a planejar a estadia: onde comer, onde dormir, o que visitar e que experiências viver. Se você já conhece sua cidade, o GuianDo convida a redescobri-la com outros olhos.\n\nSomos uma comunidade de pessoas que compartilham lugares, criam guias e constroem juntas um mapa vivo de experiências reais.',
  ],
  '2': [
    'O GuianDo é gratuito?',
    'Sim, o GuianDo é totalmente gratuito para todos. Você pode buscar lugares, salvar favoritos, criar publicações e montar guias de viagem sem pagar nada.\n\nAcreditamos que descobrir e compartilhar não deveria ter custo.',
  ],
  '3': [
    'Onde está disponível?',
    'O GuianDo funciona em toda a Argentina. Já há lugares cadastrados nas 23 províncias e na Cidade de Buenos Aires: parques nacionais, povoados, museus, festivais e muito mais. Córdoba, onde começamos, é por enquanto a província com mais lugares.\n\nQualquer pessoa pode publicar lugares em qualquer ponto do país. Se a sua cidade ainda tem poucos lugares, você pode ser quem a coloca no mapa!',
  ],
  '4': [
    'Como funciona a busca de lugares?',
    'Há dois modos de busca:\n\n📍 Perto de mim — o GuianDo usa seu GPS para mostrar lugares próximos. Você pode ajustar o raio de busca: 5 km, 10 km, 25 km ou 50 km.\n\n🗺️ Por cidade — você busca numa cidade específica, esteja onde estiver. Ideal para planejar antes de viajar.\n\nNos dois casos você pode filtrar por categoria e subcategoria e ver só os lugares abertos agora.',
  ],
  '5': [
    'Que tipo de lugares posso encontrar?',
    'O GuianDo tem 8 categorias principais:\n\n🍽️ Gastronomia — restaurantes, cafés, bares, sorveterias, padarias, comida para levar\n🏨 Hospedagem — hotéis, hostels, chalés, apart-hotéis, campings\n🎭 Cultura — museus, teatros, edifícios históricos, centros culturais\n🎉 Eventos — festivais, feiras, espetáculos\n🌳 Natureza — parques, reservas, rios, mirantes, serras\n🎯 Experiências — passeios, aventura, oficinas, atividades\n🛍️ Compras — artesanato, mercados, shoppings, lojas locais\n🌙 Vida noturna — baladas, pubs, peñas folclóricas, bares de drinques',
  ],
  '6': [
    'Como publico um lugar?',
    'Publicar é simples:\n\n1. Crie uma conta ou entre\n2. Toque no botão "+" na tela principal\n3. Preencha o nome, a categoria e a descrição\n4. Adicione fotos\n5. Indique a localização e o horário de funcionamento\n6. Envie — sua publicação será revisada e aprovada em menos de 24 horas.\n\nQuanto mais detalhes, mais útil ela será para quem a encontrar.',
  ],
  '7': [
    'Quantas publicações posso criar?',
    'Não há limite. Você pode publicar quantos lugares quiser. Cada publicação pode ter fotos, horários detalhados, informações de contato completas, localização exata e uma descrição com formatação.',
  ],
  '8': [
    'Por que minha publicação está "Pendente"?',
    'Todas as publicações passam por uma revisão para garantir que o conteúdo seja real, útil e respeitoso. Normalmente são aprovadas em menos de 24 horas.\n\nSe precisar de ajustes, você receberá um comentário explicando o que corrigir. Pode editá-la e reenviá-la quantas vezes precisar.',
  ],
  '9': [
    'Que conteúdo NÃO é permitido?',
    'Não permitimos:\n\n• Conteúdo falso ou enganoso\n• Lugares que não existem ou que fecharam\n• Spam ou publicações duplicadas\n• Conteúdo ofensivo ou inadequado\n• Dados de contato incorretos de propósito\n• Conteúdo que viole direitos de terceiros\n\nO GuianDo é uma comunidade de confiança. A qualidade do conteúdo depende de todos.',
  ],
  '10': [
    'Posso editar minha publicação depois de publicá-la?',
    'Sim, você pode editar suas publicações a qualquer momento em "Meus lugares publicados", no seu perfil. Se a publicação já estava aprovada e você fizer mudanças importantes, ela volta para revisão para manter a qualidade.',
  ],
  '11': [
    'Posso informar o horário de funcionamento?',
    'Sim, e é muito útil. Você pode cadastrar o horário dia a dia, com abertura e fechamento. O GuianDo mostra automaticamente se o lugar está "Aberto" ou "Fechado", o que ajuda muito quem está planejando a visita.',
  ],
  '12': [
    'O que são os guias?',
    'Os guias são roteiros montados por pessoas reais, para pessoas reais.\n\nVocê pode criar um guia com até 10 paradas: "Buenos Aires em 2 dias", "Quebrada de Humahuaca em 2 dias", "Os melhores cafés de Nueva Córdoba", "Um fim de semana em Bariloche".\n\nCada parada tem descrição, tempo estimado, localização e dicas pessoais. É a diferença entre uma viagem genérica e uma experiência memorável.',
  ],
  '13': [
    'Para que servem os guias?',
    'Os guias servem para duas coisas:\n\n🧳 Para viajantes — se você vai a um lugar que não conhece, um guia dá um plano concreto. Não precisa procurar em mil sites: alguém que já esteve lá montou tudo para você.\n\n🏙️ Para moradores — se você mora numa cidade, criar guias é uma forma de compartilhar o que você ama do seu lugar com quem chega. É redescobrir seu entorno com orgulho.',
  ],
  '14': [
    'Como crio um guia?',
    'Na seção "Guias", toque em "+" e:\n\n1. Coloque um título e uma descrição\n2. Escolha a categoria (gastronômica, cultural, aventura etc.)\n3. Adicione entre 2 e 10 paradas\n4. Em cada parada você pode vincular um lugar já publicado no GuianDo ou adicionar um personalizado com descrição e foto próprias\n5. Indique o tempo estimado em cada parada\n6. Publique e compartilhe\n\nQuanto mais detalhado o guia, mais valor ele terá para quem o usar.',
  ],
  '15': [
    'Os guias passam por moderação?',
    'Depende do conteúdo:\n\n✅ Se todas as paradas forem lugares já aprovados no GuianDo, o guia é publicado automaticamente (se a sua conta for verificada).\n\n⏳ Se você incluir paradas personalizadas com lugares que não estão no app, o guia passa por revisão para garantir a qualidade da informação.',
  ],
  '16': [
    'Posso avaliar os guias de outras pessoas?',
    'Sim. Depois de usar um guia você pode dar uma nota de 1 a 5. Os guias mais bem avaliados aparecem em destaque para que mais pessoas os descubram. É a forma como a comunidade premia o bom conteúdo.',
  ],
  '17': [
    'Posso editar um guia que já publiquei?',
    'Sim, em "Meus guias", no seu perfil, você pode editar qualquer um dos seus guias: trocar paradas, atualizar descrições, mudar tempos estimados ou adicionar novas paradas. Se o guia já estava aprovado e você fizer mudanças, ele volta para revisão.',
  ],
  '18': [
    'Como crio uma conta?',
    'Você pode se cadastrar de duas formas:\n\n1. Com seu e-mail e uma senha\n2. Com sua conta do Google (mais rápido)\n\nCom uma conta você pode publicar lugares, criar guias, salvar favoritos, coletar selos e receber notificações quando suas publicações forem aprovadas.',
  ],
  '19': [
    'Esqueci minha senha, o que faço?',
    'Na tela de entrada, toque em "Esqueceu sua senha?" e digite seu e-mail. Se estiver cadastrado, enviaremos um código de 6 dígitos para você criar uma nova senha. Confira a pasta de spam se não chegar em alguns minutos.',
  ],
  '20': [
    'O que é um usuário "verificado"?',
    'Usuários verificados são pessoas que publicam conteúdo de qualidade de forma consistente. Suas publicações e guias são aprovados automaticamente, sem revisão manual.\n\nÉ um reconhecimento à confiança conquistada na comunidade. A equipe do GuianDo concede essa distinção.',
  ],
  '21': [
    'Como excluo minha conta?',
    'No seu perfil, no final da tela, toque em "Excluir minha conta" e confirme. Você também pode pedir em guiando.com.ar/eliminar-cuenta ou escrevendo para soporte@guiando.com.ar.\n\nLembre que:\n\n• Sua conta, publicações, guias, selos e avaliações são apagados\n• Esta ação não pode ser desfeita',
  ],
  '22': [
    'Como vocês verificam que os lugares são reais?',
    'Cada publicação passa por revisão manual antes de aparecer no app. Verificamos:\n\n• Que a informação seja coerente e completa\n• Que as fotos correspondam ao lugar\n• Que os dados de contato sejam válidos\n\nAlém disso, qualquer usuário pode denunciar uma publicação com informação incorreta ou desatualizada.',
  ],
  '23': [
    'Como denuncio um lugar com informação incorreta?',
    'Muito simples:\n\n1. Abra a publicação\n2. Toque no ícone de bandeira (⚑) no canto superior\n3. Escolha o motivo\n4. Se quiser, adicione mais detalhes\n\nNossa equipe analisa a denúncia em menos de 24 horas. Obrigado por ajudar a manter o GuianDo confiável.',
  ],
  '24': [
    'Meus dados estão seguros?',
    'Sim. Levamos a privacidade muito a sério:\n\n• Todas as conexões são criptografadas (HTTPS)\n• As senhas são armazenadas com hash seguro\n• Não vendemos seus dados pessoais\n• Para mostrar anúncios e medir o uso do app, o Google (AdMob e Firebase) recebe o identificador do dispositivo e dados de uso e de erros\n• Sua localização precisa é usada só para mostrar lugares próximos e validar selos\n• Cumprimos as leis argentinas de proteção de dados pessoais\n\nVocê pode ler nossa Política de Privacidade completa no seu perfil.',
  ],
  '25': [
    'Encontrei meu negócio publicado, como o reivindico?',
    'Se alguém publicou o seu negócio e você quer administrá-lo:\n\n1. Crie uma conta com o e-mail do negócio\n2. Escreva para soporte@guiando.com.ar\n3. Envie uma prova de que o negócio é seu (foto, conta de serviços etc.)\n4. Transferimos a publicação para a sua conta em 24 a 48 horas\n\nÉ totalmente gratuito e dá a você controle total sobre a informação.',
  ],
  '26': [
    'O que são os selos?',
    'Cada lugar do GuianDo tem seu selo. Quando você estiver no lugar, abra a ficha e toque em "Coletar": o selo é somado a "Lugares visitados", no seu perfil, organizado por categoria e subcategoria. De lá você pode compartilhar sua coleção como imagem.\n\nNos festivais e eventos com data há um selo por edição.',
  ],
  '27': [
    'Por que não consigo coletar o selo de um lugar?',
    'O selo fica habilitado só quando você pode coletá-lo. Ele pode estar desabilitado por um destes motivos:\n\n• Você ainda não está perto o bastante. A distância depende do tipo de lugar: até 200 m em Natureza, 150 m em Eventos, 100 m em Experiências, 60 m em Compras, 40 m em Cultura e 25 m em Gastronomia, Hospedagem e Vida noturna.\n\n• O sinal de GPS está impreciso. Dentro de edifícios ou entre prédios altos o GPS pode errar dezenas de metros: tente ao ar livre ou perto de uma janela e espere alguns segundos.\n\n• O GuianDo não tem permissão de localização, ou o GPS do telefone está desligado.\n\n• É um festival ou feira fora das datas: esses selos só podem ser coletados enquanto o evento acontece.\n\n• Há um app de localização simulada ativado.\n\nSe você estiver sem dados, pode coletar mesmo assim: o selo fica pendente e é validado sozinho quando a conexão voltar.',
  ],
  '28': [
    'Como funcionam os títulos?',
    'Com seus selos você ganha títulos para cada cidade, província e categoria, de acordo com a porcentagem de lugares que visitou:\n\n• 1 a 15%: Novato\n• 16 a 40%: Experiente\n• 41 a 85%: Especialista\n• 86 a 99%: Supremo\n• 100%: Mestre\n\nPor exemplo, se você visitou todos os lugares de Natureza de Córdoba, você é "Mestre paisagista de Córdoba". Como o GuianDo adiciona lugares novos o tempo todo, a porcentagem pode cair: sempre há algo novo para conhecer! Seus títulos ficam em "Lugares visitados", no seu perfil.',
  ],
  '29': [
    'Posso colocar um QR do GuianDo no meu negócio?',
    'Sim, de graça. Em "Meus lugares publicados", abaixo de cada lugar aprovado, toque em "Kit QR para imprimir": abre-se uma folha A4 com o nome do seu lugar e um código QR que leva direto à sua ficha.\n\nImprima ou salve como PDF e coloque na entrada, no caixa ou nas mesas. Quem escanear pode ver sua ficha, como chegar e coletar o selo do seu lugar.',
  ],
};

export const FAQ_TRANSLATIONS: Record<'en' | 'pt', FaqText> = { en, pt };
