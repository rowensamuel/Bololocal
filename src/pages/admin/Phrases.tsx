import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, RefreshCw } from '../../components/common/Icons';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { AudioButton } from '../../components/common/AudioButton';
import { phraseService } from '../../services/phraseService';
import { languageService, LanguageRecord } from '../../services/languageService';
import { UsefulPhrase, SituationCategory } from '../../types/phrase';
import { useDebounce } from '../../hooks/useDebounce';

export const Phrases: React.FC = () => {
  const [phrasesList, setPhrasesList] = useState<UsefulPhrase[]>([]);
  const [languages, setLanguages] = useState<LanguageRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [selectedLang, setSelectedLang] = useState<string>('all');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPhrase, setSelectedPhrase] = useState<UsefulPhrase | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    marathi: '',
    roman: '',
    english: '',
    category: 'Daily Conversation' as SituationCategory,
    context: '',
    language_id: 'mr',
  });

  const showNotice = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [phrasesData, langData] = await Promise.all([
        phraseService.getPhrases(),
        languageService.getLanguages(),
      ]);
      setPhrasesList(phrasesData);
      setLanguages(langData);
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to fetch phrases.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = phrasesList.filter((item) => {
    const matchesLang =
      selectedLang === 'all' ||
      (item.language_id && item.language_id.toLowerCase() === selectedLang.toLowerCase());

    const s = debouncedSearch.toLowerCase();
    const matchesSearch =
      !s ||
      item.marathi.toLowerCase().includes(s) ||
      item.roman.toLowerCase().includes(s) ||
      item.english.toLowerCase().includes(s) ||
      item.category.toLowerCase().includes(s);

    return matchesLang && matchesSearch;
  });

  const handleOpenAdd = () => {
    setFormData({
      marathi: '',
      roman: '',
      english: '',
      category: 'Daily Conversation',
      context: '',
      language_id: selectedLang !== 'all' ? selectedLang : 'mr',
    });
    setIsAddModalOpen(true);
  };

  const handleAddPhrase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.marathi || !formData.english || !formData.roman) {
      showNotice('error', 'Native script, roman pronunciation, and English meaning are required.');
      return;
    }

    try {
      await phraseService.createPhrase({
        marathi: formData.marathi,
        roman: formData.roman,
        english: formData.english,
        category: formData.category,
        context: formData.context || 'General conversation',
        language_id: formData.language_id,
      });

      showNotice('success', `Phrase added successfully.`);
      setIsAddModalOpen(false);
      fetchData();
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to add phrase.');
    }
  };

  const handleOpenEdit = (phrase: UsefulPhrase) => {
    setSelectedPhrase(phrase);
    setFormData({
      marathi: phrase.marathi,
      roman: phrase.roman,
      english: phrase.english,
      category: phrase.category,
      context: phrase.context || '',
      language_id: phrase.language_id || 'mr',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdatePhrase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPhrase) return;

    try {
      await phraseService.updatePhrase(selectedPhrase.id, {
        marathi: formData.marathi,
        roman: formData.roman,
        english: formData.english,
        category: formData.category,
        context: formData.context,
        language_id: formData.language_id,
      });

      showNotice('success', `Phrase updated successfully.`);
      setIsEditModalOpen(false);
      setSelectedPhrase(null);
      fetchData();
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to update phrase.');
    }
  };

  const handleDeletePhrase = async () => {
    if (!selectedPhrase) return;

    try {
      await phraseService.deletePhrase(selectedPhrase.id);
      showNotice('success', `Phrase deleted.`);
      setIsDeleteModalOpen(false);
      setSelectedPhrase(null);
      fetchData();
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to delete phrase.');
    }
  };

  return (
    <div className="space-y-6">
      {notification && (
        <div
          className={`p-3.5 rounded-sm text-xs font-medium border flex items-center justify-between transition-colors ${
            notification.type === 'success'
              ? 'bg-[#ECEAE4] text-[#35664A] border-[#35664A]/30'
              : 'bg-[#ECEAE4] text-[#A33D36] border-[#A33D36]/30'
          }`}
        >
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="text-xs underline hover:opacity-75">
            Dismiss
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D8D6CE] pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#252622]">
            Useful Phrases ({phrasesList.length})
          </h2>
          <p className="text-xs text-[#666760] mt-0.5">
            Manage situational spoken phrases across Maharashtra transit, food markets, and everyday life.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="px-2.5 py-1.5 rounded-sm border border-[#D8D6CE] text-xs font-medium bg-[#FAF9F6] text-[#252622] focus:ring-1 focus:ring-[#52634F]"
          >
            <option value="all">All Languages</option>
            {languages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.name}
              </option>
            ))}
          </select>

          <Button variant="outline" size="sm" onClick={fetchData} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAdd}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Phrase
          </Button>
        </div>
      </div>

      <div className="w-full sm:w-80">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter phrases by text or category..."
          leftIcon={<Search className="w-3.5 h-3.5" />}
        />
      </div>

      <div className="border border-[#D8D6CE] rounded-sm bg-[#FAF9F6] overflow-x-auto">
        <table className="w-full text-left text-xs min-w-[700px]">
          <thead className="bg-[#ECEAE4] border-b border-[#D8D6CE] text-[#666760] uppercase tracking-wider font-semibold">
            <tr>
              <th className="px-4 py-3">Spoken Phrase (Script)</th>
              <th className="px-4 py-3">English Translation</th>
              <th className="px-4 py-3">Lang</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Context</th>
              <th className="px-4 py-3">Audio</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D8D6CE] text-[#252622]">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-xs text-[#666760]">Loading phrases...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-xs text-[#666760]">No phrases found.</td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[#ECEAE4]/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-marathi font-bold text-[#252622] text-sm">
                      {item.marathi}
                    </div>
                    <div className="text-xs font-semibold text-[#52634F]">
                      {item.roman}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-[#252622]">
                    "{item.english}"
                  </td>
                  <td className="px-4 py-3 uppercase font-bold text-[#666760]">
                    {item.language_id || 'mr'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="primary" size="sm">
                      {item.category}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-[#666760] max-w-xs truncate">
                    {item.context}
                  </td>
                  <td className="px-4 py-3">
                    <AudioButton textToSpeak={item.marathi} variant="icon-only" size="sm" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(item)}
                        title="Edit Phrase"
                      >
                        <Edit className="w-3.5 h-3.5 text-[#252622]" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedPhrase(item);
                          setIsDeleteModalOpen(true);
                        }}
                        title="Delete Phrase"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-[#A33D36]" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Phrase Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Situational Spoken Phrase"
        description="Add a real-life phrase with script, transliteration, English meaning, and situational context."
      >
        <form onSubmit={handleAddPhrase} className="space-y-3">
          <Input
            label="Spoken Phrase (Native Script)"
            placeholder="e.g. मला रिक्षा हवी आहे"
            value={formData.marathi}
            onChange={(e) => setFormData({ ...formData, marathi: e.target.value })}
            required
          />
          <Input
            label="Romanized Pronunciation"
            placeholder="e.g. Mala riksha havi aahe"
            value={formData.roman}
            onChange={(e) => setFormData({ ...formData, roman: e.target.value })}
            required
          />
          <Input
            label="English Meaning"
            placeholder="e.g. I need an auto-rickshaw"
            value={formData.english}
            onChange={(e) => setFormData({ ...formData, english: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#666760] uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-3 py-2 rounded-sm border border-[#D8D6CE] text-xs font-medium bg-[#FAF9F6] text-[#252622] focus:outline-none focus:ring-1 focus:ring-[#52634F]"
              >
                <option value="Daily Conversation">Daily Conversation</option>
                <option value="Auto & Local Transit">Auto & Local Transit</option>
                <option value="Vegetable Market (Bhaji Mandai)">Vegetable Market</option>
                <option value="Street Food Ordering">Street Food Ordering</option>
                <option value="College & Campus Life">College & Campus Life</option>
                <option value="Emergency & Help">Emergency & Help</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#666760] uppercase tracking-wider mb-1">
                Target Language
              </label>
              <select
                value={formData.language_id}
                onChange={(e) => setFormData({ ...formData, language_id: e.target.value })}
                className="w-full px-3 py-2 rounded-sm border border-[#D8D6CE] text-xs font-medium bg-[#FAF9F6] text-[#252622] focus:outline-none focus:ring-1 focus:ring-[#52634F]"
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Input
            label="Real-Life Usage Context"
            placeholder="e.g. Use at auto stands or street corners"
            value={formData.context}
            onChange={(e) => setFormData({ ...formData, context: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-[#D8D6CE]">
            <Button variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Phrase
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Phrase Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Situational Phrase"
        description="Update phrase text, romanization, or context notes."
      >
        <form onSubmit={handleUpdatePhrase} className="space-y-3">
          <Input
            label="Native Script Phrase"
            value={formData.marathi}
            onChange={(e) => setFormData({ ...formData, marathi: e.target.value })}
            required
          />
          <Input
            label="Romanized Pronunciation"
            value={formData.roman}
            onChange={(e) => setFormData({ ...formData, roman: e.target.value })}
            required
          />
          <Input
            label="English Meaning"
            value={formData.english}
            onChange={(e) => setFormData({ ...formData, english: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#666760] uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-3 py-2 rounded-sm border border-[#D8D6CE] text-xs font-medium bg-[#FAF9F6] text-[#252622] focus:outline-none focus:ring-1 focus:ring-[#52634F]"
              >
                <option value="Daily Conversation">Daily Conversation</option>
                <option value="Auto & Local Transit">Auto & Local Transit</option>
                <option value="Vegetable Market (Bhaji Mandai)">Vegetable Market</option>
                <option value="Street Food Ordering">Street Food Ordering</option>
                <option value="College & Campus Life">College & Campus Life</option>
                <option value="Emergency & Help">Emergency & Help</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#666760] uppercase tracking-wider mb-1">
                Target Language
              </label>
              <select
                value={formData.language_id}
                onChange={(e) => setFormData({ ...formData, language_id: e.target.value })}
                className="w-full px-3 py-2 rounded-sm border border-[#D8D6CE] text-xs font-medium bg-[#FAF9F6] text-[#252622] focus:outline-none focus:ring-1 focus:ring-[#52634F]"
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Input
            label="Real-Life Usage Context"
            value={formData.context}
            onChange={(e) => setFormData({ ...formData, context: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-[#D8D6CE]">
            <Button variant="outline" type="button" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Phrase Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Phrase"
        description={`Are you sure you want to delete phrase "${selectedPhrase?.marathi}"?`}
      >
        <div className="flex justify-end gap-2 pt-3">
          <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeletePhrase}>
            Confirm Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};
