import { getUsageLogs } from "@/actions/analytics";
import { HistoryClient } from "@/components/history/history-client";

export const metadata = { title: "History | Office Stock Reminder" };

export default async function HistoryPage() {
  const logs = await getUsageLogs();
  return <HistoryClient logs={logs} />;
}
