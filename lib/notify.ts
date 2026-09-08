export function notifyTaskAssigned(memberName: string, taskTitle: string, projectName: string): void {
  const message = `✅ Task đã được gán: **${taskTitle}** cho **${memberName}** (dự án ${projectName})`;

  fetch("/api/notify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  }).catch((err) => console.warn("Could not send chat-ops notification:", err));
}
