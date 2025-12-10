import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Search, 
  Plus,
  MoreVertical, 
  Edit,
  Trash2,
  Star,
  StarOff,
  Loader2,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import ImageUpload from './ImageUpload';

const initialFormData = {
  name: '',
  primary_deity: '',
  city: '',
  state: '',
  location: '',
  description: '',
  opening_hours: '',
  dress_code: '',
  images: [],
  thumbnail_url: '',
  is_featured: false,
  visit_booking_enabled: true
};

export default function AdminTemples() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTemple, setEditingTemple] = useState(null);
  const [formData, setFormData] = useState(initialFormData);

  const { data: temples, isLoading } = useQuery({
    queryKey: ['admin-temples-list'],
    queryFn: () => base44.entities.Temple.filter({ is_deleted: false }),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Temple.create(data),
    onSuccess: () => {
      toast.success('Temple created successfully!');
      queryClient.invalidateQueries(['admin-temples-list']);
      setShowModal(false);
      setFormData(initialFormData);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Temple.update(id, data),
    onSuccess: () => {
      toast.success('Temple updated successfully!');
      queryClient.invalidateQueries(['admin-temples-list']);
      setShowModal(false);
      setEditingTemple(null);
      setFormData(initialFormData);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Temple.update(id, { is_deleted: true }),
    onSuccess: () => {
      toast.success('Temple moved to trash');
      queryClient.invalidateQueries(['admin-temples-list']);
    }
  });

  const toggleFeatureMutation = useMutation({
    mutationFn: ({ id, is_featured }) => base44.entities.Temple.update(id, { is_featured }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-temples-list']);
    }
  });

  const filteredTemples = temples?.filter(temple =>
    temple.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    temple.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (temple) => {
    setEditingTemple(temple);
    setFormData({
      name: temple.name || '',
      primary_deity: temple.primary_deity || '',
      city: temple.city || '',
      state: temple.state || '',
      location: temple.location || '',
      description: temple.description || '',
      opening_hours: temple.opening_hours || '',
      dress_code: temple.dress_code || '',
      images: temple.images || [],
      thumbnail_url: temple.thumbnail_url || '',
      is_featured: temple.is_featured || false,
      visit_booking_enabled: temple.visit_booking_enabled !== false
    });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.primary_deity || !formData.city || !formData.state) {
      toast.error('Please fill all required fields');
      return;
    }

    if (editingTemple) {
      updateMutation.mutate({ id: editingTemple.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (temple) => {
    if (confirm('Move this temple to trash?')) {
      deleteMutation.mutate(temple.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search temples..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => { setEditingTemple(null); setFormData(initialFormData); setShowModal(true); }} className="bg-orange-500 hover:bg-orange-600">
          <Plus className="w-4 h-4 mr-2" />
          Add Temple
        </Button>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Deity</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead>Bookings</TableHead>
              <TableHead className="w-12">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredTemples?.length > 0 ? (
              filteredTemples.map((temple) => (
                <TableRow key={temple.id}>
                  <TableCell className="font-medium">{temple.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-orange-50 text-orange-700">
                      {temple.primary_deity}
                    </Badge>
                  </TableCell>
                  <TableCell>{temple.city}, {temple.state}</TableCell>
                  <TableCell>
                    <Switch
                      checked={temple.is_featured}
                      onCheckedChange={(checked) => 
                        toggleFeatureMutation.mutate({ id: temple.id, is_featured: checked })
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Badge className={temple.visit_booking_enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                      {temple.visit_booking_enabled ? 'Open' : 'Closed'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(temple)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => toggleFeatureMutation.mutate({ id: temple.id, is_featured: !temple.is_featured })}
                        >
                          {temple.is_featured ? (
                            <>
                              <StarOff className="w-4 h-4 mr-2" />
                              Remove Featured
                            </>
                          ) : (
                            <>
                              <Star className="w-4 h-4 mr-2" />
                              Mark Featured
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(temple)} className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No temples found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Create/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTemple ? 'Edit Temple' : 'Add New Temple'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <ImageUpload
              images={formData.images}
              onImagesChange={(imgs) => setFormData({ ...formData, images: imgs })}
              thumbnailUrl={formData.thumbnail_url}
              onThumbnailChange={(url) => setFormData({ ...formData, thumbnail_url: url })}
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Temple name"
                />
              </div>
              <div>
                <Label>Primary Deity *</Label>
                <Input
                  value={formData.primary_deity}
                  onChange={(e) => setFormData({...formData, primary_deity: e.target.value})}
                  placeholder="e.g., Shiva, Vishnu"
                />
              </div>
              <div>
                <Label>City *</Label>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  placeholder="City"
                />
              </div>
              <div>
                <Label>State *</Label>
                <Input
                  value={formData.state}
                  onChange={(e) => setFormData({...formData, state: e.target.value})}
                  placeholder="State"
                />
              </div>
            </div>
            
            <div>
              <Label>Full Address</Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="Complete address"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="About the temple..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Opening Hours</Label>
                <Input
                  value={formData.opening_hours}
                  onChange={(e) => setFormData({...formData, opening_hours: e.target.value})}
                  placeholder="e.g., 5:00 AM - 9:00 PM"
                />
              </div>
              <div>
                <Label>Dress Code</Label>
                <Input
                  value={formData.dress_code}
                  onChange={(e) => setFormData({...formData, dress_code: e.target.value})}
                  placeholder="e.g., Traditional attire"
                />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => setFormData({...formData, is_featured: checked})}
                />
                <Label>Featured Temple</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.visit_booking_enabled}
                  onCheckedChange={(checked) => setFormData({...formData, visit_booking_enabled: checked})}
                />
                <Label>Bookings Enabled</Label>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              )}
              {editingTemple ? 'Update' : 'Create'} Temple
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}