---
title: 审批邮件与应用内通知
description: 选择批准请求、任务、聊天和结果记录的电子邮件和应用内通知。查找传送设置并检查消息丢失时该怎么做。
---
# 审批邮件与应用内通知 {#notifications}

通知可帮助您返回分配的任务、请求结果、讨论、结果记录和计费事件。为每个类别单独设置传递首选项。

## 查看通知 {#review-notifications}

打开应用的通知视图以检查应用内事件。按照相关资源的通知进行操作，并在采取行动之前检查当前状态。较早的通知可以指已完成、已取消或已取代的任务。

当结果已知时，通知和电子邮件主题会显示 **Step succeeded**或**Step failed**以及**Request succeeded**或**Request failed**。电子邮件主题附加请求标题。取消和替换的请求具有不同的电子邮件主题。其他事件使用 **New task**、**Task completed**（用于自动完成)、**New message**和**New receipt**。

电子邮件链接指向相关任务、请求、结果记录或计划页面。出现提示时使用目标帐户登录。

帐户、工作流程和帐单电子邮件与主页、应用程序、文档、联系人、条款和隐私链接共享应用程序的页脚。安全通知和传送说明显示在页脚上方。

## 设置传送首选项 {#set-delivery-preferences}

1. 打开**User profile → Notifications**。
2. 查看类别：**Request notifications**、**Task notifications**、**Chat notifications**、**Receipt notifications**、**Retention deletion reminders**和**Billing recovery reminders**。
3. 为每个支持的类别设置 **In-app**和**Email** 开关。
4. 选择 **Save**。

未保存首选项的类别开始启用。更改开关并选择 **Save**来存储您的首选项。**Billing recovery reminders**应用内选项已禁用；其电子邮件首选项与其他类别分开管理。首选项不会扩大您的访问权限或将您添加到讨论受众中。**Retention deletion reminders** 在自动清理
保留清理之前警告请求和结果记录所有者。他们的电子邮件链接到保留设置和
[保留和删除指南](retention.md)。禁用此类别不会
禁用保留删除。

## 丢失消息 {#missing-messages}

检查您的电子邮件地址、垃圾邮件文件夹、通知首选项、选定的工作区以及您是否是合格的收件人。电子邮件传送可能需要一些时间。

如果您需要立即采取行动，请直接打开“任务”或“请求”，而不是等待电子邮件。对于传送失败，请在不共享凭据的情况下提供事件时间和资源上下文支持。

## 电子邮件令牌 {#email-tokens}

工作流电子邮件（包括保留提醒)会消耗每个收件人的令牌，这些令牌将记入原始工作区。发送前会检查令牌，并在电子邮件提供商接受发送时收取费用。对通知进行排队不消耗令牌。禁用的电子邮件传送不收费。安全、帐户恢复和计费电子邮件均包含在内，无需支付工作区令牌费用。请参阅[使用和用量点数](usage.md)。
