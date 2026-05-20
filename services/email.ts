import { Resend } from "resend";
import { InventoryItem } from "@/types";
import { formatRemainingDays } from "@/utils/stock";

const resend = new Resend(process.env.RESEND_API_KEY);

interface ReminderEmailParams {
  to: string[];
  item: InventoryItem;
  remainingDays: number;
  companyName?: string;
}

export async function sendStockReminderEmail({
  to,
  item,
  remainingDays,
  companyName = "Office",
}: ReminderEmailParams) {
  const statusColor =
    remainingDays <= item.reminder_before_days
      ? "#EF4444"
      : remainingDays <= item.reminder_before_days * 2
        ? "#F59E0B"
        : "#10B981";

  const statusLabel =
    remainingDays <= item.reminder_before_days
      ? "CRITICAL"
      : remainingDays <= item.reminder_before_days * 2
        ? "WARNING"
        : "OK";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%);padding:32px 40px;">
              <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:600;">📦 Stock Alert</h1>
              <p style="color:#94a3b8;margin:8px 0 0;font-size:14px;">${companyName} Inventory Reminder</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px;">
              <div style="background-color:${statusColor}15;border-left:4px solid ${statusColor};border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:24px;">
                <span style="color:${statusColor};font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">${statusLabel}</span>
                <h2 style="color:#1e293b;margin:8px 0 0;font-size:20px;">${item.name} is running low</h2>
              </div>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="padding:12px 16px;background:#f8fafc;border-radius:8px 8px 0 0;border-bottom:1px solid #e2e8f0;">
                    <span style="color:#64748b;font-size:13px;">Remaining Quantity</span><br/>
                    <strong style="color:#1e293b;font-size:18px;">${item.quantity} ${item.unit}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;background:#f8fafc;border-bottom:1px solid #e2e8f0;">
                    <span style="color:#64748b;font-size:13px;">Estimated Days Left</span><br/>
                    <strong style="color:${statusColor};font-size:18px;">${formatRemainingDays(remainingDays)}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;background:#f8fafc;border-radius:0 0 8px 8px;">
                    <span style="color:#64748b;font-size:13px;">Category</span><br/>
                    <strong style="color:#1e293b;font-size:14px;">${item.category}</strong>
                  </td>
                </tr>
              </table>
              <p style="color:#64748b;font-size:14px;line-height:1.6;margin:0;">
                Please restock <strong>${item.name}</strong> before it runs out.
                This is an automated reminder from your Office Stock Reminder system.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="color:#94a3b8;font-size:12px;margin:0;">
                Sent by Office Stock Reminder &middot; ${new Date().toLocaleDateString()}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const { data, error } = await resend.emails.send({
    from: "Stock Reminder <onboarding@resend.dev>",
    to,
    subject: `⚠️ ${item.name} Stock Running Low — ${formatRemainingDays(remainingDays)} remaining`,
    html,
  });

  if (error) throw error;
  return data;
}
