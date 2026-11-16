"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import recipesData from "@/data/recipes.json";
import { Recipe, CookingStep } from "@/types/recipe";
import { getRecipeById } from "@/utils/recipeStore";
import CookingCompleteModal from "@/components/CookingCompleteModal";
import { playBeep } from "@/utils/sound";
import {
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  ChevronLeft,
  ChevronRight,
  X,
  List,
  RotateCcw,
  Play,
  Pause,
  Bell,
  Sparkles,
  Smartphone,
  Shield,
  Lightbulb,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export default function CookingModePage() {
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

  const totalSteps = recipe.steps.length;

  // Step state
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const currentStep: CookingStep = recipe.steps[currentStepIndex] || recipe.steps[0];

  // Speech & Gesture status
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [sttSupported, setSttSupported] = useState(true);
  const [lastVoiceCommand, setLastVoiceCommand] = useState<string | null>(null);
  const [gestureTriggered, setGestureTriggered] = useState(false);
  const [wakeLockActive, setWakeLockActive] = useState(false);

  // Modals
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Timer states
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(currentStep.timerSeconds || 0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isTimerFinished, setIsTimerFinished] = useState(false);

  // Refs for edge cases
  const isSpeakingRef = useRef(false);
  isSpeakingRef.current = isSpeaking;

  const lastStepTransitionTimeRef = useRef(0);
  const wakeLockRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // -------------------------------------------------------------
  // 1. Screen Wake Lock API
  // -------------------------------------------------------------
  useEffect(() => {
    async function requestWakeLock() {
      if ("wakeLock" in navigator) {
        try {
          const lock = await (navigator as any).wakeLock.request("screen");
          wakeLockRef.current = lock;
          setWakeLockActive(true);
          lock.addEventListener("release", () => {
            setWakeLockActive(false);
          });
        } catch (err) {
          console.warn("Wake Lock error:", err);
          setWakeLockActive(false);
        }
      }
    }

    requestWakeLock();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        requestWakeLock();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
      }
    };
  }, []);

  // -------------------------------------------------------------
  // 2. TTS (speechSynthesis) Logic
  // -------------------------------------------------------------
  const speakText = useCallback((textToSpeak: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = "ko-KR";
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  // -------------------------------------------------------------
  // 3. Step Transitions with 1.5s Cooldown (Debounce Guard)
  // -------------------------------------------------------------
  const goToNextStep = useCallback(() => {
    const now = Date.now();
    // Edge case 2: 1.5s debounce guard to prevent double triggering
    if (now - lastStepTransitionTimeRef.current < 1500) {
      return;
    }
    lastStepTransitionTimeRef.current = now;

    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  }, [currentStepIndex, totalSteps]);

  const goToPrevStep = useCallback(() => {
    const now = Date.now();
    if (now - lastStepTransitionTimeRef.current < 1500) {
      return;
    }
    lastStepTransitionTimeRef.current = now;

    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [currentStepIndex]);

  // Read current step on step transition (0.3s delay)
  useEffect(() => {
    // Reset timer when step changes
    if (currentStep.timerSeconds && currentStep.timerSeconds > 0) {
      setTimerSecondsLeft(currentStep.timerSeconds);
      setIsTimerRunning(false);
      setIsTimerFinished(false);
    } else {
      setTimerSecondsLeft(0);
      setIsTimerRunning(false);
      setIsTimerFinished(false);
    }

    const timer = setTimeout(() => {
      speakText(`${currentStep.step}단계. ${currentStep.text}`);
    }, 300);

    return () => {
      clearTimeout(timer);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentStepIndex, currentStep, speakText]);

  // -------------------------------------------------------------
  // 4. Timer Handling
  // -------------------------------------------------------------
  const toggleTimer = useCallback(() => {
    if (!currentStep.timerSeconds) return;
    setIsTimerRunning((prev) => !prev);
  }, [currentStep.timerSeconds]);

  const resetTimer = useCallback(() => {
    setIsTimerRunning(false);
    setTimerSecondsLeft(currentStep.timerSeconds || 0);
    setIsTimerFinished(false);
  }, [currentStep.timerSeconds]);

  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current!);
            setIsTimerRunning(false);
            setIsTimerFinished(true);
            playBeep(880, 0.3, 3);
            speakText("타이머가 종료되었습니다!");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isTimerRunning, speakText]);

  // -------------------------------------------------------------
  // 5. STT (SpeechRecognition) & Echo Prevention
  // -------------------------------------------------------------
  useEffect(() => {
    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setSttSupported(false);
      return;
    }

    const recognition = new SpeechRecognitionClass();
    recognition.lang = "ko-KR";
    recognition.continuous = true;
    recognition.interimResults = false;
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      // Auto restart if still on cooking screen
      try {
        recognition.start();
      } catch {
        // already started or blocked
      }
    };

    recognition.onerror = (e: any) => {
      if (e.error !== "no-speech") {
        console.warn("STT error:", e.error);
      }
    };

    recognition.onresult = (event: any) => {
      // [중요 예외 처리 1 - Echo 방지]: TTS 재생 중에는 STT 입력 무시
      if (isSpeakingRef.current) {
        console.log("Echo filter: Speech synthesis is speaking. Ignoring microphone transcript.");
        return;
      }

      const resultsLength = event.results.length;
      const transcript = event.results[resultsLength - 1][0].transcript.trim().toLowerCase();

      console.log("Recognized speech:", transcript);

      // Match commands
      if (
        transcript.includes("다음") ||
        transcript.includes("넘어") ||
        transcript.includes("완료")
      ) {
        setLastVoiceCommand("다음");
        goToNextStep();
      } else if (
        transcript.includes("이전") ||
        transcript.includes("뒤로") ||
        transcript.includes("전 단계")
      ) {
        setLastVoiceCommand("이전");
        goToPrevStep();
      } else if (
        transcript.includes("다시") ||
        transcript.includes("뭐라고") ||
        transcript.includes("반복")
      ) {
        setLastVoiceCommand("다시");
        speakText(`${currentStep.step}단계. ${currentStep.text}`);
      } else if (
        transcript.includes("타이머") ||
        transcript.includes("시간") ||
        transcript.includes("스톱워치")
      ) {
        setLastVoiceCommand("타이머");
        toggleTimer();
      }

      // Clear voice command banner after 2s
      setTimeout(() => {
        setLastVoiceCommand(null);
      }, 2000);
    };

    try {
      recognition.start();
    } catch (err) {
      console.warn("Recognition start failed:", err);
    }

    return () => {
      recognition.onend = null;
      try {
        recognition.stop();
      } catch {}
    };
  }, [goToNextStep, goToPrevStep, toggleTimer, speakText, currentStep]);

  // -------------------------------------------------------------
  // 6. Touchless Gesture Sensor (DeviceMotionEvent)
  // -------------------------------------------------------------
  const triggerGestureAdvance = useCallback(() => {
    setGestureTriggered(true);
    goToNextStep();
    setTimeout(() => setGestureTriggered(false), 1200);
  }, [goToNextStep]);

  useEffect(() => {
    let lastX = 0;
    let lastY = 0;
    let lastZ = 0;
    const SHAKE_THRESHOLD = 22; // Acceleration threshold for tap/shake

    const handleDeviceMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity || event.acceleration;
      if (!acc || acc.x === null || acc.y === null || acc.z === null) return;

      const deltaX = Math.abs(acc.x - lastX);
      const deltaY = Math.abs(acc.y - lastY);
      const deltaZ = Math.abs(acc.z - lastZ);

      lastX = acc.x;
      lastY = acc.y;
      lastZ = acc.z;

      if (deltaX + deltaY + deltaZ > SHAKE_THRESHOLD) {
        triggerGestureAdvance();
      }
    };

    window.addEventListener("devicemotion", handleDeviceMotion);
    return () => {
      window.removeEventListener("devicemotion", handleDeviceMotion);
    };
  }, [triggerGestureAdvance]);

  // Format MM:SS for timer
  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Split and highlight text based on highlight words
  const renderHighlightedText = (text: string, highlightWords?: string[]) => {
    if (!highlightWords || highlightWords.length === 0) {
      return text;
    }

    const regex = new RegExp(`(${highlightWords.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, i) => {
      const isMatch = highlightWords.some(
        (w) => w.toLowerCase() === part.toLowerCase()
      );
      if (isMatch) {
        return (
          <span
            key={i}
            className="bg-amber-100/90 text-orange-600 px-1 py-0.5 rounded-lg font-black underline decoration-orange-300 decoration-2 underline-offset-4"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-stone-50 overflow-hidden relative select-none">
      {/* 1. Top Bar: Progress, Overview Button, Exit */}
      <header className="px-4 py-3 bg-white border-b border-stone-200 shrink-0 z-20">
        <div className="flex items-center justify-between gap-2">
          {/* Progress Info */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-white bg-stone-900 px-2.5 py-1 rounded-full">
              {currentStepIndex + 1} / {totalSteps}
            </span>
            <span className="text-xs font-bold text-stone-700 truncate max-w-[120px]">
              {recipe.title}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Gesture Simulator Button for Desktop testing */}
            <button
              onClick={triggerGestureAdvance}
              title="가속도 센서 탭/흔들기 테스트"
              className="text-[11px] font-bold px-2 py-1 rounded-lg bg-orange-100 hover:bg-orange-200 text-orange-800 border border-orange-200 flex items-center gap-1 active:scale-95 transition-transform"
            >
              <Smartphone className="w-3 h-3 text-orange-600" />
              <span>👋 제스처 시뮬레이션</span>
            </button>

            {/* Overview List Button */}
            <button
              onClick={() => setIsOverviewOpen(true)}
              className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-600 active:scale-95 transition-transform"
              aria-label="전체 단계 보기"
            >
              <List className="w-5 h-5" />
            </button>

            {/* Exit Button */}
            <button
              onClick={() => {
                if (confirm("쿠킹 모드를 종료하고 레시피 상세로 돌아갈까요?")) {
                  router.push(`/recipe/${recipe.id}`);
                }
              }}
              className="p-1.5 rounded-lg hover:bg-rose-50 text-stone-500 hover:text-rose-600 active:scale-95 transition-transform"
              aria-label="종료"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-stone-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </header>

      {/* 2. Status Badge (Voice Listening, Echo Filter, Gesture Cooldown) */}
      <div className="px-4 py-2 bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white shrink-0 shadow-xs">
        <div className="flex items-center justify-between text-[11px] font-semibold">
          {/* Voice State */}
          <div className="flex items-center gap-1.5 min-w-0">
            {isSpeaking ? (
              <span className="flex items-center gap-1 text-amber-300">
                <Volume2 className="w-3.5 h-3.5 animate-bounce" />
                <span className="truncate">🔊 음성 낭독 중 (에코 방지: 마이크 대기)</span>
              </span>
            ) : isListening ? (
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                <Mic className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">🎙️ "다음" · "이전" · "다시" · "타이머" 대기중</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-stone-400">
                <MicOff className="w-3.5 h-3.5" />
                <span>마이크 대기 중</span>
              </span>
            )}
          </div>

          {/* Screen WakeLock / Cooldown Badge */}
          <div className="flex items-center gap-1 text-[10px] text-stone-300 shrink-0">
            <Shield className="w-3 h-3 text-orange-400" />
            <span>화면 켜짐 유지</span>
          </div>
        </div>

        {/* Real-time recognized voice command toast */}
        {lastVoiceCommand && (
          <div className="mt-1.5 py-1 px-2.5 bg-orange-500 text-white rounded-lg text-xs font-bold flex items-center justify-between animate-in slide-in-from-top-1">
            <span>🎙️ 음성 감지: "{lastVoiceCommand}"</span>
            <CheckCircle className="w-3.5 h-3.5" />
          </div>
        )}

        {/* Gesture feedback toast */}
        {gestureTriggered && (
          <div className="mt-1.5 py-1 px-2.5 bg-amber-500 text-white rounded-lg text-xs font-bold flex items-center justify-between animate-in slide-in-from-top-1">
            <span>👋 톡톡 모션 감지! 다음 단계로 이동</span>
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      {/* 3. Main Center Content: Giant Step Instruction & Conditional Timer */}
      <div className="flex-1 p-5 overflow-y-auto flex flex-col justify-between no-scrollbar space-y-4">
        <div className="space-y-4 my-auto">
          {/* Step Number Tag */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 border border-orange-200 text-orange-700 text-xs font-black">
            <span>STEP {currentStep.step}</span>
            <span>·</span>
            <span>{currentStep.timerSeconds ? `${currentStep.timerSeconds}초 소요` : "행동 지침"}</span>
          </div>

          {/* Giant Step Instruction Text (24px~28px Bold) */}
          <div className="text-[25px] sm:text-[28px] font-extrabold text-stone-900 leading-[1.38] tracking-tight">
            {renderHighlightedText(currentStep.text, currentStep.highlightWords)}
          </div>

          {/* Cooking Tip Box */}
          {currentStep.tip && (
            <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200/70 flex items-start gap-2.5">
              <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 leading-relaxed font-medium">
                <span className="font-bold text-amber-800">셰프의 한 끗 팁: </span>
                {currentStep.tip}
              </div>
            </div>
          )}

          {/* Conditional Timer Widget */}
          {currentStep.timerSeconds && currentStep.timerSeconds > 0 ? (
            <div className={`p-4 rounded-3xl border transition-all ${
              isTimerFinished
                ? "bg-rose-50 border-rose-300 animate-pulse"
                : isTimerRunning
                ? "bg-orange-50/90 border-orange-300 shadow-md"
                : "bg-white border-stone-200 shadow-xs"
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-stone-600 flex items-center gap-1">
                  <Bell className={`w-3.5 h-3.5 ${isTimerRunning ? "text-orange-500 animate-bounce" : "text-stone-400"}`} />
                  {isTimerFinished ? "⏱ 조리 시간 종료! 불을 확인하세요" : "스마트 타이머"}
                </span>
                <span className="text-[11px] font-semibold text-stone-400">
                  음성: "타이머"로 시작/정지
                </span>
              </div>

              <div className="flex items-center justify-between">
                {/* Large Time Display */}
                <div className={`text-4xl sm:text-5xl font-black tracking-tight font-mono ${
                  isTimerFinished ? "text-rose-600" : isTimerRunning ? "text-orange-600" : "text-stone-800"
                }`}>
                  {formatTimer(timerSecondsLeft)}
                </div>

                {/* Timer Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleTimer}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-transform ${
                      isTimerRunning
                        ? "bg-stone-800 hover:bg-stone-900 text-white"
                        : "bg-orange-500 hover:bg-orange-600 text-white"
                    }`}
                  >
                    {isTimerRunning ? (
                      <>
                        <Pause className="w-4 h-4" />
                        <span>일시정지</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current" />
                        <span>시작</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={resetTimer}
                    className="p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 active:scale-95 transition-transform"
                    aria-label="타이머 초기화"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* 4. Bottom Control Bar (Height >= 64px for easy wrist/elbow tapping) */}
      <div className="px-3 py-3.5 bg-white border-t border-stone-200 shadow-xl shrink-0 z-20">
        <div className="grid grid-cols-3 gap-2.5 h-[68px]">
          {/* [< 이전] Button */}
          <button
            onClick={goToPrevStep}
            disabled={currentStepIndex === 0}
            className={`h-full rounded-2xl font-black text-sm flex flex-col items-center justify-center gap-1 border active:scale-[0.97] transition-all ${
              currentStepIndex === 0
                ? "bg-stone-100 text-stone-300 border-stone-200 cursor-not-allowed"
                : "bg-white text-stone-800 border-stone-300 hover:bg-stone-50 shadow-xs"
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            <span>이전 단계</span>
          </button>

          {/* [🔊 다시 듣기] Button */}
          <button
            onClick={() => speakText(`${currentStep.step}단계. ${currentStep.text}`)}
            className="h-full rounded-2xl font-black text-sm flex flex-col items-center justify-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 active:scale-[0.97] shadow-xs transition-all"
          >
            <Volume2 className="w-5 h-5 text-amber-600" />
            <span>다시 듣기</span>
          </button>

          {/* [다음 >] or [🎉 요리 완료] Button */}
          {currentStepIndex === totalSteps - 1 ? (
            <button
              onClick={() => setIsCompleted(true)}
              className="h-full rounded-2xl font-black text-sm flex flex-col items-center justify-center gap-1 bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25 active:scale-[0.97] transition-all"
            >
              <CheckCircle className="w-5 h-5" />
              <span>요리 완료!</span>
            </button>
          ) : (
            <button
              onClick={goToNextStep}
              className="h-full rounded-2xl font-black text-sm flex flex-col items-center justify-center gap-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md shadow-orange-500/25 active:scale-[0.97] transition-all"
            >
              <ChevronRight className="w-5 h-5" />
              <span>다음 단계</span>
            </button>
          )}
        </div>
      </div>

      {/* 5. Step Overview Modal */}
      {isOverviewOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-[420px] bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-extrabold text-base text-stone-900">
                전체 조리 순서 ({recipe.title})
              </h3>
              <button
                onClick={() => setIsOverviewOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto no-scrollbar py-3 space-y-2 flex-1">
              {recipe.steps.map((st, idx) => {
                const isCurrent = idx === currentStepIndex;
                const isPast = idx < currentStepIndex;
                return (
                  <button
                    key={st.step}
                    onClick={() => {
                      setCurrentStepIndex(idx);
                      setIsOverviewOpen(false);
                    }}
                    className={`w-full p-3 rounded-2xl text-left flex items-start gap-3 transition-all border ${
                      isCurrent
                        ? "bg-orange-50 border-orange-300 text-stone-900 font-bold"
                        : isPast
                        ? "bg-stone-50 border-stone-200 text-stone-400"
                        : "bg-white border-stone-200 text-stone-700 hover:border-orange-200"
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                        isCurrent
                          ? "bg-orange-500 text-white"
                          : isPast
                          ? "bg-stone-300 text-white"
                          : "bg-stone-100 text-stone-600"
                      }`}
                    >
                      {st.step}
                    </span>
                    <div className="flex-1 text-xs leading-relaxed">
                      {st.text}
                      {st.timerSeconds ? (
                        <span className="block text-[10px] text-orange-600 font-semibold mt-1">
                          ⏱ {st.timerSeconds}초
                        </span>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 6. Cooking Complete Modal */}
      {isCompleted && (
        <CookingCompleteModal
          recipe={recipe}
          onClose={() => setIsCompleted(false)}
        />
      )}
    </div>
  );
}
