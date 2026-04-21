"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { MessageSquare, Clock, CheckCircle, Archive } from "lucide-react";
import {
  useSupportTickets,
  useReplyTicket,
} from "@/lib/hooks/useSupport";
import { TicketTable } from "@/components/support/TicketTable";
import { TicketReplyModal } from "@/components/support/TicketReplyModal";
import { StatCard } from "@/components/ui/StatCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { FilterSelect } from "@/components/ui/FilterSelect";
import type { SupportTicket, TicketStatus } from "@/lib/api/support";

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as any },
  }),
};

const STATUS_FILTER_OPTIONS = [
  { value: "OPEN", label: "Open" },
  { value: "IN_REVIEW", label: "In Review" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "CLOSED", label: "Closed" },
];

export default function SupportPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "">("");
  const [replyTarget, setReplyTarget] = useState<SupportTicket | null>(null);

  const { data, isLoading } = useSupportTickets({
    page,
    limit: 15,
    status: (statusFilter as TicketStatus) || undefined,
  });

  const replyMutation = useReplyTicket();

  const tickets = data?.items ?? [];
  const pagination = data?.pagination;

  const stats = {
    total: pagination?.total ?? 0,
    open: tickets.filter((t) => t.status === "OPEN").length,
    inReview: tickets.filter((t) => t.status === "IN_REVIEW").length,
    resolved: tickets.filter((t) => t.status === "RESOLVED").length,
  };

  const handleReplyConfirm = async (status: TicketStatus, note: string) => {
    if (!replyTarget) return;
    await replyMutation.mutateAsync({
      id: replyTarget.id,
      payload: { status, adminNote: note },
    });
    setReplyTarget(null);
  };

  return (
    <div className="space-y-6 max-w-[1400px]">
      <motion.div custom={0} variants={sectionVariants} initial="hidden" animate="visible">
        <PageHeader
          title="Support Tickets"
          subtitle="Review and respond to partner support requests"
        />
      </motion.div>

      {/* Stats */}
      <motion.div
        custom={1}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard index={0} label="Total Tickets" value={(pagination?.total ?? 0).toLocaleString("en-IN")} icon={<MessageSquare size={16} />} accentColor="purple" />
        <StatCard index={1} label="Open" value={stats.open} icon={<Clock size={16} />} accentColor={stats.open > 5 ? "orange" : "purple"} subtext="on current page" />
        <StatCard index={2} label="In Review" value={stats.inReview} icon={<Clock size={16} />} accentColor="orange" subtext="on current page" />
        <StatCard index={3} label="Resolved" value={stats.resolved} icon={<CheckCircle size={16} />} accentColor="green" subtext="on current page" />
      </motion.div>

      {/* Filter */}
      <motion.div custom={2} variants={sectionVariants} initial="hidden" animate="visible" className="flex items-center gap-3">
        <FilterSelect
          value={statusFilter}
          onChange={(v) => { setStatusFilter(v as TicketStatus | ""); setPage(1); }}
          options={STATUS_FILTER_OPTIONS}
          placeholder="All Statuses"
          className="w-44"
        />
      </motion.div>

      {/* Table */}
      <motion.div custom={3} variants={sectionVariants} initial="hidden" animate="visible">
        <TicketTable
          tickets={tickets}
          isLoading={isLoading}
          page={page}
          totalPages={pagination?.totalPages ?? 1}
          total={pagination?.total ?? 0}
          limit={15}
          onPageChange={setPage}
          onReply={setReplyTarget}
        />
      </motion.div>

      {/* Reply Modal */}
      <TicketReplyModal
        isOpen={!!replyTarget}
        onClose={() => setReplyTarget(null)}
        onConfirm={handleReplyConfirm}
        ticket={replyTarget}
        loading={replyMutation.isPending}
      />
    </div>
  );
}
