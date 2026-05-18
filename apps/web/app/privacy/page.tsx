const Page = () => {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-16">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">
          This page is a product placeholder. Replace it with reviewed legal
          copy before public launch.
        </p>
      </div>

      <div className="space-y-4 text-sm leading-7 text-muted-foreground">
        <p>
          Rescomail stores account information and uploaded resume metadata to
          provide resume parsing, application tracking, and AI-assisted
          workflows.
        </p>
        <p>
          Uploaded files and generated outputs should be handled as personal
          data. Production deployments should configure retention, deletion, and
          data export policies before launch.
        </p>
      </div>
    </main>
  );
};

export default Page;
