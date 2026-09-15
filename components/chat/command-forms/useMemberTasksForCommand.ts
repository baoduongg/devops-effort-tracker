import { useEffect, useState } from "react";
import type { Task } from "@/types/task";
import { getTasksByMember } from "@/services/tasks.service";

interface UseMemberTasksForCommandResult {
  memberTasks: Task[];
  loadingMemberTasks: boolean;
}

export function useMemberTasksForCommand(
  selectedMemberName: string,
  commandId: string,
  onTasksLoaded: (tasks: Task[]) => void
): UseMemberTasksForCommandResult {
  const [memberTasks, setMemberTasks] = useState<Task[]>([]);
  const [loadingMemberTasks, setLoadingMemberTasks] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadTasks(): Promise<void> {
      if (!selectedMemberName || (commandId !== "coord-reassign" && commandId !== "coord-remove")) {
        return;
      }
      setLoadingMemberTasks(true);
      try {
        const tasks = await getTasksByMember(selectedMemberName);
        if (!ignore) {
          setMemberTasks(tasks);
          onTasksLoaded(tasks);
        }
      } catch (err) {
        console.warn("Failed to fetch tasks for member:", err);
        if (!ignore) {
          setMemberTasks([]);
        }
      } finally {
        if (!ignore) {
          setLoadingMemberTasks(false);
        }
      }
    }

    void loadTasks();

    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMemberName, commandId]);

  return { memberTasks, loadingMemberTasks };
}
