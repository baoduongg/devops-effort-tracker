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

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#0B0F19",
          color: "#F1F5F9",
          padding: "36px 40px",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #1E293B",
            paddingBottom: "20px",
            marginBottom: "24px",
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
                  backgroundColor: "#3B82F6",
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
                fontSize: "26px",
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
            }}
          >
            <span style={{ fontSize: "12px", color: "#94A3B8" }}>Ngày báo cáo</span>
            <span
              style={{
                fontSize: "16px",
                fontWeight: 700,
                color: "#38BDF8",
              }}
            >
              {dateStr}
            </span>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div
          style={{
            display: "flex",
            gap: "14px",
            marginBottom: "24px",
          }}
        >
          {/* Overdue KPI */}
          <div
            style={{
              display: "flex",
              flex: 1,
              flexDirection: "column",
              backgroundColor: overdueCount > 0 ? "#450A0A" : "#0F172A",
              border: `1px solid ${overdueCount > 0 ? "#DC2626" : "#1E293B"}`,
              borderRadius: "12px",
              padding: "14px 16px",
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
            <span
              style={{
                fontSize: "28px",
                fontWeight: 800,
                color: overdueCount > 0 ? "#EF4444" : "#10B981",
                marginTop: "4px",
              }}
            >
              {overdueCount} <span style={{ fontSize: "14px", fontWeight: 500 }}>task</span>
            </span>
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
              padding: "14px 16px",
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
            <span
              style={{
                fontSize: "28px",
                fontWeight: 800,
                color: "#38BDF8",
                marginTop: "4px",
              }}
            >
              {totalActiveTasks} <span style={{ fontSize: "14px", fontWeight: 500 }}>task</span>
            </span>
          </div>

          {/* Workload Status KPI */}
          <div
            style={{
              display: "flex",
              flex: 1.4,
              flexDirection: "column",
              backgroundColor: "#0F172A",
              border: "1px solid #1E293B",
              borderRadius: "12px",
              padding: "14px 16px",
            }}
          >
            <span style={{ fontSize: "13px", color: "#94A3B8", fontWeight: 600, marginBottom: "6px" }}>
              👥 Tải công việc Devops
            </span>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  backgroundColor: "#1E293B",
                  padding: "4px 8px",
                  borderRadius: "6px",
                }}
              >
                <div style={{ width: "8px", height: "8px", borderRadius: "4px", backgroundColor: "#EF4444" }} />
                <span style={{ fontSize: "12px", color: "#E2E8F0" }}>Quá tải: <strong>{overloadedCount}</strong></span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  backgroundColor: "#1E293B",
                  padding: "4px 8px",
                  borderRadius: "6px",
                }}
              >
                <div style={{ width: "8px", height: "8px", borderRadius: "4px", backgroundColor: "#F59E0B" }} />
                <span style={{ fontSize: "12px", color: "#E2E8F0" }}>Bận: <strong>{busyCount}</strong></span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  backgroundColor: "#1E293B",
                  padding: "4px 8px",
                  borderRadius: "6px",
                }}
              >
                <div style={{ width: "8px", height: "8px", borderRadius: "4px", backgroundColor: "#10B981" }} />
                <span style={{ fontSize: "12px", color: "#E2E8F0" }}>Sẵn sàng: <strong>{freeCount}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body: Two Columns */}
        <div style={{ display: "flex", gap: "20px", flex: 1 }}>
          {/* Left Column: Overdue Tasks + Project Progress */}
          <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: "16px" }}>
            {/* Overdue Tasks Section */}
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
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#F87171" }}>
                  ⚠️ Task Quá Hạn & Có Vấn Đề ({snapshot.overdueTasks.length})
                </span>
                {snapshot.overdueTasks.length > 0 && (
                  <span style={{ fontSize: "11px", color: "#EF4444", fontWeight: 600 }}>
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
                    padding: "20px",
                    color: "#10B981",
                    fontSize: "14px",
                    fontWeight: 600,
                    backgroundColor: "rgba(16, 185, 129, 0.08)",
                    borderRadius: "8px",
                  }}
                >
                  🎉 Không có task nào quá hạn hôm nay!
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {snapshot.overdueTasks.slice(0, 4).map((t, idx) => (
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
                            maxWidth: "280px",
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
                  {snapshot.overdueTasks.length > 4 && (
                    <span style={{ fontSize: "11px", color: "#94A3B8", textAlign: "center", marginTop: "2px" }}>
                      + còn {snapshot.overdueTasks.length - 4} task quá hạn khác...
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Projects Progress Section */}
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
                {snapshot.projectProgress.slice(0, 3).map((p, idx) => {
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
              </div>
            </div>
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
                {membersWithTasks.slice(0, 5).map((m, idx) => {
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
                        borderLeft: m.status === "overloaded" || isOverdueMember ? "3px solid #EF4444" : undefined,
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
                                maxWidth: "200px",
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
            marginTop: "20px",
            paddingTop: "14px",
            borderTop: "1px solid #1E293B",
            fontSize: "11px",
            color: "#64748B",
          }}
        >
          <span>DevOps Effort Tracker • Automated Daily Dispatch</span>
          <span>Tạo lúc: {new Date().toLocaleTimeString("vi-VN")}</span>
        </div>
      </div>
    ),
    {
      width: 1000,
      height: 640,
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
