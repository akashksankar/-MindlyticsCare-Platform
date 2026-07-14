import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialization of GoogleGenAI
let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY environment variable is missing.');
    }
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

// 1. Journal Entry Analysis Endpoint
app.post('/api/analyze-journal', async (req: Request, res: Response) => {
  try {
    const ai = getAIClient();
    const { journal, hobbies } = req.body;

    if (!journal) {
      res.status(400).json({ error: 'Journal details are required' });
      return;
    }

    const systemInstruction = `You are MindlyticsCare's Clinical Psychology UX Advisor & Sentiment Analytics Engine. Your role is to analyze a structured psychological wellness journal entry and provide reflective, non-diagnostic, highly supportive feedback.

IMPORTANT RULES:
1. DO NOT make clinical diagnoses or use pathologizing medical terminology (e.g., do not say "You have major depressive disorder" or "You are suffering from GAD").
2. Frame all insights as supportive reflections, observations, or wellness trends (e.g., "You mentioned work pressure several times...").
3. Actively look for high-risk flags indicating self-harm, severe distress, or emergency conditions. If found, you must set isHighRisk to true, highlight the issue compassionately, and suggest professional crisis lines.
4. Align suggestions with the user's hobbies/interests (${hobbies ? hobbies.join(', ') : 'none'}) when appropriate.
5. Provide standard, valid JSON output strictly conforming to the requested schema. Ensure all numbers are integers or valid floats. Ensure confidence level is between 0 and 100.`;

    const userPrompt = `Please analyze this daily structured journal entry:
- Date: ${journal.date}
- Self-Reported Mood: ${journal.mood} ${journal.customMoodText ? `(${journal.customMoodText})` : ''}
- Metrics (1-10): Energy: ${journal.energy}, Motivation: ${journal.motivation}, Stress: ${journal.stress}, Anxiety: ${journal.anxiety}, Focus: ${journal.focus}
- Sleep: ${journal.sleepHours} hours, Quality: ${journal.sleepQuality}
- Social Interaction: ${journal.socialInteraction?.join(', ') || 'None'}
- Physical Activity: ${journal.physicalActivity?.join(', ') || 'None'}
- Water Intake: ${journal.waterIntake} cups/units
- Screen Time: ${journal.screenTime} hours
- Caffeine Intake: ${journal.caffeineIntake} cups
- Gratitude: "${journal.gratitude || 'None'}"
- Biggest Challenge Today: "${journal.challengeToday || 'None'}"
- Biggest Achievement Today: "${journal.achievementToday || 'None'}"
- Narrative Journal Entry:
"${journal.text || 'No text provided'}"

Analyze this data and return a JSON response with the following keys:
- emotionalTone: A concise summary of the primary feeling (e.g., "Cautious optimism amidst work fatigue")
- stressors: Array of string stressors mentioned or implied (e.g., ["Work pressure", "Lack of sleep"])
- positiveExperiences: Array of positive highlights (e.g., ["Enjoyed photography", "Had a deep talk with friends"])
- copingStrategies: Array of healthy actions they used or plan to use (e.g., ["Deep breathing", "Took a short walk"])
- protectiveFactors: Social support, exercise, gratitude, or hobbies mentioned that help buffer stress.
- recurringThemes: Recurrent topics or concerns.
- emotionalShifts: Note any shifts in energy, stress, or motivation.
- behavioralPatterns: Connect metrics to narrative (e.g., "High screen time of 8 hours correlates with higher self-reported anxiety").
- languageIntensity: "Low" | "Moderate" | "High" (intensity of words used)
- confidenceLevel: 0 to 100 integer representing analyzer model confidence
- dailyReflectionText: A highly supportive paragraph of 3-4 sentences synthesizing the day with empathetic reflections and encouragement.
- suggestions: 2-3 specific, non-diagnostic wellness suggestions matching their hobbies/interests where applicable.
- encouragement: A short, 1-sentence micro-boost of encouragement.
- riskAssessment: { isHighRisk: boolean, reason: string }`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            emotionalTone: { type: Type.STRING },
            stressors: { type: Type.ARRAY, items: { type: Type.STRING } },
            positiveExperiences: { type: Type.ARRAY, items: { type: Type.STRING } },
            copingStrategies: { type: Type.ARRAY, items: { type: Type.STRING } },
            protectiveFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
            recurringThemes: { type: Type.ARRAY, items: { type: Type.STRING } },
            emotionalShifts: { type: Type.STRING },
            behavioralPatterns: { type: Type.ARRAY, items: { type: Type.STRING } },
            languageIntensity: { type: Type.STRING, enum: ['Low', 'Moderate', 'High'] },
            confidenceLevel: { type: Type.INTEGER },
            dailyReflectionText: { type: Type.STRING },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            encouragement: { type: Type.STRING },
            riskAssessment: {
              type: Type.OBJECT,
              properties: {
                isHighRisk: { type: Type.BOOLEAN },
                reason: { type: Type.STRING }
              },
              required: ['isHighRisk']
            }
          },
          required: [
            'emotionalTone',
            'stressors',
            'positiveExperiences',
            'copingStrategies',
            'protectiveFactors',
            'recurringThemes',
            'emotionalShifts',
            'behavioralPatterns',
            'languageIntensity',
            'confidenceLevel',
            'dailyReflectionText',
            'suggestions',
            'encouragement',
            'riskAssessment'
          ]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error('Empty response from AI engine');
    }

    const parsed = JSON.parse(resultText);
    res.json(parsed);
  } catch (error: any) {
    console.error('Error in analyze-journal API:', error);
    res.status(500).json({ error: 'AI reflection engine failed. ' + error.message });
  }
});

