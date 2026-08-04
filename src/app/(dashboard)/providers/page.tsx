"use client";

import { Suspense, useState, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { Wrench, UserCheck, UserX, Clock } from "lucide-react";
import { useProviderCities, useSuspendProvider } from "@/lib/hooks/useProviders";
import { providersApi } from "@/lib/api/providers";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ProviderFilters } from "@/components/providers/ProviderFilters";
import { ProviderTable } from "@/components/providers/ProviderTable";
import { SuspendModal } from "@/components/partners/SuspendModal";
import { BlockModal } from "@/components/partners/BlockModal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { StatCard } from "@/components/ui/StatCard";
import { PageHeader } from "@/components/ui/PageHeader";
import type { Provider, ServiceProviderCategory } from "@/types/provider";
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
  if (preset === "week")  { const d = new Date(start); d.setDate(d.getDate() - 7);         return { dateFrom: d.toISOString() }; }
  if (preset === "month") { const d = new Date(start); d.setMonth(d.getMonth() - 1);       return { dateFrom: d.toISOString() }; }
  if (preset === "year")  { const d = new Date(start); d.setFullYear(d.getFullYear() - 1); return { dateFrom: d.toISOString() }; }
  return {};
}

// SuspendModal/BlockModal read only `.name` off this prop. Rather than
// restructure two live partner components, hand them the provider under the
// prop type they expect.
const asPartnerProp = (p: Provider | null) => p as unknown as Partner | null;

