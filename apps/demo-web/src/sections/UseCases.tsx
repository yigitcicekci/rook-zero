import { CheckCircle2 } from 'lucide-react';
import { t, type Lang } from '../lib/i18n';

export function UseCases({ lang }: { lang: Lang }) {
  const text = t[lang].useCases;
  return (
    <div className="py-24 bg-indigo-900 dark:bg-[#070b14] text-white">
      <div className="max-w-6xl mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="text-3xl font-bold mb-6">{text.title}</h2>
          <p className="text-indigo-200 text-lg leading-relaxed mb-8">
            {text.subtitle}
          </p>
          <div className="grid gap-4">
            {text.items.map((uc, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle2 className="text-indigo-400 mt-0.5 shrink-0" size={20} />
                <span className="text-indigo-100">{uc}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-violet-500/20 rounded-3xl transform rotate-3"></div>
          <div className="relative bg-slate-900 border border-slate-700 rounded-3xl p-8 shadow-2xl">
            <div className="text-sm font-mono text-indigo-300 mb-4">{text.installation}</div>
            <code className="block text-emerald-400 font-mono text-lg bg-slate-950 p-4 rounded-xl border border-slate-800">
              npm install @yigitcicekci/rook-zero
            </code>
            <div className="mt-8 flex justify-between items-center text-slate-400 text-sm border-t border-slate-800 pt-6">
              <span>{text.zeroDep}</span>
              <span>{text.typed}</span>
              <span>{text.license}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
