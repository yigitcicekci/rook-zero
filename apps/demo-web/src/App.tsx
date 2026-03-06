import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Hero } from './sections/Hero';
import { Playground } from './sections/Playground';
import { Features } from './sections/Features';
import { ApiHighlights } from './sections/ApiHighlights';
import { UseCases } from './sections/UseCases';
import { t, type Lang } from './lib/i18n';

import logoDark from './assets/rook-zero-dark.png';
import logoLight from './assets/rook-zero-light.png';

function App() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const [lang, setLang] = useState<Lang>('en');

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDark(e.matches);
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const text = t[lang];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 selection:bg-indigo-100 selection:text-indigo-900 dark:selection:bg-indigo-900/50 dark:selection:text-indigo-200">
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 h-24 sm:h-28 flex items-center justify-between">
          <div className="flex items-center mt-2 -ml-2">
            <img src={logoLight} alt="Rook Zero" className="h-20 sm:h-28 lg:h-32 w-auto dark:hidden object-contain mix-blend-multiply" />
            <img src={logoDark} alt="Rook Zero" className="h-20 sm:h-28 lg:h-32 w-auto hidden dark:block object-contain" />
          </div>
          <div className="flex gap-4 sm:gap-6 items-center text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#playground" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{text.nav.playground}</a>
            <a href="#api" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{text.nav.api}</a>
            <a href="https://github.com/yigitcicekci/rook-zero" target="_blank" rel="noreferrer noopener" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors hidden sm:block">GitHub</a>
            
            <div className="relative flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/30 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors focus-within:ring-2 focus-within:ring-indigo-500">
              <select 
                value={lang}
                onChange={(e) => setLang(e.target.value as Lang)}
                className="pl-7 pr-3 py-1.5 text-indigo-700 dark:text-indigo-300 font-bold text-xs appearance-none cursor-pointer border-none outline-none relative z-10 bg-transparent"
                aria-label="Select language"
              >
                <option value="en">EN</option>
                <option value="tr">TR</option>
              </select>
              <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none text-xs z-0">
                {lang === 'en' ? '🇬🇧' : '🇹🇷'}
              </div>
            </div>

            <button 
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </nav>

      <main>
        <Hero lang={lang} />
        <div id="playground" className="scroll-mt-16 bg-white dark:bg-slate-950 pb-16">
          <Playground lang={lang} />
        </div>
        <Features lang={lang} />
        <ApiHighlights lang={lang} />
        <UseCases lang={lang} />
      </main>

      <footer className="bg-slate-950 dark:bg-[#070b14] text-slate-400 py-12 text-center text-sm border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center mb-6 md:mb-0 opacity-80 grayscale">
            <img src={logoLight} alt="Rook Zero" className="h-24 w-auto dark:hidden object-contain mix-blend-multiply" />
            <img src={logoDark} alt="Rook Zero" className="h-24 w-auto hidden dark:block object-contain" />
          </div>
          <p>© {new Date().getFullYear()} Yigit Cicekci. {text.footer.released}</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