function ProvidersPageContent() {
  const router = useRouter();
  const qc = useQueryClient();
  const searchParams = useSearchParams();

  // ── URL-driven filter state ──────────────────────────────────────────────
  const page       = Number(searchParams.get("page")       ?? "1");
  const search     = searchParams.get("search")     ?? "";
  const status     = searchParams.get("status")     ?? "";
  const kycStatus  = searchParams.get("kycStatus")  ?? "";
  const category   = searchParams.get("category")   ?? "";
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
  const [suspendTarget,   setSuspendTarget]   = useState<Provider | null>(null);
  const [blockTarget,     setBlockTarget]     = useState<Provider | null>(null);
  const [unsuspendTarget, setUnsuspendTarget] = useState<Provider | null>(null);
  const [isUnsuspending,  setIsUnsuspending]  = useState(false);
  const [isBlocking,      setIsBlocking]      = useState(false);

  // ── Data ─────────────────────────────────────────────────────────────────
  const { data: citiesData } = useProviderCities();
  const cities = citiesData ?? [];

  const { data, isLoading } = useQuery({
    queryKey: ["providers", { page, search, status, kycStatus, category, city, datePreset }],
    queryFn: () =>
      providersApi.getAll({
        page,
        limit: 15,
        search: search || undefined,
        status: (status as Provider["status"]) || undefined,
        kycStatus: (kycStatus as "NOT_SUBMITTED" | "IN_PROGRESS" | "PENDING" | "APPROVED" | "REJECTED") || undefined,
        category: (category as ServiceProviderCategory) || undefined,
        city: city || undefined,
        ...getDateRange(datePreset),
      }),
  });

  // ── Real global stat counts via 3 lightweight queries ───────────────────
  const { data: activeData }    = useQuery({ queryKey: ["providers-count", "ACTIVE"],      queryFn: () => providersApi.getAll({ status: "ACTIVE",      limit: 1 }), staleTime: 60_000 });
  const { data: kycData }       = useQuery({ queryKey: ["providers-count", "KYC_PENDING"], queryFn: () => providersApi.getAll({ status: "KYC_PENDING", limit: 1 }), staleTime: 60_000 });
  const { data: suspendedData } = useQuery({ queryKey: ["providers-count", "SUSPENDED"],   queryFn: () => providersApi.getAll({ status: "SUSPENDED",   limit: 1 }), staleTime: 60_000 });

  const activeTotal    = activeData?.pagination?.total    ?? 0;
  const kycTotal       = kycData?.pagination?.total       ?? 0;
  const suspendedTotal = suspendedData?.pagination?.total ?? 0;

  const suspendMutation = useSuspendProvider();

  // ── Search handler with guard to prevent mount-reset ────────────────────
  const handleSearch = useCallback((v: string) => {
    if (v === (searchParamsRef.current.get("search") ?? "")) return;
    updateParams({ search: v, page: "1" });
  }, [updateParams]);

  const handleStatusChange   = useCallback((v: string) => updateParams({ status: v,   page: "1" }), [updateParams]);
  const handleKycStatusChange = useCallback((v: string) => updateParams({ kycStatus: v, page: "1" }), [updateParams]);
  const handleCategoryChange = useCallback((v: string) => updateParams({ category: v, page: "1" }), [updateParams]);
  const handleCityChange     = useCallback((v: string) => updateParams({ city: v,     page: "1" }), [updateParams]);
  const handleClearFilters   = useCallback(() => updateParams({ status: "", kycStatus: "", category: "", city: "", datePreset: "", search: "", page: "1" }), [updateParams]);

  const handleSuspendConfirm = async (formData: SuspendPartnerPayload) => {
    if (!suspendTarget) return;
    await suspendMutation.mutateAsync({ id: suspendTarget.id, payload: formData });
    setSuspendTarget(null);
  };

  const handleUnblock = async (provider: Provider) => {
    try {
      await providersApi.unblock(provider.id);
      toast.success(`${provider.name} has been unblocked successfully`);
      qc.invalidateQueries({ queryKey: ["providers"] });
    } catch {
      toast.error("Failed to unblock provider. Please try again.");
    }
  };

  const handleBlockConfirm = async (reason: string) => {
    if (!blockTarget) return;
    setIsBlocking(true);
    try {
      await providersApi.block(blockTarget.id, reason);
      qc.invalidateQueries({ queryKey: ["providers"] });
      toast.success(`${blockTarget.name} has been blocked permanently`);
      setBlockTarget(null);
    } catch {
      toast.error("Failed to block provider. Please try again.");
    } finally {
      setIsBlocking(false);
    }
  };

  const handleUnsuspendConfirm = async () => {
    if (!unsuspendTarget) return;
    setIsUnsuspending(true);
    try {
      await providersApi.unsuspend(unsuspendTarget.id);
      qc.invalidateQueries({ queryKey: ["providers"] });
      toast.success(`${unsuspendTarget.name} has been unsuspended successfully`);
      setUnsuspendTarget(null);
    } catch {
      toast.error("Failed to unsuspend provider. Please try again.");
    } finally {
      setIsUnsuspending(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // The server hard-caps `limit` at 100 per request, so a single call
      // can never return more than 100 rows. Paginate and stitch together.
      const baseFilters = {
        search: search || undefined,
        status: (status as Provider["status"]) || undefined,
        kycStatus: (kycStatus as "NOT_SUBMITTED" | "IN_PROGRESS" | "PENDING" | "APPROVED" | "REJECTED") || undefined,
        category: (category as ServiceProviderCategory) || undefined,
        city: city || undefined,
        ...getDateRange(datePreset),
      };

      const PAGE_SIZE = 100;
      const SAFETY_MAX_PAGES = 200; // 20,000-row ceiling, avoids a runaway loop

      const first = await providersApi.getAll({ ...baseFilters, page: 1, limit: PAGE_SIZE });
      let allItems = [...first.items];
      const total = first.pagination?.total ?? allItems.length;
      const totalPages = Math.min(first.pagination?.totalPages ?? 1, SAFETY_MAX_PAGES);

      for (let p = 2; p <= totalPages; p++) {
        const next = await providersApi.getAll({ ...baseFilters, page: p, limit: PAGE_SIZE });
        allItems = allItems.concat(next.items);
      }

      const rows = allItems.map((p) => [
        p.name,
        p.mobile,
        p.providerProfile?.email ?? "",
        p.providerProfile?.category ?? "",
        p.status,
        p.kycRecord?.status ?? "Not Submitted",
        p.walletBalance,
        new Date(p.createdAt).toLocaleDateString("en-IN"),
      ]);
      const header = ["Name", "Mobile", "Email", "Category", "Status", "KYC Status", "Wallet (₹)", "Joined"];
      const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `quickcab-providers-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      if (allItems.length < total) {
        toast.error(`Exported ${allItems.length} of ${total} — hit the safety page cap. Narrow your filters and export again for the rest.`);
      } else {
        toast.success(`CSV exported — ${allItems.length} provider${allItems.length === 1 ? "" : "s"}`);
      }
    } catch {
      toast.error("Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  const providers  = data?.items ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6 max-w-[1600px]">
      {/* ── Page Header ─────────────────────────────────── */}
      <motion.div custom={0} variants={sectionVariants} initial="hidden" animate="visible">
        <PageHeader
          title="Service Providers"
          subtitle="Manage all Drivers, Mechanics, and other service providers on the platform"
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
          label="Total Providers"
          value={(pagination?.total ?? 0).toLocaleString("en-IN")}
          icon={<Wrench size={16} />}
          accentColor="purple"
          onClick={() => updateParams({ status: "", kycStatus: "", category: "", city: "", datePreset: "", page: "1" })}
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
        <ProviderFilters
          search={search}
          onSearchChange={handleSearch}
          status={status}
          onStatusChange={handleStatusChange}
          kycStatus={kycStatus}
          onKycStatusChange={handleKycStatusChange}
          category={category}
          onCategoryChange={handleCategoryChange}
          city={city}
          onCityChange={handleCityChange}
          cities={cities}
          onClearFilters={handleClearFilters}
          onExport={handleExport}
          isExporting={isExporting}
        />

        <ProviderTable
          providers={providers}
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
        partner={asPartnerProp(suspendTarget)}
        loading={suspendMutation.isPending}
      />

      <BlockModal
        isOpen={!!blockTarget}
        onClose={() => setBlockTarget(null)}
        onConfirm={handleBlockConfirm}
        partner={asPartnerProp(blockTarget)}
        loading={isBlocking}
      />

      <ConfirmModal
        isOpen={!!unsuspendTarget}
        onClose={() => setUnsuspendTarget(null)}
        onConfirm={handleUnsuspendConfirm}
        title={`Unsuspend ${unsuspendTarget?.name}?`}
        description="This provider will be able to access the app again immediately."
        confirmLabel="Yes, Unsuspend"
        variant="warning"
        loading={isUnsuspending}
      />
    </div>
  );
}

export default function ProvidersPage() {
  return (
    <Suspense fallback={null}>
      <ProvidersPageContent />
    </Suspense>
  );
}
