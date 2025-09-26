"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type HTMLAttributes,
} from "react";
import { X } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

import { cn } from "@/lib/utils";

type WhatsAppMessageDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phone?: string | null;
  suggestedMessage: string;
  countryCode?: string;
  onSent?: (message: string) => void;
};

const COUNTRY_PREFIXES: Record<string, string> = {
  AR: "54",
};

function normalizePhoneForWhatsApp(phone: string, countryCode: string): string {
  if (!phone) {
    return "";
  }

  let sanitized = phone.replace(/[^\d+]/g, "");

  if (!sanitized) {
    return "";
  }

  if (sanitized.startsWith("+")) {
    sanitized = sanitized.slice(1);
  }

  if (sanitized.startsWith("00")) {
    sanitized = sanitized.slice(2);
  }

  const upperCountry = countryCode.toUpperCase();

  if (upperCountry === "AR") {
    if (sanitized.startsWith("0")) {
      sanitized = sanitized.slice(1);
    }

    if (sanitized.startsWith("549")) {
      return sanitized;
    }

    if (sanitized.startsWith("54")) {
      return `549${sanitized.slice(2)}`;
    }

    if (sanitized.startsWith("9")) {
      return `54${sanitized}`;
    }

    return `549${sanitized}`;
  }

  const prefix = COUNTRY_PREFIXES[upperCountry];

  if (prefix) {
    if (sanitized.startsWith(prefix)) {
      return sanitized;
    }

    if (sanitized.startsWith("0")) {
      sanitized = sanitized.slice(1);
    }

    return `${prefix}${sanitized}`;
  }

  return sanitized;
}

const Dialog = DialogPrimitive.Root;
const DialogPortal = DialogPrimitive.Portal;
const DialogOverlay = DialogPrimitive.Overlay;
const DialogContentPrimitive = DialogPrimitive.Content;
const DialogTitle = DialogPrimitive.Title;
const DialogDescription = DialogPrimitive.Description;

const DialogContent = forwardRef<
  ElementRef<typeof DialogContentPrimitive>,
  ComponentPropsWithoutRef<typeof DialogContentPrimitive>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in" />
    <DialogContentPrimitive
      ref={ref}
      className={cn(
        "fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl focus:outline-none",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-90 data-[state=open]:fade-in-90",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close
        type="button"
        className="absolute right-4 top-4 rounded-full p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
        aria-label="Cerrar"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Cerrar</span>
      </DialogPrimitive.Close>
    </DialogContentPrimitive>
  </DialogPortal>
));
DialogContent.displayName = DialogContentPrimitive.displayName;

const DialogHeader = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
);

const DialogFooter = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />
);

export function WhatsAppMessageDialog({
  open,
  onOpenChange,
  phone,
  suggestedMessage,
  countryCode = "AR",
  onSent,
}: WhatsAppMessageDialogProps) {
  const [message, setMessage] = useState(suggestedMessage);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (open) {
      setMessage(suggestedMessage);
    }
  }, [open, suggestedMessage]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length
      );
    }, 60);

    return () => window.clearTimeout(timeoutId);
  }, [open]);

  const normalizedPhone = useMemo(
    () => normalizePhoneForWhatsApp(phone ?? "", countryCode),
    [phone, countryCode]
  );

  const sendDisabled = !normalizedPhone;

  const handleClose = useCallback(
    (nextOpen: boolean) => {
      onOpenChange(nextOpen);
    },
    [onOpenChange]
  );

  const handleSend = useCallback(() => {
    if (sendDisabled || typeof window === "undefined") {
      return;
    }

    const trimmed = message.trim();
    const finalMessage = trimmed.length > 0 ? trimmed : suggestedMessage;
    const whatsappUrl = `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(finalMessage)}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    onSent?.(finalMessage);
    onOpenChange(false);
  }, [message, normalizedPhone, onOpenChange, onSent, sendDisabled, suggestedMessage]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-[#8B4513]">
            Enviar mensaje por WhatsApp
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            Revisá y editá el mensaje antes de enviarlo. Se abrirá WhatsApp Web en una nueva pestaña.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-3">
          <div>
            <label htmlFor="whatsapp-message" className="text-sm font-medium text-gray-700">
              Mensaje
            </label>
            <textarea
              id="whatsapp-message"
              ref={textareaRef}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={6}
              className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#8B4513] focus:outline-none focus:ring-2 focus:ring-[#8B4513]/40"
            />
          </div>

          {normalizedPhone ? (
            <p className="text-sm text-gray-500">
              Se enviará a <span className="font-medium text-gray-800">+{normalizedPhone}</span>.
            </p>
          ) : (
            <p className="text-sm text-red-600">
              No se encontró un teléfono válido para este proveedor.
            </p>
          )}
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={sendDisabled}
            className={cn(
              "inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow transition",
              "hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
            )}
          >
            Enviar
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
