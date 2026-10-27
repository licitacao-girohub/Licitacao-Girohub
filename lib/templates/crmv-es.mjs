// Modelos 'Produzir' do piloto CRMV-ES (Aviso de Contratação Direta nº 51/2026). Conteúdo conferido no TR em 16/10/2026.
import * as L from './base.mjs';
const { C, eyebrow, title, subtitle, h1, h2, body, small, bullets, spacer, pageBreak, callout, table, kv, build, CW_PORTRAIT: W, CW_LANDSCAPE: WL, AlignmentType, p } = L;

const VER = 'Versão 0.1 · 16/10/2026 · minuta para revisão';
const CERT = 'CRMV-ES · Aviso de Contratação Direta nº 51/2026 (Dispensa Eletrônica) · Processo nº 0410020.00000015/2026-21 · UASG 389200';
const HDR_INT = 'Licitações · CRMV-ES · Dispensa Eletrônica 51/2026';
const FTR_INT = 'GiroHub · Uso interno · Minuta v0.1 de 16/10/2026 · campos em amarelo exigem prova';
const HDR_EXT = 'CNPJ 55.055.533/0002-43';
const FTR_EXT = 'GIROHUB LTDA [CONFERIR] · CNPJ 55.055.533/0002-43 · [ENDEREÇO DA FILIAL — CONFERIR] · [TELEFONE] · [E-MAIL]';
const ORGAO = 'Ao Conselho Regional de Medicina Veterinária do Estado do Espírito Santo – CRMV-ES';
const REF = 'Ref.: Aviso de Contratação Direta nº 51/2026 – Dispensa Eletrônica – Processo nº 0410020.00000015/2026-21 – UASG 389200';
const QUALIF = 'A **GIROHUB LTDA** [CONFERIR RAZÃO SOCIAL NO CONTRATO SOCIAL], inscrita no CNPJ sob o nº **55.055.533/0002-43**, estabelecida em [ENDEREÇO DA FILIAL — CONFERIR], neste ato representada por [NOME DO REPRESENTANTE LEGAL], [CARGO], CPF nº [PENDENTE DE VALIDAÇÃO], com poderes conferidos por [CONTRATO SOCIAL / PROCURAÇÃO]';

function ficha(rows) { return kv([['Certame', CERT], ...rows, ['Versão', VER]], W); }
function fichaL(rows) { return kv([['Certame', CERT], ...rows, ['Versão', VER]], WL, { labelW: 2800 }); }
function legenda() { return small('Legenda: texto destacado em amarelo entre colchetes = campo que só pode ser preenchido com dado comprovado (documento, contrato, fatura, política ou decisão registrada). Nada foi estimado.', { after: 200 }); }
function pend(rows, width = W) {
  const w = width === W ? [3500, 2300, 3838] : [5200, 3200, 6170];
  return table({ widths: w, header: ['Campo pendente', 'Quem fornece', 'Prova necessária'], rows });
}
function assinatura(extra = []) {
  return [
    spacer(240),
    body('[LOCAL], [DATA]', { after: 600 }),
    p('______________________________________________', { align: AlignmentType.LEFT, after: 40, color: C.grey }),
    body('[NOME DO REPRESENTANTE LEGAL]', { bold: true, after: 20 }),
    body('[CARGO] · GIROHUB LTDA', { after: 20 }),
    ...extra,
  ];
}
function usoInterno(lines, pendRows) {
  return [
    pageBreak(),
    ...callout(['**USO INTERNO — apague esta página antes de gerar o PDF de envio.**'], 'stop'),
    h1('Notas para a equipe'),
    ...bullets(lines),
    h1('Campos pendentes'),
    pend(pendRows),
  ];
}

const docs = [];

// ===================== ITEM 11 =====================
docs.push({
  file: '07_Declaracoes/Item11_Declaracao_Nao_Emprego_Menor_CRMV-ES_v0.1.docx',
  docTitle: 'Declaração de não emprego de menor – CRMV-ES',
  headerText: HDR_EXT, footerText: FTR_EXT,
  children: [
    spacer(200),
    body(ORGAO, { bold: true, after: 40 }),
    body(REF, { after: 400 }),
    p('DECLARAÇÃO', { size: 26, bold: true, color: C.navy, align: AlignmentType.CENTER, after: 40 }),
    p('Art. 7º, inciso XXXIII, da Constituição Federal', { size: 18, color: C.grey, align: AlignmentType.CENTER, after: 400 }),
    body(`${QUALIF}, **DECLARA**, para os fins do item 14.6.2, alínea "f", do Termo de Referência e do item 3.9.6 do Aviso de Contratação Direta, que não emprega menor de 18 (dezoito) anos em trabalho noturno, perigoso ou insalubre e não emprega menor de 16 (dezesseis) anos, salvo menor, a partir de 14 (quatorze) anos, na condição de aprendiz, nos termos do artigo 7º, inciso XXXIII, da Constituição Federal.`, { align: AlignmentType.JUSTIFIED, line: 320, after: 240 }),
    body('Ressalva (assinalar somente se for verdade):', { after: 60 }),
    body('[ ] emprega menor, a partir de 14 (quatorze) anos, na condição de aprendiz.', { indent: { left: 360 }, after: 240 }),
    body('Por ser expressão da verdade, firma a presente declaração.', { after: 120 }),
    ...assinatura(),
    ...usoInterno([
      'Neste certame a declaração é feita por marcação de "sim" ou "não" no sistema, no cadastro da proposta inicial (Aviso 3.9.6). Este documento só é usado se o agente de contratação pedir a declaração por escrito como documento complementar (Aviso 5.6.4; TR 14.8).',
      'Cada marcação ou assinatura é uma afirmação da empresa. A Direção aprova a veracidade antes. Declaração falsa é infração (Lei 14.133, art. 155, VIII).',
      'A ressalva de aprendiz depende de informação do RH: se não houver aprendiz, apague a ressalva inteira.',
    ], [
      ['Razão social exata', 'Administrativo GiroHub', 'Contrato social consolidado'],
      ['Endereço da filial', 'Administrativo GiroHub', 'Cartão CNPJ da filial'],
      ['Representante legal, cargo e CPF', 'Direção (decisão 2 da Diretoria)', 'Contrato social ou procuração'],
      ['Existência de aprendiz', 'RH / Contábil (folha)', 'Folha de pagamento ou declaração do RH'],
      ['Aprovação da veracidade', 'Direção', 'Registro da aprovação no checklist'],
    ]),
  ],
});

