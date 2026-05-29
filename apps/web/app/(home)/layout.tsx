import HomeNavbar from "../../modules/home/ui/components/home-navbar";
import HomeFooter from "../../modules/home/ui/components/home-footer";

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/10 transition-all">
        <HomeNavbar />
      </div>
      <main className="flex-1">{children}</main>
      <HomeFooter />
    </div>
  );
}
