"use client";

import { useCartStore } from "@/store/cart-store";
import { useUserStore } from "@/store/user-store";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Phone } from "lucide-react";

import CheckoutProductsList from "./CheckoutProductsList";
import CheckoutResumen from "./CheckoutResumen";
import CheckoutDeliverySelector from "./CheckoutDeliverySelector";
import CheckoutForm from "./CheckoutForm";
import dynamic from "next/dynamic";
const CheckoutDeliveryMap = dynamic(() => import("./CheckoutDeliveryMap"), { ssr: false });
import CheckoutPaymentMethod from "./CheckoutPaymentMethod";
import MercadoPagoButton from "./MercadoPagoButton";
import { zonas } from "@/app/(routes)/ubicacion/components/zonas";

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useCartStore((state) => state.cart);
  const clearCart = useCartStore((state) => state.clearCart);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);

  const tipoEntrega = useCartStore((state) => state.tipoEntrega);
  const setTipoEntrega = useCartStore((state) => state.setTipoEntrega);

  const zona = useCartStore((state) => state.zona);
  const setZona = useCartStore((state) => state.setZona);

  const direccion = useCartStore((state) => state.direccion);
  const setDireccion = useCartStore((state) => state.setDireccion);

  const referencias = useCartStore((state) => state.referencias);
  const setReferencias = useCartStore((state) => state.setReferencias);

  const tipoPago = useCartStore((state) => state.tipoPago);
  const setTipoPago = useCartStore((state) => state.setTipoPago);

  const setTotal = useCartStore((state) => state.setTotal);

  const setNombre = useCartStore((state) => state.setNombre);
  const nombre = useCartStore((state) => state.nombre);

  const telefono = useCartStore((state) => state.telefono);
  const setTelefono = useCartStore((state) => state.setTelefono);

  const user = useUserStore((state) => state.user);

  const [error, setError] = useState("");
  const [nombreError, setNombreError] = useState(false);
  const [telefonoError, setTelefonoError] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!user) return;
    setNombre(user.username ?? "");
    setTelefono(user.telefono ?? "");
    setZona(user.zona ?? "");
    setDireccion(user.direccion ?? "");
    setReferencias(user.referencias ?? "");
  }, [user]);

  const totalProductos = getTotalPrice();
  const zonaSeleccionada = tipoEntrega === "domicilio" ? zonas.find((z) => z.nombre === zona) : null;
  const costoEnvio = zonaSeleccionada
    ? parseInt(zonaSeleccionada.precio.replace(/[$.]/g, ""))
    : 0;
  const totalGeneral = totalProductos + costoEnvio;

  useEffect(() => {
    setTotal(totalGeneral);
  }, [totalGeneral]);
    const handleConfirmRetiro = async () => {

      const payload = {
        items: cart.map((item) => ({
        title: `${item.product.productName} · ${item.quantity} ${item.product.unidadMedida}`,
          quantity: 1,
          unit_price: Math.round(item.quantity * item.product.price),
          product_name: item.product.productName,
        })),
        total: totalGeneral,
        estado: "Pendiente",
        zona,
        direccion,
        referencias,
        telefono,
        nombre,
        tipoEntrega: "local",
        tipoPago: "Elegís al momento de pagar",
      };


  try {
    const res = await fetch("/api/crear-pedido", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Error al crear el pedido");
    }

    clearCart();
    router.push("/checkout/success");
  } catch (error) {
    setError("Ocurrió un error al confirmar el pedido. Intentalo de nuevo.");
  }
};



  const camposCompletos =
    nombre && telefono && zona && direccion && tipoPago && !nombreError && !telefonoError;

  const validarNombre = (value: string) => {
    const valido = /^[^\d]*$/.test(value);
    setNombreError(!valido);
    setNombre(value);
  };

  const validarTelefono = (value: string) => {
    const valido = /^[0-9]+$/.test(value);
    setTelefonoError(!valido);
    setTelefono(value);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen py-20 px-6 text-center text-[#8B4513]">
        <h2 className="text-3xl font-garamond italic">Tu carrito está vacío 🧺</h2>
        <button
          onClick={() => router.push("/productos")}
          className="mt-6 bg-[#FFD966] hover:bg-[#e6c753] text-[#5A3E1B] px-4 py-2 rounded-md"
        >
          Ver productos
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBE6D4] py-12 px-4 md:px-16 space-y-10 relative">
      {showToast && (
        <div className="fixed inset-0 z-50 flex justify-center items-center backdrop-blur-sm bg-black/10">
          <div className="bg-white text-center p-6 rounded-xl shadow-xl space-y-4 z-50">
            <h2 className="text-lg font-semibold text-[#5A3E1B]">¿Querés confirmar tu pedido para retirar en el local?</h2>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleConfirmRetiro}
                className="bg-[#2ecc71] text-white px-4 py-2 rounded-md"
              >
                Confirmar
              </button>
              <button
                onClick={() => setShowToast(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
              >
                Seguir comprando
              </button>
            </div>
          </div>
        </div>
      )}

      <h1 className="text-4xl font-garamond text-[#5A3E1B] text-center mb-4">
        Confirmá tu pedido 🍝
      </h1>

      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr,1fr]">
        <div className="space-y-6">
          <CheckoutProductsList />
          <CheckoutResumen
            subtotal={totalProductos}
            envio={costoEnvio}
            total={totalGeneral}
            metodoPago={tipoPago}
          />
        </div>

        <div className="bg-[#FFF8EB] rounded-2xl border border-[#E0E0E0] shadow-lg p-6 space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-[#8B4513]">Tus datos</h2>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#5A3E1B] flex items-center gap-1">
                <User size={16} /> Nombre y Apellido
              </label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => validarNombre(e.target.value)}
                className="w-full border px-4 py-2 rounded-md text-sm bg-white"
              />
              {nombreError && <p className="text-red-600 text-sm">No se permiten números en el nombre</p>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#5A3E1B] flex items-center gap-1">
                <Phone size={16} /> Teléfono
              </label>
              <input
                type="tel"
                required
                value={telefono}
                onChange={(e) => validarTelefono(e.target.value)}
                className="w-full border px-4 py-2 rounded-md text-sm bg-white"
              />
              {telefonoError && <p className="text-red-600 text-sm">Solo se permiten números sin espacios</p>}
            </div>

            <CheckoutDeliverySelector tipoEntrega={tipoEntrega} setTipoEntrega={setTipoEntrega} />

            {tipoEntrega === "domicilio" ? (
              <CheckoutDeliveryMap
                tipoEntrega={tipoEntrega}
                zona={zona}
                setZona={setZona}
                direccion={direccion}
                setDireccion={setDireccion}
                referencias={referencias}
                setReferencias={setReferencias}
              />
            ) : (
              <CheckoutForm
                tipoEntrega={tipoEntrega}
                zona={zona}
                setZona={setZona}
                direccion={direccion}
                setDireccion={setDireccion}
                referencias={referencias}
                setReferencias={setReferencias}
              />
            )}

            {tipoEntrega === "domicilio" && (
              <CheckoutPaymentMethod metodoPago={tipoPago} setMetodoPago={setTipoPago} />
            )}

            {error && <p className="text-red-600 text-sm">{error}</p>}

            {tipoEntrega === "domicilio" ? (
              camposCompletos ? (
                <MercadoPagoButton total={tipoPago === "efectivo" ? Math.round(totalGeneral * 0.1) : totalGeneral} />
              ) : (
                <button
                  type="button"
                  className="mt-4 bg-[#2ecc71] text-white w-full py-2 rounded-md opacity-70 cursor-not-allowed"
                  onClick={() => setError("Completá todos los campos correctamente para continuar con el pago")}
                >
                  Ir a pagar
                </button>
              )
            ) : (
              <button
                onClick={() => {
                  if (!nombre || !telefono || nombreError || telefonoError) {
                    setError("Completá correctamente todos los campos para continuar");
                  } else {
                    setShowToast(true);
                  }
                }}
                className="w-full bg-[#FFD966] text-[#5A3E1B] hover:bg-[#f5c741] px-4 py-2 rounded-md"
              >
                Confirmar pedido
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
