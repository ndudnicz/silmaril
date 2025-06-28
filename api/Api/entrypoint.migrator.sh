#!/bin/bash
echo "Using connection string: $ConnectionStrings__MySql"
set -e
dotnet-ef database update -p Api.csproj -s Api.csproj
if [ $? -ne 0 ]; then
    echo "Database migration failed. Exiting."
    exit 1
fi
echo "Database migration completed successfully."
exec "$@"