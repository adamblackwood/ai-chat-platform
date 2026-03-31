#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
fix_radix_ui.py
إصلاح مشكلة مكتبات Radix UI الناقصة
يقوم بتحديث package.json وجميع ملفات components/ui/
"""

import os
import json
import sys

def create_file(path: str, content: str) -> None:
    """إنشاء أو استبدال ملف مع إنشاء المجلدات اللازمة"""
    dir_name = os.path.dirname(path)
    if dir_name:
        os.makedirs(dir_name, exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"  ✅ تم تحديث: {path}")

def fix_package_json():
    """إصلاح package.json بإضافة مكتبات Radix UI"""
    print("\n📦 إصلاح package.json...")
    print("-" * 40)

    package = {
        "name": "ai-chat-platform",
        "version": "1.0.0",
        "private": True,
        "description": "Professional Multi-Platform AI Chat Platform with Personas",
        "scripts": {
            "dev": "next dev",
            "build": "next build",
            "start": "next start",
            "lint": "next lint",
            "pages:build": "npx @cloudflare/next-on-pages",
            "pages:dev": "npx wrangler pages dev .vercel/output/static --compatibility-flag=nodejs_compat",
            "pages:deploy": "npx wrangler pages deploy .vercel/output/static"
        },
        "dependencies": {
            "next": "^14.2.0",
            "react": "^18.3.0",
            "react-dom": "^18.3.0",
            "@supabase/supabase-js": "^2.43.0",
            "@supabase/auth-helpers-nextjs": "^0.10.0",
            "@supabase/ssr": "^0.3.0",
            "zustand": "^4.5.0",
            "ai": "^3.1.0",
            "@ai-sdk/openai": "^0.0.30",
            "next-intl": "^3.14.0",
            "react-markdown": "^9.0.0",
            "rehype-highlight": "^7.0.0",
            "jspdf": "^2.5.1",
            "file-saver": "^2.0.5",
            "clsx": "^2.1.0",
            "tailwind-merge": "^2.3.0",
            "lucide-react": "^0.378.0",
            "class-variance-authority": "^0.7.0",
            "@radix-ui/react-slot": "^1.0.2",
            "@radix-ui/react-dialog": "^1.0.5",
            "@radix-ui/react-dropdown-menu": "^2.0.6",
            "@radix-ui/react-scroll-area": "^1.0.5",
            "@radix-ui/react-separator": "^1.0.3",
            "@radix-ui/react-select": "^2.0.0",
            "@radix-ui/react-tabs": "^1.0.4",
            "@radix-ui/react-tooltip": "^1.0.7",
            "@radix-ui/react-switch": "^1.0.3",
            "@radix-ui/react-avatar": "^1.0.4",
            "@radix-ui/react-label": "^2.0.2",
            "@radix-ui/react-toast": "^1.1.5",
            "@radix-ui/react-checkbox": "^1.0.4",
            "@radix-ui/react-popover": "^1.0.7",
            "@radix-ui/react-alert-dialog": "^1.0.5"
        },
        "devDependencies": {
            "typescript": "^5.4.0",
            "@types/react": "^18.3.0",
            "@types/react-dom": "^18.3.0",
            "@types/node": "^20.12.0",
            "@types/file-saver": "^2.0.7",
            "tailwindcss": "^3.4.0",
            "postcss": "^8.4.0",
            "autoprefixer": "^10.4.0",
            "@cloudflare/next-on-pages": "^1.11.0",
            "wrangler": "^3.50.0",
            "eslint": "^8.57.0",
            "eslint-config-next": "^14.2.0",
            "tailwindcss-animate": "^1.0.7"
        }
    }

    with open("package.json", 'w', encoding='utf-8') as f:
        json.dump(package, f, indent=2, ensure_ascii=False)
        f.write('\n')
    
    print("  ✅ تم تحديث: package.json")
    print("     ✓ أُضيفت 15 مكتبة @radix-ui")
    print("     ✓ أُضيفت tailwindcss-animate")

def fix_tailwind_config():
    """إضافة tailwindcss-animate للتكوين"""
    print("\n🎨 إصلاح tailwind.config.ts...")
    print("-" * 40)

    create_file("tailwind.config.ts", '''// تكوين Tailwind CSS مع الألوان المخصصة والخطوط العربية وانيميشن Radix
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#6c63ff",
          50: "#eeedff",
          100: "#d4d2ff",
          200: "#b0adff",
          300: "#8c87ff",
          400: "#7a74ff",
          500: "#6c63ff",
          600: "#5a52e0",
          700: "#4840b8",
          800: "#372f90",
          900: "#261f68",
        },
        secondary: {
          DEFAULT: "#00d2ff",
          50: "#e0f9ff",
          100: "#b3f0ff",
          200: "#80e7ff",
          300: "#4ddeff",
          400: "#26d8ff",
          500: "#00d2ff",
          600: "#00b8e0",
          700: "#009ab8",
          800: "#007c90",
          900: "#005e68",
        },
        accent: {
          DEFAULT: "#f72585",
          50: "#ffe0ef",
          100: "#ffb3d4",
          200: "#ff80b6",
          300: "#ff4d98",
          400: "#ff2689",
          500: "#f72585",
          600: "#d91e73",
          700: "#b81760",
          800: "#90114d",
          900: "#680b3a",
        },
        dark: {
          DEFAULT: "#0f0f0f",
          50: "#f5f5f5",
          100: "#e0e0e0",
          200: "#b8b8b8",
          300: "#8f8f8f",
          400: "#666666",
          500: "#3d3d3d",
          600: "#2a2a2a",
          700: "#1f1f1f",
          800: "#171717",
          900: "#0f0f0f",
          950: "#080808",
        },
      },
      fontFamily: {
        "sans-arabic": ["Cairo", "sans-serif"],
        sans: ["Inter", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-in": "slideIn 0.3s ease-in-out",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        blink: "blink 1s step-end infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateX(-10px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
''')

def fix_ui_components():
    """إعادة كتابة جميع ملفات components/ui/ باستخدام Radix UI"""
    print("\n🔧 إصلاح ملفات components/ui/...")
    print("-" * 40)

    # button.tsx
    create_file("components/ui/button.tsx", '''"use client";
// مكون الزر - Shadcn/UI مع Radix UI Slot
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-900 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:bg-primary-600 shadow-sm",
        destructive: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
        outline: "border border-dark-600 bg-transparent text-dark-200 hover:bg-dark-800 hover:text-white",
        secondary: "bg-dark-700 text-dark-200 hover:bg-dark-600 hover:text-white",
        ghost: "text-dark-300 hover:bg-dark-800 hover:text-white",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
''')

    # input.tsx
    create_file("components/ui/input.tsx", '''"use client";
// مكون حقل الإدخال
import * as React from "react";
import { cn } from "@/utils/cn";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-dark-600 bg-dark-800 px-3 py-2 text-sm text-white ring-offset-dark-900 placeholder:text-dark-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 file:border-0 file:bg-transparent file:text-sm file:font-medium",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
''')

    # textarea.tsx
    create_file("components/ui/textarea.tsx", '''"use client";
// مكون منطقة النص
import * as React from "react";
import { cn } from "@/utils/cn";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-lg border border-dark-600 bg-dark-800 px-3 py-2 text-sm text-white ring-offset-dark-900 placeholder:text-dark-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
''')

    # label.tsx
    create_file("components/ui/label.tsx", '''"use client";
// مكون التسمية - Radix UI Label
import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";

const labelVariants = cva(
  "text-sm font-medium leading-none text-dark-200 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
''')

    # card.tsx
    create_file("components/ui/card.tsx", '''"use client";
// مكون البطاقة
import * as React from "react";
import { cn } from "@/utils/cn";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("rounded-xl border border-dark-700 bg-dark-800 shadow-sm", className)} {...props} />
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-lg font-semibold leading-none tracking-tight text-white", className)} {...props} />
  )
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-dark-400", className)} {...props} />
  )
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  )
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
''')

    # badge.tsx
    create_file("components/ui/badge.tsx", '''"use client";
// مكون الشارة
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-white",
        secondary: "border-transparent bg-dark-700 text-dark-200",
        destructive: "border-transparent bg-red-600/20 text-red-400",
        outline: "border-dark-600 text-dark-300",
        success: "border-transparent bg-green-600/20 text-green-400",
        warning: "border-transparent bg-yellow-600/20 text-yellow-400",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
''')

    # dialog.tsx
    create_file("components/ui/dialog.tsx", '''"use client";
// مكون نافذة الحوار - Radix UI Dialog
import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;
const DialogPortal = DialogPrimitive.Portal;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 rounded-xl border border-dark-700 bg-dark-800 p-6 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] mx-4",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute end-4 top-4 rounded-md p-1 text-dark-400 opacity-70 transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-2 text-center sm:text-start", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2", className)} {...props} />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title ref={ref} className={cn("text-lg font-semibold text-white", className)} {...props} />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn("text-sm text-dark-400", className)} {...props} />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog, DialogPortal, DialogOverlay, DialogTrigger, DialogClose,
  DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription,
};
''')

    # dropdown-menu.tsx
    create_file("components/ui/dropdown-menu.tsx", '''"use client";
// مكون القائمة المنسدلة - Radix UI DropdownMenu
import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/utils/cn";

const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuGroup = DropdownMenuPrimitive.Group;
const DropdownMenuPortal = DropdownMenuPrimitive.Portal;
const DropdownMenuSub = DropdownMenuPrimitive.Sub;
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & { inset?: boolean }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn("flex cursor-default select-none items-center rounded-md px-2 py-1.5 text-sm text-dark-200 outline-none focus:bg-dark-700 data-[state=open]:bg-dark-700", inset && "ps-8", className)}
    {...props}
  >
    {children}
  </DropdownMenuPrimitive.SubTrigger>
));
DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName;

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn("z-50 min-w-[8rem] overflow-hidden rounded-lg border border-dark-700 bg-dark-800 p-1 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95", className)}
    {...props}
  />
));
DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName;

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn("z-50 min-w-[8rem] overflow-hidden rounded-lg border border-dark-700 bg-dark-800 p-1 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", className)}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
));
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & { inset?: boolean }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn("relative flex cursor-pointer select-none items-center rounded-md px-2 py-1.5 text-sm text-dark-200 outline-none transition-colors focus:bg-dark-700 focus:text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50", inset && "ps-8", className)}
    {...props}
  />
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & { inset?: boolean }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label ref={ref} className={cn("px-2 py-1.5 text-xs font-semibold text-dark-400", inset && "ps-8", className)} {...props} />
));
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator ref={ref} className={cn("-mx-1 my-1 h-px bg-dark-700", className)} {...props} />
));
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

export {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuGroup, DropdownMenuPortal,
  DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuRadioGroup,
};
''')

    # select.tsx
    create_file("components/ui/select.tsx", '''"use client";
// مكون الاختيار - Radix UI Select
import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn";

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn("flex h-10 w-full items-center justify-between rounded-lg border border-dark-600 bg-dark-800 px-3 py-2 text-sm text-white ring-offset-dark-900 placeholder:text-dark-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1", className)}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 text-dark-400" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn("relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-lg border border-dark-700 bg-dark-800 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1", className)}
      position={position}
      {...props}
    >
      <SelectPrimitive.Viewport className={cn("p-1", position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]")}>
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label ref={ref} className={cn("py-1.5 ps-8 pe-2 text-xs font-semibold text-dark-400", className)} {...props} />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn("relative flex w-full cursor-pointer select-none items-center rounded-md py-1.5 ps-8 pe-2 text-sm text-dark-200 outline-none focus:bg-dark-700 focus:text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className)}
    {...props}
  >
    <span className="absolute start-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4 text-primary" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator ref={ref} className={cn("-mx-1 my-1 h-px bg-dark-700", className)} {...props} />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectLabel, SelectItem, SelectSeparator };
''')

    # tabs.tsx
    create_file("components/ui/tabs.tsx", '''"use client";
// مكون التبويبات - Radix UI Tabs
import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/utils/cn";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List ref={ref} className={cn("inline-flex h-10 items-center justify-center rounded-lg bg-dark-800 p-1 text-dark-400", className)} {...props} />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-dark-900 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-dark-700 data-[state=active]:text-white data-[state=active]:shadow-sm", className)}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content ref={ref} className={cn("mt-2 ring-offset-dark-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2", className)} {...props} />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
''')

    # tooltip.tsx
    create_file("components/ui/tooltip.tsx", '''"use client";
// مكون التلميح - Radix UI Tooltip
import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/utils/cn";

const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn("z-50 overflow-hidden rounded-md border border-dark-600 bg-dark-700 px-3 py-1.5 text-xs text-dark-200 shadow-lg animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", className)}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
''')

    # separator.tsx
    create_file("components/ui/separator.tsx", '''"use client";
// مكون الفاصل - Radix UI Separator
import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { cn } from "@/utils/cn";

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(({ className, orientation = "horizontal", decorative = true, ...props }, ref) => (
  <SeparatorPrimitive.Root
    ref={ref}
    decorative={decorative}
    orientation={orientation}
    className={cn("shrink-0 bg-dark-700", orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]", className)}
    {...props}
  />
));
Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator };
''')

    # scroll-area.tsx
    create_file("components/ui/scroll-area.tsx", '''"use client";
// مكون منطقة التمرير - Radix UI ScrollArea
import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { cn } from "@/utils/cn";

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root ref={ref} className={cn("relative overflow-hidden", className)} {...props}>
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
));
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn("flex touch-none select-none transition-colors", orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent p-[1px]", orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent p-[1px]", className)}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-dark-600 hover:bg-dark-500" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
));
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

export { ScrollArea, ScrollBar };
''')

    # switch.tsx
    create_file("components/ui/switch.tsx", '''"use client";
// مكون مفتاح التبديل - Radix UI Switch
import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/utils/cn";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    className={cn("peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-900 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-dark-600", className)}
    {...props}
    ref={ref}
  >
    <SwitchPrimitive.Thumb className={cn("pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0 rtl:data-[state=checked]:-translate-x-5")} />
  </SwitchPrimitive.Root>
));
Switch.displayName = SwitchPrimitive.Root.displayName;

export { Switch };
''')

    # avatar.tsx
    create_file("components/ui/avatar.tsx", '''"use client";
// مكون الصورة الرمزية - Radix UI Avatar
import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/utils/cn";

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root ref={ref} className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)} {...props} />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image ref={ref} className={cn("aspect-square h-full w-full", className)} {...props} />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback ref={ref} className={cn("flex h-full w-full items-center justify-center rounded-full bg-primary/20 text-sm font-medium text-primary", className)} {...props} />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback };
''')

    # skeleton.tsx
    create_file("components/ui/skeleton.tsx", '''"use client";
// مكون الهيكل العظمي للتحميل
import { cn } from "@/utils/cn";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-dark-700", className)} {...props} />;
}

export { Skeleton };
''')

    # table.tsx
    create_file("components/ui/table.tsx", '''"use client";
// مكون الجدول
import * as React from "react";
import { cn } from "@/utils/cn";

const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="relative w-full overflow-auto">
      <table ref={ref} className={cn("w-full caption-bottom text-sm", className)} {...props} />
    </div>
  )
);
Table.displayName = "Table";

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => <thead ref={ref} className={cn("[&_tr]:border-b [&_tr]:border-dark-700", className)} {...props} />
);
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />
);
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => <tfoot ref={ref} className={cn("border-t border-dark-700 bg-dark-800/50 font-medium", className)} {...props} />
);
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => <tr ref={ref} className={cn("border-b border-dark-700 transition-colors hover:bg-dark-800/50 data-[state=selected]:bg-dark-800", className)} {...props} />
);
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => <th ref={ref} className={cn("h-12 px-4 text-start align-middle font-medium text-dark-400 [&:has([role=checkbox])]:pe-0", className)} {...props} />
);
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => <td ref={ref} className={cn("p-4 align-middle text-dark-200 [&:has([role=checkbox])]:pe-0", className)} {...props} />
);
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(
  ({ className, ...props }, ref) => <caption ref={ref} className={cn("mt-4 text-sm text-dark-400", className)} {...props} />
);
TableCaption.displayName = "TableCaption";

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
''')

    # toast.tsx
    create_file("components/ui/toast.tsx", '''"use client";
// مكون الإشعار المنبثق
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";
import { X } from "lucide-react";

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-lg border p-4 shadow-lg transition-all animate-in slide-in-from-bottom-5",
  {
    variants: {
      variant: {
        default: "border-dark-700 bg-dark-800 text-white",
        success: "border-green-800 bg-green-950 text-green-200",
        destructive: "border-red-800 bg-red-950 text-red-200",
        warning: "border-yellow-800 bg-yellow-950 text-yellow-200",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof toastVariants> {
  onClose?: () => void;
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant, onClose, children, ...props }, ref) => (
    <div ref={ref} className={cn(toastVariants({ variant }), className)} {...props}>
      <div className="flex-1">{children}</div>
      {onClose && (
        <button type="button" onClick={onClose} className="shrink-0 rounded-md p-1 text-dark-400 transition-colors hover:text-white" aria-label="Close">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
);
Toast.displayName = "Toast";

function ToastTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h4 className={cn("text-sm font-semibold", className)} {...props} />;
}

function ToastDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm opacity-80", className)} {...props} />;
}

export { Toast, ToastTitle, ToastDescription, toastVariants };
''')

    # toaster.tsx
    create_file("components/ui/toaster.tsx", '''"use client";
// مزود الإشعارات المنبثقة
import * as React from "react";
import { cn } from "@/utils/cn";
import { Toast, ToastTitle, ToastDescription } from "./toast";

interface ToastItem {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "success" | "destructive" | "warning";
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
});

export function useToast() {
  const context = React.useContext(ToastContext);
  const toast = React.useCallback(
    (props: Omit<ToastItem, "id">) => { context.addToast(props); },
    [context]
  );
  return { toast, toasts: context.toasts, dismiss: context.removeToast };
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const addToast = React.useCallback((toast: Omit<ToastItem, "id">) => {
    const id = Math.random().toString(36).slice(2, 9);
    const newToast: ToastItem = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);
    const duration = toast.duration || 4000;
    setTimeout(() => { setToasts((prev) => prev.filter((t) => t.id !== id)); }, duration);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  );
}

function Toaster() {
  const { toasts, removeToast } = React.useContext(ToastContext);
  if (toasts.length === 0) return null;

  return (
    <div className={cn("fixed bottom-4 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 px-4 sm:bottom-6 sm:end-6 sm:start-auto sm:max-w-[380px] sm:px-0")}>
      {toasts.map((toast) => (
        <Toast key={toast.id} variant={toast.variant} onClose={() => removeToast(toast.id)}>
          <div>
            {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
            {toast.description && <ToastDescription>{toast.description}</ToastDescription>}
          </div>
        </Toast>
      ))}
    </div>
  );
}

export { Toaster };
''')

def delete_old_lock_files():
    """حذف ملفات القفل القديمة لإجبار إعادة التثبيت"""
    print("\n🗑️  حذف ملفات القفل القديمة...")
    print("-" * 40)
    
    lock_files = [
        "package-lock.json",
        "bun.lockb", 
        "bun.lock",
        "yarn.lock",
        "pnpm-lock.yaml",
    ]
    
    for lock_file in lock_files:
        if os.path.exists(lock_file):
            os.remove(lock_file)
            print(f"  🗑️  حُذف: {lock_file}")
    
    if os.path.exists("node_modules"):
        print("  ⚠️  مجلد node_modules موجود")
        print("     يُفضل حذفه وإعادة تثبيت المكتبات:")
        print("     rm -rf node_modules && npm install")

def main():
    print("=" * 60)
    print("🔧 إصلاح مشكلة Radix UI - AI Chat Platform")
    print("=" * 60)

    # التحقق من وجود مجلد المشروع
    if not os.path.exists("package.json"):
        print("\n❌ خطأ: لم يتم العثور على package.json")
        print("   تأكد أنك داخل مجلد المشروع!")
        print("   استخدم: cd ai-chat-platform")
        sys.exit(1)

    print("\n✅ تم العثور على مجلد المشروع")

    # تنفيذ الإصلاحات
    files_before = 0
    
    # 1. إصلاح package.json
    fix_package_json()
    
    # 2. إصلاح tailwind.config.ts
    fix_tailwind_config()
    
    # 3. إصلاح جميع ملفات UI (19 ملف)
    fix_ui_components()
    
    # 4. حذف ملفات القفل القديمة
    delete_old_lock_files()

    # ملخص
    print("\n" + "=" * 60)
    print("✅ تم الإصلاح بنجاح!")
    print("=" * 60)
    
    print("""
