import React from "react";
import { 
  Music, 
  Users, 
  CalendarDays, 
  Wand2 
} from "lucide-react";

const UserGuide = () => {
  const features = [
    {
      icon: <Music className="w-8 h-8 text-blue-600" />,
      title: "Знайди та грай",
      description:
        "У нас тисячі пісень. Вводь назву або частину тексту. Потрібна інша тональність? Один клік — і акорди змінено. Це магія!",
      gradient: "from-blue-100 to-blue-50",
    },
    {
      icon: <Users className="w-8 h-8 text-orange-500" />,
      title: "Збери своїх",
      description:
        "Створи команду, запроси музикантів та надай їм ролі. Тепер усі знають, що і коли грати, і мають доступ до спільних ресурсів.",
      gradient: "from-orange-100 to-orange-50",
    },
    {
      icon: <CalendarDays className="w-8 h-8 text-green-600" />,
      title: "Планування Подій",
      description:
        "Створи подію, накидай пісень у список (сетліст) і розстав їх у потрібному порядку. Команда побачить це миттєво.",
      gradient: "from-green-100 to-green-50",
    },
    {
      icon: <Wand2 className="w-8 h-8 text-purple-600" />,
      title: "Додавання Пісень (AI)",
      description:
        "Лінь набирати текст? Просто скопіюй посилання на пісню з інтернету і встав сюди. Наш розумний помічник сам витягне текст та акорди.",
      gradient: "from-purple-100 to-purple-50",
    },
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="padding-x max-w-[1440px] mx-auto">
        <div className="flex flex-col items-center mb-16 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
            <span className="blue_gradient">Як це працює?</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl">
            Ваш повний гайд по додатку. Ми зробили все максимально просто, щоб ви могли зосередитись на головному — прославленні.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`
                relative p-8 rounded-2xl border border-gray-100 
                bg-white shadow-xl shadow-gray-100/50 
                hover:shadow-2xl hover:shadow-gray-200/50 hover:-translate-y-1 
                transition-all duration-300 group
              `}
            >
              <div
                className={`
                  w-16 h-16 rounded-xl mb-6 flex items-center justify-center 
                  bg-gradient-to-br ${feature.gradient} 
                  group-hover:scale-110 transition-transform duration-300
                `}
              >
                {feature.icon}
              </div>
              
              <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-blue-600 transition-colors">
                {feature.title}
              </h3>
              
              <p className="text-gray-500 leading-relaxed text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UserGuide;
