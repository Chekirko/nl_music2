import { getTeamById } from "@/lib/actions/teamActions";
import Image from "next/image";

interface LayoutProps {
  children: React.ReactNode;
  params: { teamId: string };
}

export default async function TeamLayout({ children, params }: LayoutProps) {
  const teamRes = await getTeamById(params.teamId);
  const team = teamRes.success ? teamRes.team : null;

  return (
    <div>
      {/* Cover Image Section */}
      <div className="max-w-[1600px] mx-auto relative w-full h-72 flex justify-center items-center overflow-hidden">
        {team?.coverImage ? (
          <Image
            src={team.coverImage}
            alt={`${team.name} cover`}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <Image
            src="/about.JPG"
            alt="Default Team Cover"
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="bg-black opacity-60 absolute inset-0"></div>
        <h1 className="uppercase text-white font-bold text-6xl text-center padding-x z-20 relative">
          {team?.name ? (
            <>
              Команда <span className="text-yellow-400">{team.name}</span>
            </>
          ) : (
            <>
              Наша <span className="text-yellow-400">команда</span>
            </>
          )}
        </h1>
      </div>
      
      {children}
    </div>
  );
}
