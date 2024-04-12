FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build-env
WORKDIR /app
COPY src/click2approve.WebAPI ./
RUN dotnet restore
RUN dotnet publish -c Release -o out

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build-env /app/out .
COPY ./wait-for-it.sh .
RUN chmod +x wait-for-it.sh

CMD ["dotnet", "click2approve.WebAPI.dll"]
