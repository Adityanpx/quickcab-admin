"use client";

import { motion } from "framer-motion";
import { Star, Trash2 } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { TableRowSkeleton } from "@/components/ui/SkeletonLoader";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatRelative } from "@/lib/utils";
import type { Rating } from "@/lib/api/ratings";
import { cn } from "@/lib/utils";

function StarDisplay({ stars }: { stars: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={13}
          className={cn(
            s <= stars
              ? "text-yellow-500 fill-yellow-500"
              : "text-light-border dark:text-dark-border"
          )}
        />
      ))}
      <span className="text-[12px] font-medium text-light-text dark:text-dark-text ml-1">
        {stars}.0
      </span>
    </div>
  );
}

interface RatingTableProps {
  ratings: Rating[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onRemove: (rating: Rating) => void;
}

export function RatingTable({
  ratings,
  isLoading,
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onRemove,
}: RatingTableProps) {
  return (
    <div className="card p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="table-base">
          <thead>
            <tr>
              <th className="pl-5">Rated By</th>
              <th>Rated To</th>
              <th>Stars</th>
              <th>Tags</th>
              <th>Review</th>
              <th>Booking</th>
              <th>Posted</th>
              <th className="pr-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRowSkeleton key={i} cols={8} />
              ))
            ) : ratings.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <EmptyState
                    title="No ratings found"
                    description="No ratings match your current filter"
                    icon={<Star size={22} />}
                  />
                </td>
              </tr>
            ) : (
              ratings.map((rating, i) => (
                <motion.tr
                  key={rating.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.025, duration: 0.25 }}
                  className={cn(
                    rating.isFlagged && !rating.isRemoved &&
                      "bg-brand-red-muted/30 dark:bg-brand-red-muted/20"
                  )}
                >
                  {/* Rated By */}
                  <td className="pl-5">
                    <div className="flex items-center gap-2">
                      <Avatar name={rating.ratedBy.name} size="xs" />
                      <div>
                        <Link
                          href={`/partners/${rating.ratedBy.id}`}
                          className="text-[12px] font-medium text-light-text dark:text-dark-text hover:text-brand-purple transition-colors"
                        >
                          {rating.ratedBy.name}
                        </Link>
                        <p className="text-[11px] text-light-text-3 dark:text-dark-text-3">
                          {rating.ratedBy.mobile}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Rated To */}
                  <td>
                    <div className="flex items-center gap-2">
                      <Avatar name={rating.ratedTo.name} size="xs" />
                      <div>
                        <Link
                          href={`/partners/${rating.ratedTo.id}`}
                          className="text-[12px] font-medium text-light-text dark:text-dark-text hover:text-brand-purple transition-colors"
                        >
                          {rating.ratedTo.name}
                        </Link>
                        <p className="text-[11px] text-light-text-3 dark:text-dark-text-3">
                          {rating.ratedTo.mobile}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Stars */}
                  <td>
                    <StarDisplay stars={rating.stars} />
                    {rating.isFlagged && !rating.isRemoved && (
                      <span className="text-[10px] font-medium text-brand-red mt-0.5 block">
                        ⚑ Flagged
                      </span>
                    )}
                  </td>

                  {/* Tags */}
                  <td>
                    <div className="flex flex-wrap gap-1 max-w-[160px]">
                      {rating.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-light-surface-2 dark:bg-dark-surface text-light-text-2 dark:text-dark-text-2 border border-light-border dark:border-dark-border whitespace-nowrap"
                        >
                          {tag.replace(/_/g, " ")}
                        </span>
                      ))}
                      {rating.tags.length > 2 && (
                        <span className="text-[10px] text-light-text-3 dark:text-dark-text-3">
                          +{rating.tags.length - 2}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Review */}
                  <td>
                    <p className="text-[12px] text-light-text-2 dark:text-dark-text-2 max-w-[180px] truncate">
                      {rating.comment ?? (
                        <span className="text-light-text-3 dark:text-dark-text-3 italic">
                          No comment
                        </span>
                      )}
                    </p>
                  </td>

                  {/* Booking */}
                  <td>
                    {rating.booking ? (
                      <div>
                        <p className="text-[12px] text-light-text dark:text-dark-text">
                          {rating.booking.pickupCity} → {rating.booking.dropCity}
                        </p>
                      </div>
                    ) : (
                      <span className="text-[12px] text-light-text-3 dark:text-dark-text-3">—</span>
                    )}
                  </td>

                  {/* Posted */}
                  <td>
                    <span className="text-[12px] text-light-text-3 dark:text-dark-text-3">
                      {formatRelative(rating.createdAt)}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="pr-5 text-right">
                    <Button
                      variant="danger"
                      size="xs"
                      icon={<Trash2 size={12} />}
                      onClick={() => onRemove(rating)}
                    >
                      Remove
                    </Button>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!isLoading && ratings.length > 0 && (
        <div className="px-5 py-4 border-t border-light-border dark:border-dark-border">
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            limit={limit}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}