📋 الملفات التي تم تحديثها:
   ✅ package.json (أُضيفت 15 مكتبة Radix UI + tailwindcss-animate)
   ✅ tailwind.config.ts (أُضيف plugin tailwindcss-animate)
   ✅ components/ui/button.tsx (Radix Slot)
   ✅ components/ui/input.tsx
   ✅ components/ui/textarea.tsx
   ✅ components/ui/label.tsx (Radix Label)
   ✅ components/ui/card.tsx
   ✅ components/ui/badge.tsx
   ✅ components/ui/dialog.tsx (Radix Dialog)
   ✅ components/ui/dropdown-menu.tsx (Radix DropdownMenu)
   ✅ components/ui/select.tsx (Radix Select)
   ✅ components/ui/tabs.tsx (Radix Tabs)
   ✅ components/ui/tooltip.tsx (Radix Tooltip)
   ✅ components/ui/separator.tsx (Radix Separator)
   ✅ components/ui/scroll-area.tsx (Radix ScrollArea)
   ✅ components/ui/switch.tsx (Radix Switch)
   ✅ components/ui/avatar.tsx (Radix Avatar)
   ✅ components/ui/skeleton.tsx
   ✅ components/ui/table.tsx
   ✅ components/ui/toast.tsx
   ✅ components/ui/toaster.tsx

