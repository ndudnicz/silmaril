# docker build --no-cache -t silmaril-api . && docker run -p 5000:5000 silmaril-api

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ./ ./
RUN dotnet restore
RUN dotnet publish -o out
COPY ./Api/*.json ./out/

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /src/out .
RUN ls
EXPOSE 5000
ENV ASPNETCORE_URLS=http://+:5000
ENV ASPNETCORE_ENVIRONMENT=Development
ENTRYPOINT ["dotnet", "Api.dll"]

# FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
# WORKDIR /src

# # Copy csproj and restore
# COPY ./Api/*.csproj ./Api/
# RUN dotnet restore ./Api/Api.csproj

# # Copy the rest
# COPY . ./

# # ✅ Installer dotnet-ef tool dans le container build
# RUN dotnet tool install --global dotnet-ef
# ENV PATH="${PATH}:/root/.dotnet/tools"

# # Compile le projet
# RUN dotnet publish ./Api/Api.csproj -c Release -o /app/publish

# # Copie les fichiers JSON et le script
# COPY ./Api/appsettings*.json /app/publish/
# COPY ./Api/entrypoint.sh /app/publish/
# COPY ./Api/Api.csproj /app/publish/
# # COPY ./Api/* /app/publish/
# RUN chmod +x /app/publish/entrypoint.sh

# # Runtime image
# FROM mcr.microsoft.com/dotnet/sdk:8.0 AS final
# WORKDIR /app

# # ✅ Copier aussi le dossier .dotnet/tools pour dotnet-ef
# COPY --from=build /root/.dotnet /root/.dotnet
# ENV PATH="${PATH}:/root/.dotnet/tools"

# # Copier les fichiers buildés
# COPY --from=build /app/publish .

# EXPOSE 5000
# ENV ASPNETCORE_URLS=http://+:5000
# ENV ASPNETCORE_ENVIRONMENT=Development

# ENTRYPOINT ["./entrypoint.sh"]
