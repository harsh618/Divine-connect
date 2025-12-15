import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, Plus, Edit, Trash2, Eye, EyeOff, Loader2, Image } from 'lucide-react';
import { toast } from 'sonner';
import ImageUpload from './ImageUpload';

export default function AdminAuspiciousDays() {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingDay, setEditingDay] = useState(null);
  const [formData, setFormData] = useState({
    date: '',
    title: '',
    description: '',
    image_url: '',
    is_visible: true
  });

  const { data: days, isLoading } = useQuery({
    queryKey: ['admin-auspicious-days'],
    queryFn: () => base44.entities.AuspiciousDay.filter({ is_deleted: false }, 'date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.AuspiciousDay.create(data),
    onSuccess: () => {
      toast.success('Auspicious day added');
      queryClient.invalidateQueries(['admin-auspicious-days']);
      queryClient.invalidateQueries(['auspicious-days-admin']);
      setShowDialog(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.AuspiciousDay.update(id, data),
    onSuccess: () => {
      toast.success('Auspicious day updated');
      queryClient.invalidateQueries(['admin-auspicious-days']);
      queryClient.invalidateQueries(['auspicious-days-admin']);
      setShowDialog(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.AuspiciousDay.update(id, { is_deleted: true }),
    onSuccess: () => {
      toast.success('Auspicious day deleted');
      queryClient.invalidateQueries(['admin-auspicious-days']);
      queryClient.invalidateQueries(['auspicious-days-admin']);
    },
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: ({ id, is_visible }) => base44.entities.AuspiciousDay.update(id, { is_visible }),
    onSuccess: () => {
      toast.success('Visibility updated');
      queryClient.invalidateQueries(['admin-auspicious-days']);
      queryClient.invalidateQueries(['auspicious-days-admin']);
    },
  });

  const resetForm = () => {
    setFormData({
      date: '',
      title: '',
      description: '',
      image_url: '',
      is_visible: true
    });
    setEditingDay(null);
  };

  const handleEdit = (day) => {
    setEditingDay(day);
    setFormData({
      date: day.date,
      title: day.title,
      description: day.description,
      image_url: day.image_url || '',
      is_visible: day.is_visible
    });
    setShowDialog(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingDay) {
      updateMutation.mutate({ id: editingDay.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const [hoveredDate, setHoveredDate] = useState(null);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Generate calendar for current and next month
  const getCalendarDays = () => {
    const today = new Date();
    const calendarDays = [];
    
    for (let i = 0; i < 60; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const dayData = days?.find(d => d.date === dateStr);
      
      calendarDays.push({
        date: dateStr,
        displayDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'short' }),
        hasEvent: !!dayData,
        eventData: dayData
      });
    }
    
    return calendarDays;
  };

  const calendarDays = getCalendarDays();

  const handleDateHover = async (day) => {
    if (day.hasEvent || loadingAi) return;
    
    setHoveredDate(day.date);
    setLoadingAi(true);
    
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `For the date ${day.displayDate} (${day.dayOfWeek}), check if there is any significant Hindu festival, auspicious day, or spiritual event. If yes, provide a title (max 5 words) and description (max 20 words). If no significant event, return null for both. Return as JSON.`,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: ["string", "null"] },
            description: { type: ["string", "null"] }
          }
        }
      });
      
      if (response.title && response.description) {
        setAiSuggestion({
          ...response,
          date: day.date,
          displayDate: day.displayDate
        });
      } else {
        setAiSuggestion(null);
      }
    } catch (error) {
      console.error('AI suggestion error:', error);
      setAiSuggestion(null);
    } finally {
      setLoadingAi(false);
    }
  };

  const handleDateLeave = () => {
    setTimeout(() => {
      setHoveredDate(null);
      setAiSuggestion(null);
    }, 300);
  };

  const handleUseAiSuggestion = () => {
    if (aiSuggestion) {
      setFormData({
        date: aiSuggestion.date,
        title: aiSuggestion.title,
        description: aiSuggestion.description,
        image_url: '',
        is_visible: true
      });
      setShowDialog(true);
      setAiSuggestion(null);
      setHoveredDate(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Auspicious Days Calendar</h2>
          <p className="text-sm text-gray-500">Manage spiritual events and timelines</p>
        </div>
        <Button onClick={() => setShowDialog(true)} className="bg-orange-500 hover:bg-orange-600">
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </Button>
      </div>

      {/* Calendar View */}
      <Card className="p-6">
        <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
          💡 Hover over empty dates to get AI suggestions for auspicious days
        </div>
        <div className="grid grid-cols-7 gap-2 relative">
          {calendarDays.map((day, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg border transition-all relative ${
                day.hasEvent
                  ? day.eventData?.is_visible
                    ? 'bg-green-50 border-green-300 hover:shadow-md'
                    : 'bg-gray-50 border-gray-300'
                  : hoveredDate === day.date
                  ? 'bg-orange-50 border-orange-300'
                  : 'bg-white border-gray-200 hover:border-orange-300'
              } cursor-pointer`}
              onClick={() => day.hasEvent ? handleEdit(day.eventData) : null}
              onMouseEnter={() => !day.hasEvent && handleDateHover(day)}
              onMouseLeave={handleDateLeave}
            >
              <div className="text-xs text-gray-500">{day.dayOfWeek}</div>
              <div className="text-sm font-semibold text-gray-900">{day.displayDate}</div>
              {day.hasEvent && (
                <div className="mt-2">
                  <div className="flex items-center gap-1 mb-1">
                    {day.eventData.is_visible ? (
                      <Eye className="w-3 h-3 text-green-600" />
                    ) : (
                      <EyeOff className="w-3 h-3 text-gray-400" />
                    )}
                    {day.eventData.image_url && (
                      <Image className="w-3 h-3 text-purple-600" />
                    )}
                  </div>
                  <p className="text-xs font-medium text-gray-900 line-clamp-2">
                    {day.eventData.title}
                  </p>
                </div>
              )}
              {hoveredDate === day.date && loadingAi && (
                <div className="mt-2 flex items-center gap-1 text-orange-600">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span className="text-xs">Checking...</span>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* AI Suggestion Popup */}
        {aiSuggestion && hoveredDate && (
          <div className="absolute z-10 mt-2 p-4 bg-white rounded-lg shadow-xl border-2 border-orange-300 max-w-sm">
            <div className="flex items-start gap-2 mb-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="w-4 h-4 text-orange-600" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-orange-600 font-medium mb-1">
                  AI Suggestion for {aiSuggestion.displayDate}
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">{aiSuggestion.title}</h4>
                <p className="text-sm text-gray-600">{aiSuggestion.description}</p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={handleUseAiSuggestion}
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add This Event
            </Button>
          </div>
        )}
      </Card>

      {/* List View */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">All Events</h3>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : days?.length > 0 ? (
          <div className="space-y-3">
            {days.map((day) => (
              <div
                key={day.id}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {day.image_url && (
                  <img
                    src={day.image_url}
                    alt={day.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-600">
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-900">{day.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{day.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={day.is_visible ? "default" : "outline"}
                    onClick={() => toggleVisibilityMutation.mutate({ id: day.id, is_visible: !day.is_visible })}
                  >
                    {day.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleEdit(day)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteMutation.mutate(day.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No auspicious days added yet
          </div>
        )}
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={(open) => {
        setShowDialog(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingDay ? 'Edit' : 'Add'} Auspicious Day</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Diwali, Ekadashi"
                required
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the event"
                rows={3}
                required
              />
            </div>
            <div>
              <Label>Image (Optional)</Label>
              <ImageUpload
                value={formData.image_url}
                onChange={(url) => setFormData({ ...formData, image_url: url })}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="visible"
                checked={formData.is_visible}
                onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="visible" className="cursor-pointer">Show on timeline</Label>
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex-1 bg-orange-500 hover:bg-orange-600"
              >
                {(createMutation.isPending || updateMutation.isPending) ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}