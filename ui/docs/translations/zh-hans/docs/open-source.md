---
title: 开源文件审批系统
description: 自托管 Click2Approve，一个 MIT 许可的免费文档审批系统，具有多步骤工作流程、多个审阅者和电子签名。比较版本。
---
# 开源文档审批系统 {#open-source-document-approval-system}

Click2Approve 是一个免费的、经过 MIT 许可的开源文档审批系统，您可以将其托管在自己的基础设施上。上传文档，通过电子邮件地址分配审阅者，并通过多步骤审批工作流程跟踪他们的决策。当任务需要解释时，您可以请求电子签名并要求评论。

开源版本支持用于个人或商业用途的个人帐户和个人文档工作流程。没有Click2Approve许可费；您承担基础设施和提供商的成本。请参阅[源代码和自托管说明](https://github.com/luarvic/click2approve) 开始使用。

商业版本添加了组织工作区、协作工具以及基于订阅的使用和保留控制。该门户中的其他指南描述了商业服务；使用此比较来检查哪些功能适用于开源版本。

## 示例：审核并批准提案 {#example-review-and-approve-a-proposal}

1. 上传提案并为需要审核的人员添加审批步骤。
2. 选择是分配给该步骤的每个人都必须做出回应，还是任何一位审阅者都可以完成该步骤。工作流程步骤按顺序运行，多个受派人可以在每个步骤中执行操作。
3. 如果提案还需要电子签名，请添加签名步骤。
4. 跟踪请求的进度并记录 **Requests**的决定。每个参与者都可以在**Tasks** 中找到分配给他们的工作。

请参阅[创建请求](create-a-request.md) 和[配置工作流程步骤](workflow-steps.md) 了解工作流程控件。可共享结果记录和文件验证是商业功能；选择版本时请参阅下面的比较。

## 功能比较 {#feature-comparison}

|特色|开源|商业|
| --- | --- | --- |
| Personal 上传文件的请求和任务 |包含 |包含 |
|多个工作流程步骤、串行或并行受派人以及所有/任何完成规则 |包含 |包含 |
|批准、签名、确认、确认、审查、验证、接受和完成操作 |包含 |包含 |
|所需的评论和电子签名 |包含 |包含 |
|请求跟踪、取消和删除 |包含 |包含 |
|配置文件、保存的签名、密码登录、MFA 和密钥 |包含 |包含 |
|电子邮件和应用内通知 |包含 |包含 |
|组织工作空间、员工、角色和员工分配者 |不可用 |包含 |
|团队和团队受派人 |不可用 |包含 |
| Delegations |不可用 |包含 |
|组织工作流程模板|不可用 |包含 |
|讨论和讨论附件|不可用 |包含 |
|任务响应附件和所需的响应文件 |不可用 |包含 |
|请求修订和修订之间的文件比较 |不可用 |包含 |
| Receipts，可共享验证链接和文件验证 |不可用 |包含 |
| API tokens for integrations |不可用 |包含 |
|订阅计划、用量点数使用报告和计费 |不可用 | Included |
|工作区保留设置和自动保留清理 |不可用 |包含 |

商业功能取决于您的工作空间、角色、参与和计划限制。有关工作区权限，请参阅[功能和可用性](features.md)；有关订阅，请参阅[计划和计费](plans-and-billing.md)。自托管安装中的电子邮件传送需要电子邮件提供商。

## 使用开源应用程序 {#use-the-open-source-app}

1. 注册或使用您的帐户登录。
2. 选择 **New request**，上传您的文件，并使用受派人的电子邮件地址配置工作流程步骤。有关共享工作流控件，请参阅[创建请求](create-a-request.md) 和[配置工作流步骤](workflow-steps.md)。
3. 使用 **Requests**跟踪您发送的作业，并使用**Tasks** 完成分配给您的操作。评论和签名见[完成任务](complete-a-task.md)； response attachments are available in the commercial version.

Organization navigation and commercial tools are hidden in the open-source app.您可以通过个人资料菜单管理您的个人资料、保存的签名、通知首选项、MFA 和密钥。

## 源代码和自托管 {#source-and-self-hosting}

请参阅[开源存储库](https://github.com/luarvic/click2approve) 以获取源代码、MIT 许可证、Docker 设置和自托管说明。商业版本请访问[Click2Approve服务](../index.md)。
