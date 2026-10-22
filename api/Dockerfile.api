FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build-env
WORKDIR /src

COPY src/Click2Approve.WebApi/Click2Approve.WebApi.csproj src/Click2Approve.WebApi/
COPY src/Click2Approve.Application/Click2Approve.Application.csproj src/Click2Approve.Application/
COPY src/Click2Approve.Domain/Click2Approve.Domain.csproj src/Click2Approve.Domain/
COPY src/Click2Approve.Infrastructure/Click2Approve.Infrastructure.csproj src/Click2Approve.Infrastructure/
RUN dotnet restore src/Click2Approve.WebApi/Click2Approve.WebApi.csproj

COPY . ./
RUN dotnet publish src/Click2Approve.WebApi/Click2Approve.WebApi.csproj -c Release -o /app/out --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build-env /app/out .
COPY ./wait-for-it.sh .
RUN chmod +x wait-for-it.sh

CMD ["dotnet", "Click2Approve.WebApi.dll"]
