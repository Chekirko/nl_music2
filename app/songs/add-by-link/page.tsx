"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const AddByLinkPage = () => {
  const router = useRouter();
  const session = useSession();
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (session.status === "loading") return;
    if (!session.data || session.data.user?.role !== "admin") {
      router.push("/denied");
    }
  }, [session.status, session.data, router]);

  const validateUrl = (value: string) => {
    try {
      const u = new URL(value);
      return !!u.protocol && !!u.host;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validateUrl(url)) {
      setError("Посилання недійсне. Перевірте URL і спробуйте ще раз.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/songs/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Не вдалося опрацювати посилання.");
        return;
      }
      router.push(`/songs/${data._id}`);
    } catch (err) {
      setError("Сталася помилка мережі. Спробуйте ще раз пізніше.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="padding-x max-w-[1600px] mx-auto w-full flex-start flex-col">
      <h1 className="head_text text-left">
        <span className="blue_gradient">Додати пісню за посиланням</span>
      </h1>
      <p className="desc text-left max-w-md mb-8">
        Вставте посилання на сторінку з піснею. Ми спробуємо проаналізувати її і створити пісню автоматично.
      </p>

      <form className="mt-6 w-full max-w-2xl flex flex-col gap-5 glassmorphism" onSubmit={handleSubmit}>
        <label>
          <span className="font-satoshi font-semibold text-base text-gray-700">Посилання</span>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            className="form_input"
            required
            inputMode="url"
          />
        </label>

        {error && <div className="text-red-500 text-sm">{error}</div>}

        <div className="flex-end mx-3 mb-5 gap-4">
          <button
            type="submit"
            disabled={submitting}
            className={`rounded-full px-5 py-1.5 text-sm font-medium text-white ${
              submitting ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-800"
            }`}
          >
            {submitting ? "Опрацьовуємо..." : "Створити"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default AddByLinkPage;
