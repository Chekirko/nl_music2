"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";

const MIN_PASSWORD_LENGTH = 8;

export default function PasswordChangeSection() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
        setError("Заповніть всі поля");
        return;
      }

      if (formData.newPassword.length < MIN_PASSWORD_LENGTH) {
        setError(`Новий пароль повинен бути мінімум ${MIN_PASSWORD_LENGTH} символів`);
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setError("Паролі не співпадають");
        return;
      }

      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Виникла помилка");
        return;
      }

      setSuccess(true);
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => {
        setIsExpanded(false);
        setSuccess(false);
      }, 2000);
    } catch (err) {
      console.error(err);
      setError("Виникла помилка при зміні паролю");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsExpanded(false);
    setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setError("");
    setSuccess(false);
  };

  return (
    <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Безпека</h2>
        {!isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Змінити пароль
          </button>
        )}
      </div>

      {isExpanded ? (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Поточний пароль
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type={showCurrentPassword ? "text" : "password"}
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Введіть поточний пароль"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Новий пароль
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type={showNewPassword ? "text" : "password"}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Мінімум 8 символів"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {formData.newPassword && formData.newPassword.length < MIN_PASSWORD_LENGTH && (
              <p className="text-orange-500 text-xs mt-1">
                Ще {MIN_PASSWORD_LENGTH - formData.newPassword.length} символів
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Підтвердіть пароль
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Повторіть новий пароль"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded">
              <p className="text-green-600 text-sm">Пароль успішно змінено!</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Збереження..." : "Змінити пароль"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Скасувати
            </button>
          </div>
        </form>
      ) : (
        <p className="text-gray-600 text-sm">
          Регулярно змінюйте пароль для захисту вашого акаунту.
        </p>
      )}
    </section>
  );
}
