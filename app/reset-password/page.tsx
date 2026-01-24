"use client";

import { Lock, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import logo from "../../public/logo.png";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const MIN_PASSWORD_LENGTH = 8;

const ResetPassword = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    setToken(tokenFromUrl);
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!token) {
        setError("Токен відновлення відсутній");
        return;
      }

      if (!formData.password || !formData.confirmPassword) {
        setError("Заповніть всі поля");
        return;
      }

      if (formData.password.length < MIN_PASSWORD_LENGTH) {
        setError(`Пароль повинен бути мінімум ${MIN_PASSWORD_LENGTH} символів`);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError("Паролі не співпадають");
        return;
      }

      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          newPassword: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Виникла помилка");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login-page");
      }, 3000);
    } catch (err) {
      console.error(err);
      setError("Виникла помилка при зміні паролю");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div
        className="min-h-screen"
        style={{
          backgroundImage: `url("/background.png")`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
      >
        <div className="grid place-items-center mx-auto max-w-4xl w-full py-10 min-h-screen">
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <h2 className="text-xl font-bold text-red-600 mb-4">
              Невірне посилання
            </h2>
            <p className="text-gray-600 mb-6">
              Посилання для відновлення паролю недійсне або відсутнє.
            </p>
            <Link
              href="/forgot-password"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              Запросити нове посилання
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: `url("/background.png")`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    >
      <div className="grid place-items-center mx-auto max-w-4xl w-full py-10 min-h-screen">
        <div className="flex justify-center items-center lg:flex-row flex-col gap-6 lg:gap-0 w-full shadow-md rounded-2xl bg-blue-600">
          <div className="md:w-1/2 sm:w-2/3 w-full flex flex-col justify-center items-center py-6 bg-[#eff1f6]">
            <div className="rounded px-4 py-2 shadow bg-blue-600">
              <Image src={logo} alt="logo" width={100} height={100} />
            </div>
            <div className="text-slate-900 font-medium text-xl py-5">
              Встановлення нового паролю
            </div>

            {success ? (
              <div className="w-full px-5 py-6 space-y-6">
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                  <p className="font-medium">Пароль успішно змінено!</p>
                  <p className="text-sm mt-1">
                    Зараз вас буде перенаправлено на сторінку входу...
                  </p>
                </div>
              </div>
            ) : (
              <form
                className="w-full px-5 py-6 space-y-6"
                onSubmit={handleSubmit}
              >
                <div className="flex flex-col w-full lg:px-5">
                  <label className="text-sm">Новий пароль</label>
                  <div className="bg-white flex justify-start items-center py-3 px-4 rounded text-slate-600 text-lg mt-1">
                    <Lock className="w-7 h-7 text-blue-600" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Мінімум 8 символів"
                      name="password"
                      className="outline-none w-full px-4"
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {formData.password && formData.password.length < MIN_PASSWORD_LENGTH && (
                    <p className="text-orange-500 text-xs mt-1 lg:px-0">
                      Ще {MIN_PASSWORD_LENGTH - formData.password.length} символів
                    </p>
                  )}
                </div>

                <div className="flex flex-col w-full lg:px-5">
                  <label className="text-sm">Підтвердіть пароль</label>
                  <div className="bg-white flex justify-start items-center py-3 px-4 rounded text-slate-600 text-lg mt-1">
                    <Lock className="w-7 h-7 text-blue-600" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Повторіть пароль"
                      name="confirmPassword"
                      className="outline-none w-full px-4"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="lg:px-5">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <div className="flex flex-col w-full lg:px-5">
                  <div className="grid place-items-center w-full mx-auto pt-4 mb-6">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-800 disabled:opacity-50 text-white text-lg w-full px-8 py-3 rounded-md uppercase font-semibold"
                    >
                      {loading ? "Збереження..." : "Змінити пароль"}
                    </button>
                  </div>
                  <div className="text-lg text-slate-900 font-medium text-center">
                    <Link
                      href="/login-page"
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      Повернутися до входу
                    </Link>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
