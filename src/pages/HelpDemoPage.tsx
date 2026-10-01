import React, { useState } from 'react';
import { ChevronDown, Lightbulb, Play, Zap, PhoneCall, PlayCircle, PenLine, Users, Car, ScanLine, type LucideIcon } from 'lucide-react';
import { ScanHeader } from '../components/ScanResultCard';

const VIDEO_URL = 'https://www.youtube.com/@ScanConnectOfficial';

interface HelpTopic {
  Icon: LucideIcon;
  color: string;
  title: string;
  description: string;
  videoUrl?: string;
}

const TOPICS: HelpTopic[] = [
  {
    Icon: Zap,
    color: '#1B1C1C',
    title: 'Activate a Tag',
    description:
      'Scan the QR code on your tag or enter the tag ID manually, add your vehicle details, and confirm to complete activation.',
    videoUrl: VIDEO_URL,
  },
  {
    Icon: PhoneCall,
    color: '#0E9F8E',
    title: 'Masked Call & WhatsApp',
    description:
      'Anyone who scans your tag can call or WhatsApp you through a masked number — your real phone number is never shown.',
    videoUrl: VIDEO_URL,
  },
  {
    Icon: PlayCircle,
    color: '#6C63FF',
    title: 'Complete Walkthrough',
    description:
      'A full step-by-step tour of Scan Connect — from unboxing your tag to using every feature in the app.',
    videoUrl: VIDEO_URL,
  },
  {
    Icon: PenLine,
    color: '#1F8A54',
    title: 'Change or Delete Your Number',
    description:
      'Update the mobile number linked to your tag, or remove it entirely, anytime from your account settings.',
    videoUrl: VIDEO_URL,
  },
  {
    Icon: Users,
    color: '#D6272C',
    title: 'Emergency Family Contact',
    description:
      'Add emergency contacts so your family is notified instantly with your live location whenever the SOS is triggered.',
    videoUrl: VIDEO_URL,
  },
  {
    Icon: Car,
    color: '#E07B00',
    title: 'Register a Vehicle',
    description:
      'Link a car, bike or truck to your Scan Connect account and assign a tag to it in a few taps.',
    videoUrl: VIDEO_URL,
  },
  {
    Icon: ScanLine,
    color: '#0E7C86',
    title: 'Scan Any Tag',
    description:
      'Point your camera at any Scan Connect tag to instantly look up vehicle info and contact options.',
    videoUrl: VIDEO_URL,
  },
];

export const HelpDemoPage: React.FC = () => {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="min-h-screen w-full bg-[#F5F4F1] font-['Hanken_Grotesk']">
      <ScanHeader />

      <div className="max-w-md mx-auto px-4 py-5 space-y-4">
        <div className="space-y-1">
          <h1 className="font-['Rubik'] font-bold text-xl text-[#1B1C1C] tracking-tight">Help / Demo</h1>
          <p className="text-[13px] text-[#5F5E5E] leading-snug">Quick guides for every Scan Connect feature.</p>
        </div>

        <div className="flex items-start gap-2 rounded-xl bg-white/70 border border-[#E5E3DC] p-3">
          <Lightbulb className="w-4 h-4 mt-0.5 text-[#1B1C1C] shrink-0" />
          <p className="text-xs text-[#5F5E5E]">Tip: Tap a topic to expand it, then watch the video for a full walkthrough.</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#D1D5DB] shadow-[0_1px_3px_rgba(0,0,0,0.06)] divide-y divide-[#E5E7EB]">
          {TOPICS.map((topic, i) => {
            const open = expanded === i;
            return (
              <div key={topic.title}>
                <button
                  type="button"
                  onClick={() => setExpanded(open ? null : i)}
                  aria-expanded={open}
                  className="w-full px-3.5 py-3 flex items-center gap-3.5 text-left cursor-pointer"
                >
                  <span
                    className="w-9 h-9 rounded-[11px] flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${topic.color}1F` }}
                  >
                    <topic.Icon className="w-[18px] h-[18px]" style={{ color: topic.color }} />
                  </span>
                  <span className="flex-1 text-sm font-bold text-[#1B1C1C]">{topic.title}</span>
                  <ChevronDown className={`w-5 h-5 text-[#5F5E5E] transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
                </button>
                {open && (
                  <div className="pl-[66px] pr-4 pb-3.5 -mt-1 space-y-2.5">
                    <p className="text-[13px] text-[#5F5E5E] leading-relaxed">{topic.description}</p>
                    {topic.videoUrl && (
                      <a
                        href={topic.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#1B1C1C] px-3 py-1.5 text-xs font-bold text-white cursor-pointer"
                      >
                        <Play className="w-4 h-4" fill="currentColor" />
                        Watch video
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
