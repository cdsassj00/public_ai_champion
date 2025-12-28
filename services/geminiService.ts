
import { GoogleGenAI } from "@google/genai";

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
 * 최신 API 키를 반영하여 GoogleGenAI 인스턴스를 생성합니다.
 * Pro 모델의 경우 window.aistudio.openSelectKey()를 통한 키 선택이 우선됩니다.
 */
async function getAiInstance(isProModel: boolean = false) {
  if (typeof window !== 'undefined' && window.aistudio) {
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey && isProModel) {
      // Pro 모델 사용 시 키가 없다면 선택창을 엽니다.
      await window.aistudio.openSelectKey();
    }
  }
  
  // Vite의 define 또는 Vercel 환경변수에서 키를 가져옵니다.
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("API_KEY가 설정되지 않았습니다. Vercel 설정 또는 AI Studio 키 선택을 확인하세요.");
  }
  
  return new GoogleGenAI({ apiKey });
}

export async function polishVision(name: string, dept: string, vision: string) {
  try {
    const ai = await getAiInstance(false); // Flash 모델은 일반 키 사용
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `사용자의 이름은 ${name}이고 소속은 ${dept}입니다. 이 사용자가 작성한 포부는 다음과 같습니다: "${vision}". 이 포부를 더 전문적이고 품격 있는 문장으로 다듬어주세요. 결과는 반드시 한 문장의 평서문으로만 출력하세요.`,
      config: { thinkingConfig: { thinkingBudget: 0 } }
    });
    return response.text?.trim() || vision;
  } catch (error: any) {
    console.error("Polish Vision Error:", error);
    return vision;
  }
}

export async function suggestAchievement(name: string, dept: string, role: string) {
  try {
    const ai = await getAiInstance(false);
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `${dept}에서 ${role}로 활동하는 ${name} 챔피언이 수행했을 법한 공공 AI 혁신 업적을 한 문장으로 전문성 있게 제안해주세요.`,
      config: { thinkingConfig: { thinkingBudget: 0 } }
    });
    return response.text?.replace(/"/g, '').trim() || "";
  } catch (error: any) {
    console.error("Suggest Achievement Error:", error);
    return "";
  }
}

export async function transformPortrait(base64Image: string, mimeType: string) {
  // Pro 모델이므로 인스턴스 생성 시 키 선택 여부 확인이 포함됨
  const ai = await getAiInstance(true);
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: mimeType } },
          {
            text: `[TASK: Masterpiece Portrait Transformation]
            원본 사진 속 인물의 고유한 얼굴 특징, 이목구비, 인상을 100% 완벽하게 보존하면서, 배경과 조명만 대한민국 공공부문 최고 리더에 걸맞는 '프리미엄 프로필' 스타일로 업그레이드하세요.
            
            [CRITICAL INSTRUCTIONS]
            1. 얼굴 보존 (STRICT FACE PRESERVATION): 사진 속 인물의 이목구비 생김새를 절대 바꾸지 마십시오. 인상을 그대로 유지하면서 톤과 무드만 감각적으로 표현하십시오.
            2. 텍스트 금지 (NO TEXT/SYMBOLS): 이미지 그 어디에도 글자, 문자, 숫자, 서명, 로고를 생성하지 마십시오.
            3. 무드와 톤 (MOOD & TONE): 지적인 깊이가 느껴지는 다크한 스튜디오 배경, 상단에서 부드럽게 떨어지는 렘브란트 조명, 시네마틱한 텍스처를 적용하세요.
            4. 품질: 8k UHD, Professional DSLR quality, Clean and sophisticated.`,
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
    throw new Error("이미지 생성 실패");
  } catch (error: any) {
    console.error("Transform Portrait Error:", error);
    if (error?.message?.includes("Requested entity was not found") && typeof window !== 'undefined' && window.aistudio) {
      // 엔티티 오류 발생 시 키 재선택 유도
      await window.aistudio.openSelectKey();
    }
    throw error;
  }
}
