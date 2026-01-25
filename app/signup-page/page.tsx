"use client";

import { Mail, Lock, User } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import logo from "../../public/logo.png";
import google from "../../public/google2.svg";

import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

const MIN_PASSWORD_LENGTH = 8;

const Signup = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [error, setError] = useState("");
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    return setUser((prevInfo) => ({ ...prevInfo, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      if (!user.name || !user.email || !user.password) {
        setError("Заповніть всі поля");
        return;
      }
      
      const emailRegex = /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;
      if (!emailRegex.test(user.email)) {
        setError("Невірний формат email");
        return;
      }
      
      // Password validation - only for NEW registrations
      if (user.password.length < MIN_PASSWORD_LENGTH) {
        setError(`Пароль повинен бути мінімум ${MIN_PASSWORD_LENGTH} символів`);
        return;
      }
      
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          password: user.password,
        }),
      });

      const data = await res.json();

      if (res.status === 400 && data.error === "User already exists") {
        setError("Користувач з такою поштою вже існує");
        return;
      }

      if (!res.ok) {
        setError(data.error || "Виникла помилка при реєстрації");
        return;
      }

      if (res.status === 200 || res.status === 201) {
        setError("");
        router.push("/login-page");
      }
    } catch (err) {
      console.error(err);
      setError("Виникла помилка при реєстрації");
    } finally {
      setLoading(false);
      if (!error) {
        setUser({
          name: "",
          email: "",
          password: "",
        });
      }
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
        <div className="flex justify-center items-center bg-blue-600 lg:flex-row flex-col gap-6 lg:gap-0 w-full shadow-md rounded-2xl">
          <div className="md:w-1/2 sm:w-2/3 w-full flex flex-col justify-center items-center py-6 bg-[#eff1f6]">
            <div className="rounded px-4 py-2 shadow bg-blue-600">
              <Image src={logo} alt="logo" width={100} height={100} />
            </div>
            <div className="text-slate-900 font-medium text-xl py-4">
              Створити акаунт
            </div>
            <form
              className="w-full px-5 py-4 space-y-5"
              onSubmit={handleSubmit}
            >
              <div className="flex flex-col w-full lg:px-5">
                <label className="text-sm">Повне ім&apos;я</label>
                <div className="bg-white flex justify-start items-start py-3 px-4 rounded text-slate-600 text-lg mt-1">
                  <User className="w-7 h-7 text-blue-600" />
                  <input
                    type="text"
                    placeholder="Іван Петренко"
                    name="name"
                    className="outline-none w-full px-4"
                    value={user.name}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="flex flex-col w-full lg:px-5">
                <label className="text-sm">Email</label>
                <div className="bg-white flex justify-start items-start py-3 px-4 rounded text-slate-600 text-lg mt-1">
                  <Mail className="w-7 h-7 text-blue-600" />
                  <input
                    type="email"
                    placeholder="example@123.com"
                    name="email"
                    className="outline-none w-full px-4"
                    value={user.email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="flex flex-col w-full lg:px-5">
                <label className="text-sm">Пароль</label>
                <div className="bg-white flex justify-start items-start py-3 px-4 rounded text-slate-600 text-lg mt-1">
                  <Lock className="w-7 h-7 text-blue-600" />
                  <input
                    type="password"
                    placeholder="Мінімум 8 символів"
                    name="password"
                    className="outline-none w-full px-4"
                    value={user.password}
                    onChange={handleInputChange}
                  />
                </div>
                {user.password && user.password.length < MIN_PASSWORD_LENGTH && (
                  <p className="text-orange-500 text-xs mt-1">
                    Ще {MIN_PASSWORD_LENGTH - user.password.length} символів
                  </p>
                )}
              </div>
              
              {error && (
                <div className="lg:px-5">
                  <div className="p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col w-full lg:px-5">
                <div className="grid place-items-center w-full mx-auto pt-4 mb-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-800 disabled:opacity-50 text-white text-lg w-full px-8 py-3 rounded-md uppercase font-semibold"
                  >
                    {loading ? "Реєстрація..." : "Зареєструватись"}
                  </button>
                </div>
                <div className="text-lg text-slate-900 font-medium text-center">
                  <span>Вже зареєстрований?</span>
                  <a
                    href="/login-page"
                    className="text-blue-600 hover:text-blue-800 pl-3 hover:underline"
                  >
                    Увійти
                  </a>
                </div>
              </div>
            </form>
            
            {/* Google signup - outside form to prevent form submission */}
            <div className="w-full px-5 lg:px-10 pb-6">
              <div className="flex justify-center w-full items-center gap-3 py-3">
                <div className="border-b border-gray-300 py-2 w-full" />
                <div className="text-gray-500 text-sm whitespace-nowrap">або</div>
                <div className="border-b border-gray-300 py-2 w-full" />
              </div>
              <div className="flex justify-center items-center w-full">
                <button
                  type="button"
                  onClick={() => signIn("google", { callbackUrl: "/songs" })}
                  className="rounded px-6 py-2 shadow cursor-pointer bg-white hover:bg-gray-50 border border-gray-200 transition-colors"
                >
                  <Image src={google} alt="Google" width={100} height={100} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