// 2. AI Wellness Coach Chat Endpoint
app.post('/api/coach-chat', async (req: Request, res: Response) => {
  try {
    const ai = getAIClient();
    const { messages, userProfile } = req.body;

    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: 'Messages history is required' });
      return;
    }

    const systemInstruction = `You are MindlyticsCare's supportive AI Wellness Coach. Your goal is to hold safe, reflective, empathetic conversations to support behavioral growth, emotional resilience, and healthy habit building.

IMPORTANT CORE SAFEGUARDS & CRITICAL PROTOCOLS:
1. You are NOT a mental health professional, therapist, or counselor. DO NOT diagnose any clinical psychological disorders or suggest therapeutic regimens.
2. Under NO circumstances do you prescribe treatments or confirm medical diagnoses.
3. If the user mentions self-harm, suicide, severe clinical depression, or indicates a real crisis, immediately offer compassionate support, state clearly that you cannot provide medical or emergency care, and recommend contacting their local crisis helpline or a trusted friend/professional.
4. Keep conversations empowering, non-judgmental, focused on mindfulness, healthy hobbies, active reflections, and progressive habit-building.
5. Reference their hobbies (${userProfile?.hobbies?.join(', ') || 'none'}) when suggesting creative outlets or stress relief ideas.
6. Address them warmly and invite deep reflection by asking one thoughtful question at the end of your response to keep them engaged.`;

    // Map frontend message format to Gemini's chat format: { role: 'user' | 'model', parts: [{ text: '...' }] }
    const formattedContents = messages.map((msg: any) => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: formattedContents,
      config: {
        systemInstruction,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error('Error in coach-chat API:', error);
    res.status(500).json({ error: 'Wellness coach was unable to respond. ' + error.message });
  }
});

