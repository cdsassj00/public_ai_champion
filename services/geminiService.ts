
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
      contents: `[STRICT INSTRUCTION: NO CONVERSATIONAL FILLERS]
      사용자의 이름: ${name}
      소속: ${dept}
      작성된 포부: "${vision}"
      
      작업: 위 포부를 공공부문 리더의 품격이 느껴지는 전문적이고 세련된 문장으로 다듬으세요.
      조건:
      1. 결과는 반드시 단 한 문장의 평서문으로만 출력할 것.
      2. "제시해주신 내용을 바탕으로", "다음은 고도화된 문장입니다"와 같은 서론, 설명, 인사말을 절대 포함하지 말 것.
      3. 오직 정제된 문장 본문만 출력할 것.`,
      config: { thinkingConfig: { thinkingBudget: 0 } }
    });
    return response.text?.trim().replace(/^["']|["']$/g, '') || vision;
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
      ? `[STRICT INSTRUCTION: OUTPUT ONLY THE RESULT]
         ${dept}의 ${role}인 ${name}님이 작성한 업적: "${achievement}"
         
         작업: 위 내용을 공공 AI 혁신 사례로서 가치가 돋보이도록 '주도', '최적화', '성과 창출' 등의 전문 용어를 사용하여 임팩트 있는 한 문장으로 재구성하세요.
         조건: 어떠한 설명이나 서론(예: "고도화한 문장입니다") 없이 오직 고도화된 본문 문장만 출력하세요.`
      : `[STRICT INSTRUCTION: OUTPUT ONLY THE RESULT]
         ${dept}에서 ${role}로 활동하는 ${name} 챔피언을 위한 혁신적인 공공 AI 업적(예: 인프라 구축, 서비스 최적화)을 한 문장으로 전문성 있게 제안해주세요.
         조건: 서론이나 설명 없이 오직 생성된 문장 본문만 출력하세요.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { thinkingConfig: { thinkingBudget: 0 } }
    });
    return response.text?.trim().replace(/^["']|["']$/g, '') || achievement;
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
            2. FACE PRESERVATION: The subject's facial features, identity, and expression must remain 100% AUTHENTIC. Maintain the original bone structure and unique traits without excessive beautification.
            3. ATTIRE: STRICT MANDATORY - Replace all current clothing with a crisp, high-quality professional business suit (Dark Navy, Charcoal, or Black). Include a perfectly ironed white dress shirt and a professional silk tie with a clean knot.
            4. PHOTOGRAPHY STYLE: Professional studio portrait photography. High-end DSLR style with natural skin textures. Avoid over-smoothing or plastic looks.
            5. LIGHTING: Balanced three-point studio lighting. Soft shadows, professional highlight on the face that feels natural.
            6. COMPOSITION & FRAMING: Balanced medium shot (waist-up or chest-up). AVOID CLOSE-UPS. Ensure the face does not occupy more than 30% of the frame. Provide generous headroom and side space to create a spacious, professional editorial feel.
            7. BACKGROUND: Clean, professional, and slightly out-of-focus background (Modern office interior or solid professional studio gray).
            8. FORBIDDEN: No text, no logos, no filters, no artistic painting styles. The result must look like a real, high-quality photograph taken by a professional photographer.`,
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
