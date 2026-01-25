import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

interface SendPasswordResetEmailResult {
  success: boolean;
  error?: string;
}

export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<SendPasswordResetEmailResult> {
  const resetLink = `${BASE_URL}/reset-password?token=${token}`;

  try {
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'NL Music <noreply@resend.dev>',
      to: email,
      subject: 'Відновлення паролю - NL Music',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Відновлення паролю</h2>
          <p>Ви отримали цей лист, тому що хтось запросив скидання паролю для вашого акаунту на NL Music.</p>
          <p>Натисніть кнопку нижче, щоб встановити новий пароль:</p>
          <div style="margin: 30px 0;">
            <a href="${resetLink}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; display: inline-block;">
              Встановити новий пароль
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            Посилання дійсне протягом 1 години. Якщо ви не запитували скидання паролю, 
            просто проігноруйте цей лист.
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
          <p style="color: #9ca3af; font-size: 12px;">
            © NL Music. Цей лист надіслано автоматично.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Failed to send password reset email:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Email sending error:', err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Failed to send email' 
    };
  }
}
