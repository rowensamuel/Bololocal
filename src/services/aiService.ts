import { AIMessage, RolePlayScenario, RolePlayResult } from '../types/ai';
import { mockRolePlayScenarios } from '../data/mockData';
import { multiLanguageScenarios } from '../data/mockLanguageContent';
import { getLanguageById } from '../data/mockLanguages';

const allScenarios: RolePlayScenario[] = [
  ...mockRolePlayScenarios.map((s) => ({ ...s, language_id: s.language_id || 'mr' })),
  ...multiLanguageScenarios,
];

export const aiService = {
  getScenarios: (languageId?: string): RolePlayScenario[] => {
    if (!languageId) {
      return allScenarios;
    }
    const norm = languageId.toLowerCase();
    const filtered = allScenarios.filter((s) => s.language_id?.toLowerCase() === norm);
    return filtered.length > 0 ? filtered : allScenarios;
  },

  getScenarioById: (id: string): RolePlayScenario | undefined => {
    return allScenarios.find((s) => s.id === id);
  },

  /**
   * Generates contextual regional language tutor guidance.
   * Tailors response to the user's active learning language.
   */
  generateTutorResponse: async (
    userMessage: string,
    situation: string,
    languageId: string = 'mr'
  ): Promise<AIMessage> => {
    await new Promise((res) => setTimeout(res, 400));

    const lower = userMessage.toLowerCase();
    const lang = getLanguageById(languageId);

    // Hindi responses
    if (lang.code === 'hi') {
      if (lower.includes('order') || lower.includes('food') || situation.includes('Food')) {
        return {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: 'In Hindi, you can say:\n\nमुझे एक प्लेट छोले भटूरे चाहिए।\nMujhe ek plate chhole bhature chahiye.\nMeaning: I want one plate of chhole bhature.',
          marathiScript: 'मुझे एक प्लेट छोले भटूरे चाहिए।',
          romanTransliteration: 'Mujhe ek plate chhole bhature chahiye.',
          meaning: 'I want one plate of chhole bhature.',
          explanation: '"मुझे" (Mujhe) means "to me", and "चाहिए" (chahiye) expresses need or desire.',
          suggestedReplies: [
            'चाय कैसे मांगें? (How to ask for tea?)',
            'बिल कितना हुआ? (How much is the bill?)',
          ],
          timestamp: 'Just now',
        };
      }
    }

    // Bengali responses
    if (lang.code === 'bn') {
      return {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: 'In Bengali, you can say:\n\nআমি এক কাপ চা চাই।\nAami ek cup chaa chaai.\nMeaning: I want a cup of tea.',
        marathiScript: 'আমি এক কাপ চা চাই।',
        romanTransliteration: 'Aami ek cup chaa chaai.',
        meaning: 'I want a cup of tea.',
        explanation: '"আমি" (Aami) means "I", "চা" (chaa) is tea, and "চাই" (chaai) means want.',
        suggestedReplies: [
          'কেমন আছেন? (How are you?)',
          'এটার দাম কত? (How much does this cost?)',
        ],
        timestamp: 'Just now',
      };
    }

    // Default Marathi responses
    if (lower.includes('order') || lower.includes('restaurant') || situation === 'Restaurant') {
      return {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: 'In Marathi, you can say:\n\nमला एक वडा पाव पाहिजे.\n\nMala ek vada pav pahije.\n\nMeaning: I want one vada pav.',
        marathiScript: 'मला एक वडा पाव पाहिजे.',
        romanTransliteration: 'Mala ek vada pav pahije.',
        meaning: 'I want one vada pav.',
        explanation: '"मला" (Mala) means "to me", "एक" (ek) is one, and "पाहिजे" (pahije) expresses desire or requirement.',
        suggestedReplies: [
          'चहा कसा मागू? (How do I ask for tea?)',
          'बिल कसे मागू? (How to ask for bill?)',
          'तिखट कमी करायला कसे सांगायचे? (How to ask for less spice?)',
        ],
        timestamp: 'Just now',
      };
    }

    if (lower.includes('auto') || lower.includes('taxi') || situation === 'Auto Ride') {
      return {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: 'In Marathi, you can say:\n\nकाका, स्टेशनला मिटरने चालणार का?\n\nKaka, station-la meter ne chaalnar ka?\n\nMeaning: Uncle, will you go to the station by meter?',
        marathiScript: 'काका, स्टेशनला मिटरने चालणार का?',
        romanTransliteration: 'Kaka, station-la meter ne chaalnar ka?',
        meaning: 'Uncle, will you go to the station by meter?',
        explanation: 'Calling the driver "काका" (Kaka) or "भाऊ" (Bhau) shows respect when requesting meter fares.',
        suggestedReplies: [
          'इथे थांबवा कसे म्हणायचे? (How to say stop here?)',
          'किती पैसे झाले? (How much money?)',
        ],
        timestamp: 'Just now',
      };
    }

    // General polite greetings in selected language
    return {
      id: `ai-${Date.now()}`,
      sender: 'ai',
      text: `${lang.greeting} In ${lang.name}, you can ask questions or practice common conversational sentences! Try asking how to order food or ask for directions.`,
      marathiScript: lang.greeting,
      romanTransliteration: lang.name,
      meaning: lang.greeting_meaning,
      explanation: `Practicing spoken ${lang.name} builds speaking fluency faster.`,
      suggestedReplies: [
        'How do I say "Where is the station?"',
        'How do I say "Thank you very much"?',
      ],
      timestamp: 'Just now',
    };
  },

  generateRolePlayTurn: async (
    userMessage: string,
    scenario: RolePlayScenario,
    turn: number
  ): Promise<{ text: string; roman?: string; english?: string }> => {
    await new Promise((res) => setTimeout(res, 600));
    if (turn === 1) {
      return {
        text: 'हो, नक्कीच! आपण काय पसंत कराल किंवा किती हवे आहे?',
        roman: 'Ho, nakkich! Aapan kay pasant karal kinva kiti have aahe?',
        english: 'Yes, definitely! What would you prefer or how much do you need?',
      };
    } else if (turn === 2) {
      return {
        text: 'उत्तम निवड आहे. हे एकदम ताजे आणि उत्तम दर्जाचे आहे.',
        roman: 'Uttam nivad aahe. He ekdam taje aani uttam darjache aahe.',
        english: 'Excellent choice. This is fresh and of great quality.',
      };
    } else {
      return {
        text: 'खूप छान! तुमचे काम झाले समजा. अजून काही मदत हवी असल्यास सांगा.',
        roman: 'Khoop chhan! Tumche kaam jhale samja. Aanoon kahi madat havi aslyas sanga.',
        english: 'Very nice! Consider your request done. Let me know if you need anything else.',
      };
    }
  },

  getMockRolePlayEvaluation: (): RolePlayResult => {
    return {
      vocabularyUsed: 8,
      grammarAccuracy: 92,
      mistakesCount: 1,
      newPhrasesLearned: 4,
      strengths: ['Clear pronunciation', 'Contextually accurate responses', 'Respectful address'],
      improvementTips: ['Practice using past tense conjunctions', 'Use formal pronouns consistently'],
    };
  },

  evaluateRolePlay: async (
    scenario: RolePlayScenario,
    messages: { sender: string; text: string }[]
  ): Promise<RolePlayResult> => {
    await new Promise((res) => setTimeout(res, 800));
    const userMsgCount = messages.filter((m) => m.sender === 'user').length;
    const score = Math.min(100, Math.max(70, userMsgCount * 30));

    return {
      vocabularyUsed: Math.min(12, Math.max(4, userMsgCount * 3)),
      grammarAccuracy: score,
      mistakesCount: Math.max(0, 3 - userMsgCount),
      newPhrasesLearned: Math.min(6, Math.max(2, userMsgCount * 2)),
      strengths: [
        'Great communication attempt! You navigated the conversation respectfully.',
        'Clear sentence formation suited to the situation.',
      ],
      improvementTips: [
        'Pay attention to formal pronouns when addressing elder shopkeepers or drivers.',
        'Always end polite requests with affirmative respectful auxiliary verbs.',
      ],
    };
  },
};
