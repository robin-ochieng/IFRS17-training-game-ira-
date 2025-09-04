// src/components/GameGuideFAQ.js
import React from 'react';
import { X, HelpCircle, BookOpen, Trophy, Zap, Timer, Layers, Cloud, ShieldQuestion } from 'lucide-react';

const Section = ({ icon: Icon, title, children }) => (
  <div className="bg-black/20 border border-white/10 rounded-xl p-3 md:p-5">
    <div className="flex items-center gap-2 mb-2">
      {Icon && <Icon className="w-5 h-5 text-purple-300" />}
      <h3 className="text-white font-semibold text-sm md:text-lg">{title}</h3>
    </div>
    <div className="text-gray-300 text-sm md:text-base leading-relaxed">
      {children}
    </div>
  </div>
);

const QA = ({ q, children }) => (
  <div className="mb-4">
    <p className="text-white font-semibold">{q}</p>
    <p className="text-gray-300 text-sm md:text-base">{children}</p>
  </div>
);

const GameGuideFAQ = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 md:p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full sm:max-w-lg md:max-w-2xl lg:max-w-3xl bg-gradient-to-br from-gray-900 to-blue-900 border border-purple-500/30 rounded-xl md:rounded-2xl shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="guide-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-purple-300" />
            <h2 id="guide-title" className="text-white text-lg md:text-2xl font-bold">Game Guide & FAQ</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[78vh] md:max-h-[72vh] overflow-y-auto overscroll-contain p-4 md:p-6 space-y-4 md:space-y-5">
          <Section icon={BookOpen} title="Quick Start">
            <ul className="list-disc list-inside space-y-1">
              <li>Start with Module 1. It’s open to everyone.</li>
              <li>Answer questions to earn points and XP.</li>
              <li>Sign in to unlock more modules and sync your progress.</li>
            </ul>
          </Section>

          <Section icon={Trophy} title="Scoring Primer">
            <p className="mb-2">Each correct answer awards <span className="text-white font-semibold">10 × (combo + 1)</span>.</p>
            <p className="mb-2">Example: if you’re on a 3‑in‑a‑row combo, a correct answer gives <span className="text-white font-semibold">10 × (3 + 1) = 40</span> points.</p>
            <p>XP: You gain <span className="text-white font-semibold">25 XP</span> per correct answer. Level up when XP reaches <span className="text-white font-semibold">level × 100</span>.</p>
          </Section>

          <Section icon={Zap} title="Power‑ups">
            <p className="mb-2">Hint, Eliminate, and Skip provide advantages. Skipping moves you to the next question but breaks the perfect run. Availability is limited per module.</p>
            <p className="text-xs text-gray-400">Note: Power‑ups may vary by event or release.</p>
          </Section>

          <Section icon={Timer} title="Timer">
            <p>The timer starts when you submit your first answer in a module and stops when the module ends. Your completion time appears on module leaderboards.</p>
          </Section>

          <Section icon={Layers} title="Game Rules">
            <ul className="list-disc list-inside space-y-1">
              <li>Each question allows one answer; you can’t change it once submitted.</li>
              <li>Questions are shuffled every module attempt.</li>
              <li>“Perfect Module” = no wrong or skipped answers.</li>
              <li>Guests can play Module 1. Sign in to unlock the rest.</li>
              <li>Auto‑save keeps your progress; signed‑in users sync to the cloud.</li>
            </ul>
          </Section>

          <Section icon={ShieldQuestion} title="FAQ">
            <QA q="How do I score points?">Each correct answer awards 10 × (combo + 1). Keep answering correctly to build combo and streak for higher points.</QA>
            <QA q="What’s a “Perfect Module”?">Completing a module without any wrong or skipped answers. You’ll see a “Perfect” highlight on completion and in leaderboards.</QA>
            <QA q="How does leveling work?">You gain 25 XP per correct answer. Level up when XP reaches level × 100.</QA>
            <QA q="What are power‑ups and how do they work?">Hint, Eliminate, and Skip provide advantages. Skipping moves you to the next question but breaks the perfect run. Availability is limited per module.</QA>
            <QA q="When does the timer start?">The timer starts when you submit your first answer in a module and stops when the module ends.</QA>
            <QA q="Why are only some modules available to me?">Guests can play Module 1. Sign in to unlock more modules and sync progress across devices.</QA>
            <QA q="Will my progress be saved?">Yes. Guests are saved locally on your device. Signed‑in users are saved to the cloud and auto‑saved periodically.</QA>
            <QA q="How do leaderboards work?">There’s an overall leaderboard (score, level, modules, awards) and module leaderboards (score, time, perfect flag). Your position updates after syncing.</QA>
            <QA q="I finished Module 1 as a guest—why the sign‑in prompt?">To unlock Module 2+ and keep your results synced, you’ll be prompted to sign up or sign in after Module 1 completion.</QA>
            <QA q="Can I reset my progress?">Yes. Use the “Reset All Progress” action in settings. This deletes scores, completion, achievements, and answers.</QA>
            <QA q="Can I resume where I left off?">Yes. On return, the game loads your last saved state (local for guests, cloud for authenticated users).</QA>
            <QA q="Where do questions come from?">From the curated IFRS 17 modules in IFRS17Modules.js.</QA>
          </Section>

          <Section icon={Cloud} title="Privacy & Sync">
            <p>Guests: progress is stored locally on your device. Signed‑in players: progress is saved securely in the cloud and auto‑saved every few moments while you play.</p>
          </Section>

          <Section title="Behind the scenes (for the curious)">
            <ul className="list-disc list-inside space-y-1 text-gray-300">
              <li>Main gameplay: IFRS17TrainingGame.js</li>
              <li>Answers/Shuffle: handleAnswer, getShuffledQuestions</li>
              <li>Unlocking & flow: startNewModule, handleModuleCompletion</li>
              <li>Timer: startTimer, stopTimer, resetTimer</li>
              <li>Save/Sync: saveProgress, auto‑save; cloud sync via Supabase</li>
              <li>Leaderboards: LeaderboardModal.js</li>
              <li>Content: IFRS17Modules.js</li>
              <li>Power‑ups: powerUps.js (canUsePowerUp, consumePowerUp, getPowerUpInfo)</li>
            </ul>
          </Section>
        </div>
      </div>
    </div>
  );
};

export default GameGuideFAQ;
