"use client";

import { motion } from "framer-motion";
import { Edit2, Trash2, ExternalLink, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { Ad } from "@/lib/api/ads";
import { useToggleAd } from "@/lib/hooks/useAds";
import toast from "react-hot-toast";

interface AdCardProps {
  ad: Ad;
  index: number;
  onEdit: (ad: Ad) => void;
  onDelete: (ad: Ad) => void;
}

export function AdCard({ ad, index, onEdit, onDelete }: AdCardProps) {
  const toggleMutation = useToggleAd();

  const handleToggle = () => {
    toggleMutation.mutate(
      { id: ad.id, isActive: !ad.isActive },
      {
        onSuccess: () => {
          toast.success(ad.isActive ? "Ad deactivated" : "Ad activated");
        },
      }
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.08,
        duration: 0.35,
        ease: [0.25, 0.46, 0.45, 0.94] as any,
      }}
      className={cn(
        "card relative overflow-hidden transition-all duration-200",
        "hover:border-brand-purple/30 hover:shadow-purple-glow group",
        !ad.isActive && "opacity-60"
      )}
    >
      {/* Image preview */}
      <div className="w-full rounded-xl overflow-hidden mb-3" style={{ aspectRatio: "16/9" }}>
        {ad.imageUrl ? (
          <img
            src={ad.imageUrl}
            alt={ad.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-light-surface-2 dark:bg-dark-surface flex items-center justify-center">
            <ImageIcon size={24} className="text-light-text-3 dark:text-dark-text-3" />
          </div>
        )}
      </div>

      {/* Name + badges */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-bold text-[15px] text-light-text dark:text-dark-text truncate flex-1">
          {ad.name}
        </h3>
        <div className="flex items-center gap-1.5 shrink-0">
          <Badge variant="purple">#{ad.order}</Badge>
          <Badge variant={ad.isActive ? "active" : "gray"}>
            {ad.isActive ? "Live" : "Inactive"}
          </Badge>
        </div>
      </div>

      {/* Title */}
      {ad.title && (
        <p className="text-[13px] text-light-text dark:text-dark-text mt-1">
          {ad.title}
        </p>
      )}

      {/* Description */}
      {ad.description && (
        <p className="text-[12px] text-light-text-2 dark:text-dark-text-2 mt-0.5 line-clamp-2">
          {ad.description}
        </p>
      )}

      {/* Redirect URL */}
      <a
        href={ad.redirectUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 mt-2 text-[11px] text-brand-purple hover:underline truncate"
        onClick={(e) => e.stopPropagation()}
      >
        <ExternalLink size={10} className="shrink-0" />
        <span className="truncate">{ad.redirectUrl}</span>
      </a>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 mt-3 border-t border-light-border dark:border-dark-border">
        <Button
          variant="outline"
          size="xs"
          icon={<Edit2 size={12} />}
          onClick={() => onEdit(ad)}
          className="flex-1"
        >
          Edit
        </Button>
        <Button
          variant="outline"
          size="xs"
          onClick={handleToggle}
          loading={toggleMutation.isPending}
          className={
            ad.isActive
              ? "text-brand-orange border-brand-orange/30"
              : "text-brand-green border-brand-green/30"
          }
        >
          {ad.isActive ? "Deactivate" : "Activate"}
        </Button>
        <Button
          variant="danger"
          size="xs"
          icon={<Trash2 size={12} />}
          onClick={() => onDelete(ad)}
        >
          Delete
        </Button>
      </div>
    </motion.div>
  );
}
