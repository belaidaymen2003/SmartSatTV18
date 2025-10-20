"use client";

import Image from "next/image";
import { Star, Tv, Radio, Info, Clock } from "lucide-react";

export interface Channel {
  id: number;
  name: string;
  logo?: string;
  description?: string;
  category: "IPTV" | "STREAMING";
  subscriptions?: Array<{
    id: number;
    credit: number;
    duration: string;
    status: string;
  }>;
}

interface Props {
  channel: Channel;
  onViewDetails: (channelId: number) => void;
  rating?: number;
}

export default function ChannelCard({
  channel,
  onViewDetails,
  rating = 4.5,
}: Props) {
  const minPrice = channel.subscriptions?.length
    ? Math.min(...channel.subscriptions.map((s) => s.credit))
    : 0;

  const categoryIcon =
    channel.category === "IPTV" ? (
      <Tv className="w-4 h-4" />
    ) : (
      <Radio className="w-4 h-4" />
    );

  return (
    <article className="glass rounded-2xl h-96 w-80 overflow-hidden content-card group flex flex-col shadow-lg hover:scale-[1.02] transition-transform duration-300">
      {/* Channel Visual */}
      <div className="relative h-56 overflow-hidden bg-gradient-to-br from-slate-800/30 to-transparent">
        {channel.logo ? (
          <Image
            src={channel.logo}
            alt={channel.name}
            fill
            className="object-cover object-center h-56 group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-purple-500/20">
            <div className="text-white/60 text-center">
              <div className="text-3xl mb-1">{categoryIcon}</div>
              <div className="text-xs">{channel.category}</div>
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1 rounded-full bg-black/50 text-white text-xs backdrop-blur">
          {categoryIcon}
          <span className="capitalize">{channel.category}</span>
        </div>

        <div className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1 rounded-full bg-black/50 text-white text-xs">
          <Star className="w-4 h-4 text-yellow-400" />
          <span className="font-medium">{rating}</span>
        </div>
      </div>

      {/* Channel Info */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{channel.name}</h3>
        <p className="text-white/60 text-sm mb-4 line-clamp-3 flex-1">{channel.description}</p>

        <div className="flex items-center justify-between mb-4 text-sm text-white/70">
          <div className="flex items-center gap-3">
            {minPrice > 0 ? (
              <div className="flex items-baseline gap-2">
                <span className="text-white font-extrabold text-lg">{minPrice}</span>
                <span className="text-white/60">Credits</span>
              </div>
            ) : (
              <div className="px-2 py-1 bg-white/5 rounded">Free</div>
            )}

            <div className="flex items-center gap-1 px-2 py-1 rounded bg-white/5">
              <Clock className="w-4 h-4" />
              <span className="text-xs">Monthly</span>
            </div>
          </div>

          <div className="text-xs text-white/60">Popular</div>
        </div>

        <div className="mt-auto flex items-center gap-3">
          <button
            onClick={() => onViewDetails(channel.id)}
            className="flex-1 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
          >
            View Plans
          </button>

          <button
            onClick={() => onViewDetails(channel.id)}
            className="w-12 h-12 rounded-xl bg-white/6 hover:bg-white/12 flex items-center justify-center"
            aria-label={`Open ${channel.name}`}
          >
            <Info className="w-5 h-5 text-white/90" />
          </button>
        </div>
      </div>
    </article>
  );
}