// ===================== ITEM 14 =====================
docs.push({
  file: '03_Economico_Financeira/Item14_Memoria_Calculo_Indices_v0.1.docx',
  docTitle: 'Memória de cálculo dos índices contábeis',
  headerText: 'Licitações · Modelo-base · Econômico-financeira', footerText: FTR_INT,
  children: [
    eyebrow('ITEM 14 · 03_ECONÔMICO_FINANCEIRA · MODELO-BASE'),
    title('Memória de cálculo dos índices contábeis e do patrimônio líquido'),
    subtitle('Para certames que exijam boa situação financeira por índices ou patrimônio líquido mínimo.'),
    ...callout(['**Não exigido no CRMV-ES.** A qualificação econômico-financeira deste certame pede só a certidão negativa de falência ou recuperação judicial (TR 14.6.4). Este documento fica como modelo-base para os próximos editais.'], 'info'),
    kv([
      ['Base legal', 'Lei 14.133, art. 69, I (balanço e demonstrações dos 2 últimos exercícios), § 1º (declaração de profissional contábil), § 2º (vedados faturamento mínimo e índices de rentabilidade ou lucratividade), § 4º (capital ou PL mínimo de até 10% do valor estimado), § 5º (vedados índices não usuais) e § 6º (empresa com menos de 2 anos: último exercício).'],
      ['Responsável (checklist)', 'Contábil'],
      ['Valida / aprova', 'Contábil assina; Licitações confere contra o edital'],
      ['Camada', 'C1 para os números do balanço; C2 para o enquadramento no edital'],
      ['Versão', VER],
    ], W),
    legenda(),
    h1('1. Dados do balanço'),
    body('Preencher a partir do balanço patrimonial registrado (SPED ECD), indicando a folha ou o registro de onde saiu cada valor.'),
    table({
      widths: [3600, 1900, 1900, 2238],
      header: ['Conta', 'Exercício [ANO] (R$)', 'Exercício [ANO − 1] (R$)', 'Fonte (ECD, folha)'],
      rows: [
        ['Ativo Circulante (AC)', '[ ]', '[ ]', '[ ]'],
        ['Realizável a Longo Prazo (RLP)', '[ ]', '[ ]', '[ ]'],
        ['Ativo Total (AT)', '[ ]', '[ ]', '[ ]'],
        ['Passivo Circulante (PC)', '[ ]', '[ ]', '[ ]'],
        ['Passivo Não Circulante (PNC)', '[ ]', '[ ]', '[ ]'],
        ['Patrimônio Líquido (PL)', '[ ]', '[ ]', '[ ]'],
      ],
    }),
    small('Se a empresa foi constituída há menos de 2 anos, o balanço limita-se ao último exercício (art. 69, § 6º). O Contábil confirma a data de constituição da matriz.', { before: 80 }),
    h1('2. Índices'),
    body('O mínimo de cada índice é o que o edital fixar. Sem cláusula no edital, a linha não se aplica.'),
    table({
      widths: [2300, 3000, 1300, 1900, 1138],
      header: ['Índice', 'Fórmula', 'Resultado', 'Mínimo do edital (cláusula)', 'Atende?'],
      rows: [
        ['Liquidez Geral (LG)', '(AC + RLP) ÷ (PC + PNC)', '[ ]', '[EDITAL, ITEM]', '[ ]'],
        ['Solvência Geral (SG)', 'AT ÷ (PC + PNC)', '[ ]', '[EDITAL, ITEM]', '[ ]'],
        ['Liquidez Corrente (LC)', 'AC ÷ PC', '[ ]', '[EDITAL, ITEM]', '[ ]'],
      ],
    }),
    h1('3. Alternativa: capital social ou patrimônio líquido mínimo'),
    body('Quando o edital pedir capital ou PL mínimo (art. 69, § 4º), o limite legal é de até 10% do valor estimado da contratação.'),
    table({
      widths: [4600, 2400, 2638],
      header: ['Linha', 'Valor', 'Fonte'],
      rows: [
        ['Valor estimado da contratação', '[R$ — EDITAL]', '[ITEM DO EDITAL]'],
        ['Percentual exigido (até 10%)', '[ %]', '[ITEM DO EDITAL]'],
        ['PL ou capital mínimo exigido = valor × percentual', '[R$]', 'Cálculo'],
        ['Capital social da GiroHub', 'R$ 120.000,00 [CONFERIR NO CONTRATO SOCIAL]', 'Consulta pública de CNPJ, 16/10/2026'],
        ['Patrimônio líquido da GiroHub', '[R$ — BALANÇO]', '[ECD, FOLHA]'],
        ['Atende?', '[ ]', '—'],
      ],
    }),
    h1('4. Declaração do profissional contábil (modelo)'),
    small('Usar quando o edital pedir a declaração prevista no art. 69, § 1º.'),
    ...callout([
      'Declaro, na qualidade de profissional habilitado da área contábil, que a GIROHUB LTDA [CONFERIR RAZÃO SOCIAL], CNPJ 55.055.533/0002-43, com base no balanço patrimonial do exercício de [ANO], [REGISTRADO / TRANSMITIDO VIA ECD — RECIBO Nº], apresenta os seguintes índices: Liquidez Geral = [ ], Solvência Geral = [ ] e Liquidez Corrente = [ ], atendendo aos mínimos fixados no item [CLÁUSULA] do edital.',
      '[LOCAL], [DATA]. [NOME DO CONTADOR] — CRC [Nº/UF].',
    ], 'info'),
    h1('Campos pendentes'),
    pend([
      ['Valores do balanço (2 exercícios)', 'Contábil', 'Balanço registrado / recibo da ECD'],
      ['Data de constituição da matriz', 'Contábil', 'Contrato social / cartão CNPJ'],
      ['Mínimos e percentual', 'Licitações', 'Cláusula do edital de cada certame'],
      ['Assinatura e CRC', 'Contador responsável', 'Registro no CRC'],
    ]),
  ],
});

// ===================== ITEM 16 =====================
const inv = [];
for (let i = 1; i <= 8; i += 1) inv.push([String(i), '', '', '', '', '', '', '', '', '', '']);
docs.push({
  file: '04_Atestados/Item16_Inventario_Servicos_Prestados_v0.1.docx',
  docTitle: 'Inventário de serviços prestados',
  landscape: true,
  headerText: 'Licitações · Base interna de atestados', footerText: FTR_INT,
  children: [
    eyebrow('ITEM 16 · 04_ATESTADOS · BASE INTERNA (NÃO É DOCUMENTO DE EDITAL)'),
    title('Inventário de serviços prestados'),
    subtitle('O mapa de quem pode atestar o quê. Nada nesta tabela é atestado; é a base para pedir atestados a quem pode emiti-los.'),
    fichaL([
      ['Responsável (checklist)', 'Direção + Técnico'],
      ['Prazo (apresentação à Diretoria)', 'Até 23/10/2026: inventário e lista de atestados possíveis'],
      ['Uso no piloto', 'Condição 1 do Go/No-Go: pelo menos 1 atestado de chatbot ou mensageria com a API oficial do WhatsApp Business (TR 14.6.3 b). Situação hoje: NÃO COMPROVADO'],
    ]),
    spacer(80),
    h1('Regras que valem para cada linha'),
    ...bullets([
      'Só entra serviço que a GiroHub **efetivamente prestou**, com contrato ou nota fiscal que o sustente.',
      'O atestado é emitido pelo cliente, em papel timbrado dele (TR 14.6.3 b). A GiroHub não redige o atestado como se fosse do cliente.',
      'Pode estar em nome da matriz ou da filial (TR 14.6.3.1).',
      'Atestado emitido depois da divulgação do aviso só é aceito com a nota fiscal que comprove o faturamento (TR 14.6.3.2).',
      'O órgão pode pedir o contrato, o endereço atual do contratante e o local da prestação (TR 14.6.3.3).',
      'O serviço deve estar dentro da atividade principal ou secundária do contrato social (TR 14.6.3.4). CNAEs da GiroHub: 6203-1/00, 6209-1/00 e 6311-9/00 (consulta pública; conferir no contrato social).',
      'Atestado de empresa do mesmo grupo pode ser vedado (edital de Jales, item 7.1.5 c) ou questionado em diligência.',
    ], { size: 18 }),
    h1('Inventário'),
    table({
      widths: [400, 1700, 1700, 1500, 1100, 1000, 1100, 1700, 1300, 1300, 1770],
      header: ['#', 'Cliente (razão social e CNPJ)', 'Serviço prestado', 'Tecnologia / integração', 'Período', 'Contrato nº', 'Notas fiscais', 'Contato do emissor (nome, cargo, e-mail)', 'Atestado (existe / a pedir / não cabe)', 'Serve ao CRMV-ES? (TR 14.6.3 b)', 'Evidência (arquivo)'],
      rows: inv, size: 15,
    }),
    h1('Teste rápido para o CRMV-ES (TR 14.6.3 b)'),
    body('Um atestado serve ao piloto só se responder "sim" às cinco perguntas:'),
    table({
      widths: [600, 9970, 4000],
      header: ['#', 'Pergunta', 'Resposta (Direção + Técnico)'],
      rows: [
        ['1', 'O serviço é de atendimento digital, chatbot ou mensageria, de complexidade equivalente ou superior?', '[ ]'],
        ['2', 'A plataforma estava integrada à **API oficial** do WhatsApp Business (não a integração não oficial)?', '[ ]'],
        ['3', 'O emissor é pessoa jurídica de direito público ou privado, cliente real da GiroHub?', '[ ]'],
        ['4', 'O atestado sai em documento timbrado do emissor?', '[ ]'],
        ['5', 'Há contrato e nota fiscal para mostrar se o órgão pedir?', '[ ]'],
      ],
    }),
  ],
});

