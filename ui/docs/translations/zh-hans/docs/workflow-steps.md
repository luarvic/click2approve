---
title: 配置文档审批工作流步骤
description: 按顺序安排审批，或让多位审核人同一步处理。配置全体或任意一人响应，以及签名、评论和附件要求。
---
# 配置文档审批工作流步骤 {#configure-workflow-steps}

工作流决定谁以什么顺序处理文档。**受派人**是分配到步骤的个人或团队。步骤依次进行，同一步可以有多位受派人。

用 **Add step** 添加步骤，用箭头调整顺序，用移除按钮删除。

## 顺序审批与并行审批 {#sequential-and-parallel-approvals}

某个决定必须先于另一个时，使用独立步骤，即**顺序审批**。例如第一步审核人批准提案，第二步客户签署。

可同时审核的人放在同一步，即该步骤内的**并行审批**；步骤之间仍按顺序执行。

| 需求 | 配置方式 |
| --- | --- |
| 一人审核后再由另一人审核 | 每人一个独立步骤 |
| 两人必须都批准 | 放入同一步，启用 **All assignees must complete** |
| 多人中任意一人批准即可 | 放入同一步，不启用 **All assignees must complete** |
| 批准后收集手绘签名 | 添加 **Approve**步骤，再添加启用**Require an electronic signature**的**Sign** 步骤 |

## 选择操作和参与者 {#choose-an-action-and-participants}

为每步选择 **Action**，填写清晰的 **Instructions**。支持 Approve、Sign、Confirm、Acknowledge、Review、Verify、Accept 和 Complete。请选择与所需记录的决定相符的操作。

按邮箱添加受派人，提交前核对显示的姓名和地址。

!!! info "组织内分配"
    在组织中可选 **Employee**或**Team** 分配给当前组织的员工或团队。Personal 不提供这两种类型。

## 要求全体或任意一人响应 {#require-everyone-or-any-assignee}

启用 **All assignees must complete**，要求每位受派人成功响应。关闭时，一次成功响应即可完成步骤，其余待处理任务将跳过。步骤含多人或团队分配时才显示此开关。

即使关闭 **All assignees must complete**，否定决定也会终止申请并记为失败。其他人的同意不能覆盖拒绝。

例如，将必须都处理的两位审核人放在同一步，后接独立签名步骤。只需任意一位可用参与者作决定时，则使用任意一人规则。

## 额外要求 {#additional-requirements}

创建或修订申请、编辑模板时，每步的 **Additional requirements**和**Visibility** 始终可见。保存或提交前请检查。

按需启用：

- **Require a comment**：收集说明。
- **Require an electronic signature**：收集签署信息和手绘签名。
- **Require an attachment**：收集回复文件。

操作标签与电子签名要求是独立设置。需要手绘签名时须启用签名要求。请结合所选操作检查要求，让参与者知道应提供什么。见[完成任务](complete-a-task.md)。

## 步骤可见范围 {#step-visibility}

申请人及步骤的直接受派人始终可见，包括邮箱受派人。**Visibility** 决定还有谁可查看详情和回复附件：

| 设置 | 额外可见人员 |
| --- | --- |
| All participants | 有权访问申请的参与者 |
| Assignees and organization participants | 组织参与者，仅组织工作流可用 |
| Assignees only | 无额外参与者 |

邮箱分配始终位于接收人的 Personal，即使该邮箱属于组织员工。被分配的步骤仍显示在工作流中，可进行步骤聊天，并包含在其结果记录内。

这些设置不授予工作区成员资格或其他申请的访问权。其他人无需了解详情时，请选择受限范围。

## 修订 {#revisions}

[重新提交申请](track-requests.md)时，检查并编辑新版本步骤。新工作流从第一步重启，原决定保留在旧版本及其结果记录中。经常使用的组织流程可保存为[模板](templates.md)。
