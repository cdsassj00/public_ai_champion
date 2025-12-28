
import { GoogleGenAI } from "@google/genai";

// Window 인터페이스 확장을 통해 aistudio 타입 정의
// Fix: Use the global AIStudio interface and match the property signature on Window to avoid type conflicts.
// All declarations of 'aistudio' must have identical modifiers and consistent types.
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}

/**
 * Gemini 3 Pro Image (Nano Banana Pro) 등 고성능 모델 사용 시 
 * 브라우저 환경에서 API 키 선택 여부를 확인하고 인스턴스를 생성합니다.
 */
async function getAiInstance() {
  // window.aistudio 환경(특수 실행 환경)인 경우 키 선택 여부 확인
  if (typeof window !== 'undefined' && window.aistudio) {
    try {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await window.aistudio.openSelectKey();
        // openSelectKey 호출 후에는 즉시 성공한 것으로 간주하고 진행 (레이스 컨디션 방지)
      }
    } catch (e) {
      console.warn("aistudio check failed, proceeding with env key.");
    }
  }
  
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY가 설정되지 않았습니다. 환경 변수를 확인해주세요.");
  }
  
  return new GoogleGenAI({ apiKey });
}

export async function polishVision(name: string, dept: string, vision: string) {
  try {
    const ai = await getAiInstance();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `사용자의 이름은 ${name}이고 소속은 ${dept}입니다. 이 사용자가 작성한 AI 챔피언으로서의 포부는 다음과 같습니다: "${vision}". 이 포부를 더 전문적이고 영감을 주는 문장으로 다듬어주세요. 결과는 한 문장으로만 출력하세요.`,
      config: { 
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return response.text || vision;
  } catch (error) {
    console.error("Polish Vision Error:", error);
    return vision;
  }
}

export async function suggestProfileContent(name: string, dept: string, role: string) {
  try {
    const ai = await getAiInstance();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `${dept}의 ${role}인 ${name} 챔피언이 명예의 전당에 등록하려 합니다. 이 사람이 자랑할 만한 '공공 AI 혁신 업적'을 한 문장으로 제안해주세요.`,
    });
    return response.text?.replace(/"/g, '') || "";
  } catch (error) {
    return "";
  }
}

export async function transformPortrait(base64Image: string, mimeType: string) {
  const ai = await getAiInstance();
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: mimeType } },
          {
            text: `당신은 세계 최고의 인물 사진작가입니다. 첨부된 사진의 인물을 '대한민국 공공부문 AI 챔피언'에 걸맞는 품격 있는 프로필 사진으로 변환해주세요.
            
            [필수 가이드라인]
            1. 구도: 상반신(Waist Up)이 보이도록 멀리서 잡아주세요. 얼굴만 너무 크게 나오지 않게(No extreme close-up).
            2. 인물 유지: 인물의 고유한 이목구비와 정체성을 100% 유지하세요.
            3. 스타일: 전문적인 스튜디오 조명, 중후한 질감의 배경, 하이엔드 DSLR 품질.
            4. 결과물: 이미지만 생성하세요.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "3:4",
          imageSize: "1K"
        }
      }
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("이미지 생성 결과가 없습니다.");
  } catch (error: any) {
    // 키 관련 에러 발생 시 재선택 유도
    if (error?.message?.includes("Requested entity was not found") && typeof window !== 'undefined' && window.aistudio) {
      await window.aistudio.openSelectKey();
    }
    throw error;
  }
}
