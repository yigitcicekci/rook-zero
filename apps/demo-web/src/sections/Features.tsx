import { ShieldCheck, Zap, BookOpen, Repeat, Activity, Layers } from 'lucide-react';
import { t, type Lang } from '../lib/i18n';

export function Features({ lang }: { lang: Lang }) {
  const text = t[lang].features;
  const icons = [
    <ShieldCheck className="text-indigo-600" size={24} />,
    <Zap className="text-emerald-600" size={24} />,
    <BookOpen className="text-blue-600" size={24} />,
    <Repeat className="text-orange-600" size={24} />,
    <Activity className="text-rose-600" size={24} />,
    <Layers className="text-violet-600" size={24} />
  ];

  return (
    <div className="bg-slate-50 dark:bg-slate-950 py-24">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">{text.title}</h2>
          <p className="text-slate-600 dark:text-slate-400">{text.subtitle}</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {text.items.map((feature, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md dark:hover:border-slate-700 transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-700">
                {icons[i]}
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">{feature.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
