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
          {/* Admin/Member Actions */}
          <div className="flex justify-center gap-3 mb-6">
            {(isAdmin || isActiveTeam) && teamId && (
              <Link
                href={`/teams/${teamId}/members`}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
                <span>Учасники</span>
              </Link>
            )}
            
            {isAdmin && isActiveTeam && teamId && (
              <Link
                href={`/teams/${teamId}/edit`}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                <span>Редагувати</span>
              </Link>
            )}
          </div>
          
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
