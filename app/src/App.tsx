import React from "react";
import MapComponent from "./components/Map";

const App: React.FC = () => {
    return (
        <div style={{ width: "100vw", height: "100vh", margin: 0, padding: 0, overflow: "hidden" }}>
            <MapComponent />
        </div>
    );
};

export default App;
