'use client';

import Footer from "@/components/layout/footer";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import CartFloatButton from "@/components/ui/CartFloatButton";

export default function ClientLayoutWrapper() {
  return (
    <>
      <Footer />
      <CartFloatButton />
      <WhatsAppButton />
    </>
  );
}
