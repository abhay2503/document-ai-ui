import { CircleExclamationPoint } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorAlertProps {
  title: string;
  message: string;
  actions?: { label: string; onClick: () => void }[];
}

export function ErrorAlert({ title, message, actions = [] }: ErrorAlertProps) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 sm:flex-row sm:items-center motion-safe:animate-in motion-safe:fade-in"
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <CircleExclamationPoint className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden />
        <div className="min-w-0">
          <p className="text-sm font-medium text-destructive">{title}</p>
          <p className="mt-0.5 text-sm text-pretty text-muted-foreground">{message}</p>
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
        {actions.map((action) => (
          <Button key={action.label} variant="outline" size="sm" onClick={action.onClick} className="bg-card">
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
