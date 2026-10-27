import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, RefreshCw } from '../../components/common/Icons';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { AudioButton } from '../../components/common/AudioButton';
import { vocabularyService } from '../../services/vocabularyService';
import { languageService, LanguageRecord } from '../../services/languageService';
import { VocabularyItem } from '../../types/lesson';
import { useDebounce } from '../../hooks/useDebounce';

export const Vocabulary: React.FC = () => {
  const [vocabList, setVocabList] = useState<VocabularyItem[]>([]);
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
  const [selectedVocab, setSelectedVocab] = useState<VocabularyItem | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    marathi: '',
    roman: '',
    english: '',
    hindi: '',
    category: 'Greetings',
    language_id: 'mr',
    difficulty: 'Beginner',
  });

  const showNotice = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [vocabData, langData] = await Promise.all([
        vocabularyService.getAllVocabulary(),
        languageService.getLanguages(),
      ]);
      setVocabList(vocabData);
      setLanguages(langData);
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to load vocabulary.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = vocabList.filter((item) => {
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
      hindi: '',
      category: 'Greetings',
      language_id: selectedLang !== 'all' ? selectedLang : 'mr',
      difficulty: 'Beginner',
    });
    setIsAddModalOpen(true);
  };

  const handleAddWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.marathi || !formData.english || !formData.roman) {
      showNotice('error', 'Native word, pronunciation, and meaning are required.');
      return;
    }

    try {
      await vocabularyService.createVocabulary({
        marathi: formData.marathi,
        roman: formData.roman,
        english: formData.english,
        hindi: formData.hindi || '',
        category: formData.category,
        language_id: formData.language_id,
        difficulty: formData.difficulty as any,
      });

      showNotice('success', `Word "${formData.marathi}" added to vocabulary vault.`);
      setIsAddModalOpen(false);
      fetchData();
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to add word.');
    }
  };

  const handleOpenEdit = (item: VocabularyItem) => {
    setSelectedVocab(item);
    setFormData({
      marathi: item.marathi,
      roman: item.roman,
      english: item.english,
      hindi: item.hindi || '',
      category: item.category,
      language_id: item.language_id || 'mr',
      difficulty: item.difficulty || 'Beginner',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVocab) return;

    try {
      await vocabularyService.updateVocabulary(selectedVocab.id, {
        marathi: formData.marathi,
        roman: formData.roman,
        english: formData.english,
        hindi: formData.hindi,
        category: formData.category,
        language_id: formData.language_id,
      });

      showNotice('success', `Word "${formData.marathi}" updated successfully.`);
      setIsEditModalOpen(false);
      setSelectedVocab(null);
      fetchData();
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to update word.');
    }
  };

  const handleDeleteWord = async () => {
    if (!selectedVocab) return;

    try {
      await vocabularyService.deleteVocabulary(selectedVocab.id);
      showNotice('success', `Word "${selectedVocab.marathi}" deleted.`);
      setIsDeleteModalOpen(false);
      setSelectedVocab(null);
      fetchData();
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to delete word.');
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
            Vocabulary Vault ({vocabList.length})
          </h2>
          <p className="text-xs text-[#666760] mt-0.5">
            Manage high-frequency words, roman transliterations, audio, and language categories.
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
            Add Word
          </Button>
        </div>
      </div>

      <div className="w-full sm:w-80">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter words by script or meaning..."
          leftIcon={<Search className="w-3.5 h-3.5" />}
        />
      </div>

      <div className="border border-[#D8D6CE] rounded-sm bg-[#FAF9F6] overflow-x-auto">
        <table className="w-full text-left text-xs min-w-[700px]">
          <thead className="bg-[#ECEAE4] border-b border-[#D8D6CE] text-[#666760] uppercase tracking-wider font-semibold">
            <tr>
              <th className="px-4 py-3">Word (Script)</th>
              <th className="px-4 py-3">Pronunciation</th>
              <th className="px-4 py-3">English Meaning</th>
              <th className="px-4 py-3">Lang</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Audio</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D8D6CE] text-[#252622]">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-xs text-[#666760]">Loading vocabulary...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-xs text-[#666760]">No vocabulary items found.</td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[#ECEAE4]/50 transition-colors">
                  <td className="px-4 py-3 font-marathi font-bold text-[#252622] text-sm">
                    {item.marathi}
                  </td>
                  <td className="px-4 py-3 font-semibold text-[#52634F]">
                    {item.roman}
                  </td>
                  <td className="px-4 py-3 font-medium text-[#252622]">
                    {item.english}
                  </td>
                  <td className="px-4 py-3 uppercase font-bold text-[#666760]">
                    {item.language_id || 'mr'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="neutral" size="sm">
                      {item.category}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <AudioButton textToSpeak={item.marathi} variant="pill" size="sm" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(item)}
                        title="Edit Word"
                      >
                        <Edit className="w-3.5 h-3.5 text-[#252622]" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedVocab(item);
                          setIsDeleteModalOpen(true);
                        }}
                        title="Delete Word"
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

      {/* Add Word Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Vocabulary Item"
        maxWidth="md"
      >
        <form onSubmit={handleAddWord} className="space-y-3 text-xs">
          <Input
            label="Native Script Word"
            value={formData.marathi}
            onChange={(e) => setFormData({ ...formData, marathi: e.target.value })}
            placeholder="e.g. धन्यवाद"
            required
          />

          <Input
            label="Roman Transliteration"
            value={formData.roman}
            onChange={(e) => setFormData({ ...formData, roman: e.target.value })}
            placeholder="e.g. Dhanyavaad"
            required
          />

          <Input
            label="English Meaning"
            value={formData.english}
            onChange={(e) => setFormData({ ...formData, english: e.target.value })}
            placeholder="e.g. Thank you"
            required
          />

          <Input
            label="Hindi Equivalent (Optional)"
            value={formData.hindi}
            onChange={(e) => setFormData({ ...formData, hindi: e.target.value })}
            placeholder="e.g. शुक्रिया / धन्यवाद"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[#666760] uppercase tracking-wider block mb-1 text-[11px]">Language</label>
              <select
                value={formData.language_id}
                onChange={(e) => setFormData({ ...formData, language_id: e.target.value })}
                className="w-full rounded-sm border border-[#D8D6CE] bg-[#FAF9F6] px-3 py-2 text-xs text-[#252622] focus:outline-none focus:ring-1 focus:ring-[#52634F]"
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-[#666760] uppercase tracking-wider block mb-1 text-[11px]">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-sm border border-[#D8D6CE] bg-[#FAF9F6] px-3 py-2 text-xs text-[#252622] focus:outline-none focus:ring-1 focus:ring-[#52634F]"
              >
                <option value="Greetings">Greetings</option>
                <option value="Numbers">Numbers</option>
                <option value="Food & Drink">Food & Drink</option>
                <option value="Travel">Travel</option>
                <option value="College & Campus">College & Campus</option>
                <option value="Shopping">Shopping</option>
                <option value="General">General</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#D8D6CE]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Word
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Word Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Vocabulary Item"
        maxWidth="md"
      >
        <form onSubmit={handleUpdateWord} className="space-y-3 text-xs">
          <Input
            label="Native Script Word"
            value={formData.marathi}
            onChange={(e) => setFormData({ ...formData, marathi: e.target.value })}
            required
          />

          <Input
            label="Roman Transliteration"
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

          <Input
            label="Hindi Equivalent"
            value={formData.hindi}
            onChange={(e) => setFormData({ ...formData, hindi: e.target.value })}
          />

          <div className="space-y-1">
            <label className="font-semibold text-[#666760] uppercase tracking-wider block text-[11px]">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full rounded-sm border border-[#D8D6CE] bg-[#FAF9F6] px-3 py-2 text-xs text-[#252622] focus:outline-none focus:ring-1 focus:ring-[#52634F]"
            >
              <option value="Greetings">Greetings</option>
              <option value="Numbers">Numbers</option>
              <option value="Food & Drink">Food & Drink</option>
              <option value="Travel">Travel</option>
              <option value="College & Campus">College & Campus</option>
              <option value="Shopping">Shopping</option>
              <option value="General">General</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#D8D6CE]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Word Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Vocabulary Item"
        description={`Are you sure you want to delete "${selectedVocab?.marathi}" (${selectedVocab?.english})?`}
      >
        <div className="flex justify-end gap-2 pt-3">
          <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteWord}>
            Confirm Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};
