import { makeAutoObservable, runInAction } from "mobx";
import { productInfo } from "../lib/controllers/product";
import { IProductInfo } from "../models/productInfo";

export class ProductStore {
  productInfo: IProductInfo | null;

  constructor(productInfoValue: IProductInfo | null = null) {
    this.productInfo = productInfoValue;
    makeAutoObservable(this);
  }

  get tenantsAreEnabled(): boolean {
    return this.productInfo?.capabilities.tenants === true;
  }

  load = async (): Promise<void> => {
    const info = await productInfo();
    runInAction(() => {
      this.productInfo = info;
    });
  };
}
