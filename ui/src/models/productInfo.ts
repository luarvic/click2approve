export interface IProductInfo {
  edition: string;
  capabilities: IProductCapabilities;
}

export interface IProductCapabilities {
  tenants: boolean;
}
