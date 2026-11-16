# 🍳 손안의 셰프 (Cooking Voice MVP)

> 요리 초보 자취생을 위한 단계별 음성(TTS/STT) 및 터치리스 제스처 기반 모바일 웹(PWA) 레시피 가이드 프로토타입

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC)](https://tailwindcss.com/)
[![Web Speech API](https://img.shields.io/badge/Web_Speech_API-TTS%2FSTT-f97316)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)

---

## ✨ 핵심 기능

1. **유튜브 레시피 AI 실시간 변환 (`/`)**
   - 유튜브 영상 URL을 입력하면 실시간으로 영상 정보와 자막을 분석하여 맞춤형 핸즈프리 레시피 자동 생성
   - 고구마 호떡, 라면, 파스타, 볶음밥 등 요리 유형별 맞춤 조리 순서 및 타이머 추출

2. **재료 체크리스트 (`/recipe/[id]`)**
   - 요리 시작 전 기본 식재료와 양념류를 체크할 수 있는 인터랙티브 체크리스트 (원터치 전체 체크/해제 지원)

3. **핸즈프리 쿠킹 모드 (`/recipe/[id]/cook`)**
   - **TTS 한국어 자동 낭독**: 단계 진입 시 0.3초 후 현재 조리 지시문을 한국어로 낭독
   - **STT 음성 제어**: 주방에서 `"다음"`, `"이전"`, `"다시"`, `"타이머"` 음성 명령으로 손을 대지 않고 제어
   - **에코 방지(Echo Prevention) 필터**: TTS가 말하고 있는 도중에는 앱 자체 목소리를 명령어로 오인식하지 않도록 마이크 입력 일시 무시
   - **오작동 방지 1.5초 쿨타임(Debounce)**: 실수로 연속 단계 전환이 일어나지 않도록 제어
   - **스마트 타이머**: 단계별 소요 시간에 맞춰 카운트다운 타이머 제공 (종료 시 알림음 재생)
   - **모션 제스처 감지**: `DeviceMotionEvent` 기반으로 스마트폰을 톡 치거나 가볍게 흔들면 다음 단계로 이동 (데스크톱 테스트용 시뮬레이션 버튼 지원)
   - **화면 꺼짐 방지**: `navigator.wakeLock` 지원으로 조리 중 화면 꺼짐 방지

4. **요리 완료 & 인증 다이어리**
   - 완료 축하 사운드 및 컨페티 폭죽
   - "첫 집밥 마스터 배지" 획득
   - 한 줄 메모 및 완성 사진 저장

---

## 🛠️ 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Web APIs**: Web Speech API (SpeechSynthesis & SpeechRecognition), Screen Wake Lock API, DeviceMotionEvent, Web Audio API
- **Language**: TypeScript

---

## 🚀 시작하기

```bash
# 1. 패키지 설치
npm install

# 2. 개발 서버 실행
npm run dev

# 3. 브라우저 접속
# http://localhost:3000
```
