import { cn } from "rizzui";

export default function Spinner({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="w-8 h-8 border-4 border-t-primary rounded-full animate-spin"></div>
    </div>
  );
}
