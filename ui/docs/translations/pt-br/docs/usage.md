---
title: Uso de fluxo de trabalho de aprovação, tokens e limites de armazenamento
description: Veja quais ações Click2Approve usam tokens, como o armazenamento de arquivos é medido e o que acontece no limite. Use um exemplo para estimar o uso de um fluxo de trabalho de documento.
---
# Uso e tokens {#usage-and-tokens}

Selecione um espaço de trabalho e abra **Usage** para ver o saldo de tokens, o período de cobrança e o armazenamento total ocupado. A tabela abaixo dos blocos lista cada ação e seu **Tokens used**, incluindo entradas de token zero. As ações são ordenadas pelos tokens usados, o mais alto primeiro, com ordem alfabética para quantidades iguais. A classificação usa valores precisos antes do arredondamento da exibição. Os blocos Tokens e Armazenamento mostram os valores usados e disponíveis com uma barra de cota. Os valores de token exibidos são arredondados para tokens inteiros; as barras de contabilidade e de cota mantêm a precisão fracionária.

## Cota mensal de tokens {#monthly-allowance}

Cada plano inclui tokens. No Personal Free, eles são renovados mensalmente a partir da data de início do primeiro período. Nos planos pagos, são concedidos para cada período de faturamento com pagamento confirmado. O Business Trial recebe uma única cota para o mês de teste. Tokens não utilizados expiram: não acumulam para o período seguinte nem podem ser transferidos entre espaços de trabalho.

| Plano | Preço mensal (USD, sem impostos) | Tokens incluídos | Armazenamento |
| --- | --- | --- | --- |
| Personal Free | $0 | 1.000 por mês | 1GB |
| Personal Pro | US$ 20 | 50.000 por mês | 10 GB |
| Business Trial | $0 por apenas um mês | 10.000 uma vez | 1GB |
| Business Pro | US$ 100 | 300.000 por mês | 100 GB |

## O que usa tokens {#what-uses-tokens}

As taxas de token são:

| Action | Fichas |
| --- | --- |
| Carregar | 1 por MB |
| Visualize ou baixe um arquivo | 2 por MB |
| E-mail de fluxo de trabalho | 5 por destinatário |
| Enviar ou reenviar uma solicitação | 10 |
| Crie uma tarefa | 2 por tarefa |

A leitura de detalhes ou listas de solicitações e tarefas, a conclusão de tarefas e o cancelamento de solicitações não são medidos e não consomem tokens. O envio e o reenvio usam a mesma taxa.

As transferências usam MB decimais (1.000.000 bytes). Arquivos pequenos consomem tokens fracionários, em vez de arredondar cada arquivo para um MB. As visualizações de arquivos também transferem dados. Visualizar uma cópia já armazenada em cache pelo seu navegador não causa outra transferência de servidor. As transferências de arquivos bem-sucedidas são cobradas por bytes de documento, sem sobrecarga de codificação de URL de dados.

As solicitações e tarefas são cobradas no espaço de trabalho do fluxo de trabalho de origem, mesmo quando um aprovador usa uma caixa de entrada pessoal. Os uploads das páginas de tarefas e discussões pertencem ao espaço de trabalho da solicitação, que paga pelo upload, armazenamento e downloads. Os uploads feitos durante a preparação de uma nova solicitação pertencem ao espaço de trabalho selecionado. Verificação de conta, redefinições de senha, avisos de segurança, e-mails de cobrança e ativos de marca pública não consomem tokens de espaço de trabalho.

## Exemplo de fluxo de trabalho {#example-workflow}

Um fluxo de trabalho com 10 MB carregados, 10 MB visualizados ou baixados, cinco entregas de destinatários de e-mail de fluxo de trabalho, uma solicitação enviada e cinco tarefas criadas usa **75 tokens**:

| Atividade | Cálculo | Tokens used |
| --- | --- | --- |
| Carregar 10 MB | 10×1 | 10 |
| Visualize ou baixe 10 MB | 10×2 | 20 |
| Entregar cinco e-mails de fluxo de trabalho para um destinatário cada | 5×5 | 25 |
| Envie uma solicitação | 1×10 | 10 |
| Crie cinco tarefas | 5×2 | 10 |
| **Total**| |**75** |

A conclusão dessas tarefas não consome tokens. Outras transferências de arquivos, e-mails, reenvios ou tarefas criadas por etapas posteriores do fluxo de trabalho são cobradas separadamente de acordo com as taxas acima.

## Cobrança e tokens insuficientes {#charging-and-insufficient-tokens}

Uploads, downloads e e-mails de fluxo de trabalho verificam os tokens disponíveis antes de iniciar e cobram diretamente o trabalho concluído. Uploads com falha e e-mails não enviados não são cobrados. Downloads interrompidos são cobrados pelos bytes de documentos transferidos. Anexar ou excluir um arquivo enviado não reembolsa a cobrança de upload.

Ações simultâneas podem deixar o saldo abaixo de zero; outras ações cobradas são bloqueadas até que os tokens estejam disponíveis.

Os limites de burst e de simultaneidade também protegem o serviço. Uma ação com taxa limitada temporariamente pode ser tentada novamente mais tarde.

Quando os tokens são insuficientes, novas ações cobradas são bloqueadas. Os registros de solicitações e tarefas existentes permanecem acessíveis; a visualização de arquivos ainda requer tokens. A conclusão de uma tarefa pode criar tarefas para a próxima etapa, que requer tokens na taxa de criação da tarefa. Abra **Plans** para revisar seu subsídio. A exclusão de um registro não reembolsa os tokens já consumidos.

## O armazenamento é um limite separado {#storage-is-a-separate-limit}

O armazenamento mede os arquivos que ocupam espaço no momento, incluindo arquivos agendados que aguardam limpeza. Não é uma nova permissão de upload a cada mês. Manter um arquivo não consome tokens adicionais, mas é contabilizado na capacidade de armazenamento do seu plano até que ele seja removido.

Escolha [retenção](retention.md) em torno de quanto tempo você precisa de registros. Uma alteração programada do plano mantém o direito pago atual até que entre em vigor. Um upgrade pago é ativado após o pagamento verificado; ele não concede tokens apenas porque o Checkout foi aberto.
