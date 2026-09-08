"use client";

import React, { useState, useMemo } from "react";
import { Dialog, DialogHeader } from "@astryxdesign/core/Dialog";
import { HStack } from "@astryxdesign/core/Stack";
import { TextInput } from "@astryxdesign/core/TextInput";
import { Selector } from "@astryxdesign/core/Selector";
import { Button } from "@astryxdesign/core/Button";
import { DateInput } from "@astryxdesign/core/DateInput";
import type { ISODateString } from "@astryxdesign/core/Calendar";
import { Send, PenLine, Clock, Sparkles } from "lucide-react";
import type { SlashCommand } from "@/lib/slash-commands";
import type { Member } from "@/types/member";
import type { Project } from "@/types/project";
import type { TaskStatus } from "@/types/task";
import { formatEffortDuration, EFFORT_DURATION_PRESETS } from "@/lib/effort";

const STATUS_OPTIONS = [
  { value: "in_progress", label: "Đang thực hiện (In Progress)" },
  { value: "planned", label: "Kế hoạch (Planned)" },
  { value: "done", label: "Hoàn thành (Done)" },
];

function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

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
  const defaultMember = useMemo(() => {
    if (members.length === 0) return "";
    const firstEngineer = members.find((m) => m.role !== "leader") || members[0];
    return firstEngineer.name;
  }, [members]);

  const defaultNewMember = useMemo(() => {
    if (members.length < 2) return defaultMember;
    const second = members.filter((m) => m.role !== "leader")[1] || members[1];
    return second?.name || defaultMember;
  }, [members, defaultMember]);

  const defaultProject = useMemo(() => {
    return projects.length > 0 ? projects[0].name : "";
  }, [projects]);

  const [taskTitle, setTaskTitle] = useState("");
  const [selectedMemberName, setSelectedMemberName] = useState(defaultMember);
  const [newAssigneeName, setNewAssigneeName] = useState(defaultNewMember);
  const [selectedProjectName, setSelectedProjectName] = useState(defaultProject);
  const [effortMinutes, setEffortMinutes] = useState<number>(
    command.id === "coord-add" ? 120 : 60
  );
  const [timeframe, setTimeframe] = useState<string>(
    command.id === "coord-log"
      ? "hôm nay"
      : command.id === "coord-add"
      ? "tuần sau"
      : ""
  );
  const [status, setStatus] = useState<TaskStatus>("in_progress");
  const [startDate, setStartDate] = useState<string>(getTodayString());
  const [endDate, setEndDate] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  // Review custom edited prompt
  const [customPrompt, setCustomPrompt] = useState("");
  const [isManualPromptEdited, setIsManualPromptEdited] = useState(false);

  const memberOptions = useMemo(() => {
    return members.map((m) => ({
      value: m.name,
      label: `${m.name} (${m.role === "leader" ? "Leader" : m.status || "DevOps"})`,
    }));
  }, [members]);

  const projectOptions = useMemo(() => {
    return projects.map((p) => ({
      value: p.name,
      label: p.name,
    }));
  }, [projects]);

  const durationStr = formatEffortDuration(effortMinutes);

  // Dynamically generate natural language prompt based on current command and form values
  const generatedPrompt = useMemo(() => {
    const title = taskTitle.trim() || "[Tên công việc]";
    const member = selectedMemberName.trim() || "[Tên nhân sự]";
    const newMember = newAssigneeName.trim() || "[Người mới]";
    const proj = selectedProjectName.trim() || "[Tên dự án]";
    const duration = durationStr;

    switch (command.id) {
      case "coord-assign": {
        const statusLabel =
          status === "done" ? "hoàn thành" : status === "planned" ? "kế hoạch" : "đang thực hiện";
        const datePart = startDate ? `, bắt đầu ${startDate}` : "";
        const deadlinePart = endDate ? `, hạn hoàn thành ${endDate}` : "";
        const notesPart = notes.trim() ? `. Ghi chú: ${notes.trim()}` : "";
        return `Giao task ${title} cho ${member} thuộc dự án ${proj} thời gian ${duration}, trạng thái ${statusLabel}${datePart}${deadlinePart}${notesPart}`;
      }

      case "coord-reassign":
        return `Chuyển task ${title} từ ${member} sang cho ${newMember}`;

      case "coord-remove":
        return `Xóa task ${title} của ${member}`;

      case "coord-add":
        return `Lập kế hoạch task ${title} cho ${member} dự án ${proj} thời gian ${duration}`;

      case "coord-log":
        return `Log công việc: ${title} cho dự án ${proj}, thời gian ${duration}${
          timeframe.trim() ? `, hoàn thành ${timeframe.trim()}` : ""
        }`;

      case "detail-info":
        return `Tình hình công việc, task đang làm và kế hoạch của ${member} ra sao?`;

      case "detail-task":
        return `Hiển thị thông tin chi tiết, người phụ trách và tiến độ của task ${title}`;

      case "detail-project":
        return `Hiển thị thông tin chi tiết về dự án ${proj}, các task và thành viên tham gia`;

      default:
        if (command.template) {
          return command.template
            .replace("[Tên công việc]", title)
            .replace("[Tên task]", title)
            .replace("[Tên nhân sự]", member)
            .replace("[Người cũ]", member)
            .replace("[Tên thành viên]", member)
            .replace("[Người mới]", newMember)
            .replace("[Tên dự án]", proj)
            .replace("[1 tiếng]", duration)
            .replace("[2 tiếng]", duration)
            .replace("[30%]", duration)
            .replace("[40%]", duration);
        }
        return command.prompt || "";
    }
  }, [
    command,
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
  ]);

  const finalPrompt = isManualPromptEdited ? customPrompt : generatedPrompt;

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

  const isInfoCommand = command.id === "detail-info";
  const isTaskDetailCommand = command.id === "detail-task";
  const isProjectDetailCommand = command.id === "detail-project";
  const isAssignCommand = command.id === "coord-assign";
  const isReassignCommand = command.id === "coord-reassign";
  const isRemoveCommand = command.id === "coord-remove";
  const isAddCommand = command.id === "coord-add";
  const isLogCommand = command.id === "coord-log";

  return (
    <div className="flex flex-col min-h-0 flex-1">
    <div className="p-5 flex flex-col gap-4 overflow-y-auto min-h-0">
      {/* 1. Member Info Lookup */}
      {isInfoCommand && (
        <div className="flex flex-col gap-3">
          <Selector
            label="Chọn thành viên cần tra cứu"
            options={memberOptions}
            value={selectedMemberName}
            onChange={(v) => {
              setSelectedMemberName(v);
              setIsManualPromptEdited(false);
            }}
          />
        </div>
      )}

      {/* 2. Task Detail Lookup */}
      {isTaskDetailCommand && (
        <div className="flex flex-col gap-3">
          <TextInput
            label="Tên hoặc từ khóa của task cần tra cứu"
            value={taskTitle}
            onChange={(v) => {
              setTaskTitle(v);
              setIsManualPromptEdited(false);
            }}
            placeholder="VD: Migrate staging cluster, Setup CI/CD..."
            isRequired
            hasAutoFocus
          />
        </div>
      )}

      {/* 3. Project Detail Lookup */}
      {isProjectDetailCommand && (
        <div className="flex flex-col gap-3">
          <Selector
            label="Chọn dự án cần tra cứu"
            options={projectOptions}
            value={selectedProjectName}
            onChange={(v) => {
              setSelectedProjectName(v);
              setIsManualPromptEdited(false);
            }}
          />
        </div>
      )}

      {/* 4. Reassign Task */}
      {isReassignCommand && (
        <div className="flex flex-col gap-3.5">
          <TextInput
            label="Tên task cần chuyển"
            value={taskTitle}
            onChange={(v) => {
              setTaskTitle(v);
              setIsManualPromptEdited(false);
            }}
            placeholder="VD: Cấu hình PagerDuty, Fix lỗi EKS..."
            isRequired
            hasAutoFocus
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Selector
              label="Người đang phụ trách (Hiện tại)"
              options={memberOptions}
              value={selectedMemberName}
              onChange={(v) => {
                setSelectedMemberName(v);
                setIsManualPromptEdited(false);
              }}
            />

            <Selector
              label="Chuyển sang cho nhân sự mới"
              options={memberOptions}
              value={newAssigneeName}
              onChange={(v) => {
                setNewAssigneeName(v);
                setIsManualPromptEdited(false);
              }}
            />
          </div>
        </div>
      )}

      {/* 5. Remove Task */}
      {isRemoveCommand && (
        <div className="flex flex-col gap-3.5">
          <TextInput
            label="Tên task cần xóa / hủy"
            value={taskTitle}
            onChange={(v) => {
              setTaskTitle(v);
              setIsManualPromptEdited(false);
            }}
            placeholder="VD: Nâng cấp cluster cũ, Task kiểm thử..."
            isRequired
            hasAutoFocus
          />

          <Selector
            label="Thành viên đang phụ trách task"
            options={memberOptions}
            value={selectedMemberName}
            onChange={(v) => {
              setSelectedMemberName(v);
              setIsManualPromptEdited(false);
            }}
          />
        </div>
      )}

      {/* 6. Assign / Add / Log Task Form */}
      {(isAssignCommand || isAddCommand || isLogCommand) && (
        <div className="flex flex-col gap-3.5">
          {/* Task Title */}
          <TextInput
            label="Tiêu đề công việc (Task)"
            value={taskTitle}
            onChange={(v) => {
              setTaskTitle(v);
              setIsManualPromptEdited(false);
            }}
            placeholder={
              isLogCommand
                ? "VD: Cấu hình SSL Cert-manager cho cụm EKS..."
                : isAddCommand
                ? "VD: Nâng cấp phiên bản ArgoCD và cài đặt Helm Chart..."
                : "VD: Fix lỗi kết nối AWS RDS bên module Core..."
            }
            isRequired
            hasAutoFocus
          />

          {/* Member Assignee (for Assign and Add) */}
          {(isAssignCommand || isAddCommand) && (
            <Selector
              label="Giao cho nhân sự (Assignee)"
              options={memberOptions}
              value={selectedMemberName}
              onChange={(v) => {
                setSelectedMemberName(v);
                setIsManualPromptEdited(false);
              }}
            />
          )}

          {/* Project Selection */}
          <Selector
            label="Dự án liên quan"
            options={projectOptions}
            value={selectedProjectName}
            onChange={(v) => {
              setSelectedProjectName(v);
              setIsManualPromptEdited(false);
            }}
          />

          {/* Effort / Duration Picker */}
          <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.08]">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-300 font-medium flex items-center gap-1.5">
                <Clock size={13} className="text-sky-400" />
                Thời lượng thực hiện:{" "}
                <span className="text-sky-300 font-semibold">{durationStr}</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {EFFORT_DURATION_PRESETS.map((p) => (
                <button
                  key={p.minutes}
                  type="button"
                  onClick={() => {
                    setEffortMinutes(p.minutes);
                    setIsManualPromptEdited(false);
                  }}
                  className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                    effortMinutes === p.minutes
                      ? "bg-sky-500/20 text-sky-300 border-sky-500/40"
                      : "bg-white/[0.03] text-neutral-300 border-white/[0.08] hover:bg-white/[0.08] hover:text-white"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Status & Dates (Assign only) */}
          {isAssignCommand && (
            <>
              <Selector
                label="Trạng thái"
                options={STATUS_OPTIONS}
                value={status}
                onChange={(v) => {
                  setStatus(v as TaskStatus);
                  setIsManualPromptEdited(false);
                }}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <DateInput
                  label="Ngày bắt đầu"
                  format="date"
                  width="100%"
                  value={startDate as ISODateString}
                  onChange={(v) => {
                    setStartDate(v ?? getTodayString());
                    setIsManualPromptEdited(false);
                  }}
                />

                <DateInput
                  label="Hạn hoàn thành (Deadline)"
                  format="date"
                  width="100%"
                  hasClear
                  placeholder="Tùy chọn"
                  value={(endDate || undefined) as ISODateString | undefined}
                  onChange={(v) => {
                    setEndDate(v || null);
                    setIsManualPromptEdited(false);
                  }}
                />
              </div>

              <TextInput
                label="Ghi chú chi tiết (Tùy chọn)"
                value={notes}
                onChange={(v) => {
                  setNotes(v);
                  setIsManualPromptEdited(false);
                }}
                placeholder="Mô tả tóm tắt bối cảnh hoặc yêu cầu kỹ thuật..."
              />
            </>
          )}

          {/* Timeframe / Completed Date for Log & Add */}
          {(isLogCommand || isAddCommand) && (
            <TextInput
              label={
                isLogCommand
                  ? "Thời điểm hoàn thành"
                  : "Thời gian dự kiến thực hiện"
              }
              value={timeframe}
              onChange={(v) => {
                setTimeframe(v);
                setIsManualPromptEdited(false);
              }}
              placeholder={
                isLogCommand
                  ? "VD: hôm nay, hôm qua, thứ 6, 2026-09-08..."
                  : "VD: tuần sau, thứ 2 tuần tới, ngày 15/09..."
              }
            />
          )}
        </div>
      )}

      {/* Live Prompt Preview & Manual Review Box */}
      <div className="flex flex-col gap-1.5 pt-2 border-t border-white/[0.08]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
            <Sparkles size={13} className="text-amber-400" />
            Xem trước nội dung câu lệnh gửi AI:
          </span>
          {isManualPromptEdited && (
            <button
              type="button"
              onClick={() => {
                setIsManualPromptEdited(false);
                setCustomPrompt("");
              }}
              className="text-[11px] text-sky-400 hover:underline"
            >
              Đặt lại theo form
            </button>
          )}
        </div>

        <div className="relative">
          <textarea
            rows={2}
            value={isManualPromptEdited ? customPrompt : generatedPrompt}
            onChange={(e) => {
              setCustomPrompt(e.target.value);
              setIsManualPromptEdited(true);
            }}
            className="w-full text-xs font-medium p-2.5 rounded-lg bg-black/40 border border-white/10 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-sky-500/60 transition-colors resize-none leading-relaxed"
            placeholder="Nội dung lệnh..."
          />
        </div>
        <span className="text-[11px] text-neutral-500">
          💡 Bạn có thể chỉnh sửa trực tiếp nội dung ở trên nếu muốn bổ sung thêm chi tiết.
        </span>
      </div>
    </div>

      {/* Modal Action Buttons */}
      <HStack gap={2} justify="end" className="p-5 pt-2 border-t border-white/[0.06]">
        <Button
          type="button"
          label="Hủy"
          variant="ghost"
          size="sm"
          onClick={onCancel}
        />
        <Button
          type="button"
          label="Điền vào khung chat"
          variant="secondary"
          size="sm"
          icon={<PenLine size={14} />}
          onClick={handleInsert}
          isDisabled={!finalPrompt.trim()}
        />
        <Button
          type="button"
          label="Gửi lệnh ngay"
          variant="primary"
          size="sm"
          icon={<Send size={14} />}
          onClick={handleSend}
          isDisabled={!finalPrompt.trim()}
        />
      </HStack>
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
    <Dialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      purpose="form"
      width={580}
    >
      <DialogHeader
        title={`Điền mẫu lệnh: ${command.label}`}
        subtitle={command.description || "Nhập các thông tin bên dưới để AI tự động soạn thảo và xử lý lệnh"}
        onOpenChange={onOpenChange}
      />

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
