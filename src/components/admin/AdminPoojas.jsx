import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2, Plus, Search, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import ImageUpload from './ImageUpload';

const categoryOptions = [
  'graha_shanti', 'satyanarayan', 'ganesh', 'lakshmi', 'durga',
  'shiva', 'havan', 'griha_pravesh', 'navagraha', 'rudrabhishek', 'other'
];

export default function AdminPoojas() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPooja, setEditingPooja] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'graha_shanti',
    description: '',
    purpose: '',
    benefits: '',
    duration_minutes: '',
    best_time: '',
    required_items: '',
    base_price_virtual: '',
    base_price_in_person: '',
    base_price_temple: '',
    image_url: '',
    is_popular: false
  });

  const { data: poojas, isLoading } = useQuery({
    queryKey: ['admin-poojas'],
    queryFn: () => base44.entities.Pooja.filter({ is_deleted: false }),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Pooja.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-poojas']);
      toast.success('Pooja created successfully');
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Pooja.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-poojas']);
      toast.success('Pooja updated successfully');
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Pooja.update(id, { is_deleted: true }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-poojas']);
      toast.success('Pooja deleted successfully');
    }
  });

  const resetForm = () => {
    setShowModal(false);
    setEditingPooja(null);
    setFormData({
      name: '',
      category: 'graha_shanti',
      description: '',
      purpose: '',
      benefits: '',
      duration_minutes: '',
      best_time: '',
      required_items: '',
      base_price_virtual: '',
      base_price_in_person: '',
      base_price_temple: '',
      image_url: '',
      is_popular: false
    });
  };

  const handleEdit = (pooja) => {
    setEditingPooja(pooja);
    setFormData({
      name: pooja.name || '',
      category: pooja.category || 'graha_shanti',
      description: pooja.description || '',
      purpose: pooja.purpose || '',
      benefits: pooja.benefits?.join(', ') || '',
      duration_minutes: pooja.duration_minutes || '',
      best_time: pooja.best_time || '',
      required_items: pooja.required_items?.join(', ') || '',
      base_price_virtual: pooja.base_price_virtual || '',
      base_price_in_person: pooja.base_price_in_person || '',
      base_price_temple: pooja.base_price_temple || '',
      image_url: pooja.image_url || '',
      is_popular: pooja.is_popular || false
    });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.duration_minutes) {
      toast.error('Please fill required fields');
      return;
    }

    const submitData = {
      ...formData,
      duration_minutes: Number(formData.duration_minutes),
      base_price_virtual: formData.base_price_virtual ? Number(formData.base_price_virtual) : undefined,
      base_price_in_person: formData.base_price_in_person ? Number(formData.base_price_in_person) : undefined,
      base_price_temple: formData.base_price_temple ? Number(formData.base_price_temple) : undefined,
      benefits: formData.benefits ? formData.benefits.split(',').map(b => b.trim()).filter(Boolean) : [],
      required_items: formData.required_items ? formData.required_items.split(',').map(i => i.trim()).filter(Boolean) : []
    };

    if (editingPooja) {
      updateMutation.mutate({ id: editingPooja.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const filteredPoojas = poojas?.filter(pooja =>
    pooja.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pooja.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Poojas Management</h2>
          <p className="text-gray-500">Manage pooja services offered on the platform</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-orange-500 hover:bg-orange-600">
          <Plus className="w-4 h-4 mr-2" />
          Add Pooja
        </Button>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search poojas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Virtual Price</TableHead>
              <TableHead>In-Person Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">Loading...</TableCell>
              </TableRow>
            ) : filteredPoojas?.length > 0 ? (
              filteredPoojas.map((pooja) => (
                <TableRow key={pooja.id}>
                  <TableCell className="font-medium">{pooja.name}</TableCell>
                  <TableCell className="capitalize">
                    <Badge variant="secondary">{pooja.category?.replace('_', ' ')}</Badge>
                  </TableCell>
                  <TableCell>{pooja.duration_minutes} min</TableCell>
                  <TableCell>₹{pooja.base_price_virtual || '-'}</TableCell>
                  <TableCell>₹{pooja.base_price_in_person || '-'}</TableCell>
                  <TableCell>
                    {pooja.is_popular && (
                      <Badge className="bg-orange-100 text-orange-700">Popular</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(pooja)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(pooja.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center">No poojas found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPooja ? 'Edit Pooja' : 'Add New Pooja'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Pooja name"
                />
              </div>

              <div>
                <Label>Category *</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map(cat => (
                      <SelectItem key={cat} value={cat} className="capitalize">
                        {cat.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Detailed description of the pooja"
              />
            </div>

            <div>
              <Label>Purpose</Label>
              <Input
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                placeholder="What is this pooja for?"
              />
            </div>

            <div>
              <Label>Benefits (comma separated)</Label>
              <Textarea
                value={formData.benefits}
                onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                rows={2}
                placeholder="Removes obstacles, Brings prosperity, etc."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Duration (minutes) *</Label>
                <Input
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                />
              </div>

              <div>
                <Label>Best Time</Label>
                <Input
                  value={formData.best_time}
                  onChange={(e) => setFormData({ ...formData, best_time: e.target.value })}
                  placeholder="Morning, Evening, etc."
                />
              </div>
            </div>

            <div>
              <Label>Required Items (comma separated)</Label>
              <Textarea
                value={formData.required_items}
                onChange={(e) => setFormData({ ...formData, required_items: e.target.value })}
                rows={2}
                placeholder="Flowers, Incense, Fruits, etc."
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Virtual Price (₹)</Label>
                <Input
                  type="number"
                  value={formData.base_price_virtual}
                  onChange={(e) => setFormData({ ...formData, base_price_virtual: e.target.value })}
                />
              </div>

              <div>
                <Label>In-Person Price (₹)</Label>
                <Input
                  type="number"
                  value={formData.base_price_in_person}
                  onChange={(e) => setFormData({ ...formData, base_price_in_person: e.target.value })}
                />
              </div>

              <div>
                <Label>Temple Price (₹)</Label>
                <Input
                  type="number"
                  value={formData.base_price_temple}
                  onChange={(e) => setFormData({ ...formData, base_price_temple: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Image URL</Label>
              <Input
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="Image URL"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_popular"
                checked={formData.is_popular}
                onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="is_popular" className="cursor-pointer">Mark as Popular</Label>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={resetForm} className="flex-1">Cancel</Button>
            <Button onClick={handleSubmit} className="flex-1 bg-orange-500 hover:bg-orange-600">
              {editingPooja ? 'Update' : 'Create'} Pooja
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}