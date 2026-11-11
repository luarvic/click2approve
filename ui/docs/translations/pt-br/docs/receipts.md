---
title: Registros de resultado de aprovação e verificação de arquivo de documentos
description: Abra um registro de decisões e assinaturas de aprovação de documentos. Compartilhe um registro de resultado por meio de um link de verificação e verifique se um arquivo corresponde à cópia gravada.
---
# Registros de resultado de aprovação e verificação de arquivo de documento {#receipts-and-verification}

Um **registro de resultado** é um registro que Click2Approve cria quando uma solicitação é concluída. Ele preserva os detalhes da solicitação, o resultado e as ações registradas dos participantes, incluindo assinaturas, quando fornecidas. Use-o para ver quem agiu e qual resultado foi registrado.

Você pode compartilhar um registro de resultado por meio de um link de verificação. A pessoa com o link pode revisar o registro e verificar se sua cópia de um documento corresponde a um arquivo registrado no registro de resultado.

!!! info "Quem pode gerenciar registros de resultado?"
    Somente o usuário para quem um registro de resultado é emitido pode abri-lo ou excluí-lo no espaço de trabalho e gerenciar seus links de verificação. Isso se aplica tanto a Personal quanto a organizações; Proprietários e administradores não podem abrir registros de resultado de outras pessoas por meio de suas funções.

O solicitante e cada pessoa que recebeu uma tarefa obtêm um registro de resultado quando a solicitação é concluída, cancelada ou substituída por uma nova revisão. Cada pessoa recebe um único registro por espaço de trabalho e revisão da solicitação, mesmo que tenha várias tarefas ou também seja o solicitante. Não é necessário concluir a tarefa: o status registrado distingue a atribuição de uma ação realizada. Etapas que não chegaram a criar tarefas não geram registros para os responsáveis previstos.

## Abra um registro de resultado {#open-a-receipt}

Abra **Receipts** no espaço de trabalho onde você enviou a solicitação ou concluiu sua tarefa e selecione o registro de resultado dessa solicitação. O cabeçalho do cartão **Receipt** inclui seu número curto, cabeçalhos de cartão de tarefa e solicitação correspondentes. O cartão mostra seu ID completo e data, seguido pelas seções **Request** e **Task** com os detalhes registrados, resultados, participantes, ações e assinaturas quando presentes.

Os títulos das seções **Request** e **Task** incluem seus números curtos nos registros de resultado do espaço de trabalho e nas páginas de verificação compartilhadas. Os IDs completos da solicitação e da tarefa permanecem nos detalhes registrados quando disponíveis.

As datas de recebimento usam a data e a hora locais sem segundos. Os campos vazios e o primeiro número de revisão ficam ocultos.

Ao imprimir, as seções Solicitação e Tarefa podem continuar nas páginas. Os títulos das seções permanecem na primeira linha, e as linhas e assinaturas de detalhes individuais permanecem juntas quando cabem em uma página.

Um registro de resultado preserva o contexto registrado do trabalho concluído. A visibilidade específica do participante pode limitar as etapas incluídas em um registro de resultado. Um registro de resultado é separado da solicitação ativa.

## Crie um link de verificação {#create-a-verification-link}

1. Abra um registro de resultado que você possa gerenciar.
2. Selecione **Share**.
3. Escolha **New link**, defina **Expires** e crie o link.
4. Selecione o link criado na lista para abrir seu URL de verificação, depois copie e compartilhe-o com o destinatário pretendido.

O código QR dentro do cartão de registro de resultado abre o mesmo link de verificação. Selecione o logotipo ou nome da marca Click2Approve acima do cartão para abrir a página inicial.

!!! warning "Qualquer pessoa com o link pode visualizar o registro de resultado"
    Um link de verificação ativo abre o registro de resultado sem exigir associação ao espaço de trabalho. Revise-o antes de compartilhar: seu conteúdo pode incluir nomes, decisões e assinaturas.

## Verifique um arquivo {#verify-a-file}

Abra um registro de resultado em seu espaço de trabalho ou um link de verificação ativo e escolha **Verify file**. Selecione sua cópia do documento. Seu navegador calcula seu **SHA-256 hash**, um valor baseado no conteúdo do arquivo. Click2Approve compara esse valor com os hashes registrados no registro de resultado e mostra se o arquivo corresponde a um arquivo de solicitação ou ao anexo de resposta de um participante. Esta verificação lê o arquivo selecionado no navegador; essa cópia não é carregada.

Por exemplo, se alguém lhe enviar uma proposta aprovada e seu link de recebimento, abra o link e use **Verify file** para verificar a proposta. Um arquivo com conteúdo alterado não corresponderá ao hash gravado, mesmo que seu nome de arquivo seja o mesmo.

O resultado aparece acima de **Verify file**. **File verified** identifica o anexo correspondente e sua solicitação ou tarefa.**File does not match** significa que nenhum arquivo gravado tem o mesmo hash. Verifique se você selecionou a versão correta e tente novamente.

A verificação usa os metadados e hashes do arquivo preservados no registro de resultado. Ainda funciona após a remoção dos anexos originais; reter um registro de resultado não mantém os anexos armazenados.

Uma correspondência confirma que o conteúdo do arquivo corresponde a um arquivo gravado. Ele não avalia as reivindicações do documento nem verifica de forma independente a identidade do signatário.

## Pare de compartilhar {#stop-sharing}

Em **Share**, selecione o link, escolha **Remove** e confirme quando o acesso não for mais necessário. Um link expirado ou revogado não fornece mais o registro de resultado. Criar outro link não prolonga a validade de um link existente.

Se a verificação falhar, peça ao proprietário do registro de resultado um link atual. Os links de verificação pública fornecem acesso a esse registro de resultado, não às solicitações, tarefas ou diretórios da organização.

## Retenção de registros de resultado {#receipt-retention}

A limpeza em segundo plano remove os registros de resultado e seus links de verificação de acordo com a [política de retenção](retention.md) do espaço de trabalho de registros de resultado, medida a partir da criação do registro de resultado:

| Plano | Retenção de registros de resultado |
| --- | --- |
| Personal Free | Cinco anos |
| Business Trial | Um mês |
| Planos pagos | O período **Requests and receipts** configurado, incluindo **Never delete** |

O registro de resultado de um cessionário pessoal segue a política do espaço de trabalho Personal, independentemente do plano da organização solicitante. A alteração dos planos altera a política dos recebimentos existentes que ainda não foram removidos. Excluir a solicitação original não exclui seus recebimentos. A remoção do espaço de trabalho e a limpeza relacionada ao pagamento ainda podem remover registros de resultado mais cedo.

Um link de verificação não é um backup independente de seu registro de resultado. A revogação de um link interrompe o compartilhamento sem excluir o registro de resultado.

## Exclua seu registro de resultado {#delete-your-receipt}

Selecione **Delete** em seu registro de resultado e confirme em **Delete receipt**. Isso remove permanentemente o seu registro de resultado e todos os seus links de verificação. Não exclui a solicitação original nem os registros de resultado emitidos para outros participantes. Proprietários e administradores podem excluir apenas registros de resultado emitidos para eles próprios.

Para interromper o compartilhamento e manter seu registro de resultado, revogue os links de verificação.
