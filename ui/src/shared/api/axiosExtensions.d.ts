import "axios";

declare module "axios" {
  interface AxiosRequestConfig {
    useWorkEmployeeContext?: boolean;
    workEmployeeRetry?: boolean;
  }
}