// ===================== ITEM 21 =====================
docs.push({
  file: '07_Declaracoes/Item21_Declaracao_Conhecimento_Condicoes_CRMV-ES_v0.1.docx',
  docTitle: 'Declaração de conhecimento das condições – CRMV-ES',
  headerText: HDR_EXT, footerText: FTR_EXT,
  children: [
    spacer(200),
    body(ORGAO, { bold: true, after: 40 }),
    body(REF, { after: 400 }),
    p('DECLARAÇÃO DE CONHECIMENTO DAS CONDIÇÕES DA CONTRATAÇÃO', { size: 26, bold: true, color: C.navy, align: AlignmentType.CENTER, after: 40 }),
    p('Termo de Referência, item 14.6.3, alínea "a"', { size: 18, color: C.grey, align: AlignmentType.CENTER, after: 400 }),
    body(`${QUALIF}, **DECLARA**, nos termos do item 14.6.3, alínea "a", do Termo de Referência, que tomou conhecimento de todas as informações e das condições para o cumprimento das obrigações objeto da contratação.`, { align: AlignmentType.JUSTIFIED, line: 320, after: 240 }),
    body('Por ser expressão da verdade, firma a presente declaração.', { after: 120 }),
    ...assinatura([small('[OU, CONFORME A ALTERNATIVA DO ITEM 14.6.3 "a": NOME, FORMAÇÃO E REGISTRO DO RESPONSÁVEL TÉCNICO]', { before: 120 })]),
    ...usoInterno([
      'É o único documento de declaração que o processo pede por escrito (TR 14.6.3 a). As demais declarações são marcações no sistema (Aviso 3.9 e 3.11).',
      'O TR admite duas formas: assinatura do representante legal ou do responsável técnico. Escolha uma e apague a outra linha.',
      'Só assinar depois de a equipe ter lido o Aviso, o TR e a minuta de contrato por inteiro.',
    ], [
      ['Razão social exata', 'Administrativo GiroHub', 'Contrato social consolidado'],
      ['Endereço da filial', 'Administrativo GiroHub', 'Cartão CNPJ da filial'],
      ['Signatário, cargo e CPF', 'Direção (decisão 2 da Diretoria)', 'Contrato social, procuração ou registro do responsável técnico'],
    ]),
  ],
});

// ===================== ITEM 22 =====================
docs.push({
  file: '06_Proposta_Comercial/Item22_Proposta_Comercial_CRMV-ES_v0.1.docx',
  docTitle: 'Proposta comercial – CRMV-ES',
  headerText: HDR_EXT, footerText: FTR_EXT,
  children: [
    spacer(120),
    body('À Agente de Contratação do Conselho Regional de Medicina Veterinária do Estado do Espírito Santo – CRMV-ES', { bold: true, after: 40 }),
    body('Rua Cyro Lima, 125, Enseada do Suá, Vitória/ES, CEP 29050-230', { after: 40 }),
    body(REF, { after: 320 }),
    p('PROPOSTA COMERCIAL AJUSTADA', { size: 28, bold: true, color: C.navy, align: AlignmentType.CENTER, after: 40 }),
    p('Aviso de Contratação Direta, itens 5.6.1 e 5.6.3; Termo de Referência, itens 3 e 4', { size: 17, color: C.grey, align: AlignmentType.CENTER, after: 300 }),
    h1('1. Identificação da proponente'),
    kv([
      ['Razão social', 'GIROHUB LTDA [CONFERIR COM O CONTRATO SOCIAL]'],
      ['CNPJ', '55.055.533/0002-43 (filial) [CONFIRMAR QUE A FILIAL É A PROPONENTE NO SICAF]'],
      ['Endereço', 'Avenida Professor Fernando São Paulo, 398, Ponto Central, Feira de Santana/BA, CEP 44075-045 [CONFERIR]'],
      ['Telefone e e-mail', '[PENDENTE DE VALIDAÇÃO]'],
      ['Representante legal', '[NOME], [CARGO], CPF [PENDENTE DE VALIDAÇÃO], com poderes conforme [CONTRATO SOCIAL / PROCURAÇÃO]'],
      ['Enquadramento', 'Microempresa optante pelo Simples Nacional [CONFIRMAR COM CERTIDÃO DA JUNTA]'],
      ['Dados bancários (TR 12.20)', 'Banco [ ], Agência [ ], Conta corrente [ ]'],
    ], W),
    h1('2. Objeto'),
    body('Prestação de serviço continuado, em regime SaaS, de plataforma de atendimento on-line via web, integrada por meio da API oficial ao WhatsApp Business Platform (Meta), contemplando chatbot inteligente, atendimento humano, gerenciamento dos canais digitais, automação do atendimento inicial e distribuição e encaminhamento de chamados, com implantação, parametrização, treinamento, suporte técnico e manutenção, conforme o Aviso de Contratação Direta nº 51/2026 e seu Termo de Referência (TR 1.1, tabela do item 1.2 e item 3.1).', { align: AlignmentType.JUSTIFIED }),
    h1('3. Preço'),
    table({
      widths: [450, 750, 2438, 1000, 1250, 1150, 1150, 1450],
      header: ['Item', 'CATSER', 'Descrição', 'Licenças', 'Implantação (R$)', 'Mensal (R$)', '24 meses (R$)', 'Total com implantação (R$)'],
      rows: [['01', '26077', 'Plataforma de atendimento com chatbot integrada ao WhatsApp Business pela API oficial (Meta), SaaS, conforme o TR', '[5 a 10 — CONFIRMAR]', '[VALOR]', '[VALOR]', '[MENSAL × 24]', '[IMPLANTAÇÃO + 24 MESES]']],
      size: 16,
    }),
    spacer(80),
    body('**Valor global:** R$ [VALOR] ([VALOR POR EXTENSO]).'),
    body('O valor mensal é fixo e cobre todos os custos da solução: licenciamento, usuários, chatbot, hospedagem, suporte técnico, manutenção, integração com a API oficial do WhatsApp Business e os custos de mensageria da Meta no volume estimado no Termo de Referência (TR 3.8, 3.14.5, 4.1, 4.4 e 4.7). Estão incluídos tributos, encargos e demais despesas diretas e indiretas (Aviso 3.4).', { align: AlignmentType.JUSTIFIED }),
    h1('4. Especificação da solução ofertada'),
    kv([
      ['Plataforma', '[NOME DA SOLUÇÃO E VERSÃO] [PENDENTE — TÉCNICO]'],
      ['Modelo', 'SaaS em ambiente web, acessível por navegador, sem instalação nos computadores do CRMV-ES (TR 3.1 e 3.2 j)'],
      ['Integração', 'Exclusivamente pela API oficial do WhatsApp Business Platform, sem APIs não oficiais, emuladores ou automação do aplicativo (TR 4.11)'],
      ['Parceiro Meta (TR 1.2 e 6.1)', '[SITUAÇÃO COMPROVADA NO CATÁLOGO META BUSINESS PARTNERS OU MODELO ACEITO EM ESCLARECIMENTO] [PENDENTE — BLOQUEANTE]'],
      ['Usuários simultâneos', '[QUANTIDADE], incluindo ao menos 1 perfil administrativo/gerencial (TR 3.5)'],
      ['Hospedagem e backup', 'Nuvem, com backup atualizado das mensagens a partir da habilitação (TR 3.9 e 3.15.16). Provedor: [PENDENTE — TÉCNICO]'],
      ['Proteção de dados', 'Controle de acesso por perfil e mascaramento automático de dados sensíveis (TR 3.15.17). Evidência: [PENDENTE — TÉCNICO]'],
      ['Atendimento ao TR', 'Conforme a matriz de aderência anexa (Anexo I) [ANEXAR SOMENTE APÓS VALIDAÇÃO DO TÉCNICO]'],
    ], W),
    h1('5. Prazos e condições'),
    ...bullets([
      'Solução implantada e operacional em até 30 (trinta) dias da publicação do contrato (TR 6.3).',
      'Treinamento em até 10 (dez) dias úteis da publicação do contrato, gravado e disponibilizado em nuvem (TR 5.6).',
      'Operação contínua, 24 horas por dia, 7 dias por semana (TR 6.2.3 a).',
      'Vigência de 24 (vinte e quatro) meses, prorrogável nos termos do art. 107 da Lei 14.133/2021 (TR 1.5).',
      'Preços fixos e irreajustáveis por 12 meses; após esse prazo, reajuste pelo IPCA (Minuta, cláusula 7).',
      'Pagamento conforme o item 12 do Termo de Referência, por ordem bancária na conta indicada acima.',
      'Validade da proposta: 60 (sessenta) dias, contados da apresentação (Aviso 5.6.1).',
    ]),
    h1('6. Declarações'),
    body('Declaramos que conhecemos e aceitamos as condições do Aviso de Contratação Direta nº 51/2026 e de seus anexos, e que esta proposta não contém alternativa de preço nem qualquer outra condição que induza o julgamento a mais de um resultado (Aviso 5.6.3).', { align: AlignmentType.JUSTIFIED }),
    ...assinatura(),
    ...usoInterno([
      'A proposta inicial é cadastrada no sistema pelo titular da credencial até 21/10/2026, 08h. Este arquivo é a **proposta ajustada** ao lance final, enviada quando a agente de contratação pedir, em no mínimo 2 horas (Aviso 5.6 e 5.6.4).',
      'Os campos de preço só são preenchidos depois de a planilha de custos (Item 23) ser aprovada pelo Financeiro e pela Direção.',
      'A linha "Parceiro Meta" é bloqueante: sem comprovação ou resposta favorável ao esclarecimento, não participar.',
      'O Anexo I (Item 24) só acompanha a proposta depois de o Técnico marcar e comprovar cada requisito.',
      'Nada é cadastrado, lançado ou assinado sem a etapa 5 (Aprovação) concluída e autorização expressa da Direção.',
    ], [
      ['Razão social, endereço, telefone, e-mail', 'Administrativo GiroHub', 'Contrato social e cartão CNPJ'],
      ['Representante e poderes', 'Direção', 'Contrato social ou procuração'],
      ['Dados bancários da filial', 'Financeiro', 'Comprovante bancário'],
      ['Preços (implantação, mensal, total, extenso)', 'Financeiro + Direção', 'Item 23 aprovado'],
      ['Quantidade de licenças', 'Técnico + Financeiro', 'Dimensionamento no Item 23'],
      ['Nome da plataforma, provedor de nuvem', 'Técnico', 'Contrato ou documentação da plataforma'],
      ['Condição de parceiro Meta', 'Técnico + Jurídico', 'Catálogo Meta Business Partners ou resposta ao esclarecimento'],
      ['Evidência de LGPD', 'Técnico', 'Item 27 validado'],
    ]),
  ],
});

