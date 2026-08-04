import HomeNavbar from "../../modules/home/ui/components/home-navbar";
import HomeFooter from "../../modules/home/ui/components/home-footer";

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="sticky top-0 z-50">
        <HomeNavbar />
      </div>
      <main className="flex-1">{children}</main>
      <div className="relative z-10">
        <HomeFooter />
      </div>
    </div>
  );
}
