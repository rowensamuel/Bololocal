import React from 'react';
import { Play, Sparkles, User, Target } from '../common/Icons';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { RolePlayScenario } from '../../types/ai';

export interface ScenarioCardProps {
  scenario: RolePlayScenario;
  onStart: (scenario: RolePlayScenario) => void;
}

export const ScenarioCard: React.FC<ScenarioCardProps> = ({ scenario, onStart }) => {
  return (
    <div className="bg-white border-2 border-black rounded-[6px] shadow-[4px_4px_0px_#000] p-5 flex flex-col justify-between gap-4 font-sans">
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <Badge variant="cyan" size="sm">
            {scenario.situation}
          </Badge>
          <Badge variant="neutral" size="sm">
            {scenario.difficulty}
          </Badge>
        </div>

        <h3 className="text-base sm:text-lg font-black text-black leading-snug">
          {scenario.title}
        </h3>
        <p className="text-xs font-medium text-neutral-700 line-clamp-2 leading-relaxed">
          {scenario.description}
        </p>

        {/* Roles Breakdown */}
        <div className="p-3 rounded-[4px] bg-[#FDF8F5] border-2 border-black shadow-[2px_2px_0px_#000] text-xs space-y-1">
          <div className="flex items-center justify-between text-neutral-600">
            <span className="font-bold uppercase text-[10px]">Your role:</span>
            <span className="font-black text-black">{scenario.userRole}</span>
          </div>
          <div className="flex items-center justify-between text-neutral-600">
            <span className="font-bold uppercase text-[10px]">AI acts as:</span>
            <span className="font-black text-black">{scenario.partnerRole}</span>
          </div>
        </div>

        {/* Goal */}
        <div className="flex items-start gap-1.5 text-xs text-black font-bold pt-1">
          <Sparkles className="w-3.5 h-3.5 text-black shrink-0 mt-0.5" />
          <span>Goal: {scenario.goal}</span>
        </div>
      </div>

      <Button
        variant="primary"
        size="sm"
        onClick={() => onStart(scenario)}
        className="w-full mt-2"
        leftIcon={<Play className="w-3.5 h-3.5" />}
      >
        Start Roleplay
      </Button>
    </div>
  );
};
