'use client'

import Image from 'next/image'
import { Play, Star, Clock, Info, Coins } from 'lucide-react'

export interface SubscriptionProduct {
  id: number
  title: string
  price: number
  image?: string
  description?: string
  duration?: string
  genre?: string
  type?: string
  channels?: number
  quality?: string
}

interface Props {
  product: SubscriptionProduct
  onPurchase: (p: SubscriptionProduct) => void
  onViewDetails: (p: SubscriptionProduct) => void
  userCredits: number
  isOwned?: boolean
}

export default function SubscriptionCard({ product, onPurchase, onViewDetails, userCredits, isOwned = false }: Props) {
  return (
    <div className="glass rounded-2xl overflow-hidden content-card group">
      <div className="relative h-48 overflow-hidden">
        {product.image ? (
          <Image src={product.image} alt={product.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full bg-white/5 flex items-center justify-center"> 
            <div className="text-white/50">No image</div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/50 text-white text-xs">
          <Play className="w-3 h-3" />
          <span className="capitalize">{product.genre ?? product.type ?? 'Subscription'}</span>
        </div>

        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/50 text-white text-xs">
          <Star className="w-3 h-3 text-yellow-400" />
          <span>4.5</span>
        </div>

        {product.duration && (
          <div className="absolute bottom-3 left-3 px-2 py-1 rounded-full bg-black/50 text-white text-xs">
            {product.duration}
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{product.title}</h3>
        <p className="text-white/60 text-sm mb-3 line-clamp-2">{product.description}</p>

        <div className="flex items-center justify-between text-sm text-white/60 mb-4">
          <span className="flex items-center gap-1"><Coins className="w-4 h-4 text-yellow-400"/> <span className="font-semibold">{product.price}</span> <span className="text-white/60">Credits</span></span>
          {product.channels && <span className="text-white/60">{product.channels} channels</span>}
        </div>

        <div className="flex items-center justify-between gap-2">
          <button onClick={() => onViewDetails(product)} className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium flex items-center gap-2 transition-colors">
            <Info className="w-4 h-4"/> Details
          </button>

          {isOwned ? (
            <button className="px-4 py-2 rounded-xl bg-green-500/20 text-green-400 font-medium flex items-center gap-2">
              <Play className="w-4 h-4"/> Watch
            </button>
          ) : (
            <button onClick={() => onPurchase(product)} disabled={userCredits < product.price} className={`px-4 py-2 rounded-xl btn-primary text-white font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}>
              <Coins className="w-4 h-4" /> Buy
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
