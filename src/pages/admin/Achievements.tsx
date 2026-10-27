import React, { useState, useEffect } from 'react';
import { Plus, Trophy, Edit, Trash2, RefreshCw } from '../../components/common/Icons';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { achievementService } from '../../services/achievementService';
import { Achievement } from '../../types/achievement';

export const Achievements: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAch, setSelectedAch] = useState<Achievement | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'milestone',
    condition_type: 'count',
    condition_value: '1',
    xp_reward: '50',
  });

  const showNotice = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchAchievements = async () => {
    setIsLoading(true);
    try {
      const data = await achievementService.getAllAchievements();
      setAchievements(data);
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to fetch achievements.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      description: '',
      category: 'milestone',
      condition_type: 'count',
      condition_value: '1',
      xp_reward: '50',
    });
    setIsAddModalOpen(true);
  };

  const handleCreateAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      showNotice('error', 'Achievement name is required.');
      return;
    }

    try {
      await achievementService.createAchievement({
        name: formData.name,
        description: formData.description || 'Milestone achievement',
        category: formData.category as any,
        condition_type: formData.condition_type,
        condition_value: Number(formData.condition_value) || 1,
        xp_reward: Number(formData.xp_reward) || 50,
      });

      showNotice('success', `Achievement "${formData.name}" created successfully.`);
      setIsAddModalOpen(false);
      fetchAchievements();
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to create achievement.');
    }
  };

  const handleOpenEdit = (ach: Achievement) => {
    setSelectedAch(ach);
    setFormData({
      name: ach.name,
      description: ach.description || '',
      category: ach.category || 'milestone',
      condition_type: ach.condition_type || 'count',
      condition_value: String(ach.condition_value || 1),
      xp_reward: String(ach.xp_reward || 50),
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAch) return;

    try {
      await achievementService.updateAchievement(selectedAch.id, {
        name: formData.name,
        description: formData.description,
        category: formData.category as any,
        xp_reward: Number(formData.xp_reward) || 50,
      });

      showNotice('success', `Achievement "${formData.name}" updated successfully.`);
      setIsEditModalOpen(false);
      setSelectedAch(null);
      fetchAchievements();
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to update achievement.');
    }
  };

  const handleDeleteAchievement = async () => {
    if (!selectedAch) return;

    try {
      await achievementService.deleteAchievement(selectedAch.id);
      showNotice('success', `Achievement deleted.`);
      setIsDeleteModalOpen(false);
      setSelectedAch(null);
      fetchAchievements();
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to delete achievement.');
    }
  };

  return (
    <div className="space-y-6">
      {notification && (
        <div
          className={`p-3.5 border-2 border-black text-xs font-bold flex items-center justify-between shadow-[2px_2px_0px_#000] ${
            notification.type === 'success'
              ? 'bg-[#2C6E49] text-white'
              : 'bg-[#BA2D27] text-white'
          }`}
        >
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="underline font-black cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#121310]">
            Achievement Milestones ({achievements.length})
          </h2>
          <p className="text-xs text-[#4A4B45] mt-0.5">
            Configure learner unlock conditions, XP awards, and milestone thresholds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchAchievements} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAdd}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            New Achievement
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-xs font-bold text-[#4A4B45]">Loading achievements...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {achievements.map((ach) => (
            <Card key={ach.id} padding="md" className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="w-9 h-9 border-2 border-black bg-[#E6B022] text-black shadow-[2px_2px_0px_#000] flex items-center justify-center shrink-0">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-black text-[#121310] truncate">{ach.name}</h3>
                    <Badge variant="neutral" size="sm" className="mt-1">
                      {ach.category}
                    </Badge>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-black bg-[#ECEAE4] px-2 py-0.5 border border-black shrink-0">
                  +{ach.xp_reward} XP
                </span>
              </div>

              <p className="text-xs text-[#4A4B45] leading-relaxed">
                {ach.description}
              </p>

              <div className="pt-2 border-t border-black flex items-center justify-between text-[11px] text-[#4A4B45] font-semibold">
                <span>Cond: {ach.condition_type} ({ach.condition_value})</span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEdit(ach)}
                    title="Edit Achievement"
                  >
                    <Edit className="w-3.5 h-3.5 text-black" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedAch(ach);
                      setIsDeleteModalOpen(true);
                    }}
                    title="Delete Achievement"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-[#BA2D27]" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Achievement Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Milestone Achievement"
      >
        <form onSubmit={handleCreateAchievement} className="space-y-3">
          <Input
            label="Achievement Name"
            placeholder="e.g. Master Communicator"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Description"
            placeholder="e.g. Complete 10 full conversations..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#121310] uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border-2 border-black text-xs font-bold bg-[#FAF9F6] shadow-[2px_2px_0px_#000] focus:outline-none"
              >
                <option value="milestone">Milestone</option>
                <option value="streak">Streak</option>
                <option value="speed">Speed Sprint</option>
                <option value="vocabulary">Vocabulary</option>
                <option value="dialogue">Dialogue</option>
              </select>
            </div>
            <Input
              label="XP Reward"
              type="number"
              value={formData.xp_reward}
              onChange={(e) => setFormData({ ...formData, xp_reward: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t-2 border-black">
            <Button variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Achievement
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Achievement Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Milestone Achievement"
      >
        <form onSubmit={handleUpdateAchievement} className="space-y-3">
          <Input
            label="Achievement Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#121310] uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border-2 border-black text-xs font-bold bg-[#FAF9F6] shadow-[2px_2px_0px_#000] focus:outline-none"
              >
                <option value="milestone">Milestone</option>
                <option value="streak">Streak</option>
                <option value="speed">Speed Sprint</option>
                <option value="vocabulary">Vocabulary</option>
                <option value="dialogue">Dialogue</option>
              </select>
            </div>
            <Input
              label="XP Reward"
              type="number"
              value={formData.xp_reward}
              onChange={(e) => setFormData({ ...formData, xp_reward: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t-2 border-black">
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
        title="Delete Achievement"
        description={`Are you sure you want to delete "${selectedAch?.name}"?`}
      >
        <div className="flex justify-end gap-2 pt-3">
          <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteAchievement}>
            Confirm Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};
