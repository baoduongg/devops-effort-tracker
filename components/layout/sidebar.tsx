"use client";

import { usePathname } from "next/navigation";
import { LayoutGrid, Users, FolderGit2, MessagesSquare, Bell, LogOut, Activity } from "lucide-react";
import { NavIcon } from "@astryxdesign/core/NavIcon";
import { SideNav, SideNavHeading, SideNavItem, SideNavSection } from "@astryxdesign/core/SideNav";
import { Avatar } from "@astryxdesign/core/Avatar";
import { IconButton } from "@astryxdesign/core/IconButton";
import { HStack, VStack, StackItem } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { useAuthStore } from "@/store/auth.store";
import { signOutUser } from "@/services/auth.service";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/projects", label: "Projects", icon: FolderGit2 },
  { href: "/members", label: "Members", icon: Users },
  { href: "/chat", label: "AI Chat", icon: MessagesSquare },
  { href: "/notifications", label: "Notifications", icon: Bell },
];


export function Sidebar(): React.JSX.Element {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  return (
    <SideNav
      header={
        <SideNavHeading
          icon={<NavIcon icon={<Activity size={16} strokeWidth={2.25} />} />}
          heading="DevOps Tracker"
          headingHref="/dashboard"
        />
      }
      footer={
        user && (
          <HStack gap={2} vAlign="center">
            <Avatar name={user.displayName} src={user.photoURL ?? undefined} size="sm" tooltip={false} />
            <StackItem size="fill">
              <VStack gap={0}>
                <Text weight="semibold" maxLines={1}>
                  {user.displayName}
                </Text>
                <Text type="supporting" maxLines={1}>
                  {user.role}
                </Text>
              </VStack>
            </StackItem>
            <IconButton
              label="Sign out"
              icon={<LogOut size={16} strokeWidth={2} />}
              variant="ghost"
              size="sm"
              tooltip="Sign out"
              onClick={() => signOutUser()}
            />
          </HStack>
        )
      }
    >
      <SideNavSection title="Workspace">
        {links.map((link) => (
          <SideNavItem
            key={link.href}
            href={link.href}
            label={link.label}
            icon={link.icon}
            isSelected={pathname.startsWith(link.href)}
          />
        ))}
      </SideNavSection>
    </SideNav>
  );
}
