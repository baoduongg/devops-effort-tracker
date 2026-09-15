import { useEffect, useState } from "react";
import { subscribeMembers } from "@/services/members.service";
import { getProjects } from "@/services/projects.service";
import { subscribeAllTasks } from "@/services/tasks.service";
import { subscribeNotifications } from "@/services/notifications.service";
import { useMembersStore } from "@/store/members.store";
import type { Project } from "@/types/project";
import type { Task } from "@/types/task";
import type { Notification } from "@/types/notification";

interface DashboardData {
  tasks: Task[];
  projects: Project[];
  projectsLoaded: boolean;
  notifications: Notification[];
  loading: boolean;
}

export function useDashboardData(): DashboardData {
  const setMembers = useMembersStore((state) => state.setMembers);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoaded, setProjectsLoaded] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeMembers = subscribeMembers((next) => {
      setMembers(next);
      setLoading(false);
    });
    const unsubscribeTasks = subscribeAllTasks((nextTasks) => {
      setTasks(nextTasks);
    });
    const unsubscribeNotifications = subscribeNotifications(setNotifications);
    getProjects().then((next) => {
      setProjects(next);
      setProjectsLoaded(true);
    });

    return () => {
      unsubscribeMembers();
      unsubscribeTasks();
      unsubscribeNotifications();
    };
  }, [setMembers]);

  return { tasks, projects, projectsLoaded, notifications, loading };
}
