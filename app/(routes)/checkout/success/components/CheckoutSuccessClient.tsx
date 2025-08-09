"use client";

import { useConfirmPedido } from "../hook/useConfirmPedido";
import SuccessLayout from "./SuccessLayout";
import SuccessMessage from "./SuccessMessage";
import SuccessActions from "./SuccessActions";

export default function CheckoutSuccessClient() {
  const { estado } = useConfirmPedido();

  return (
    <SuccessLayout>
      <SuccessMessage estado={estado} />
      <SuccessActions />
    </SuccessLayout>
  );
}