// ===================== ITEM 23 =====================
docs.push({
  file: '06_Proposta_Comercial/Item23_Planilha_Custos_Formacao_Preco_CRMV-ES_v0.1.docx',
  docTitle: 'Planilha de custos e formação de preço – CRMV-ES',
  headerText: HDR_INT, footerText: FTR_INT,
  children: [
    eyebrow('ITEM 23 · 06_PROPOSTA_COMERCIAL · USO INTERNO'),
    title('Planilha de custos e formação de preço'),
    subtitle('Exequibilidade do preço mensal fixo do CRMV-ES (Lei 14.133, art. 59; Aviso 5.7.3 e 5.8).'),
    ficha([
      ['Prepara', 'Financeiro'],
      ['Valida', 'Contábil: tributos e caixa'],
      ['Aprova', 'Direção: preço final, margem e lance mínimo'],
      ['Prazo interno', '20/10/2026, antes do Go/No-Go das 17h'],
    ]),
    ...callout(['**Nenhum valor desta planilha foi estimado.** Cada campo em branco depende de um documento de custo real: contrato, fatura, folha, tabela oficial da Meta ou decisão registrada.'], 'warn'),
    h1('1. Tetos do certame'),
    table({
      widths: [4300, 2300, 3038],
      header: ['Referência', 'Valor', 'Fonte'],
      rows: [
        ['Implantação', 'R$ 3.000,00', 'TR 1.2 (tabela)'],
        ['Mensal', 'R$ 1.869,54', 'TR 1.2 (tabela)'],
        ['24 meses (sem implantação)', 'R$ 44.868,96', 'TR 1.2 (tabela)'],
        ['Total estimado', 'R$ 47.868,96', 'TR 1.2 e 15.1'],
      ],
    }),
    small('Não são aceitas propostas acima do valor médio de referência da pesquisa de preços (TR 15.3). Preço inexequível ou sem exequibilidade demonstrada desclassifica (Aviso 5.7.3, 5.7.4 e 5.8).', { before: 80 }),
    h1('2. Volume de referência para dimensionar'),
    table({
      widths: [3600, 2400, 1900, 1738],
      header: ['Grandeza', 'Valor no TR', 'Equivalente em 30 dias*', 'Fonte'],
      rows: [
        ['Contatos recebidos', '30 a 50 por dia; até 80 em pico', '900 a 1.500; até 2.400', 'TR 3.8 e'],
        ['Mensagens individuais enviadas', '5 a 10 por dia', '150 a 300', 'TR 3.8 e'],
        ['Comunicações em lote', 'até 4.000 destinatários por lote', '[FREQUÊNCIA NÃO INFORMADA]', 'TR 3.14.5'],
        ['Usuários simultâneos', '5 a 10, com ao menos 1 administrador', '—', 'TR 3.5'],
      ],
    }),
    small('* Conta simples sobre os números do TR, considerando 30 dias corridos. A frequência dos lotes e a categoria dos modelos (utilidade ou marketing) foram objeto do pedido de esclarecimento, pergunta 3.', { before: 80 }),
    h1('3. Mensageria da Meta (custo por consumo)'),
    body('O modelo de cobrança e as tarifas da Meta para o Brasil devem ser conferidos na tabela oficial vigente na data do cálculo (C2). As variações de tarifa ficam com a contratada e não geram reajuste automático (TR 4.5 e 4.9).'),
    table({
      widths: [3300, 1700, 1900, 1400, 1338],
      header: ['Categoria de mensagem', 'Volume mensal', 'Tarifa vigente (R$)', 'Custo (R$)', 'Fonte da tarifa'],
      rows: [
        ['Atendimento iniciado pelo usuário (serviço)', '[ ]', '[TABELA META]', '[ ]', '[ ]'],
        ['Modelos de utilidade (avisos, lembretes)', '[ ]', '[TABELA META]', '[ ]', '[ ]'],
        ['Modelos de marketing (campanhas)', '[ ]', '[TABELA META]', '[ ]', '[ ]'],
        ['Comunicações em lote (até 4.000 por lote)', '[ ]', '[TABELA META]', '[ ]', '[ ]'],
        [{ t: 'Total mensal de mensageria', bold: true }, '', '', { t: '[ ]', bold: true }, ''],
      ],
    }),
    h1('4. Composição do custo mensal'),
    table({
      widths: [2900, 1300, 2300, 1200, 1938],
      header: ['Componente', 'Natureza', 'Base de cálculo', 'Valor (R$)', 'Fonte do valor'],
      rows: [
        ['Plataforma de atendimento (própria ou licença de terceiro), 5 a 10 usuários', 'Fixo mensal', 'Por usuário ou por pacote', '[ ]', '[CONTRATO OU TABELA]'],
        ['Hospedagem em nuvem e backup', 'Fixo mensal', 'Por ambiente', '[ ]', '[FATURA DO PROVEDOR]'],
        ['Mensageria da Meta (seção 3)', 'Consumo', 'Volume × tarifa', '[ ]', '[SEÇÃO 3]'],
        ['Provedor homologado (BSP), se usado', 'Fixo + consumo', 'Contrato do provedor', '[ ]', '[PROPOSTA DO PROVEDOR]'],
        ['Suporte técnico e manutenção, 24x7', 'Fixo mensal', 'Horas × custo/hora real', '[ ]', '[FOLHA OU CONTRATO]'],
        [{ t: 'Custo direto mensal', bold: true }, '', '', { t: '[ ]', bold: true }, ''],
      ],
    }),
    h1('5. Custo de implantação (parcela única)'),
    table({
      widths: [4200, 2300, 1200, 1938],
      header: ['Atividade (TR 3.6 e 6.2.1)', 'Base de cálculo', 'Valor (R$)', 'Fonte'],
      rows: [
        ['Configuração, parametrização, usuários, setores, filas e permissões', 'Horas × custo/hora', '[ ]', '[TÉCNICO]'],
        ['Integração do número e homologação da linha (TR 5.4)', 'Horas × custo/hora', '[ ]', '[TÉCNICO]'],
        ['Fluxos iniciais do chatbot e templates', 'Horas × custo/hora', '[ ]', '[TÉCNICO]'],
        ['Testes e treinamento gravado (TR 5.6)', 'Horas × custo/hora', '[ ]', '[TÉCNICO]'],
        [{ t: 'Custo direto de implantação', bold: true }, '', { t: '[ ]', bold: true }, ''],
      ],
    }),
    h1('6. Formação do preço'),
    body('Fórmula sugerida (C3, validar com o Financeiro): **Preço = Custo direto ÷ (1 − alíquota efetiva − reserva de risco − margem)**.'),
    table({
      widths: [4300, 1800, 3538],
      header: ['Linha', 'Valor', 'Regra / fonte'],
      rows: [
        ['Alíquota efetiva do Simples Nacional', '[ %]', 'Média dos recolhimentos dos últimos 12 meses (Aviso 3.5) — Contábil'],
        ['Reserva para variação das tarifas da Meta', '[ %]', 'Risco do preço fixo (TR 4.5 e 4.9) — Financeiro'],
        ['Margem', '[ %]', 'Política de preço da GiroHub — Direção'],
        [{ t: 'Preço mensal resultante', bold: true }, '[R$]', 'Precisa ser ≤ R$ 1.869,54'],
        [{ t: 'Preço de implantação resultante', bold: true }, '[R$]', 'Precisa ser ≤ R$ 3.000,00'],
        [{ t: 'Total (implantação + 24 × mensal)', bold: true }, '[R$]', 'Precisa ser ≤ R$ 47.868,96'],
        [{ t: 'Lance mínimo aceitável', bold: true }, '[R$]', 'Custo total + margem mínima. Fica sigiloso no sistema (Aviso 3.12 e 3.12.4) — Direção'],
      ],
    }),
    h1('7. Caixa: quando o dinheiro entra'),
    body('A GiroHub antecipa a implantação e a mensageria. Pelos prazos máximos do TR, sem prorrogação:'),
    table({
      widths: [4600, 2400, 2638],
      header: ['Etapa', 'Prazo máximo', 'Fonte'],
      rows: [
        ['Solução operacional', 'até 30 dias da publicação do contrato', 'TR 6.3'],
        ['Recebimento provisório', 'até 5 dias úteis da cobrança', 'TR 12.1 e 12.1.1'],
        ['Recebimento definitivo', 'até 5 dias úteis do provisório', 'TR 12.4'],
        ['Liquidação', '10 dias úteis da nota fiscal, prorrogável', 'TR 12.8'],
        ['Pagamento', 'até 10 dias úteis da liquidação', 'TR 12.18'],
      ],
    }),
    small('Leitura (C2): somados, os prazos chegam a cerca de 30 dias úteis entre a cobrança e o pagamento. Esse capital de giro entra no cálculo. Optante do Simples não sofre retenção dos tributos do regime, se comprovar a condição (TR 12.23).', { before: 80 }),
  ],
});

