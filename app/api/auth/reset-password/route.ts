import { connectToDB } from "@/utils/database";
import User from "@/models/user";
import bcryptjs from "bcryptjs";
import { NextResponse, NextRequest } from "next/server";
import crypto from "crypto";

const MIN_PASSWORD_LENGTH = 8;

export async function POST(request: NextRequest) {
  try {
    await connectToDB();
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: "Token and new password are required" },
        { status: 400 }
      );
    }

    // Validate password length
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `Пароль повинен бути мінімум ${MIN_PASSWORD_LENGTH} символів` },
        { status: 400 }
      );
    }

    // Hash the provided token to compare with stored hash
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find user with valid token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Токен недійсний або закінчився термін дії" },
        { status: 400 }
      );
    }

    // Hash new password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(newPassword, salt);

    // Update user password and clear reset fields
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    
    // If user was Google-only, now they have both methods
    if (user.authProvider === "google") {
      user.authProvider = "both";
    }
    
    await user.save();

    return NextResponse.json({
      message: "Пароль успішно змінено",
      success: true,
    });
  } catch (error: unknown) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}
