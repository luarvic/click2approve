import * as approvalStepTemplateApi from "@/features/approvalStepTemplates/api/approvalStepTemplateApi";
import {
  ApprovalStepTemplate,
  UpsertApprovalStepTemplateRequest,
} from "@/features/approvalStepTemplates/models/approvalStepTemplate";
import { makeAutoObservable, runInAction } from "mobx";

export class ApprovalStepTemplateStore {
  templates: ApprovalStepTemplate[];

  constructor(templates: ApprovalStepTemplate[] = []) {
    this.templates = templates;
    makeAutoObservable(this);
  }

  load = async (tenantId: number): Promise<void> => {
    const templates = await approvalStepTemplateApi.listApprovalStepTemplates(tenantId);
    runInAction(() => {
      this.templates = templates;
    });
  };

  create = async (
    tenantId: number,
    payload: UpsertApprovalStepTemplateRequest
  ): Promise<boolean> => {
    const template = await approvalStepTemplateApi.createApprovalStepTemplate(tenantId, payload);
    if (!template) {
      return false;
    }

    runInAction(() => {
      this.templates = [...this.templates, template];
    });
    return true;
  };

  update = async (
    tenantId: number,
    templateId: number,
    payload: UpsertApprovalStepTemplateRequest
  ): Promise<boolean> => {
    const template = await approvalStepTemplateApi.updateApprovalStepTemplate(
      tenantId,
      templateId,
      payload
    );
    if (!template) {
      return false;
    }

    runInAction(() => {
      this.templates = this.templates.map((item) =>
        item.id === template.id ? template : item
      );
    });
    return true;
  };

  delete = async (tenantId: number, templateId: number): Promise<boolean> => {
    if (!(await approvalStepTemplateApi.deleteApprovalStepTemplate(tenantId, templateId))) {
      return false;
    }

    runInAction(() => {
      this.templates = this.templates.filter(
        (template) => template.id !== templateId
      );
    });
    return true;
  };

  clear = (): void => {
    runInAction(() => {
      this.templates = [];
    });
  };
}
