import { motion } from 'framer-motion';
import { ArrowRight, Code2 } from 'lucide-react';
import { t, type Lang } from '../lib/i18n';

export function Hero({ lang }: { lang: Lang }) {
  const text = t[lang].hero;
  return (
    <div className="relative overflow-hidden bg-white dark:bg-slate-950 pt-24 pb-16 lg:pt-32 lg:pb-24 border-b border-slate-100 dark:border-slate-800">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium text-sm mb-8 border border-indigo-100 dark:border-indigo-800/50">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 dark:bg-indigo-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500 dark:bg-indigo-400"></span>
            </span>
            {text.badge}
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
            {text.title1}<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
              {text.title2}
            </span>
          </h1>
          
          <p className="mt-6 text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {text.subtitle}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="#playground" 
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-lg font-medium transition-all focus:ring-2 focus:ring-slate-400 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
            >
              {text.cta1} <ArrowRight size={18} />
            </a>
            <a 
              href="#api" 
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg font-medium transition-all focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-700 focus:ring-offset-2 dark:focus:ring-offset-slate-950 shadow-sm"
            >
              <Code2 size={18} /> {text.cta2}
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
