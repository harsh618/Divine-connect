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
import { CheckCircle, XCircle, Search, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AdminProviders() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState(null);

  const { data: providers, isLoading } = useQuery({
    queryKey: ['admin-providers'],
    queryFn: () => base44.entities.ProviderProfile.filter({ is_deleted: false }),
  });

  const verifyMutation = useMutation({
    mutationFn: ({ id, is_verified }) => 
      base44.entities.ProviderProfile.update(id, { is_verified }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-providers']);
      toast.success('Provider status updated');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ProviderProfile.update(id, { is_deleted: true }),
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

  const filteredProviders = providers?.filter(provider =>
    provider.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    provider.provider_type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Providers Management</h2>
          <p className="text-gray-500">Manage priests and astrologers</p>
        </div>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search providers..."
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
              <TableHead>Avatar</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">Loading...</TableCell>
              </TableRow>
            ) : filteredProviders?.length > 0 ? (
              filteredProviders.map((provider) => (
                <TableRow key={provider.id} className={provider.is_hidden ? 'opacity-50' : ''}>
                  <TableCell>
                    {provider.avatar_url ? (
                      <img src={provider.avatar_url} alt={provider.display_name} className="w-12 h-12 object-cover rounded-full" />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xs text-gray-500">
                        {provider.display_name?.[0] || 'P'}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{provider.display_name}</TableCell>
                  <TableCell className="capitalize">{provider.provider_type}</TableCell>
                  <TableCell>{provider.years_of_experience} years</TableCell>
                  <TableCell>
                    {provider.is_verified ? (
                      <Badge className="bg-green-100 text-green-700">Verified</Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {provider.rating_average > 0 ? `${provider.rating_average.toFixed(1)} ⭐` : 'No ratings'}
                  </TableCell>
                  <TableCell>
                    <Badge className={!provider.is_hidden ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                      {!provider.is_hidden ? 'Visible' : 'Hidden'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setSelectedProvider(provider)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => toggleVisibilityMutation.mutate({ id: provider.id, is_hidden: !provider.is_hidden })}
                      >
                        {provider.is_hidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </Button>
                      {!provider.is_verified && (
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => verifyMutation.mutate({ id: provider.id, is_verified: true })}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
                      {provider.is_verified && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => verifyMutation.mutate({ id: provider.id, is_verified: false })}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center">No providers found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

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