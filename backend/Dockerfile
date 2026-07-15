FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

# Copy solution and project files first for optimized Docker caching
COPY *.sln ./
COPY JobTracker.API/*.csproj ./JobTracker.API/
COPY JobTracker.Application/*.csproj ./JobTracker.Application/
COPY JobTracker.Domain/*.csproj ./JobTracker.Domain/
COPY JobTracker.Infrastructure/*.csproj ./JobTracker.Infrastructure/

# Restore NuGet dependencies using the .NET 10 SDK
RUN dotnet restore

# Copy the rest of the code and publish the API project
COPY . ./
RUN dotnet publish JobTracker.API/JobTracker.API.csproj -c Release -o /app/out

# Build the lightweight runtime container using .NET 10 ASP.NET runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/out ./

# Ensure Railway's port binding works
ENV ASPNETCORE_URLS=http://0.0.0.0:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "JobTracker.API.dll"]