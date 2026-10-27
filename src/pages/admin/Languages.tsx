import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, RefreshCw } from '../../components/common/Icons';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { languageService, LanguageRecord } from '../../services/languageService';

export const Languages: React.FC = () => {
  const [languages, setLanguages] = useState<LanguageRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageRecord | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    nativeName: '',
    script: '',
    flag: '🇮🇳',
    greeting: '',
    greetingMeaning: '',
  });

  const showNotice = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchLanguages = async () => {
    setIsLoading(true);
    try {
      const data = await languageService.getLanguages();
      setLanguages(data);
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to fetch languages.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLanguages();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      code: '',
      name: '',
      nativeName: '',
      script: '',
      flag: '🇮🇳',
      greeting: '',
      greetingMeaning: '',
    });
    setIsAddModalOpen(true);
  };

  const handleCreateLanguage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.name || !formData.nativeName) {
      showNotice('error', 'Language code, name, and native script name are required.');
      return;
    }

    try {
      const created = await languageService.createLanguage({
        id: formData.code.toLowerCase(),
        code: formData.code.toLowerCase(),
        name: formData.name,
        native_name: formData.nativeName,
        script: formData.script || 'Native Script',
        flag: formData.flag || '🇮🇳',
        greeting: formData.greeting || 'Namaste',
        greeting_meaning: formData.greetingMeaning || 'Greetings to you',
        is_active: true,
      });

      showNotice('success', `Language "${created.name}" created successfully.`);
      setIsAddModalOpen(false);
      fetchLanguages();
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to create language.');
    }
  };

  const handleOpenEdit = (lang: LanguageRecord) => {
    setSelectedLanguage(lang);
    setFormData({
      code: lang.code,
      name: lang.name,
      nativeName: lang.native_name,
      script: lang.script,
      flag: lang.flag || '🇮🇳',
      greeting: lang.greeting || '',
      greetingMeaning: lang.greeting_meaning || '',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateLanguage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLanguage) return;

    try {
      await languageService.updateLanguage(selectedLanguage.id, {
        name: formData.name,
        native_name: formData.nativeName,
        script: formData.script,
        flag: formData.flag,
        greeting: formData.greeting,
        greeting_meaning: formData.greetingMeaning,
      });

      showNotice('success', `Language "${formData.name}" updated successfully.`);
      setIsEditModalOpen(false);
      setSelectedLanguage(null);
      fetchLanguages();
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to update language.');
    }
  };

  const handleDeleteLanguage = async () => {
    if (!selectedLanguage) return;

    try {
      await languageService.deleteLanguage(selectedLanguage.id);
      showNotice('success', `Language "${selectedLanguage.name}" deleted.`);
      setIsDeleteModalOpen(false);
      setSelectedLanguage(null);
      fetchLanguages();
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to delete language.');
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
            Language Offerings ({languages.length})
          </h2>
          <p className="text-xs text-[#666760] mt-0.5">
            Configure target regional languages, scripts, greeting phrases, and curriculum status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchLanguages} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAdd}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Language
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-xs text-[#666760]">Loading languages...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {languages.map((lang) => (
            <Card key={lang.id} padding="md" className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <span className="text-xl font-bold font-marathi text-[#52634F] block">
                    {lang.native_name}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{lang.flag}</span>
                    <h3 className="text-sm font-bold text-[#252622]">{lang.name}</h3>
                  </div>
                  <p className="text-[11px] text-[#666760] font-mono">
                    Code: <strong className="uppercase">{lang.code}</strong>, Script: {lang.script}
                  </p>
                </div>

                <Badge variant={lang.is_active ? 'success' : 'neutral'} size="sm">
                  {lang.code === 'mr' ? 'Flagship' : lang.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              <div className="p-2.5 rounded-sm bg-[#ECEAE4] border border-[#D8D6CE] text-xs">
                <span className="text-[10px] uppercase font-bold text-[#666760] block">Greeting</span>
                <span className="font-semibold text-[#252622]">{lang.greeting || 'Namaste'}</span>
                {lang.greeting_meaning && (
                  <span className="block text-[#666760] text-[11px] mt-0.5">"{lang.greeting_meaning}"</span>
                )}
              </div>

              <div className="pt-2 flex justify-between items-center border-t border-[#D8D6CE]">
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(lang)} title="Edit Language">
                    <Edit className="w-3.5 h-3.5 text-[#252622]" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedLanguage(lang);
                      setIsDeleteModalOpen(true);
                    }}
                    title="Delete Language"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-[#A33D36]" />
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Link to="/admin/courses">
                    <Button variant="outline" size="sm">
                      Curriculum
                    </Button>
                  </Link>
                  <Link to="/admin/lessons">
                    <Button variant="secondary" size="sm">
                      Lessons
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Language Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Regional Language"
        description="Register a new language to enable curriculum, lessons, and quiz generation."
      >
        <form onSubmit={handleCreateLanguage} className="space-y-3">
          <Input
            label="Language Code (2-3 letters)"
            placeholder="e.g. pa, or, as, ml"
            value={formData.code}
            maxLength={4}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            required
          />
          <Input
            label="Language Name (English)"
            placeholder="e.g. Punjabi, Odia, Assamese"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Native Script Name"
            placeholder="e.g. ਪੰਜਾਬੀ, ଓଡ଼ିଆ"
            value={formData.nativeName}
            onChange={(e) => setFormData({ ...formData, nativeName: e.target.value })}
            required
          />
          <Input
            label="Script Writing System"
            placeholder="e.g. Gurmukhi, Odia script"
            value={formData.script}
            onChange={(e) => setFormData({ ...formData, script: e.target.value })}
          />
          <Input
            label="Standard Greeting"
            placeholder="e.g. Sat Sri Akal, Namaskar"
            value={formData.greeting}
            onChange={(e) => setFormData({ ...formData, greeting: e.target.value })}
          />
          <Input
            label="Greeting Meaning"
            placeholder="e.g. Truth is the Timeless One"
            value={formData.greetingMeaning}
            onChange={(e) => setFormData({ ...formData, greetingMeaning: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-[#D8D6CE]">
            <Button variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Register Language
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Language Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Language"
        description="Update language presentation, script, or greeting phrase."
      >
        <form onSubmit={handleUpdateLanguage} className="space-y-3">
          <Input
            label="Language Code (Fixed)"
            value={formData.code}
            disabled
          />
          <Input
            label="Language Name (English)"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Native Script Name"
            value={formData.nativeName}
            onChange={(e) => setFormData({ ...formData, nativeName: e.target.value })}
            required
          />
          <Input
            label="Script Writing System"
            value={formData.script}
            onChange={(e) => setFormData({ ...formData, script: e.target.value })}
          />
          <Input
            label="Standard Greeting"
            value={formData.greeting}
            onChange={(e) => setFormData({ ...formData, greeting: e.target.value })}
          />
          <Input
            label="Greeting Meaning"
            value={formData.greetingMeaning}
            onChange={(e) => setFormData({ ...formData, greetingMeaning: e.target.value })}
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Language"
        description={`Are you sure you want to delete ${selectedLanguage?.name} (${selectedLanguage?.code})? This action cannot be undone.`}
      >
        <div className="flex justify-end gap-2 pt-3">
          <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteLanguage}>
            Confirm Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};