// ===================== ITEM 24 =====================
const R = (cl, req, nat, bloq) => [cl, bloq ? { t: `**[BLOQUEANTE]** ${req}` } : req, nat, '', '', '', ''];
const mat = [
  { group: 'A · Condições de fornecimento' },
  R('TR 1.2 (tabela); 6.1', 'Solução fornecida por parceiro homologado da Meta, constante do Catálogo Oficial de Parceiros Confiáveis (Meta Business Partners).', 'Fornecimento', true),
  R('TR 4.11', 'Uso exclusivo da API oficial do WhatsApp Business Platform; vedadas APIs não oficiais, emuladores, automação do aplicativo ou soluções não autorizadas pela Meta.', 'Integração'),
  R('TR 5.12', 'Subcontratação do objeto vedada. (C2: confirmar com o Jurídico como fica o uso de provedor homologado da Meta.)', 'Fornecimento'),
  R('TR 3.1; 6.1', 'Solução omnichannel em ambiente web, modelo SaaS, integrada ao número institucional pela API oficial do WhatsApp Business.', 'Arquitetura'),
  { group: 'B · Plataforma de atendimento (TR 3.2)' },
  R('TR 3.2 a', 'Acesso simultâneo por múltiplos usuários/atendentes.', 'Funcional'),
  R('TR 3.2 b', 'Gerenciamento centralizado das conversas do WhatsApp institucional.', 'Funcional'),
  R('TR 3.2 c', 'Histórico e registro das interações dos usuários.', 'Funcional'),
  R('TR 3.2 d', 'Organização e distribuição das conversas entre setores e atendentes.', 'Funcional'),
  R('TR 3.2 e', 'Gerenciamento de filas de atendimento.', 'Funcional'),
  R('TR 3.2 f', 'Níveis de acesso e permissões para usuários, atendentes e administradores.', 'Segurança'),
  R('TR 3.2 g', 'Painel de acompanhamento e indicadores de atendimento.', 'Funcional'),
  R('TR 3.2 h', 'Relatórios gerenciais e métricas de utilização.', 'Funcional'),
  R('TR 3.2 i', 'Armazenamento e consulta do histórico durante a contratação.', 'Funcional'),
  R('TR 3.2 j', 'Acesso por navegador, sem instalação de software nos computadores.', 'Arquitetura'),
  { group: 'C · Integração com o WhatsApp Business' },
  R('TR 3.3 a', 'Integração do número institucional do CRMV-ES pela API oficial da Meta.', 'Integração'),
  R('TR 3.3 b', 'Configurações de ativação, integração e manutenção do canal oficial; suporte técnico à operação da API.', 'Integração'),
  R('TR 5.4', 'Homologação da linha telefônica junto à plataforma do WhatsApp, sob responsabilidade da contratada.', 'Integração'),
  R('TR 5.5', 'Custos de comunicação do uso do WhatsApp arcados pela contratada.', 'Comercial'),
  { group: 'D · Chatbot e automação (TR 3.4)' },
  R('TR 3.4 a', 'Criação de menus e fluxos de atendimento.', 'Funcional'),
  R('TR 3.4 b', 'Triagem inicial das solicitações.', 'Funcional'),
  R('TR 3.4 c', 'Identificação da demanda do usuário.', 'Funcional'),
  R('TR 3.4 d', 'Respostas automáticas para informações previamente cadastradas.', 'Funcional'),
  R('TR 3.4 e', 'Direcionamento automático para setores, filas ou atendentes.', 'Funcional'),
  R('TR 3.4 f', 'Transferência do atendimento automatizado para atendimento humano.', 'Funcional'),
  R('TR 3.4 g', 'Configuração e alteração dos fluxos pelo CRMV-ES ou com suporte da contratada.', 'Funcional'),
  { group: 'E · Licenças, templates e mensagens' },
  R('TR 3.5', 'Uso simultâneo por 5 a 10 usuários, com ao menos 1 perfil administrativo/gerencial; quantidade ajustável.', 'Comercial'),
  R('TR 3.7', 'Criação, configuração, submissão, aprovação, uso e gestão de templates, conforme regras da Meta.', 'Funcional'),
  R('TR 3.8 a', 'Atendimento das demandas recebidas pelo canal institucional.', 'Funcional'),
  R('TR 3.8 b', 'Envio de mensagens individuais de caráter institucional.', 'Funcional'),
  R('TR 3.8 c', 'Uso de templates aprovados.', 'Funcional'),
  R('TR 3.8 d', 'Comunicações para múltiplos destinatários, observadas as regras da plataforma.', 'Funcional'),
  R('TR 3.8 e', 'Dimensionamento: 30 a 50 contatos por dia (até 80) e 5 a 10 mensagens individuais por dia.', 'Operação'),
  R('TR 3.14.5', 'Suportar comunicações de até 4.000 destinatários por lote, nos limites da Meta.', 'Operação'),
  { group: 'F · Conformidade com as políticas da Meta (TR 3.14)' },
  R('TR 3.14.1', 'Operar conforme políticas, limites, mecanismos de segurança e prevenção de spam da Meta.', 'Operação'),
  R('TR 3.14.2', 'Orientar o CRMV-ES para reduzir risco de bloqueio, restrição ou suspensão do número.', 'Operação'),
  R('TR 3.14.3', 'Recursos de gerenciamento e controle dos envios, respeitando os limites do número.', 'Funcional'),
  R('TR 3.14.4', 'Informar restrições, alterações de limite, indisponibilidades e mudanças de política da Meta.', 'Operação'),
  { group: 'G · Funcionalidades operacionais (TR 3.15)' },
  R('TR 3.15.1', 'Interface responsiva em computadores, smartphones e tablets.', 'Funcional'),
  R('TR 3.15.2', 'Visualizar contatos em espera, atendimentos em andamento, dados do usuário e histórico.', 'Funcional'),
  R('TR 3.15.3', 'Encaminhamento e transferência entre atendentes ou setores.', 'Funcional'),
  R('TR 3.15.4', 'Envio e recebimento de arquivos, imagens, documentos, áudios e vídeos.', 'Funcional'),
  R('TR 3.15.5', 'Mensagens pré-definidas e respostas padronizadas.', 'Funcional'),
  R('TR 3.15.6', 'Classificação por etiquetas, categorias ou tabulações definidas pelo CRMV-ES.', 'Funcional'),
  R('TR 3.15.7', 'Registro e atualização de dados cadastrais dos contatos.', 'Funcional'),
  R('TR 3.15.8', 'Registro dos atendimentos com mensagens, data, horário e atendente, consultável durante a vigência.', 'Funcional'),
  R('TR 3.15.9', 'Pesquisa de satisfação ao final do atendimento, com consolidação e extração.', 'Funcional'),
  R('TR 3.15.10', 'Relatórios e filtros por período, atendente, setor, quantidade, mensagens, satisfação e não concluídos.', 'Funcional'),
  R('TR 3.15.11', 'Consulta, organização e exportação dos dados de contatos e atendimentos.', 'Funcional'),
  R('TR 3.15.12', 'Agendamento e envio de mensagens institucionais, inclusive lembretes, com templates aprovados.', 'Funcional'),
  R('TR 3.15.13', 'Usuários autorizados alteram as próprias credenciais.', 'Segurança'),
  R('TR 3.15.14', 'Gestão de conteúdos, fluxos, categorias, tabulações e parâmetros por usuários autorizados.', 'Funcional'),
  R('TR 3.15.15', 'O agente altera a própria senha.', 'Segurança'),
  R('TR 3.15.16', 'Sistema em nuvem com backup atualizado das mensagens desde a habilitação.', 'Arquitetura'),
  R('TR 3.15.17', 'LGPD: mascaramento automático de dados sensíveis nas telas comuns e controle de acesso por perfil (detalhe no Item 27).', 'Segurança'),
  { group: 'H · Hospedagem, disponibilidade e segurança' },
  R('TR 3.9', 'Infraestrutura em nuvem, hospedagem, manutenção, atualizações, suporte e correção de falhas na vigência.', 'Arquitetura'),
  R('TR 3.12', 'Continuidade e disponibilidade do serviço; suporte para falhas e indisponibilidades.', 'Operação'),
  R('TR 6.2.3 a', 'Disponibilidade em regime contínuo, 24 horas por dia, 7 dias por semana.', 'Operação'),
  R('TR 14.5.4 b', 'Alta disponibilidade, resiliência, redundância, tolerância a falhas e escalabilidade automática. (C2: texto da justificativa; tratado como requisito por cautela.)', 'Arquitetura'),
  R('TR 14.5.4 c', 'Multiusuário simultâneo, sessões concorrentes, controle de filas, balanceamento entre atendentes, múltiplos setores.', 'Funcional'),
  R('TR 14.5.4 d', 'Criptografia em trânsito e em repouso, acesso por perfil, autenticação segura e logs auditáveis (detalhe no Item 27).', 'Segurança'),
  R('TR 14.5.4 e', 'Integração sistêmica via API com sistemas internos e futuros. (O texto cita "CRCTO"; ver esclarecimento, pergunta 4.)', 'Integração'),
  R('TR 14.5.4 f', 'Suporte por níveis de criticidade, resposta a incidentes e manutenção evolutiva (detalhe no Item 26).', 'Operação'),
  { group: 'I · Implantação, capacitação e encerramento (detalhe no Item 26)' },
  R('TR 3.6 a–g', 'Implantação: parametrização, integração do número, usuários, setores, filas, permissões, fluxos, templates, testes e treinamento.', 'Implantação'),
  R('TR 5.6', 'Treinamento em até 10 dias úteis da publicação do contrato, gravado e disponibilizado em nuvem.', 'Implantação'),
  R('TR 6.3', 'Solução implantada e operacional em até 30 dias da publicação do contrato.', 'Implantação'),
  R('TR 9.1.2', 'Manual do usuário em português.', 'Implantação'),
  R('TR 6.10.1', 'Transferência de conhecimento: orientações, treinamento, documentação e suporte durante a subscrição.', 'Encerramento'),
  R('TR 6.10.2 f–g', 'Ao final, disponibilizar todos os dados do CRMV-ES e depois eliminá-los de forma irreversível.', 'Encerramento'),
  R('TR 5.11 a–c', 'Sustentabilidade: eficiência energética, gestão de resíduos eletrônicos, uso otimizado de recursos digitais.', 'Sustentabilidade'),
];
const nReq = mat.filter((r) => Array.isArray(r)).length;
mat.forEach((r, i) => { if (Array.isArray(r)) r.unshift(''); });
let n = 0; mat.forEach((r) => { if (Array.isArray(r)) { n += 1; r[0] = String(n); } });
docs.push({
  file: '05_Proposta_Tecnica/Item24_Matriz_Aderencia_Funcional_CRMV-ES_v0.1.docx',
  docTitle: 'Matriz de aderência funcional – CRMV-ES',
  landscape: true,
  headerText: HDR_INT, footerText: FTR_INT,
  children: [
    eyebrow('ITEM 24 · 05_PROPOSTA_TÉCNICA · ANEXO I DA PROPOSTA (APÓS VALIDAÇÃO)'),
    title('Matriz de aderência funcional ao Termo de Referência'),
    subtitle(`${nReq} requisitos técnicos extraídos do TR 6/2026 do CRMV-ES, com cláusula. Os campos de atendimento e evidência são do Técnico.`),
    fichaL([
      ['Fonte', 'Anexo I – Termo de Referência do Aviso nº 51/2026, baixado do PNCP em 16/10/2026 (itens 1 a 14). Sem retificação registrada até a consulta.'],
      ['Responsável (checklist)', 'Técnico'],
      ['Regra de preenchimento', 'Atende? = S, N ou Parcial. Requisito sem evidência = NÃO COMPROVADO. Só anexar à proposta (Aviso 5.6.3) depois de validada.'],
    ]),
    ...callout(['**Bloqueante:** linha 1 (parceiro homologado da Meta). O outro bloqueante do piloto, o atestado, está no Item 16.'], 'stop'),
    table({
      widths: [400, 1250, 5100, 1150, 900, 2970, 1700, 1100].map((x, i) => x),
      header: ['#', 'Cláusula', 'Requisito do TR (resumo fiel)', 'Natureza', 'Atende? (S/N/P)', 'Como a solução atende', 'Evidência (print, vídeo, doc)', 'Obs.'],
      rows: mat, size: 15,
    }),
  ],
});

