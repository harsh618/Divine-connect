import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Tag, 
  Plus, 
  Calendar as CalendarIcon,
  Percent,
  Edit,
  Trash2,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function HotelPromotions({ hotel }) {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  
  const [promoData, setPromoData] = useState({
    title: '',
    description: '',
    discount_percent: 20,
    start_date: null,
    end_date: null,
    room_types: [],
    is_active: true
  });

  // Mock promotions - in real app, this would be from a Promotions entity
  const [promotions, setPromotions] = useState([
    {
      id: '1',
      title: 'Pilgrimage Package - 20% Off',
      description: 'Special discount for devotees visiting temples',
      discount_percent: 20,
      start_date: '2026-01-01',
      end_date: '2026-03-31',
      room_types: ['DELUXE', 'SUITE'],
      is_active: true
    },
    {
      id: '2',
      title: 'Early Bird Discount',
      description: 'Book 30 days in advance and save 15%',
      discount_percent: 15,
      start_date: '2026-01-01',
      end_date: '2026-12-31',
      room_types: ['STANDARD', 'DELUXE', 'SUITE'],
      is_active: true
    }
  ]);

  const roomTypes = hotel?.room_inventory?.map(r => r.room_type) || [];

  const handleSavePromo = () => {
    if (!promoData.title || !promoData.discount_percent) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (editingPromo !== null) {
      setPromotions(prev => prev.map((p, i) => 
        i === editingPromo ? { ...promoData, id: p.id } : p
      ));
      toast.success('Promotion updated!');
    } else {
      setPromotions(prev => [...prev, { ...promoData, id: Date.now().toString() }]);
      toast.success('Promotion created!');
    }

    setShowModal(false);
    resetForm();
  };

  const handleDeletePromo = (index) => {
    setPromotions(prev => prev.filter((_, i) => i !== index));
    toast.success('Promotion deleted');
  };

  const togglePromoActive = (index) => {
    setPromotions(prev => prev.map((p, i) => 
      i === index ? { ...p, is_active: !p.is_active } : p
    ));
  };

  const resetForm = () => {
    setPromoData({
      title: '',
      description: '',
      discount_percent: 20,
      start_date: null,
      end_date: null,
      room_types: [],
      is_active: true
    });
    setEditingPromo(null);
  };

  const openEditPromo = (promo, index) => {
    setPromoData({
      ...promo,
      start_date: promo.start_date ? new Date(promo.start_date) : null,
      end_date: promo.end_date ? new Date(promo.end_date) : null
    });
    setEditingPromo(index);
    setShowModal(true);
  };

  const toggleRoomType = (type) => {
    setPromoData(prev => ({
      ...prev,
      room_types: prev.room_types.includes(type)
        ? prev.room_types.filter(t => t !== type)
        : [...prev.room_types, type]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">Special Offers & Promotions</h3>
          <p className="text-sm text-gray-600">Create discounts and packages to attract more guests</p>
        </div>
        <Button onClick={() => { resetForm(); setShowModal(true); }} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Offer
        </Button>
      </div>

      {/* Promotions List */}
      {promotions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {promotions.map((promo, idx) => (
            <Card key={promo.id} className={`p-5 ${!promo.is_active ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${promo.is_active ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <Percent className={`w-5 h-5 ${promo.is_active ? 'text-green-600' : 'text-gray-500'}`} />
                  </div>
                  <div>
                    <h4 className="font-semibold">{promo.title}</h4>
                    <Badge className={promo.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}>
                      {promo.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEditPromo(promo, idx)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeletePromo(idx)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {promo.description && (
                <p className="text-sm text-gray-600 mb-3">{promo.description}</p>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-blue-600">{promo.discount_percent}% OFF</span>
                </div>

                {(promo.start_date || promo.end_date) && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <CalendarIcon className="w-4 h-4" />
                    <span>
                      {promo.start_date ? format(new Date(promo.start_date), 'MMM d') : 'Start'} - {promo.end_date ? format(new Date(promo.end_date), 'MMM d, yyyy') : 'End'}
                    </span>
                  </div>
                )}

                {promo.room_types?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {promo.room_types.map(type => (
                      <Badge key={type} variant="outline" className="text-xs">{type}</Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => togglePromoActive(idx)}
                  className={promo.is_active ? 'text-red-600' : 'text-green-600'}
                >
                  {promo.is_active ? (
                    <><XCircle className="w-4 h-4 mr-1" /> Deactivate</>
                  ) : (
                    <><CheckCircle className="w-4 h-4 mr-1" /> Activate</>
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Tag className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h4 className="font-semibold mb-2">No Promotions Yet</h4>
          <p className="text-gray-600 mb-4">Create special offers to attract more guests</p>
          <Button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Offer
          </Button>
        </Card>
      )}

      {/* Create/Edit Promotion Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingPromo !== null ? 'Edit Promotion' : 'Create New Promotion'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Offer Title *</Label>
              <Input
                value={promoData.title}
                onChange={(e) => setPromoData({ ...promoData, title: e.target.value })}
                placeholder="e.g., Pilgrimage Package - 20% Off"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={promoData.description}
                onChange={(e) => setPromoData({ ...promoData, description: e.target.value })}
                placeholder="Describe what's included in this offer..."
                rows={3}
              />
            </div>

            <div>
              <Label>Discount Percentage *</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={promoData.discount_percent}
                  onChange={(e) => setPromoData({ ...promoData, discount_percent: Number(e.target.value) })}
                  className="w-24"
                />
                <span className="text-gray-500">% off</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {promoData.start_date ? format(promoData.start_date, 'PPP') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={promoData.start_date}
                      onSelect={(date) => setPromoData({ ...promoData, start_date: date })}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {promoData.end_date ? format(promoData.end_date, 'PPP') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={promoData.end_date}
                      onSelect={(date) => setPromoData({ ...promoData, end_date: date })}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {roomTypes.length > 0 && (
              <div>
                <Label className="mb-2 block">Applicable Room Types</Label>
                <div className="flex flex-wrap gap-2">
                  {roomTypes.map(type => (
                    <button
                      key={type}
                      onClick={() => toggleRoomType(type)}
                      className={`px-3 py-2 rounded-lg border transition-all ${
                        promoData.room_types.includes(type)
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">Leave empty to apply to all room types</p>
              </div>
            )}

            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <Checkbox
                checked={promoData.is_active}
                onCheckedChange={(v) => setPromoData({ ...promoData, is_active: v })}
              />
              <span>Activate this promotion immediately</span>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSavePromo} className="flex-1 bg-blue-600 hover:bg-blue-700">
              {editingPromo !== null ? 'Save Changes' : 'Create Promotion'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}