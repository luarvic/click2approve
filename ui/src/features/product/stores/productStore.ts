import * as productApi from "@/features/product/api/productApi";
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

  get employeeApproversAreEnabled(): boolean {
    return this.productInfo?.capabilities.employeeApprovers === true;
  }

  get teamApproversAreEnabled(): boolean {
    return this.productInfo?.capabilities.teamApprovers === true;
  }

  get approvalStepTemplatesAreEnabled(): boolean {
    return this.productInfo?.capabilities.approvalStepTemplates === true;
  }

  get approvalRequestSharingIsEnabled(): boolean {
    return this.productInfo?.capabilities.approvalRequestSharing === true;
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