// ===================== ITEM 26 =====================
docs.push({
  file: '05_Proposta_Tecnica/Item26_Plano_Implantacao_SLA_Suporte_CRMV-ES_v0.1.docx',
  docTitle: 'Plano de implantação, SLA e suporte – CRMV-ES',
  headerText: HDR_INT, footerText: FTR_INT,
  children: [
    eyebrow('ITEM 26 · 05_PROPOSTA_TÉCNICA'),
    title('Plano de implantação, níveis de serviço e suporte'),
    subtitle('Como a GiroHub implanta, opera e encerra o serviço dentro dos prazos do TR do CRMV-ES.'),
    ficha([
      ['Responsável (checklist)', 'Técnico'],
      ['Fonte', 'TR itens 3.6, 5, 6, 7 e 14.5.4; Minuta de contrato'],
      ['Camada', 'C1 para prazos do TR; C3 para a estrutura de SLA proposta (recomendação a validar)'],
    ]),
    legenda(),
    h1('1. Cronograma de implantação'),
    body('D0 = data de publicação do contrato. Os prazos-limite são do TR; as datas internas são do Técnico.'),
    table({
      widths: [3300, 2300, 1700, 2338],
      header: ['Marco', 'Prazo-limite (TR)', 'Data interna', 'Responsável'],
      rows: [
        ['Reunião inicial; apresentação do preposto; entrega do Termo de Compromisso e dos Termos de Ciência', 'até 2 dias úteis (TR 7.9, 7.5 e 7.10)', '[ ]', '[ ]'],
        ['Ativação da plataforma em ambiente web', 'dentro dos 30 dias (TR 6.2.1 a)', '[ ]', '[ ]'],
        ['Integração do número à API oficial e homologação da linha', 'dentro dos 30 dias (TR 6.2.1 b; 5.4)', '[ ]', '[ ]'],
        ['Perfis de acesso, setores, filas e regras de distribuição', 'dentro dos 30 dias (TR 6.2.1 c e e; 3.6 c)', '[ ]', '[ ]'],
        ['Fluxos iniciais do chatbot (URA digital)', 'dentro dos 30 dias (TR 6.2.1 d; 3.6 d)', '[ ]', '[ ]'],
        ['Templates submetidos e aprovados pela Meta', 'dentro dos 30 dias (TR 3.6 e; 3.7)', '[ ]', '[ ]'],
        ['Testes técnicos, funcionais e de integração', 'dentro dos 30 dias (TR 6.2.1 f; 3.6 f)', '[ ]', '[ ]'],
        ['Treinamento, gravado e disponibilizado em nuvem', 'até 10 dias úteis (TR 5.6; 6.2.1 g)', '[ ]', '[ ]'],
        [{ t: 'Solução implantada e operacional', bold: true }, { t: 'até 30 dias (TR 6.3)', bold: true }, '[ ]', '[ ]'],
        ['Operação assistida: acompanhamento, ajustes de fluxos e roteamento, correções, monitoramento da API, aceite', 'após a ativação (TR 6.2.2 a–e)', '[DURAÇÃO]', '[ ]'],
        ['Recebimento provisório e definitivo', '5 + 5 dias úteis (TR 6.5, 6.7; 12.1, 12.4)', '—', 'Fiscal do CRMV-ES'],
      ],
    }),
    ...callout(['**Risco de prazo (C2):** a homologação da linha e a aprovação dos templates dependem da Meta, fora do controle da GiroHub. Qualquer restrição deve ser comunicada ao CRMV-ES (TR 3.14.4), e o atraso, justificado com antecedência de 24 horas (TR 9.1.4).'], 'warn'),
    h1('2. Níveis de serviço (SLA)'),
    ...callout(['**O TR não fixa números de SLA.** Ele exige operação 24x7 (TR 6.2.3 a) e suporte por níveis de criticidade (TR 14.5.4 f). O que a GiroHub propuser pode ser usado para medir o serviço e aplicar descontos ou glosas (TR 12.2 III, 12.2.1 e 12.30). Só prometer o que a operação real sustenta (C3).'], 'warn'),
    table({
      widths: [1300, 3400, 1700, 1700, 1538],
      header: ['Severidade', 'Definição proposta (C3)', 'Primeira resposta', 'Solução ou contorno', 'Canal'],
      rows: [
        ['1 · Crítica', 'Plataforma ou integração com o WhatsApp indisponível para todos os usuários', '[ ]', '[ ]', '[ ]'],
        ['2 · Alta', 'Função essencial degradada: filas, chatbot, envio de templates ou relatórios', '[ ]', '[ ]', '[ ]'],
        ['3 · Média', 'Falha pontual com alternativa de contorno', '[ ]', '[ ]', '[ ]'],
        ['4 · Baixa', 'Dúvida, ajuste de configuração ou pedido de melhoria evolutiva', '[ ]', '[ ]', '[ ]'],
      ],
    }),
    spacer(80),
    kv([
      ['Disponibilidade mensal', '[ %] — só com base no histórico real do provedor e da plataforma'],
      ['Janela de manutenção programada', '[DIA/HORÁRIO], com aviso prévio de [ ]'],
      ['Horário de atendimento humano do suporte', '[ ] (a plataforma opera 24x7; o canal de suporte precisa ser definido)'],
      ['Canais de suporte', '[TELEFONE / E-MAIL / PORTAL]'],
    ], W),
    h1('3. Manutenção'),
    ...bullets([
      'Corretiva, preventiva e evolutiva durante toda a vigência (TR 5.1, 5.8 e 6.2.3 e).',
      'Customizações e parametrização incluídas no escopo (TR 5.1).',
      'Atualizações e correção de falhas na infraestrutura em nuvem (TR 3.9).',
    ]),
    h1('4. Conformidade com a Meta'),
    ...bullets([
      'Operar dentro das políticas, limites e regras antispam da Meta (TR 3.14.1).',
      'Orientar o CRMV-ES para reduzir o risco de bloqueio do número institucional (TR 3.14.2).',
      'Informar restrições, mudanças de limite, indisponibilidades e mudanças de política (TR 3.14.4).',
      'Periodicidade do relatório de conformidade: [ ].',
    ]),
    h1('5. Relatórios'),
    body('Relatórios gerenciais e operacionais periódicos (TR 6.2.3 g), com os filtros do TR 3.15.10. Periodicidade proposta: [MENSAL / OUTRA]. Conteúdo mínimo: [ ].'),
    h1('6. Equipe e preposto'),
    table({
      widths: [2600, 3400, 3638],
      header: ['Função', 'Nome', 'Comprovação de capacitação (TR 5.9)'],
      rows: [
        ['Preposto (TR 7.5)', '[ ]', '[ ]'],
        ['Responsável pela implantação', '[ ]', '[ ]'],
        ['Suporte técnico', '[ ]', '[ ]'],
        ['Responsável pela integração com a Meta', '[ ]', '[ ]'],
      ],
    }),
    h1('7. Encerramento e transição'),
    ...bullets([
      'Transferência de conhecimento: orientações de uso e administração, treinamento remoto, documentação de procedimentos e suporte durante a subscrição (TR 6.10.1).',
      'Antes do fim da vigência: entregar credenciais e acessos, manter a continuidade até a substituição, entregar relatórios finais de utilização, segurança e manutenção, orientar a transição (TR 6.10.2 a–e).',
      'Disponibilizar todos os dados do CRMV-ES para transferência (HD externo ou links) e, depois, eliminá-los de forma irreversível (TR 6.10.2 f e g). Detalhe no Item 27.',
      'Entregar manual do usuário em português (TR 9.1.2).',
    ]),
    h1('Campos pendentes'),
    pend([
      ['Datas internas e duração da operação assistida', 'Técnico', 'Plano de trabalho com equipe alocada'],
      ['Tempos de SLA e disponibilidade', 'Técnico (aprovação da Direção)', 'Histórico real da plataforma e contrato do provedor'],
      ['Canais e horário de suporte', 'Técnico', 'Estrutura de suporte existente'],
      ['Nomes da equipe e do preposto', 'Técnico + Direção', 'Vínculo e capacitação comprovados'],
      ['Periodicidade dos relatórios', 'Técnico', 'Capacidade da plataforma'],
    ]),
  ],
});

