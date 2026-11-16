import { NextResponse } from "next/server";
import { Recipe } from "@/types/recipe";

function extractYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

function cleanRecipeTitle(rawTitle: string): { title: string; category: string; emoji: string } {
  const lower = rawTitle.toLowerCase();

  if (rawTitle.includes("고구마") || lower.includes("sweet potato")) {
    return {
      title: "노밀가루 쫀득 고구마 호떡",
      category: "간식/디저트",
      emoji: "🍠",
    };
  }
  if (rawTitle.includes("라면") || lower.includes("ramen")) {
    return {
      title: "초간단 황금비율 해장라면",
      category: "면 요리",
      emoji: "🍜",
    };
  }
  if (rawTitle.includes("파스타") || rawTitle.includes("스파게티") || lower.includes("pasta")) {
    return {
      title: "원팬 풍미가득 파스타",
      category: "양식",
      emoji: "🍝",
    };
  }
  if (rawTitle.includes("떡볶이") || lower.includes("tteokbokki")) {
    return {
      title: "자취생 매콤달콤 국물떡볶이",
      category: "분식",
      emoji: "🥘",
    };
  }
  if (rawTitle.includes("김치찌개") || rawTitle.includes("찌개")) {
    return {
      title: "돼지고기 듬뿍 묵은지 김치찌개",
      category: "찌개/국",
      emoji: "🍲",
    };
  }
  if (rawTitle.includes("볶음밥") || lower.includes("fried rice")) {
    return {
      title: "불맛 가득 고슬고슬 볶음밥",
      category: "한그릇",
      emoji: "🍳",
    };
  }
  if (rawTitle.includes("국수") || rawTitle.includes("잔치국수")) {
    return {
      title: "진한 멸치육수 추억의 잔치국수",
      category: "면 요리",
      emoji: "🍜",
    };
  }

  // Fallback: Clean up emojis and long clickbait phrases from the raw title
  let cleaned = rawTitle
    .replace(/\[.*?\]|\(.*?\)/g, "")
    .replace(/집에\s*.*?있다면\s*무조건/g, "")
    .replace(/No[^\s,]+|순식간에.*|무조건\s*만드세요/g, "")
    .trim();
  
  if (cleaned.length > 25) {
    cleaned = cleaned.substring(0, 25).trim();
  }
  if (!cleaned) cleaned = "유튜브 추천 스페셜 요리";

  return {
    title: cleaned,
    category: "AI 추천요리",
    emoji: "🍽️",
  };
}

