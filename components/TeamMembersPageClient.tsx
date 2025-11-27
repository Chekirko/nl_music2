"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  updateTeamMemberRoleAction,
  removeTeamMemberAction,
  deleteTeam as deleteTeamAction,
} from "@/lib/actions/teamActions";
import { searchUsersForTeamAction } from "@/lib/actions/userActions";
import { sendInvitationAction } from "@/lib/actions/invitationActions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export interface TeamMemberWithUser {
  userId: string;
  name: string;
  email: string;
  role: "admin" | "editor" | "member";
  isOwner: boolean;
  isCurrentUser: boolean;
}

interface InviteCandidate {
  _id: string;
  name: string;
  email: string;
  isMember: boolean;
  hasPendingInvite: boolean;
}

interface Props {
  teamId: string;
  members: TeamMemberWithUser[];
  canManage: boolean;
  isOwner: boolean;
}

const TeamMembersPageClient = ({
  teamId,
  members,
  canManage,
  isOwner,
  // teamName передамо з серверної сторінки через пропси,
  // але робимо його опційним, щоб не ламати виклики
  teamName,
}: Props & { teamName?: string }) => {
  const router = useRouter();
  const [state, setState] = useState<TeamMemberWithUser[]>(members);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<InviteCandidate[]>([]);
  const [searching, setSearching] = useState(false);
  const [inviteBusyId, setInviteBusyId] = useState<string | null>(null);
  const [deletingTeam, setDeletingTeam] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleRoleChange = async (userId: string, role: "admin" | "editor" | "member") => {
    setBusyId(userId);
    try {
      const res = await updateTeamMemberRoleAction({ teamId, userId, role });
      if (res.success) {
        setState((prev) =>
          prev.map((m) => (m.userId === userId ? { ...m, role } : m))
        );
        // Notify that notifications may have changed
        if (typeof window !== "undefined") {
          try {
            window.dispatchEvent(new CustomEvent("notifications-changed"));
          } catch {
            // ignore
          }
        }
      } else {
        alert(res.error);
      }
    } catch (error) {
      console.error("Failed to update member role", error);
      alert("Не вдалося змінити роль учасника");
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteTeam = async () => {
    setDeletingTeam(true);
    try {
      const res = await deleteTeamAction(teamId);
      if (!res.success) {
        alert(res.error || "Не вдалося видалити команду");
        setDeletingTeam(false);
        return;
      }
      if (typeof window !== "undefined") {
        try {
          window.dispatchEvent(new CustomEvent("active-team-changed"));
        } catch {
          // ignore
        }
      }
      router.push("/profile");
    } catch (error) {
      console.error("Failed to delete team", error);
      alert("Не вдалося видалити команду");
      setDeletingTeam(false);
    }
  };

  const handleRemove = async (userId: string) => {
    setBusyId(userId);
    try {
      const res = await removeTeamMemberAction({ teamId, userId });
      if (res.success) {
        setState((prev) => prev.filter((m) => m.userId !== userId));
        // Notify that notifications may have changed
        if (typeof window !== "undefined") {
          try {
            window.dispatchEvent(new CustomEvent("notifications-changed"));
          } catch {
            // ignore
          }
        }
      } else {
        alert(res.error);
      }
    } catch (error) {
      console.error("Failed to remove member", error);
      alert("Не вдалося видалити учасника");
    } finally {
      setBusyId(null);
    }
  };

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }
    setSearching(true);
    setHasSearched(true);
    try {
      const res = await searchUsersForTeamAction({ teamId, q });
      if (res.success) {
        setSearchResults(res.users as InviteCandidate[]);
      } else {
        alert(res.error);
      }
    } catch (error) {
      console.error("Failed to search users for team", error);
      alert("Не вдалося виконати пошук користувачів");
    } finally {
      setSearching(false);
    }
  };

  const handleInvite = async (userId: string) => {
    setInviteBusyId(userId);
    try {
      const res = await sendInvitationAction({ teamId, toUserId: userId });
      if (res.success) {
        setSearchResults((prev) =>
          prev.map((u) =>
            u._id === userId ? { ...u, hasPendingInvite: true } : u
          )
        );
        // Notify that notifications may have changed (invited user will get notification)
        if (typeof window !== "undefined") {
          try {
            window.dispatchEvent(new CustomEvent("notifications-changed"));
          } catch {
            // ignore
          }
        }
      } else {
        alert(res.error);
      }
    } catch (error) {
      console.error("Failed to send invitation", error);
      alert("Не вдалося надіслати запрошення");
    } finally {
      setInviteBusyId(null);
    }
  };

  return (
    <div className="padding-x max-w-[900px] mx-auto mt-10 space-y-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-blue-700">
          Учасники команди{teamName ? ` «${teamName}»` : ""}
        </h1>
        {isOwner && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                type="button"
                disabled={deletingTeam}
                className="px-4 py-2 rounded border border-red-600 text-red-700 text-sm hover:bg-red-50 disabled:opacity-60"
              >
                Видалити команду
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-white max-sm:w-72">
              <AlertDialogHeader>
                <AlertDialogTitle>Видалити команду?</AlertDialogTitle>
                <AlertDialogDescription className="text-sm">
                  Команда{teamName ? ` «${teamName}»` : ""} буде видалена. Усі її
                  учасники втратять доступ до неї, а всі події (списки) цієї
                  команди будуть видалені. Пісні залишаться доступними в
                  загальному списку.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Відміна</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteTeam}>
                  {deletingTeam ? "Видалення..." : "Видалити"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {canManage && (
        <section className="bg-white/70 rounded-lg border border-gray-200 p-4 space-y-4">
          <h2 className="text-lg font-semibold">Додати учасників</h2>
          <p className="text-xs text-gray-600">
            Пошук працює за ім&apos;ям/прізвищем або email. Запрошувати можуть лише адміністратори активної команди.
          </p>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setHasSearched(false);
              }}
              placeholder="Введіть ім'я або email"
              className="flex-1 rounded border px-3 py-2 bg-white text-gray-800 text-sm"
            />
            <button
              type="submit"
              disabled={searching}
              className="px-4 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-60"
            >
              {searching ? "Пошук..." : "Пошук"}
            </button>
          </form>

          {searchResults.length > 0 && (
            <ul className="divide-y divide-gray-200 rounded border border-gray-200 bg-white/70">
              {searchResults.map((user) => {
                const isBusy = inviteBusyId === user._id;
                const canInviteThis =
                  !user.isMember && !user.hasPendingInvite;
                return (
                  <li
                    key={user._id}
                    className="flex items-center justify-between gap-3 px-3 py-2"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900 text-sm">
                        {user.name || "Без ім'я"}
                      </span>
                      <span className="text-xs text-gray-600">
                        {user.email}
                      </span>
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
                          disabled={isBusy}
                          onClick={() => handleInvite(user._id)}
                          className="px-3 py-1.5 rounded bg-blue-600 text-white text-xs hover:bg-blue-700 disabled:opacity-60"
                        >
                          {isBusy ? "Надсилання..." : "Запросити"}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">
                          Запрошення недоступне
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          {!searching && searchQuery.trim() && !hasSearched && (
             <p className="text-xs text-gray-500">
               Натисніть Пошук або Enter, щоб знайти користувачів.
             </p>
          )}
          {!searching && hasSearched && searchResults.length === 0 && (
            <p className="text-xs text-gray-500">
              За цим запитом користувачів не знайдено.
            </p>
          )}
        </section>
      )}

      <section>
        {!state.length ? (
          <p className="text-gray-600 text-sm">У команди ще немає учасників.</p>
        ) : (
          <ul className="divide-y divide-gray-200 rounded border border-gray-200 bg-white/60">
            {state.map((member) => {
              const isBusy = busyId === member.userId;
              const canEditThis =
                canManage && !member.isOwner && !member.isCurrentUser;
              const canRemoveThis =
                canManage && !member.isOwner && !member.isCurrentUser;
              return (
                <li
                  key={member.userId}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">
                      {member.name || "Без ім'я"}
                    </span>
                    <span className="text-sm text-gray-600">
                      {member.email}
                    </span>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs">
                      <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                        Роль: {member.role}
                      </span>
                      {member.isOwner && (
                        <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                          Власник
                        </span>
                      )}
                      {member.isCurrentUser && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                          Ви
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 md:justify-end">
                    {canEditThis ? (
                      <select
                        disabled={isBusy}
                        value={member.role}
                        onChange={(e) =>
                          handleRoleChange(
                            member.userId,
                            e.target.value as "admin" | "editor" | "member"
                          )
                        }
                        className="px-2 py-1 rounded border border-gray-300 text-sm bg-white"
                      >
                        <option value="admin">Адмін</option>
                        <option value="editor">Редактор</option>
                        <option value="member">Учасник</option>
                      </select>
                    ) : (
                      <span className="px-2 py-1 text-xs text-gray-400">
                        Роль не можна змінити
                      </span>
                    )}
                    {canRemoveThis ? (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            type="button"
                            disabled={isBusy}
                            className="px-3 py-1.5 rounded border border-red-500 text-red-600 text-xs hover:bg-red-50 disabled:opacity-60"
                          >
                            Видалити
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-white max-sm:w-72">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Ти впевнений?</AlertDialogTitle>
                            <AlertDialogDescription className="text-sm">
                              Видалити учасника{" "}
                              <span className="font-semibold">
                                {member.name || "без ім&apos;я"}
                              </span>{" "}
                              з цієї команди?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Відміна</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRemove(member.userId)}
                            >
                              Видалити
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ) : (
                      <span className="px-2 py-1 text-xs text-gray-400">
                        Видалення недоступне
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
};

export default TeamMembersPageClient;
