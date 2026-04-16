"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Users, UserCheck, UserX, Clock } from "lucide-react";
import { usePartners, useSuspendPartner } from "@/lib/hooks/usePartners";
import { partnersApi } from "@/lib/api/partners";
import { PartnerFilters } from "@/components/partners/PartnerFilters";
import { PartnerTable } from "@/components/partners/PartnerTable";
import { SuspendModal } from "@/components/partners/SuspendModal";
import { BlockModal } from "@/components/partners/BlockModal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { StatCard } from "@/components/ui/StatCard";
import { PageHeader } from "@/components/ui/PageHeader";
import type { Partner, SuspendPartnerPayload } from "@/types/partner";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

const sectionVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

export default function PartnersPage() {
  const qc = useQueryClient();

  // ── Filters state ─────────────────────────────────────
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [subType, setSubType] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  // ── Modal state ───────────────────────────────────────
  const [suspendTarget, setSuspendTarget] = useState<Partner | null>(null);
  const [blockTarget, setBlockTarget] = useState<Partner | null>(null);
  const [unsuspendTarget, setUnsuspendTarget] = useState<Partner | null>(null);

  // ── Data ─────────────────────────────────────────────
  const { data, isLoading } = usePartners({
    page,
    limit: 15,
    search: search || undefined,
    status: (status as Partner["status"]) || undefined,
    subType: (subType as "VEHICLE_OWNER" | "VENDOR") || undefined,
  });

  const suspendMutation = useSuspendPartner();

  // ── Handlers ──────────────────────────────────────────
  const handleSearch = useCallback((v: string) => {
    setSearch(v);
    setPage(1);
  }, []);

  const handleStatusChange = useCallback((v: string) => {
    setStatus(v);
    setPage(1);
  }, []);

  const handleSubTypeChange = useCallback((v: string) => {
    setSubType(v);
    setPage(1);
  }, []);

  const handleSuspendConfirm = async (formData: SuspendPartnerPayload) => {
    if (!suspendTarget) return;
    await suspendMutation.mutateAsync({
      id: suspendTarget.id,
      payload: formData,
    });
    setSuspendTarget(null);
  };

  const handleBlockConfirm = async (reason: string) => {
    if (!blockTarget) return;
    try {
      await partnersApi.block(blockTarget.id, reason);
      qc.invalidateQueries({ queryKey: ["partners"] });
      toast.success("Partner blocked");
      setBlockTarget(null);
    } catch {
      toast.error("Failed to block partner");
    }
  };

  const handleUnsuspendConfirm = async () => {
    if (!unsuspendTarget) return;
    try {
      await partnersApi.unsuspend(unsuspendTarget.id);
      qc.invalidateQueries({ queryKey: ["partners"] });
      toast.success("Partner unsuspended");
      setUnsuspendTarget(null);
    } catch {
      toast.error("Failed to unsuspend partner");
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const allData = await partnersApi.getAll({
        search: search || undefined,
        status: (status as Partner["status"]) || undefined,
        subType: (subType as "VEHICLE_OWNER" | "VENDOR") || undefined,
        limit: 1000,
      });
      const rows = allData.items.map((p) => [
        p.name,
        p.mobile,
        p.email ?? "",
        p.partnerProfile?.subType ?? "",
        p.status,
        p.kycRecord?.status ?? "",
        p.walletBalance,
        new Date(p.createdAt).toLocaleDateString("en-IN"),
      ]);
      const header = ["Name", "Mobile", "Email", "Type", "Status", "KYC", "Wallet", "Joined"];
      const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `quickcab-partners-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("CSV exported");
    } catch {
      toast.error("Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  const partners = data?.items ?? [];
  const pagination = data?.pagination;

  // Derived stats from current page data
  const statsData = {
    total: pagination?.total ?? 0,
    active: partners.filter((p) => p.status === "ACTIVE").length,
    pendingKyc: partners.filter((p) =>
      ["KYC_PENDING", "KYC_IN_PROGRESS"].includes(p.status)
    ).length,
    suspended: partners.filter((p) => p.status === "SUSPENDED").length,
  };

  return (
    <div className="space-y-6 max-w-[1600px]">
      {/* ── Page Header ─────────────────────────────────── */}
      <motion.div
        custom={0}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
      >
        <PageHeader
          title="Partners"
          subtitle="Manage all Vehicle Owners and Vendors on the platform"
        />
      </motion.div>

      {/* ── Stat Cards ──────────────────────────────────── */}
      <motion.div
        custom={1}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard
          index={0}
          label="Total Partners"
          value={(pagination?.total ?? 0).toLocaleString("en-IN")}
          icon={<Users size={16} />}
          accentColor="purple"
        />
        <StatCard
          index={1}
          label="Active"
          value={statsData.active}
          icon={<UserCheck size={16} />}
          accentColor="green"
          trend="neutral"
          subtext="on current page"
        />
        <StatCard
          index={2}
          label="KYC Pending"
          value={statsData.pendingKyc}
          icon={<Clock size={16} />}
          accentColor={statsData.pendingKyc > 5 ? "orange" : "purple"}
        />
        <StatCard
          index={3}
          label="Suspended"
          value={statsData.suspended}
          icon={<UserX size={16} />}
          accentColor="red"
        />
      </motion.div>

      {/* ── Filters + Table ──────────────────────────────── */}
      <motion.div
        custom={2}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        <PartnerFilters
          search={search}
          onSearchChange={handleSearch}
          status={status}
          onStatusChange={handleStatusChange}
          subType={subType}
          onSubTypeChange={handleSubTypeChange}
          onExport={handleExport}
          isExporting={isExporting}
        />

        <PartnerTable
          partners={partners}
          isLoading={isLoading}
          page={page}
          totalPages={pagination?.totalPages ?? 1}
          total={pagination?.total ?? 0}
          limit={15}
          onPageChange={setPage}
          onSuspend={setSuspendTarget}
          onBlock={setBlockTarget}
          onUnsuspend={setUnsuspendTarget}
        />
      </motion.div>

      {/* ── Modals ──────────────────────────────────────── */}
      <SuspendModal
        isOpen={!!suspendTarget}
        onClose={() => setSuspendTarget(null)}
        onConfirm={handleSuspendConfirm}
        partner={suspendTarget}
        loading={suspendMutation.isPending}
      />

      <BlockModal
        isOpen={!!blockTarget}
        onClose={() => setBlockTarget(null)}
        onConfirm={handleBlockConfirm}
        partner={blockTarget}
      />

      <ConfirmModal
        isOpen={!!unsuspendTarget}
        onClose={() => setUnsuspendTarget(null)}
        onConfirm={handleUnsuspendConfirm}
        title={`Unsuspend ${unsuspendTarget?.name}?`}
        description="This partner will be able to access the app again immediately."
        confirmLabel="Yes, Unsuspend"
        variant="warning"
      />
    </div>
  );
}
