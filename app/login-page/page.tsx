"use client";

import { Mail, Lock } from "lucide-react";
import Image from "next/image";
import bg from "../../public/bg3.png";
import logo from "../../public/logo.png";
import google from "../../public/google2.svg";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [error, setError] = useState("");
  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (event: any) => {
    const { name, value } = event.target;
    return setUser((prevInfo) => ({ ...prevInfo, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      if (!user.email || !user.password) {
        setError("Заповніть всі поля");
        setLoading(false);
        return;
      }
      
      const emailRegex = /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;
      if (!emailRegex.test(user.email)) {
        setError("Невірний формат email");
        setLoading(false);
        return;
      }

      const res = await signIn("credentials", {
        email: user.email,
        password: user.password,
        redirect: false,
      });

      if (res?.error || !res?.ok) {
        // Check for specific error types
        if (res?.error?.includes("GOOGLE_ONLY_USER")) {
          setError("Ви зареєструвалися через Google. Увійдіть через Google або скористайтеся 'Забули пароль?' щоб встановити пароль.");
        } else {
          setError("Невірний email або пароль");
        }
        setLoading(false);
        return;
      }

      // Success - redirect
      router.refresh();
      router.push("/songs");
    } catch (error) {
      setError("Виникла помилка при вході");
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
          {/* <div className="lg:w-1/2 w-full bg-[#5D7DF3]">
            <Image
              src={bg}
              alt="bg"
              className="w-full h-full"
              width={300}
              height={300}
            />
          </div> */}
          <div className="md:w-1/2 sm:w-2/3 w-full flex flex-col justify-center items-center py-6 bg-[#eff1f6]">
            <div className="rounded px-4 py-2 shadow bg-blue-600">
              <Image src={logo} alt="bg" width={100} height={100} />
            </div>
            <div className="text-slate-900 font-medium text-xl py-5">
              Привіт! З поверненням!
            </div>

            <form
              className="w-full px-5 py-6 space-y-6"
              onSubmit={handleSubmit}
            >
              <div className="flex flex-col w-full lg:px-5">
                <label className="text-sm">Email</label>
                <div className="bg-white flex justify-start items-start py-3 px-4 rounded text-slate-600 text-lg mt-1">
                  <Mail className="w-7 h-7 text-blue-600" />
                  <input
                    type={"email"}
                    placeholder="example@123.com"
                    name="email"
                    className="outline-none w-full px-4"
                    value={user.email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="flex flex-col w-full lg:px-5">
                <label className="text-sm">Password</label>
                <div className="bg-white flex justify-start items-start py-3 px-4 rounded text-slate-600 text-lg mt-1">
                  <Lock className="w-7 h-7 text-blue-600" />
                  <input
                    type={"password"}
                    placeholder="**********"
                    name="password"
                    className="outline-none w-full px-4"
                    value={user.password}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="mt-2 text-right">
                  <a
                    href="/forgot-password"
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Забули пароль?
                  </a>
                </div>

                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <div className="grid place-items-center w-full mx-auto pt-7 mb-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-800 disabled:opacity-50 text-white text-lg w-full px-8 py-3 rounded-md uppercase font-semibold"
                  >
                    {loading ? "Вхід..." : "Увійти"}
                  </button>
                </div>
                <div className="text-lg text-slate-900 font-medium text-center">
                  <span>Ще не маєш акаунту?</span>
                  <a
                    href="/signup-page"
                    className="text-blue-600 hover:text-blue-800 pl-3 hover:underline"
                  >
                    Створи акаунт
                  </a>
                </div>
              </div>
            </form>
            
            {/* Google login - outside form to prevent form submission */}
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

export default Login;
