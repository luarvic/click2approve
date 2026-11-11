---
title: Corrija tarefas de aprovação ausentes e envios com falha
description: Encontre solicitações ou tarefas ausentes e resolva problemas de aprovação de documentos em Click2Approve, incluindo envios com falha, problemas de login e links de recebimento expirados.
---
# Solução de problemas de aprovação de documentos {#troubleshooting}

Se você não conseguir encontrar uma tarefa de aprovação, enviar uma solicitação ou abrir um link de registro de resultado, comece verificando sua conta e o espaço de trabalho selecionado. Abra a solicitação ou tarefa para verificar seu status atual. Em seguida, leia a mensagem de erro da ação que falhou.

## Não consigo encontrar uma solicitação ou tarefa {#i-cannot-find-a-request-or-task}

As tarefas endereçadas por e-mail aparecem em **Personal**. As atribuições de funcionários e equipes aparecem em sua organização. Verifique o e-mail da conta, o status do funcionário, a participação na equipe e qualquer delegação. Uma tarefa também pode ter sido cancelada, ignorada, concluída, substituída ou excluída.

Um link de e-mail não concede acesso à organização. Consulte [Espaços de trabalho e navegação](workspaces.md).

Se você vir **Page not found**, a página pode ter sido movida ou você pode não ter acesso a ela. Selecione **Home** para retornar e verifique sua conta e espaço de trabalho.

## Um item de menu ou ação está faltando {#a-menu-item-or-action-is-missing}

Verifique [Recursos e disponibilidade](features.md). Funcionários, equipes, delegações e modelos exigem um espaço de trabalho organizacional. Sua função, plano ou status de cobrança podem ocultar ou desativar controles. Selecione a organização correta e peça a um proprietário ou administrador para verificar seu acesso.

## O aplicativo é recarregado após uma atualização {#the-app-reloads-after-an-update}

O aplicativo é recarregado automaticamente quando detecta uma nova versão e reabre a página atual. O texto que você não salvou pode ser perdido.

## O envio ou a conclusão da tarefa falha {#submission-or-task-completion-fails}

Corrija os campos destacados e forneça todos os comentários, assinaturas e anexos necessários. Aguarde o término dos uploads. Verifique [Uso](usage.md) se a mensagem menciona uma permissão.

Atualize o recurso antes de tentar novamente após um erro API: outro participante ou delegado pode já ter concluído. Verifique Solicitações ou Tarefas para determinar se a ação original foi bem-sucedida antes de repeti-la.

## Não consigo revisar uma solicitação {#i-cannot-revise-a-request}

O reenvio está disponível apenas para solicitações qualificadas sem uma revisão mais recente e sem um resultado bem-sucedido. Uma nova revisão reinicia o fluxo de trabalho; as decisões anteriores permanecem na revisão anterior. Consulte [Rastrear e revisar solicitações](track-requests.md).

## Um link de verificação não funciona {#a-verification-link-does-not-work}

O link pode ter expirado, sido revogado ou apontar para um registro removido. Peça um link atualizado ao titular do registro de resultado. [Registros de resultado e verificação](receipts.md).

## Não consigo fazer login nem receber e-mail {#i-cannot-sign-in-or-receive-email}

Verifique se a confirmação por e-mail é necessária e solicite uma nova mensagem de confirmação ou redefinição de senha, se necessário. Inspecione o spam e o endereço da sua conta. Para MFA, tente um código de recuperação não utilizado; para chaves de acesso, tente um dispositivo compatível registrado ou login com senha.

Revise [Registro e login](sign-in.md), [MFA e chaves de acesso](security.md) e [Notificações](notifications.md).

## O espaço de trabalho é bloqueado para pagamento {#the-workspace-is-blocked-for-payment}

Abra **Plans** e siga a ação de recuperação do pagamento antes do prazo exibido. O proprietário ou administrador da organização deve gerenciar os pagamentos da organização. Consulte [Planos e cobrança](plans-and-billing.md).

## A exclusão está bloqueada {#deletion-is-blocked}

Leia a mensagem de dependência. Outro registro ainda pode fazer referência ao funcionário, à equipe ou à entidade de fluxo de trabalho. Revise [Retenção e exclusão](retention.md) antes de remover registros relacionados.

## Obtenha ajuda ou relate um bug {#get-help-or-report-a-bug}

Use os links **Report a bug** ou **Ask question** do aplicativo. Inclua as etapas de reprodução, resultado esperado, resultado real, tempo aproximado e tipo de espaço de trabalho relevante. Se um erro API oferecer **Details**, revise as informações de diagnóstico e inclua apenas o que for apropriado para o canal de suporte.

Mantenha senhas, tokens API, códigos de recuperação, links de verificação e documentos privados fora dos relatórios públicos. Para problemas de conta, e-mail, segurança ou faturamento, entre em contato com o suporte.
