import { Link } from "@heroui/link";
export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col h-[100dvh] w-[100dvw]">
      <main className="container mx-auto max-w-7xl flex-grow pt-6 w-full h-full px-10">
        {children}
      </main>
      <footer className="w-full flex items-center justify-center py-3">
        <Link
          isExternal
          className="flex items-center gap-1 text-current"
          href="https://heroui.com"
          title="heroui.com homepage"
        >
          <p className="text-primary">Innit</p>
        </Link>
      </footer>
    </div>
  );
}
