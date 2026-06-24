"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useUploadThing } from "@/lib/uploadthing";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/avatar";
import { Badge } from "@repo/ui/components/badge";
import { Input } from "@repo/ui/components/input";
import { ConfirmDialog } from "@repo/ui/components/confirm-dialog";
import { Camera, Mail, Shield, Calendar, Pencil, Check, X, Loader2, Trash2 } from "lucide-react";
import { DeleteAvatarAction } from "../../server/actions";

interface AccountProfileBasicProps {
  user: {
    name: string;
    email: string;
    image?: string | null;
    createdAt: Date;
    emailVerified: boolean;
  };
  name: string;
  setName: (name: string) => void;
}

export function AccountProfileBasic({ user, name, setName }: AccountProfileBasicProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(name);
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

  const handleSave = () => {
    setName(tempName);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempName(name);
    setIsEditing(false);
  };

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
        <div className="flex items-center gap-2">
          {isEditing ? (
            <div className="flex items-center gap-1.5">
              <Input
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="h-7 text-sm py-1 px-2 w-48 bg-muted/20 border-foreground/10"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave();
                  else if (e.key === "Escape") handleCancel();
                }}
              />
              <button
                onClick={handleSave}
                className="text-green-500 hover:bg-green-500/10 p-1.5 rounded-sm transition-colors"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={handleCancel}
                className="text-muted-foreground hover:bg-muted p-1.5 rounded-sm transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group">
              <p className="text-sm font-semibold truncate">
                {name || "Unknown User"}
              </p>
              <button
                onClick={() => setIsEditing(true)}
                className="text-muted-foreground hover:text-foreground transition-opacity p-1"
                title="Edit name"
              >
                <Pencil className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
        
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
