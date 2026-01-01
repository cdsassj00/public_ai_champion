
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
 * 포부(Vision)를 품격 있는 한 문장으로 정제
 */
export async function polishVision(name: string, dept: string, vision: string) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `사용자의 이름은 ${name}이고 소속은 ${dept}입니다. 이 사용자가 작성한 포부는 다음과 같습니다: "${vision}". 이 포부를 공공부문 리더의 품격이 느껴지는 전문적이고 세련된 문장으로 다듬어주세요. 결과는 반드시 한 문장의 평서문으로만 출력하세요.`,
      config: { thinkingConfig: { thinkingBudget: 0 } }
    });
    return response.text?.trim() || vision;
  } catch (error: any) {
    console.error("Polish Vision Error:", error);
    return vision;
  }
}

/**
 * 업적(Achievement)을 고도화하거나, 없을 경우 생성
 */
export async function polishAchievement(name: string, dept: string, role: string, achievement: string) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = achievement && achievement.length > 5 
      ? `${dept}의 ${role}인 ${name}님이 작성한 다음 업적 내용을 공공 AI 혁신 사례로서 가치가 돋보이도록 고도화해주세요: "${achievement}". '주도', '최적화', '대전환', '성과 창출'과 같은 전문 용어를 사용하여 매우 임팩트 있는 한 문장으로 재구성하세요.`
      : `${dept}에서 ${role}로 활동하는 ${name} 챔피언이 수행했을 법한 구체적이고 혁신적인 공공 AI 업적(예: 인프라 구축, 서비스 최적화, 정책 수립 등)을 한 문장으로 전문성 있게 제안해주세요.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { thinkingConfig: { thinkingBudget: 0 } }
    });
    return response.text?.replace(/"/g, '').trim() || achievement;
  } catch (error: any) {
    console.error("Polish Achievement Error:", error);
    return achievement;
  }
}

/**
 * 초상화를 '전문 정장 프로필 사진'으로 변환
 */
export async function transformPortrait(base64Image: string, mimeType: string) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: mimeType } },
          {
            text: `[STRICT TASK: Professional Business Profile Photo]
            
            1. OBJECTIVE: Create a highly realistic, standardized corporate headshot suitable for a formal Hall of Fame.
            2. FACE PRESERVATION: The subject's facial features, identity, and expression must remain 100% AUTHENTIC. Do not beautify excessively or change basic features.
            3. ATTIRE: STRICT MANDATORY - Replace all current clothing with a crisp, high-quality professional business suit (Dark Navy, Charcoal, or Black). Include a perfectly ironed white dress shirt and a professional silk tie with a clean knot.
            4. PHOTOGRAPHY STYLE: Professional studio portrait photography. High-end DSLR, 85mm lens style, sharp focus on the face, clear and bright skin tones.
            5. LIGHTING: Balanced three-point studio lighting. Soft shadows, professional highlight on the face.
            6. COMPOSITION: Standard profile photo framing. Half-body (chest up). Ensure generous headroom at the top.
            7. BACKGROUND: Clean, professional, and slightly out-of-focus background (Modern office interior or solid professional studio gray).
            8. FORBIDDEN: No text, no logos, no filters, no artistic painting styles. Must look like a REAL PHOTOGRAPH.`,
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
