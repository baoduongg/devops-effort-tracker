import { ImageResponse } from "next/og";
import type { GroundingSnapshot } from "@/services/grounding.service";
import type { Member } from "@/types/member";

interface DailyDigestImageProps {
  snapshot: GroundingSnapshot;
  members?: Member[];
  dateStr: string;
}

export function generateDailyDigestImageResponse({
  snapshot,
  dateStr,
}: DailyDigestImageProps): ImageResponse {
  const totalActiveTasks = snapshot.members.reduce(
    (acc, m) => acc + m.activeTasks.length,
    0
  );
  const overdueCount = snapshot.overdueTasks.length;
  const overloadedCount = snapshot.overloadedMembers.length;
  const busyCount = snapshot.busyMembers.length;
  const freeCount = snapshot.freeMembers.length;

  const overdueMemberNames = new Set(snapshot.overdueTasks.map((t) => t.memberName));

  const membersWithTasks = snapshot.members.filter(
    (m) => m.activeTasks.length > 0
  );

  const displayedOverdue = snapshot.overdueTasks.slice(0, 4);
  const displayedProjects = snapshot.projectProgress.slice(0, 4);
  const displayedMembers = membersWithTasks.slice(0, 5);

  // Dynamic height calculation so content never overlaps footer regardless of task volume
  const overdueCardHeight =
    displayedOverdue.length === 0
      ? 110
      : 60 + displayedOverdue.length * 68 + (snapshot.overdueTasks.length > 4 ? 26 : 0);

  const projectCardHeight =
    displayedProjects.length === 0
      ? 0
      : 60 + displayedProjects.length * 52 + (snapshot.projectProgress.length > 4 ? 26 : 0);

  const leftColumnHeight =
    overdueCardHeight + (displayedProjects.length > 0 ? 16 + projectCardHeight : 0);

  const rightColumnHeight =
    displayedMembers.length === 0
      ? 120
      : 60 + displayedMembers.length * 82 + (membersWithTasks.length > 5 ? 26 : 0);

  const contentHeight = Math.max(leftColumnHeight, rightColumnHeight);

  // Base overhead: Header (~100px) + KPI Bar (~105px) + Footer (~55px) + Root Paddings (68px) + Gap buffers (40px)
  const calculatedHeight = Math.max(720, Math.round(368 + contentHeight));
  const canvasWidth = 1180;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#080C14",
          color: "#F1F5F9",
          padding: "34px 38px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          justifyContent: "space-between",
        }}
      >
        {/* Top Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #1E293B",
            paddingBottom: "18px",
            marginBottom: "20px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "4px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#2563EB",
                  color: "#FFFFFF",
                  fontSize: "11px",
                  fontWeight: 700,
                  padding: "4px 8px",
                  borderRadius: "6px",
                  letterSpacing: "0.05em",
                }}
              >
                DEVOPS EFFORT TRACKER
              </div>
              <span style={{ fontSize: "13px", color: "#64748B" }}>
                Daily Digest & Status Report
              </span>
            </div>
            <div
              style={{
                fontSize: "25px",
                fontWeight: 800,
                color: "#FFFFFF",
                letterSpacing: "-0.02em",
              }}
            >
              📋 Báo Cáo Tiến Độ Công Việc Hằng Ngày
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              backgroundColor: "#0F172A",
              border: "1px solid #1E293B",
              borderRadius: "10px",
              padding: "8px 16px",
            }}
          >
            <span style={{ fontSize: "11px", color: "#94A3B8" }}>Ngày báo cáo</span>
            <span
              style={{
                fontSize: "15px",
                fontWeight: 700,
                color: "#38BDF8",
              }}
            >
              {dateStr}
            </span>
          </div>
        </div>

        {/* Top KPI Cards Row */}
        <div
          style={{
            display: "flex",
            gap: "14px",
            marginBottom: "20px",
          }}
        >
          {/* Overdue KPI */}
          <div
            style={{
              display: "flex",
              flex: 1,
              flexDirection: "column",
              backgroundColor: overdueCount > 0 ? "rgba(220, 38, 38, 0.12)" : "#0F172A",
              border: `1px solid ${overdueCount > 0 ? "#DC2626" : "#1E293B"}`,
              borderRadius: "12px",
              padding: "14px 18px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "13px", color: overdueCount > 0 ? "#FCA5A5" : "#94A3B8", fontWeight: 600 }}>
                ⚠️ Quá hạn
              </span>
              <span
                style={{
                  fontSize: "10px",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  backgroundColor: overdueCount > 0 ? "#EF4444" : "#10B981",
                  color: "#FFFFFF",
                  fontWeight: 700,
                }}
              >
                {overdueCount > 0 ? "CẦN XỬ LÝ" : "TỐT"}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "baseline",
                gap: "6px",
                marginTop: "4px",
              }}
            >
              <span
                style={{
                  fontSize: "28px",
                  fontWeight: 800,
                  color: overdueCount > 0 ? "#EF4444" : "#10B981",
                }}
              >
                {overdueCount}
              </span>
              <span style={{ fontSize: "14px", fontWeight: 500, color: "#94A3B8" }}>
                task
              </span>
            </div>
          </div>

          {/* Active Tasks KPI */}
          <div
            style={{
              display: "flex",
              flex: 1,
              flexDirection: "column",
              backgroundColor: "#0F172A",
              border: "1px solid #1E293B",
              borderRadius: "12px",
              padding: "14px 18px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "13px", color: "#94A3B8", fontWeight: 600 }}>
                🏃 Đang thực hiện
              </span>
              <span
                style={{
                  fontSize: "10px",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  backgroundColor: "#0284C7",
                  color: "#FFFFFF",
                  fontWeight: 700,
                }}
              >
                IN PROGRESS
              </span>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "baseline",
                gap: "6px",
                marginTop: "4px",
              }}
            >
              <span
                style={{
                  fontSize: "28px",
                  fontWeight: 800,
                  color: "#38BDF8",
                }}
              >
                {totalActiveTasks}
              </span>
              <span style={{ fontSize: "14px", fontWeight: 500, color: "#94A3B8" }}>
                task
              </span>
            </div>
          </div>

          {/* Workload Status KPI */}
          <div
            style={{
              display: "flex",
              flex: 1.5,
              flexDirection: "column",
              backgroundColor: "#0F172A",
              border: "1px solid #1E293B",
              borderRadius: "12px",
              padding: "14px 18px",
            }}
          >
            <span style={{ fontSize: "13px", color: "#94A3B8", fontWeight: 600, marginBottom: "8px" }}>
              👥 Tải công việc DevOps
            </span>
            <div style={{ display: "flex", flexDirection: "row", gap: "10px", alignItems: "center" }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: "6px",
                  backgroundColor: "#1E293B",
                  padding: "4px 10px",
                  borderRadius: "6px",
                }}
              >
                <div style={{ width: "8px", height: "8px", borderRadius: "4px", backgroundColor: "#EF4444" }} />
                <span style={{ fontSize: "12px", color: "#E2E8F0" }}>Quá tải: {overloadedCount}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: "6px",
                  backgroundColor: "#1E293B",
                  padding: "4px 10px",
                  borderRadius: "6px",
                }}
              >
                <div style={{ width: "8px", height: "8px", borderRadius: "4px", backgroundColor: "#F59E0B" }} />
                <span style={{ fontSize: "12px", color: "#E2E8F0" }}>Bận: {busyCount}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: "6px",
                  backgroundColor: "#1E293B",
                  padding: "4px 10px",
                  borderRadius: "6px",
                }}
              >
                <div style={{ width: "8px", height: "8px", borderRadius: "4px", backgroundColor: "#10B981" }} />
                <span style={{ fontSize: "12px", color: "#E2E8F0" }}>Sẵn sàng: {freeCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body: Two Columns */}
        <div style={{ display: "flex", gap: "20px", flex: 1, marginBottom: "20px" }}>
          {/* Left Column: Overdue Tasks + Project Progress */}
          <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: "16px" }}>
            {/* Overdue Tasks Section */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#0F172A",
                border: `1px solid ${snapshot.overdueTasks.length > 0 ? "rgba(239, 68, 68, 0.4)" : "#1E293B"}`,
                borderRadius: "12px",
                padding: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                  borderBottom: "1px solid #1E293B",
                  paddingBottom: "8px",
                }}
              >
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#F87171" }}>
                  ⚠️ Task Quá Hạn & Có Vấn Đề ({snapshot.overdueTasks.length})
                </span>
                {snapshot.overdueTasks.length > 0 && (
                  <span
                    style={{
                      fontSize: "11px",
                      color: "#EF4444",
                      fontWeight: 700,
                      backgroundColor: "rgba(239, 68, 68, 0.15)",
                      padding: "2px 8px",
                      borderRadius: "6px",
                    }}
                  >
                    Cần xử lý ngay
                  </span>
                )}
              </div>

              {snapshot.overdueTasks.length === 0 ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "18px",
                    color: "#10B981",
                    fontSize: "13px",
                    fontWeight: 600,
                    backgroundColor: "rgba(16, 185, 129, 0.08)",
                    borderRadius: "8px",
                    border: "1px dashed rgba(16, 185, 129, 0.3)",
                  }}
                >
                  🎉 Không có task nào quá hạn hôm nay!
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {displayedOverdue.map((t, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        backgroundColor: "#1E293B",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        borderLeft: "4px solid #EF4444",
                        gap: "6px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: 700,
                            color: "#FFFFFF",
                            maxWidth: "340px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {t.title}
                        </span>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            backgroundColor: "#EF4444",
                            color: "#FFFFFF",
                            fontSize: "10px",
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: "9999px",
                          }}
                        >
                          +{t.daysOverdue} ngày
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            backgroundColor: "rgba(56, 189, 248, 0.15)",
                            color: "#38BDF8",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            fontWeight: 700,
                          }}
                        >
                          👤 Người phụ trách: {t.memberName || "Chưa gán"}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            backgroundColor: "#0F172A",
                            color: "#94A3B8",
                            padding: "2px 6px",
                            borderRadius: "4px",
                          }}
                        >
                          📁 {t.project}
                        </div>
                      </div>
                    </div>
                  ))}
                  {snapshot.overdueTasks.length > displayedOverdue.length && (
                    <span style={{ fontSize: "11px", color: "#94A3B8", textAlign: "center", marginTop: "2px" }}>
                      + còn {snapshot.overdueTasks.length - displayedOverdue.length} task quá hạn khác...
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Projects Progress Section */}
            {snapshot.projectProgress.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  backgroundColor: "#0F172A",
                  border: "1px solid #1E293B",
                  borderRadius: "12px",
                  padding: "16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "12px",
                    borderBottom: "1px solid #1E293B",
                    paddingBottom: "8px",
                  }}
                >
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "#38BDF8" }}>
                    📊 Tiến Độ Dự Án ({snapshot.projectProgress.length})
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {displayedProjects.map((p, idx) => {
                    const total = p.planned + p.inProgress + p.done;
                    const donePercent = total > 0 ? Math.round((p.done / total) * 100) : 0;
                    return (
                      <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                          <span style={{ fontWeight: 600, color: "#E2E8F0" }}>{p.name}</span>
                          <span style={{ color: "#94A3B8" }}>
                            {p.inProgress} đang làm / {p.done} xong ({donePercent}%)
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            width: "100%",
                            height: "6px",
                            backgroundColor: "#1E293B",
                            borderRadius: "3px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${donePercent}%`,
                              backgroundColor: "#10B981",
                              height: "100%",
                            }}
                          />
                          <div
                            style={{
                              width: `${total > 0 ? Math.round((p.inProgress / total) * 100) : 0}%`,
                              backgroundColor: "#0284C7",
                              height: "100%",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  {snapshot.projectProgress.length > displayedProjects.length && (
                    <span style={{ fontSize: "11px", color: "#94A3B8", textAlign: "center", marginTop: "2px" }}>
                      + còn {snapshot.projectProgress.length - displayedProjects.length} dự án khác...
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Member Tasks */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1.2,
              backgroundColor: "#0F172A",
              border: "1px solid #1E293B",
              borderRadius: "12px",
              padding: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "12px",
                borderBottom: "1px solid #1E293B",
                paddingBottom: "8px",
              }}
            >
              <span style={{ fontSize: "14px", fontWeight: 700, color: "#F1F5F9" }}>
                🏃 Active Task Theo Nhân Sự
              </span>
              <span style={{ fontSize: "11px", color: "#64748B" }}>
                {membersWithTasks.length} thành viên có task
              </span>
            </div>

            {membersWithTasks.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "30px",
                  color: "#94A3B8",
                  fontSize: "13px",
                }}
              >
                Không có task nào đang active.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {displayedMembers.map((m, idx) => {
                  const statusBg =
                    m.status === "overloaded"
                      ? "rgba(239, 68, 68, 0.15)"
                      : m.status === "busy"
                        ? "rgba(245, 158, 11, 0.15)"
                        : "rgba(16, 185, 129, 0.15)";
                  const statusColor =
                    m.status === "overloaded"
                      ? "#EF4444"
                      : m.status === "busy"
                        ? "#F59E0B"
                        : "#10B981";
                  const statusLabel =
                    m.status === "overloaded"
                      ? "Quá tải"
                      : m.status === "busy"
                        ? "Bận"
                        : "Sẵn sàng";

                  const isOverdueMember = overdueMemberNames.has(m.name);

                  return (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        backgroundColor: "#1E293B",
                        borderRadius: "8px",
                        padding: "10px 12px",
                        gap: "6px",
                        borderLeft: m.status === "overloaded" || isOverdueMember ? "3px solid #EF4444" : "3px solid transparent",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontSize: "13px", fontWeight: 700, color: "#FFFFFF" }}>
                            {m.name}
                          </span>
                          <span
                            style={{
                              fontSize: "10px",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              backgroundColor: statusBg,
                              color: statusColor,
                              fontWeight: 700,
                            }}
                          >
                            {statusLabel}
                          </span>
                          {isOverdueMember && (
                            <span
                              style={{
                                fontSize: "10px",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                backgroundColor: "rgba(239, 68, 68, 0.2)",
                                color: "#F87171",
                                fontWeight: 700,
                              }}
                            >
                              ⚠️ Có task trễ
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: "11px", color: "#94A3B8" }}>
                          {m.activeTasks.length} task ({Math.round(m.totalEffortMinutes / 60)}h)
                        </span>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                        {m.activeTasks.slice(0, 2).map((t, tIdx) => (
                          <div
                            key={tIdx}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              backgroundColor: "#0F172A",
                              padding: "3px 8px",
                              borderRadius: "4px",
                              fontSize: "11px",
                              color: "#CBD5E1",
                            }}
                          >
                            <span style={{ color: "#38BDF8", marginRight: "4px" }}>•</span>
                            <span
                              style={{
                                maxWidth: "220px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {t.title}
                            </span>
                          </div>
                        ))}
                        {m.activeTasks.length > 2 && (
                          <span style={{ fontSize: "10px", color: "#64748B", alignSelf: "center" }}>
                            +{m.activeTasks.length - 2} khác
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
                {membersWithTasks.length > displayedMembers.length && (
                  <span style={{ fontSize: "11px", color: "#94A3B8", textAlign: "center", marginTop: "2px" }}>
                    + còn {membersWithTasks.length - displayedMembers.length} thành viên khác...
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: "14px",
            borderTop: "1px solid #1E293B",
            fontSize: "11px",
            color: "#64748B",
          }}
        >
          <span>DevOps Effort Tracker • Automated Daily Dispatch</span>
        </div>
      </div>
    ),
    {
      width: canvasWidth,
      height: calculatedHeight,
    }
  );
}

export async function renderDailyDigestImageBuffer(
  snapshot: GroundingSnapshot,
  members: Member[],
  dateStr: string
): Promise<Buffer> {
  const imageResponse = generateDailyDigestImageResponse({
    snapshot,
    members,
    dateStr,
  });
  const arrayBuffer = await imageResponse.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
