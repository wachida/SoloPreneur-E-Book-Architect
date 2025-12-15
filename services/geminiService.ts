import { GoogleGenAI, Type } from "@google/genai";
import { Chapter, EBook } from "../types";

const getClient = (apiKey: string) => {
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }
  return new GoogleGenAI({ apiKey });
};

// 1. Agent: Senior Strategist
export const generateBookOutline = async (apiKey: string, topic: string): Promise<Partial<EBook>> => {
  const ai = getClient(apiKey);
  
  const prompt = `
    You are a World-Class E-Book Strategist and Editor-in-Chief with over 15 years of experience in the publishing industry.
    You have a track record of creating best-selling non-fiction books globally.
    Your expertise lies in crafting compelling, market-driven book structures that hook readers instantly and deliver immense value.

    Your task is to plan a high-quality non-fiction e-book based on the user's topic: "${topic}".
    
    1. Create a magnetic, professional Title in Thai language that sounds like a bestseller (Catchy, Clear, and Compelling).
    2. Define a specific, high-potential Target Audience in Thai language.
    3. Write a captivating, high-converting Description in Thai language that emphasizes the benefits to the reader.
    4. Create an outline with exactly 5 distinct chapters. Each chapter must flow logically to build a complete narrative or guide.
    
    The content MUST be in Thai Language and reflect the depth, structure, and strategic thinking of a seasoned expert.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          targetAudience: { type: Type.STRING },
          description: { type: Type.STRING },
          chapters: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                summary: { type: Type.STRING } // Helper for the writer later
              },
              required: ["title", "summary"]
            }
          }
        },
        required: ["title", "targetAudience", "description", "chapters"]
      }
    }
  });

  if (!response.text) throw new Error("ไม่สามารถสร้างโครงเรื่องได้");
  
  const data = JSON.parse(response.text);
  
  const chapters: Chapter[] = data.chapters.map((c: any, index: number) => ({
    id: `ch-${index}`,
    title: c.title,
    content: '',
    status: 'pending'
  }));

  chapters.push({
    id: 'ch-conclusion',
    title: 'บทสรุป: บทเรียนสำคัญและข้อคิดส่งท้าย',
    content: '',
    status: 'pending'
  });

  return {
    title: data.title,
    targetAudience: data.targetAudience,
    description: data.description,
    chapters: chapters
  };
};

// 2. Agent: Senior Ghostwriter
export const generateChapterContent = async (
  apiKey: string,
  bookTitle: string, 
  chapterTitle: string, 
  audience: string,
  bookDescription: string,
  tone: string = "Professional & Authoritative",
  authorBio: string = ""
): Promise<string> => {
  const ai = getClient(apiKey);

  const prompt = `
    You are a Senior Professional Ghostwriter and Editor with over 15 years of experience.
    
    Task: Write a chapter for a non-fiction e-book.
    
    Context:
    - Book Title: ${bookTitle}
    - Book Description: ${bookDescription}
    - Target Audience: ${audience}
    - Chapter Title: ${chapterTitle}
    
    Style & Voice Configuration:
    - Language: Thai (Eloquent, Natural, High-quality).
    - Tone of Voice: ${tone}.
    - Author Persona: ${authorBio ? `Write from the perspective of this author: "${authorBio}". Incorporate their expertise/vibe if applicable.` : 'Expert in the field.'}
    
    Requirements:
    - Length: Approximately 500-700 words.
    - Structure: Use engaging headers, concise paragraphs, and bullet points for readability. Format in Markdown.
    - Quality: Provide deep insights, practical real-world examples (use case studies if relevant to the topic), and avoid generic "AI-sounding" fluff.
    - Engagement: Speak directly to the reader ("คุณ").
    
    If this is the Conclusion chapter (บทสรุป), synthesize the wisdom into a powerful call-to-action.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  return response.text || "เกิดข้อผิดพลาดในการสร้างเนื้อหา";
};

// 3. Agent: Senior Art Director
export const generateCoverImage = async (apiKey: string, title: string, description: string, style: string = 'Minimalist'): Promise<string> => {
  const ai = getClient(apiKey);
  
  const promptDesignResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `You are a Senior Art Director with 15 years of experience in Book Cover Design.
    Create a highly detailed, artistic image generation prompt for a non-fiction e-book cover.
    
    Book Title: "${title}". 
    Description: "${description}".
    Target Aesthetic Style: "${style}".
    
    Style Guidelines:
    - Focus heavily on the "${style}" visual style.
    - Ensure the design looks professional, eye-catching, and like a global Best Seller.
    - Use typography and visual hierarchy effectively.
    - Avoid text glitches (the image generation model should not render complex text, just the visual art).
    
    Output only the English prompt text for the image generator.`
  });
  
  const imagePrompt = promptDesignResponse.text || `A professional book cover for ${title} in ${style} style`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: imagePrompt }]
      },
      config: {
        imageConfig: {
            aspectRatio: "3:4",
            imageSize: "1K"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
        }
    }
    
    throw new Error("ไม่ได้รับข้อมูลรูปภาพกลับมาจาก API");

  } catch (e) {
    console.error("Image gen error", e);
    return "https://picsum.photos/600/800"; // Fallback
  }
};

// 4. Agent: AI Editor Assistant
export const editContentWithAI = async (
  apiKey: string,
  originalText: string,
  instruction: string,
  context?: { tone?: string, audience?: string }
): Promise<string> => {
  const ai = getClient(apiKey);
  const prompt = `
    You are a professional book editor and writing assistant.
    
    Input Text:
    "${originalText}"
    
    Instruction: ${instruction}
    
    Context:
    ${context?.tone ? `- Tone of Voice: ${context.tone}` : ''}
    ${context?.audience ? `- Target Audience: ${context.audience}` : ''}
    
    Directives:
    1. Output ONLY the modified text.
    2. Maintain the Markdown formatting of the original text.
    3. Ensure the language remains Thai (unless the input was English).
    4. Do not include conversational filler like "Here is the edited text:".
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  return response.text?.trim() || originalText;
};