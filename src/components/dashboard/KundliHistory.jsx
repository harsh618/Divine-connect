import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Calendar, MapPin, Clock, FileText } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

export default function KundliHistory({ userId }) {
  const { data: kundlis, isLoading } = useQuery({
    queryKey: ['kundli-history', userId],
    queryFn: () => base44.entities.Kundli.filter({ 
      user_id: userId, 
      is_deleted: false 
    }, '-created_date')
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map(i => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!kundlis?.length) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
            <FileText className="w-8 h-8 text-purple-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Kundli Generated</h3>
          <p className="text-gray-500 mb-4">Create your personalized Kundli chart</p>
          <Link to={createPageUrl('KundliGenerator')}>
            <Button className="bg-orange-500 hover:bg-orange-600">
              Generate Kundli
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {kundlis.map((kundli) => (
        <Card key={kundli.id} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900 mb-3">{kundli.name}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(kundli.birth_date).toLocaleDateString('en-IN', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{kundli.birth_time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{kundli.birth_place}</span>
                  </div>
                  {kundli.rashi && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Rashi:</span>
                      <span>{kundli.rashi}</span>
                    </div>
                  )}
                </div>
                {kundli.predictions_text && (
                  <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                    {kundli.predictions_text}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}