import { SituationGuide } from '../types/phrase';
import { phraseService } from './phraseService';

export const situationService = {
  getSituations: async (languageId?: string): Promise<SituationGuide[]> => {
    return phraseService.getSituations(languageId);
  },
};
