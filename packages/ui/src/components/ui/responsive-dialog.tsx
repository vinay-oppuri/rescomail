"use client"

import * as React from "react"

import { cn } from "../../lib/utils"
import { useIsMobile } from "../../hooks/use-mobile"

import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "./dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./drawer"

interface ResponsiveDialogProps {
  title: React.ReactNode
  description: React.ReactNode
  children: React.ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
  trigger?: React.ReactNode
  /** Applied to the desktop dialog content, after the component defaults. */
  className?: string
  /** Applied only to the mobile drawer content. */
  drawerContentClassName?: string
  /** Applied to the shared content wrapper on desktop and mobile. */
  bodyClassName?: string
  /** Applied to the mobile content wrapper only. */
  drawerBodyClassName?: string
  hideHeader?: boolean
  showCloseButton?: boolean
}

export const ResponsiveDialog = ({
  title,
  description,
  children,
  open,
  onOpenChange,
  trigger,
  className,
  drawerContentClassName,
  bodyClassName,
  drawerBodyClassName,
  hideHeader = false,
  showCloseButton = true,
}: ResponsiveDialogProps) => {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange} direction="top">
        {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
        <DrawerContent
          className={cn(
            "rounded-b-2xl border-b bg-background shadow-lg",
            drawerContentClassName,
          )}
        >
          {hideHeader ? (
            <DrawerHeader className="sr-only">
              <DrawerTitle>{title}</DrawerTitle>
              <DrawerDescription>{description}</DrawerDescription>
            </DrawerHeader>
          ) : (
            <DrawerHeader className="border-b px-4 pb-2 pt-4">
              <DrawerTitle className="text-base font-semibold">{title}</DrawerTitle>
              <DrawerDescription className="text-sm text-muted-foreground">
                {description}
              </DrawerDescription>
            </DrawerHeader>
          )}
          <div
            className={cn(
              "max-h-[60vh] overflow-y-auto px-4 py-4",
              hideHeader && "max-h-[85vh] p-0",
              bodyClassName,
              drawerBodyClassName,
            )}
          >
            {children}
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        className={cn("max-w-sm rounded-2xl shadow-xl", className)}
        showCloseButton={showCloseButton}
      >
        <DialogHeader className={cn(hideHeader && "sr-only")}>
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className={cn("py-2", hideHeader && "p-0", bodyClassName)}>
          {children}
        </div>
      </DialogContent>
    </Dialog>
  )
}
