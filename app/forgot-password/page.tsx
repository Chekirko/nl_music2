"use client";

import { Mail } from "lucide-react";
import Image from "next/image";
import logo from "../../public/logo.png";
import { useState } from "react";
import Link from "next/link";

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!email) {
        setError("Введіть email");
        return;
      }

      const emailRegex = /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;
      if (!emailRegex.test(email)) {
        setError("Невірний формат email");
        return;
      }

      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Виникла помилка");
        return;
      }

      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError("Виникла помилка при відправці");
    } finally {
      setLoading(false);
    }
  };

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
              Відновлення паролю
            </div>

            {success ? (
              <div className="w-full px-5 py-6 space-y-6">
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                  <p className="font-medium">Лист надіслано!</p>
                  <p className="text-sm mt-1">
                    Якщо email існує в системі, ви отримаєте лист з інструкціями 
                    для відновлення паролю. Перевірте також папку спам.
                  </p>
                </div>
                <div className="text-center">
                  <Link
                    href="/login-page"
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Повернутися до входу
                  </Link>
                </div>
              </div>
            ) : (
              <form
                className="w-full px-5 py-6 space-y-6"
                onSubmit={handleSubmit}
              >
                <p className="text-gray-600 text-sm lg:px-5">
                  Введіть email, який ви використовували при реєстрації. 
                  Ми надішлемо вам посилання для відновлення паролю.
                </p>
                <div className="flex flex-col w-full lg:px-5">
                  <label className="text-sm">Email</label>
                  <div className="bg-white flex justify-start items-start py-3 px-4 rounded text-slate-600 text-lg mt-1">
                    <Mail className="w-7 h-7 text-blue-600" />
                    <input
                      type="email"
                      placeholder="example@123.com"
                      name="email"
                      className="outline-none w-full px-4"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
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
                      {loading ? "Відправка..." : "Надіслати посилання"}
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

export default ForgotPassword;
