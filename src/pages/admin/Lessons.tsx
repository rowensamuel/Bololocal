import React, { useState, useEffect } from 'react';
import { Plus, BookOpen, Clock, Edit, Eye, Trash2, RefreshCw } from '../../components/common/Icons';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { lessonService } from '../../services/lessonService';
import { languageService, LanguageRecord } from '../../services/languageService';
import { Lesson } from '../../types/lesson';
import { Link } from 'react-router-dom';

export const Lessons: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [languages, setLanguages] = useState<LanguageRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLang, setSelectedLang] = useState<string>('all');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    marathiTitle: '',
    shortDescription: '',
    language_id: 'mr',
    number: '1',
    difficulty: 'Beginner',
    durationMinutes: '15',
    xpReward: '50',
  });

  const showNotice = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [lessonData, langData] = await Promise.all([
        lessonService.getLessons(),
        languageService.getLanguages(),
      ]);
      setLessons(lessonData);
      setLanguages(langData);
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to fetch lessons.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredLessons = lessons.filter((l) => {
    if (selectedLang === 'all') return true;
    return l.language_id?.toLowerCase() === selectedLang.toLowerCase();
  });

  const handleOpenAdd = () => {
    setFormData({
      title: '',
      marathiTitle: '',
      shortDescription: '',
      language_id: selectedLang !== 'all' ? selectedLang : 'mr',
      number: String(lessons.length + 1),
      difficulty: 'Beginner',
      durationMinutes: '15',
      xpReward: '50',
    });
    setIsAddModalOpen(true);
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      showNotice('error', 'Lesson title is required.');
      return;
    }

    try {
      await lessonService.createLesson({
        title: formData.title,
        marathiTitle: formData.marathiTitle || formData.title,
        shortDescription: formData.shortDescription || 'Conversational practice unit',
        language_id: formData.language_id,
        number: String(formData.number || 1),
        difficulty: formData.difficulty as any,
        durationMinutes: Number(formData.durationMinutes) || 15,
        xpReward: Number(formData.xpReward) || 50,
      });

      showNotice('success', `Lesson "${formData.title}" created successfully.`);
      setIsAddModalOpen(false);
      fetchData();
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to create lesson.');
    }
  };

  const handleOpenEdit = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setFormData({
      title: lesson.title,
      marathiTitle: lesson.marathiTitle || '',
      shortDescription: lesson.shortDescription || '',
      language_id: lesson.language_id || 'mr',
      number: String(lesson.number || 1),
      difficulty: lesson.difficulty || 'Beginner',
      durationMinutes: String(lesson.durationMinutes || 15),
      xpReward: String(lesson.xpReward || 50),
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLesson) return;

    try {
      await lessonService.updateLesson(selectedLesson.id, {
        title: formData.title,
        marathiTitle: formData.marathiTitle,
        shortDescription: formData.shortDescription,
        number: String(formData.number || 1),
        difficulty: formData.difficulty as any,
        durationMinutes: Number(formData.durationMinutes) || 15,
        xpReward: Number(formData.xpReward) || 50,
      });

      showNotice('success', `Lesson "${formData.title}" updated successfully.`);
      setIsEditModalOpen(false);
      setSelectedLesson(null);
      fetchData();
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to update lesson.');
    }
  };

  const handleDeleteLesson = async () => {
    if (!selectedLesson) return;

    try {
      await lessonService.deleteLesson(selectedLesson.id);
      showNotice('success', `Lesson "${selectedLesson.title}" deleted.`);
      setIsDeleteModalOpen(false);
      setSelectedLesson(null);
      fetchData();
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to delete lesson.');
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
            Lessons Studio ({lessons.length})
          </h2>
          <p className="text-xs text-[#666760] mt-0.5">
            Structured curriculum units with vocabulary, dialogues, and practice exercises.
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
            New Lesson Unit
          </Button>
        </div>
      </div>

      <div className="border border-[#D8D6CE] rounded-sm bg-[#FAF9F6] overflow-x-auto">
        <table className="w-full text-left text-xs min-w-[640px]">
          <thead className="bg-[#ECEAE4] border-b border-[#D8D6CE] text-[#666760] uppercase tracking-wider font-semibold">
            <tr>
              <th className="px-4 py-3">Unit</th>
              <th className="px-4 py-3">Lesson Title</th>
              <th className="px-4 py-3">Native Script</th>
              <th className="px-4 py-3">Lang</th>
              <th className="px-4 py-3">Difficulty</th>
              <th className="px-4 py-3">Duration</th>
              <th className="px-4 py-3">XP</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D8D6CE] text-[#252622]">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="text-center py-10 text-xs text-[#666760]">Loading lessons...</td>
              </tr>
            ) : filteredLessons.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-10 text-xs text-[#666760]">No lessons found.</td>
              </tr>
            ) : (
              filteredLessons.map((lesson) => (
                <tr key={lesson.id} className="hover:bg-[#ECEAE4]/50 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-[#666760]">
                    #{lesson.number}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-[#252622]">{lesson.title}</div>
                    <div className="text-[11px] text-[#666760] line-clamp-1">
                      {lesson.shortDescription}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-marathi font-bold text-[#252622] text-sm">
                    {lesson.marathiTitle}
                  </td>
                  <td className="px-4 py-3 uppercase font-bold text-[#52634F]">
                    {lesson.language_id || 'mr'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={lesson.difficulty === 'Beginner' ? 'success' : 'neutral'}
                      size="sm"
                    >
                      {lesson.difficulty}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-medium">{lesson.durationMinutes} mins</td>
                  <td className="px-4 py-3 font-mono font-bold text-[#52634F]">+{lesson.xpReward} XP</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link to={`/lesson/${lesson.id}`} title="Preview lesson">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-3.5 h-3.5 mr-1" /> View
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(lesson)}
                        title="Edit Lesson"
                      >
                        <Edit className="w-3.5 h-3.5 text-[#252622]" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedLesson(lesson);
                          setIsDeleteModalOpen(true);
                        }}
                        title="Delete Lesson"
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

      {/* Add Lesson Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Lesson Unit"
        description="Register a curriculum lesson unit with title, script, and learning objectives."
      >
        <form onSubmit={handleCreateLesson} className="space-y-3">
          <Input
            label="Lesson Title (English)"
            placeholder="e.g. Asking for Directions"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <Input
            label="Native Script Title"
            placeholder="e.g. रस्ता विचारणे"
            value={formData.marathiTitle}
            onChange={(e) => setFormData({ ...formData, marathiTitle: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
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
            <Input
              label="Unit Number"
              placeholder="e.g. 1"
              value={formData.number}
              onChange={(e) => setFormData({ ...formData, number: e.target.value })}
            />
          </div>
          <Input
            label="Short Description"
            placeholder="Overview of conversation topics..."
            value={formData.shortDescription}
            onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Duration (minutes)"
              type="number"
              value={formData.durationMinutes}
              onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
            />
            <Input
              label="XP Reward"
              type="number"
              value={formData.xpReward}
              onChange={(e) => setFormData({ ...formData, xpReward: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#D8D6CE]">
            <Button variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Lesson
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Lesson Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Lesson Unit"
        description="Update lesson details, difficulty, or reward points."
      >
        <form onSubmit={handleUpdateLesson} className="space-y-3">
          <Input
            label="Lesson Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <Input
            label="Native Script Title"
            value={formData.marathiTitle}
            onChange={(e) => setFormData({ ...formData, marathiTitle: e.target.value })}
          />
          <Input
            label="Unit Number"
            value={formData.number}
            onChange={(e) => setFormData({ ...formData, number: e.target.value })}
          />
          <Input
            label="Short Description"
            value={formData.shortDescription}
            onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Duration (minutes)"
              type="number"
              value={formData.durationMinutes}
              onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
            />
            <Input
              label="XP Reward"
              type="number"
              value={formData.xpReward}
              onChange={(e) => setFormData({ ...formData, xpReward: e.target.value })}
            />
          </div>

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

      {/* Delete Lesson Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Lesson"
        description={`Are you sure you want to delete lesson "${selectedLesson?.title}"?`}
      >
        <div className="flex justify-end gap-2 pt-3">
          <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteLesson}>
            Confirm Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};
