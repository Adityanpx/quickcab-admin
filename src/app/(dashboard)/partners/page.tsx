"use client";

import { Suspense, useState, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { Users, UserCheck, UserX, Clock } from "lucide-react";
import { usePartnerCities, useSuspendPartner } from "@/lib/hooks/usePartners";
import { partnersApi } from "@/lib/api/partners";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PartnerFilters } from "@/components/partners/PartnerFilters";
import { PartnerTable } from "@/components/partners/PartnerTable";
import { SuspendModal } from "@/components/partners/SuspendModal";
import { BlockModal } from "@/components/partners/BlockModal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { StatCard } from "@/components/ui/StatCard";
import { PageHeader } from "@/components/ui/PageHeader";
import type { Partner, SuspendPartnerPayload } from "@/types/partner";
import toast from "react-hot-toast";

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as any },
  }),
};

function getDateRange(preset: string): { dateFrom?: string; dateTo?: string } {
  if (!preset) return {};
  const now = new Date();
  const start = new Date(now); start.setHours(0, 0, 0, 0);
  if (preset === "today") return { dateFrom: start.toISOString() };
  if (preset === "week")  { const d = new Date(start); d.setDate(d.getDate() - 7);        return { dateFrom: d.toISOString() }; }
  if (preset === "month") { const d = new Date(start); d.setMonth(d.getMonth() - 1);      return { dateFrom: d.toISOString() }; }
  if (preset === "year")  { const d = new Date(start); d.setFullYear(d.getFullYear() - 1); return { dateFrom: d.toISOString() }; }
  return {};
}