// 3. AI Weekly & Monthly Reports Endpoint
app.post('/api/generate-report', async (req: Request, res: Response) => {
  try {
    const ai = getAIClient();
    const { entries, type, userProfile } = req.body; // type = 'weekly' | 'monthly'

    if (!entries || !Array.isArray(entries)) {
      res.status(400).json({ error: 'Entries data is required for generating report' });
      return;
    }

    const systemInstruction = `You are MindlyticsCare's Clinical Psychology Analytics Engine. Generate a comprehensive ${type} report based on the user's structured journals and behavioral logs.

IMPORTANT COMPLIANCE PRINCIPLES:
1. Frame all "risk indicators" or negative patterns purely as "wellness signals" rather than clinical diagnoses.
2. Be extremely encouraging, highlighting protective behaviors, self-care routines, and positive strides.
3. Structure your response in clean JSON conforming to the requested schema.`;

    const summaryOfLogs = entries.map((e: any) => ({
      date: e.date,
      mood: e.mood,
      metrics: { energy: e.energy, motivation: e.motivation, stress: e.stress, anxiety: e.anxiety, focus: e.focus },
      sleep: `${e.sleepHours} hrs (${e.sleepQuality})`,
      physical: e.physicalActivity?.join(', ') || 'None',
      challenges: e.challengeToday,
      achievements: e.achievementToday,
      narrativeSnippet: e.text ? e.text.substring(0, 100) + '...' : ''
    }));

    const userPrompt = `Please synthesize the following journal logs from the past period for User: ${userProfile?.displayName || 'Wellness Seeker'} (hobbies: ${userProfile?.hobbies?.join(', ') || 'none'}):
${JSON.stringify(summaryOfLogs)}

Provide a thorough, high-fidelity ${type} report with:
- achievements: 3 main positive moments or streaks.
- positiveHabits: Active routines that supported their wellness.
- recurringChallenges: Stress patterns or barriers to address.
- emotionalTrends: Insights on mood stability, stress levels, and shifts over time.
- behaviorInsights: How sleep, activity, or screen time correlated with emotional metrics.
- areasOfImprovement: Actionable, humble areas to focus on for the next cycle.
- motivationalSummary: An inspiring, supportive conclusion (2-3 sentences).
- growthObservations: Notable psychological resilience signals.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            achievements: { type: Type.ARRAY, items: { type: Type.STRING } },
            positiveHabits: { type: Type.ARRAY, items: { type: Type.STRING } },
            recurringChallenges: { type: Type.ARRAY, items: { type: Type.STRING } },
            emotionalTrends: { type: Type.STRING },
            behaviorInsights: { type: Type.ARRAY, items: { type: Type.STRING } },
            areasOfImprovement: { type: Type.ARRAY, items: { type: Type.STRING } },
            motivationalSummary: { type: Type.STRING },
            growthObservations: { type: Type.STRING }
          },
          required: [
            'achievements',
            'positiveHabits',
            'recurringChallenges',
            'emotionalTrends',
            'behaviorInsights',
            'areasOfImprovement',
            'motivationalSummary',
            'growthObservations'
          ]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error('Empty response from AI report generator');
    }

    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Report generation failed. ' + error.message });
  }
});

// 4. Book Recommendations Engine Endpoint
app.post('/api/book-recommendations', async (req: Request, res: Response) => {
  try {
    const ai = getAIClient();
    const { primaryFocus, userProfile } = req.body; // e.g. stress, anxiety, productivity, burnout

    const systemInstruction = `You are MindlyticsCare's Wellness Literary Curator. Recommend 3 highly acclaimed, genuine psychological self-care, mindfulness, or productivity books.

RULES:
1. Only recommend REAL books with correct authors.
2. Provide a compelling reason linking the recommendation specifically to their primary focus ("${primaryFocus}") and their interests (${userProfile?.hobbies?.join(', ') || 'none'}).
3. Format as structured JSON.`;

    const userPrompt = `Find 3 excellent real books for a user focusing on: ${primaryFocus}.
Return a JSON array of objects, where each object has these fields:
- title: string
- author: string
- genre: string
- reason: string (Why it is recommended for their state and hobbies)
- difficulty: "Easy" | "Medium" | "Insightful"
- readingTime: string (e.g., "6 hours" or "4 hours")
- summary: string (2-3 sentences summarizing the core thesis)`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              author: { type: Type.STRING },
              genre: { type: Type.STRING },
              reason: { type: Type.STRING },
              difficulty: { type: Type.STRING, enum: ['Easy', 'Medium', 'Insightful'] },
              readingTime: { type: Type.STRING },
              summary: { type: Type.STRING }
            },
            required: ['title', 'author', 'genre', 'reason', 'difficulty', 'readingTime', 'summary']
          }
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error('Empty response from book recommendation engine');
    }

    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error('Error in book recommendations API:', error);
    res.status(500).json({ error: 'Book recommendation failed. ' + error.message });
  }
});

// 5. Setup Vite dev-server middleware or production static files
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Serve client index.html for SPA fallback
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
