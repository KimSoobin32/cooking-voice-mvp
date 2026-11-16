"use client";

import React from "react";
import Link from "next/link";
import { Recipe } from "@/types/recipe";
import { Clock, Flame, ChevronRight, Mic } from "lucide-react";

interface RecipeCardProps {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "초보":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "중급":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-rose-50 text-rose-700 border-rose-200";
    }
  };

  return (
    <Link
      href={`/recipe/${recipe.id}`}
      className="group block bg-white rounded-3xl p-4 border border-stone-200/80 shadow-sm hover:shadow-md hover:border-orange-300 transition-all active:scale-[0.98]"
    >
      <div className="flex items-start gap-3.5">
        {/* Emoji or Image Box */}
        <div className="w-16 h-16 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-center text-3xl shadow-inner group-hover:scale-105 transition-transform shrink-0 relative overflow-hidden">
          {recipe.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={recipe.thumbnailUrl}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
          ) : (
            recipe.emoji
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            {recipe.badge && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                {recipe.badge}
              </span>
            )}
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getDifficultyColor(
                recipe.difficulty
              )}`}
            >
              난이도: {recipe.difficulty}
            </span>
          </div>

          <h3 className="font-bold text-base text-stone-900 group-hover:text-orange-600 transition-colors truncate">
            {recipe.title}
          </h3>

          <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">
            {recipe.subtitle}
          </p>

          <div className="flex items-center gap-3 mt-2.5 text-xs text-stone-500 font-medium">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              {recipe.durationMinutes}분
            </span>
            <span className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-stone-400" />
              {recipe.steps.length}단계
            </span>
            <span className="ml-auto text-orange-600 font-bold text-xs flex items-center gap-0.5">
              <Mic className="w-3 h-3" />
              음성가이드
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
