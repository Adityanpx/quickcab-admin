"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Shield, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { authApi, getDebugLog, clearDebugLog } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

// ─── Animation Variants ───────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 32, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5 },
  },
};

// ─── Dev Debug Panel ──────────────────────────────────────
function DebugPanel() {
  const [logs, setLogs] = useState<{ label: string; data: unknown; ts: string }[]>([]);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const stored = getDebugLog();
    if (stored.length) setLogs(stored);
  }, []);

  if (logs.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 w-[420px] max-h-[60vh] z-50 rounded-xl border border-yellow-400/40 bg-[#1a1a1a] text-xs font-mono shadow-2xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-yellow-400/10 border-b border-yellow-400/20 shrink-0">
        <span className="text-yellow-400 font-bold tracking-wide">🐛 DEBUG LOG</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { clearDebugLog(); setLogs([]); }}
            className="text-yellow-400/60 hover:text-yellow-400 transition-colors"
            title="Clear logs"
          >
            <Trash2 size={13} />
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            className="text-yellow-400/60 hover:text-yellow-400 transition-colors"
          >
            {open ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
          </button>
        </div>
      </div>

      {/* Entries */}
      {open && (
        <div className="overflow-y-auto flex-1 p-2 space-y-1.5">
          {logs.map((log, i) => (
            <div key={i} className="rounded-lg bg-white/5 border border-white/10 p-2">
              <div className="flex items-center justify-between mb-1">
                <span className={cn(
                  "font-bold text-[11px]",
                  log.label.includes("error") ? "text-red-400" :
                  log.label.includes("success") ? "text-green-400" : "text-yellow-300"
                )}>
                  {log.label}
                </span>
                <span className="text-white/30 text-[10px]">
                  {new Date(log.ts).toLocaleTimeString()}
                </span>
              </div>
              <pre className="text-white/70 text-[10px] leading-relaxed overflow-x-auto whitespace-pre-wrap break-all">
                {JSON.stringify(log.data, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter();
  const setAdmin = useAuthStore((s) => s.setAdmin);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [debugKey, setDebugKey] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const result = await authApi.login(data);
      setAdmin(result.admin);
      toast.success(`Welcome back, ${result.admin.name}!`);
      router.push("/");
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { status?: number; data?: { message?: string; error?: string } };
        message?: string;
        code?: string;
      };
      const message =
        axiosErr?.response?.data?.message ??
        axiosErr?.response?.data?.error ??
        axiosErr?.message ??
        "Invalid credentials";
      setError("root", { message });
      toast.error(message);
      // Refresh debug panel to show new entries written by auth.ts
      setDebugKey((k) => k + 1);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(94,92,230,0.12) 0%, transparent 70%)",
          }}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
          className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(2,230,66,0.06) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-[420px] relative z-10"
      >
        {/* Logo */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center mb-8"
        >
          <motion.div variants={itemVariants} className="flex items-center justify-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-brand-purple flex items-center justify-center shadow-purple-glow">
              <span className="text-white text-lg">🚕</span>
            </div>
            <span className="text-2xl font-bold text-light-text dark:text-dark-text tracking-tight">
              QuickCab
            </span>
          </motion.div>
          <motion.h1
            variants={itemVariants}
            className="text-2xl font-semibold text-light-text dark:text-dark-text mb-2"
          >
            Welcome back
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="text-light-text-2 dark:text-dark-text-2 text-sm"
          >
            Sign in to your SuperAdmin dashboard
          </motion.p>
        </motion.div>

        {/* Card */}
        <div className="card shadow-card dark:shadow-card-dark">
          {/* Admin badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-2 mb-6 px-3 py-2 rounded-lg bg-brand-purple-muted dark:bg-brand-purple-muted-dark w-fit"
          >
            <Shield size={14} className="text-brand-purple" />
            <span className="text-xs font-medium text-brand-purple">
              SuperAdmin Access
            </span>
          </motion.div>

          <motion.form
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >
            {/* Email */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">
                Email address
              </label>
              <input
                {...register("email")}
                type="email"
                autoComplete="email"
                autoFocus
                placeholder="admin@quickcab.in"
                className={cn(
                  "input-base",
                  errors.email && "border-brand-red"
                )}
              />
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-brand-red mt-1.5"
                >
                  {errors.email.message}
                </motion.p>
              )}
            </motion.div>

            {/* Password */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={cn(
                    "input-base pr-12",
                    errors.password && "border-brand-red"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-light-text-3 dark:text-dark-text-3 hover:text-light-text dark:hover:text-dark-text transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-brand-red mt-1.5"
                >
                  {errors.password.message}
                </motion.p>
              )}
            </motion.div>

            {/* Root error */}
            {errors.root && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-3 py-2.5 rounded-lg bg-brand-red-muted border border-brand-red/20 text-sm text-brand-red"
              >
                {errors.root.message}
              </motion.div>
            )}

            {/* Submit */}
            <motion.div variants={itemVariants} className="pt-1">
              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "w-full flex items-center justify-center gap-2",
                  "bg-brand-purple hover:bg-brand-purple-dark",
                  "text-white font-medium text-sm",
                  "rounded-xl px-4 py-3",
                  "transition-all duration-200",
                  "disabled:opacity-60 disabled:cursor-not-allowed",
                  "active:scale-[0.98]",
                  "shadow-purple-glow"
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in to Dashboard"
                )}
              </button>
            </motion.div>
          </motion.form>
        </div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-xs text-light-text-3 dark:text-dark-text-3 mt-6"
        >
          QuickCab SuperAdmin Panel — Restricted Access
        </motion.p>
      </motion.div>

      {/* On-screen debug panel — dev only, survives reloads via sessionStorage */}
      <DebugPanel key={debugKey} />
    </div>
  );
}
