---
title: Crie uma solicitação de aprovação de documento
description: Envie documentos para aprovação em Click2Approve. Adicione arquivos, escolha revisores, defina etapas do fluxo de trabalho e envie uma solicitação do Pessoal ou de uma organização.
---
# Crie uma solicitação de aprovação de documento {#create-a-request}

Para enviar um documento para aprovação, crie uma **solicitação**. Ele contém os arquivos para revisão, instruções e etapas que informam a cada participante o que fazer. Você pode solicitar aprovação, revisão ou assinatura eletrônica.

Escolha primeiro o espaço de trabalho correto. Use **Personal**, seu espaço de trabalho para suas próprias solicitações, para enviar trabalho em seu próprio nome. Selecione uma organização para enviar trabalho em seu nome. Seu espaço de trabalho determina quem é o proprietário da solicitação e quais tipos de destinatários você pode usar. Um **designado** é uma pessoa ou equipe a quem você pede para agir em uma etapa.

## Redija a solicitação {#compose-the-request}

1. [Abra o aplicativo](/app/), selecione seu espaço de trabalho e escolha **New request** na parte superior do grupo **Work** no menu principal.
2. Em uma organização, escolha **Custom** ou **From template**. Para um modelo, selecione-o e prossiga para o editor de solicitações.
3. Insira um **Title** específico, como “Aprovar o contrato de fornecedor atualizado”.
4. Adicione um **Description** explicando o propósito, o contexto e o resultado esperado.
5. Anexe os [arquivos que os participantes devem revisar](files.md).
6. Adicione e configure as [etapas do fluxo de trabalho](workflow-steps.md).

O cartão **Request details** agrupa o título,**Files to review** e a descrição. Configure as etapas do fluxo de trabalho abaixo dele.

As solicitações Personal usam destinatários de e-mail.

!!! info "Destinatários da organização"
    Em uma organização, você também pode atribuir etapas a funcionários e equipes dessa organização.

## Exemplo: envie uma proposta para aprovação e assinatura {#example-send-a-proposal-for-approval-and-signature}

1. Adicione a proposta em **Files to review**.
2. Adicione uma etapa com **Action** definido como **Approve** e adicione o endereço de e-mail do revisor.
3. Escolha **Add step** e defina seu **Action** como **Sign**. Adicione o endereço de e-mail do cliente e ative **Require an electronic signature**.
4. Escreva **Instructions** para cada etapa para que ambas as pessoas saibam o que verificar.

O cliente recebe uma tarefa após a etapa de aprovação ser bem-sucedida. Se várias pessoas precisarem aprovar primeiro, adicione-as à etapa de aprovação e ative **All assignees must complete**. Consulte [Configurar etapas do fluxo de trabalho](workflow-steps.md) para ver as regras de conclusão.

## Revise e envie {#review-and-submit}

Verifique os arquivos, ordem das etapas, ação, instruções, participantes, regra de conclusão, visibilidade e requisitos adicionais. Se precisar de uma assinatura desenhada, marque **Require an electronic signature**; escolher a ação **Sign** por si só não a habilita. Em seguida, escolha **Submit** e aguarde a confirmação antes de sair da página.

Se os campos estiverem destacados, corrija-os e envie novamente. Se um limite de plano bloquear o envio, inspecione [Uso](usage.md) ou peça ajuda ao proprietário ou administrador da organização.

Se o nome do funcionário da sua organização estiver incompleto, um aviso explicará como ele aparecerá no registro. Escolha **Go back** para corrigi-lo ou **Proceed anyway** para enviar com o nome atual. Os detalhes dos funcionários da organização são gerenciados separadamente do seu perfil pessoal.

Ao redigir uma solicitação personalizada de nova organização, **Save template** cria um modelo privado a partir do título, da descrição e das etapas. Aplica as regras de validação do modelo e não substitui o envio da solicitação. Solicitações iniciadas a partir de modelos e revisões de solicitações não oferecem esta ação. Consulte [Modelos de fluxo de trabalho](templates.md).

## Após o envio {#after-submission}

Abra **Requests** e selecione a solicitação para acompanhar seu progresso. Os participantes agem conforme o fluxo de trabalho atinge suas etapas. A entrega de notificações segue as preferências de cada destinatário.

Use [Rastrear e revisar solicitações](track-requests.md) para entender os resultados, cancelamentos e revisões. Sair ou cancelar a tela de composição descarta as edições sem solicitar confirmação. Os rascunhos de solicitações não são salvos.
