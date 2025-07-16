// components/admin/AdminSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  Users,
  FileText,
  Tags,
  BarChart3,
  Settings,
  Home,
  Plus,
  FolderOpen,
  Target,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { logOut } from "@/actions/auth";

interface AdminSidebarProps {
  className?: string;
}

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: Home,
    description: "Overview & Analytics",
  },
  {
    name: "Quizzes",
    icon: BookOpen,
    children: [
      {
        name: "All Quizzes",
        href: "/admin/quizzes",
        icon: FileText,
      },
      {
        name: "Create Quiz",
        href: "/admin/quizzes/create",
        icon: Plus,
      },
      {
        name: "Quiz Attempts",
        href: "/admin/quiz-attempt",
        icon: Target,
      },
    ],
  },
  {
    name: "Management",
    icon: Settings,
    children: [
      {
        name: "Categories",
        href: "/admin/categories",
        icon: FolderOpen,
      },
      {
        name: "Tags",
        href: "/admin/tags",
        icon: Tags,
      },
    ],
  },
];

export function AdminSidebar({ className }: AdminSidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([
    "Quizzes",
    "Management",
  ]);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleExpanded = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((item) => item !== itemName)
        : [...prev, itemName]
    );
  };

  const isActiveLink = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo/Brand */}
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <Link href="/admin" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-gradient-start to-brand-gradient-end">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-text-strong">
            Siquiz Admin
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-4 py-6">
        <nav className="space-y-2">
          {navigation.map((item) => (
            <div key={item.name}>
              {item.children ? (
                <div>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start font-normal",
                      "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      "text-sidebar-foreground"
                    )}
                    onClick={() => toggleExpanded(item.name)}
                  >
                    <item.icon className="mr-3 h-4 w-4" />
                    {item.name}
                    <div className="ml-auto">
                      {expandedItems.includes(item.name) ? (
                        <div className="h-2 w-2 rounded-full bg-brand" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </div>
                  </Button>
                  {expandedItems.includes(item.name) && (
                    <div className="ml-4 mt-2 space-y-1 border-l border-sidebar-border pl-4">
                      {item.children.map((child) => (
                        <Link key={child.href} href={child.href}>
                          <Button
                            variant="ghost"
                            className={cn(
                              "w-full justify-start font-normal text-sm",
                              isActiveLink(child.href)
                                ? "bg-brand-subtle text-brand border-l-2 border-brand"
                                : "text-text-subtle hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            )}
                          >
                            <child.icon className="mr-3 h-4 w-4" />
                            {child.name}
                          </Button>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link href={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start font-normal",
                      isActiveLink(item.href)
                        ? "bg-brand-subtle text-brand border-l-2 border-brand"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <item.icon className="mr-3 h-4 w-4" />
                    {item.name}
                    {item.description && (
                      <span className="ml-auto text-xs text-text-subtle">
                        {item.description.split(" ")[0]}
                      </span>
                    )}
                  </Button>
                </Link>
              )}
            </div>
          ))}
        </nav>
      </ScrollArea>

      <Separator />

      {/* User Section */}
      <div className="p-4">
        <div className="flex items-center space-x-3 rounded-lg bg-surface-sunken p-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand">
            <span className="text-sm font-medium text-brand-foreground">A</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-strong truncate">
              Admin User
            </p>
            <p className="text-xs text-text-subtle truncate">
              admin@siquiz.com
            </p>
          </div>
        </div>
        <Button
          onClick={async () => await logOut()}
          variant="ghost"
          className="w-full justify-start mt-2 text-text-subtle hover:text-text-strong"
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar Toggle */}
      <Button
        variant="ghost"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </Button>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-full w-64 transform border-r border-sidebar-border bg-sidebar transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
