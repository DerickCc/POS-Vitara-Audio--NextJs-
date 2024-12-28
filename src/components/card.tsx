import cn from "@/utils/class-names";

export default function Card({
  className,
  children,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={cn(
        "border border-muted bg-gray-0 p-7 dark:bg-gray-50 rounded-lg shadow-spread",
        "print:border-none print:shadow-none print:bg-transparent print:p-0",
        className
      )}
    >
      {children}
    </div>
  );
}