function PartnersPageContent() {
  const router = useRouter();
  const qc = useQueryClient();
  const searchParams = useSearchParams();

  // ── URL-driven filter state ──────────────────────────────────────────────
  const page       = Number(searchParams.get("page")       ?? "1");
  const search     = searchParams.get("search")     ?? "";
  const status     = searchParams.get("status")     ?? "";
  const kycStatus  = searchParams.get("kycStatus")  ?? "";
  const subType    = searchParams.get("subType")    ?? "";
  const city       = searchParams.get("city")       ?? "";
  const datePreset = searchParams.get("datePreset") ?? "";

  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;

  const updateParams = useCallback((updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParamsRef.current.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    router.replace(`?${params.toString()}`);
  }, [router]);

  // ── UI-only state ────────────────────────────────────────────────────────
  const [isExporting,     setIsExporting]     = useState(false);
  const [suspendTarget,   setSuspendTarget]   = useState<Partner | null>(null);
  const [blockTarget,     setBlockTarget]     = useState<Partner | null>(null);
  const [unsuspendTarget, setUnsuspendTarget] = useState<Partner | null>(null);
  const [isUnsuspending,  setIsUnsuspending]  = useState(false);
  const [isBlocking,      setIsBlocking]      = useState(false);
  const [isUnblocking,    setIsUnblocking]    = useState(false);

  // ── Data ─────────────────────────────────────────────────────────────────
  const { data: citiesData } = usePartnerCities();
  const cities = citiesData ?? [];

  const { data, isLoading } = useQuery({
    queryKey: ["partners", { page, search, status, kycStatus, subType, city, datePreset }],
    queryFn: () =>
      partnersApi.getAll({
        page,
        limit: 15,
        search: search || undefined,
        status: (status as Partner["status"]) || undefined,
        kycStatus: (kycStatus as "NOT_SUBMITTED" | "IN_PROGRESS" | "PENDING" | "APPROVED" | "REJECTED") || undefined,
        subType: (subType as "VEHICLE_OWNER" | "VENDOR") || undefined,
        city: city || undefined,
        ...getDateRange(datePreset),
      }),
  });

  // ── Real global stat counts via 3 lightweight queries ───────────────────
  const { data: activeData }    = useQuery({ queryKey: ["partners-count", "ACTIVE"],      queryFn: () => partnersApi.getAll({ status: "ACTIVE",      limit: 1 }), staleTime: 60_000 });
  const { data: kycData }       = useQuery({ queryKey: ["partners-count", "KYC_PENDING"], queryFn: () => partnersApi.getAll({ status: "KYC_PENDING", limit: 1 }), staleTime: 60_000 });
  const { data: suspendedData } = useQuery({ queryKey: ["partners-count", "SUSPENDED"],   queryFn: () => partnersApi.getAll({ status: "SUSPENDED",   limit: 1 }), staleTime: 60_000 });

  const activeTotal    = activeData?.pagination?.total    ?? 0;
  const kycTotal       = kycData?.pagination?.total       ?? 0;
  const suspendedTotal = suspendedData?.pagination?.total ?? 0;

  const suspendMutation = useSuspendPartner();

  // ── Search handler with guard to prevent mount-reset ────────────────────
  const handleSearch = useCallback((v: string) => {
    if (v === (searchParamsRef.current.get("search") ?? "")) return;
    updateParams({ search: v, page: "1" });
  }, [updateParams]);

  const handleStatusChange  = useCallback((v: string) => updateParams({ status: v,  page: "1" }), [updateParams]);
  const handleKycStatusChange = useCallback((v: string) => updateParams({ kycStatus: v, page: "1" }), [updateParams]);
  const handleSubTypeChange = useCallback((v: string) => updateParams({ subType: v, page: "1" }), [updateParams]);
  const handleCityChange    = useCallback((v: string) => updateParams({ city: v,    page: "1" }), [updateParams]);

  const handleSuspendConfirm = async (formData: SuspendPartnerPayload) => {
    if (!suspendTarget) return;
    await suspendMutation.mutateAsync({ id: suspendTarget.id, payload: formData });
    setSuspendTarget(null);
  };

  const handleUnblock = async (partner: Partner) => {
    setIsUnblocking(true);
    try {
      await partnersApi.unblock(partner.id);
      toast.success(`${partner.name} has been unblocked successfully`);
      qc.invalidateQueries({ queryKey: ["partners"] });
    } catch {
      toast.error("Failed to unblock partner. Please try again.");
    } finally {
      setIsUnblocking(false);
    }
  };

  const handleBlockConfirm = async (reason: string) => {
    if (!blockTarget) return;
    setIsBlocking(true);
    try {
      await partnersApi.block(blockTarget.id, reason);
      qc.invalidateQueries({ queryKey: ["partners"] });
      toast.success(`${blockTarget.name} has been blocked permanently`);
      setBlockTarget(null);
    } catch {
      toast.error("Failed to block partner. Please try again.");
    } finally {
      setIsBlocking(false);
    }
  };

  const handleUnsuspendConfirm = async () => {
    if (!unsuspendTarget) return;
    setIsUnsuspending(true);
    try {
      await partnersApi.unsuspend(unsuspendTarget.id);
      qc.invalidateQueries({ queryKey: ["partners"] });
      toast.success(`${unsuspendTarget.name} has been unsuspended successfully`);
      setUnsuspendTarget(null);
    } catch {
      toast.error("Failed to unsuspend partner. Please try again.");
    } finally {
      setIsUnsuspending(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // The server hard-caps `limit` at 100 per request (see getPaginationParams),
      // so a single call can never return more than 100 rows regardless of what
      // we ask for. Paginate through every page and stitch results together.
      const baseFilters = {
        search: search || undefined,
        status: (status as Partner["status"]) || undefined,
        kycStatus: (kycStatus as "NOT_SUBMITTED" | "IN_PROGRESS" | "PENDING" | "APPROVED" | "REJECTED") || undefined,
        subType: (subType as "VEHICLE_OWNER" | "VENDOR") || undefined,
        city: city || undefined,
        ...getDateRange(datePreset),
      };

      const PAGE_SIZE = 100;
      const SAFETY_MAX_PAGES = 200; // hard ceiling: 20,000 rows, avoids a runaway loop

      const first = await partnersApi.getAll({ ...baseFilters, page: 1, limit: PAGE_SIZE });
      let allItems = [...first.items];
      const total = first.pagination?.total ?? allItems.length;
      const totalPages = Math.min(
        first.pagination?.totalPages ?? 1,
        SAFETY_MAX_PAGES
      );

      for (let p = 2; p <= totalPages; p++) {
        const next = await partnersApi.getAll({ ...baseFilters, page: p, limit: PAGE_SIZE });
        allItems = allItems.concat(next.items);
      }

      const rows = allItems.map((p) => [
        p.name,
        p.mobile,
        p.email ?? "",
        p.partnerProfile?.subType ?? "",
        p.status,
        p.kycRecord?.status ?? "Not Submitted",
        p.walletBalance,
        new Date(p.createdAt).toLocaleDateString("en-IN"),
      ]);
      const header = ["Name", "Mobile", "Email", "Type", "Status", "KYC Status", "Wallet (₹)", "Joined"];
      const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `quickcab-partners-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      if (allItems.length < total) {
        toast.error(`Exported ${allItems.length} of ${total} — hit the safety page cap. Narrow your filters and export again for the rest.`);
      } else {
        toast.success(`CSV exported — ${allItems.length} partner${allItems.length === 1 ? "" : "s"}`);
      }
    } catch {
      toast.error("Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  const partners   = data?.items ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6 max-w-[1600px]">
      {/* ── Page Header ─────────────────────────────────── */}
      <motion.div custom={0} variants={sectionVariants} initial="hidden" animate="visible">
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
          onClick={() => updateParams({ status: "", kycStatus: "", subType: "", city: "", datePreset: "", page: "1" })}
        />
        <StatCard
          index={1}
          label="Active"
          value={activeTotal.toLocaleString("en-IN")}
          icon={<UserCheck size={16} />}
          accentColor="green"
          onClick={() => updateParams({ status: "ACTIVE", page: "1" })}
        />
        <StatCard
          index={2}
          label="KYC Pending"
          value={kycTotal.toLocaleString("en-IN")}
          icon={<Clock size={16} />}
          accentColor={kycTotal > 5 ? "orange" : "purple"}
          onClick={() => updateParams({ status: "KYC_PENDING", page: "1" })}
        />
        <StatCard
          index={3}
          label="Suspended"
          value={suspendedTotal.toLocaleString("en-IN")}
          icon={<UserX size={16} />}
          accentColor="red"
          onClick={() => updateParams({ status: "SUSPENDED", page: "1" })}
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
          kycStatus={kycStatus}
          onKycStatusChange={handleKycStatusChange}
          subType={subType}
          onSubTypeChange={handleSubTypeChange}
          city={city}
          onCityChange={handleCityChange}
          cities={cities}
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
          onPageChange={(n) => updateParams({ page: String(n) })}
          onSuspend={setSuspendTarget}
          onBlock={setBlockTarget}
          onUnsuspend={setUnsuspendTarget}
          onUnblock={(p) => handleUnblock(p)}
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
        loading={isBlocking}
      />

      <ConfirmModal
        isOpen={!!unsuspendTarget}
        onClose={() => setUnsuspendTarget(null)}
        onConfirm={handleUnsuspendConfirm}
        title={`Unsuspend ${unsuspendTarget?.name}?`}
        description="This partner will be able to access the app again immediately."
        confirmLabel="Yes, Unsuspend"
        variant="warning"
        loading={isUnsuspending}
      />
    </div>
  );
}

export default function PartnersPage() {
  return (
    <Suspense fallback={null}>
      <PartnersPageContent />
    </Suspense>
  );
}
