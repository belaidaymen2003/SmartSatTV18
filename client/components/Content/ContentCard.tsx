"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Star,
  Play,
  ShoppingCart,
  Coins,
  Film,
  Tv,
  Radio,
  Gamepad2,
  Clock,
  Heart,
  Info,
  DownloadCloud,
} from "lucide-react";
import Link from "next/link";

export interface Content {
  id: number;
  title: string;
  type: "movie" | "series" | "live" | "gaming" | "app";
  price: number;
  rating: number;
  image: string;
  description: string;
  duration?: string;
  genre: string;
  year?: number;
  actors?: string[];
  director?: string;
  trailer?: string;
}

interface ContentCardProps {
  content: Content;
  onPurchase: (content: Content) => void;
  onViewDetails: (content: Content) => void;
  userCredits: number;
  isOwned?: boolean;
}

export default function ContentCard({
  content,
  onPurchase,
  onViewDetails,
  userCredits,
  isOwned = false,
}: ContentCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [reviewCount, setReviewCount] = useState<number>(0);

  // Initialize favorite state from localStorage
  useEffect(() => {
    const raw = localStorage.getItem("watchlist");
    if (raw) {
      try {
        const ids: number[] = JSON.parse(raw);
        setIsFavorite(ids.includes(content.id));
      } catch {}
    }
    const load = () => {
      const reviewsRaw = localStorage.getItem("reviews");
      if (reviewsRaw) {
        try {
          const all: any[] = JSON.parse(reviewsRaw);
          const list = all.filter((r) => r && r.contentId === content.id);
          if (list.length) {
            const avg =
              list.reduce((s, r) => s + Number(r.rating || 0), 0) / list.length;
            setAvgRating(Number(avg.toFixed(1)));
            setReviewCount(list.length);
          } else {
            setAvgRating(null);
            setReviewCount(0);
          }
        } catch {
          setAvgRating(null);
          setReviewCount(0);
        }
      } else {
        setAvgRating(null);
        setReviewCount(0);
      }
    };
    load();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "reviews") load();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [content.id]);

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case "movie":
        return <Film className="w-4 h-4" />;
      case "series":
        return <Tv className="w-4 h-4" />;
      case "live":
        return <Radio className="w-4 h-4" />;
      case "gaming":
        return <Gamepad2 className="w-4 h-4" />;
      case "app":
        return <DownloadCloud className="w-4 h-4" />;
      default:
        return <Play className="w-4 h-4" />;
    }
  };

  const handleFavoriteToggle = () => {
    setIsFavorite((prev) => {
      const next = !prev;
      const raw = localStorage.getItem("watchlist");
      let ids: number[] = [];
      if (raw) {
        try {
          ids = JSON.parse(raw);
        } catch {
          ids = [];
        }
      }
      if (next && !ids.includes(content.id)) ids.push(content.id);
      if (!next) ids = ids.filter((id) => id !== content.id);
      localStorage.setItem("watchlist", JSON.stringify(ids));
      return next;
    });
  };

  const isApp = content.type === "app";
  const destinationHref = isApp
    ? `/applications/${content.id}`
    : `/content/${content.id}`;

  return (
    <article
      className="glass w-96 h-96 rounded-2xl overflow-hidden content-card group shadow-2xl hover:shadow-[0_10px_30px_rgba(0,0,0,0.6)] transition-shadow duration-300"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      aria-labelledby={`content-${content.id}-title`}
    >
      <div className="relative h-56 md:h-48 overflow-hidden bg-gradient-to-b from-slate-800/20 to-transparent">
        {/* Image / Trailer preview */}
        {content.trailer && hovering ? (
          <video
            muted
            autoPlay
            loop
            playsInline
            preload="metadata"
            className="absolute inset-0 w-full h-full object-cover"
            src={content.trailer}
          />
        ) : (
          <Image
            src={content.image || "/placeholder-800x450.png"}
            alt={content.title}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-contain  group-hover:scale-105 transition-transform duration-400"
          />
        )}

        {/* Soft gradient overlay for legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

        {/* Category Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1 rounded-full bg-black/50 text-white text-xs backdrop-blur">
          {getCategoryIcon(content.type)}
          <span className="capitalize">{content.type}</span>
        </div>

        {/* Rating */}

        {/* Quick Play / View Overlay */}
      </div>

      <div className="p-5 md:p-6">
        <h3
          id={`content-${content.id}-title`}
          className="text-lg md:text-xl truncate font-semibold text-white mb-1 line-clamp-2"
        >
          {content.title}
        </h3>
        <p className="text-sm text-white/60 mb-3 line-clamp-2 truncate">
          {content.description}
        </p>

        <div className="flex items-center justify-between text-sm text-white/60 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg">
              <Coins className="w-4 h-4 text-yellow-400" />
              <span className="font-semibold">{content.price} Credits</span>
            </div>

            {content.duration && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{content.duration}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          {isOwned ? (
            <Link
              href={destinationHref}
              className="flex-1 text-center px-4 py-2 rounded-xl bg-green-500/20 text-green-300 font-semibold"
            >
              Watch
            </Link>
          ) : isApp ? (
            // For apps we use View to go to the single downloadable app page
            <button
              onClick={() => onViewDetails(content)}
              className="flex-1 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <DownloadCloud className="w-4 h-4" />
              View
            </button>
          ) : (
            <button
              onClick={() => onPurchase(content)}
              disabled={userCredits < content.price}
              className="flex-1 px-4 py-2 rounded-xl btn-primary text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              Buy
            </button>
          )}

          <Link
            href={destinationHref}
            className="px-3 py-2 rounded-xl bg-white/6 hover:bg-white/12 text-white/90 font-medium"
          >
            More
          </Link>
        </div>
      </div>
    </article>
  );
}
