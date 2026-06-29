import config from "./config";
import { authService } from "./auth-service";

export interface TelegramConnectionStatus {
  linked: boolean;
  account?: {
    telegram_user_id: string;
    telegram_username?: string | null;
    telegram_first_name?: string | null;
    linked_at: string;
  } | null;
  token?: string;
  link_value?: string;
}

async function request(path: string, init?: RequestInit): Promise<TelegramConnectionStatus> {
  const token = authService.getToken();
  if (!token) throw new Error("Please sign in again");

  const response = await fetch(`${config.API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  const payload = await response.json();
  if (!response.ok || !payload.success) {
    throw new Error(payload.error || "Telegram connection request failed");
  }
  return payload.data;
}

export const telegramService = {
  getStatus: () => request("/api/telegram/status"),
  createLink: () => request("/api/telegram/link", { method: "POST" }),
};
