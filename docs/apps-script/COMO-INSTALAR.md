# Alertas por e-mail · instalar o script na planilha

**Quando fazer:** logo depois do `npm run google:setup`, que é o passo que cria a planilha.
**Conta:** licitacao@girohub.com.br. O e-mail sai DE licitacao@ PARA licitacao@.
**Tempo:** cerca de 5 minutos, uma vez só.

## Passo a passo

1. Abra a planilha **"Checklist Mestre – Licitações GiroHub (Sistema)"** logado como licitacao@girohub.com.br. O link aparece no final do `npm run google:setup`.
2. Vá em **Extensões → Apps Script**.
3. Apague o conteúdo do arquivo `Código.gs` e cole **todo** o conteúdo de `docs/apps-script/Alertas.gs`.
4. Clique no ícone de disquete (**Salvar**). Se quiser, renomeie o projeto para "Alertas de vencimento".
5. Na barra de cima, escolha a função **`instalar`** e clique em **Executar**.
   - O Google vai pedir autorização. Clique em **Revisar permissões** e escolha licitacao@girohub.com.br.
   - Se aparecer **"O Google não verificou este app"**, clique em **Avançado → Acessar Alertas de vencimento (não seguro)**. O aviso aparece porque o script é seu, feito para a sua conta. Depois clique em **Permitir**.
   - As permissões pedidas são: ler a planilha, enviar e-mail em seu nome e rodar no horário agendado.
6. Escolha a função **`testarEnvio`** e clique em **Executar**. Em até 1 minuto deve chegar em licitacao@ um e-mail com o assunto começando por **[TESTE]**, trazendo o resumo atual.
7. Pronto. A partir daí ele roda **todo dia entre 7h e 8h**.

## Como funciona

- **Envio do aviso:** o script manda o e-mail quando algum documento chega a **30, 15, 7 ou 1 dia** do vencimento, ou no **próprio dia**.
- **Resumo de segunda:** toda **segunda-feira** vai o resumo semanal, mesmo sem avisos novos. Ele traz a conformidade geral, os vencidos, o que vence em 30 dias e os documentos com validade mas sem data de emissão.
- **Sem repetição:** cada aviso enviado é anotado na aba **Alertas_enviados** e não sai duas vezes. Se o documento for renovado, a data de vencimento muda e os avisos voltam a valer para o novo prazo.
- **Silêncio:** em dia sem aviso novo e que não seja segunda, nenhum e-mail é enviado.

## Ajustes (no topo do script, bloco CONFIGURAÇÃO)

- **`destinatarios`:** para incluir o Olávio ou outra pessoa, separe os endereços por vírgula.
- **`linkSistema`:** coloque o endereço da Vercel depois do deploy. O e-mail passa a ter o botão "Abrir o sistema".
- **`horaEnvio`:** troque a hora do envio e rode **`instalar`** de novo para valer.

## Se algo der errado

- No Apps Script, a seção **Execuções**, no menu da esquerda, mostra cada rodada e o erro, se houver.
- O erro **"Coluna ... não encontrada"** significa que alguém renomeou uma coluna da aba Documentos. Volte o nome original.
- Para parar os alertas, vá em **Acionadores**, no menu da esquerda (ícone de relógio), e exclua o acionador de `enviarAlertas`.
