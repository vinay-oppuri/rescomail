import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";

const Page = () => {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage profile defaults and workspace preferences.
        </p>
      </div>

      <div className="border bg-background">
        <div className="border-b px-4 py-3">
          <h2 className="text-sm font-semibold">Profile defaults</h2>
        </div>
        <div className="grid gap-4 p-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="default-role">Target role</Label>
            <Input id="default-role" placeholder="Frontend engineer" disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="default-location">Preferred location</Label>
            <Input id="default-location" placeholder="Remote" disabled />
          </div>
        </div>
        <div className="border-t p-4">
          <Button disabled>Save Settings</Button>
        </div>
      </div>
    </div>
  );
};

export default Page;
