import Image from "next/image";
import Link from "next/link";
import { TeamMemberProfile } from "@/types";

interface TeamProfileProps {
  teamName: string;
  teamDescription?: string;
  teamCity?: string;
  teamChurch?: string;
  members: TeamMemberProfile[];
  isAdmin?: boolean;
  isActiveTeam?: boolean;
  teamId?: string;
}

export default function TeamProfile({ 
  teamName, 
  teamDescription,
  teamCity,
  teamChurch,
  members,
  isAdmin = false,
  isActiveTeam = false,
  teamId
}: TeamProfileProps) {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-screen-xl px-4 py-8 lg:px-6 lg:py-16">
        {/* Team Header */}
        <div className="mx-auto mb-8 max-w-screen-md text-center">
          {isAdmin && isActiveTeam && teamId && (
            <div className="flex justify-center mb-6">
              <Link
                href={`/teams/${teamId}/edit`}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
                Редагувати команду
              </Link>
            </div>
          )}
          
          {/* Team Info */}
          {/* Team Info */}
          <div className="mt-6 space-y-3 text-left bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1">Опис</h3>
              <p className={`text-gray-600 ${!teamDescription && "italic text-gray-400"}`}>
                {teamDescription || "Не вказано"}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1">Місто</h3>
                <p className={`text-gray-600 ${!teamCity && "italic text-gray-400"}`}>
                  {teamCity || "Не вказано"}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1">Церква</h3>
                <p className={`text-gray-600 ${!teamChurch && "italic text-gray-400"}`}>
                  {teamChurch || "Не вказано"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Members Section */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Учасники команди</h3>
          
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-16">
            {members.map((member) => (
              <div key={member.id} className="text-center text-gray-500 flex flex-col items-center h-full border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 bg-white">
                <div className="mb-4 w-40 h-40 relative rounded-full overflow-hidden border-4 border-gray-100 shadow-sm flex-shrink-0">
                  {member.image ? (
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                      <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                  )}
                </div>
                
                <div className="flex-grow flex flex-col items-center w-full">
                  <h3 className="mb-1 text-2xl font-bold tracking-tight text-gray-900 line-clamp-1" title={member.name}>
                    {member.name}
                  </h3>
                  
                  <div className="min-h-[1.5rem] w-full mb-1">
                    {member.nickname ? (
                      <p className="text-sm text-blue-600 font-medium">
                        @{member.nickname}
                      </p>
                    ) : (
                      <span>&nbsp;</span>
                    )}
                  </div>
                  
                  <div className="min-h-[1.5rem] w-full mt-1">
                    {member.instrument && (
                      <p className="text-gray-500 uppercase tracking-wider text-sm font-semibold">
                        {member.instrument}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {members.length === 0 && (
             <p className="text-gray-500 text-center">У цій команді поки немає учасників.</p>
          )}
        </div>
      </div>
    </section>
  );
}
