
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

async function getAiInstance() {
  // 1. AI Studio 환경에서 키가 이미 선택되었는지 확인 (Vercel 배포 버전은 process.env가 우선됨)
  if (typeof window !== 'undefined' && window.aistudio) {
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      // 키가 없으면 팝업을 띄우되, 에러를 던지지 않고 시도합니다.
      console.warn("No API Key selected via AI Studio. Falling back to system environment variables.");
    }
  }
  
  // 2. 환경 변수에서 키 획득
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    console.error("CRITICAL: API_KEY is missing. Check Vercel Environment Variables.");
    throw new Error("API_KEY가 설정되지 않았습니다.");
  }
  
  return new GoogleGenAI({ apiKey });
}

export async function polishVision(name: string, dept: string, vision: string) {
  try {
    const ai = await getAiInstance();
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
    const ai = await getAiInstance();
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
  try {
    const ai = await getAiInstance();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // 더 안정적인 모델로 변경
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: mimeType } },
          {
            text: `[TASK: Professional Portrait Improvement]
            Keep the person's face EXACTLY the same. Only change the background and lighting.
            Background: Intellectual dark office/studio with soft warm lighting.
            Quality: Professional DSLR, 8k, cinematic, high contrast.
            STRICT: NO TEXT, NO LOGOS, NO WRITING on the image.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "3:4"
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
    throw error;
  }
}
