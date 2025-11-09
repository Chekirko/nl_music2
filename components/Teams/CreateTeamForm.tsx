"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTeam } from "@/lib/actions/teamActions";

export default function CreateTeamForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await createTeam({
        name: name.trim(),
        description: description.trim(),
      });
      if (res.success) {
        router.push("/profile");
      } else {
        setError(res.error || "Помилка створення команди");
      }
    } catch (err) {
      setError("Помилка створення команди");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="max-w-xl w-full space-y-6 bg-white/5 p-6 rounded-lg border border-gray-200">
      <h2 className="text-xl font-bold text-blue-700">Створити команду</h2>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Назва</label>
        <input
          className="w-full rounded border px-3 py-2 bg-white text-gray-800"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium">Опис (необов’язково)</label>
        <textarea
          className="w-full rounded border px-3 py-2 bg-white text-gray-800"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>
      {/* Налаштування команди (приватність/копіювання) прибрані на вимогу */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {submitting ? "Створення..." : "Створити"}
        </button>
        <button type="button" onClick={() => router.back()} className="px-4 py-2 rounded border">
          Скасувати
        </button>
      </div>
    </form>
  );
}