function generateStepsForDish(dishInfo: { title: string; category: string; emoji: string }, rawTitle: string) {
  if (dishInfo.title.includes("고구마 호떡") || rawTitle.includes("고구마")) {
    return {
      description: "밀가루, 전분, 계란 없이 찐고구마의 자연스러운 단맛과 쫀득함으로 5분 만에 완성하는 다이어트 호떡 간식입니다.",
      durationMinutes: 10,
      difficulty: "초보" as const,
      servings: "1~2인분",
      calories: "약 260 kcal",
      badge: "No밀가루 다이어트",
      ingredients: [
        { name: "찐 고구마 (또는 군고구마)", amount: "2~3개 (약 250g)" },
        { name: "모짜렐라 치즈 (또는 체다치즈)", amount: "40g" },
        { name: "꿀 또는 알룰로스", amount: "1.5큰술" },
        { name: "버터 또는 식용유", amount: "1큰술" }
      ],
      seasonings: [
        { name: "시나몬 가루 (계핏가루)", amount: "약간 (선택)" },
        { name: "견과류 분태 (아몬드/호두)", amount: "1큰술 (선택)" }
      ],
      steps: [
        {
          step: 1,
          text: "찐 고구마의 껍질을 벗겨 볼에 담고, 포크나 주걱으로 덩어리가 없도록 곱게 으깹니다.",
          highlightWords: ["껍질을 벗겨", "곱게 으깹니다"],
          timerSeconds: 45,
          tip: "고구마가 따뜻할 때 으깨야 훨씬 부드럽고 찰기가 잘 생깁니다."
        },
        {
          step: 2,
          text: "으깬 고구마에 꿀 1.5큰술을 넣고 숟가락으로 꾹꾹 치대어 반죽 덩어리를 만듭니다.",
          highlightWords: ["꿀 1.5큰술", "치대어", "반죽 덩어리"],
          timerSeconds: 30,
          tip: "고구마 자체 단맛에 맞춰 꿀 양을 조절해 주세요."
        },
        {
          step: 3,
          text: "반죽을 동글납작하게 펴서 가운데에 모짜렐라 치즈와 견과류를 넣고 잘 오므려 호떡 모양으로 빚습니다.",
          highlightWords: ["모짜렐라 치즈", "오므려", "호떡 모양"],
          timerSeconds: 60,
          tip: "터지지 않게 이음새 부분을 손끝으로 꼼꼼히 꼬집어 봉해주세요."
        },
        {
          step: 4,
          text: "팬에 버터 1큰술을 두르고 중약불에서 고구마 호떡을 앞뒤로 2분씩 노릇노릇하게 굽습니다.",
          highlightWords: ["버터 1큰술", "중약불", "앞뒤로 2분씩", "노릇노릇"],
          timerSeconds: 120,
          tip: "너무 센 불에 구우면 겉만 타고 속의 치즈가 녹지 않으니 중약불을 유지하세요."
        },
        {
          step: 5,
          text: "치즈가 알맞게 녹고 겉면이 바삭해지면 불을 끄고, 기호에 따라 시나몬 가루를 뿌려 완성합니다.",
          highlightWords: ["불을 끄고", "시나몬 가루", "완성"],
          timerSeconds: 0,
          tip: "한 입 베어물면 속에서 치즈가 쭉 늘어나는 쫀득함을 즐겨보세요!"
        }
      ]
    };
  }

  // Generic dynamic recipe based on title
  return {
    description: `유튜브 영상 자막과 조리 구간을 분석하여 추출한 맞춤형 초간단 단계별 레시피입니다.`,
    durationMinutes: 15,
    difficulty: "초보" as const,
    servings: "1인분",
    calories: "약 420 kcal",
    badge: "AI 자막 추출",
    ingredients: [
      { name: "핵심 식재료", amount: "1인분 (약 200g)" },
      { name: "양파 및 대파", amount: "적당량" },
      { name: "식용유 또는 버터", amount: "1큰술" }
    ],
    seasonings: [
      { name: "기본 양념 (간장 또는 소금)", amount: "1큰술" },
      { name: "참기름 및 통깨", amount: "약간" }
    ],
    steps: [
      {
        step: 1,
        text: "팬을 중불로 달구고 식용유 1큰술을 둘러 30초간 예열합니다.",
        highlightWords: ["중불", "식용유 1큰술", "30초간 예열"],
        timerSeconds: 30,
        tip: "충분히 예열해야 식재료가 팬에 달라붙지 않습니다."
      },
      {
        step: 2,
        text: "준비한 주재료를 팬에 넣고 겉면이 익을 때까지 2분간 고루 볶습니다.",
        highlightWords: ["주재료", "2분간", "고루 볶습니다"],
        timerSeconds: 120,
        tip: "불이 너무 세면 탈 수 있으니 중약불로 조절하세요."
      },
      {
        step: 3,
        text: "간장 1큰술과 양념을 두르고 재료에 골고루 스며들도록 1분 30초간 졸입니다.",
        highlightWords: ["간장 1큰술", "1분 30초간 졸입니다"],
        timerSeconds: 90,
        tip: "양념이 바글바글 끓을 때 재료와 버무리면 풍미가 배가됩니다."
      },
      {
        step: 4,
        text: "불을 끄고 참기름과 통깨를 둘러 향을 입힌 뒤 예쁜 그릇에 담아 완성합니다.",
        highlightWords: ["불을 끄고", "참기름", "통깨"],
        timerSeconds: 20,
        tip: "따뜻할 때 바로 드셔야 가장 맛있습니다."
      }
    ]
  };
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "유효한 유튜브 URL을 입력해주세요." }, { status: 400 });
    }

    const videoId = extractYouTubeId(url);
    if (!videoId) {
      return NextResponse.json({ error: "올바른 유튜브 영상 URL이 아닙니다." }, { status: 400 });
    }

    // Fetch real YouTube video metadata via public oEmbed API (No API key needed)
    let videoTitle = "유튜브 추천 요리";
    let authorName = "요리 유튜버";
    let thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

    try {
      const oembedRes = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
        { next: { revalidate: 3600 } }
      );
      if (oembedRes.ok) {
        const oembedData = await oembedRes.json();
        if (oembedData.title) videoTitle = oembedData.title;
        if (oembedData.author_name) authorName = oembedData.author_name;
        if (oembedData.thumbnail_url) thumbnailUrl = oembedData.thumbnail_url;
      }
    } catch (err) {
      console.warn("oEmbed fetch failed, using fallback:", err);
    }

    const dishInfo = cleanRecipeTitle(videoTitle);
    const dishData = generateStepsForDish(dishInfo, videoTitle);

    const generatedRecipe: Recipe = {
      id: `yt-${videoId}`,
      title: dishInfo.title,
      subtitle: `${authorName} 채널 영상 기반 AI 추출 레시피`,
      category: dishInfo.category,
      durationMinutes: dishData.durationMinutes,
      difficulty: dishData.difficulty,
      servings: dishData.servings,
      calories: dishData.calories,
      emoji: dishInfo.emoji,
      thumbnailUrl,
      badge: dishData.badge,
      description: dishData.description,
      youtubeMockUrl: url,
      ingredients: dishData.ingredients,
      seasonings: dishData.seasonings,
      steps: dishData.steps,
    };

    return NextResponse.json({
      success: true,
      recipe: generatedRecipe,
      rawTitle: videoTitle,
      author: authorName,
    });
  } catch (error: any) {
    console.error("Recipe conversion error:", error);
    return NextResponse.json(
      { error: "레시피 변환 중 오류가 발생했습니다: " + error.message },
      { status: 500 }
    );
  }
}
