import React, { useState, useEffect } from 'react';
import { Plus, Timer, Clock, Zap, Edit, Trash2, RefreshCw } from '../../components/common/Icons';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { timedQuizService } from '../../services/timedQuizService';
import { languageService, LanguageRecord } from '../../services/languageService';
import { TimedQuiz } from '../../types/timedQuiz';
import { Link } from 'react-router-dom';

export const TimedQuizzes: React.FC = () => {
  const [timedQuizzes, setTimedQuizzes] = useState<TimedQuiz[]>([]);
  const [languages, setLanguages] = useState<LanguageRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLang, setSelectedLang] = useState<string>('all');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<TimedQuiz | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    language_id: 'mr',
    difficulty: 'Beginner',
    mode: 'Quick Challenge',
    time_limit_seconds: '30',
    xp_reward: '60',
  });

  const showNotice = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [tqData, langData] = await Promise.all([
        timedQuizService.getTimedQuizzes(),
        languageService.getLanguages(),
      ]);
      setTimedQuizzes(tqData);
      setLanguages(langData);
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to fetch timed quizzes.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = timedQuizzes.filter((tq) => {
    if (selectedLang === 'all') return true;
    return tq.language_id?.toLowerCase() === selectedLang.toLowerCase();
  });

  const handleOpenAdd = () => {
    setFormData({
      title: '',
      description: '',
      language_id: selectedLang !== 'all' ? selectedLang : 'mr',
      difficulty: 'Beginner',
      mode: 'Quick Challenge',
      time_limit_seconds: '30',
      xp_reward: '60',
    });
    setIsAddModalOpen(true);
  };

  const handleCreateTimedQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      showNotice('error', 'Challenge title is required.');
      return;
    }

    try {
      await timedQuizService.createTimedQuiz({
        title: formData.title,
        description: formData.description || 'Speed vocabulary challenge',
        language_id: formData.language_id,
        difficulty: formData.difficulty as any,
        mode: formData.mode as any,
        time_limit_seconds: Number(formData.time_limit_seconds) || 30,
        xp_reward: Number(formData.xp_reward) || 60,
      });

      showNotice('success', `Challenge "${formData.title}" created successfully.`);
      setIsAddModalOpen(false);
      fetchData();
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to create challenge.');
    }
  };

  const handleOpenEdit = (tq: TimedQuiz) => {
    setSelectedQuiz(tq);
    setFormData({
      title: tq.title,
      description: tq.description || '',
      language_id: tq.language_id || 'mr',
      difficulty: tq.difficulty || 'Beginner',
      mode: tq.mode || 'Quick Challenge',
      time_limit_seconds: String(tq.time_limit_seconds || 30),
      xp_reward: String(tq.xp_reward || 60),
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateTimedQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuiz) return;

    try {
      await timedQuizService.updateTimedQuiz(selectedQuiz.id, {
        title: formData.title,
        description: formData.description,
        time_limit_seconds: Number(formData.time_limit_seconds) || 30,
        xp_reward: Number(formData.xp_reward) || 60,
      });

      showNotice('success', `Challenge "${formData.title}" updated successfully.`);
      setIsEditModalOpen(false);
      setSelectedQuiz(null);
      fetchData();
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to update challenge.');
    }
  };

  const handleDeleteTimedQuiz = async () => {
    if (!selectedQuiz) return;

    try {
      await timedQuizService.deleteTimedQuiz(selectedQuiz.id);
      showNotice('success', `Challenge deleted.`);
      setIsDeleteModalOpen(false);
      setSelectedQuiz(null);
      fetchData();
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to delete challenge.');
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
            Timed Speed Quizzes ({timedQuizzes.length})
          </h2>
          <p className="text-xs text-[#666760] mt-0.5">
            Rapid-fire word recognition, countdown timers, and speed fluency challenges.
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
            Create Timed Challenge
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-xs text-[#666760]">Loading timed quizzes...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((tq) => (
            <Card key={tq.id} padding="md" className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-xs uppercase tracking-wider bg-[#ECEAE4] text-[#52634F] border border-[#D8D6CE]">
                      {tq.language_id.toUpperCase()}
                    </span>
                    <Badge variant="primary" size="sm">
                      {tq.mode}
                    </Badge>
                  </div>
                  <h3 className="text-base font-bold text-[#252622] truncate">
                    {tq.title}
                  </h3>
                  <p className="text-xs text-[#666760] line-clamp-2">
                    {tq.description}
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-[#52634F] inline-flex items-center gap-1 shrink-0">
                  <Zap className="w-3 h-3 text-[#52634F]" />
                  +{tq.xp_reward} XP
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-[#666760] pt-2 border-t border-[#D8D6CE]">
                <span className="flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5 text-[#52634F]" />
                  {tq.time_limit_seconds}s timer
                </span>
                <span>{tq.questions?.length || tq.question_count || 0} Questions</span>
                <span>Reward: +{tq.xp_reward} XP</span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-[#D8D6CE]">
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEdit(tq)}
                    title="Edit Challenge"
                  >
                    <Edit className="w-3.5 h-3.5 text-[#252622]" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedQuiz(tq);
                      setIsDeleteModalOpen(true);
                    }}
                    title="Delete Challenge"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-[#A33D36]" />
                  </Button>
                </div>

                <Link to={`/quiz/timed/${tq.id}`}>
                  <Button variant="outline" size="sm">
                    Preview Sprint
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create Timed Challenge"
        description="Set countdown limits and rapid XP rewards."
      >
        <form onSubmit={handleCreateTimedQuiz} className="space-y-3">
          <Input
            label="Challenge Title"
            placeholder="e.g. 30-Second Rapid Fire Challenge"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <div>
            <label className="block text-xs font-semibold text-[#666760] uppercase tracking-wider mb-1">
              Language
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
            label="Description"
            placeholder="Overview of sprint..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Countdown Timer (seconds)"
              type="number"
              value={formData.time_limit_seconds}
              onChange={(e) => setFormData({ ...formData, time_limit_seconds: e.target.value })}
            />
            <Input
              label="Reward XP"
              type="number"
              value={formData.xp_reward}
              onChange={(e) => setFormData({ ...formData, xp_reward: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#D8D6CE]">
            <Button variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Challenge
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Timed Challenge"
      >
        <form onSubmit={handleUpdateTimedQuiz} className="space-y-3">
          <Input
            label="Challenge Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Countdown Timer (seconds)"
              type="number"
              value={formData.time_limit_seconds}
              onChange={(e) => setFormData({ ...formData, time_limit_seconds: e.target.value })}
            />
            <Input
              label="Reward XP"
              type="number"
              value={formData.xp_reward}
              onChange={(e) => setFormData({ ...formData, xp_reward: e.target.value })}
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

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Timed Challenge"
        description={`Are you sure you want to delete "${selectedQuiz?.title}"?`}
      >
        <div className="flex justify-end gap-2 pt-3">
          <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteTimedQuiz}>
            Confirm Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};
