import { config } from "dotenv";
import axios from "axios";

config({ path: ".env.local" });

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

if (!projectId || !apiKey) {
  console.error("❌ Missing NEXT_PUBLIC_FIREBASE_PROJECT_ID or NEXT_PUBLIC_FIREBASE_API_KEY in .env.local");
  process.exit(1);
}

const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

const ALL_COLLECTIONS = ["tasks", "members", "projects", "notifications", "chatLogs", "users"];

async function getCollectionDocs(collectionId: string): Promise<string[]> {
  try {
    const res = await axios.get<{ documents?: Array<{ name: string }> }>(
      `${baseUrl}/${collectionId}?key=${apiKey}&pageSize=300`
    );
    if (!res.data.documents || res.data.documents.length === 0) {
      return [];
    }
    return res.data.documents.map((doc) => doc.name);
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return [];
    }
    throw error;
  }
}

async function deleteDocByPath(fullPath: string): Promise<void> {
  const url = `https://firestore.googleapis.com/v1/${fullPath}?key=${apiKey}`;
  await axios.delete(url);
}

async function clearCollection(collectionId: string): Promise<number> {
  const docPaths = await getCollectionDocs(collectionId);
  if (docPaths.length === 0) {
    console.log(`ℹ️  [${collectionId}] Đang trống (0 documents).`);
    return 0;
  }

  console.log(`🗑️  [${collectionId}] Đang xóa ${docPaths.length} documents...`);
  await Promise.all(docPaths.map((path) => deleteDocByPath(path)));
  console.log(`✅ [${collectionId}] Đã xóa thành công ${docPaths.length} documents.`);
  return docPaths.length;
}

async function main() {
  const args = process.argv.slice(2).filter((arg) => !arg.startsWith("-"));
  const flags = process.argv.slice(2).filter((arg) => arg.startsWith("-"));

  let targetCollections: string[] = [];

  if (flags.includes("--all")) {
    targetCollections = ALL_COLLECTIONS;
  } else if (args.length > 0) {
    targetCollections = args;
  } else {
    // Mặc định xóa tasks, members, notifications, chatLogs, projects (giữ lại users nếu không chọn --all)
    targetCollections = ["tasks", "members", "projects", "notifications", "chatLogs"];
  }

  console.log(`🚀 Bắt đầu dọn dẹp Firestore database (${projectId})...`);
  console.log(`🎯 Collections mục tiêu: ${targetCollections.join(", ")}\n`);

  let totalDeleted = 0;
  for (const col of targetCollections) {
    try {
      const count = await clearCollection(col);
      totalDeleted += count;
    } catch (err: unknown) {
      console.error(`❌ Lỗi khi xóa collection '${col}':`, err instanceof Error ? err.message : err);
    }
  }

  console.log(`\n🎉 Hoàn tất! Tổng cộng đã xóa ${totalDeleted} documents.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Lỗi thực thi script clear:", err);
    process.exit(1);
  });
