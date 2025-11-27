"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { sendInvitationAction } from "@/lib/actions/invitationActions";

export interface UserSearchItem {
  _id: string;
  name: string;
  email: string;
  isMember: boolean;
  hasPendingInvite: boolean;
}

interface Props {
  initialUsers: UserSearchItem[];
  activeTeamId: string | null;
  activeTeamName: string | null;
  canInvite: boolean;
  initialQuery: string;
}

const UsersSearchPageClient = ({
  initialUsers,
  activeTeamId,
  activeTeamName,
  canInvite,
  initialQuery,
}: Props) => {
  const [users, setUsers] = useState<UserSearchItem[]>(initialUsers);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setUsers(initialUsers);
    setQuery(initialQuery);
  }, [initialUsers, initialQuery]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (query.trim()) {
      params.set("q", query.trim());
    } else {
      params.delete("q");
    }
    router.push(`/users?${params.toString()}`);
  };

  const handleInvite = async (userId: string) => {
    if (!activeTeamId || !canInvite) return;
    setSubmittingId(userId);
    try {
      const res = await sendInvitationAction({ teamId: activeTeamId, toUserId: userId });
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u._id === userId ? { ...u, hasPendingInvite: true } : u
          )
        );
      } else {
        alert(res.error);
      }
    } catch (error) {
      console.error("Failed to send invitation", error);
      alert("Не вдалося надіслати запрошення");
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="padding-x max-w-[900px] mx-auto mt-10 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold text-blue-700">Користувачі</h1>
        {activeTeamId && (
          <div className="text-sm text-gray-700">
            Активна команда:{" "}
            <span className="font-semibold">{activeTeamName || activeTeamId}</span>
            {!canInvite && (
              <span className="ml-2 text-xs text-gray-500">
                (лише адміністратор може запрошувати)
              </span>
            )}
          </div>
        )}
      </div>

      {!activeTeamId && (
        <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 rounded p-4 text-sm">
          Щоб запрошувати користувачів, оберіть активну команду у хедері.
        </div>
      )}

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Введіть ім'я або email"
          className="flex-1 rounded border px-3 py-2 bg-white text-gray-800"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          Пошук
        </button>
      </form>

      {users.length === 0 ? (
        <p className="text-gray-600 text-sm">
          {!query
            ? "Введіть запит для пошуку користувачів."
            : query !== initialQuery
            ? "Натисніть Пошук або Enter, щоб знайти користувачів."
            : "За цим запитом користувачів не знайдено."}
        </p>
      ) : (
        <ul className="divide-y divide-gray-200 rounded border border-gray-200 bg-white/50">
          {users.map((user) => {
            const isSubmitting = submittingId === user._id;
            const canInviteThis = activeTeamId && canInvite && !user.isMember && !user.hasPendingInvite;
            return (
              <li key={user._id} className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900">{user.name}</span>
                  <span className="text-sm text-gray-600">{user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  {user.isMember ? (
                    <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs">
                      Вже у команді
                    </span>
                  ) : user.hasPendingInvite ? (
                    <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs">
                      Запит надіслано
                    </span>
                  ) : canInviteThis ? (
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleInvite(user._id)}
                      className="px-3 py-1.5 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-60"
                    >
                      {isSubmitting ? "Надсилання..." : "Запросити"}
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400">
                      Немає прав для запрошення
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default UsersSearchPageClient;

