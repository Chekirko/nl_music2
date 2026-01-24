import { connectToDB } from "@/utils/database";
import User from "@/models/user";
import { sendPasswordResetEmail } from "@/lib/email";
import { NextResponse, NextRequest } from "next/server";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    await connectToDB();
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        message: "Якщо email існує в системі, ви отримаєте лист з інструкціями",
        success: true,
      });
    }

    // Check if user has only Google auth (no password)
    if (!user.password && user.authProvider === "google") {
      return NextResponse.json({
        message: "Якщо email існує в системі, ви отримаєте лист з інструкціями",
        success: true,
      });
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Set token and expiry (1 hour)
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    // Send reset email with unhashed token
    const emailResult = await sendPasswordResetEmail(email, resetToken);

    if (!emailResult.success) {
      console.error("Failed to send reset email:", emailResult.error);
      // Clear token on email failure
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
      
      return NextResponse.json(
        { error: "Не вдалося надіслати email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Якщо email існує в системі, ви отримаєте лист з інструкціями",
      success: true,
    });
  } catch (error: unknown) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}
