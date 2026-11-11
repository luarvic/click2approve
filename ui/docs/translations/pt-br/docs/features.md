---
title: Recursos de aprovação de documentos e acesso ao espaço de trabalho
description: Veja quais recursos do Click2Approve funcionam em espaços de trabalho pessoais e organizacionais, incluindo etapas de aprovação, assinaturas, equipes, modelos e registros de resultado.
---
# Recursos de aprovação de documentos e acesso ao espaço de trabalho {#features-and-availability}

Click2Approve combina revisão de documentos, etapas de aprovação, assinaturas eletrônicas e rastreamento de solicitações. Use **Personal**, seu espaço de trabalho para suas próprias solicitações e tarefas endereçadas por e-mail, para trabalho individual. Use um espaço de trabalho da organização para fluxos de trabalho de negócios compartilhados. Seu espaço de trabalho, função e plano determinam quais ações você pode realizar.

Você também pode conectar suas próprias ferramentas por meio do Click2Approve API. Consulte [Tokens API](api-tokens.md) para criar credenciais e autenticar solicitações de integração.

!!! info "Somente organização"
    Funcionários, equipes, delegações e modelos de fluxo de trabalho pertencem a organizações. Selecione uma organização no seletor de workspace para usá-la. Outros recursos deste guia também estão disponíveis no Personal.

## Como funciona a aprovação de documentos {#how-document-approval-works}

1. [Crie uma solicitação](create-a-request.md) com os documentos e instruções.
2. [Configurar etapas do fluxo de trabalho](workflow-steps.md) para escolher quem atua e em que ordem. Várias pessoas podem revisar na mesma etapa.
3. Os participantes abrem **Tasks** para [registrar suas decisões](complete-a-task.md). Uma etapa pode exigir um comentário, uma assinatura eletrônica ou um arquivo de resposta.
4. Abra **Requests** para [verificar o progresso](track-requests.md). Quando a solicitação termina, os [registros de resultado](receipts.md) preservam o resultado e as ações registradas.

Por exemplo, dois revisores podem avaliar uma proposta na primeira etapa. O cliente pode adicionar sua assinatura em uma etapa posterior. Ative **Require an electronic signature** nessa etapa se precisar de uma assinatura desenhada.

## Referência do espaço de trabalho {#workspace-reference}

| Recurso | Personal | Organização |
| --- | --- | --- |
| Requests, tarefas, etapas ordenadas e destinatários de e-mail | Disponível | Disponível |
| Comentários e assinaturas eletrônicas obrigatórias | Disponível | Disponível |
| Discussões e anexos de discussão | Disponível | Disponível |
| Anexos de resposta de tarefa | Disponível | Disponível |
| Solicitar revisões | Disponível para solicitações elegíveis | Disponível para solicitações qualificadas |
| Funcionários e cessionários | — | Disponível |
| Equipes e responsáveis pelas equipes | — | Disponível |
| Delegations | — | Disponível |
| Modelos de fluxo de trabalho | — | Crie seus próprios modelos e reutilize modelos compartilhados dentro da organização |
| Registros de resultado e links de verificação | Visualize, compartilhe e exclua registros de resultado emitidos para você | Cada membro pode visualizar, compartilhar e excluir registros de resultado emitidos para eles |
| Plans, uso e retenção | Gerencie seu próprio plano e configurações | Proprietários e administradores gerenciam o plano e as configurações |
| Profile, assinatura salva, MFA, chaves de acesso e tokens API | Configurações da conta | As mesmas configurações de conta em todos os espaços de trabalho |

## Permissões da organização {#organization-permissions}

Os membros podem visualizar diretórios de funcionários, equipes e delegações. Proprietários e administradores gerenciam funcionários, equipes, delegações, cobrança e retenção. Os modelos são privados por padrão; seus criadores podem compartilhá-los para que outros membros da organização os visualizem e usem. Somente o criador pode editar ou excluir um modelo. O acesso ao registro de resultado é limitado ao usuário para o qual cada registro de resultado é emitido. Somente o Proprietário pode agendar a exclusão da organização.

O acesso a uma solicitação ou tarefa depende da participação, do relacionamento da equipe e da delegação. A associação à organização por si só não expõe todos os fluxos de trabalho nem concede acesso aos registros de outra organização.

Consulte [Funcionários e funções](employees.md) para referência de função e [Uso e limites](usage.md) para restrições do plano. Abra **Plans** para ver suas franquias atuais e opções de planos disponíveis.
