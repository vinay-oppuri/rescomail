"use client";

import { useEffect, useState } from "react";
import { Button } from "@repo/ui/components/button";
import { User, CheckCircle2, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import UserProfileDialog from "./user-profile-dialog";

export default function DashboardClient() {
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isAutomatic, setIsAutomatic] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/user-profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        return data;
      }
    } catch (err) {
      console.error("Failed to fetch user profile", err);
    }
    return null;
  };

  useEffect(() => {
    const checkProfilePrompt = async () => {
      const data = await fetchProfile();
      if (data && data.should_prompt) {
        setIsAutomatic(true);
        setDialogOpen(true);
      }
    };

    checkProfilePrompt();
  }, []);

  const handleSaveSuccess = async () => {
    await fetchProfile();
    setToastVisible(true);
    // Auto-dismiss toast after 4 seconds
    setTimeout(() => {
      setToastVisible(false);
    }, 4000);
  };

  const handleManualEdit = () => {
    setIsAutomatic(false);
    setDialogOpen(true);
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={handleManualEdit}
        className="h-9 md:h-11 px-3 md:px-5 border-border/50 hover:bg-muted transition-all text-xs md:text-sm font-medium bg-card/50 backdrop-blur-sm shrink-0"
      >
        <User className="mr-2 h-4 w-4 text-primary" /> Edit Profile
      </Button>

      <UserProfileDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={profile}
        onSaveSuccess={handleSaveSuccess}
        isAutomaticPrompt={isAutomatic}
      />

      {/* Premium Glassmorphic Toast Notification */}
      <AnimatePresence>
        {toastVisible && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-background/80 backdrop-blur-md border border-emerald-500/20 text-foreground px-4 py-3 rounded-lg shadow-2xl max-w-sm"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 shrink-0">
              <CheckCircle2 className="h-4.5 w-4.5" />
            </div>
            <div className="flex-1 flex flex-col pr-2">
              <span className="text-xs font-bold leading-tight">Profile saved!</span>
              <span className="text-[10px] text-muted-foreground mt-0.5">
                Your details will be used in generated resumes.
              </span>
            </div>
            <button
              onClick={() => setToastVisible(false)}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
