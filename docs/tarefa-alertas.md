# Tarefa agendada: alertas de vencimento (rascunho para ativar após o setup)

**Agenda:** todos os dias às 07h52 (horário de Brasília). Às segundas, inclui o resumo semanal.
**Remetente e destinatário:** licitacao@girohub.com.br.
**Pré-requisitos:** conectores Gmail e Google Drive/Sheets do Claude ligados à conta licitacao@girohub.com.br; `SHEET_ID` informado.

## Texto da tarefa (prompt)

> Você cuida dos alertas de vencimento do checklist mestre de licitações da GiroHub.
>
> 1. Leia a aba **Documentos** da planilha `SHEET_ID=<preencher>`. Use as colunas `id`, `item`, `responsavel`, `status`, `data_emissao`, `validade_dias`, `vence_em`, `dias_restantes` e `alerta`. Ignore as linhas com status "Não se aplica" e as sem `vence_em`.
> 2. Hoje é a data atual no fuso America/Sao_Paulo. Um documento entra no aviso de hoje quando `dias_restantes` é exatamente 30, 15, 7, 1 ou 0. Os vencidos (negativos) entram apenas no resumo de segunda-feira.
> 3. Leia a aba **Alertas_enviados**. Não reenvie um par (documento_id, marco_dias) que já tenha sido enviado para o mesmo `vence_em`.
> 4. Se houver avisos novos, envie **um único e-mail** de licitacao@girohub.com.br para licitacao@girohub.com.br:
>    - **Assunto:** `[Licitações] Documentos vencendo — <dd/mm/aaaa>`.
>    - **Corpo:** uma tabela com Documento, Vence em, Dias restantes e Responsável, ordenada do mais urgente para o menos urgente, mais o link do sistema.
>    - **Tom:** objetivo, sem alarme.
> 5. Às **segundas-feiras**, envie também o resumo semanal, mesmo sem avisos novos:
>    - conformidade geral (Validados no prazo ÷ total sem "Não se aplica");
>    - lista de vencidos;
>    - o que vence nos próximos 30 dias;
>    - itens com validade e sem data de emissão.
> 6. Para cada aviso enviado, acrescente uma linha na aba Alertas_enviados: `documento_id`, `marco_dias`, `vence_em`, `enviado_em` (ISO) e `destinatario`.
> 7. Nunca altere as abas Documentos e Historico. Nunca invente datas: se uma linha estiver incompleta, cite-a no resumo de segunda como "sem data".
