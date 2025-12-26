
import { GoogleGenAI } from "@google/genai";

// Standard text polishing with Flash
export async function polishVision(name: string, dept: string, vision: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `사용자의 이름은 ${name}이고 소속은 ${dept}입니다. 이 사용자가 작성한 AI 챔피언으로서의 포부는 다음과 같습니다: "${vision}". 이 포부를 더 전문적이고, 영감을 주며, 대한민국 공공부문 AI 리더로서 품격 있는 문장으로 다듬어주세요. 결과는 단 한 문장으로만 출력하세요.`,
    config: {
      temperature: 0.7,
    }
  });
  return response.text || vision;
}

// 프로필 추가 내용(주요 업적) 추천 기능
export async function suggestProfileContent(name: string, dept: string, role: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `${dept}의 ${role}인 ${name} 챔피언이 명예의 전당에 등록하려 합니다. 이 사람이 자랑할 만한 '공공 AI 혁신 업적'이나 '전문가적 특징'을 한 문장으로 창의적으로 제안해주세요. (예: "전국 최초 초거대 AI 기반 민원 자동화 시스템 구축", "데이터 기반의 의사결정 체계를 확립한 디지털 행정의 선구자")`,
    config: {
      temperature: 0.8,
    }
  });
  return response.text?.replace(/"/g, '') || "";
}

// Professional Portrait Transformation with Maximum Facial Consistency
export async function transformPortrait(base64Image: string, mimeType: string) {
  // Check for API key selection for pro models
  if (typeof window.aistudio !== 'undefined') {
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await window.aistudio.openSelectKey();
    }
  }

  try {
    // Create new GoogleGenAI instance right before making an API call to ensure it uses up-to-date API key
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: `IMPORTANT: TRANSFORM THIS IMAGE WHILE MAINTAINING ABSOLUTE FACIAL IDENTITY. 
            The facial features, bone structure, and eyes of the person in the original photo MUST remain 100% identical and recognizable. 
            Apply a high-end, world-class professional portrait photography style. 
            Background: Sophisticated, minimalist, dark studio background with subtle, elegant technological patterns or golden bokeh.
            Lighting: Professional three-point lighting, dramatic shadows, cinematic contrast. 
            Texture: Crisp 8K resolution, detailed skin texture, professional retouching. 
            Outfit: If needed, subtly refine the outfit to a premium business professional look. 
            The overall vibe must be "The Elite AI Leader of South Korea".`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "1K"
        }
      }
    });

    // Iterate through parts to find the image part as recommended
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("Failed to generate transformed portrait.");
  } catch (error: any) {
    // Handling "Requested entity was not found" error by prompting for key again
    if (error?.message?.includes("Requested entity was not found") && typeof window.aistudio !== 'undefined') {
      await window.aistudio.openSelectKey();
    }
    throw error;
  }
}
