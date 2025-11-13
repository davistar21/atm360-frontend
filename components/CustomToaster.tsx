import { Toaster } from "sonner";
import { CheckCircle2, AlertTriangle, Info, AlertCircle } from "lucide-react";

export function CustomToaster() {
  return (
    <Toaster
      position="bottom-right"
      richColors
      toastOptions={{
        className: "rounded-lg shadow-md border font-medium text-base",

        classNames: {
          success:
            "bg-[var(--color-zenith-success)] text-[var(--color-zenith-neutral-50)] border-[var(--color-zenith-accent-500)]",
          error:
            "bg-[var(--color-zenith-error)] text-white border-[var(--color-zenith-neutral-700)]",
          info: "bg-[var(--color-zenith-neutral-200)] text-[var(--color-zenith-neutral-900)] border-[var(--color-zenith-neutral-300)]",
        },
        //@ts-expect-error sonner types
        icons: {
          success: <CheckCircle2 className="w-5 h-5 text-white" />,
          error: <AlertCircle className="w-5 h-5 text-white" />,
          info: <Info className="w-5 h-5 text-[var(--color-zenith-warning)]" />,
        },
      }}
    />
  );
}
