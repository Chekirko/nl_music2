
"use client";
import { useState, useTransition, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { setActiveTeamAction } from "@/lib/actions/teamActions";
import Image from "next/image";
import PasswordChangeSection from "./PasswordChangeSection";

type TeamItem = { id: string; name: string };

interface UserData {
  name: string;
  email: string;
  nickname: string;
  image: string;
  instrument: string;
}

interface Props {
  activeTeamId: string | null;
  teams: TeamItem[];
  initialUser: UserData;
  hasPassword: boolean;
}

export default function ProfileClient({ activeTeamId, teams, initialUser, hasPassword }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [optimisticActiveId, setOptimisticActiveId] = useState<string | null>(null);

  // Profile editing states
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserData>(initialUser);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Враховуємо оптимістичний стан
  const displayActiveId = optimisticActiveId ?? activeTeamId;

  const makeActive = useCallback(async (teamId: string) => {
    setErrorMessage(null);
    if (submittingId === teamId) return;
    setSubmittingId(teamId);
    setOptimisticActiveId(teamId);

    startTransition(async () => {
      try {
        const res = await setActiveTeamAction(teamId);
        if (res.success) {
          // Сигнал іншим компонентам
          if (typeof window !== "undefined") {
            try {
              window.dispatchEvent(new CustomEvent("active-team-changed", { detail: { teamId } }));
            } catch (err) {
              console.warn("Failed to dispatch active-team-changed event:", err);
            }
            try {
              if (window.localStorage) {
                localStorage.removeItem("pinnedEvent");
                window.dispatchEvent(new CustomEvent("pinned-event-changed"));
              }
            } catch (err) {
              console.warn("Failed to clear pinnedEvent from localStorage:", err);
            }
          }
          try { router.refresh(); } catch (err) {
            console.warn("Failed to refresh router:", err);
          }
        } else {
          setErrorMessage(res.error || "Не вдалося змінити активну команду");
          setOptimisticActiveId(null);
        }
      } catch (err) {
        console.error("Failed to set active team:", err);
        setErrorMessage(err instanceof Error ? err.message : "Виникла помилка при зміні команди");
        setOptimisticActiveId(null);
      } finally {
        setSubmittingId(null);
      }
    });
  }, [submittingId, router]);

  // Слухаємо перемикання активної команди з бейджа в Navbar
  useEffect(() => {
    const onChanged = (e: any) => {
      const id = e?.detail?.teamId || null;
      if (id) setOptimisticActiveId(id);
      try { router.refresh(); } catch {}
    };
    if (typeof window !== "undefined") {
      window.addEventListener("active-team-changed", onChanged as EventListener);
      return () => window.removeEventListener("active-team-changed", onChanged as EventListener);
    }
  }, [router]);

  // Fetch instrument when active team changes
  useEffect(() => {
    const fetchInstrument = async () => {
      if (!displayActiveId) return;
      
      try {
        const { getUserInstrumentAction } = await import("@/lib/actions/userActions");
        const res = await getUserInstrumentAction(displayActiveId);
        if (res.success) {
          setFormData(prev => ({ ...prev, instrument: res.instrument || "" }));
        }
      } catch (err) {
        console.error("Failed to fetch instrument:", err);
      }
    };

    fetchInstrument();
  }, [displayActiveId]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setErrorMessage(null);

    try {
      let imageUrl = formData.image;

      // Upload image if changed (preview exists)
      if (fileInputRef.current?.files?.[0]) {
        const file = fileInputRef.current.files[0];
        const formDataUpload = new FormData();
        formDataUpload.append("file", file);

        const uploadRes = await fetch("/api/cloudinary", {
          method: "POST",
          body: formDataUpload,
        });

        if (!uploadRes.ok) throw new Error("Failed to upload image");
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.url;
      }

      // Update profile
      const { updateProfileAction } = await import("@/lib/actions/userActions");
      const res = await updateProfileAction({
        name: formData.name,
        nickname: formData.nickname,
        image: imageUrl,
        instrument: formData.instrument,
        activeTeamId: displayActiveId,
      });

      if (!res.success) throw new Error(res.error || "Failed to update profile");
      
      // Update local state with confirmed data
      setFormData(prev => ({ ...prev, image: imageUrl }));
      setPreviewImage(null);
      setIsEditing(false);
      router.refresh();

    } catch (err) {
      console.error("Failed to save profile:", err);
      setErrorMessage("Не вдалося зберегти профіль");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blue-700">Мій профіль</h1>
        <Link 
          href="/teams/create" 
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Створити нову команду"
        >
          + Створити команду
        </Link>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            aria-label="Закрити повідомлення про помилку"
          >
            <span className="text-xl">&times;</span>
          </button>
        </div>
      )}

      {/* Profile Info Section */}
      <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Основна інформація</h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Редагувати
            </button>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
              {(previewImage || formData?.image) ? (
                <Image
                  src={previewImage || formData.image || ''}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              )}
              {isEditing && (
                <label className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer opacity-0 hover:opacity-100 transition-opacity">
                  <span className="text-white text-sm font-medium">Змінити</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Fields */}
          <div className="flex-grow space-y-4 max-w-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ім'я</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{formData.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <p className="text-gray-900">{formData.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Нікнейм</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                  placeholder="Додайте нікнейм"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{formData.nickname || <span className="text-gray-400 italic">Не вказано</span>}</p>
              )}
            </div>

            {displayActiveId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Інструмент (в активній команді)</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.instrument}
                    onChange={(e) => setFormData({ ...formData, instrument: e.target.value })}
                    placeholder="Ваш інструмент"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{formData.instrument || <span className="text-gray-400 italic">Не вказано</span>}</p>
                )}
              </div>
            )}

            {isEditing && (
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSaving ? "Збереження..." : "Зберегти"}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData(initialUser);
                    setPreviewImage(null);
                  }}
                  disabled={isSaving}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Скасувати
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Password Change Section - only show if user has password */}
      {hasPassword && <PasswordChangeSection />}

      <section className="bg-white/5 p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Мої команди</h2>
        {teams.length === 0 ? (
          <div className="text-gray-600">
            Команд поки немає.{" "}
            <Link href="/teams/create" className="text-blue-600 hover:underline">
              Створіть першу команду
            </Link>
          </div>
        ) : (
          <ul className="space-y-3" role="list">
            {teams.map((t) => {
              const isActive = displayActiveId === t.id;
              const isSubmitting = submittingId === t.id;
              return (
                <li key={t.id} className="flex items-center justify-between p-3 rounded hover:bg-gray-50 transition-colors">
                  <Link href={`/teams/${t.id}/members`} className="flex items-center gap-3">
                    <span className="font-medium text-blue-700 hover:underline">
                      {t.name}
                    </span>
                    {isActive && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 border border-blue-300" role="status" aria-label="Активна команда">
                        Активна
                      </span>
                    )}
                  </Link>
                  {!isActive && (
                    <button
                      onClick={() => makeActive(t.id)}
                      disabled={isPending || isSubmitting}
                      className="px-3 py-1.5 rounded border border-blue-500 text-blue-700 hover:bg-blue-50 disabled:opacity-60 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                      aria-label={`Зробити команду ${t.name} активною`}
                      aria-busy={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Застосування...
                        </span>
                      ) : (
                        "Зробити активною"
                      )}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

