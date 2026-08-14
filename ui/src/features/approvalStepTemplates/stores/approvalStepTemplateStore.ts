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

  load = async (tenantGlobalId: string): Promise<void> => {
    const requestVersion = ++this.requestVersion;
    const templates = await approvalStepTemplateApi.listApprovalStepTemplates(tenantGlobalId);
    if (requestVersion !== this.requestVersion) {
      return;
    }
    runInAction(() => {
      this.templates = templates;
    });
  };

  create = async (
    tenantGlobalId: string,
    payload: UpsertApprovalStepTemplateRequest,
  ): Promise<ApprovalStepTemplate | null> => {
    const requestVersion = this.requestVersion;
    const template = await approvalStepTemplateApi.createApprovalStepTemplate(tenantGlobalId, payload);
    if (!template || requestVersion !== this.requestVersion) {
      return null;
    }

    runInAction(() => {
      this.templates = [...this.templates, template];
    });
    return template;
  };

  update = async (
    tenantGlobalId: string,
    templateGlobalId: string,
    payload: UpsertApprovalStepTemplateRequest,
  ): Promise<ApprovalStepTemplate | null> => {
    const requestVersion = this.requestVersion;
    const template = await approvalStepTemplateApi.updateApprovalStepTemplate(
      tenantGlobalId,
      templateGlobalId,
      payload,
    );
    if (!template || requestVersion !== this.requestVersion) {
      return null;
    }

    runInAction(() => {
      this.templates = this.templates.map((item) => (item.globalId === template.globalId ? template : item));
    });
    return template;
  };

  delete = async (tenantGlobalId: string, templateGlobalId: string): Promise<boolean> => {
    const requestVersion = this.requestVersion;
    if (!(await approvalStepTemplateApi.deleteApprovalStepTemplate(tenantGlobalId, templateGlobalId))) {
      return false;
    }
    if (requestVersion !== this.requestVersion) {
      return false;
    }

    runInAction(() => {
      this.templates = this.templates.filter((template) => template.globalId !== templateGlobalId);
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
