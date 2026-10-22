import { ApplicationConfiguration } from "@/features/applicationConfiguration/models/applicationConfiguration";
import axios from "@/shared/api/axios";
import { ApiPaths } from "@/shared/api/apiPaths";

export const getApplicationConfiguration = async (): Promise<ApplicationConfiguration> => {
  const { data } = await axios.get<ApplicationConfiguration>(ApiPaths.products.info);
  return data;
};
