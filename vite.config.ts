import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import {GoogleGenAI} from '@google/genai';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'gemini-server-api',
        configureServer(server) {
          server.middlewares.use('/api/gemini/chat', async (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405;
              res.end(JSON.stringify({error: 'Method not allowed'}));
              return;
            }

            let body = '';
            req.on('data', chunk => {
              body += chunk;
            });

            req.on('end', async () => {
              try {
                const {prompt, role, systemContext, userMessage} = JSON.parse(body || '{}');
                const apiKey = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY;

                if (!apiKey) {
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({
                    error: 'GEMINI_API_KEY is not set. Please ensure it is provided in your environment secrets.'
                  }));
                  return;
                }

                const ai = new GoogleGenAI({
                  apiKey,
                  httpOptions: {
                    headers: {
                      'User-Agent': 'aistudio-build',
                    },
                  },
                });

                const systemInstruction = `You are the specialized AI Academic & Administrative Advisor for an institution's Student Management System.
You are assisting a user with role: ${role || 'User'}.
You must be factual, polite, actionable, and base insights STRICTLY on the authorized data provided to you in the prompt/context.
Do not fabricate information, grades, attendance figures, or student details that are not in the context.
If data is missing, politely indicate that it is not on record.
Provide concise, clear, and well-structured markdown replies with bullet points or quick summaries where relevant.`;

                const fullContent = `${systemContext ? `[AUTHORIZED CONTEXT DATA]:\n${systemContext}\n\n` : ''}[USER QUERY]:\n${userMessage || prompt}`;

                const response = await ai.models.generateContent({
                  model: 'gemini-3.8-flash',
                  contents: fullContent,
                  config: {
                    systemInstruction,
                    temperature: 0.3,
                  },
                });

                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  text: response.text || 'No response generated.',
                }));
              } catch (err: any) {
                console.error('Gemini API Error:', err);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  error: err.message || 'Failed to call Gemini API'
                }));
              }
            });
          });

          server.middlewares.use('/api/gemini/report', async (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405;
              res.end(JSON.stringify({error: 'Method not allowed'}));
              return;
            }

            let body = '';
            req.on('data', chunk => {
              body += chunk;
            });

            req.on('end', async () => {
              try {
                const {department, course, semester, statsContext} = JSON.parse(body || '{}');
                const apiKey = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY;

                if (!apiKey) {
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({
                    error: 'GEMINI_API_KEY is not set.'
                  }));
                  return;
                }

                const ai = new GoogleGenAI({
                  apiKey,
                  httpOptions: {
                    headers: {
                      'User-Agent': 'aistudio-build',
                    },
                  },
                });

                const systemInstruction = `You are a high-level University Academic Dean and Institutional Quality Assurance Officer.
Generate an executive academic report in JSON format based on the structured metrics provided.
Ensure observations highlight attendance health, academic distinctions, potential academic risks, and strategic institutional follow-up actions.`;

                const prompt = `Generate a structured institutional report for:
Department: ${department || 'All Departments'}
Course: ${course || 'All Courses'}
Semester: ${semester || 'All Semesters'}

Institutional Aggregate Data:
${JSON.stringify(statsContext, null, 2)}

Respond with JSON adhering to this exact format:
{
  "title": "Institutional Academic Performance & Operations Report",
  "overview": "Summary narrative...",
  "attendanceSummary": "Summary narrative of attendance rates and high-risk groups...",
  "academicSummary": "Performance evaluation across internal and semester exams...",
  "assignmentSummary": "Assignment submission rates and syllabus progression...",
  "feeSummary": "Financial fee collection status and clearance overview...",
  "importantObservations": ["Obs 1", "Obs 2", "Obs 3"],
  "suggestedFollowUpActions": ["Action 1", "Action 2", "Action 3"]
}`;

                const response = await ai.models.generateContent({
                  model: 'gemini-3.8-flash',
                  contents: prompt,
                  config: {
                    systemInstruction,
                    responseMimeType: 'application/json',
                    temperature: 0.2,
                  },
                });

                res.setHeader('Content-Type', 'application/json');
                res.end(response.text || '{}');
              } catch (err: any) {
                console.error('Gemini Report Error:', err);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  error: err.message || 'Failed to generate report'
                }));
              }
            });
          });

          server.middlewares.use('/api/gemini/risk-analysis', async (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405;
              res.end(JSON.stringify({error: 'Method not allowed'}));
              return;
            }

            let body = '';
            req.on('data', chunk => {
              body += chunk;
            });

            req.on('end', async () => {
              try {
                const {studentData} = JSON.parse(body || '{}');
                const apiKey = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY;

                if (!apiKey) {
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({
                    error: 'GEMINI_API_KEY is not set.'
                  }));
                  return;
                }

                const ai = new GoogleGenAI({
                  apiKey,
                  httpOptions: {
                    headers: {
                      'User-Agent': 'aistudio-build',
                    },
                  },
                });

                const systemInstruction = `You are an Academic Early-Warning Risk Assessment Specialist.
Analyze the student metrics provided (Attendance %, Marks Average %, Pending Assignments, Fee clearance).
Evaluate academic risk level as 'LOW', 'MODERATE', or 'HIGH'.
Provide key observations and clear, non-punitive, supportive advisory recommendations for faculty and advisors.
Important: Always maintain that this is purely supportive advisory guidance for review.`;

                const prompt = `Analyze this student's profile:
${JSON.stringify(studentData, null, 2)}

Return a JSON with:
{
  "riskLevel": "LOW" | "MODERATE" | "HIGH",
  "score": 0-100, // 100 being best health, 0 being highest risk
  "observation": "concise observation",
  "keyFactors": ["factor 1", "factor 2"],
  "recommendedInterventions": ["intervention 1", "intervention 2"]
}`;

                const response = await ai.models.generateContent({
                  model: 'gemini-3.8-flash',
                  contents: prompt,
                  config: {
                    systemInstruction,
                    responseMimeType: 'application/json',
                    temperature: 0.2,
                  },
                });

                res.setHeader('Content-Type', 'application/json');
                res.end(response.text || '{}');
              } catch (err: any) {
                console.error('Gemini Risk Analysis Error:', err);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  error: err.message || 'Failed to analyze risk'
                }));
              }
            });
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
