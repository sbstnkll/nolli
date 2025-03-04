// index.js

const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3");

let port = 5000;

// Object to reference various mbtiles DBs by endpoint name 
const databases = {
  vectortiles: {
    filePath: "../tiles/germany-latest.mbtiles", // the vectortiles file we created
    type: "vector",
  },
  rastertiles: {
  }
};

const databaseAlias = Object.keys(databases);

databaseAlias.forEach((element) => {
  databases[element].db = new sqlite3.Database(
    databases[element].filePath,
    sqlite3.OPEN_READONLY,
    (err) => {
      if (err) {
        console.log("Failed to load: " + databases[element].filePath);
        throw err;
      }
    }
  );
});

const requestListener = function (req, res) {
  const args = req.url.split("/");
  const dbAlias = args[1];
  const z = args[2] ? parseInt(args[2]) : undefined;
  const x = args[3] ? parseInt(args[3]) : undefined;
  const y = args[4] ? parseInt(args[4]) : undefined;

  if (databaseAlias.includes(dbAlias)) {
    let mod_y = Math.pow(2, z) - 1 - y;

    databases[dbAlias].db.get(
      `SELECT * FROM tiles 
           WHERE zoom_level = ${z} 
           AND tile_column = ${x} 
           AND tile_row = ${mod_y}`,
      (err, row) => {
        if (!err && row !== undefined) {
          // For vector tiles, need to define content type as octet-stream
          if (databases[dbAlias].type === "vector") {
            headers["Content-Type"] = "application/octet-stream";
            // Need to specify as gzip if pbfs are gzipped, which they
            // are when being generated by openmaptiles tooling
            headers["Content-Encoding"] = "gzip";
          }
          // For raster tiles, need to define content type as image/png
          else {
            headers["Content-Type"] = "image/png";
          }

          res.writeHead(200, headers);
          res.end(row.tile_data);
        } else {
          res.writeHead(404, headers);
          res.end();
        }
      }
    );
  } else {
    res.writeHead(400);
    res.end();
  }
};

const app = express();
app.use(cors());

app.get("*", requestListener);

app.listen(port, () =>
  console.log("Tileserver listening for connections on port: " + port)
);