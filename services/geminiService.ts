
import { GoogleGenAI } from "@google/genai";

export async function polishVision(name: string, dept: string, vision: string) {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `사용자의 이름은 ${name}이고 소속은 ${dept}입니다. 이 사용자가 작성한 AI 챔피언으로서의 포부는 다음과 같습니다: "${vision}". 이 포부를 더 전문적이고 영감을 주는 문장으로 다듬어주세요. 결과는 한 문장으로만 출력하세요.`,
    config: { temperature: 0.7 }
  });
  return response.text || vision;
}

export async function suggestProfileContent(name: string, dept: string, role: string) {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `${dept}의 ${role}인 ${name} 챔피언이 명예의 전당에 등록하려 합니다. 이 사람이 자랑할 만한 '공공 AI 혁신 업적'을 한 문장으로 제안해주세요.`,
    config: { temperature: 0.8 }
  });
  return response.text?.replace(/"/g, '') || "";
}

export async function transformPortrait(base64Image: string, mimeType: string) {
  if (typeof window.aistudio !== 'undefined') {
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) await window.aistudio.openSelectKey();
  }

  try {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: mimeType } },
          {
            text: `TRANSFORM THIS IMAGE INTO A WORLD-CLASS PROFESSIONAL PORTRAIT.
            
            FRAMING & COMPOSITION (MANDATORY):
            - MEDIUM LONG SHOT: The subject must be framed from the WAIST UP.
            - DO NOT ZOOM IN ON THE FACE. Keep a comfortable distance.
            - Show the subject's shoulders, arms, and upper torso clearly.
            - The subject's head should take up about 25% of the total frame height.
            - Leave ample space (headroom) above the head.
            
            IDENTITY:
            - Maintain 100% facial accuracy and features.
            
            STYLE:
            - Professional studio lighting, dark textured background, high-end DSLR quality.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "3:4", // 세로형 프로필이 훨씬 전문적입니다.
          imageSize: "1K"
        }
      }
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("Portrait generation failed.");
  } catch (error: any) {
    if (error?.message?.includes("Requested entity was not found") && typeof window.aistudio !== 'undefined') {
      await window.aistudio.openSelectKey();
    }
    throw error;
  }
}
