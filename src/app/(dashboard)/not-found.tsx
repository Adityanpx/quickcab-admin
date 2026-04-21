"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function DashboardNotFound() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as any }}
      >
        {/* 404 display */}
        <div className="relative mb-8">
          <p
            className="text-[120px] font-black leading-none select-none"
            style={{
              background:
                "linear-gradient(135deg, #5E5CE6 0%, #312E81 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl">🚕</span>
          </div>
        </div>

        <h2 className="text-xl font-bold text-light-text dark:text-dark-text mb-2">
          Page not found
        </h2>
        <p className="text-sm text-light-text-2 dark:text-dark-text-2 mb-8 max-w-sm">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="flex items-center gap-3 justify-center">
          <Button
            variant="outline"
            size="sm"
            icon={<ArrowLeft size={14} />}
            onClick={() => router.back()}
          >
            Go Back
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Home size={14} />}
            onClick={() => router.push("/")}
          >
            Dashboard
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
