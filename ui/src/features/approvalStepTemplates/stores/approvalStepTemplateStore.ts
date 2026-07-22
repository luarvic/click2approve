import * as approvalStepTemplateApi from "@/features/approvalStepTemplates/api/approvalStepTemplatesApi";
import {
  ApprovalStepTemplate,
  UpsertApprovalStepTemplateRequest,
} from "@/features/approvalStepTemplates/models/approvalStepTemplate";
import { makeAutoObservable, runInAction } from "mobx";

export class ApprovalStepTemplateStore {
  templates: ApprovalStepTemplate[];
  // Incremented to invalidate older async requests so only the latest response updates the store.
  private requestVersion = 0;

  constructor(templates: ApprovalStepTemplate[] = []) {
    this.templates = templates;
    makeAutoObservable(this);
  }

  load = async (tenantId: number): Promise<void> => {
    const requestVersion = ++this.requestVersion;
    const templates = await approvalStepTemplateApi.listApprovalStepTemplates(tenantId);
    if (requestVersion !== this.requestVersion) {
      return;
    }
    runInAction(() => {
      this.templates = templates;
    });
  };

  create = async (
    tenantId: number,
    payload: UpsertApprovalStepTemplateRequest
  ): Promise<ApprovalStepTemplate | null> => {
    const requestVersion = this.requestVersion;
    const template = await approvalStepTemplateApi.createApprovalStepTemplate(tenantId, payload);
    if (!template || requestVersion !== this.requestVersion) {
      return null;
    }

    runInAction(() => {
      this.templates = [...this.templates, template];
    });
    return template;
  };

  update = async (
    tenantId: number,
    templateId: number,
    payload: UpsertApprovalStepTemplateRequest
  ): Promise<ApprovalStepTemplate | null> => {
    const requestVersion = this.requestVersion;
    const template = await approvalStepTemplateApi.updateApprovalStepTemplate(
      tenantId,
      templateId,
      payload
    );
    if (!template || requestVersion !== this.requestVersion) {
      return null;
    }

    runInAction(() => {
      this.templates = this.templates.map((item) =>
        item.id === template.id ? template : item
      );
    });
    return template;
  };

  delete = async (tenantId: number, templateId: number): Promise<boolean> => {
    const requestVersion = this.requestVersion;
    if (!(await approvalStepTemplateApi.deleteApprovalStepTemplate(tenantId, templateId))) {
      return false;
    }
    if (requestVersion !== this.requestVersion) {
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
      this.requestVersion += 1;
      this.templates = [];
    });
  };
}
