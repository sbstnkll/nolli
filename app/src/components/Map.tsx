import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const MapComponent = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [zoom, setZoom] = useState<number>(14);
  const [map, setMap] = useState<maplibregl.Map | null>(null);

  // Sichtbarkeits-States für die verschiedenen Layer:
  const [isTransportationVisible, setIsTransportationVisible] = useState<boolean>(true);
  const [isCityLabelsVisible, setIsCityLabelsVisible] = useState<boolean>(true);
  const [isPoiLabelsVisible, setIsPoiLabelsVisible] = useState<boolean>(true);
  const [isStreetNamesVisible, setIsStreetNamesVisible] = useState<boolean>(true);

  const minZoom = 0;
  const maxZoom = 22;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const newMap = new maplibregl.Map({
      container: mapContainerRef.current,
      // Damit das WebGL-Canvas seinen Inhalt behält:
      preserveDrawingBuffer: true,
      style: {
        version: 8,
        glyphs: "/fonts/{fontstack}/{range}.pbf",
        sources: {
          germanyTiles: {
            type: "vector",
            tiles: ["http://0.0.0.0:3000/germany-latest/{z}/{x}/{y}"],
            minzoom: 0,
            maxzoom: 14,
          },
        },
        layers: [
          {
            id: "building",
            type: "fill",
            source: "germanyTiles",
            "source-layer": "building",
            minzoom: minZoom,
            maxzoom: maxZoom,
            paint: {
              "fill-color": "#000000",
              "fill-opacity": 1,
            },
          },
          {
            id: "transportation-layer",
            type: "line",
            source: "germanyTiles",
            "source-layer": "transportation",
            paint: {
              "line-color": "#999999",
              "line-width": 2,
            },
            layout: {
              visibility: isTransportationVisible ? "visible" : "none",
            },
          },
          {
            id: "city-labels",
            type: "symbol",
            source: "germanyTiles",
            "source-layer": "place",
            layout: {
              "text-field": ["get", "name:latin"],
              "text-font": ["Noto Sans Regular"],
              "text-size": [
                "interpolate",
                ["linear"],
                ["zoom"],
                10, 10,
                16, 20,
              ],
              "text-anchor": "center",
              visibility: isCityLabelsVisible ? "visible" : "none",
            },
            paint: {
              "text-color": "#ffffff",
              "text-halo-color": "#000000",
              "text-halo-width": 2,
            },
          },
          {
            id: "poi-labels",
            type: "symbol",
            source: "germanyTiles",
            "source-layer": "poi",
            minzoom: 12,
            layout: {
              "text-field": ["get", "name:latin"],
              "text-font": ["Noto Sans Regular"],
              "text-size": [
                "interpolate",
                ["linear"],
                ["zoom"],
                12, 10,
                16, 16,
              ],
              "text-anchor": "center",
              visibility: isPoiLabelsVisible ? "visible" : "none",
            },
            paint: {
              "text-color": "#ffffff",
              "text-halo-color": "#000000",
              "text-halo-width": 2,
            },
          },
          {
            id: "street-labels",
            type: "symbol",
            source: "germanyTiles",
            "source-layer": "transportation_name",
            minzoom: 12,
            layout: {
              "text-field": ["get", "name:latin"],
              "text-font": ["Noto Sans Regular"],
              "text-size": [
                "interpolate",
                ["linear"],
                ["zoom"],
                12, 10,
                16, 16,
              ],
              "symbol-placement": "line",
              visibility: isStreetNamesVisible ? "visible" : "none",
            },
            paint: {
              "text-color": "#ffffff",
              "text-halo-color": "#000000",
              "text-halo-width": 1.5,
            },
          },
        ],
      },
      center: [7.2165, 51.4818],
      zoom: zoom,
      minZoom: minZoom,
      maxZoom: maxZoom,
    });

    newMap.on("zoom", () => {
      let currentZoom = newMap.getZoom();
      setZoom(currentZoom.toFixed(2));
    });

    setMap(newMap);

    return () => newMap.remove();
  }, []);

  // Export current map view as PNG
  // Export current map view as PNG using the "idle" event
const exportRaster = () => {
  if (!map) return;
  // Trigger einen Repaint und warte darauf, dass die Karte in den Idle-Zustand wechselt
  map.triggerRepaint();
  map.once("idle", () => {
    const canvas = map.getCanvas();
    const dataURL = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "map_export.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
};


  // Handler für die Checkboxen: Wir aktualisieren den entsprechenden Layer, wenn der State sich ändert.
  const handleCheckboxChange = (layer: "transportation" | "city" | "poi" | "street", checked: boolean) => {
    if (!map) return;
    switch (layer) {
      case "transportation":
        map.setLayoutProperty("transportation-layer", "visibility", checked ? "visible" : "none");
        setIsTransportationVisible(checked);
        break;
      case "city":
        map.setLayoutProperty("city-labels", "visibility", checked ? "visible" : "none");
        setIsCityLabelsVisible(checked);
        break;
      case "poi":
        map.setLayoutProperty("poi-labels", "visibility", checked ? "visible" : "none");
        setIsPoiLabelsVisible(checked);
        break;
      case "street":
        map.setLayoutProperty("street-labels", "visibility", checked ? "visible" : "none");
        setIsStreetNamesVisible(checked);
        break;
    }
  };

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      {/* Map Container */}
      <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />

      {/* Zoom-Level Debug-Overlay */}
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          background: "rgba(0,0,0,0.7)",
          color: "white",
          padding: "5px 10px",
          borderRadius: "5px",
          fontSize: "14px",
        }}
      >
        Zoom-Level: {zoom}
      </div>

      {/* Checkbox-Container */}
      <div
        style={{
          position: "absolute",
          top: 50,
          left: 10,
          background: "rgba(255,255,255,0.8)",
          padding: "10px",
          borderRadius: "5px",
          fontSize: "14px",
          color: "#000",
        }}
      >
        <div>
          <label>
            <input
              type="checkbox"
              checked={isTransportationVisible}
              onChange={(e) => handleCheckboxChange("transportation", e.target.checked)}
            />{" "}
            Roads
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={isCityLabelsVisible}
              onChange={(e) => handleCheckboxChange("city", e.target.checked)}
            />{" "}
            City Names
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={isPoiLabelsVisible}
              onChange={(e) => handleCheckboxChange("poi", e.target.checked)}
            />{" "}
            POIs
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={isStreetNamesVisible}
              onChange={(e) => handleCheckboxChange("street", e.target.checked)}
            />{" "}
            Street Names
          </label>
        </div>
      </div>

      {/* Button to export current map view as PNG */}
      <button
        onClick={exportRaster}
        style={{
          position: "absolute",
          bottom: 10,
          left: 10,
          background: "#4444ff",
          color: "white",
          padding: "10px 15px",
          borderRadius: "5px",
          border: "none",
          cursor: "pointer",
          fontSize: "14px",
        }}
      >
        Export as PNG
      </button>
    </div>
  );
};

export default MapComponent;
