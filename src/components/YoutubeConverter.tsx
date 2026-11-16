"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Youtube, Sparkles, Loader2, ArrowRight, Video, AlertCircle } from "lucide-react";
import { saveCustomRecipe } from "@/utils/recipeStore";

export default function YoutubeConverter() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const sampleUrl = "https://www.youtube.com/watch?v=k0u5XRXUxjg";

  const handleConvert = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isLoading) return;

    const targetUrl = url.trim();
    if (!targetUrl) {
      setErrorMsg("유튜브 URL을 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setLoadingText("AI가 영상 정보와 자막을 분석하고 있습니다...");

    try {
      const res = await fetch("/api/convert-youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "레시피 변환에 실패했습니다.");
      }

      setLoadingText(`'${data.recipe.title}' 맞춤형 핸즈프리 가이드 생성 완료!`);

      // Save to client store so recipe detail & cook page load it immediately
      saveCustomRecipe(data.recipe);

      // Short delay for user to read success message
      setTimeout(() => {
        router.push(`/recipe/${data.recipe.id}`);
      }, 700);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "변환 중 문제가 발생했습니다.");
      setIsLoading(false);
    }
  };

  const handleApplySample = (sample: string) => {
    setUrl(sample);
    setErrorMsg(null);
  };

  return (
    <div className="bg-gradient-to-br from-orange-50 via-amber-50/60 to-white p-4.5 rounded-3xl border border-orange-100 shadow-sm relative overflow-hidden">
      {/* Decorative background circle */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-200/30 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center shadow-sm">
          <Youtube className="w-4 h-4 fill-current" />
        </div>
        <h3 className="font-bold text-sm text-stone-900 flex items-center gap-1.5">
          <span>유튜브 레시피 AI 실시간 변환기</span>
          <span className="text-[11px] font-semibold text-orange-600 bg-orange-100/80 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
            <Sparkles className="w-3 h-3" /> 실시간 분석
          </span>
        </h3>
      </div>

      <p className="text-xs text-stone-600 mb-3 leading-relaxed">
        보고 계신 요리 유튜브 영상 링크를 붙여넣으면, AI가 영상 정보와 조리 단계를 분석해 핸즈프리 레시피를 즉시 생성합니다!
      </p>

      {isLoading ? (
        <div className="py-6 px-4 bg-white/95 backdrop-blur rounded-2xl border border-orange-200 flex flex-col items-center justify-center text-center space-y-3">
          <div className="relative">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            <Sparkles className="w-4 h-4 text-amber-500 absolute -top-1 -right-1 animate-bounce" />
          </div>
          <div>
            <p className="text-sm font-bold text-stone-900">{loadingText}</p>
            <p className="text-xs text-stone-500 mt-1">
              음성 낭독 및 타이머 구간 자동 추출 중...
            </p>
          </div>
          <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden mt-1">
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full animate-pulse w-4/5 transition-all duration-1000" />
          </div>
        </div>
      ) : (
        <form onSubmit={handleConvert} className="space-y-2.5">
          <div className="relative flex items-center">
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="예: https://www.youtube.com/watch?v=k0u5XRXUxjg"
              className="w-full pl-3.5 pr-24 py-3 bg-white text-xs text-stone-800 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder:text-stone-400 shadow-sm"
            />
            <button
              type="submit"
              className="absolute right-1.5 px-3.5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-lg text-xs font-bold shadow-sm flex items-center gap-1 active:scale-95 transition-transform"
            >
              <span>변환</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium px-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-stone-500 pt-0.5 gap-1.5">
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-stone-400">예시 링크:</span>
              <button
                type="button"
                onClick={() => handleApplySample(sampleUrl)}
                className="text-orange-600 hover:text-orange-700 font-semibold underline underline-offset-2 flex items-center gap-0.5"
              >
                <Video className="w-3 h-3" />
                고구마 호떡 (k0u5XRXUxjg)
              </button>
            </div>
            <span>* 모든 유튜브 영상 URL 지원</span>
          </div>
        </form>
      )}
    </div>
  );
}
