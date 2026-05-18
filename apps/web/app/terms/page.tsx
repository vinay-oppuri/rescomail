const Page = () => {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-16">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
        <p className="text-sm text-muted-foreground">
          This page is a product placeholder. Replace it with reviewed legal
          copy before public launch.
        </p>
      </div>

      <div className="space-y-4 text-sm leading-7 text-muted-foreground">
        <p>
          Rescomail provides tools for resume analysis, outreach drafting, and
          application organization. AI-generated suggestions should be reviewed
          before use.
        </p>
        <p>
          Paid-plan terms, refunds, acceptable use, and data-processing language
          should be finalized before accepting production customers.
        </p>
      </div>
    </main>
  );
};

export default Page;
