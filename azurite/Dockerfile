FROM mcr.microsoft.com/azure-storage/azurite:3.35.0

WORKDIR /opt/azurite-cors

RUN npm install --omit=dev @azure/storage-blob@12.29.1

COPY configure-cors.mjs .

ENTRYPOINT []

CMD ["sh", "-c", "azurite-blob --blobHost 0.0.0.0 --skipApiVersionCheck & node configure-cors.mjs && wait"]
