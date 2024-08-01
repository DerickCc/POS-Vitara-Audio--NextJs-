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
    <header className="mb-7">
      <div className="flex">
        <div>
          <Title as="h2" className="mb-2 text-[22px] lg:text-2xl">
            {title}
          </Title>

          {breadcrumb.map((item, idx) => (
            <div className="inline-flex items-center text-sm">
              <Link
                key={item.name}
                href={item.href ? item.href : "javascript:void(0)"}
                role="button"
                className={item.href ? "text-blue-600" : ""}
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
