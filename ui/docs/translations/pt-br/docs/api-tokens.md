---
title: Tokens de API para integrar fluxos de aprovação
description: Crie um token de API Click2Approve para sua integração, envie-o como um token de portador e explore a referência da API. Saiba como funcionam as permissões e revogações de token.
---
# Tokens de API para integrar fluxos de aprovação {#api-tokens}

Use o Click2Approve API para conectar suas próprias ferramentas e automatizar fluxos de trabalho de aprovação. Os tokens API permitem que as integrações acessem o API por meio de sua conta de usuário. Gerencie-os em seu perfil, quer você trabalhe em Personal ou em uma organização.

## Crie um token {#create-a-token}

1. Abra **User profile → API tokens**.
2. Escolha **New API token**.
3. Insira um nome reconhecível e uma data de validade, se necessário.
4. Crie o token e copie seu valor antes de fechar a caixa de diálogo.
5. Armazene-o de forma segura para a integração pretendida.

!!! warning "Copie o token antes de fechar"
    O valor completo é mostrado apenas uma vez. Armazene-o com segurança e mantenha-o fora de mensagens, capturas de tela e controle de origem. Se você perdê-lo, crie um substituto e revogue o token antigo.

## Explore o API {#explore-the-api}

Abra a [referência API (Swagger UI)]({{ api_reference_url }}){target="_blank" rel="noopener noreferrer"} para procurar endpoints, campos de solicitação e respostas.

Para tentar uma solicitação autenticada, escolha **Authorize**, cole seu token API sem o prefixo `Bearer` e confirme. Swagger adiciona o cabeçalho de autorização para você. Escolha um endpoint, selecione **Try it out**, preencha os campos obrigatórios e selecione **Execute**. Essas solicitações usam sua conta e podem criar, alterar ou excluir dados reais.

Os endpoints de segurança da conta exigem uma sessão de login interativa e não podem ser usados com tokens API.

## Use um token em sua integração {#use-a-token-in-your-integration}

Envie seu token no cabeçalho `Authorization` com cada solicitação API:

```http
Authorization: Bearer YOUR_API_TOKEN
```

Substitua `YOUR_API_TOKEN` pelo valor que você copiou ao criar o token. Os tokens atuam com as permissões da sua conta. A criação de token não concede acesso ao trabalho de outro usuário ou aos recursos de outra organização; a autorização ainda se aplica.

## Revogar um token {#revoke-a-token}

Selecione o token na lista, escolha **Revoke** e confirme. Atualize qualquer integração que a utilizou com uma credencial de substituição. Revogue tokens e credenciais não utilizados que você suspeita terem sido expostos.

Tokens API são configurações de conta. A troca de espaços de trabalho não cria um conjunto separado de tokens.
