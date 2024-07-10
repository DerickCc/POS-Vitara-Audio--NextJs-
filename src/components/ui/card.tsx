export default function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-muted bg-gray-0 p-5 dark:bg-gray-50 lg:p-7 rounded-lg shadow-sm">
      {children}
    </div>
  );
}
