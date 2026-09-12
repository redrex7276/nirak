import { firebaseConfig } from './firebase';
import { SHRAMIK_WEBSITE_KNOWLEDGE } from './quoteService';

export interface ChatAction {
  label: string;
  route: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  actions?: ChatAction[];
  suggestedQueries?: string[];
}

const SYSTEM_PROMPT = `You are the official Shramik-Quote AI Assistant — an intelligent, friendly, and authoritative guide for the Shramik-Quote gig marketplace platform in Goa & India.

Key Platform Principles to Know & Share:
1. Two-Sided Architecture: Customers use the web portal to post jobs and review workers. Blue-collar workers (painters, plumbers, carpenters, mechanics) do NOT need smartphones or mobile internet; they receive instant cellular SMS broadcasts with simple numeric replies (reply '1' to inspect details, '1' to accept, or '0' to decline).
2. 2D Matching Engine: Ranks and dispatches gigs based on Proximity (<5km radius), Skill Matching, Language Compatibility (Marathi, Hindi, English), and Verified Work Ratings.
3. Transparent Goa Daily Wages:
   - Painters: ₹750 - ₹850/day (Exterior weather coating, scaffolding, waterproofing).
   - Plumbers: ₹800 - ₹850/day (PPR pipes, emergency leaks, sanitary fitting).
   - Carpenters: ₹850 - ₹950/day (Teak frames, modular kitchens, furniture assembly).
   - Mechanics: ₹900 - ₹1,000/day (Diesel concrete mixers, generators, site machinery).
4. Key Platform Routes:
   - Post a Job: /customer/create-work
   - Find Workers: /customer/workers
   - AI Quotes & Estimates: /quotes
   - How Platform Works: /how-it-works
   - Registration: /register

Be concise, practical, helpful, and professional. Mention relevant wage estimates or SMS workflow details whenever appropriate.`;

class ChatbotService {
  /**
   * Determine helpful UI navigation actions based on user query intent
   */
  private detectActions(query: string): ChatAction[] {
    const q = query.toLowerCase();
    const actions: ChatAction[] = [];

    if (q.includes('post') || q.includes('hire') || q.includes('need') || q.includes('create') || q.includes('book')) {
      actions.push({ label: 'Post Work Now', route: '/customer/create-work' });
      actions.push({ label: 'View Quotes', route: '/quotes' });
    } else if (q.includes('rate') || q.includes('wage') || q.includes('cost') || q.includes('price') || q.includes('quote')) {
      actions.push({ label: 'AI Quotes & Rates', route: '/quotes' });
      actions.push({ label: 'Post Job', route: '/customer/create-work' });
    } else if (q.includes('worker') || q.includes('painter') || q.includes('plumber') || q.includes('carpenter') || q.includes('mechanic')) {
      actions.push({ label: 'Find Verified Workers', route: '/customer/workers' });
      actions.push({ label: 'View Estimates', route: '/quotes' });
    } else if (q.includes('sms') || q.includes('work') || q.includes('how') || q.includes('offline') || q.includes('phone')) {
      actions.push({ label: 'How It Works', route: '/how-it-works' });
      actions.push({ label: 'Register as Worker', route: '/register/freelancer' });
    } else if (q.includes('register') || q.includes('join') || q.includes('signup') || q.includes('sign up')) {
      actions.push({ label: 'Customer Sign Up', route: '/register/customer' });
      actions.push({ label: 'Freelancer Sign Up', route: '/register/freelancer' });
    }

    // Default actions if none matched
    if (actions.length === 0) {
      actions.push({ label: 'Post Work', route: '/customer/create-work' });
      actions.push({ label: 'How It Works', route: '/how-it-works' });
    }

    return actions;
  }

