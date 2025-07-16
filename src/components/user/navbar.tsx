"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "./toggleTheme";
import {
  Menu,
  X,
  Home,
  User,
  BookOpen,
  LogOut,
  Plus,
  FileText,
} from "lucide-react";
import { logOut } from "@/actions/auth";

interface User {
  username: string;
  name: string;
  avatar?: string;
  email: string;
}

const navItems = [
  { href: "/home", label: "Beranda", icon: Home },
  { href: "/kuis", label: "Kuis", icon: BookOpen },
];

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/auth/user");
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();

    // Revalidate every 5 minutes
    const interval = setInterval(fetchProfile, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const isActive = (href: string) => {
    if (href === "/home") return pathname === href;
    return pathname.startsWith(href);
  };

  if (isLoading) {
    return (
      <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-surface-raised/95 backdrop-blur supports-[backdrop-filter]:bg-surface-raised/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="animate-pulse flex items-center space-x-4">
              <div className="h-8 w-8 rounded-lg bg-gray-200"></div>
              <div className="h-6 w-20 bg-gray-200 rounded"></div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="h-9 w-24 bg-gray-200 rounded-md"></div>
              <div className="h-8 w-8 rounded-full bg-gray-200"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  if (!user) {
    // Return minimal navbar if user is not logged in
    return (
      <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-surface-raised/95 backdrop-blur supports-[backdrop-filter]:bg-surface-raised/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-gradient-start to-brand-gradient-end flex items-center justify-center">
                <span className="text-sm font-bold text-white">SQ</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end bg-clip-text text-transparent">
                Siquiz
              </span>
            </Link>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <Button asChild variant="outline" size="sm">
                <Link href="/login">Masuk</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-surface-raised/95 backdrop-blur supports-[backdrop-filter]:bg-surface-raised/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/home" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-gradient-start to-brand-gradient-end flex items-center justify-center">
                <span className="text-sm font-bold text-white">SQ</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end bg-clip-text text-transparent">
                Siquiz
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      isActive(item.href)
                        ? "bg-brand-subtle text-brand border border-brand/20"
                        : "text-text-subtle hover:text-text-strong hover:bg-surface-sunken"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center space-x-2">
            {/* Create Quiz Button */}
            <Link href="/kuis/create">
              <Button
                size="sm"
                className="h-9 px-3 bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end hover:opacity-90 text-white border-0"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Kuis
              </Button>
            </Link>

            <ThemeToggle />

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full p-0"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-brand-subtle text-brand text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-brand-subtle text-brand">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium text-text-strong">{user.name}</p>
                    <p className="text-xs text-text-subtle">@{user.username}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/profile`} className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/my-kuis" className="flex items-center">
                    <FileText className="mr-2 h-4 w-4" />
                    <span>My Kuis</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <button onClick={async () => await logOut()}>Keluar</button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-border/40">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                      isActive(item.href)
                        ? "bg-brand-subtle text-brand border border-brand/20"
                        : "text-text-subtle hover:text-text-strong hover:bg-surface-sunken"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {/* Mobile My Kuis and Create Kuis */}
              <Link
                href="/my-kuis"
                className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-text-subtle hover:text-text-strong hover:bg-surface-sunken transition-all duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FileText className="h-5 w-5" />
                <span>My Kuis</span>
              </Link>

              <Link
                href="/kuis/create"
                className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end text-white transition-all duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Plus className="h-5 w-5" />
                <span>Create Kuis</span>
              </Link>

              {/* Mobile User Section */}
              <div className="border-t border-border/40 pt-4 mt-4">
                <div className="flex items-center px-3 py-2">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-brand-subtle text-brand">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <div className="text-base font-medium text-text-strong">
                      {user.name}
                    </div>
                    <div className="text-sm text-text-subtle">
                      @{user.username}
                    </div>
                  </div>
                </div>

                <Link
                  href={`/profile`}
                  className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-text-subtle hover:text-text-strong hover:bg-surface-sunken transition-all duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User className="h-5 w-5" />
                  <span>Profil</span>
                </Link>

                <button
                  onClick={async () => await logOut()}
                  className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-destructive hover:bg-destructive/10 transition-all duration-200 w-full text-left"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Keluar</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
