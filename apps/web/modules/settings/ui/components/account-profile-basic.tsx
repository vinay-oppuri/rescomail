"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useUploadThing } from "@/lib/uploadthing";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/avatar";
import { Badge } from "@repo/ui/components/badge";
import { ConfirmDialog } from "@repo/ui/components/confirm-dialog";
import { Camera, Mail, Shield, Calendar, Loader2, Trash2 } from "lucide-react";
import { DeleteAvatarAction } from "../../server/actions";

interface AccountProfileBasicProps {
  user: {
    name: string;
    email: string;
    image?: string | null;
    createdAt: Date;
    emailVerified: boolean;
  };
}

export function AccountProfileBasic({ user }: AccountProfileBasicProps) {
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { startUpload } = useUploadThing("avatarUploader", {
    onClientUploadComplete: () => {
      setIsUploading(false);
      router.refresh();
    },
    onUploadError: (error) => {
      setIsUploading(false);
      console.error(error);
      alert("Failed to upload image. Please try again.");
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    await startUpload([file]);
  };

  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex items-center gap-5">
      <div className="relative shrink-0">
        <Avatar className="h-20 w-20 border-2 border-foreground/5 bg-muted">
          <AvatarImage src={user.image ?? undefined} alt={user.name} />
          <AvatarFallback className="text-xl font-semibold text-muted-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
        {user.image ? (
          <ConfirmDialog
            title="Remove Profile Photo"
            description="Are you sure you want to remove your profile photo?"
            confirmText="Remove Photo"
            onConfirm={async () => {
              await DeleteAvatarAction();
              router.refresh();
            }}
            trigger={
              <button
                className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-foreground/5 bg-background shadow-sm hover:text-destructive text-muted-foreground transition-colors"
                title="Remove avatar"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            }
          />
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-foreground/5 bg-background shadow-sm hover:bg-muted transition-colors disabled:opacity-50"
            title="Upload avatar"
          >
            {isUploading ? (
              <Loader2 className="h-3.5 w-3.5 text-muted-foreground animate-spin" />
            ) : (
              <Camera className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </button>
        )}
      </div>

      <div className="space-y-1.5 min-w-0 flex-1">
        <p className="text-sm font-semibold truncate">
          {user.name || "Unknown User"}
        </p>
        
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Mail className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{user.email}</span>
        </div>
        <div className="flex items-center gap-2">
          {user.emailVerified && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
              <Shield className="mr-1 h-2.5 w-2.5 text-green-500" />
              Verified
            </Badge>
          )}
          <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">
            <Calendar className="mr-1 h-2.5 w-2.5" />
            {memberSince}
          </Badge>
        </div>
      </div>
    </div>
  );
}
