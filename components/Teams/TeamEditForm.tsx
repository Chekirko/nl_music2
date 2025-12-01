"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { updateTeam, updateTeamCoverImageAction } from "@/lib/actions/teamActions";
import Image from "next/image";

interface TeamEditFormProps {
  team: {
    id: string;
    name: string;
    description?: string;
    city?: string;
    church?: string;
    coverImage?: string;
  };
}

export default function TeamEditForm({ team }: TeamEditFormProps) {
  const router = useRouter();
  const [name, setName] = useState(team.name);
  const [description, setDescription] = useState(team.description || "");
  const [city, setCity] = useState(team.city || "");
  const [church, setChurch] = useState(team.church || "");
  const [coverImage, setCoverImage] = useState(team.coverImage || "");
  const [previewImage, setPreviewImage] = useState<string | null>(team.coverImage || null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Будь ласка, виберіть файл зображення");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Розмір файлу не повинен перевищувати 5MB");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/cloudinary", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Помилка завантаження зображення");
      }

      const data = await response.json();
      
      // Update cover image via Server Action (will delete old image)
      const updateRes = await updateTeamCoverImageAction({
        teamId: team.id,
        newCoverImage: data.url,
      });

      if (updateRes.success) {
        setCoverImage(data.url);
        setPreviewImage(data.url);
        setSuccess(true);
        router.refresh();
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(updateRes.error || "Помилка оновлення фото");
      }
    } catch (err) {
      setError("Не вдалося завантажити зображення");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!coverImage) return;

    setUploading(true);
    try {
      const updateRes = await updateTeamCoverImageAction({
        teamId: team.id,
        newCoverImage: "",
      });

      if (updateRes.success) {
        setCoverImage("");
        setPreviewImage(null);
        setSuccess(true);
        router.refresh();
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(updateRes.error || "Помилка видалення фото");
      }
    } catch (err) {
      setError("Не вдалося видалити зображення");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await updateTeam(team.id, {
        name: name.trim(),
        description: description.trim(),
        city: city.trim(),
        church: church.trim(),
      });

      if (res.success) {
        setSuccess(true);
        router.refresh();
        setTimeout(() => {
          router.push(`/teams/${team.id}`);
        }, 1500);
      } else {
        setError(res.error || "Помилка оновлення команди");
      }
    } catch (err) {
      setError("Помилка оновлення команди");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="max-w-2xl w-full space-y-6 bg-white/5 p-6 rounded-lg border border-gray-200">
      <h2 className="text-xl font-bold text-blue-700">Редагувати команду</h2>
      
      {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded">{error}</div>}
      {success && <div className="text-green-600 text-sm bg-green-50 p-3 rounded">Зміни збережено!</div>}
      
      <div className="space-y-2">
        <label className="block text-sm font-medium">Назва команди *</label>
        <input
          className="w-full rounded border px-3 py-2 bg-white text-gray-800"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Опис</label>
        <textarea
          className="w-full rounded border px-3 py-2 bg-white text-gray-800"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Розкажіть про вашу команду..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Місто</label>
          <input
            className="w-full rounded border px-3 py-2 bg-white text-gray-800"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Наприклад: Київ"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Церква</label>
          <input
            className="w-full rounded border px-3 py-2 bg-white text-gray-800"
            value={church}
            onChange={(e) => setChurch(e.target.value)}
            placeholder="Назва церкви"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Фото команди (горизонтальне)</label>
        <div className="space-y-3">
          {previewImage && (
            <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-gray-200">
              <Image
                src={previewImage}
                alt="Preview"
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-60 text-sm"
            >
              {uploading ? "Завантаження..." : previewImage ? "Змінити фото" : "Вибрати фото"}
            </button>
            {previewImage && (
              <button
                type="button"
                onClick={handleRemoveImage}
                disabled={uploading}
                className="px-4 py-2 rounded border border-red-300 text-red-600 hover:bg-red-50 text-sm disabled:opacity-60"
              >
                Видалити
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <p className="text-xs text-gray-500">Рекомендований розмір: 1200x400px. Максимум 5MB.</p>
          <p className="text-xs text-gray-400">Примітка: Зміна фото відбувається одразу після вибору файлу</p>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t">
        <button
          type="submit"
          disabled={submitting || uploading}
          className="px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 font-medium"
        >
          {submitting ? "Збереження..." : "Зберегти зміни"}
        </button>
        <button 
          type="button" 
          onClick={() => router.push(`/teams/${team.id}`)} 
          className="px-6 py-2 rounded border border-gray-300 hover:bg-gray-50"
        >
          Скасувати
        </button>
      </div>
    </form>
  );
}
