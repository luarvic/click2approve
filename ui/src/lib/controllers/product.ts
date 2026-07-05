import { IProductInfo } from "../../models/productInfo";
import axios from "../axios";

export const productInfo = async (): Promise<IProductInfo> => {
  const { data } = await axios.get<IProductInfo>("api/product/info");
  return data;
};
