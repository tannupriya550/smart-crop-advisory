import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface Land {
  _id: string;
  lat: number;
  lng: number;
  size: string;
  price: string;
  status: string;
}

export default function LandMap() {
  const [lands, setLands] = useState<Land[]>([]);

  useEffect(() => {
    axios.get("/api/land").then((res) => setLands(res.data));
  }, []);

  return (
    <div className="h-[90vh] w-full">
      <MapContainer center={[20.5937, 78.9629]} zoom={5} className="h-full w-full">
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {lands.map((land) => (
          <Marker key={land._id} position={[land.lat, land.lng]} icon={markerIcon}>
            <Popup>
              <b>Available Land</b><br />
              Size: {land.size}<br />
              Price: {land.price}<br />
              Status: {land.status}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
