export type UserRole = "admin" | "member";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  passwordHash: string;
};

export type LogEntry = {
  id: string;
  userId: string;
  date: string;
  title: string;
  description: string;
  tags: string[];
  hours: number | null;
  createdAt: string;
  updatedAt: string;
};

export type Store = {
  users: User[];
  logs: LogEntry[];
  feed: FeedItem[];
};

export type FeedItem = {
  id: string;
  type: "log_created" | "log_updated";
  userId: string;
  logId: string;
  message: string;
  createdAt: string;
};
