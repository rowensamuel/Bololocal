import React, { useState, useEffect } from 'react';
import { Plus, Award, Trophy, Edit, Trash2, RefreshCw } from '../../components/common/Icons';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { badgeService } from '../../services/badgeService';
import { Badge as BadgeType, BadgeRarity } from '../../types/badge';

export const Badges: React.FC = () => {
  const [badges, setBadges] = useState<BadgeType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<BadgeType | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'trophy',
    rarity: 'Common' as BadgeRarity,
    condition_type: 'count',
    condition_value: '1',
    xp_bonus: '50',
  });

  const showNotice = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchBadges = async () => {
    setIsLoading(true);
    try {
      const data = await badgeService.getAllBadges();
      setBadges(data);
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to fetch badges.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBadges();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      description: '',
      icon: 'trophy',
      rarity: 'Common',
      condition_type: 'count',
      condition_value: '1',
      xp_bonus: '50',
    });
    setIsAddModalOpen(true);
  };

  const handleCreateBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      showNotice('error', 'Badge name is required.');
      return;
    }

    try {
      await badgeService.createBadge({
        name: formData.name,
        description: formData.description || 'Milestone trophy award',
        icon: formData.icon,
        rarity: formData.rarity,
        condition_type: formData.condition_type,
        condition_value: Number(formData.condition_value) || 1,
        xp_bonus: Number(formData.xp_bonus) || 50,
      });

      showNotice('success', `Badge "${formData.name}" created successfully.`);
      setIsAddModalOpen(false);
      fetchBadges();
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to create badge.');
    }
  };

  const handleOpenEdit = (b: BadgeType) => {
    setSelectedBadge(b);
    setFormData({
      name: b.name,
      description: b.description || '',
      icon: b.icon || 'trophy',
      rarity: b.rarity,
      condition_type: b.condition_type || 'count',
      condition_value: String(b.condition_value || 1),
      xp_bonus: String(b.xp_bonus || 50),
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBadge) return;

    try {
      await badgeService.updateBadge(selectedBadge.id, {
        name: formData.name,
        description: formData.description,
        rarity: formData.rarity,
        xp_bonus: Number(formData.xp_bonus) || 50,
      });

      showNotice('success', `Badge "${formData.name}" updated successfully.`);
      setIsEditModalOpen(false);
      setSelectedBadge(null);
      fetchBadges();
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to update badge.');
    }
  };

  const handleDeleteBadge = async () => {
    if (!selectedBadge) return;

    try {
      await badgeService.deleteBadge(selectedBadge.id);
      showNotice('success', `Badge deleted.`);
      setIsDeleteModalOpen(false);
      setSelectedBadge(null);
      fetchBadges();
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to delete badge.');
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
            Badges & Trophies ({badges.length})
          </h2>
          <p className="text-xs text-[#4A4B45] mt-0.5">
            Define collectible trophies, rarity tiers, and bonus XP incentives.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchBadges} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAdd}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            New Badge
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-xs font-bold text-[#4A4B45]">Loading badges...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {badges.map((b) => (
            <Card key={b.id} padding="md" className="text-center space-y-2">
              <div className="w-10 h-10 border-2 border-black bg-[#E6B022] text-black shadow-[2px_2px_0px_#000] mx-auto flex items-center justify-center">
                <Trophy className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-[#121310]">{b.name}</h3>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-black bg-[#ECEAE4] px-2 py-0.5 border border-black inline-block">
                  {b.rarity}
                </span>
              </div>
              <p className="text-xs text-[#4A4B45] leading-snug">
                {b.description}
              </p>
              {b.xp_bonus && (
                <div className="text-[11px] font-bold text-[#2C6E49] pt-2 border-t border-black">
                  +{b.xp_bonus} XP Bonus
                </div>
              )}

              <div className="pt-2 border-t border-black flex justify-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenEdit(b)}
                  title="Edit Badge"
                >
                  <Edit className="w-3.5 h-3.5 text-black" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedBadge(b);
                    setIsDeleteModalOpen(true);
                  }}
                  title="Delete Badge"
                >
                  <Trash2 className="w-3.5 h-3.5 text-[#BA2D27]" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Badge Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Trophy Badge"
      >
        <form onSubmit={handleCreateBadge} className="space-y-3">
          <Input
            label="Badge Name"
            placeholder="e.g. Marathi Pioneer"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#121310] uppercase tracking-wider mb-1">
                Rarity Tier
              </label>
              <select
                value={formData.rarity}
                onChange={(e) => setFormData({ ...formData, rarity: e.target.value as BadgeRarity })}
                className="w-full px-3 py-2 border-2 border-black text-xs font-bold bg-[#FAF9F6] shadow-[2px_2px_0px_#000] focus:outline-none"
              >
                <option value="Common">Common</option>
                <option value="Rare">Rare</option>
                <option value="Epic">Epic</option>
                <option value="Legendary">Legendary</option>
              </select>
            </div>
            <Input
              label="XP Bonus"
              type="number"
              value={formData.xp_bonus}
              onChange={(e) => setFormData({ ...formData, xp_bonus: e.target.value })}
            />
          </div>
          <Input
            label="Description"
            placeholder="How to earn this trophy..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-3 border-t-2 border-black">
            <Button variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Badge
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Badge Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Trophy Badge"
      >
        <form onSubmit={handleUpdateBadge} className="space-y-3">
          <Input
            label="Badge Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#121310] uppercase tracking-wider mb-1">
                Rarity Tier
              </label>
              <select
                value={formData.rarity}
                onChange={(e) => setFormData({ ...formData, rarity: e.target.value as BadgeRarity })}
                className="w-full px-3 py-2 border-2 border-black text-xs font-bold bg-[#FAF9F6] shadow-[2px_2px_0px_#000] focus:outline-none"
              >
                <option value="Common">Common</option>
                <option value="Rare">Rare</option>
                <option value="Epic">Epic</option>
                <option value="Legendary">Legendary</option>
              </select>
            </div>
            <Input
              label="XP Bonus"
              type="number"
              value={formData.xp_bonus}
              onChange={(e) => setFormData({ ...formData, xp_bonus: e.target.value })}
            />
          </div>
          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

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
        title="Delete Badge"
        description={`Are you sure you want to delete "${selectedBadge?.name}"?`}
      >
        <div className="flex justify-end gap-2 pt-3">
          <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteBadge}>
            Confirm Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};
