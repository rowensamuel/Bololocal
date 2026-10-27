import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Compass } from '../common/Icons';
import { SituationGuide } from '../../types/phrase';

export interface SituationCardProps {
  situation: SituationGuide;
}

export const SituationCard: React.FC<SituationCardProps> = ({ situation }) => {
  return (
    <div className="bg-white border-2 border-black rounded-[6px] shadow-[4px_4px_0px_#000] p-5 flex flex-col justify-between gap-3 font-sans">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-[#A6FAFF] border-2 border-black rounded-[4px] shadow-[2px_2px_0px_#000]">
            <Compass className="w-5 h-5 text-black" />
          </div>
          <span className="text-xs font-black uppercase text-black bg-neutral-100 px-2 py-0.5 border border-black rounded">
            {situation.phraseCount} phrases
          </span>
        </div>
        <h3 className="text-base font-black text-black leading-snug">
          {situation.title}
        </h3>
        <p className="text-xs font-medium text-neutral-700 mt-1 line-clamp-2 leading-relaxed">
          {situation.description}
        </p>
      </div>

      <Link
        to={`/phrases?category=${encodeURIComponent(situation.category)}`}
        className="inline-flex items-center justify-between text-xs font-black text-black underline pt-2 border-t-2 border-black hover:bg-[#FFE57F] px-1 rounded transition-none"
      >
        <span>Explore Phrases</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
};
