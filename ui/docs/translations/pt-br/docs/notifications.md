---
title: Gerenciar e-mails de aprovação e notificações no aplicativo
description: Escolha notificações por e-mail e no aplicativo para solicitações de aprovação, tarefas, bate-papo e registros de resultado. Encontre as configurações de entrega e verifique o que fazer quando uma mensagem estiver faltando.
---
# E-mails de aprovação e notificações no aplicativo {#notifications}

As notificações ajudam você a retornar às tarefas atribuídas, solicitar resultados, discussões, registros de resultado e eventos de cobrança. Defina as preferências de entrega separadamente para cada categoria.

## Revise as notificações {#review-notifications}

Abra a visualização de notificações do aplicativo para inspecionar eventos no aplicativo. Siga uma notificação para o recurso associado e verifique o estado atual antes de agir. Uma notificação mais antiga pode se referir a uma tarefa que já foi concluída, cancelada ou substituída.

Notificações e assuntos de e-mail mostram **Step succeeded** ou **Step failed** e **Request succeeded** ou **Request failed**, quando o resultado é conhecido. Os assuntos do e-mail acrescentam o título da solicitação. Solicitações canceladas e substituídas têm assuntos de e-mail distintos. Outros eventos usam **New task**, **Task completed**(para conclusão automática),**New message** e **New receipt**.

Os links de e-mail direcionam a tarefa, solicitação, registro de resultado ou página de Planos relevante. Faça login com a conta pretendida quando solicitado.

Os e-mails da conta, do fluxo de trabalho e de cobrança compartilham o rodapé do aplicativo com os links Página inicial, Aplicativo, Documentos, Contato, Termos e Privacidade. Avisos de segurança e explicações de entrega aparecem acima do rodapé.

## Definir preferências de entrega {#set-delivery-preferences}

1. Abra **User profile → Notifications**.
2. Revise as categorias: **Request notifications**, **Task notifications**, **Chat notifications**, **Receipt notifications**, **Retention deletion reminders** e **Billing recovery reminders**.
3. Defina as opções **In-app** e **Email** para cada categoria suportada.
4. Escolha **Save**.

Categorias sem preferências salvas começam ativadas. Altere uma opção e escolha **Save** para armazenar sua preferência.

A opção no aplicativo **Billing recovery reminders** está desativada; sua preferência de e-mail é gerenciada separadamente de outras categorias. As preferências não expandem seu acesso nem adicionam você ao público de uma discussão.**Retention deletion reminders** avisar os proprietários de solicitações e registros de resultado antes da
limpeza automática de retenção. Seus e-mails estão vinculados às configurações de retenção e ao
[guia de retenção e exclusão](retention.md). Desativar esta categoria não
desativa a exclusão de retenção.

## Mensagens ausentes {#missing-messages}

Verifique seu endereço de e-mail, pasta de spam, preferências de notificação, espaço de trabalho selecionado e se você é um destinatário qualificado. A entrega de e-mails pode levar algum tempo.

Se precisar agir agora, abra Tarefas ou Solicitações diretamente em vez de esperar por um e-mail. Em caso de falha na entrega, forneça suporte com o horário do evento e o contexto do recurso sem compartilhar credenciais.

## Tokens de e-mail {#email-tokens}

E-mails de fluxo de trabalho, incluindo lembretes de retenção, consomem tokens por destinatário, cobrados no espaço de trabalho de origem. Os tokens são verificados antes do envio e cobrados quando o provedor de e-mail aceita o envio. Colocar uma notificação na fila não consome tokens. As entregas de e-mail desabilitadas não são cobradas. E-mails de segurança, recuperação de conta e cobrança estão incluídos sem cobrança de token do espaço de trabalho. Consulte [Uso e tokens](usage.md).
