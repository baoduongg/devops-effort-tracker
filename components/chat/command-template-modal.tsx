"use client";

import React, { useMemo, useState } from "react";
import { Dialog } from "@astryxdesign/core/Dialog";
import { Send, PenLine, Sparkles, X } from "lucide-react";
import type { SlashCommand } from "@/lib/slash-commands";
import type { Member } from "@/types/member";
import type { Project } from "@/types/project";
import type { TaskStatus } from "@/types/task";
import { buildCommandPrompt } from "@/lib/command-template-prompts";
import { AddForm } from "./command-forms/AddForm";
import { AssignForm } from "./command-forms/AssignForm";
import { InfoLookupForm, ProjectLookupForm, TaskLookupForm } from "./command-forms/LookupForms";
import { LogForm } from "./command-forms/LogForm";
import { ReassignForm } from "./command-forms/ReassignForm";
import { RemoveForm } from "./command-forms/RemoveForm";
import { formatEffortDurationLabel, getModalTitle, getTodayString } from "./command-forms/shared";
import { useMemberTasksForCommand } from "./command-forms/useMemberTasksForCommand";

interface CommandTemplateModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  command: SlashCommand | null;
  members: Member[];
  projects: Project[];
  onInsertToChat: (preparedPrompt: string) => void;
  onSubmitPrompt: (preparedPrompt: string) => void;
}

interface CommandTemplateFormProps {
  command: SlashCommand;
  members: Member[];
  projects: Project[];
  onCancel: () => void;
  onInsertToChat: (preparedPrompt: string) => void;
  onSubmitPrompt: (preparedPrompt: string) => void;
}

