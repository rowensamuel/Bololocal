import React, { useState, useEffect } from 'react';
import { Plus, HelpCircle, Clock, Edit, Trash2, RefreshCw } from '../../components/common/Icons';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { quizService } from '../../services/quizService';
import { languageService, LanguageRecord } from '../../services/languageService';
import { Quiz } from '../../types/quiz';
import { Link } from 'react-router-dom';

export const Quizzes: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [languages, setLanguages] = useState<LanguageRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLang, setSelectedLang] = useState<string>('all');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    language_id: 'mr',
    difficulty: 'Beginner',
    timeLimitSeconds: '300',
    xpReward: '50',
  });

  const showNotice = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [quizData, langData] = await Promise.all([
        quizService.getQuizzes(),
        languageService.getLanguages(),
      ]);
      setQuizzes(quizData);
      setLanguages(langData);
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to fetch quizzes.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredQuizzes = quizzes.filter((q) => {
    if (selectedLang === 'all') return true;
    return q.language_id?.toLowerCase() === selectedLang.toLowerCase();
  });

  const handleOpenAdd = () => {
    setFormData({
      title: '',
      description: '',
      language_id: selectedLang !== 'all' ? selectedLang : 'mr',
      difficulty: 'Beginner',
      timeLimitSeconds: '300',
      xpReward: '50',
    });
    setIsAddModalOpen(true);
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      showNotice('error', 'Quiz title is required.');
      return;
    }

    try {
      await quizService.createQuiz({
        title: formData.title,
        description: formData.description || 'Knowledge assessment',
        language_id: formData.language_id,
        difficulty: formData.difficulty as any,
        totalQuestions: 5,
        timeLimitSeconds: Number(formData.timeLimitSeconds) || 300,
        xpReward: Number(formData.xpReward) || 50,
      });

      showNotice('success', `Quiz "${formData.title}" created successfully.`);
      setIsAddModalOpen(false);
      fetchData();
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to create quiz.');
    }
  };

  const handleOpenEdit = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setFormData({
      title: quiz.title,
      description: quiz.description || '',
      language_id: quiz.language_id || 'mr',
      difficulty: quiz.difficulty || 'Beginner',
      timeLimitSeconds: String(quiz.timeLimitSeconds || 300),
      xpReward: String(quiz.xpReward || 50),
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuiz) return;

    try {
      await quizService.updateQuiz(selectedQuiz.id, {
        title: formData.title,
        description: formData.description,
        timeLimitSeconds: Number(formData.timeLimitSeconds) || 300,
        xpReward: Number(formData.xpReward) || 50,
      });

      showNotice('success', `Quiz "${formData.title}" updated successfully.`);
      setIsEditModalOpen(false);
      setSelectedQuiz(null);
      fetchData();
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to update quiz.');
    }
  };

  const handleDeleteQuiz = async () => {
    if (!selectedQuiz) return;

    try {
      await quizService.deleteQuiz(selectedQuiz.id);
      showNotice('success', `Quiz "${selectedQuiz.title}" deleted.`);
      setIsDeleteModalOpen(false);
      setSelectedQuiz(null);
      fetchData();
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to delete quiz.');
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
            Knowledge Quizzes ({quizzes.length})
          </h2>
          <p className="text-xs text-[#666760] mt-0.5">
            Module quizzes, reading comprehension tests, and vocabulary assessments.
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
            Create Quiz
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-xs text-[#666760]">Loading assessments...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredQuizzes.map((quiz) => (
            <Card key={quiz.id} padding="md" className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-xs uppercase tracking-wider bg-[#ECEAE4] text-[#52634F] border border-[#D8D6CE]">
                      {quiz.language_id.toUpperCase()}
                    </span>
                    <Badge variant="primary" size="sm">
                      {quiz.difficulty}
                    </Badge>
                  </div>
                  <h3 className="text-base font-bold text-[#252622] truncate">
                    {quiz.title}
                  </h3>
                  <p className="text-xs text-[#666760] line-clamp-2">
                    {quiz.description}
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-[#52634F] shrink-0">
                  +{quiz.xpReward} XP
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-[#666760] pt-2 border-t border-[#D8D6CE]">
                <span className="flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-[#52634F]" />
                  {quiz.totalQuestions} Questions
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#52634F]" />
                  ~{Math.round((quiz.timeLimitSeconds || 300) / 60)} mins
                </span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-[#D8D6CE]">
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEdit(quiz)}
                    title="Edit Quiz"
                  >
                    <Edit className="w-3.5 h-3.5 text-[#252622]" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedQuiz(quiz);
                      setIsDeleteModalOpen(true);
                    }}
                    title="Delete Quiz"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-[#A33D36]" />
                  </Button>
                </div>

                <Link to={`/quiz/${quiz.id}`}>
                  <Button variant="outline" size="sm">
                    Preview Quiz
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Quiz Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create Assessment Quiz"
        description="Configure quiz title, difficulty level, and reward XP."
      >
        <form onSubmit={handleCreateQuiz} className="space-y-3">
          <Input
            label="Quiz Title"
            placeholder="e.g. Marathi Foundation Mastery Quiz"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
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
          <div>
            <label className="block text-xs font-semibold text-[#666760] uppercase tracking-wider mb-1">
              Difficulty
            </label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              className="w-full px-3 py-2 rounded-sm border border-[#D8D6CE] text-xs font-medium bg-[#FAF9F6] text-[#252622] focus:outline-none focus:ring-1 focus:ring-[#52634F]"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          <Input
            label="Description"
            placeholder="Overview of questions included..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Time Limit (seconds)"
              type="number"
              value={formData.timeLimitSeconds}
              onChange={(e) => setFormData({ ...formData, timeLimitSeconds: e.target.value })}
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
              Save Quiz
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Quiz Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Quiz"
        description="Update quiz title, description, or limits."
      >
        <form onSubmit={handleUpdateQuiz} className="space-y-3">
          <Input
            label="Quiz Title"
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
              label="Time Limit (seconds)"
              type="number"
              value={formData.timeLimitSeconds}
              onChange={(e) => setFormData({ ...formData, timeLimitSeconds: e.target.value })}
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

      {/* Delete Quiz Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Quiz"
        description={`Are you sure you want to delete quiz "${selectedQuiz?.title}"?`}
      >
        <div className="flex justify-end gap-2 pt-3">
          <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteQuiz}>
            Confirm Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};
