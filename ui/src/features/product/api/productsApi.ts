import { ProductInfo } from "@/features/product/models/productInfo";
import axios from "@/shared/api/axios";

export const getProductInfo = async (): Promise<ProductInfo> => {
  const { data } = await axios.get<ProductInfo>("api/v1/products/info");
  return data;
};
