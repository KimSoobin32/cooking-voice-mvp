"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import recipesData from "@/data/recipes.json";
import { Recipe } from "@/types/recipe";
import { getRecipeById } from "@/utils/recipeStore";
import {
  ArrowLeft,
  Clock,
  Flame,
  CheckCircle2,
  Circle,
  Mic,
  Sparkles,
  ChevronRight,
  Info,
  Check,
  RotateCcw
} from "lucide-react";

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const recipeId = params.id as string;

  const allRecipes = recipesData as Recipe[];
  const initialRecipe: Recipe = allRecipes.find((r) => r.id === recipeId) || allRecipes[0];
  const [recipe, setRecipe] = useState<Recipe>(initialRecipe);

  useEffect(() => {
    const loaded = getRecipeById(recipeId);
    if (loaded) {
      setRecipe(loaded);
    }
  }, [recipeId]);

  // Checklist state for ingredients and seasonings
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggleCheck = (name: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const allIngredients = [...recipe.ingredients, ...recipe.seasonings];
  const checkedCount = allIngredients.filter((item) => checkedItems[item.name]).length;
  const isAllChecked = checkedCount === allIngredients.length && allIngredients.length > 0;

  const toggleAll = () => {
    if (isAllChecked) {
      setCheckedItems({});
    } else {
      const all: Record<string, boolean> = {};
      allIngredients.forEach((item) => {
        all[item.name] = true;
      });
      setCheckedItems(all);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-stone-50 pb-28">
      {/* 1. Header with back button */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-stone-200 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => router.push("/")}
          className="p-2 -ml-2 rounded-full hover:bg-stone-100 text-stone-700 active:scale-95 transition-transform"
          aria-label="뒤로가기"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-sm text-stone-800 truncate max-w-[200px]">
          {recipe.title}
        </h1>
        <div className="w-9" /> {/* Spacer */}
      </div>

      <div className="p-4 space-y-5 flex-1 overflow-y-auto no-scrollbar">
        {/* 2. Recipe Hero Card */}
        <section className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs space-y-3">
          {recipe.thumbnailUrl && (
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-2 border border-stone-100 shadow-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={recipe.thumbnailUrl}
                alt={recipe.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 bg-red-600/90 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <span>YouTube 원본</span>
              </div>
            </div>
          )}
          <div className="flex items-start justify-between">
            <span className="text-4xl p-2 bg-orange-50 rounded-2xl border border-orange-100">
              {recipe.emoji}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-orange-100 text-orange-700">
                {recipe.category}
              </span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-stone-100 text-stone-600">
                난이도: {recipe.difficulty}
              </span>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-stone-900 leading-snug">
              {recipe.title}
            </h2>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              {recipe.description}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-stone-100 text-center">
            <div className="bg-stone-50 py-2 rounded-xl">
              <span className="text-[11px] text-stone-400 block">소요 시간</span>
              <span className="text-sm font-bold text-stone-800 flex items-center justify-center gap-0.5 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-orange-500" />
                {recipe.durationMinutes}분
              </span>
            </div>
            <div className="bg-stone-50 py-2 rounded-xl">
              <span className="text-[11px] text-stone-400 block">분량</span>
              <span className="text-sm font-bold text-stone-800 block mt-0.5">
                {recipe.servings}
              </span>
            </div>
            <div className="bg-stone-50 py-2 rounded-xl">
              <span className="text-[11px] text-stone-400 block">열량</span>
              <span className="text-sm font-bold text-stone-800 block mt-0.5">
                {recipe.calories || "약 450 kcal"}
              </span>
            </div>
          </div>
        </section>

        {/* 3. Ingredient Checklist Section */}
        <section className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-stone-900 flex items-center gap-1.5">
                <span>준비할 재료 체크리스트</span>
                <span className="text-xs font-semibold text-orange-600">
                  ({checkedCount}/{allIngredients.length})
                </span>
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                재료를 터치해 준비 상태를 체크하세요
              </p>
            </div>
            <button
              onClick={toggleAll}
              className="text-xs font-bold text-stone-600 hover:text-orange-600 px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-orange-50 transition-colors flex items-center gap-1"
            >
              {isAllChecked ? (
                <>
                  <RotateCcw className="w-3 h-3" />
                  전체 해제
                </>
              ) : (
                <>
                  <Check className="w-3 h-3" />
                  전체 체크
                </>
              )}
            </button>
          </div>

          {/* Main Ingredients */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-stone-500 block px-1">
              기본 식재료
            </span>
            <div className="space-y-1.5">
              {recipe.ingredients.map((item, idx) => {
                const isChecked = !!checkedItems[item.name];
                return (
                  <button
                    key={idx}
                    onClick={() => toggleCheck(item.name)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all active:scale-[0.99] ${
                      isChecked
                        ? "bg-stone-50/80 border-stone-200 text-stone-400"
                        : "bg-white border-stone-200/90 text-stone-800 hover:border-orange-200"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {isChecked ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100 shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-stone-300 shrink-0" />
                      )}
                      <span
                        className={`text-sm font-semibold ${
                          isChecked ? "line-through text-stone-400" : "text-stone-800"
                        }`}
                      >
                        {item.name}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-md ${
                        isChecked
                          ? "bg-stone-200/60 text-stone-400 line-through"
                          : "bg-orange-50 text-orange-700"
                      }`}
                    >
                      {item.amount}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Seasonings */}
          {recipe.seasonings && recipe.seasonings.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <span className="text-xs font-bold text-stone-500 block px-1">
                양념 및 소스
              </span>
              <div className="space-y-1.5">
                {recipe.seasonings.map((item, idx) => {
                  const isChecked = !!checkedItems[item.name];
                  return (
                    <button
                      key={idx}
                      onClick={() => toggleCheck(item.name)}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all active:scale-[0.99] ${
                        isChecked
                          ? "bg-stone-50/80 border-stone-200 text-stone-400"
                          : "bg-white border-stone-200/90 text-stone-800 hover:border-orange-200"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {isChecked ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100 shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-stone-300 shrink-0" />
                        )}
                        <span
                          className={`text-sm font-semibold ${
                            isChecked ? "line-through text-stone-400" : "text-stone-800"
                          }`}
                        >
                          {item.name}
                        </span>
                      </div>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-md ${
                          isChecked
                            ? "bg-stone-200/60 text-stone-400 line-through"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {item.amount}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* 4. Steps Preview */}
        <section className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs space-y-3">
          <h3 className="font-extrabold text-base text-stone-900 flex items-center gap-1.5">
            <span>조리 단계 미리보기</span>
            <span className="text-xs text-stone-400">({recipe.steps.length}단계)</span>
          </h3>
          <div className="space-y-2.5">
            {recipe.steps.map((st) => (
              <div
                key={st.step}
                className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 border border-stone-100 text-xs"
              >
                <span className="w-5 h-5 rounded-full bg-orange-500 text-white font-bold flex items-center justify-center shrink-0 text-[11px] mt-0.5">
                  {st.step}
                </span>
                <div className="flex-1 text-stone-700 leading-relaxed font-medium">
                  {st.text}
                  {st.timerSeconds ? (
                    <span className="inline-block ml-1.5 text-[10px] font-bold text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded">
                      ⏱ {Math.floor(st.timerSeconds / 60)}분 {st.timerSeconds % 60 ? `${st.timerSeconds % 60}초` : ''} 타이머
                    </span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 5. Fixed Bottom CTA Button (Prominent & Eye-Catching) */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto p-4 bg-white/95 backdrop-blur border-t border-stone-200 z-30">
        <button
          onClick={() => router.push(`/recipe/${recipe.id}/cook`)}
          className="w-full py-4 px-6 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-[0.98] text-white rounded-2xl font-black text-base shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2.5 transition-all"
        >
          <Mic className="w-5 h-5 animate-pulse" />
          <span>🎙️ 핸즈프리 요리 시작하기</span>
          <ChevronRight className="w-5 h-5 ml-1" />
        </button>
        <p className="text-center text-[11px] text-stone-400 mt-2">
          요리 중 음성("다음") 또는 폰을 톡톡 흔들어 조작할 수 있습니다
        </p>
      </div>
    </div>
  );
}
