import { connectToDB } from "@/utils/database";
import User from "@/models/user";
import bcryptjs from "bcryptjs";
import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/configs/auth";

const MIN_PASSWORD_LENGTH = 8;

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Необхідна авторизація" },
        { status: 401 }
      );
    }

    await connectToDB();
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required" },
        { status: 400 }
      );
    }

    // Validate new password length
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `Новий пароль повинен бути мінімум ${MIN_PASSWORD_LENGTH} символів` },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json(
        { error: "Користувача не знайдено" },
        { status: 404 }
      );
    }

    // Check if user has a password (might be Google-only)
    if (!user.password) {
      return NextResponse.json(
        { error: "Ваш акаунт використовує Google для входу. Пароль не встановлено." },
        { status: 400 }
      );
    }

    // Verify current password
    const isMatch = await bcryptjs.compare(currentPassword, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Поточний пароль невірний" },
        { status: 400 }
      );
    }

    // Hash new password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    return NextResponse.json({
      message: "Пароль успішно змінено",
      success: true,
    });
  } catch (error: unknown) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}
