"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Users,
  FolderGit2,
  ListChecks,
  MessagesSquare,
  Bell,
  LogOut,
  Activity,
  Database,
} from "lucide-react";
import { NavIcon } from "@astryxdesign/core/NavIcon";
import { SideNav, SideNavHeading, SideNavItem, SideNavSection } from "@astryxdesign/core/SideNav";
import { Avatar } from "@astryxdesign/core/Avatar";
import { IconButton } from "@astryxdesign/core/IconButton";
import { HStack, VStack, StackItem } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { useAuthStore } from "@/store/auth.store";
import { signOutUser } from "@/services/auth.service";
import { DataManagerDialog } from "@/components/dev/data-manager-dialog";

export function Sidebar(): React.JSX.Element {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const [isDataManagerOpen, setIsDataManagerOpen] = useState(false);

  const isLeader = user?.role === "leader";

  const links = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutGrid,
    },


    {
      href: "/projects",
      label: isLeader ? "Dự án & Phân bổ" : "Dự án",
      icon: FolderGit2,
    },
    {
      href: "/members",
      label: isLeader ? "Quản lý Đội ngũ" : "Đội ngũ DevOps",
      icon: Users,
    },
    {
      href: "/tasks",
      label: "Danh sách Task",
      icon: ListChecks,
    },
    {
      href: "/chat",
      label: isLeader ? "AI Ask (Leader)" : "AI Log Work",
      icon: MessagesSquare,
    },
    // {
    //   href: "/notifications",
    //   label: "Thông báo",
    //   icon: Bell,
    // },
  ];

  return (
    <>
      <SideNav
        header={
          <SideNavHeading
            icon={<NavIcon icon={<Activity size={16} strokeWidth={2.25} />} />}
            heading="DevOps Effort Hub"
            headingHref="/dashboard"
          />
        }
        topContent={
          <div className="px-2 pt-1">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08]">
              <span className={`w-2 h-2 rounded-full ${isLeader ? "bg-amber-400" : "bg-sky-400"}`} />
              <span className="text-xs font-mono font-medium text-neutral-300">
                {isLeader ? "LEADER VIEW" : "DEVOPS VIEW"}
              </span>
            </div>
          </div>
        }
        footer={
          user && (
            <VStack gap={3}>
              <VStack
                gap={1}
                className="p-3 rounded-lg bg-accent/5 border border-accent/25"
              >
                <Text weight="semibold" size="sm" color="accent">
                  {isLeader ? "Ask / Command" : "Log Work"}
                </Text>
                <Text type="supporting" size="sm">
                  {isLeader
                    ? "Query the roster or propose task changes."
                    : "Describe what you finished; I file it."}
                </Text>
              </VStack>

              <HStack gap={2} vAlign="center" className="pt-2 border-t border-border">
                <Avatar name={user.displayName} src={user.photoURL ?? undefined} size="sm" tooltip={false} />
                <StackItem size="fill">
                  <VStack gap={0}>
                    <Text weight="semibold" maxLines={1}>
                      {user.displayName}
                    </Text>
                    <Text type="supporting" maxLines={1} size="sm">
                      {user.email}
                    </Text>
                  </VStack>
                </StackItem>
                <IconButton
                  label="Sign out"
                  icon={<LogOut size={15} strokeWidth={2} />}
                  variant="ghost"
                  size="sm"
                  tooltip="Sign out"
                  onClick={() => signOutUser()}
                />
              </HStack>
            </VStack>
          )
        }
      >
        <SideNavSection title={isLeader ? "Quản lý (Leader View)" : "Không gian (DevOps View)"}>
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
        {/* <SideNavSection title="Hệ thống">
          <SideNavItem
            label="Quản lý dữ liệu"
            icon={Database}
            onClick={() => setIsDataManagerOpen(true)}
          />
        </SideNavSection> */}
      </SideNav>

      <DataManagerDialog
        isOpen={isDataManagerOpen}
        onClose={() => setIsDataManagerOpen(false)}
      />
    </>
  );
}
