---
title: Retenção e exclusão de registros de aprovação
description: Saiba por quanto tempo Click2Approve mantém solicitações, registros de resultado e arquivos. Revise as configurações de retenção e o que acontece quando você exclui um registro ou organização.
---
# Retenção e exclusão {#retention-and-deletion}

Escolha por quanto tempo manter solicitações, registros de resultado e notificações em cada espaço de trabalho. Os controles de exclusão dependem do recurso e de suas permissões.

## Definir retenção {#set-retention}

1. Selecione o espaço de trabalho e abra **Retention**.
2. Revise os períodos **Requests**, **Receipts** e **Notifications** em planos gratuitos e de avaliação ou **Requests and receipts** e **Notifications** em planos pagos. Os valores intermediários do controle deslizante aparecem em uma pequena bolha acima do controle deslizante; os endpoints são **1 month** e **Never delete**.
3. Se seu plano e suas permissões permitirem alterações, escolha um período para cada um e selecione **Save**.

Usuários do Personal gerenciam suas próprias configurações; proprietários e administradores gerenciam as da organização. Personal Free e Business Trial mantêm solicitações e notificações por um mês. Os registros de resultado são mantidos por cinco anos no Personal Free e por um mês no Business Trial, a partir da criação. Planos pagos permitem configurar **Requests and receipts** e **Notifications**, incluindo **Never delete**.

Quando Personal Free ou Business Trial se torna ativo, ambos os períodos mudam automaticamente para um mês, incluindo uma configuração anterior **Never delete**. Um downgrade programado mantém suas configurações de retenção atuais até o término do período pago. Solicitações e notificações com mais de um mês tornam-se elegíveis para limpeza em segundo plano. A limpeza de recebimentos segue o período de recebimento do plano atual, inclusive para recebimentos existentes; atualizar antes da limpeza pode estender sua retenção.

!!! warning "A retenção não é um backup"
    Os registros podem ser removidos por limpeza em segundo plano após o período de retenção. Escolha uma política que atenda às suas necessidades de manutenção de registros antes de acumular um histórico importante de fluxo de trabalho.

## Lembretes de retenção {#retention-reminders}

Antes que as solicitações e registros de resultado atinjam o prazo de retenção, seus proprietários recebem
**Retention deletion reminders**. O período de aviso padrão é de uma semana. Cada
lembrete identifica o registro afetado e sua data de exclusão. Os e-mails vinculam esse registro, as configurações de retenção do espaço de trabalho e este guia.
Os lembretes de solicitação vão para o solicitante; lembretes de registro de resultado vão apenas para o proprietário do registro de resultado.
Cada solicitação ou registro de resultado gera um lembrete; alterar o prazo de retenção
não redefine esse lembrete.

Gerencie a entrega de **In-app** e **Email** em **User profile → Notifications → Retention deletion reminders**.
Ambos começam ativados. Desabilitar lembretes não desativa a limpeza de retenção. Para
manter os registros por mais tempo, altere o período de retenção se seu plano e permissões
permitirem, ou entre em contato com o proprietário ou administrador da sua organização.
Os lembretes por e-mail usam [tokens de e-mail de notificação](usage.md) e exigem tokens
suficientes no espaço de trabalho.

Os lembretes seguem suas preferências de notificação e tentativas normais de entrega.
A limpeza de retenção segue sua programação configurada mesmo se um lembrete estiver desativado
ou não puder ser entregue. Os lembretes se aplicam à retenção automática de solicitações e registros de resultado;
limpeza de notificações, exclusão manual, exclusão de organização e limpeza relacionada a pagamentos
seguem suas próprias regras.

## Excluir registros individuais {#delete-individual-records}

Use a ação de exclusão oferecida para uma solicitação, tarefa, registro de resultado, funcionário, equipe, modelo ou delegação somente quando você pretende remover esse registro. Leia a confirmação e qualquer mensagem de validação.

Somente o proprietário do registro de resultado pode excluí-lo manualmente. A exclusão manual e a limpeza da retenção removem o registro de resultado e seus links de verificação juntos. Excluir seu registro de resultado não remove a solicitação original ou os registros de resultado de outros participantes. A remoção da solicitação original não remove seus registros de resultado.

Um relacionamento de outro registro pode impedir a exclusão. Resolva o relacionamento identificado quando apropriado. Tentativas repetidas não removem a dependência.

Uma solicitação com uma revisão mais recente não pode ser excluída enquanto essa revisão fizer referência a ela. Comece com a revisão mais recente ao remover uma cadeia de revisões. Limpeza de agendamentos de exclusão; espere que essa revisão seja removida antes de tentar novamente sua antecessora.

Excluir uma solicitação a torna imediatamente elegível para limpeza em segundo plano, independentemente de sua idade. Os tokens consumidos anteriormente não são reembolsados.

Os registros de resultado preservam metadados e hashes de arquivos sem estender a retenção de anexos. A exclusão de um registro de resultado não exclui nem agenda a limpeza de seus anexos originais.

Os arquivos associados aos registros de fluxo de trabalho excluídos podem ser agendados para limpeza posterior, portanto, seu conteúdo armazenado e seu uso podem não desaparecer imediatamente. Avatares de perfil e logotipos de organizações podem ser removidos imediatamente quando substituídos ou excluídos.

## Excluir uma organização {#delete-an-organization}

!!! warning "A exclusão da organização remove o acesso imediatamente"
    Somente o proprietário pode agendar a exclusão da organização. A organização desaparece imediatamente da seleção do espaço de trabalho e torna-se inacessível; o processamento em segundo plano remove seus dados posteriormente. Preserve os registros necessários antes de confirmar. O atraso na limpeza não é uma opção de recuperação.

## Remoção relacionada ao pagamento {#payment-related-removal}

A suspensão do pagamento tem seu próprio prazo. Resolva pagamentos com falha por meio de [Planos](plans-and-billing.md) antes desse prazo. A expiração remove as organizações empresariais; Os espaços de trabalho Personal perdem dados de fluxo de trabalho e retornam para Personal Free, mantendo a identidade e o perfil. Uma configuração de retenção não substitui esse processo de recuperação de faturamento.
