import * as productApi from "@/features/product/api/productsApi";
import { ProductInfo } from "@/features/product/models/productInfo";
import { makeAutoObservable, runInAction } from "mobx";

export class ProductStore {
  productInfo: ProductInfo | null;

  constructor(productInfoValue: ProductInfo | null = null) {
    this.productInfo = productInfoValue;
    makeAutoObservable(this);
  }

  get tenantsAreEnabled(): boolean {
    return this.productInfo?.capabilities.tenants === true;
  }

  get employeeAssigneesAreEnabled(): boolean {
    return this.productInfo?.capabilities.employeeAssignees === true;
  }

  get teamAssigneesAreEnabled(): boolean {
    return this.productInfo?.capabilities.teamAssignees === true;
  }

  get approvalStepTemplatesAreEnabled(): boolean {
    return this.productInfo?.capabilities.approvalStepTemplates === true;
  }

  get approvalRequestRevisionsAreEnabled(): boolean {
    return this.productInfo?.capabilities.approvalRequestRevisions === true;
  }

  get sharedVerificationLinksAreEnabled(): boolean {
    return this.productInfo?.capabilities.sharedVerificationLinks === true;
  }

  get requiresConfirmedEmail(): boolean {
    return this.productInfo?.requiresConfirmedEmail === true;
  }

  load = async (): Promise<void> => {
    const info = await productApi.getProductInfo();
    runInAction(() => {
      this.productInfo = info;
    });
  };
}
