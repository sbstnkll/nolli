# Verwende ein schlankes Base-Image
FROM debian:stable-slim

# Installiere notwendige Bibliotheken, falls erforderlich (z. B. ca-certificates)
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

# Kopiere die Martin-Binary und Konfigurationsdatei in den Container
COPY /tiles/martin /usr/local/bin/martin
COPY /tiles/config.yaml /data/config.yaml
COPY /tiles/germany-latest.mbtiles /data/germany-latest.mbtiles

# Exponiere den Port (Martin läuft standardmäßig auf 3000)
EXPOSE 3000

# Starte Martin mit der Konfigurationsdatei und aktiviere CORS
CMD ["martin", "--config", "/data/config.yaml", "--cors"]
