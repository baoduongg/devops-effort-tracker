"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { signOutUser } from "@/services/auth.service";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/members", label: "Members" },
  { href: "/chat", label: "AI Chat" },
  { href: "/notifications", label: "Notifications" },
];

export function NavBar(): React.JSX.Element {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  return (
    <nav className="flex items-center justify-between border-b px-6 py-3">
      <div className="flex items-center gap-6">
        <span className="font-semibold">DevOps Effort Tracker</span>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "text-sm text-muted-foreground hover:text-foreground",
              pathname.startsWith(link.href) && "text-foreground font-medium"
            )}
          >
            {link.label}
          </Link>
        ))}
      </div>
      {user && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{user.displayName} ({user.role})</span>
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.photoURL ?? undefined} />
            <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
          </Avatar>
          <Button variant="outline" size="sm" onClick={() => signOutUser()}>
            Sign out
          </Button>
        </div>
      )}
    </nav>
  );
}
