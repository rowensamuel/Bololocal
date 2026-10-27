import React from 'react';
import { Outlet } from 'react-router-dom';
import { Logo } from '../components/common/Logo';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FDF8F5]">
      {/* Brand Editorial Left Column (Desktop) */}
      <div className="hidden md:flex md:w-1/2 lg:w-5/12 bg-[#A6FAFF] text-black p-8 lg:p-12 flex-col justify-between border-r-2 border-black shadow-[6px_0px_0px_#000]">
        <div>
          <Logo size="md" variant="dark" to="/" />
        </div>

        <div className="my-auto space-y-6 max-w-sm">
          <div className="inline-flex items-center gap-2 px-3 py-1 border-2 border-black rounded-[4px] bg-white shadow-[2px_2px_0px_#000] text-xs font-black uppercase">
            <span>Conversational Language Learning</span>
          </div>

          <h2 className="text-3xl lg:text-4xl font-black tracking-tight leading-tight text-black">
            Don't Just Translate. <br />
            <span className="bg-[#FFE57F] px-1 border-2 border-black shadow-[3px_3px_0px_#000] inline-block mt-1">Learn to Speak.</span>
          </h2>

          <p className="text-sm font-semibold text-black leading-relaxed">
            Master conversational Marathi for real life in Maharashtra, from transit hubs and neighborhood markets to professional environments.
          </p>

          <div className="space-y-2.5 pt-2 text-xs font-bold text-black">
            {[
              'Context-first practical phrases',
              'Speed sprints and retention challenges',
              'Authentic audio pronunciation support',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-black border border-black shrink-0 shadow-[1px_1px_0px_#000]" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t-2 border-black text-xs font-bold text-black flex items-center justify-between">
          <span>Marathi Edition</span>
          <span className="font-marathi font-bold bg-[#B8FF9F] px-2 py-0.5 border border-black text-black">
            आपली भाषा, आपली ओळख
          </span>
        </div>
      </div>

      {/* Form Container Right Column */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-12">
        <div className="flex justify-between items-center md:hidden pb-6">
          <Logo size="sm" to="/" />
        </div>

        <div className="flex-1 flex items-center justify-center max-w-md w-full mx-auto">
          <Outlet />
        </div>

        <div className="text-center text-xs font-bold text-[#555555] pt-6">
          (c) {new Date().getFullYear()} BOLOLOCAL. Indian Language Education.
        </div>
      </div>
    </div>
  );
};
