"use client";

import { useEffect, useState } from "react";
import { zonas } from "./zonas";
import "leaflet/dist/leaflet.css";

const DeliveryMap = () => {
  const [isClient, setIsClient] = useState(false);
  const [components, setComponents] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);
    Promise.all([
      import("react-leaflet"),
      import("leaflet"),
    ]).then(([leaflet, L]) => {
      setComponents({
        MapContainer: leaflet.MapContainer,
        TileLayer: leaflet.TileLayer,
        Polygon: leaflet.Polygon,
        Tooltip: leaflet.Tooltip,
        Marker: leaflet.Marker,
        Popup: leaflet.Popup,
        L: L.default,
      });
    });
  }, []);

  if (!isClient || !components) return null;

  const {
    MapContainer,
    TileLayer,
    Polygon,
    Tooltip,
    Marker,
    Popup,
    L,
  } = components;

  const localPosition: [number, number] = [-34.99517, -58.04874];

  return (
    <section className="my-20 px-4 md:px-8">
      <h2 className="text-3xl md:text-4xl font-garamond italic mb-4 text-center text-[#8B4513]">
        Mapa interactivo de zonas de entrega
      </h2>
      <p className="text-center text-[#6B4A2C] max-w-2xl mx-auto mb-8">
        Visualizá claramente las zonas donde realizamos envíos. Si tu barrio está incluido, podés encargar por la web y coordinamos la entrega.
      </p>
      <div className="rounded-xl overflow-hidden border-4 border-[#FBE6D4] shadow-lg">
        <MapContainer
          center={[-35.02, -58.1]}
          zoom={12}
          scrollWheelZoom={true}
          style={{ height: "500px", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.jawg.io">Jawg</a>'
            url="https://{s}.tile.jawg.io/sunny/{z}/{x}/{y}.png?access-token=4MSVRrDpN6DB4eM9p3oKlH6d6HLhyBfgWG70l7dfIshQbY5VN6SiirFBGkiiSKmY"
          />
          {zonas.map((zona, i) => (
            <Polygon
              key={i}
              positions={zona.coords}
              pathOptions={{ color: zona.color, fillOpacity: 0.5 }}
            >
              <Tooltip sticky>{`${zona.nombre} – ${zona.precio}`}</Tooltip>
            </Polygon>
          ))}
          <Marker
            position={localPosition}
            icon={L.icon({
              iconUrl:
                "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
              iconSize: [25, 41],
              iconAnchor: [12, 41],
            })}
          >
            <Popup>
              Tío Pelotte<br /> Av. 197 e/ 43 y 44, Abasto
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </section>
  );
};

export default DeliveryMap;
