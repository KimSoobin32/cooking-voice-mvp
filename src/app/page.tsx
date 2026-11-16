"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import YoutubeConverter from "@/components/YoutubeConverter";
import RecipeCard from "@/components/RecipeCard";
import recipesData from "@/data/recipes.json";
import { Recipe } from "@/types/recipe";
import { getAllRecipes } from "@/utils/recipeStore";
import { Sparkles, Mic, Smartphone, Volume2, ShieldCheck } from "lucide-react";

export default function HomePage() {
  const [recipes, setRecipes] = useState<Recipe[]>(recipesData as Recipe[]);

  useEffect(() => {
    // Merge custom converted recipes from localStorage
    const all = getAllRecipes();
    setRecipes(all);
  }, []);

  const customRecipes = recipes.filter((r) => r.id.startsWith("yt-"));
  const defaultList = recipes.filter((r) => !r.id.startsWith("yt-"));

  return (
    <div className="flex flex-col min-h-screen bg-stone-50 pb-12">
      {/* 1. Header */}
      <Header />

      <div className="p-4 space-y-5 flex-1 overflow-y-auto no-scrollbar">
        {/* 2. YouTube AI Recipe Converter */}
        <section>
          <YoutubeConverter />
        </section>

        {/* 3. Hands-free Quick Guide Banner */}
        <section className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            <span>쿠킹보이스 핸즈프리 꿀팁 3가지</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-orange-50/70 p-2 rounded-xl border border-orange-100 flex flex-col items-center">
              <Volume2 className="w-4 h-4 text-orange-600 mb-1" />
              <span className="text-[11px] font-bold text-stone-900">TTS 자동 낭독</span>
              <span className="text-[9px] text-stone-500">단계마다 읽어줌</span>
            </div>
            <div className="bg-orange-50/70 p-2 rounded-xl border border-orange-100 flex flex-col items-center">
              <Mic className="w-4 h-4 text-orange-600 mb-1" />
              <span className="text-[11px] font-bold text-stone-900">"다음" / "타이머"</span>
              <span className="text-[9px] text-stone-500">음성 명령 제어</span>
            </div>
            <div className="bg-orange-50/70 p-2 rounded-xl border border-orange-100 flex flex-col items-center">
              <Smartphone className="w-4 h-4 text-orange-600 mb-1" />
              <span className="text-[11px] font-bold text-stone-900">폰 톡톡 흔들기</span>
              <span className="text-[9px] text-stone-500">터치리스 제스처</span>
            </div>
          </div>
        </section>

        {/* 4. Converted YouTube Recipes (if any) */}
        {customRecipes.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div>
                <h2 className="font-extrabold text-base text-stone-900 flex items-center gap-1.5">
                  <span>✨ 방금 변환한 유튜브 레시피</span>
                  <span className="text-xs font-semibold text-orange-600">
                    ({customRecipes.length})
                  </span>
                </h2>
                <p className="text-xs text-stone-500">
                  내가 입력한 유튜브 영상에서 추출한 핸즈프리 가이드
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {customRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          </section>
        )}

        {/* 5. Recommended Beginner Recipes */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="font-extrabold text-base text-stone-900 flex items-center gap-1.5">
                <span>🍳 추천 자취 레시피</span>
                <span className="text-xs font-semibold text-orange-600">BEST 3</span>
              </h2>
              <p className="text-xs text-stone-500">
                실패 없는 초보 맞춤형 황금 비율 레시피
              </p>
            </div>
            <span className="text-[11px] font-semibold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
              모두 초보 난이도
            </span>
          </div>

          <div className="space-y-2.5">
            {defaultList.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </section>

        {/* 6. Safe Cooking Notice */}
        <section className="p-3 bg-stone-100/80 rounded-2xl flex items-start gap-2 text-stone-500 text-[11px] leading-relaxed">
          <ShieldCheck className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
          <span>
            스마트폰 화면 꺼짐 방지(Screen Wake Lock)와 에코 방지 필터가 자동 적용되어 요리 중 화면 터치가 전혀 필요 없습니다.
          </span>
        </section>
      </div>
    </div>
  );
}
