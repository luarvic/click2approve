FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build-env
WORKDIR /app
COPY src/Click2Approve.WebApi ./
RUN dotnet restore
RUN dotnet publish -c Release -o out

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build-env /app/out .
COPY ./wait-for-it.sh .
RUN chmod +x wait-for-it.sh

CMD ["dotnet", "Click2Approve.WebApi.dll"]
