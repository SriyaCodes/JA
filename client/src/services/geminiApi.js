import axios from 'axios';

/**
 * getGeminiReply
 * ---------------
 * @param {string} prompt  The user‑facing or system prompt
 * @param {string} lang    Language code ('hi', 'te', 'ta', 'en', ...)
 * @param {'chat' | 'journal'} mode  Defaults to 'chat'.
 *
 * • In **chat** mode we prepend a system prompt that makes Janani
 *   practical first and poetic only when appropriate.
 * • In **journal** mode we forward the prompt verbatim (so your
 *   JournalPage keeps total control).
 */
export const getGeminiReply = async (prompt, lang, mode = 'chat') => {
  try {
    let finalPrompt = prompt;

    if (mode === 'chat') {
      // ---------- System instructions for everyday Q&A --------------------
      const systemPrompt = `
You are **Janani**, a caring, evidence‑based maternity companion.

RULES
1. Answer exclusively in the user’s language: ${lang}.
2. If the user asks a PRACTICAL pregnancy‑related question
   (e.g. hunger, diet, nausea, exercise, medication, pain),
   give clear, safe, culturally familiar suggestions first
   (bullet list or short paragraphs), then add one gentle,
   encouraging line.

3. If the user shares feelings or reflections, respond with
   empathy; poetic touches are fine **only when the user is
   already emotional or reflective**.
4. Never add unrelated poetic imagery to practical questions.
5. Keep replies under 120 words.
6. if the user just talks about greeting or casual conversation like how are you what are you doing etc, do not add encouraging line. 

User message ↓
${prompt}
      `.trim();

      finalPrompt = systemPrompt;
    }

    // ---------- Call your backend → Gemini -------------------------------
    const { data } = await axios.post(
      'https://ja-ten.vercel.app/api/gemini',
      { prompt: finalPrompt, lang }
    );

    return data.reply || 'No reply.';
  } catch (err) {
    console.error('Gemini API error:', err);
    throw err;
  }
};
