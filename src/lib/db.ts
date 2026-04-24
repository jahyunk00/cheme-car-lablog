import { mkdir, readFile, writeFile } from "fs/promises";
import { dirname, join } from "path";
import type { FeedItem, LogEntry, Store, User } from "./types";

const DATA_DIR = join(process.cwd(), "data");
const STORE_PATH = join(DATA_DIR, "store.json");

let memoryStore: Store | null = null;

function defaultStore(): Store {
  return { users: [], logs: [], feed: [] };
}

async function ensureDir() {
  await mkdir(DATA_DIR, { recursive: true });
}

export async function readStore(): Promise<Store> {
  if (memoryStore) return memoryStore;
  try {
    const raw = await readFile(STORE_PATH, "utf-8");
    memoryStore = JSON.parse(raw) as Store;
    return memoryStore;
  } catch {
    memoryStore = defaultStore();
    return memoryStore;
  }
}

export async function writeStore(store: Store) {
  memoryStore = store;
  await ensureDir();
  await writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const s = await readStore();
  return s.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export async function getUserById(id: string): Promise<User | undefined> {
  const s = await readStore();
  return s.users.find((u) => u.id === id);
}

export async function listLogsForUser(userId: string): Promise<LogEntry[]> {
  const s = await readStore();
  return s.logs.filter((l) => l.userId === userId);
}

export async function listAllLogs(): Promise<LogEntry[]> {
  const s = await readStore();
  return [...s.logs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function getLog(id: string): Promise<LogEntry | undefined> {
  const s = await readStore();
  return s.logs.find((l) => l.id === id);
}

export async function upsertUser(user: User) {
  const s = await readStore();
  const idx = s.users.findIndex((u) => u.id === user.id);
  if (idx >= 0) s.users[idx] = user;
  else s.users.push(user);
  await writeStore(s);
}

export async function saveLog(
  log: LogEntry,
  feedItem: Omit<FeedItem, "id" | "createdAt"> & { id?: string }
) {
  const s = await readStore();
  const idx = s.logs.findIndex((l) => l.id === log.id);
  if (idx >= 0) s.logs[idx] = log;
  else s.logs.push(log);

  const item: FeedItem = {
    id: feedItem.id ?? crypto.randomUUID(),
    type: feedItem.type,
    userId: feedItem.userId,
    logId: feedItem.logId,
    message: feedItem.message,
    createdAt: new Date().toISOString(),
  };
  s.feed.unshift(item);
  s.feed = s.feed.slice(0, 100);

  await writeStore(s);
}

export async function deleteLog(id: string) {
  const s = await readStore();
  s.logs = s.logs.filter((l) => l.id !== id);
  await writeStore(s);
}

export async function listFeed(limit = 30): Promise<FeedItem[]> {
  const s = await readStore();
  return s.feed.slice(0, limit);
}
