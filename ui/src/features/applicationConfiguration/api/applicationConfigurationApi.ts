import { ApplicationConfiguration } from "@/features/applicationConfiguration/models/applicationConfiguration";
import axios from "@/shared/api/axios";

export const getApplicationConfiguration = async (): Promise<ApplicationConfiguration> => {
  const { data } = await axios.get<ApplicationConfiguration>("api/v1/products/info");
  return data;
};
