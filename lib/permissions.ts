import { getServerSession } from "next-auth";
import { authConfig } from "@/configs/auth";
import { connectToDB } from "@/utils/database";
import User from "@/models/user";
import Team from "@/models/teams";
import Song from "@/models/song";
import Event from "@/models/event";

export async function getSessionUser() {
  const session = await getServerSession(authConfig);
  if (!session?.user?.email) return null;
  await connectToDB();
  const user = await User.findOne({ email: session.user.email }).lean();
  if (!user) return null;
  return user as { _id: string; activeTeam?: string };
}

export async function requireActiveTeam() {
  const user = await getSessionUser();
  if (!user || !user.activeTeam) {
    return { ok: false as const, status: 403, message: "Active team required" };
  }
  return {
    ok: true as const,
    userId: String(user._id),
    teamId: String(user.activeTeam),
  };
}

type TeamRole = "admin" | "editor" | "member";

export async function getUserRoleInTeam(userId: string, teamId: string) {
  try {
    await connectToDB();
    const team = (await Team.findById(teamId)
      .select("owner members.user members.role")
      .lean()) as any;
    if (!team) return null;
    if (String(team.owner) === String(userId)) return "admin" as TeamRole;
    const member = (team.members || []).find((m: any) => String(m.user) === String(userId));
    return (member?.role as TeamRole) || null;
  } catch {
    return null;
  }
}

export async function getActiveTeamAndRole() {
  const access = await requireActiveTeam();
  if (!access.ok) return access as any;
  const role = await getUserRoleInTeam(access.userId, access.teamId);
  if (!role) return { ok: false as const, status: 403, message: "No role in team" };
  return { ...access, role } as const;
}

function canEditByRole(role: TeamRole) {
  return role === "admin" || role === "editor";
}

function canDeleteByRole(role: TeamRole) {
  return role === "admin"; // РјР°С‚СЂРёС†СЏ РїСЂР°РІ: РІРёРґР°Р»РµРЅРЅСЏ Р»РёС€Рµ Р°РґРјС–РЅ
}

export async function canCreateSong() {
  const ar = await getActiveTeamAndRole();
  if (!ar.ok) return { ok: false as const, status: 403, message: ar.message } as const;
  if (!canEditByRole(ar.role)) return { ok: false as const, status: 403, message: "Insufficient role" } as const;
  return { ok: true as const, teamId: ar.teamId, userId: ar.userId, role: ar.role } as const;
}

export async function canEditSong(songId: string) {
  const ar = await getActiveTeamAndRole();
  if (!ar.ok) return { ok: false as const, status: 403, message: ar.message } as const;
  await connectToDB();
  const song = (await Song.findById(songId).select("team").lean()) as any;
  if (!song) return { ok: false as const, status: 404, message: "Song not found" } as const;
  if (String(song.team) !== String(ar.teamId))
    return { ok: false as const, status: 403, message: "Song from another team" } as const;
  if (!canEditByRole(ar.role))
    return { ok: false as const, status: 403, message: "Insufficient role" } as const;
  return { ok: true as const } as const;
}

export async function canDeleteSong(songId: string) {
  const ar = await getActiveTeamAndRole();
  if (!ar.ok) return { ok: false as const, status: 403, message: ar.message } as const;
  await connectToDB();
  const song = (await Song.findById(songId).select("team").lean()) as any;
  if (!song) return { ok: false as const, status: 404, message: "Song not found" } as const;
  if (String(song.team) !== String(ar.teamId))
    return { ok: false as const, status: 403, message: "Song from another team" } as const;
  if (!canDeleteByRole(ar.role))
    return { ok: false as const, status: 403, message: "Insufficient role" } as const;
  return { ok: true as const } as const;
}

export async function canManageTeam(teamId: string) {
  const access = await getActiveTeamAndRole();
  if (!access.ok) return { ok: false as const, status: 403, message: access.message } as const;
  if (String(access.teamId) !== String(teamId))
    return { ok: false as const, status: 403, message: "Not active team" } as const;
  if (access.role !== "admin")
    return { ok: false as const, status: 403, message: "Admin only" } as const;
  return { ok: true as const } as const;
}

export async function canCreateEvent() {
  const ar = await getActiveTeamAndRole();
  if (!ar.ok) return { ok: false as const, status: ar.status, message: ar.message } as const;
  if (!canEditByRole(ar.role))
    return { ok: false as const, status: 403, message: "Insufficient role" } as const;
  return { ok: true as const, teamId: ar.teamId, userId: ar.userId } as const;
}

export async function canEditEvent(eventId: string) {
  const ar = await getActiveTeamAndRole();
  if (!ar.ok) return { ok: false as const, status: ar.status, message: ar.message } as const;
  await connectToDB();
  const event = (await Event.findById(eventId).select("team").lean()) as any;
  if (!event) return { ok: false as const, status: 404, message: "Event not found" } as const;
  const eventTeamId = event.team ? String(event.team) : null;
  if (eventTeamId && eventTeamId !== ar.teamId)
    return { ok: false as const, status: 403, message: "Event from another team" } as const;
  if (!canEditByRole(ar.role))
    return { ok: false as const, status: 403, message: "Insufficient role" } as const;
  return { ok: true as const, teamId: ar.teamId } as const;
}

export async function canDeleteEvent(eventId: string) {
  const ar = await getActiveTeamAndRole();
  if (!ar.ok) return { ok: false as const, status: ar.status, message: ar.message } as const;
  await connectToDB();
  const event = (await Event.findById(eventId).select("team").lean()) as any;
  if (!event) return { ok: false as const, status: 404, message: "Event not found" } as const;
  const eventTeamId = event.team ? String(event.team) : null;
  if (eventTeamId && eventTeamId !== ar.teamId)
    return { ok: false as const, status: 403, message: "Event from another team" } as const;
  if (!canDeleteByRole(ar.role))
    return { ok: false as const, status: 403, message: "Admin only" } as const;
  return { ok: true as const } as const;
}

