import React, { useState, useEffect } from 'react';
import { Plus, BookOpen, Clock, Users, Edit, Trash2, RefreshCw } from '../../components/common/Icons';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { courseService } from '../../services/courseService';
import { languageService, LanguageRecord } from '../../services/languageService';
import { Course } from '../../types/course';

export const Courses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [languages, setLanguages] = useState<LanguageRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLang, setSelectedLang] = useState<string>('all');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    language_id: 'mr',
    level: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced',
    estimatedHours: '12',
    totalLessons: '10',
  });

  const showNotice = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [courseData, langData] = await Promise.all([
        courseService.getCourses(),
        languageService.getLanguages(),
      ]);
      setCourses(courseData);
      setLanguages(langData);
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to fetch courses.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredCourses = courses.filter((c) => {
    if (selectedLang === 'all') return true;
    return (
      c.language_id?.toLowerCase() === selectedLang.toLowerCase() ||
      c.language?.toLowerCase() === selectedLang.toLowerCase()
    );
  });

  const handleOpenAdd = () => {
    setFormData({
      title: '',
      description: '',
      language_id: selectedLang !== 'all' ? selectedLang : 'mr',
      level: 'Beginner',
      estimatedHours: '12',
      totalLessons: '10',
    });
    setIsAddModalOpen(true);
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      showNotice('error', 'Course title and description are required.');
      return;
    }

    try {
      const langObj = languages.find((l) => l.code === formData.language_id);
      await courseService.createCourse({
        title: formData.title,
        description: formData.description,
        language_id: formData.language_id,
        language: langObj?.name || formData.language_id,
        level: formData.level,
        estimatedHours: Number(formData.estimatedHours) || 12,
        totalLessons: Number(formData.totalLessons) || 10,
      });

      showNotice('success', `Course "${formData.title}" created successfully.`);
      setIsAddModalOpen(false);
      fetchData();
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to create course.');
    }
  };

  const handleOpenEdit = (course: Course) => {
    setSelectedCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      language_id: course.language_id || 'mr',
      level: (course.level as any) || 'Beginner',
      estimatedHours: String(course.estimatedHours || 12),
      totalLessons: String(course.totalLessons || 10),
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;

    try {
      const langObj = languages.find((l) => l.code === formData.language_id);
      await courseService.updateCourse(selectedCourse.id, {
        title: formData.title,
        description: formData.description,
        language_id: formData.language_id,
        language: langObj?.name || formData.language_id,
        level: formData.level,
        estimatedHours: Number(formData.estimatedHours) || 12,
        totalLessons: Number(formData.totalLessons) || 10,
      });

      showNotice('success', `Course "${formData.title}" updated successfully.`);
      setIsEditModalOpen(false);
      setSelectedCourse(null);
      fetchData();
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to update course.');
    }
  };

  const handleDeleteCourse = async () => {
    if (!selectedCourse) return;

    try {
      await courseService.deleteCourse(selectedCourse.id);
      showNotice('success', `Course "${selectedCourse.title}" deleted.`);
      setIsDeleteModalOpen(false);
      setSelectedCourse(null);
      fetchData();
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to delete course.');
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
            Course Management ({courses.length})
          </h2>
          <p className="text-xs text-[#666760] mt-0.5">
            Organize structured learning paths and curriculum modules across Indian languages.
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
            Create Course
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-xs text-[#666760]">Loading courses...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredCourses.map((course) => (
            <Card key={course.id} padding="md" className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1 min-w-0">
                  <Badge variant="primary" size="sm">
                    {course.language}
                  </Badge>
                  <h3 className="text-base font-bold text-[#252622] truncate">
                    {course.title}
                  </h3>
                  <p className="text-xs text-[#666760] line-clamp-2">
                    {course.description}
                  </p>
                </div>
                <Badge variant="neutral" size="sm">
                  {course.level}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-xs text-[#666760] pt-2 border-t border-[#D8D6CE]">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-[#52634F]" />
                  {course.totalLessons} Lessons
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#52634F]" />
                  ~{course.estimatedHours} hrs
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-[#52634F]" />
                  {course.enrolledCount || 0} enrolled
                </span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-[#D8D6CE]">
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEdit(course)}
                    leftIcon={<Edit className="w-3.5 h-3.5" />}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedCourse(course);
                      setIsDeleteModalOpen(true);
                    }}
                    title="Delete Course"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-[#A33D36]" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Course Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create Learning Course"
        description="Configure course title, target language, and difficulty level."
      >
        <form onSubmit={handleCreateCourse} className="space-y-3">
          <Input
            label="Course Title"
            placeholder="e.g. Spoken Marathi Essentials"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <div>
            <label className="block text-xs font-semibold text-[#666760] uppercase tracking-wider mb-1">
              Target Regional Language
            </label>
            <select
              value={formData.language_id}
              onChange={(e) => setFormData({ ...formData, language_id: e.target.value })}
              className="w-full px-3 py-2 rounded-sm border border-[#D8D6CE] text-xs font-medium bg-[#FAF9F6] text-[#252622] focus:outline-none focus:ring-1 focus:ring-[#52634F]"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name} ({l.native_name})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#666760] uppercase tracking-wider mb-1">
              Course Level
            </label>
            <select
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
              className="w-full px-3 py-2 rounded-sm border border-[#D8D6CE] text-xs font-medium bg-[#FAF9F6] text-[#252622] focus:outline-none focus:ring-1 focus:ring-[#52634F]"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          <Input
            label="Course Description"
            placeholder="Overview of conversational topics covered..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Estimated Study Hours"
              type="number"
              placeholder="12"
              value={formData.estimatedHours}
              onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
            />
            <Input
              label="Total Lessons Planned"
              type="number"
              placeholder="10"
              value={formData.totalLessons}
              onChange={(e) => setFormData({ ...formData, totalLessons: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#D8D6CE]">
            <Button variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Course
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Course Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Learning Course"
        description="Update syllabus details and study requirements."
      >
        <form onSubmit={handleUpdateCourse} className="space-y-3">
          <Input
            label="Course Title"
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
              Course Level
            </label>
            <select
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
              className="w-full px-3 py-2 rounded-sm border border-[#D8D6CE] text-xs font-medium bg-[#FAF9F6] text-[#252622] focus:outline-none focus:ring-1 focus:ring-[#52634F]"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          <Input
            label="Course Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Estimated Hours"
              type="number"
              value={formData.estimatedHours}
              onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
            />
            <Input
              label="Total Lessons"
              type="number"
              value={formData.totalLessons}
              onChange={(e) => setFormData({ ...formData, totalLessons: e.target.value })}
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

      {/* Delete Course Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Course"
        description={`Are you sure you want to delete course "${selectedCourse?.title}"?`}
      >
        <div className="flex justify-end gap-2 pt-3">
          <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteCourse}>
            Confirm Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};