function CommandTemplateForm({
  command,
  members,
  projects,
  onCancel,
  onInsertToChat,
  onSubmitPrompt,
}: CommandTemplateFormProps): React.JSX.Element {
  const assignableMembers = useMemo(() => members.filter((m) => m.role !== "leader"), [members]);

  const initialMemberId =
    command.id === "coord-assign" || command.id === "coord-add"
      ? assignableMembers[0]?.id || ""
      : members[0]?.id || "";

  const initialNewAssigneeId = assignableMembers.length > 1 ? assignableMembers[1].id : "";

  const [taskTitle, setTaskTitle] = useState(
    command.id === "coord-assign" ? "Cấu hình Prometheus & Grafana Dashboard cho K8s Cluster" : ""
  );
  const [selectedMemberName, setSelectedMemberName] = useState(initialMemberId);
  const [newAssigneeName, setNewAssigneeName] = useState(initialNewAssigneeId);
  const [selectedProjectName, setSelectedProjectName] = useState(projects[0]?.id || "");
  const [effortMinutes, setEffortMinutes] = useState<number>(
    command.id === "coord-assign" ? 240 : command.id === "coord-add" ? 120 : 60
  );
  const [timeframe, setTimeframe] = useState<string>(
    command.id === "coord-log" ? "hôm nay" : command.id === "coord-add" ? "thứ 2 tuần tới (Sprint 15)" : ""
  );
  const [status, setStatus] = useState<TaskStatus>("in_progress");
  const [startDate, setStartDate] = useState<string>(getTodayString());
  const [endDate, setEndDate] = useState<string>("2026-09-19");
  const [notes, setNotes] = useState(
    command.id === "coord-assign" ? "Cần phối hợp với team Dev trước khi deploy" : ""
  );
  const [isCustomTaskTitle, setIsCustomTaskTitle] = useState(false);

  const [customPrompt, setCustomPrompt] = useState("");
  const [isManualPromptEdited, setIsManualPromptEdited] = useState(false);

  const { memberTasks, loadingMemberTasks } = useMemberTasksForCommand(
    selectedMemberName,
    command.id,
    (tasks) => {
      if (tasks.length > 0) {
        setTaskTitle(tasks[0].title);
        if (tasks[0].projectId) {
          setSelectedProjectName(tasks[0].projectId);
        }
      } else {
        setTaskTitle("");
      }
    }
  );

  const durationStr = formatEffortDurationLabel(effortMinutes);

  const generatedPrompt = useMemo(
    () =>
      buildCommandPrompt(
        command,
        {
          taskTitle,
          selectedMemberName,
          newAssigneeName,
          selectedProjectName,
          durationStr,
          timeframe,
          status,
          startDate,
          endDate,
          notes,
        },
        members,
        projects
      ),
    [
      command,
      taskTitle,
      selectedMemberName,
      newAssigneeName,
      selectedProjectName,
      members,
      projects,
      durationStr,
      timeframe,
      status,
      startDate,
      endDate,
      notes,
    ]
  );

  const finalPrompt = isManualPromptEdited ? customPrompt : generatedPrompt;

  function withReset<T>(setter: (value: T) => void): (value: T) => void {
    return (value: T) => {
      setter(value);
      setIsManualPromptEdited(false);
    };
  }

  function handleSend(): void {
    const textToSend = finalPrompt.trim();
    if (!textToSend) return;
    onSubmitPrompt(textToSend);
  }

  function handleInsert(): void {
    const textToInsert = finalPrompt.trim();
    if (!textToInsert) return;
    onInsertToChat(textToInsert);
  }

  return (
    <div className="flex flex-col min-h-0 flex-1 text-sm bg-[#0b0f19] text-white">
      <div className="flex items-center justify-between p-5 sm:p-6 bg-white/[0.02] border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/25">
            <PenLine size={18} />
          </div>
          <div>
            <div className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>{getModalTitle(command)}</span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-purple-500/15 border border-purple-500/30 text-purple-300 font-mono font-semibold">
                {command.command}
              </span>
            </div>
            <div className="text-xs text-neutral-400 mt-0.5">
              Điền form mẫu hoặc chọn tham số để AI tự sinh prompt chuẩn
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="w-8 h-8 rounded-full bg-white/[0.04] text-neutral-400 hover:text-white hover:bg-white/[0.08] flex items-center justify-center text-xs transition-colors cursor-pointer"
        >
          <X size={15} />
        </button>
      </div>

      <div className="p-5 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
        {command.id === "coord-assign" && (
          <AssignForm
            taskTitle={taskTitle}
            onTaskTitleChange={withReset(setTaskTitle)}
            assignableMembers={assignableMembers}
            selectedMemberName={selectedMemberName}
            onMemberChange={withReset(setSelectedMemberName)}
            projects={projects}
            selectedProjectName={selectedProjectName}
            onProjectChange={withReset(setSelectedProjectName)}
            effortMinutes={effortMinutes}
            durationStr={durationStr}
            onEffortChange={withReset(setEffortMinutes)}
            status={status}
            onStatusChange={withReset(setStatus)}
            startDate={startDate}
            onStartDateChange={withReset(setStartDate)}
            endDate={endDate}
            onEndDateChange={withReset(setEndDate)}
            notes={notes}
            onNotesChange={withReset(setNotes)}
          />
        )}

        {command.id === "coord-reassign" && (
          <ReassignForm
            members={members}
            assignableMembers={assignableMembers}
            projects={projects}
            selectedMemberName={selectedMemberName}
            onMemberChange={withReset(setSelectedMemberName)}
            newAssigneeName={newAssigneeName}
            onNewAssigneeChange={withReset(setNewAssigneeName)}
            taskTitle={taskTitle}
            onTaskTitleChange={withReset(setTaskTitle)}
            memberTasks={memberTasks}
            loadingMemberTasks={loadingMemberTasks}
            isCustomTaskTitle={isCustomTaskTitle}
            onToggleCustomTaskTitle={() => setIsCustomTaskTitle((v) => !v)}
          />
        )}

        {command.id === "coord-add" && (
          <AddForm
            taskTitle={taskTitle}
            onTaskTitleChange={withReset(setTaskTitle)}
            assignableMembers={assignableMembers}
            selectedMemberName={selectedMemberName}
            onMemberChange={withReset(setSelectedMemberName)}
            projects={projects}
            selectedProjectName={selectedProjectName}
            onProjectChange={withReset(setSelectedProjectName)}
            effortMinutes={effortMinutes}
            durationStr={durationStr}
            onEffortChange={withReset(setEffortMinutes)}
            timeframe={timeframe}
            onTimeframeChange={withReset(setTimeframe)}
          />
        )}

        {command.id === "coord-log" && (
          <LogForm
            taskTitle={taskTitle}
            onTaskTitleChange={withReset(setTaskTitle)}
            projects={projects}
            selectedProjectName={selectedProjectName}
            onProjectChange={withReset(setSelectedProjectName)}
            timeframe={timeframe}
            onTimeframeChange={withReset(setTimeframe)}
            effortMinutes={effortMinutes}
            durationStr={durationStr}
            onEffortChange={withReset(setEffortMinutes)}
          />
        )}

        {command.id === "coord-remove" && (
          <RemoveForm
            members={members}
            selectedMemberName={selectedMemberName}
            onMemberChange={withReset(setSelectedMemberName)}
            taskTitle={taskTitle}
            onTaskTitleChange={withReset(setTaskTitle)}
            memberTasks={memberTasks}
            loadingMemberTasks={loadingMemberTasks}
            isCustomTaskTitle={isCustomTaskTitle}
          />
        )}

        {command.id === "detail-info" && (
          <InfoLookupForm
            members={members}
            selectedMemberName={selectedMemberName}
            onMemberChange={withReset(setSelectedMemberName)}
          />
        )}

        {command.id === "detail-task" && (
          <TaskLookupForm taskTitle={taskTitle} onTaskTitleChange={withReset(setTaskTitle)} />
        )}

        {command.id === "detail-project" && (
          <ProjectLookupForm
            projects={projects}
            selectedProjectName={selectedProjectName}
            onProjectChange={withReset(setSelectedProjectName)}
          />
        )}

        <div className="pt-3 border-t border-white/[0.08] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-400" />
              Xem trước nội dung câu lệnh gửi AI:
            </span>
            <span className="text-[11px] text-neutral-500 font-mono">Auto-generated</span>
          </div>

          <div className="relative">
            <textarea
              rows={3}
              value={finalPrompt}
              onChange={(e) => {
                setCustomPrompt(e.target.value);
                setIsManualPromptEdited(true);
              }}
              className="w-full p-3.5 rounded-xl bg-black/60 border border-white/[0.1] text-sky-200 font-mono text-xs leading-relaxed focus:outline-none focus:border-sky-500/60 resize-none"
              placeholder="Nội dung câu lệnh..."
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-white/[0.08] gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 font-medium text-xs sm:text-sm transition-all cursor-pointer"
          >
            Đóng
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleInsert}
              disabled={!finalPrompt.trim()}
              className="px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.12] text-white font-semibold text-xs sm:text-sm transition-all flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-40"
            >
              <PenLine size={14} />
              Chèn vào chat
            </button>

            <button
              type="button"
              onClick={handleSend}
              disabled={!finalPrompt.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:brightness-110 text-white font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 shadow-lg shadow-sky-500/25 cursor-pointer disabled:opacity-40"
            >
              <Send size={14} />
              Gửi cho AI ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CommandTemplateModal({
  isOpen,
  onOpenChange,
  command,
  members,
  projects,
  onInsertToChat,
  onSubmitPrompt,
}: CommandTemplateModalProps): React.JSX.Element | null {
  if (!command) return null;

  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange} purpose="form" width={660}>
      {isOpen && (
        <CommandTemplateForm
          key={`${command.id}-${isOpen}`}
          command={command}
          members={members}
          projects={projects}
          onCancel={() => onOpenChange(false)}
          onInsertToChat={(prompt) => {
            onInsertToChat(prompt);
            onOpenChange(false);
          }}
          onSubmitPrompt={(prompt) => {
            onSubmitPrompt(prompt);
            onOpenChange(false);
          }}
        />
      )}
    </Dialog>
  );
}