  /**
   * Local Knowledge Synthesis Engine (100% offline & Spark safe)
   */
  generateLocalKnowledgeReply(userQuery: string): { reply: string; actions: ChatAction[]; suggestions: string[] } {
    const q = userQuery.toLowerCase();
    const actions = this.detectActions(userQuery);
    let reply = '';
    let suggestions: string[] = [];

    // 1. SMS & Zero Data dispatch queries
    if (q.includes('sms') || q.includes('without internet') || q.includes('offline') || q.includes('phone') || q.includes('reply 1')) {
      reply = `**The Zero-Data SMS Opportunity Bridge:**\n\n` +
        `• **No App or Smartphone Required:** Blue-collar workers receive direct cellular SMS job alerts anywhere in Goa.\n` +
        `• **Two-Step Numeric Response:** Workers reply **1** to view project details & wages, and reply **1** to accept or **0** to decline.\n` +
        `• **First-Confirm Allocation:** The first verified qualified worker to reply **1** locks in the assignment with instant customer confirmation.`;
      suggestions = ['How does matching work?', 'What are painter rates?', 'Hire 10 painters in Mapusa'];
    }
    // 2. Painting work
    else if (q.includes('paint') || q.includes('wall') || q.includes('coat')) {
      reply = `**Painting Services & Rates:**\n\n` +
        `• **Standard Wages:** Master painters receive ₹800 - ₹850/day; helpers/prep crew receive ₹750/day.\n` +
        `• **Verified Specialists:** Top Mapusa painter *Ramesh Naik* (4.8★, 126 completed jobs) specializes in multi-storey exterior acrylic emulsions, weatherproofing, and scaffolding.\n` +
        `• **Bulk Crew Dispatch:** You can request up to 10 painters at once for residential or commercial projects.`;
      suggestions = ['Post a painting job', 'What are plumber rates?', 'How does SMS dispatch work?'];
    }
    // 3. Plumbing work
    else if (q.includes('plumb') || q.includes('leak') || q.includes('pipe') || q.includes('drain') || q.includes('tap')) {
      reply = `**Plumbing Services & Rates:**\n\n` +
        `• **Standard Wages:** ₹800 - ₹850/day or ₹350 for rapid emergency callout inspection.\n` +
        `• **Specialist Match:** *Sunil Gaonkar* (Porvorim, 4.8★, 118 jobs) handles concealed PPR pipe welding, bathroom leak detection, and overhead tank valves.\n` +
        `• **Urgent Dispatch:** Emergency leaks trigger an immediate SMS broadcast to verified plumbers within 5km.`;
      suggestions = ['Hire a plumber', 'What are carpenter rates?', 'How does the 2D matching engine score workers?'];
    }
    // 4. Carpentry work
    else if (q.includes('carpent') || q.includes('wood') || q.includes('door') || q.includes('kitchen') || q.includes('furniture')) {
      reply = `**Carpentry Services & Rates:**\n\n` +
        `• **Standard Wages:** ₹850 - ₹950/day for certified craftsmen.\n` +
        `• **Specialist Match:** *Ganesh More* (Panjim, 4.8★, 110 jobs) carries ITI certification in precision door frame alignment, modular kitchen fittings, and teak woodwork.\n` +
        `• **Tools:** Artisans arrive with their own professional power equipment.`;
      suggestions = ['Book a carpenter', 'What are mechanic rates?', 'Post work now'];
    }
    // 5. Machinery & Mechanic work
    else if (q.includes('mechanic') || q.includes('engine') || q.includes('generator') || q.includes('mixer') || q.includes('diesel')) {
      reply = `**Heavy Machinery & Mechanic Support:**\n\n` +
        `• **Standard Wages:** ₹900 - ₹1,000/day for certified plant engineers.\n` +
        `• **Specialist Match:** *Anand Jadhav* (Mapusa, 4.9★, 160 jobs) specializes in diesel concrete mixers (10/7), 25kVA site generators, and hydraulic pump repairs with on-site diagnostic kits.\n` +
        `• **Response Time:** Rapid 30-minute arrival across North Goa construction sites.`;
      suggestions = ['Hire a mechanic', 'How does SMS dispatch work?', 'View all quotes'];
    }
    // 6. Wages & Pricing inquiry
    else if (q.includes('wage') || q.includes('rate') || q.includes('price') || q.includes('cost') || q.includes('budget') || q.includes('salary')) {
      reply = `**Official Goa Daily Wage Benchmarks on Shramik:**\n\n` +
        `| Trade Category | Daily Wage Rate | Typical Scope |\n` +
        `| :--- | :--- | :--- |\n` +
        `| **Painter** | ₹750 – ₹850 / day | Surface prep, emulsion, weatherproofing |\n` +
        `| **Plumber** | ₹800 – ₹850 / day | Pipe welding, sanitary fitting, leak repair |\n` +
        `| **Carpenter** | ₹850 – ₹950 / day | Door frames, modular shutters, cabinetry |\n` +
        `| **Mechanic** | ₹900 – ₹1,000 / day | Diesel mixers, generators, site machinery |\n\n` +
        `*Wages are paid with 0% middleman commission deducted from worker earnings.*`;
      suggestions = ['Post a job with this budget', 'How are workers verified?', 'Check AI Quote estimates'];
    }
    // 7. How matching engine works
    else if (q.includes('match') || q.includes('algorithm') || q.includes('how it works') || q.includes('engine')) {
      reply = `**The Shramik 2D Matching Engine:**\n\n` +
        `When you post a job, our algorithm calculates a composite match index using 4 core vectors:\n` +
        `1. **Proximity Score:** Highest weight for workers within 2–5km of your job site.\n` +
        `2. **Trade Skill Overlap:** Primary certification (e.g. PPR welding, scaffolding) vs general helpers.\n` +
        `3. **Language Compatibility:** Marathi, Hindi, and English communication matches.\n` +
        `4. **Verified Performance:** Historical completion rate and customer rating ledger.`;
      suggestions = ['Post work to test matching', 'How does SMS work?', 'What are the wage rates?'];
    }
    // 8. General fallback using Semantic Knowledge Items
    else {
      reply = `Welcome to **Shramik-Quote**! I can help you with:\n\n` +
        `• **Posting Jobs:** Dispatch work for painters, plumbers, carpenters, or machinery mechanics across Goa.\n` +
        `• **Zero-Data SMS Dispatch:** Workers receive opportunities directly via cellular text messages without internet.\n` +
        `• **Verified Rates:** Transparent daily wage bands (₹750 – ₹950/day).\n` +
        `• **Worker Discovery:** Instant geo-matched worker recommendations based on trade skills and ratings.`;
      suggestions = ['How does SMS dispatch work?', 'Hire 10 painters in Mapusa', 'What are plumber wage rates?', 'Post a new job'];
    }

    return { reply, actions, suggestions };
  }

