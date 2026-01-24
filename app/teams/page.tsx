import type { Metadata } from "next";
import Link from "next/link";
import { getAllTeamsAction } from "@/lib/actions/teamActions";

export const metadata: Metadata = {
  title: "Команди прославлення",
  description: "Перегляньте всі команди прославлення. Знайдіть свою команду або створіть нову.",
  openGraph: {
    title: "Команди прославлення | NL Songs",
    description: "Перегляньте всі команди прославлення",
  },
};

export const dynamic = "force-dynamic";

export default async function TeamsPage() {
  const teamsRes = await getAllTeamsAction();
  const teams = teamsRes.success ? teamsRes.teams : [];

  return (
    <section className="bg-white min-h-screen">
      <div className="mx-auto max-w-screen-xl px-4 py-8 lg:px-6 lg:py-16">
        <div className="mx-auto mb-8 max-w-screen-sm text-center lg:mb-16">
          <h2 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900">
            Всі Команди
          </h2>
          <p className="font-light text-gray-500 sm:text-xl">
            Перегляньте всі команди прославлення
          </p>
        </div>

        {teams.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-500 mb-4">Поки немає жодної команди.</p>
            <Link
              href="/teams/create"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Створити команду
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {teams.map((team) => (
              <Link
                key={team.id}
                href={`/teams/${team.id}`}
                className="block p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow hover:border-blue-300"
              >
                <div className="flex flex-col items-center text-center h-full">
                  {team.avatar ? (
                    <div className="w-20 h-20 mb-4 rounded-full overflow-hidden border-2 border-gray-200">
                      <img
                        src={team.avatar}
                        alt={team.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 mb-4 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center border-2 border-gray-200">
                      <svg
                        className="w-10 h-10 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                      </svg>
                    </div>
                  )}
                  
                  <h3 className="mb-2 text-xl font-bold text-gray-900 line-clamp-2">
                    {team.name}
                  </h3>
                  
                  {team.city ? (
                    <p className="text-sm text-gray-500 line-clamp-1">
                      {team.city}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 italic">
                      Місто не вказано
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
