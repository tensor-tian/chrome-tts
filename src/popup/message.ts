import type { P2C } from "../types";

export async function sendToActiveTab<T extends P2C.Message>(
  msg: T["req"]
): Promise<T["resp"] | undefined> {
  const [tab] = await chrome.tabs.query({
    active: true,
    // lastFocusedWindow: true,
  });
  if (!tab) {
    return undefined;
  }
  const response = await chrome.tabs.sendMessage(tab.id!, msg).catch((e) => {
    console.log("message from popup to content failed:", e);
  });
  console.log("request:", JSON.stringify(msg), "response:", response);
  return response as T["resp"];
}

export async function sendToBackground(msg: unknown): Promise<unknown> {
  const resp = await chrome.runtime.sendMessage(msg);
  console.log("response from background: ", resp);
  return resp;
}
