"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Recipe } from "@/types/recipe";
import { playSuccessChime } from "@/utils/sound";
import confetti from "canvas-confetti";
import {
  Trophy,
  Award,
  Sparkles,
  Camera,
  Image as ImageIcon,
  CheckCircle,
  Home,
  Heart,
  Share2
} from "lucide-react";

interface CookingCompleteModalProps {
  recipe: Recipe;
  onClose: () => void;
}

export default function CookingCompleteModal({
  recipe,
  onClose,
}: CookingCompleteModalProps) {
  const router = useRouter();
  const [memo, setMemo] = useState("정말 쉽고 맛있게 완성했어요! 불맛 제대로!");
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80"
  );
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Fire confetti celebration & sound
    playSuccessChime();
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#f97316", "#fbbf24", "#34d399", "#60a5fa"],
      });
    } catch {
      // ignore
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAndGoHome = () => {
    setSaved(true);
    setTimeout(() => {
      router.push("/");
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-[420px] bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar space-y-4">
        {/* Header Celebration */}
        <div className="text-center space-y-2 pt-2">
          <div className="inline-flex p-3.5 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-3xl text-white shadow-lg shadow-orange-500/30 animate-bounce">
            <Trophy className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-stone-900 tracking-tight">
            요리 완성! 축하해요 🎉
          </h2>
          <p className="text-xs text-stone-500">
            손에 물 한 방울 묻히지 않고 핸즈프리로 완벽하게 해냈어요!
          </p>
        </div>

        {/* Acquired Badge Card */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-white border border-amber-300 flex items-center justify-center text-2xl shadow-sm shrink-0">
            🍳
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500 text-white">
                NEW BADGE
              </span>
              <span className="text-xs font-bold text-amber-800">
                첫 집밥 마스터 배지 획득!
              </span>
            </div>
            <p className="text-[11px] text-stone-600 mt-0.5 truncate">
              {recipe.title} 조리 성공
            </p>
          </div>
        </div>

        {/* One-Touch Diary & Photo Section */}
        <div className="space-y-3 pt-1">
          <label className="block text-xs font-bold text-stone-800">
            📸 완성 인증샷 기록
          </label>

          {/* Photo Preview / Upload */}
          <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-stone-200 bg-stone-50 aspect-video flex flex-col items-center justify-center group">
            {selectedPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selectedPhoto}
                alt="완성 요리"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-4">
                <Camera className="w-7 h-7 text-stone-400 mx-auto mb-1" />
                <span className="text-xs text-stone-500 font-medium">
                  사진 촬영 또는 갤러리 선택
                </span>
              </div>
            )}

            <label className="absolute bottom-2.5 right-2.5 px-3 py-1.5 bg-black/70 hover:bg-black/90 text-white rounded-xl text-xs font-semibold cursor-pointer backdrop-blur flex items-center gap-1.5 transition-colors">
              <Camera className="w-3.5 h-3.5" />
              <span>사진 바꾸기</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Sample quick photos */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[11px] text-stone-400">샘플:</span>
            <button
              type="button"
              onClick={() =>
                setSelectedPhoto(
                  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80"
                )
              }
              className="text-[11px] font-medium text-orange-600 underline"
            >
              맛있는 김치볶음밥
            </button>
            <button
              type="button"
              onClick={() =>
                setSelectedPhoto(
                  "https://images.unsplash.com/photo-1621996346565-e3d5d6281691?auto=format&fit=crop&w=600&q=80"
                )
              }
              className="text-[11px] font-medium text-orange-600 underline"
            >
              알리오올리오 파스타
            </button>
          </div>

          {/* Memo Input */}
          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1">
              📝 자취 셰프의 한 줄 메모
            </label>
            <textarea
              rows={2}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="오늘 요리의 소감이나 간 맞춤 팁을 남겨보세요!"
              className="w-full p-3 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-stone-800"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-2 space-y-2">
          <button
            onClick={handleSaveAndGoHome}
            disabled={saved}
            className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-[0.98] text-white rounded-2xl font-bold text-sm shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 transition-all"
          >
            {saved ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>저장 완료! 홈으로 이동 중...</span>
              </>
            ) : (
              <>
                <Home className="w-4 h-4" />
                <span>기록 저장하고 홈으로 돌아가기</span>
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 text-stone-400 hover:text-stone-600 text-xs font-semibold"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
