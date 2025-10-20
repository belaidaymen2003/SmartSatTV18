"use client";

import Image from "next/image";
import { Star, Tv, Radio, Info } from "lucide-react";

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
      <Tv className="w-3 h-3" />
    ) : (
      <Radio className="w-3 h-3" />
    );

  return (
    <div className="glass rounded-2xl h-96 w-80 overflow-hidden content-card group  flex flex-col">
      {/* Channel Logo */}
      <div className="relative h-56 overflow-hidden bg-white/5">
        {channel.logo ? (
          <Image
            src={channel.logo}
            alt={channel.name}
            fill
            className="object-cover object-center h-56  group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-purple-500/20">
            <div className="text-white/50 text-center">
              <div className="text-4xl mb-2">{categoryIcon}</div>
              <div className="text-xs">{channel.category}</div>
            </div>
          </div>
        )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Category Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/50 text-white text-xs">
          {categoryIcon}
          <span className="capitalize">{channel.category}</span>
        </div>

        {/* Rating */}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/50 text-white text-xs">
          <Star className="w-3 h-3 text-yellow-400" />
          <span>{rating}</span>
        </div>
      </div>

      {/* Channel Info */}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
          {channel.name}
        </h3>
        <p className="text-white/60 text-sm mb-4 line-clamp-2 flex-1 truncate">
          {channel.description}
        </p>

        {/* Price Display */}
        {minPrice > 0 && (
          <div className="mb-4 text-sm text-white/70">
            <span className="text-white font-semibold text-lg">{minPrice}</span>
            <span className="text-white/60"> Credits</span>
            <span className="text-white/50 text-xs ml-1">(starting price)</span>
          </div>
        )}

        {/* Details Button */}
        <button
          onClick={() => onViewDetails(channel.id)}
          className="mt-auto justify-center  transition-all  px-4 py-2 rounded-xl btn-primary text-white font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Info className="w-4 h-4" />
          View Details
        </button>
      </div>
    </div>
  );
}
