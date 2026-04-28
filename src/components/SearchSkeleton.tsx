"use client";
import { motion } from "framer-motion";

function Pulse({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-white/[0.07] ${className ?? ""}`} />;
}

function FlightCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3">
          <Pulse className="h-8 w-8 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Pulse className="h-3.5 w-32" />
            <Pulse className="h-3 w-24" />
          </div>
        </div>
        <div className="space-y-2 text-right">
          <Pulse className="h-5 w-20 ml-auto" />
          <Pulse className="h-3 w-14 ml-auto" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <Pulse className="h-3 w-16" />
        <Pulse className="h-3 w-16" />
        <Pulse className="ml-auto h-8 w-24 rounded-full" />
      </div>
    </div>
  );
}

function HotelCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
      <Pulse className="h-36 w-full rounded-none" />
      <div className="p-5 space-y-3">
        <Pulse className="h-4 w-3/4" />
        <Pulse className="h-3 w-1/2" />
        <div className="flex items-center justify-between pt-2">
          <Pulse className="h-5 w-24" />
          <Pulse className="h-8 w-24 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function SearchSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="mx-auto max-w-6xl px-6 pb-20"
    >
      {/* Tabs */}
      <div className="mb-6 flex gap-2">
        <Pulse className="h-9 w-28 rounded-full" />
        <Pulse className="h-9 w-28 rounded-full" />
      </div>

      {/* Flight skeletons */}
      <div className="mb-10">
        <Pulse className="mb-4 h-4 w-32" />
        <div className="space-y-3">
          {[0, 1, 2].map((i) => <FlightCardSkeleton key={i} />)}
        </div>
      </div>

      {/* Hotel skeletons */}
      <div>
        <Pulse className="mb-4 h-4 w-32" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => <HotelCardSkeleton key={i} />)}
        </div>
      </div>
    </motion.div>
  );
}
