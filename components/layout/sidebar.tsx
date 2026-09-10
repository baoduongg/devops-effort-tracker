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
import { SegmentedControl, SegmentedControlItem } from "@astryxdesign/core/SegmentedControl";
import { useAuthStore } from "@/store/auth.store";
import { signOutUser, updateUserRole } from "@/services/auth.service";
import { DataManagerDialog } from "@/components/dev/data-manager-dialog";
import type { UserRole } from "@/types/user";

export function Sidebar(): React.JSX.Element {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const setRole = useAuthStore((state) => state.setRole);
  const [isDataManagerOpen, setIsDataManagerOpen] = useState(false);
  const [switchingRole, setSwitchingRole] = useState(false);

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
    {
      href: "/notifications",
      label: "Thông báo",
      icon: Bell,
    },
  ];

  async function handleToggleRole(): Promise<void> {
    if (!user || switchingRole) return;
    const nextRole: UserRole = isLeader ? "devops" : "leader";
    setSwitchingRole(true);
    try {
      setRole(nextRole);
      await updateUserRole(user.uid, nextRole);
    } catch (err) {
      console.error("Failed to update user role", err);
    } finally {
      setSwitchingRole(false);
    }
  }

  return (
    <>
      <SideNav
        header={
          <SideNavHeading
            icon={<NavIcon icon={<Activity size={16} strokeWidth={2.25} />} />}
            heading="DevOps Tracker"
            headingHref="/dashboard"
          />
        }
        topContent={
          <VStack gap={2} className="px-2 pt-1">
            <SegmentedControl
              label="Chuyển vai trò"
              value={isLeader ? "leader" : "devops"}
              onChange={() => {
                if (switchingRole) return;
                void handleToggleRole();
              }}
              layout="fill"
              size="sm"
              isDisabled={switchingRole}
            >
              <SegmentedControlItem value="leader" label="Leader" />
              <SegmentedControlItem value="devops" label="DevOps" />
            </SegmentedControl>
            <Text type="supporting" className="text-[10px] uppercase tracking-wide text-secondary">
              {isLeader ? "LEADER VIEW" : "DEVOPS VIEW"}
            </Text>
          </VStack>
        }
        footer={
          user && (
            <VStack gap={3}>
              <VStack
                gap={1}
                className="p-3 rounded-lg bg-accent/[0.07] border border-accent/25"
              >
                <Text weight="semibold" className="text-[13px] text-accent">
                  {isLeader ? "Ask / Command" : "Log Work"}
                </Text>
                <Text type="supporting" className="text-[11.5px]">
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
                    <Text type="supporting" maxLines={1} className="text-[11px]">
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
        <SideNavSection title="Hệ thống">
          <SideNavItem
            label="Quản lý dữ liệu"
            icon={Database}
            onClick={() => setIsDataManagerOpen(true)}
          />
        </SideNavSection>
      </SideNav>

      <DataManagerDialog
        isOpen={isDataManagerOpen}
        onClose={() => setIsDataManagerOpen(false)}
      />
    </>
  );
}
