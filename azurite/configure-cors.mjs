import { BlobServiceClient } from "@azure/storage-blob";

const corsRule = {
  allowedHeaders: "*",
  allowedMethods: "GET,HEAD",
  allowedOrigins: "http://localhost:3333",
  exposedHeaders: "*",
  maxAgeInSeconds: 3600
};

const serviceClient = BlobServiceClient.fromConnectionString(
  "UseDevelopmentStorage=true"
);

for (;;) {
  try {
    await serviceClient.setProperties({ cors: [corsRule] });
    console.log("Configured Azurite blob CORS for http://localhost:3333.");
    break;
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}
