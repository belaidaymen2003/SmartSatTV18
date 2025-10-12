import { Edit2, Image as ImageIcon, Trash2 } from "lucide-react";

export type Channel = {
  id: number;
  name: string;
  logo: string | null;
  description: string | null;
  category: string | null;
};

interface Props {
  channel: Channel;
  onPreview: (channel: Channel) => void;
  onEdit: (channel: Channel) => void;
  onDelete: (id: number) => void;
}

export default function ChannelCard({ channel, onPreview, onEdit, onDelete }: Props) {
  return (
    <div
      className="bg-black/30 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors cursor-pointer"
      onClick={() => onPreview(channel)}
    >
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden">
          {channel.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={channel.logo} alt={channel.name} className="h-full w-full object-contain" />
          ) : (
            <ImageIcon className="w-6 h-6 text-white/40" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white font-medium truncate">{channel.name}</div>
          <div className="text-xs text-white/60 mt-0.5">{channel.category}</div>
          {channel.description && (
            <div className="text-xs text-white/50 mt-1 line-clamp-2">{channel.description}</div>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between mt-3">
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onEdit(channel)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded border border-white/10 hover:bg-white/10 text-white/80"
          >
            <Edit2 className="w-4 h-4" /> Edit
          </button>
          <button
            onClick={() => onDelete(channel.id)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded border border-red-500/30 text-red-400 hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}