// ===================== ITEM 27 =====================
const L27 = (cl, ex, resp = 'Técnico') => [cl, ex, '', '', resp, 'NÃO COMPROVADO'];
const lg = [
  { group: 'A · Proteção de dados na plataforma' },
  L27('TR 3.10; 5.7', 'Observar a LGPD, com medidas técnicas e administrativas adequadas à proteção dos dados.'),
  L27('TR 3.15.17', 'Coleta, tráfego e armazenamento conforme a LGPD, com mascaramento automático de dados sensíveis nas telas comuns.'),
  L27('TR 3.15.17; 3.2 f', 'Controle de acesso baseado em perfis de usuário.'),
  L27('TR 14.5.4 d', 'Criptografia dos dados em trânsito e em repouso.'),
  L27('TR 14.5.4 d', 'Autenticação segura.'),
  L27('TR 14.5.4 d; Minuta 10.12', 'Logs auditáveis: registro individual rastreável de cada tratamento, com acesso, data, horário e finalidade (LGPD, art. 37).'),
  L27('TR 3.15.13; 3.15.15', 'Usuários alteram as próprias credenciais e senha.'),
  L27('TR 3.15.16', 'Backup atualizado das mensagens desde a habilitação.'),
  L27('Minuta 10.12.1', 'Bancos de dados em formato interoperável.'),
  { group: 'B · Uso e compartilhamento' },
  L27('TR 10.2; 10.3; Minuta 10.2', 'Usar os dados só para as finalidades do CRMV-ES e da execução do contrato.'),
  L27('TR 10.4 c; Minuta 10.3', 'Não repassar, vender ou ceder dados a terceiros, salvo o envio à plataforma WhatsApp Business.'),
  L27('TR 10.4 d', 'Não permitir acesso de pessoas, sistemas ou instituições não autorizadas.'),
  L27('Minuta 10.6', 'Informar ao CRMV-ES, em 5 dias úteis, todos os contratos de suboperação. (C2: provedor de nuvem e, se houver, provedor homologado da Meta.)', 'Técnico + Jurídico'),
  L27('Minuta 10.9', 'Exigir de suboperadores o cumprimento da cláusula de LGPD.', 'Técnico + Jurídico'),
  { group: 'C · Sigilo e pessoas' },
  L27('TR 3.11; 9.1.10', 'Sigilo absoluto sobre dados e informações conhecidos na execução.'),
  L27('Minuta 10.8', 'Orientar e treinar os empregados sobre deveres e responsabilidades da LGPD.'),
  { group: 'D · Incidentes' },
  L27('TR 10.4 e', 'Comunicar imediatamente ao CRMV-ES e à ANPD incidente de segurança com risco ou dano relevante ao titular.'),
  { group: 'E · Prestação de contas' },
  L27('Minuta 10.10', 'Atender diligência do CRMV-ES para aferir o cumprimento da cláusula de LGPD.'),
  L27('Minuta 10.11', 'Prestar informações sobre os dados pessoais, inclusive sobre descarte.'),
  { group: 'F · Fim do contrato' },
  L27('TR 6.10.2 f', 'Disponibilizar todos os dados do CRMV-ES para transferência, por HD externo ou links.'),
  L27('TR 6.10.2 g; Minuta 10.7', 'Após a transferência, excluir dados e configurações de forma irreversível (ressalvadas as hipóteses do art. 16 da LGPD).'),
  L27('TR 6.10.2 b e d', 'Entregar credenciais e acessos; fornecer relatórios finais de utilização, segurança e manutenção.'),
];
let k = 0; lg.forEach((r) => { if (Array.isArray(r)) { k += 1; r.unshift(String(k)); } });
docs.push({
  file: '05_Proposta_Tecnica/Item27_Matriz_LGPD_Seguranca_CRMV-ES_v0.1.docx',
  docTitle: 'Matriz LGPD e segurança da informação – CRMV-ES',
  landscape: true,
  headerText: HDR_INT, footerText: FTR_INT,
  children: [
    eyebrow('ITEM 27 · 05_PROPOSTA_TÉCNICA'),
    title('Matriz LGPD e segurança da informação'),
    subtitle(`${k} exigências de proteção de dados e segurança do TR e da minuta de contrato do CRMV-ES, cada uma com a medida e a prova que a GiroHub precisa ter.`),
    fichaL([
      ['Fonte', 'TR itens 3, 6.10, 9, 10 e 14.5.4; Minuta de contrato, cláusula décima (LGPD). PNCP, 16/10/2026.'],
      ['Responsável (checklist)', 'Técnico + Jurídico'],
      ['Regra', 'A matriz só vale com políticas e controles reais da GiroHub. Sem documento, o status fica NÃO COMPROVADO.'],
    ]),
    ...callout(['**Ponto de leitura jurídica (C2):** a subcontratação é vedada (TR 5.12), mas a minuta prevê suboperadores de dados (cláusulas 10.6 e 10.9). Confirmar com o Jurídico (parceria Fernando Vieira Advogados) como enquadrar o provedor de nuvem e um eventual provedor homologado da Meta.'], 'warn'),
    table({
      widths: [400, 1500, 4400, 3300, 2300, 1300, 1370],
      header: ['#', 'Cláusula', 'Exigência', 'Medida ou controle da GiroHub', 'Evidência', 'Responsável', 'Status'],
      rows: lg, size: 15,
    }),
    h1('Documentos de apoio que a GiroHub precisa ter'),
    table({
      widths: [5200, 3000, 3200, 3170],
      header: ['Documento', 'Existe?', 'Arquivo / versão', 'Responsável'],
      rows: [
        ['Política de privacidade e proteção de dados', '[ ]', '[ ]', 'Técnico + Jurídico'],
        ['Política de segurança da informação', '[ ]', '[ ]', 'Técnico'],
        ['Plano de resposta a incidentes (com comunicação à ANPD)', '[ ]', '[ ]', 'Técnico + Jurídico'],
        ['Registro das operações de tratamento (LGPD, art. 37)', '[ ]', '[ ]', 'Técnico'],
        ['Lista de suboperadores (nuvem, provedor Meta) e contratos', '[ ]', '[ ]', 'Técnico + Jurídico'],
        ['Termo de confidencialidade da equipe', '[ ]', '[ ]', 'Jurídico'],
        ['Procedimento de exportação e eliminação de dados no fim do contrato', '[ ]', '[ ]', 'Técnico'],
      ],
    }),
  ],
});


const PASTA = { '07_Declaracoes': '07_Declarações', '03_Economico_Financeira': '03_Econômico_Financeira', '04_Atestados': '04_Atestados', '05_Proposta_Tecnica': '05_Proposta_Técnica', '06_Proposta_Comercial': '06_Proposta_Comercial' };
const MODELOS = Object.fromEntries(docs.map((d) => {
  const [pasta, nome] = d.file.split('/');
  const num = Number(nome.match(/^Item(\d+)_/)[1]);
  return [num, { ...d, num, pasta: PASTA[pasta], nome }];
}));

/** Números do checklist que têm modelo Word do piloto CRMV-ES. */
export const NUMS_COM_MODELO = Object.keys(MODELOS).map(Number);

/** Gera o .docx do item do checklist (piloto CRMV-ES, versão 0.1). */
export async function gerarModelo(num) {
  const m = MODELOS[num];
  if (!m) return null;
  const buffer = await build({ ...m });
  return { nome: m.nome, pasta: m.pasta, buffer, titulo: m.docTitle };
}
