import React from "react";
import { BarChart3, Flame, CalendarDays } from "lucide-react";

const features = [
  {
    icon: <BarChart3 className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />,
    title: "Visualize Your Progress",
    desc: "Track commits, PRs, and contributions across days and weeks with beautiful charts.",
  },
  {
    icon: <Flame className="h-8 w-8 text-pink-500 dark:text-pink-400" />,
    title: "Maintain Your Streak",
    desc: "Get reminders and insights to help you keep your GitHub streak alive.",
  },
  {
    icon: <CalendarDays className="h-8 w-8 text-emerald-500 dark:text-emerald-400" />,
    title: "Set Daily & Weekly Goals",
    desc: "Define custom targets and get notified when you're falling behind.",
  },
];

const Features = () => {
  return (
    <section className="bg-gray-100 dark:bg-gray-900 py-20 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <h2
          className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-4"
          style={{ fontFamily: "'Hubot Sans', sans-serif" }}
        >
          Why DevMetrics?
        </h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-12">
          DevMetrics helps you stay productive, accountable, and on track with
          your coding goals.
        </p>

        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-xl transition"
            >
              <div className="flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
