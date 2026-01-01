
import { GoogleGenAI, Type } from "@google/genai";
import { EXERCISE_LIBRARY } from "./constants";
import { Exercise, DayPlan, WorkoutSession } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateWeeklyPlan(userFocus: string): Promise<DayPlan[]> {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `
    You are an elite running coach. Create a 7-day training plan for a runner.
    The plan must include:
    - 3 Strength days (focused on the provided exercises).
    - 3 Running days (Intervals, Tempo, Long Run).
    - 1 Rest day.
    
    The user's focus: "${userFocus}".
    
    Available Strength Exercises: ${JSON.stringify(EXERCISE_LIBRARY.map(e => ({ id: e.id, name: e.name, target: e.targetArea })))}
    
    Return a 7-day array starting from today.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: "Generate a 7-day training plan array.",
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            dayOffset: { type: Type.INTEGER, description: "0 for today, 1 for tomorrow, etc." },
            type: { type: Type.STRING, enum: ["strength", "running", "rest"] },
            focus: { type: Type.STRING },
            exerciseIds: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Only provide for 'strength' days. Pick 3-4 IDs."
            },
            notes: { type: Type.STRING }
          },
          required: ["dayOffset", "type", "focus", "notes"]
        }
      }
    }
  });

  try {
    const data = JSON.parse(response.text);
    const today = new Date();
    
    return data.map((item: any) => {
      const date = new Date(today);
      date.setDate(today.getDate() + item.dayOffset);
      
      let session: WorkoutSession | undefined;
      if (item.type === 'strength' && item.exerciseIds) {
        const exercises = item.exerciseIds
          .map((id: string) => EXERCISE_LIBRARY.find(e => e.id === id))
          .filter(Boolean) as Exercise[];
          
        session = {
          id: `session-${item.dayOffset}`,
          date: date.toISOString(),
          exercises: exercises,
          completed: false,
          notes: item.notes,
          focus: item.focus
        };
      }

      return {
        date: date.toISOString(),
        type: item.type,
        focus: item.focus,
        session,
        completed: false
      };
    });
  } catch (error) {
    console.error("Failed to generate weekly plan", error);
    return []; // Fallback logic would go here
  }
}
