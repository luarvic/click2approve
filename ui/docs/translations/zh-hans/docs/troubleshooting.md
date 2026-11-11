---
title: 解决缺失审批任务与提交失败问题
description: 查找 Click2Approve 申请和任务，处理提交失败、登录、付款及结果验证链接过期等常见文档审批问题。
---
# 文档审批故障排查 {#troubleshooting}

找不到任务、无法提交申请或打开结果链接时，先检查账户和当前工作区。打开申请或任务查看最新状态，再阅读失败操作的错误提示。

## 找不到申请或任务 {#i-cannot-find-a-request-or-task}

邮箱任务在 **Personal** 中；员工、团队任务在对应组织中。检查账户邮箱、员工状态、团队成员及委托关系。任务也可能已取消、跳过、完成、被新修订替代或删除。

邮件链接不授予组织访问权。见[工作区与导航](workspaces.md)。

若出现 **Page not found**，页面可能已移动，或您无权访问。选择 **Home** 返回，再检查账户和工作区。

## 菜单项或操作缺失 {#a-menu-item-or-action-is-missing}

检查[功能与可用范围](features.md)。员工、团队、委托和模板需要组织工作区。角色、方案或计费状态可能隐藏或禁用控件。请选择正确组织，并请 Owner 或 Admin 检查权限。

## 更新后应用重新加载 {#the-app-reloads-after-an-update}

检测到新版本时，应用自动重新加载并打开当前页。未保存的文字可能丢失。

## 提交或完成任务失败 {#submission-or-task-completion-fails}

修正标记字段，提供所有必需评论、签名和附件，等待上传结束。提示涉及额度时，请查看[用量](usage.md)。

API 出错后，重试前先刷新记录；其他参与者或代理人可能已完成操作。先在 Requests 或 Tasks 确认原操作是否成功，再决定是否重复。

## 无法修订申请 {#i-cannot-revise-a-request}

Resubmit 仅适用于未成功且没有较新版本的合格申请。新修订重启工作流，旧决定保留在旧版本。见[跟踪和修订申请](track-requests.md)。

## 验证链接不可用 {#a-verification-link-does-not-work}

链接可能已过期、被撤销，或对应的结果记录已删除。 请向结果记录的所有者索取有效链接。 [结果记录与验证](receipts.md).

## 无法登录或收到邮件 {#i-cannot-sign-in-or-receive-email}

检查是否要求验证邮箱，必要时重新请求验证或密码重设邮件。查看垃圾邮件及账户地址。MFA 可尝试未用恢复码；通行密钥可尝试已注册兼容设备，或改用密码登录。

请阅读[注册与登录](sign-in.md)、[MFA 与通行密钥](security.md)和[通知](notifications.md)。

## 工作区因付款被阻止 {#the-workspace-is-blocked-for-payment}

打开 **Plans**，在显示的期限前完成付款补救。组织付款须由 Owner 或 Admin 管理。见[方案与计费](plans-and-billing.md)。

## 删除被阻止 {#deletion-is-blocked}

阅读依赖提示。其他记录可能仍引用员工、团队或工作流实体。移除关联记录前，请阅读[保留与删除](retention.md)。

## 求助或报告问题 {#get-help-or-report-a-bug}

使用应用 **Report a bug**或**Ask question**，提供复现步骤、预期及实际结果、大致时间和工作区类型。API 错误提供 **Details** 时，查看诊断信息，只分享适合该支持渠道的内容。

不要在公开报告中发布密码、API 令牌、恢复码、验证链接或私人文档。账户、邮件、安全及计费问题请联系支持。
