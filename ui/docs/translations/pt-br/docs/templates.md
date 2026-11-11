---
title: Reutilize modelos de fluxo de trabalho de aprovação de documentos
description: Salve etapas de aprovação e participantes como modelo em uma organização. Inicie novas solicitações a partir de seus modelos e revise os arquivos e responsáveis a cada vez.
---
# Reutilize modelos de fluxo de trabalho de aprovação de documentos {#workflow-templates}

Use modelos de fluxo de trabalho ao enviar documentos frequentemente pelo mesmo processo de aprovação. Um modelo salva etapas de solicitação e participantes dentro de uma organização. Você adiciona os documentos atuais ao criar cada solicitação.

Por exemplo, salve uma etapa de revisão da proposta seguida por uma etapa de assinatura. Reutilize essas etapas na próxima proposta e verifique os revisores, signatários e arquivos antes de enviar.

Cada modelo pertence à pessoa que o cria. Os modelos são privados por padrão. Selecione **Shared** para permitir que outros membros ativos da mesma organização visualizem e usem um modelo. Somente seu criador pode editá-lo ou excluí-lo, inclusive quando outro membro for proprietário ou administrador.

!!! info "Somente organização"
    Selecione uma organização para criar e reutilizar modelos de fluxo de trabalho. Os modelos pertencem a essa organização e não estão disponíveis em Personal.

## Crie um modelo {#create-a-template}

Abra **Templates** na organização e crie um modelo com um nome descritivo e etapas reutilizáveis. Configure ações, instruções, responsáveis, regras de conclusão, visibilidade e requisitos adicionais e salve.

Selecione **Shared** se outros membros da organização quiserem reutilizá-lo. Deixe-o desmarcado para manter o modelo privado. A lista de modelos mostra **Shared** e **Owner** para que você possa identificar os fluxos de trabalho disponíveis e seus criadores.

Os nomes dos modelos compartilhados devem ser exclusivos na organização. Os nomes de modelos privados devem ser exclusivos entre os seus próprios modelos privados nessa organização. Você pode possuir um modelo **Budget** compartilhado e um modelo **Budget** privado. Renomear um modelo ou alterar **Shared** também deve atender a essas regras.

Ao criar uma solicitação em uma organização sem usar um modelo, **Save template** cria um modelo privado a partir de seu título, descrição e etapas. Aplica as mesmas regras de validação de modelo e não substitui um modelo existente. Se o título entrar em conflito com um dos nomes de modelos privados, escolha um título diferente antes de salvar. Revise o que você salva: um modelo de fluxo de trabalho armazena configuração de etapas em vez de uma solicitação concluída ou suas decisões registradas.

## Inicie uma solicitação a partir de um modelo {#start-a-request-from-a-template}

1. Escolha **New request** na mesma organização.
2. Selecione **From template**, escolha um dos seus modelos ou um modelo de organização compartilhada e continue.
3. Insira o título, a descrição e os documentos atuais da solicitação.
4. Revise cada participante e etapa antes de escolher **Submit**.

Os modelos fornecem uma configuração inicial. Verifique se os funcionários e equipes ainda estão adequados para a nova solicitação. Não presuma que um modelo fornece os arquivos para uma transação específica.

O seletor agrupa **Private templates** e **Shared templates** separadamente. Escolha o nome do grupo apropriado quando ambos contiverem um modelo com o mesmo nome.

O editor carrega o modelo antes de você começar a editar. Seu nome e descrição fornecem o texto da solicitação inicial; altere-os para a solicitação atual antes de enviar.

## Manter modelos {#maintain-templates}

Abra **Templates** para atualizar seus comandos recorrentes e opções de participantes. Qualquer membro ativo da organização pode criar e gerenciar seus próprios modelos. A edição de um modelo não altera as solicitações que já foram enviadas.

Os modelos compartilhados por outros membros são abertos em modo somente leitura. Peça ao criador para atualizar o modelo quando suas etapas reutilizáveis precisarem ser alteradas. A limpeza de **Shared** remove o acesso de outros membros ao modelo; solicitações já criadas a partir dele mantêm seu fluxo de trabalho copiado.**Save template** está disponível apenas para novas solicitações personalizadas. Para alterar um modelo existente, use **Templates**. As solicitações iniciadas a partir de um modelo e as revisões de solicitação não oferecem **Save template**.

Remova modelos não utilizados com a ação de exclusão disponível. Se a exclusão for bloqueada por uma referência, siga a mensagem de validação em vez de tentar novamente.
