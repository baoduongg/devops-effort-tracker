"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Users,
  FolderGit2,
  MessagesSquare,
  Bell,
  LogOut,
  Activity,
  Database,
  Shield,
  Code2,
  ArrowLeftRight,
} from "lucide-react";
import { NavIcon } from "@astryxdesign/core/NavIcon";
import { SideNav, SideNavHeading, SideNavItem, SideNavSection } from "@astryxdesign/core/SideNav";
import { Avatar } from "@astryxdesign/core/Avatar";
import { IconButton } from "@astryxdesign/core/IconButton";
import { HStack, VStack, StackItem } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
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
        footer={
          user && (
            <VStack gap={2}>
              {/* Role Indicator & Quick Switcher */}

              <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] border border-white/[0.07]">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`p-1 rounded-md text-[11px] flex items-center gap-1 font-semibold ${
                      isLeader
                        ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                        : "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                    }`}
                  >
                    {isLeader ? <Shield size={11} /> : <Code2 size={11} />}
                    <span>{isLeader ? "LEADER" : "DEVOPS"}</span>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleToggleRole}
                  disabled={switchingRole}
                  title="Chuyển đổi vai trò Leader <-> DevOps"
                  className="px-2 py-1 rounded-lg text-[11px] font-medium bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 hover:text-white border border-white/[0.08] transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <ArrowLeftRight size={11} className={switchingRole ? "animate-spin" : ""} />
                  <span>Đổi sang {isLeader ? "DevOps" : "Leader"}</span>
                </button>
              </div>

              {/* User Identity & Sign Out */}
              <HStack gap={2} vAlign="center">
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


