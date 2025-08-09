"use client";

import { useSearchParams } from "next/navigation";
import ResetPasswordConfirm from "./ResetPasswordConfirm";

export default function ResetPasswordConfirmClient() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");

  return <ResetPasswordConfirm code={code} />;
}