📌 الخطوة التالية:
""")
    
    print("=" * 60)
    print("  الطريقة 1: إذا عندك Node.js على جهازك")
    print("=" * 60)
    print("""
   1. احذف node_modules وأعد التثبيت:
      rm -rf node_modules
      npm install

   2. جرّب البناء محلياً:
      npm run build

   3. إذا نجح، ارفع على GitHub:
      git add .
      git commit -m "Fix Radix UI dependencies"
      git push
""")
    
    print("=" * 60)
    print("  الطريقة 2: إذا ترفع مباشرة على GitHub")
    print("=" * 60)
    print("""
   1. ارفع الملفات المحدّثة على GitHub
   2. Cloudflare سيعيد البناء تلقائياً
   3. أو اذهب إلى Cloudflare Dashboard:
      Workers & Pages → مشروعك → Deployments
      → Retry deployment
""")
    
    print("=" * 60)
    print("  الطريقة 3: باستخدام GitHub Codespaces")
    print("=" * 60)
    print("""
   1. افتح Codespaces من GitHub
   2. شغّل هذا الملف:
      python fix_radix_ui.py
   3. ثم:
      rm -rf node_modules
      npm install
      npm run build
   4. إذا نجح:
      git add .
      git commit -m "Fix Radix UI dependencies"
      git push
""")

if __name__ == "__main__":
    main()
