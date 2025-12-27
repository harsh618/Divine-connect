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
import { Pencil, Trash2, Plus, Search, Eye, EyeOff, Star, StarOff, MoreVertical, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { toast } from 'sonner';
import ImageUpload from './ImageUpload';

export default function AdminServices() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    category: 'pooja',
    title: '',
    description: '',
    price: '',
    duration_minutes: '',
    materials_included: '',
    images: [],
    thumbnail_url: '',
    is_virtual: false
  });

  const { data: services, isLoading } = useQuery({
    queryKey: ['admin-services'],
    queryFn: () => base44.entities.Service.filter({ is_deleted: false }),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Service.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-services']);
      toast.success('Service created successfully');
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Service.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-services']);
      toast.success('Service updated successfully');
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Service.update(id, { is_deleted: true }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-services']);
      toast.success('Service deleted successfully');
    }
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: ({ id, is_hidden }) => base44.entities.Service.update(id, { is_hidden }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-services']);
      toast.success('Visibility updated');
    }
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: ({ id, is_featured }) => base44.entities.Service.update(id, { is_featured }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-services']);
      toast.success('Featured status updated');
    }
  });

  const resetForm = () => {
    setShowModal(false);
    setEditingService(null);
    setFormData({
      category: 'pooja',
      title: '',
      description: '',
      price: '',
      duration_minutes: '',
      materials_included: '',
      images: [],
      thumbnail_url: '',
      is_virtual: false,
      is_featured: false
    });
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      category: service.category || 'pooja',
      title: service.title || '',
      description: service.description || '',
      price: service.price || '',
      duration_minutes: service.duration_minutes || '',
      materials_included: service.materials_included?.join(', ') || '',
      images: service.images || [],
      thumbnail_url: service.thumbnail_url || '',
      is_virtual: service.is_virtual || false,
      is_featured: service.is_featured || false
    });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.price) {
      toast.error('Please fill required fields');
      return;
    }

    const submitData = {
      ...formData,
      price: Number(formData.price),
      duration_minutes: formData.duration_minutes ? Number(formData.duration_minutes) : undefined,
      materials_included: formData.materials_included 
        ? formData.materials_included.split(',').map(m => m.trim()).filter(Boolean)
        : []
    };

    if (editingService) {
      updateMutation.mutate({ id: editingService.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const filteredServices = services?.filter(service =>
    service.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Services Management</h2>
          <p className="text-gray-500">Manage poojas, consultations, and other services</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-orange-500 hover:bg-orange-600">
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead className="w-12">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredServices?.length > 0 ? (
              filteredServices.map((service) => (
                <TableRow key={service.id} className={service.is_hidden ? 'opacity-50' : ''}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {service.thumbnail_url ? (
                        <img src={service.thumbnail_url} alt={service.title} className="w-12 h-12 object-cover rounded" />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                          No img
                        </div>
                      )}
                      <span className="font-medium">{service.title}</span>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">
                    <Badge variant="secondary">{service.category?.replace('_', ' ')}</Badge>
                  </TableCell>
                  <TableCell>₹{service.price}</TableCell>
                  <TableCell>{service.duration_minutes ? `${service.duration_minutes} min` : '-'}</TableCell>
                  <TableCell>
                    <Switch
                      checked={service.is_featured}
                      onCheckedChange={(checked) => 
                        toggleFeaturedMutation.mutate({ id: service.id, is_featured: checked })
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Badge className={!service.is_hidden ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                      {!service.is_hidden ? 'Visible' : 'Hidden'}
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
                        <DropdownMenuItem onClick={() => handleEdit(service)}>
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => toggleFeaturedMutation.mutate({ id: service.id, is_featured: !service.is_featured })}
                        >
                          {service.is_featured ? (
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
                        <DropdownMenuItem 
                          onClick={() => toggleVisibilityMutation.mutate({ id: service.id, is_hidden: !service.is_hidden })}
                        >
                          {service.is_hidden ? (
                            <>
                              <Eye className="w-4 h-4 mr-2" />
                              Show Service
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-4 h-4 mr-2" />
                              Hide Service
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => deleteMutation.mutate(service.id)} className="text-red-600">
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
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">No services found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <ImageUpload
              images={formData.images}
              onImagesChange={(imgs) => setFormData({ ...formData, images: imgs })}
              thumbnailUrl={formData.thumbnail_url}
              onThumbnailChange={(url) => setFormData({ ...formData, thumbnail_url: url })}
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category *</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pooja">Pooja</SelectItem>
                    <SelectItem value="astrology_chat">Astrology Chat</SelectItem>
                    <SelectItem value="astrology_video">Astrology Video</SelectItem>
                    <SelectItem value="astrology_voice">Astrology Voice</SelectItem>
                    <SelectItem value="prasad">Prasad</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Service name"
                />
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Price (₹) *</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>

              <div>
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Materials Included (comma separated)</Label>
              <Input
                value={formData.materials_included}
                onChange={(e) => setFormData({ ...formData, materials_included: e.target.value })}
                placeholder="Flowers, Incense, Prasad"
              />
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_virtual"
                  checked={formData.is_virtual}
                  onChange={(e) => setFormData({ ...formData, is_virtual: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="is_virtual" className="cursor-pointer">Virtual Service</Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_featured"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="is_featured" className="cursor-pointer">Mark as Featured</Label>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={resetForm} className="flex-1">Cancel</Button>
            <Button onClick={handleSubmit} className="flex-1 bg-orange-500 hover:bg-orange-600">
              {editingService ? 'Update' : 'Create'} Service
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}