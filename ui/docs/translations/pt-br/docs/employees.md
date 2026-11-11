---
title: Gerenciar funcionários e aprovar funções no espaço de trabalho
description: Adicione funcionários a uma organização Click2Approve e gerencie suas funções e acesso. Compare as permissões de usuário, administrador e proprietário para fluxos de trabalho de aprovação.
---
# Funcionários e funções {#employees-and-roles}

Os funcionários conectam contas de usuário a uma organização e fornecem as identidades usadas para atribuições e registros de auditoria.

!!! info "Somente organização"
    Selecione uma organização para visualizar seus funcionários. Proprietários e administradores podem adicionar funcionários e gerenciar seu acesso.

## Adicionar um funcionário {#add-an-employee}

Proprietários e administradores podem abrir o **Employees**, iniciar um novo funcionário e inserir seu e-mail, nome, cargo, função e equipes. Salve o funcionário e verifique seu status.

O e-mail identifica a conta que deve receber acesso do funcionário. Verifique antes de salvar. O nome e o cargo da organização de um funcionário podem ser diferentes de seu perfil pessoal.

Um funcionário cujo e-mail ainda não foi registrado inicia **Pending**. O registro com esse e-mail ativa a associação. Adicionar uma conta já registrada cria um funcionário **Active**.

## Funções {#roles}

| Função | Permissões da organização |
| --- | --- |
| User (member) | Participe de fluxos de trabalho autorizados, visualize diretórios de funcionários, equipes e delegações e gerencie seus próprios modelos |
| Admin | Gerenciar funcionários, equipes, delegações, cobrança e retenção |
| Owner | Gerenciamento administrativo mais autoridade para agendar a exclusão da organização |

As funções não concedem acesso a outras organizações. A visibilidade de solicitações e tarefas também segue a participação, o relacionamento da equipe e a delegação. Os modelos são privados por padrão e podem ser compartilhados para outros membros da organização visualizarem e usarem. Somente o criador do modelo pode editá-lo ou excluí-lo, inclusive quando outro membro for Proprietário ou Administrador.

O acesso ao registro de resultado segue a propriedade do registro de resultado, independentemente da função do funcionário. Proprietários e administradores podem visualizar, compartilhar e excluir apenas registros de resultado emitidos para eles próprios. Consulte [Registros de resultado e verificação](receipts.md).

## Status do funcionário {#employee-status}

| Status | Significado |
| --- | --- |
| Pending | A associação ainda não está ativa |
| Active | O acesso do funcionário está ativo |
| Disabled | O acesso dos funcionários foi desativado |

Proprietários e administradores podem editar detalhes permitidos de funcionários, associações de equipes e a configuração **Active**. Desabilitar o acesso é útil quando uma pessoa não deve mais atuar em nome da organização.

## Remover um funcionário {#remove-an-employee}

Use a ação de exclusão disponível somente quando o funcionário precisar ser removido. As referências existentes podem impedir a exclusão; leia a mensagem de validação e resolva primeiro o relacionamento relevante. Desabilitar o acesso pode ser apropriado quando relacionamentos históricos devem permanecer.

Antes de alterar a associação, revise [equipes](teams.md) e [delegações](delegations.md) que dependem desse funcionário.
