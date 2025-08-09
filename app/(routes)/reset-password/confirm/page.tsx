import { Suspense } from "react";
import ResetPasswordConfirmClient from "./components/ResetPasswordConfirmClient";

export default function Page() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ResetPasswordConfirmClient />
    </Suspense>
  );
}