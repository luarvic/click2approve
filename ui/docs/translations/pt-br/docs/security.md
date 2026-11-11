---
title: Configurar MFA e senhas do autenticador
description: Proteja sua conta Click2Approve com um aplicativo autenticador ou chave de acesso. Saiba como configurar o MFA, salvar códigos de recuperação e gerenciar chaves de acesso registradas.
---
# MFA e chaves de acesso {#mfa-and-passkeys}

Proteja sua conta Click2Approve com **autenticação multifator (MFA)** ou uma **chave de acesso**. Com o autenticador MFA, você insere um código de um aplicativo autenticador após sua senha. Uma chave de acesso permite que você faça login por meio de um dispositivo compatível ou chave de segurança, usando o prompt do navegador.

Essas configurações se aplicam à sua conta no Personal e nos espaços de trabalho da organização.

## Ativar o autenticador MFA {#enable-authenticator-mfa}

1. Abra **User profile → Security**.
2. Ative **Use multi-factor authentication**.
3. Leia o código QR de configuração em seu aplicativo autenticador ou insira a chave de configuração manualmente.
4. Insira um código de verificação do autenticador para confirmar a configuração.
5. Salve os códigos de recuperação em um local seguro e confirme que os salvou.
6. Escolha **Done — sign in again** e faça login com sua senha e código do autenticador.

Após a configuração, o login com senha requer o desafio MFA adicional. Iniciar a configuração altera sua sessão: para concluí-la ou cancelá-la, é necessário fazer login novamente.

## Códigos de recuperação {#recovery-codes}

Use um código de recuperação salvo quando você não conseguir acessar seu autenticador.

!!! warning "Mantenha os códigos de recuperação seguros"
    Cada código é secreto e pode ser usado apenas uma vez. **Generate new recovery codes** substitui o conjunto anterior; salve os novos códigos antes de dispensá-los.

Gerar novos códigos de recuperação ou desligar MFA também requer login novamente após terminar.

Para desativar MFA, use a guia Security e conclua a verificação solicitada. Não remova seu único método de login funcional antes de testar outro.

## Adicione uma chave de acesso {#add-a-passkey}

1. Abra **User profile → Passkeys** e escolha a nova ação de senha.
2. Digite um nome que você reconhecerá mais tarde.
3. Preencha a solicitação do navegador ou dispositivo usando sua chave biométrica, PIN ou de segurança.
4. Verifique se a credencial aparece na lista.

Use a opção de login com chave de acesso em um dispositivo e navegador compatível. As chaves de acesso requerem um dispositivo e navegador compatíveis. Mantenha sua senha disponível para recuperação de conta.

## Remover uma chave de acesso {#remove-a-passkey}

Selecione a credencial na lista Chaves de acesso e use a ação de remoção. Verifique primeiro o nome e os últimos detalhes usados. Removê-la revoga o acesso dessa credencial; ele não remove outras chaves de acesso registradas.

Após a remoção, o aplicativo notifica os gerenciadores de senhas compatíveis para que eles possam parar de oferecer a chave de acesso removida. Seu navegador ou gerenciador de senhas pode não suportar esta atualização. Se a senha ainda aparecer, remova-a manualmente do seu gerenciador de senhas; ele não poderá mais fazer login em sua conta.

Para um autenticador perdido ou dispositivo indisponível, tente seu método alternativo configurado ou código de recuperação. Se não houver nenhum disponível, entre em contato com o suporte para obter ajuda.
