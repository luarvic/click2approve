---
title: Sistema de aprovação de documentos de código aberto
description: Click2Approve auto-hospedado, um sistema gratuito de aprovação de documentos licenciado pelo MIT com fluxos de trabalho de várias etapas, vários revisores e assinaturas eletrônicas. Compare as edições.
---
# Sistema de aprovação de documentos de código aberto {#open-source-document-approval-system}

Click2Approve é um sistema de aprovação de documentos de código aberto gratuito e licenciado pelo MIT que você pode hospedar em sua própria infraestrutura. Faça upload de documentos, atribua revisores por endereço de e-mail e acompanhe suas decisões por meio de um fluxo de trabalho de aprovação em várias etapas. Você pode solicitar assinaturas eletrônicas e comentários quando uma tarefa precisar de explicação.

A edição de código aberto oferece suporte a contas individuais e fluxos de trabalho de documentos pessoais para uso pessoal ou comercial. Não há taxa de licença Click2Approve; você cobre seus custos de infraestrutura e provedor. Consulte o [código-fonte e instruções de auto-hospedagem](https://github.com/luarvic/click2approve) para começar.

A versão comercial adiciona espaços de trabalho organizacionais, ferramentas de colaboração e controles de uso e retenção baseados em assinatura. Os demais guias deste portal descrevem o serviço comercial; use esta comparação para verificar quais recursos se aplicam à edição de código aberto.

## Exemplo: revisar e aprovar uma proposta {#example-review-and-approve-a-proposal}

1. Faça upload de uma proposta e adicione uma etapa de aprovação para as pessoas que precisam analisá-la.
2. Escolha se todos os atribuídos à etapa devem responder ou se qualquer revisor pode concluí-la. As etapas do fluxo de trabalho são executadas em ordem, com vários responsáveis capazes de agir em cada etapa.
3. Adicione uma etapa de assinatura se a proposta também precisar de assinatura eletrônica.
4. Acompanhe o progresso da solicitação e as decisões registradas em **Requests**. Cada participante encontra o trabalho atribuído em **Tasks**.

Consulte [Criar uma solicitação](create-a-request.md) e [Configurar etapas do fluxo de trabalho](workflow-steps.md) para ver os controles do fluxo de trabalho. Registros de resultado compartilháveis e verificação de arquivos são recursos comerciais; veja a comparação abaixo ao escolher uma edição.

## Comparação de recursos {#feature-comparison}

| Recurso | Código aberto | Comercial |
| --- | --- | --- |
| Solicitações e tarefas Personal com arquivos carregados | Incluído | Incluído |
| Várias etapas de fluxo de trabalho, responsáveis seriais ou paralelos e todas/quaisquer regras de conclusão | Incluído | Incluído |
| Ações de aprovação, assinatura, confirmação, reconhecimento, revisão, verificação, aceitação e conclusão | Incluído | Incluído |
| Comentários e assinaturas eletrônicas obrigatórias | Incluído | Incluído |
| Solicitar rastreamento, cancelamento e exclusão | Incluído | Incluído |
| Perfis, assinaturas salvas, login com senha, MFA e chaves de acesso | Incluído | Incluído |
| Notificações por e-mail e no aplicativo | Incluído | Incluído |
| Espaços de trabalho da organização, funcionários, funções e responsáveis de funcionários | Indisponível | Incluído |
| Equipes e responsáveis pelas equipes | Indisponível | Incluído |
| Delegations | Indisponível | Incluído |
| Modelos de fluxo de trabalho da organização | Indisponível | Incluído |
| Discussões e anexos de discussão | Indisponível | Incluído |
| Anexos de resposta de tarefa e arquivos de resposta necessários | Indisponível | Incluído |
| Solicite revisões e comparações de arquivos entre revisões | Indisponível | Incluído |
| Receipts, links de verificação compartilháveis e verificação de arquivos | Indisponível | Incluído |
| Tokens API para integrações | Indisponível | Incluído |
| Planos de assinatura, relatórios de uso de token e cobrança | Indisponível | Incluído |
| Configurações de retenção do espaço de trabalho e limpeza automática de retenção | Indisponível | Incluído |

Os recursos comerciais dependem do seu espaço de trabalho, função, participação e limites do plano. Consulte [Recursos e disponibilidade](features.md) para permissões de espaço de trabalho e [Planos e cobrança](plans-and-billing.md) para assinaturas. A entrega de email em uma instalação auto-hospedada requer um provedor de email.

## Use o aplicativo de código aberto {#use-the-open-source-app}

1. Cadastre-se ou faça login com sua conta.
2. Escolha **New request**, carregue seus arquivos e configure as etapas do fluxo de trabalho com os endereços de e-mail dos destinatários. Consulte [Criar uma solicitação](create-a-request.md) e [Configurar etapas do fluxo de trabalho](workflow-steps.md) para obter os controles de fluxo de trabalho compartilhados.
3. Use **Requests** para rastrear o trabalho que você enviou e **Tasks** para concluir ações atribuídas a você. Consulte [Concluir uma tarefa](complete-a-task.md) para comentários e assinaturas; anexos de resposta estão disponíveis na versão comercial.

A navegação da organização e as ferramentas comerciais estão ocultas no aplicativo de código aberto. Você pode gerenciar seu perfil, assinatura salva, preferências de notificação, MFA e chaves de acesso por meio do menu de perfil.

## Fonte e auto-hospedagem {#source-and-self-hosting}

Consulte o [repositório de código aberto](https://github.com/luarvic/click2approve) para obter o código-fonte, a licença MIT, configuração do Docker e instruções de auto-hospedagem. Visite o [serviço Click2Approve](../index.md) para obter a versão comercial.
