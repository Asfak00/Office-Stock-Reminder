"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserSettings, ReminderEmail } from "@/types";
import { settingsSchema, type SettingsFormData } from "@/lib/validations";
import {
  updateSettings,
  addReminderEmail,
  removeReminderEmail,
  toggleReminderEmail,
} from "@/actions/settings";
import { WEEKDAY_LABELS, type WeekDay, getUpcomingHolidays } from "@/utils/holidays";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Mail, CalendarOff, CalendarDays } from "lucide-react";

const TIMEZONES = [
  "Asia/Dhaka",
  "Asia/Kolkata",
  "Asia/Dubai",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Europe/London",
  "Europe/Berlin",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Australia/Sydney",
  "Pacific/Auckland",
];

const ALL_DAYS: WeekDay[] = [0, 1, 2, 3, 4, 5, 6];

export function SettingsClient({
  settings,
  emails,
}: {
  settings: UserSettings;
  emails: ReminderEmail[];
}) {
  const [saving, setSaving] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [addingEmail, setAddingEmail] = useState(false);
  const [deleteEmailId, setDeleteEmailId] = useState<string | null>(null);
  const [selectedOffDays, setSelectedOffDays] = useState<number[]>(
    settings.off_days ?? [5, 6]
  );

  const upcomingHolidays = getUpcomingHolidays(12);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      company_name: settings.company_name,
      default_reminder_days: settings.default_reminder_days,
      timezone: settings.timezone,
      off_days: settings.off_days ?? [5, 6],
      slack_webhook_url: settings.slack_webhook_url || "",
    },
  });

  const timezone = watch("timezone");

  function toggleOffDay(day: number) {
    setSelectedOffDays((prev) => {
      const next = prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day];
      setValue("off_days", next, { shouldValidate: true });
      return next;
    });
  }

  async function onSubmit(data: SettingsFormData) {
    setSaving(true);
    try {
      await updateSettings({ ...data, off_days: selectedOffDays });
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save settings");
    }
    setSaving(false);
  }

  async function handleAddEmail() {
    if (!newEmail.trim()) return;
    setAddingEmail(true);
    try {
      await addReminderEmail(newEmail.trim(), newName.trim() || newEmail.trim());
      setNewEmail("");
      setNewName("");
      toast.success("Email added");
    } catch {
      toast.error("Failed to add email");
    }
    setAddingEmail(false);
  }

  async function handleDeleteEmail() {
    if (!deleteEmailId) return;
    try {
      await removeReminderEmail(deleteEmailId);
      toast.success("Email removed");
    } catch {
      toast.error("Failed to remove email");
    }
    setDeleteEmailId(null);
  }

  async function handleToggleEmail(id: string, active: boolean) {
    try {
      await toggleReminderEmail(id, active);
      toast.success(active ? "Email activated" : "Email deactivated");
    } catch {
      toast.error("Failed to update email");
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your preferences and notification settings</p>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">General</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Company / Office Name</Label>
              <Input id="company_name" {...register("company_name")} />
              {errors.company_name && (
                <p className="text-sm text-destructive">{errors.company_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="default_reminder_days">Default Reminder Days</Label>
              <Input
                id="default_reminder_days"
                type="number"
                min={1}
                max={30}
                {...register("default_reminder_days")}
              />
              <p className="text-xs text-muted-foreground">
                Send reminders when stock is estimated to last fewer than this many calendar days
              </p>
              {errors.default_reminder_days && (
                <p className="text-sm text-destructive">{errors.default_reminder_days.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select
                value={timezone}
                onValueChange={(v) => setValue("timezone", v, { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.timezone && (
                <p className="text-sm text-destructive">{errors.timezone.message}</p>
              )}
            </div>

            <Separator />

            {/* Weekly Off Days */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CalendarOff className="h-4 w-4 text-muted-foreground" />
                <Label>Weekly Off Days</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                No stock consumption on off days. Remaining-days estimates will skip these days.
              </p>
              <div className="flex flex-wrap gap-2">
                {ALL_DAYS.map((day) => {
                  const active = selectedOffDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleOffDay(day)}
                      className={`
                        px-3 py-1.5 rounded-full text-sm font-medium transition-colors border
                        ${active
                          ? "bg-destructive text-destructive-foreground border-destructive"
                          : "bg-background text-muted-foreground border-border hover:bg-accent"
                        }
                      `}
                    >
                      {WEEKDAY_LABELS[day as WeekDay]}
                    </button>
                  );
                })}
              </div>
              {selectedOffDays.length === 7 && (
                <p className="text-sm text-destructive">
                  All days are off — stock will never be consumed!
                </p>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="slack_webhook_url">Slack Webhook URL (optional)</Label>
              <Input
                id="slack_webhook_url"
                placeholder="https://hooks.slack.com/services/..."
                {...register("slack_webhook_url")}
              />
              <p className="text-xs text-muted-foreground">
                Receive stock alerts in a Slack channel
              </p>
              {errors.slack_webhook_url && (
                <p className="text-sm text-destructive">{errors.slack_webhook_url.message}</p>
              )}
            </div>

            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Settings
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* BD Government Holidays */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Upcoming Government Holidays (BD)</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-4">
            These holidays are automatically skipped in stock consumption calculations.
            Islamic holiday dates are approximate and shift yearly.
          </p>
          {upcomingHolidays.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No upcoming holidays in the current dataset.
            </p>
          ) : (
            <div className="space-y-1.5">
              {upcomingHolidays.map((h) => {
                const d = new Date(h.date + "T00:00:00");
                const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
                const formatted = d.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });
                return (
                  <div
                    key={h.date + h.name}
                    className="flex items-center justify-between rounded-lg border p-2.5 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="font-medium">{h.name}</p>
                      {h.nameBn && (
                        <p className="text-xs text-muted-foreground">{h.nameBn}</p>
                      )}
                    </div>
                    <Badge variant="outline" className="whitespace-nowrap ml-2 text-xs">
                      {dayName}, {formatted}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reminder Recipients */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Reminder Recipients</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              placeholder="Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="sm:w-[160px]"
            />
            <Input
              placeholder="email@example.com"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddEmail(); } }}
            />
            <Button
              onClick={handleAddEmail}
              disabled={addingEmail || !newEmail.trim()}
              size="sm"
              className="sm:w-auto"
            >
              {addingEmail ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Add
            </Button>
          </div>

          {emails.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Mail className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                No recipients added. Add email addresses to receive stock reminders.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {emails.map((email) => (
                <div
                  key={email.id}
                  className="flex items-center gap-3 rounded-lg border p-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{email.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{email.email}</p>
                  </div>
                  <Badge
                    variant={email.is_active ? "default" : "outline"}
                    className="cursor-pointer select-none"
                    onClick={() => handleToggleEmail(email.id, !email.is_active)}
                  >
                    {email.is_active ? "Active" : "Paused"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => setDeleteEmailId(email.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!deleteEmailId}
        onOpenChange={(open) => { if (!open) setDeleteEmailId(null); }}
        title="Remove Recipient"
        description="This person will no longer receive stock reminder emails."
        confirmLabel="Remove"
        variant="destructive"
        onConfirm={handleDeleteEmail}
      />
    </div>
  );
}
