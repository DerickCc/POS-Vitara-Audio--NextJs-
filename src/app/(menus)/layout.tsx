import MainLayout from "@/layouts/(main-layout-components)/layout";

export default function MenuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>
}
