import { getSettings, getReminderEmails } from "@/actions/settings";
import { SettingsClient } from "@/components/settings/settings-client";

export const metadata = { title: "Settings | Office Stock Reminder" };

export default async function SettingsPage() {
  const [settings, emails] = await Promise.all([
    getSettings(),
    getReminderEmails(),
  ]);

  return <SettingsClient settings={settings} emails={emails} />;
}
