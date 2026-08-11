import * as applicationConfigurationApi from "@/features/applicationConfiguration/api/applicationConfigurationApi";
import { ApplicationConfiguration } from "@/features/applicationConfiguration/models/applicationConfiguration";
import { makeAutoObservable, runInAction } from "mobx";

export class ApplicationConfigurationStore {
  applicationConfiguration: ApplicationConfiguration | null;

  constructor(applicationConfigurationValue: ApplicationConfiguration | null = null) {
    this.applicationConfiguration = applicationConfigurationValue;
    makeAutoObservable(this);
  }

  get tenantsAreEnabled(): boolean {
    return this.applicationConfiguration?.capabilities.tenants === true;
  }

  get discussionsAreEnabled(): boolean {
    return this.applicationConfiguration?.capabilities.discussions === true;
  }

  get employeeAssigneesAreEnabled(): boolean {
    return this.applicationConfiguration?.capabilities.employeeAssignees === true;
  }

  get teamAssigneesAreEnabled(): boolean {
    return this.applicationConfiguration?.capabilities.teamAssignees === true;
  }

  get approvalStepTemplatesAreEnabled(): boolean {
    return this.applicationConfiguration?.capabilities.approvalStepTemplates === true;
  }

  get approvalRequestRevisionsAreEnabled(): boolean {
    return this.applicationConfiguration?.capabilities.approvalRequestRevisions === true;
  }

  get sharedVerificationLinksAreEnabled(): boolean {
    return this.applicationConfiguration?.capabilities.sharedVerificationLinks === true;
  }

  get requiresConfirmedEmail(): boolean {
    return this.applicationConfiguration?.requiresConfirmedEmail === true;
  }

  load = async (): Promise<void> => {
    const configuration =
      await applicationConfigurationApi.getApplicationConfiguration();
    runInAction(() => {
      this.applicationConfiguration = configuration;
    });
  };
}
