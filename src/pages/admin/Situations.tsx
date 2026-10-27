import React, { useState, useEffect } from 'react';
import { Plus, Compass, MapPin, Edit, Trash2, RefreshCw } from '../../components/common/Icons';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { phraseService } from '../../services/phraseService';
import { languageService, LanguageRecord } from '../../services/languageService';
import { SituationGuide, SituationCategory } from '../../types/phrase';

export const Situations: React.FC = () => {
  const [situations, setSituations] = useState<SituationGuide[]>([]);
  const [languages, setLanguages] = useState<LanguageRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLang, setSelectedLang] = useState<string>('all');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSit, setSelectedSit] = useState<SituationGuide | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    category: 'Daily Conversation' as SituationCategory,
    icon: 'context',
    description: '',
    language_id: 'mr',
  });

  const showNotice = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [sitData, langData] = await Promise.all([
        phraseService.getSituations(),
        languageService.getLanguages(),
      ]);
      setSituations(sitData);
      setLanguages(langData);
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to fetch situations.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = situations.filter((sit) => {
    if (selectedLang === 'all') return true;
    return sit.language_id?.toLowerCase() === selectedLang.toLowerCase();
  });

  const handleOpenAdd = () => {
    setFormData({
      title: '',
      category: 'Daily Conversation',
      icon: 'context',
      description: '',
      language_id: selectedLang !== 'all' ? selectedLang : 'mr',
    });
    setIsAddModalOpen(true);
  };

  const handleCreateSituation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      showNotice('error', 'Situation title is required.');
      return;
    }

    try {
      await phraseService.createSituation({
        title: formData.title,
        category: formData.category,
        icon: formData.icon,
        description: formData.description || 'Situational spoken guide',
        language_id: formData.language_id,
        phraseCount: 0,
      });

      showNotice('success', `Situation "${formData.title}" created successfully.`);
      setIsAddModalOpen(false);
      fetchData();
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to create situation.');
    }
  };

  const handleOpenEdit = (sit: SituationGuide) => {
    setSelectedSit(sit);
    setFormData({
      title: sit.title,
      category: sit.category,
      icon: sit.icon || 'context',
      description: sit.description || '',
      language_id: sit.language_id || 'mr',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateSituation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSit) return;

    try {
      await phraseService.updateSituation(selectedSit.id, {
        title: formData.title,
        category: formData.category,
        icon: formData.icon,
        description: formData.description,
      });

      showNotice('success', `Situation "${formData.title}" updated successfully.`);
      setIsEditModalOpen(false);
      setSelectedSit(null);
      fetchData();
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to update situation.');
    }
  };

  const handleDeleteSituation = async () => {
    if (!selectedSit) return;

    try {
      await phraseService.deleteSituation(selectedSit.id);
      showNotice('success', `Situation deleted.`);
      setIsDeleteModalOpen(false);
      setSelectedSit(null);
      fetchData();
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to delete situation.');
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
            Situational Guides ({situations.length})
          </h2>
          <p className="text-xs text-[#666760] mt-0.5">
            Real-world encounter modules (transit, market negotiation, ordering food, office interactions).
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
            Add Situation
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-xs text-[#666760]">Loading situational guides...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((sit) => (
            <Card key={sit.id} padding="md" className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="p-2 rounded-sm bg-[#ECEAE4] border border-[#D8D6CE] text-[#52634F] shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-[#252622] truncate">{sit.title}</h3>
                    <Badge variant="neutral" size="sm" className="mt-1">
                      {sit.category}
                    </Badge>
                  </div>
                </div>
                <span className="text-xs font-medium text-[#52634F] bg-[#ECEAE4] border border-[#D8D6CE] px-2 py-0.5 rounded-sm shrink-0">
                  {sit.phraseCount} Phrases
                </span>
              </div>

              <p className="text-xs text-[#666760] leading-relaxed">
                {sit.description}
              </p>

              <div className="pt-2 border-t border-[#D8D6CE] flex items-center justify-between text-xs">
                <span className="text-[#666760] font-medium text-[11px]">Practical Guide</span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEdit(sit)}
                    title="Edit Guide"
                  >
                    <Edit className="w-3.5 h-3.5 text-[#252622]" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedSit(sit);
                      setIsDeleteModalOpen(true);
                    }}
                    title="Delete Guide"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-[#A33D36]" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Situation Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Situational Guide"
        description="Create a context scenario with phrases for real-world interactions."
      >
        <form onSubmit={handleCreateSituation} className="space-y-3">
          <Input
            label="Situation Title"
            placeholder="e.g. Taking an Auto Rickshaw"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#666760] uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as SituationCategory })}
                className="w-full px-3 py-2 rounded-sm border border-[#D8D6CE] text-xs font-medium bg-[#FAF9F6] text-[#252622] focus:outline-none focus:ring-1 focus:ring-[#52634F]"
              >
                <option value="Daily Conversation">Daily Conversation</option>
                <option value="Auto / Taxi">Auto / Taxi</option>
                <option value="Restaurant">Restaurant</option>
                <option value="College">College</option>
                <option value="Shopping">Shopping</option>
                <option value="Travel">Travel</option>
                <option value="Hospital">Hospital</option>
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
            label="Description"
            placeholder="Helpful advice on how to greet and negotiate..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-[#D8D6CE]">
            <Button variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Guide
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Situation Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Situational Guide"
      >
        <form onSubmit={handleUpdateSituation} className="space-y-3">
          <Input
            label="Situation Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <div>
            <label className="block text-xs font-semibold text-[#666760] uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as SituationCategory })}
              className="w-full px-3 py-2 rounded-sm border border-[#D8D6CE] text-xs font-medium bg-[#FAF9F6] text-[#252622] focus:outline-none focus:ring-1 focus:ring-[#52634F]"
            >
              <option value="Daily Conversation">Daily Conversation</option>
              <option value="Auto / Taxi">Auto / Taxi</option>
              <option value="Restaurant">Restaurant</option>
              <option value="College">College</option>
              <option value="Shopping">Shopping</option>
              <option value="Travel">Travel</option>
              <option value="Hospital">Hospital</option>
            </select>
          </div>
          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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

      {/* Delete Situation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Situation"
        description={`Are you sure you want to delete guide "${selectedSit?.title}"?`}
      >
        <div className="flex justify-end gap-2 pt-3">
          <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteSituation}>
            Confirm Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};
