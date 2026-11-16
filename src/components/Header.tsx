"use client";

import React from "react";
import Link from "next/link";
import { ChefHat, Sparkles, Mic } from "lucide-react";

export default function Header() {
  return (
    <header className="px-5 pt-6 pb-4 bg-white border-b border-stone-100 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-stone-900">
                손안의 셰프
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-600 border border-orange-200">
                AI 쿠킹보이스
              </span>
            </div>
            <p className="text-xs text-stone-500 font-medium">
              양손에 양념 묻어도 음성 & 톡톡 제스처로 완성
            </p>
          </div>
        </Link>
        <div className="flex items-center gap-1 bg-stone-50 px-2.5 py-1.5 rounded-full border border-stone-200 text-stone-600 text-xs font-semibold">
          <Mic className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
          <span>핸즈프리</span>
        </div>
      </div>
    </header>
  );
}
