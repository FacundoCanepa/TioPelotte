"use client";

import { useEffect, useState } from "react";
import { zonas } from "@/app/(routes)/ubicacion/components/zonas";
import CheckoutForm from "./CheckoutForm";
import "leaflet/dist/leaflet.css";

const CheckoutDeliveryMap = ({
  tipoEntrega,
  zona,
  setZona,
  direccion,
  setDireccion,
  referencias,
  setReferencias,
}: {
  tipoEntrega: "domicilio" | "local";
  zona: string;
  setZona: (val: string) => void;
  direccion: string;
  setDireccion: (val: string) => void;
  referencias: string;
  setReferencias: (val: string) => void;
}) => {
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
    <div className="flex flex-col md:flex-row gap-6">
      <div className="md:w-1/2 w-full">
        <h3 className="text-lg font-semibold text-[#5A3E1B] mb-2">Zonas de entrega</h3>
        <div className="rounded-xl overflow-hidden border-4 border-[#FBE6D4] shadow-lg h-[300px] md:h-[400px] z-0 relative">

          <MapContainer
            center={[-35.02, -58.1]}
            zoom={12}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%" }}
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
        <p className="text-xs text-[#8B4513] mt-2 italic">
          Seleccioná tu zona abajo para calcular el envío.
        </p>
      </div>

      <div className="md:w-1/2 w-full">
        <CheckoutForm
          tipoEntrega={tipoEntrega}
          zona={zona}
          setZona={setZona}
          direccion={direccion}
          setDireccion={setDireccion}
          referencias={referencias}
          setReferencias={setReferencias}
        />
      </div>
    </div>
  );
};

export default CheckoutDeliveryMap;
