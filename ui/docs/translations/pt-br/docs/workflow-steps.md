---
title: Configurar etapas do fluxo de trabalho de aprovação de documentos
description: Configure as etapas de aprovação em ordem ou deixe vários revisores agirem em uma única etapa. Escolha todo ou qualquer responsável, assinaturas, comentários e anexos necessários.
---
# Configurar etapas do fluxo de trabalho de aprovação de documentos {#configure-workflow-steps}

Um fluxo de trabalho de aprovação define quem atua em um documento e em que ordem. Um **responsável** é uma pessoa ou equipe designada para uma etapa. As etapas são executadas uma após a outra. Vários responsáveis podem agir na mesma etapa.

Use **Add step** para criar outra etapa, os controles de seta para alterar sua ordem e o botão remover para excluí-la.

## Aprovações sequenciais e paralelas {#sequential-and-parallel-approvals}

Use etapas separadas quando uma decisão precisar vir antes de outra. Esta é uma **aprovação sequencial**. Por exemplo, um revisor aprova uma proposta na etapa 1 e, em seguida, um cliente assina na etapa 2.

Coloque as pessoas na mesma etapa quando elas puderem revisar ao mesmo tempo. Esta é uma **aprovação paralela** dentro dessa etapa. As etapas ainda são executadas em ordem.

| Você precisa… | Configure o fluxo de trabalho desta forma |
| --- | --- |
| Um revisor, seguido por outro | Adicione uma etapa separada para cada revisor |
| Dois revisores que devem aprovar ambos | Adicione ambos a uma etapa e ative **All assignees must complete** |
| Aprovação de qualquer uma de várias pessoas | Adicione-os a uma etapa e deixe **All assignees must complete** desativado |
| Aprovação seguida de assinatura desenhada | Adicione uma etapa **Approve** e, em seguida, uma etapa **Sign** com **Require an electronic signature** ativado |

## Escolha uma ação e participantes {#choose-an-action-and-participants}

Em cada etapa, selecione uma **Action** e escreva **Instructions** claras. As ações disponíveis são Approve, Sign, Confirm, Acknowledge, Review, Verify, Accept e Complete. Escolha a que corresponde à decisão que precisa registrar.

Adicione responsáveis por e-mail e verifique os nomes e endereços exibidos antes de enviar.

!!! info "Destinatários da organização"
    Em uma organização, selecione **Employee** ou **Team** para atribuir trabalhar dentro da organização atual. Esses tipos de destinatários não estão disponíveis em Personal.

## Exigir que todos ou qualquer destinatário {#require-everyone-or-any-assignee}

Ative **All assignees must complete** para exigir uma resposta bem-sucedida de todos os destinatários. Com esta opção desativada, uma resposta bem-sucedida conclui a etapa e ignora as outras tarefas pendentes. A opção aparece quando uma etapa tem vários responsáveis ou uma atribuição de equipe.

Uma decisão negativa interrompe a solicitação com um resultado malsucedido, mesmo quando **All assignees must complete** está desabilitado. A opção não permite que outros responsáveis substituam uma rejeição.

Por exemplo, use uma etapa para dois revisores que devem agir, seguida por uma etapa de assinatura separada. Use a opção de qualquer destinatário quando um participante disponível puder fornecer a decisão necessária.

## Requisitos adicionais {#additional-requirements}

As seções **Additional requirements** e **Visibility** permanecem visíveis em cada etapa durante a criação ou revisão de uma solicitação ou edição de um modelo. Revise as configurações antes de salvar ou enviar.

Ative os requisitos que o participante deve atender:

- **Require a comment** para coletar uma explicação.
- **Require an electronic signature** para coletar detalhes de assinatura e uma assinatura desenhada.
- **Require an attachment** para coletar um arquivo de resposta.

O rótulo da ação e o requisito de assinatura eletrônica são configurações separadas. Habilite o requisito de assinatura quando uma assinatura desenhada for necessária. Revise os requisitos juntamente com a ação selecionada para que os participantes saibam o que fornecer. Consulte [Concluir uma tarefa](complete-a-task.md).

## Visibilidade da etapa {#step-visibility}

O solicitante e os destinatários diretos de uma etapa sempre podem ver essa etapa, incluindo os destinatários de e-mail. **Visibility** controla quem mais pode ver seus detalhes e anexos de resposta:

| Configuração | Público adicional |
| --- | --- |
| All participants | Participantes com acesso à solicitação |
| Assignees and organization participants | Participantes da organização; disponível para fluxos de trabalho de organização |
| Assignees only | Nenhum participante adicional |

As atribuições de e-mail permanecem no espaço de trabalho Personal do destinatário, mesmo quando o e-mail pertence a um funcionário da organização. As etapas atribuídas permanecem visíveis no fluxo de trabalho, disponíveis para bate-papo por etapas e incluídas no registro de resultado do destinatário.

Essas configurações não concedem associação ao espaço de trabalho ou acesso a solicitações não relacionadas. Escolha uma configuração restrita quando outros participantes não precisarem dos detalhes da etapa.

## Revisões {#revisions}

Ao [reenviar uma solicitação](track-requests.md), revise e edite as etapas da nova revisão. Seu fluxo de trabalho recomeça desde a primeira etapa; as decisões anteriores permanecem registradas na revisão anterior e seus recebimentos. Para fluxos de trabalho organizacionais usados com frequência, salve as etapas como um [modelo](templates.md).
