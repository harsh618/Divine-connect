import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, XCircle, Search, Eye, EyeOff, Pencil, Plus, MoreVertical, Trash2, Star, StarOff, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import logAuditAction from './useAuditLog';

export default function AdminProviders() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [filterType, setFilterType] = useState('all');

  const { data: providers, isLoading } = useQuery({
    queryKey: ['admin-providers'],
    queryFn: () => base44.entities.ProviderProfile.filter({ is_deleted: false }),
  });

  const { data: hotels, isLoading: loadingHotels } = useQuery({
    queryKey: ['admin-hotels'],
    queryFn: () => base44.entities.Hotel.filter({ is_deleted: false }),
  });

  const verifyMutation = useMutation({
    mutationFn: async ({ id, is_verified }) => {
      await base44.entities.ProviderProfile.update(id, { is_verified });
      const user = await base44.auth.me();
      await logAuditAction(user, is_verified ? 'verify' : 'unverify', 'ProviderProfile', id, { is_verified });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-providers']);
      toast.success('Provider status updated');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await base44.entities.ProviderProfile.update(id, { is_deleted: true });
      const user = await base44.auth.me();
      await logAuditAction(user, 'delete', 'ProviderProfile', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-providers']);
      toast.success('Provider deleted');
    }
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: ({ id, is_hidden }) => base44.entities.ProviderProfile.update(id, { is_hidden }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-providers']);
      toast.success('Visibility updated');
    }
  });

  const handleDelete = (provider) => {
    if (confirm(`Delete ${provider.display_name}? This will move them to trash.`)) {
      deleteMutation.mutate(provider.id);
    }
  };

  const toggleFeaturedMutation = useMutation({
    mutationFn: ({ id, is_featured }) => base44.entities.ProviderProfile.update(id, { is_featured }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-providers']);
      toast.success('Featured status updated');
    }
  });

  const filteredProviders = providers?.filter(provider => {
    const matchesSearch = provider.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.provider_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.city?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'all' || filterType === 'hotel' ? false : provider.provider_type === filterType || filterType === 'all';
    
    return matchesSearch && matchesType;
  });

  const filteredHotels = hotels?.filter(hotel => {
    const matchesSearch = hotel.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hotel.city?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch && (filterType === 'all' || filterType === 'hotel');
  });

  const toggleHotelActiveMutation = useMutation({
    mutationFn: ({ id, is_active }) => base44.entities.Hotel.update(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-hotels']);
      toast.success('Hotel status updated');
    }
  });

  const toggleHotelFeaturedMutation = useMutation({
    mutationFn: ({ id, is_featured }) => base44.entities.Hotel.update(id, { is_featured }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-hotels']);
      toast.success('Featured status updated');
    }
  });

  const deleteHotelMutation = useMutation({
    mutationFn: (id) => base44.entities.Hotel.update(id, { is_deleted: true }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-hotels']);
      toast.success('Hotel deleted');
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex flex-col md:flex-row gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search providers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Providers</SelectItem>
              <SelectItem value="priest">Priests</SelectItem>
              <SelectItem value="astrologer">Astrologers</SelectItem>
              <SelectItem value="hotel">Hotels</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Link to={createPageUrl('ProviderOnboarding')}>
          <Button className="bg-orange-500 hover:bg-orange-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Provider
          </Button>
        </Link>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Provider</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead className="w-12">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredProviders?.length > 0 ? (
              filteredProviders.map((provider) => (
                <TableRow key={provider.id} className={provider.is_hidden ? 'opacity-50' : ''}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {provider.avatar_url ? (
                        <img src={provider.avatar_url} alt={provider.display_name} className="w-10 h-10 object-cover rounded-full" />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-xs text-gray-500">
                          {provider.display_name?.[0] || 'P'}
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{provider.display_name}</div>
                        {provider.rating_average > 0 && (
                          <div className="text-xs text-gray-500">
                            {provider.rating_average.toFixed(1)} ⭐
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={
                      provider.provider_type === 'priest' 
                        ? 'bg-orange-50 text-orange-700' 
                        : 'bg-purple-50 text-purple-700'
                    }>
                      {provider.provider_type}
                    </Badge>
                  </TableCell>
                  <TableCell>{provider.years_of_experience || 0} years</TableCell>
                  <TableCell>{provider.city || 'N/A'}</TableCell>
                  <TableCell>
                    {provider.is_verified ? (
                      <Badge className="bg-green-100 text-green-700">Verified</Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {provider.is_featured && (
                      <Badge className="bg-amber-100 text-amber-700">
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        Featured
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={!provider.is_hidden ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                      {!provider.is_hidden ? 'Visible' : 'Hidden'}
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
                        <DropdownMenuItem onClick={() => setSelectedProvider(provider)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={createPageUrl(`ProviderOnboarding?id=${provider.id}`)}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => verifyMutation.mutate({ id: provider.id, is_verified: !provider.is_verified })}
                        >
                          {provider.is_verified ? (
                            <>
                              <XCircle className="w-4 h-4 mr-2" />
                              Unverify
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Verify
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => toggleFeaturedMutation.mutate({ id: provider.id, is_featured: !provider.is_featured })}
                        >
                          {provider.is_featured ? (
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
                          onClick={() => toggleVisibilityMutation.mutate({ id: provider.id, is_hidden: !provider.is_hidden })}
                        >
                          {provider.is_hidden ? (
                            <>
                              <Eye className="w-4 h-4 mr-2" />
                              Show Provider
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-4 h-4 mr-2" />
                              Hide Provider
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(provider)} className="text-red-600">
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
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  No providers found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Hotels Table */}
      {(filterType === 'all' || filterType === 'hotel') && (
        <Card className="overflow-hidden">
          <div className="p-4 border-b bg-blue-50">
            <h3 className="font-semibold text-blue-900">Hotels ({filteredHotels?.length || 0})</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hotel</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Rooms</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="w-12">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingHotels ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : filteredHotels?.length > 0 ? (
                filteredHotels.map((hotel) => (
                  <TableRow key={hotel.id} className={!hotel.is_active ? 'opacity-50' : ''}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {hotel.thumbnail_url ? (
                          <img src={hotel.thumbnail_url} alt={hotel.name} className="w-10 h-10 object-cover rounded" />
                        ) : (
                          <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center text-xs text-blue-600">
                            🏨
                          </div>
                        )}
                        <div className="font-medium">{hotel.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>{hotel.city}, {hotel.state}</TableCell>
                    <TableCell>{hotel.room_inventory?.reduce((sum, r) => sum + (r.total_rooms || 0), 0) || 0} rooms</TableCell>
                    <TableCell>
                      {hotel.rating_average > 0 ? (
                        <span>{hotel.rating_average.toFixed(1)} ⭐</span>
                      ) : (
                        <span className="text-gray-400">No ratings</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={hotel.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                        {hotel.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {hotel.is_featured && (
                        <Badge className="bg-amber-100 text-amber-700">
                          <Star className="w-3 h-3 mr-1 fill-current" />
                          Featured
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedHotel(hotel)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => toggleHotelActiveMutation.mutate({ id: hotel.id, is_active: !hotel.is_active })}
                          >
                            {hotel.is_active ? (
                              <>
                                <XCircle className="w-4 h-4 mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => toggleHotelFeaturedMutation.mutate({ id: hotel.id, is_featured: !hotel.is_featured })}
                          >
                            {hotel.is_featured ? (
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
                          <DropdownMenuItem 
                            onClick={() => {
                              if (confirm(`Delete ${hotel.name}?`)) {
                                deleteHotelMutation.mutate(hotel.id);
                              }
                            }} 
                            className="text-red-600"
                          >
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
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No hotels found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Hotel Details Modal */}
      <Dialog open={!!selectedHotel} onOpenChange={() => setSelectedHotel(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Hotel Details</DialogTitle>
          </DialogHeader>
          {selectedHotel && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {selectedHotel.thumbnail_url ? (
                  <img src={selectedHotel.thumbnail_url} alt={selectedHotel.name} className="w-20 h-20 object-cover rounded-lg" />
                ) : (
                  <div className="w-20 h-20 bg-blue-100 rounded-lg flex items-center justify-center text-3xl">
                    🏨
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold">{selectedHotel.name}</h3>
                  <p className="text-gray-500">{selectedHotel.city}, {selectedHotel.state}</p>
                </div>
              </div>
              
              {selectedHotel.description && (
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-gray-600">{selectedHotel.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-1">Contact</h4>
                  <p className="text-gray-600">{selectedHotel.contact_phone || 'N/A'}</p>
                  <p className="text-gray-600">{selectedHotel.contact_email || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Rating</h4>
                  <p className="text-gray-600">{selectedHotel.rating_average?.toFixed(1) || 'N/A'} ({selectedHotel.total_reviews || 0} reviews)</p>
                </div>
              </div>

              {selectedHotel.amenities?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedHotel.amenities.map((amenity, idx) => (
                      <Badge key={idx} variant="secondary">{amenity}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedHotel.room_inventory?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Room Inventory</h4>
                  <div className="space-y-2">
                    {selectedHotel.room_inventory.map((room, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="font-medium">{room.room_type}</span>
                        <span className="text-gray-600">{room.available_rooms}/{room.total_rooms} available • ₹{room.price_per_night}/night</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedProvider} onOpenChange={() => setSelectedProvider(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Provider Details</DialogTitle>
          </DialogHeader>
          {selectedProvider && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {selectedProvider.avatar_url ? (
                  <img src={selectedProvider.avatar_url} alt={selectedProvider.display_name} className="w-20 h-20 object-cover rounded-full" />
                ) : (
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-2xl">
                    {selectedProvider.display_name?.[0] || 'P'}
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold">{selectedProvider.display_name}</h3>
                  <p className="text-gray-500 capitalize">{selectedProvider.provider_type}</p>
                </div>
              </div>
              
              {selectedProvider.bio && (
                <div>
                  <h4 className="font-semibold mb-2">Bio</h4>
                  <p className="text-gray-600">{selectedProvider.bio}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-1">Experience</h4>
                  <p className="text-gray-600">{selectedProvider.years_of_experience} years</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Languages</h4>
                  <p className="text-gray-600">{selectedProvider.languages?.join(', ') || 'N/A'}</p>
                </div>
              </div>

              {selectedProvider.specializations?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Specializations</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProvider.specializations.map((spec, idx) => (
                      <Badge key={idx} variant="secondary">{spec}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedProvider.provider_type === 'astrologer' && (
                <div>
                  <h4 className="font-semibold mb-2">Consultation Rates</h4>
                  <div className="space-y-1 text-sm">
                    {selectedProvider.consultation_rate_chat && (
                      <p>Chat: ₹{selectedProvider.consultation_rate_chat}/min</p>
                    )}
                    {selectedProvider.consultation_rate_voice && (
                      <p>Voice: ₹{selectedProvider.consultation_rate_voice}/min</p>
                    )}
                    {selectedProvider.consultation_rate_video && (
                      <p>Video: ₹{selectedProvider.consultation_rate_video}/min</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}