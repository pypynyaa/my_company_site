import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Lock, ArrowRight, Sparkles } from 'lucide-react';

// Расширяем интерфейс новыми цветами
export interface YearCardProps {
  year: number;
  title: string;
  description: string;
  isLocked: boolean;
  color: 'burgundy' | 'emerald' | 'amber' | 'indigo';
  memoryCount: number;
  onClick?: () => void;
  glow?: string; // Опционально из HomePage
  accentColor?: string; // Опционально из HomePage
}

const YearCard: React.FC<YearCardProps> = ({
  year,
  title,
  description,
  isLocked,
  color,
  memoryCount,
  onClick,
}) => {
  // Настройки цветов для карточек (без белого фона!)
  const colorMap = {
    burgundy: {
      text: 'text-rose-500',
      border: 'border-rose-500/20',
      bg: 'bg-rose-500/5',
      icon: 'text-rose-400'
    },
    emerald: {
      text: 'text-emerald-500',
      border: 'border-emerald-500/20',
      bg: 'bg-emerald-500/5',
      icon: 'text-emerald-400'
    },
    amber: {
      text: 'text-amber-500',
      border: 'border-amber-500/20',
      bg: 'bg-amber-500/5',
      icon: 'text-amber-400'
    },
    indigo: {
      text: 'text-indigo-500',
      border: 'border-indigo-500/20',
      bg: 'bg-indigo-500/5',
      icon: 'text-indigo-400'
    },
  };

  const theme = colorMap[color];

  return (
    <div 
      onClick={!isLocked ? onClick : undefined}
      className={`relative h-full p-8 flex flex-col justify-between transition-all duration-500 ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer group'}`}
    >
      <div>
        <div className="flex justify-between items-start mb-8">
          {/* Номер курса в стильном квадрате */}
          <div className={`w-14 h-14 rounded-2xl border ${theme.border} ${theme.bg} flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
            <span className={`text-2xl font-black ${theme.text}`}>{year}</span>
          </div>

          {/* Счетчик воспоминаний */}
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-1">Архив</span>
            <div className="flex items-center gap-1.5">
              <span className={`text-sm font-bold text-slate-200`}>{memoryCount}</span>
              <Sparkles className={`w-3 h-3 ${theme.icon} opacity-50`} />
            </div>
          </div>
        </div>

        <h3 className="text-2xl font-display font-bold text-slate-100 mb-3 group-hover:text-white transition-colors">
          {title}
        </h3>
        
        <p className="text-slate-500 text-sm leading-relaxed font-light line-clamp-2">
          {description}
        </p>
      </div>

      <div className="mt-10 flex items-center justify-between">
        {isLocked ? (
          <div className="flex items-center gap-2 text-slate-700">
            <Lock className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Глава закрыта</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-400 group-hover:text-white transition-all">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Открыть главу</span>
            <ArrowRight className={`w-4 h-4 transition-transform duration-300 group-hover:translate-x-2 ${theme.text}`} />
          </div>
        )}
        
        {!isLocked && (
          <div className={`w-1.5 h-1.5 rounded-full ${theme.bg.replace('/5', '')} animate-pulse`} />
        )}
      </div>
    </div>
  );
};

export default YearCard;