  /**
   * Send user message and return structured bot response
   */
  async sendMessage(userQuery: string, history: ChatMessage[] = []): Promise<ChatMessage> {
    const actions = this.detectActions(userQuery);
    const local = this.generateLocalKnowledgeReply(userQuery);

    // Try Gemini API if internet and key are accessible
    const apiKey = firebaseConfig.apiKey;
    if (apiKey && apiKey.startsWith('AIza')) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [
                    {
                      text: `${SYSTEM_PROMPT}\n\nContext knowledge available: ${JSON.stringify(SHRAMIK_WEBSITE_KNOWLEDGE.map(k => ({ title: k.title, category: k.category, wage: k.wage, advice: k.aiAdvice })))}\n\nUser Question: ${userQuery}`
                    }
                  ]
                }
              ],
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 600
              }
            })
          }
        );

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (generatedText && generatedText.trim().length > 10) {
            return {
              id: 'bot-' + Date.now(),
              sender: 'bot',
              text: generatedText.trim(),
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              actions,
              suggestedQueries: local.suggestions
            };
          }
        }
      } catch {
        // Fallback gracefully to local knowledge reply
      }
    }

    // Default reliable response from Local RAG
    return {
      id: 'bot-' + Date.now(),
      sender: 'bot',
      text: local.reply,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actions: local.actions,
      suggestedQueries: local.suggestions
    };
  }
}

export const chatbotService = new ChatbotService();
