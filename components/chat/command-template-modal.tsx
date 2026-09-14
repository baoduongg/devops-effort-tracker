"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Dialog, DialogHeader } from "@astryxdesign/core/Dialog";
import { HStack } from "@astryxdesign/core/Stack";
import { TextInput } from "@astryxdesign/core/TextInput";
import { Selector } from "@astryxdesign/core/Selector";
import { Button } from "@astryxdesign/core/Button";
import { DateInput } from "@astryxdesign/core/DateInput";
import { Spinner } from "@astryxdesign/core/Spinner";
import type { ISODateString } from "@astryxdesign/core/Calendar";
import { Send, PenLine, Clock, Sparkles } from "lucide-react";
import type { SlashCommand } from "@/lib/slash-commands";
import type { Member } from "@/types/member";
import type { Project } from "@/types/project";
import type { Task, TaskStatus } from "@/types/task";
import { getTasksByMember } from "@/services/tasks.service";
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
  const initialMemberId = members.length > 0 ? members[0].id : "";
  const initialNewAssigneeId = members.length > 1 ? members[1].id : "";

  const [taskTitle, setTaskTitle] = useState("");
  const [selectedMemberName, setSelectedMemberName] = useState(
    command.id === "coord-reassign" || command.id === "coord-remove" || command.id === "detail-info"
      ? initialMemberId
      : ""
  );
  const [newAssigneeName, setNewAssigneeName] = useState(
    command.id === "coord-reassign" ? initialNewAssigneeId : ""
  );
  const [selectedProjectName, setSelectedProjectName] = useState("");
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

  // Member tasks fetching state for Reassign and Remove flows
  const [memberTasks, setMemberTasks] = useState<Task[]>([]);
  const [loadingMemberTasks, setLoadingMemberTasks] = useState(false);
  const [isCustomTaskTitle, setIsCustomTaskTitle] = useState(false);

  // Review custom edited prompt
  const [customPrompt, setCustomPrompt] = useState("");
  const [isManualPromptEdited, setIsManualPromptEdited] = useState(false);

  const memberOptions = useMemo(() => {
    return members.map((m) => ({
      value: m.id,
      label: `${m.name} (${m.role === "leader" ? "Leader" : m.status || "DevOps"})`,
    }));
  }, [members]);

  const newAssigneeOptions = useMemo(() => {
    return members
      .filter((m) => m.id !== selectedMemberName)
      .map((m) => ({
        value: m.id,
        label: `${m.name} (${m.role === "leader" ? "Leader" : m.status || "DevOps"})`,
      }));
  }, [members, selectedMemberName]);

  const projectOptions = useMemo(() => {
    return projects.map((p) => ({
      value: p.id,
      label: p.name,
    }));
  }, [projects]);

  // Fetch tasks of selected member for Reassign & Remove commands
  useEffect(() => {
    let ignore = false;

    async function loadTasks(): Promise<void> {
      if (!selectedMemberName || (command.id !== "coord-reassign" && command.id !== "coord-remove")) {
        return;
      }
      setLoadingMemberTasks(true);
      try {
        const tasks = await getTasksByMember(selectedMemberName);
        if (!ignore) {
          setMemberTasks(tasks);
          if (tasks.length > 0) {
            setTaskTitle(tasks[0].title);
            if (tasks[0].projectId) {
              setSelectedProjectName(tasks[0].projectId);
            }
          } else {
            setTaskTitle("");
          }
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
  }, [selectedMemberName, command.id]);

  const taskOptions = useMemo(() => {
    return memberTasks.map((t) => {
      const proj = projects.find((p) => p.id === t.projectId)?.name;
      const statusLabel =
        t.status === "done"
          ? "Done"
          : t.status === "planned"
          ? "Planned"
          : "In Progress";
      const durationLabel = formatEffortDuration(t.effortMinutes);
      const parts = [proj, statusLabel, durationLabel].filter(Boolean).join(" • ");
      return {
        value: t.title,
        label: parts ? `${t.title} (${parts})` : t.title,
      };
    });
  }, [memberTasks, projects]);

  const durationStr = formatEffortDuration(effortMinutes);

  // Dynamically generate natural language prompt based on current command and form values
  const generatedPrompt = useMemo(() => {
    const title = taskTitle.trim() || "[Tên công việc]";
    const member = members.find((m) => m.id === selectedMemberName)?.name || "[Tên nhân sự]";
    const newMember = members.find((m) => m.id === newAssigneeName)?.name || "[Người mới]";
    const proj = projects.find((p) => p.id === selectedProjectName)?.name || "[Tên dự án]";
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
    members,
    projects,
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
    <div className="flex flex-col min-h-0 flex-1 text-sm">
    <div className="p-6 flex flex-col gap-5 overflow-y-auto min-h-0">
      {/* 1. Member Info Lookup */}
      {isInfoCommand && (
        <div className="flex flex-col gap-3">
          <Selector
            label="Chọn thành viên cần tra cứu"
            size="md"
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
            size="md"
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
            size="md"
            options={projectOptions}
            value={selectedProjectName}
            onChange={(v) => {
              setSelectedProjectName(v);
              setIsManualPromptEdited(false);
            }}
          />
        </div>
      )}

      {/* 4. Reassign Task: Flow: Chọn người hiện tại -> Fetch task người đó -> Chọn nhân sự mới */}
      {isReassignCommand && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-neutral-200 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs flex items-center justify-center font-bold">1</span>
              Người đang phụ trách task (Hiện tại)
            </span>
            <Selector
              label="Chọn nhân sự hiện tại"
              size="md"
              options={memberOptions}
              value={selectedMemberName}
              onChange={(v) => {
                setSelectedMemberName(v);
                if (newAssigneeName === v) {
                  const alt = members.find((m) => m.id !== v);
                  setNewAssigneeName(alt?.id || "");
                }
                setIsManualPromptEdited(false);
              }}
              isRequired
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-neutral-200 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs flex items-center justify-center font-bold">2</span>
              Chọn task cần chuyển giao
            </span>

            {loadingMemberTasks ? (
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center gap-2.5 text-sm text-neutral-300">
                <Spinner size="sm" label="Đang tải task..." />
                <span>Đang tải danh sách task của nhân sự...</span>
              </div>
            ) : memberTasks.length > 0 && !isCustomTaskTitle ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-400">
                    Tìm thấy <span className="font-semibold text-sky-300">{memberTasks.length}</span> task của thành viên này
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsCustomTaskTitle(true)}
                    className="text-xs text-sky-400 hover:text-sky-300 hover:underline cursor-pointer font-medium"
                  >
                    Nhập tay tên task khác
                  </button>
                </div>
                <Selector
                  label="Danh sách task của nhân sự"
                  size="md"
                  options={taskOptions}
                  value={taskTitle}
                  onChange={(v) => {
                    setTaskTitle(v);
                    setIsManualPromptEdited(false);
                  }}
                />
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {selectedMemberName && memberTasks.length === 0 && !loadingMemberTasks && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-200 leading-relaxed">
                    Nhân sự này hiện chưa có task nào trong hệ thống. Bạn có thể nhập trực tiếp tên task bên dưới:
                  </div>
                )}
                {memberTasks.length > 0 && isCustomTaskTitle && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomTaskTitle(false);
                        if (memberTasks.length > 0) setTaskTitle(memberTasks[0].title);
                      }}
                      className="text-xs text-sky-400 hover:text-sky-300 hover:underline cursor-pointer font-medium"
                    >
                      Chọn từ danh sách có sẵn
                    </button>
                  </div>
                )}
                <TextInput
                  label="Tên task"
                  size="md"
                  value={taskTitle}
                  onChange={(v) => {
                    setTaskTitle(v);
                    setIsManualPromptEdited(false);
                  }}
                  placeholder="VD: Cấu hình PagerDuty, Fix lỗi EKS..."
                  isRequired
                />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-neutral-200 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs flex items-center justify-center font-bold">3</span>
              Chuyển sang cho nhân sự mới tiếp nhận
            </span>
            <Selector
              label="Chọn nhân sự mới"
              size="md"
              options={newAssigneeOptions}
              value={newAssigneeName}
              onChange={(v) => {
                setNewAssigneeName(v);
                setIsManualPromptEdited(false);
              }}
              isRequired
            />
          </div>
        </div>
      )}

      {/* 5. Remove Task: Flow: Chọn người phụ trách -> Chọn task của người đó */}
      {isRemoveCommand && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-neutral-200 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs flex items-center justify-center font-bold">1</span>
              Thành viên đang phụ trách task
            </span>
            <Selector
              label="Chọn thành viên"
              size="md"
              options={memberOptions}
              value={selectedMemberName}
              onChange={(v) => {
                setSelectedMemberName(v);
                setIsManualPromptEdited(false);
              }}
              isRequired
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-neutral-200 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs flex items-center justify-center font-bold">2</span>
              Chọn task cần xóa / hủy
            </span>

            {loadingMemberTasks ? (
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center gap-2.5 text-sm text-neutral-300">
                <Spinner size="sm" label="Đang tải task..." />
                <span>Đang tải danh sách task của nhân sự...</span>
              </div>
            ) : memberTasks.length > 0 && !isCustomTaskTitle ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-400">
                    Tìm thấy <span className="font-semibold text-sky-300">{memberTasks.length}</span> task của thành viên này
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsCustomTaskTitle(true)}
                    className="text-xs text-sky-400 hover:text-sky-300 hover:underline cursor-pointer font-medium"
                  >
                    Nhập tay tên task
                  </button>
                </div>
                <Selector
                  label="Danh sách task"
                  size="md"
                  options={taskOptions}
                  value={taskTitle}
                  onChange={(v) => {
                    setTaskTitle(v);
                    setIsManualPromptEdited(false);
                  }}
                />
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {selectedMemberName && memberTasks.length === 0 && !loadingMemberTasks && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-200 leading-relaxed">
                    Nhân sự này hiện chưa có task nào. Bạn có thể nhập trực tiếp tên task cần xóa:
                  </div>
                )}
                {memberTasks.length > 0 && isCustomTaskTitle && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomTaskTitle(false);
                        if (memberTasks.length > 0) setTaskTitle(memberTasks[0].title);
                      }}
                      className="text-xs text-sky-400 hover:text-sky-300 hover:underline cursor-pointer font-medium"
                    >
                      Chọn từ danh sách có sẵn
                    </button>
                  </div>
                )}
                <TextInput
                  label="Tên task cần xóa"
                  size="md"
                  value={taskTitle}
                  onChange={(v) => {
                    setTaskTitle(v);
                    setIsManualPromptEdited(false);
                  }}
                  placeholder="VD: Nâng cấp cluster cũ, Task kiểm thử..."
                  isRequired
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. Assign / Add / Log Task Form */}
      {(isAssignCommand || isAddCommand || isLogCommand) && (
        <div className="flex flex-col gap-4">
          {/* Task Title */}
          <TextInput
            label="Tiêu đề công việc (Task)"
            size="md"
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
              size="md"
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
            size="md"
            options={projectOptions}
            value={selectedProjectName}
            onChange={(v) => {
              setSelectedProjectName(v);
              setIsManualPromptEdited(false);
            }}
          />

          {/* Effort / Duration Picker */}
          <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08]">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-200 font-medium flex items-center gap-1.5">
                <Clock size={15} className="text-sky-400" />
                Thời lượng thực hiện:{" "}
                <span className="text-sky-300 font-bold">{durationStr}</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {EFFORT_DURATION_PRESETS.map((p) => (
                <button
                  key={p.minutes}
                  type="button"
                  onClick={() => {
                    setEffortMinutes(p.minutes);
                    setIsManualPromptEdited(false);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    effortMinutes === p.minutes
                      ? "bg-sky-500/25 text-sky-200 border-sky-400/50 shadow-sm shadow-sky-500/20"
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
                label="Trạng thái công việc"
                size="md"
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
                  size="md"
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
                  size="md"
                  format="date"
                  width="100%"
                  hasClear
                  value={endDate ? (endDate as ISODateString) : undefined}
                  onChange={(v) => {
                    setEndDate(v || null);
                    setIsManualPromptEdited(false);
                  }}
                />
              </div>

              <TextInput
                label="Ghi chú thêm (Tùy chọn)"
                size="md"
                value={notes}
                onChange={(v) => {
                  setNotes(v);
                  setIsManualPromptEdited(false);
                }}
                placeholder="VD: Cần phối hợp với team Dev trước khi deploy..."
              />
            </>
          )}

          {/* Add Command specific fields */}
          {isAddCommand && (
            <TextInput
              label="Thời điểm dự kiến"
              size="md"
              value={timeframe}
              onChange={(v) => {
                setTimeframe(v);
                setIsManualPromptEdited(false);
              }}
              placeholder="VD: tuần sau, thứ 2 tuần tới, ngày 15/09..."
            />
          )}

          {/* Log Command specific fields */}
          {isLogCommand && (
            <TextInput
              label="Thời điểm hoàn thành"
              size="md"
              value={timeframe}
              onChange={(v) => {
                setTimeframe(v);
                setIsManualPromptEdited(false);
              }}
              placeholder="VD: hôm nay, hôm qua, thứ 6, 2026-09-08..."
            />
          )}
        </div>
      )}

      {/* Live Prompt Preview & Manual Review Box */}
      <div className="flex flex-col gap-2 pt-3 border-t border-white/[0.08]">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-neutral-200 flex items-center gap-1.5">
            <Sparkles size={14} className="text-amber-400" />
            Xem trước nội dung câu lệnh gửi AI:
          </span>
          {isManualPromptEdited && (
            <button
              type="button"
              onClick={() => {
                setIsManualPromptEdited(false);
                setCustomPrompt("");
              }}
              className="text-xs text-sky-400 hover:text-sky-300 hover:underline cursor-pointer font-medium"
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
            className="w-full text-sm font-medium p-3 rounded-xl bg-black/50 border border-white/15 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-sky-500/70 transition-colors resize-none leading-relaxed shadow-inner"
            placeholder="Nội dung lệnh..."
          />
        </div>
        <span className="text-xs text-neutral-400">
          💡 Bạn có thể chỉnh sửa trực tiếp nội dung ở trên nếu muốn bổ sung thêm chi tiết.
        </span>
      </div>
    </div>

      {/* Modal Action Buttons */}
      <HStack gap={3} justify="end" className="p-5 pt-3 border-t border-white/[0.08]">
        <Button
          type="button"
          label="Hủy"
          variant="ghost"
          size="md"
          onClick={onCancel}
        />
        <Button
          type="button"
          label="Điền vào khung chat"
          variant="secondary"
          size="md"
          icon={<PenLine size={15} />}
          onClick={handleInsert}
          isDisabled={!finalPrompt.trim()}
        />
        <Button
          type="button"
          label="Gửi lệnh ngay"
          variant="primary"
          size="md"
          icon={<Send size={15} />}
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
      width={640}
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

