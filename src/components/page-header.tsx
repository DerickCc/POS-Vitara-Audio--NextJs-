import Link from "next/link";
import { Title } from "rizzui";

export type PageHeaderTypes = {
  title: string;
  breadcrumb: { name: string; href?: string }[];
};

export default function PageHeader({
  title,
  breadcrumb,
  children,
}: React.PropsWithChildren<PageHeaderTypes>) {
  const numOfItems = breadcrumb.length;

  return (
    <header className="mt-2 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Title className="mb-2 text-[22px] lg:text-2xl">
            {title}
          </Title>

          {breadcrumb.map((item, idx) => (
            <div key={item.name} className="inline-flex items-center text-sm">
              <Link
                href={item.href ? item.href : "#"}
                role="button"
                className={item.href ? "text-primary" : "cursor-default"}
              >
                {item.name}
              </Link>
              {idx < numOfItems - 1 && (
                <span className="inline-flex h-1 w-1 rounded-full bg-gray-300 mx-3"></span>
              )}
            </div>
          ))}
        </div>

        {children}
      </div>
    </header>
  );
}
