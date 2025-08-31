'use client';

import { useState, useCallback, useRef } from 'react';
import { XMarkIcon, FolderIcon, CalendarIcon, LinkIcon, PhotoIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';

// Date picker component
function DatePicker({ 
  value, 
  onChange, 
  placeholder = "Select date" 
}: { 
  value?: string; 
  onChange: (date: string) => void; 
  placeholder?: string; 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (value) {
      const date = new Date(value);
      return new Date(date.getFullYear(), date.getMonth(), 1);
    }
    return new Date();
  });

  const today = new Date();
  const minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const handleDateSelect = (date: Date) => {
    onChange(formatDate(date));
    setIsOpen(false);
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const days = getDaysInMonth(currentMonth);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-left flex items-center justify-between"
      >
        <span className={value ? 'text-gray-900' : 'text-gray-500'}>
          {value ? new Date(value).toLocaleDateString() : placeholder}
        </span>
        <CalendarIcon className="h-5 w-5 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg">
          {/* Calendar Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200">
            <button
              onClick={goToPreviousMonth}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="font-medium text-gray-900">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
            <button
              onClick={goToNextMonth}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="p-3">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => (
                <button
                  key={index}
                  onClick={() => day && handleDateSelect(day)}
                  disabled={!day || day < minDate}
                  className={`
                    p-2 text-sm rounded-lg transition-colors
                    ${!day 
                      ? 'invisible' 
                      : day < minDate 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : value && formatDate(day) === value
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-gray-100 text-gray-900'
                    }
                  `}
                >
                  {day?.getDate()}
                </button>
              ))}
            </div>
          </div>

          {/* Clear button */}
          {value && (
            <div className="p-3 border-t border-gray-200">
              <button
                onClick={() => onChange('')}
                className="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Clear date
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess?: (upload: any) => void;
}

interface UploadFormData {
  title: string;
  description: string;
  visibility: 'private' | 'public' | 'team';
  tags: string[];
  scheduledDate?: string;
}

interface LinkFormData {
  title: string;
  description: string;
  url: string;
  visibility: 'private' | 'public' | 'team';
  tags: string[];
  scheduledDate?: string;
}

export default function UploadModal({ isOpen, onClose, onUploadSuccess }: UploadModalProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'file' | 'link'>('file');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // File upload form data
  const [fileFormData, setFileFormData] = useState<UploadFormData>({
    title: '',
    description: '',
    visibility: 'private',
    tags: [],
    scheduledDate: ''
  });
  
  // Link upload form data
  const [linkFormData, setLinkFormData] = useState<LinkFormData>({
    title: '',
    description: '',
    url: '',
    visibility: 'private',
    tags: [],
    scheduledDate: ''
  });
  
  const [tagInput, setTagInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    // if (files.length > 0) {
    //   handleFileSelect(files[0]);
    // }
  }, []);

  const handleFileSelect = (file: File) => {
    // Check file size (4MB limit as shown in design)
    // if (file.size > 4 * 1024 * 1024) {
    //   alert('File size must be less than 4MB');
    //   return;
    // }

    // Check file type (images and videos)
    // const validTypes = ['image/', 'video/'];
    // if (!validTypes.some(type => file.type.startsWith(type))) {
    //   alert('Please select an image or video file');
    //   return;
    // }

    // setSelectedFile(file);
    
    // Auto-fill title if empty
    // if (!fileFormData.title) {
    //   const fileName = file.name.replace(/\.[^/.]+$/, '');
    //   setFileFormData(prev => ({ ...prev, title: fileName }));
    // }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // handleFileSelect(file);
    }
  };

  const handleTagAdd = (formType: 'file' | 'link') => {
    if (tagInput.trim()) {
      const maxTags = 20;
      const currentTags = formType === 'file' ? fileFormData.tags : linkFormData.tags;
      
      if (currentTags.length >= maxTags) {
        alert(`Maximum ${maxTags} tags allowed`);
        return;
      }
      
      if (formType === 'file') {
        setFileFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()]
        }));
      } else {
        setLinkFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()]
        }));
      }
      setTagInput('');
    }
  };

  const handleTagRemove = (tagToRemove: string, formType: 'file' | 'link') => {
    if (formType === 'file') {
      setFileFormData(prev => ({
        ...prev,
        tags: prev.tags.filter(tag => tag !== tagToRemove)
      }));
    } else {
      setLinkFormData(prev => ({
        ...prev,
        tags: prev.tags.filter(tag => tag !== tagToRemove)
      }));
    }
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent, formType: 'file' | 'link') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTagAdd(formType);
    }
  };

  const handleFileUpload = async (action: 'schedule' | 'share') => {
    if (!selectedFile || !fileFormData.title.trim()) {
      alert('Please select a file and provide a title');
      return;
    }

    if (!user) {
      alert('Please sign in to upload files');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('file', selectedFile);
      formDataToSend.append('title', fileFormData.title);
      formDataToSend.append('description', fileFormData.description);
      formDataToSend.append('owner_id', user.id);
      formDataToSend.append('visibility', fileFormData.visibility);
      if (fileFormData.scheduledDate) {
        formDataToSend.append('scheduled_date', fileFormData.scheduledDate);
      }

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('surfe_access_token')}`
        },
        body: formDataToSend
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      if (result.success) {
        // Add scheduled date to the upload result if it exists
        const uploadWithDate = {
          ...result.upload,
          scheduled_date: fileFormData.scheduledDate || null
        };
        onUploadSuccess?.(uploadWithDate);
        onClose();
        // Reset form
        setSelectedFile(null);
        setFileFormData({
          title: '',
          description: '',
          visibility: 'private',
          tags: [],
          scheduledDate: ''
        });
        setTagInput('');
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleLinkUpload = async (action: 'share') => {
    if (!linkFormData.url.trim() || !linkFormData.title.trim()) {
      alert('Please provide a URL and title');
      return;
    }

    if (!user) {
      alert('Please sign in to upload links');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // TODO: Implement link upload endpoint
      // For now, simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Simulate success response
      const mockUpload = {
        id: Date.now().toString(),
        title: linkFormData.title,
        description: linkFormData.description,
        url: linkFormData.url,
        visibility: linkFormData.visibility,
        scheduled_date: linkFormData.scheduledDate || null,
        created_at: new Date().toISOString()
      };

      onUploadSuccess?.(mockUpload);
      onClose();
      
      // Reset form
      setLinkFormData({
        title: '',
        description: '',
        url: '',
        visibility: 'private',
        tags: [],
        scheduledDate: ''
      });
      setTagInput('');
    } catch (error) {
      console.error('Link upload error:', error);
      alert('Link upload failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (action: 'share') => {
    if (activeTab === 'file') {
      await handleFileUpload(action);
    } else {
      await handleLinkUpload(action);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Upload Section</h2>
            <p className="text-sm text-gray-600 mt-1">Upload files or add links to upload.</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('file')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'file'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <FolderIcon className="h-5 w-5" />
              File Upload
            </div>
          </button>
          <button
            onClick={() => setActiveTab('link')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'link'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <LinkIcon className="h-5 w-5" />
              Link Upload
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* File Upload Section */}
          {activeTab === 'file' && (
            <>
              {/* Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {selectedFile ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        {selectedFile.type.startsWith('image/') ? (
                          <PhotoIcon className="h-8 w-8 text-gray-600" />
                        ) : (
                          <VideoCameraIcon className="h-8 w-8 text-gray-600" />
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="text-sm text-red-600 hover:text-red-700 underline"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <FolderIcon className="h-12 w-12 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Upload an image or video</p>
                      <p className="text-xs text-gray-500">or, click to <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-sm text-blue-600 hover:text-blue-700 underline"
                    >
                      Browse files
                    </button></p>
                    </div>
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>

              {/* File Form Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    File name
                  </label>
                  <input
                    type="text"
                    value={fileFormData.title}
                    onChange={(e) => setFileFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter File name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Visibility
                  </label>
                  <select
                    value={fileFormData.visibility}
                    onChange={(e) => setFileFormData(prev => ({ ...prev, visibility: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="private">Private</option>
                    <option value="team">Team</option>
                    <option value="public">Public</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={fileFormData.description}
                  onChange={(e) => setFileFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your file details..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Scheduled Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <DatePicker
                  value={fileFormData.scheduledDate}
                  onChange={(date) => setFileFormData(prev => ({ ...prev, scheduledDate: date }))}
                  placeholder="Select date to upload"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add tags
                </label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => handleTagInputKeyPress(e, 'file')}
                      placeholder="Type to search..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      onClick={() => handleTagAdd('file')}
                      disabled={!tagInput.trim() || fileFormData.tags.length >= 20}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {fileFormData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                        >
                          + {tag}
                          <button
                            onClick={() => handleTagRemove(tag, 'file')}
                            className="text-gray-500 hover:text-gray-700 ml-1"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">
                      {20 - fileFormData.tags.length} tags remaining
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Link Upload Section */}
          {activeTab === 'link' && (
            <>
              {/* Link Input */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <LinkIcon className="h-12 w-12 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Add a link</p>
                    <p className="text-xs text-gray-500">Enter a URL to for anything you want to upload.</p>
                  </div>
                  <div className="max-w-md mx-auto">
                    <input
                      type="url"
                      value={linkFormData.url}
                      onChange={(e) => setLinkFormData(prev => ({ ...prev, url: e.target.value }))}
                      placeholder="https://example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Link Form Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    File name
                  </label>
                  <input
                    type="text"
                    value={linkFormData.title}
                    onChange={(e) => setLinkFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter file name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Visibility
                  </label>
                  <select
                    value={linkFormData.visibility}
                    onChange={(e) => setLinkFormData(prev => ({ ...prev, visibility: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="private">Private</option>
                    <option value="team">Team</option>
                    <option value="public">Public</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={linkFormData.description}
                  onChange={(e) => setLinkFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your file in details..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Scheduled Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <DatePicker
                  value={linkFormData.scheduledDate}
                  onChange={(date) => setLinkFormData(prev => ({ ...prev, scheduledDate: date }))}
                  placeholder="Select date to upload"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add tags
                </label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => handleTagInputKeyPress(e, 'link')}
                      placeholder="Type to search..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      onClick={() => handleTagAdd('link')}
                      disabled={!tagInput.trim() || linkFormData.tags.length >= 20}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {linkFormData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                        >
                          + {tag}
                          <button
                            onClick={() => handleTagRemove(tag, 'link')}
                            className="text-gray-500 hover:text-gray-700 ml-1"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">
                      {20 - linkFormData.tags.length} tags remaining
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          {/* <button
            onClick={() => handleSubmit('draft')}
            disabled={isUploading}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Save as draft
          </button> */}
          {/* <button
            onClick={() => handleSubmit('schedule')}
            disabled={isUploading}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <CalendarIcon className="h-4 w-4" />
            Schedule
          </button> */}
          <button
            onClick={() => handleSubmit('share')}
            disabled={isUploading}
            className="px-4 py-2 text-white bg-gray-800 rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
}