---
title: 用于审批工作流集成的 API 令牌
description: 为您的集成创建 Click2Approve API 令牌，将其作为承载令牌发送，并探索 API 参考。了解令牌权限和撤销的工作原理。
---
# 用于审批工作流集成的 API 令牌 {#api-tokens}

使用 Click2Approve API 连接您自己的工具并自动化审批工作流程。 API 令牌允许集成通过您的用户帐户访问 API。无论您是在 Personal 还是组织中工作，都可以在您的个人资料中对其进行管理。

## 创建令牌 {#create-a-token}

1. 打开**User profile → API tokens**。
2. 选择 **New API token**。
3. 如果需要，请输入可识别的名称和有效期。
4. 创建令牌并在关闭对话框之前复制其值。
5. 安全地存储它以用于预期的集成。

!!! warning“关闭前复制令牌”
    完整值仅显示一次。安全地存储它并使其远离消息、屏幕截图和源代码控制。如果丢失，请创建一个替换令牌并撤销旧令牌。

## 探索 API {#explore-the-api}

打开 [API 参考 (Swagger UI)]({{ api_reference_url }}){target="_blank" rel="noopener noreferrer"} 来浏览端点、请求字段和响应。

要尝试经过身份验证的请求，请选择 **Authorize**，粘贴不带 `Bearer` 前缀的 API 令牌，然后确认。 Swagger 为您添加授权标头。选择一个端点，选择 **Try it out**，填写必填字段，然后选择 **Execute**。这些请求使用您的帐户，并且可以创建、更改或删除真实数据。

帐户安全端点需要交互式登录会话，并且不能与 API 令牌一起使用。

## 在集成中使用令牌 {#use-a-token-in-your-integration}

在每个 API 请求的 `Authorization` 标头：

```http
Authorization: Bearer YOUR_API_TOKEN
```

将 `YOUR_API_TOKEN` 替换为您在创建令牌时复制的值。令牌根据您帐户的权限起作用。令牌创建并不授予对其他用户的工作或其他组织的资源的访问权限；授权仍然适用。

## 撤销令牌 {#revoke-a-token}

在列表中选择令牌，选择 **Revoke**，然后确认。使用替换凭据更新使用它的任何集成。撤销您怀疑已暴露的未使用的令牌和凭据。

API 用量点数是账户设置。切换工作区不会创建一组单独的令牌。
