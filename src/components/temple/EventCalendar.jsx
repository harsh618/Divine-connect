import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  MapPin,
  Star,
  Check,
  Download,
  Loader2
} from 'lucide-react';
import { format, parseISO, isSameDay, isAfter, isBefore, startOfDay } from 'date-fns';
import { toast } from 'sonner';

const eventTypeColors = {
  festival: 'bg-orange-100 text-orange-700 border-orange-200',
  pooja: 'bg-purple-100 text-purple-700 border-purple-200',
  ceremony: 'bg-blue-100 text-blue-700 border-blue-200',
  celebration: 'bg-pink-100 text-pink-700 border-pink-200',
  special_darshan: 'bg-green-100 text-green-700 border-green-200'
};

export default function EventCalendar({ templeId, templeName }) {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showRSVPModal, setShowRSVPModal] = useState(false);
  const [numAttendees, setNumAttendees] = useState(1);
  const [specialRequirements, setSpecialRequirements] = useState('');

  const { data: events, isLoading } = useQuery({
    queryKey: ['temple-events', templeId],
    queryFn: () => base44.entities.TempleEvent.filter({ 
      temple_id: templeId, 
      is_deleted: false 
    }, 'start_date'),
    enabled: !!templeId
  });

  const { data: userRSVPs } = useQuery({
    queryKey: ['user-rsvps', templeId],
    queryFn: async () => {
      try {
        const user = await base44.auth.me();
        return await base44.entities.EventRSVP.filter({ 
          temple_id: templeId,
          user_id: user.id,
          status: 'confirmed'
        });
      } catch {
        return [];
      }
    },
    enabled: !!templeId
  });

  const rsvpMutation = useMutation({
    mutationFn: async ({ eventId, eventData }) => {
      const user = await base44.auth.me();
      
      // Create RSVP
      await base44.entities.EventRSVP.create({
        event_id: eventId,
        user_id: user.id,
        temple_id: templeId,
        num_attendees: numAttendees,
        special_requirements: specialRequirements
      });

      // Update event attendee count
      await base44.entities.TempleEvent.update(eventId, {
        current_attendees: (eventData.current_attendees || 0) + numAttendees
      });
    },
    onSuccess: () => {
      toast.success('RSVP confirmed! See you at the event.');
      setShowRSVPModal(false);
      setNumAttendees(1);
      setSpecialRequirements('');
      queryClient.invalidateQueries(['temple-events']);
      queryClient.invalidateQueries(['user-rsvps']);
    }
  });

  const cancelRSVPMutation = useMutation({
    mutationFn: async ({ rsvpId, eventId, attendeeCount }) => {
      await base44.entities.EventRSVP.update(rsvpId, { status: 'cancelled' });
      
      const event = events.find(e => e.id === eventId);
      if (event) {
        await base44.entities.TempleEvent.update(eventId, {
          current_attendees: Math.max(0, (event.current_attendees || 0) - attendeeCount)
        });
      }
    },
    onSuccess: () => {
      toast.success('RSVP cancelled');
      queryClient.invalidateQueries(['temple-events']);
      queryClient.invalidateQueries(['user-rsvps']);
    }
  });

  const handleRSVP = () => {
    if (!selectedEvent) return;
    
    if (selectedEvent.max_attendees && 
        (selectedEvent.current_attendees || 0) + numAttendees > selectedEvent.max_attendees) {
      toast.error('Not enough spots available');
      return;
    }

    rsvpMutation.mutate({ 
      eventId: selectedEvent.id, 
      eventData: selectedEvent 
    });
  };

  const addToCalendar = (event) => {
    const startDate = new Date(`${event.start_date}T${event.start_time || '09:00'}`);
    const endDate = event.end_date 
      ? new Date(`${event.end_date}T${event.end_time || '18:00'}`)
      : new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

    const title = encodeURIComponent(event.title);
    const details = encodeURIComponent(event.description || '');
    const location = encodeURIComponent(templeName);
    const start = startDate.toISOString().replace(/-|:|\.\d+/g, '');
    const end = endDate.toISOString().replace(/-|:|\.\d+/g, '');

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${start}/${end}`;
    window.open(googleCalendarUrl, '_blank');
  };

  const eventsOnSelectedDate = events?.filter(event => 
    isSameDay(parseISO(event.start_date), selectedDate)
  ) || [];

  const upcomingEvents = events?.filter(event => 
    isAfter(parseISO(event.start_date), startOfDay(new Date())) ||
    isSameDay(parseISO(event.start_date), new Date())
  ).slice(0, 5) || [];

  const eventDates = events?.map(event => parseISO(event.start_date)) || [];

  const isUserRegistered = (eventId) => {
    return userRSVPs?.some(rsvp => rsvp.event_id === eventId);
  };

  const getUserRSVP = (eventId) => {
    return userRSVPs?.find(rsvp => rsvp.event_id === eventId);
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Events & Festivals</h2>
          <p className="text-sm text-gray-500 mt-1">
            {events?.length || 0} upcoming events
          </p>
        </div>
        {events?.some(e => e.is_featured) && (
          <Badge className="bg-orange-500 text-white">
            <Star className="w-3 h-3 mr-1" />
            Featured Events
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar View */}
        <div>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-lg border"
            modifiers={{
              eventDay: eventDates
            }}
            modifiersStyles={{
              eventDay: {
                fontWeight: 'bold',
                textDecoration: 'underline',
                color: '#ea580c'
              }
            }}
          />
          
          {eventsOnSelectedDate.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-semibold text-gray-700">
                Events on {format(selectedDate, 'MMMM d, yyyy')}:
              </p>
              {eventsOnSelectedDate.map(event => (
                <button
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className="w-full text-left p-3 rounded-lg border hover:border-orange-500 hover:bg-orange-50 transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{event.title}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {event.start_time && `${event.start_time} ${event.end_time ? `- ${event.end_time}` : ''}`}
                      </p>
                    </div>
                    <Badge variant="outline" className={`text-xs ${eventTypeColors[event.event_type]}`}>
                      {event.event_type.replace('_', ' ')}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Events List */}
        <div>
          <h3 className="font-semibold mb-4">Upcoming Events</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {upcomingEvents.length > 0 ? upcomingEvents.map(event => {
              const registered = isUserRegistered(event.id);
              const rsvp = getUserRSVP(event.id);
              const isFull = event.max_attendees && event.current_attendees >= event.max_attendees;

              return (
                <div
                  key={event.id}
                  className="p-4 rounded-lg border hover:shadow-md transition cursor-pointer"
                  onClick={() => setSelectedEvent(event)}
                >
                  {event.image_url && (
                    <img 
                      src={event.image_url} 
                      alt={event.title}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                  )}
                  
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-sm">{event.title}</h4>
                    {event.is_featured && (
                      <Star className="w-4 h-4 text-orange-500 fill-current" />
                    )}
                  </div>

                  <div className="space-y-1 text-xs text-gray-600 mb-3">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-3 h-3" />
                      {format(parseISO(event.start_date), 'MMM d, yyyy')}
                      {event.end_date && ` - ${format(parseISO(event.end_date), 'MMM d, yyyy')}`}
                    </div>
                    {event.start_time && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {event.start_time} {event.end_time && `- ${event.end_time}`}
                      </div>
                    )}
                    {event.max_attendees && (
                      <div className="flex items-center gap-2">
                        <Users className="w-3 h-3" />
                        {event.current_attendees || 0} / {event.max_attendees} registered
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-xs ${eventTypeColors[event.event_type]}`}>
                      {event.event_type.replace('_', ' ')}
                    </Badge>
                    {registered && (
                      <Badge className="text-xs bg-green-500 text-white">
                        <Check className="w-3 h-3 mr-1" />
                        Registered
                      </Badge>
                    )}
                    {isFull && !registered && (
                      <Badge variant="outline" className="text-xs text-red-600 border-red-200">
                        Full
                      </Badge>
                    )}
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-8 text-gray-500">
                <CalendarIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No upcoming events</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Event Detail Modal */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
            <DialogDescription>
              {selectedEvent && format(parseISO(selectedEvent.start_date), 'EEEE, MMMM d, yyyy')}
            </DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-4">
              {selectedEvent.image_url && (
                <img 
                  src={selectedEvent.image_url} 
                  alt={selectedEvent.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <CalendarIcon className="w-4 h-4 text-gray-500" />
                  <span>
                    {format(parseISO(selectedEvent.start_date), 'MMM d, yyyy')}
                    {selectedEvent.end_date && ` - ${format(parseISO(selectedEvent.end_date), 'MMM d, yyyy')}`}
                  </span>
                </div>

                {selectedEvent.start_time && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span>
                      {selectedEvent.start_time} {selectedEvent.end_time && `- ${selectedEvent.end_time}`}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span>{templeName}</span>
                </div>

                {selectedEvent.max_attendees && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span>
                      {selectedEvent.current_attendees || 0} / {selectedEvent.max_attendees} registered
                    </span>
                  </div>
                )}

                <Badge className={eventTypeColors[selectedEvent.event_type]}>
                  {selectedEvent.event_type.replace('_', ' ')}
                </Badge>
              </div>

              {selectedEvent.description && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">About This Event</h4>
                  <p className="text-sm text-gray-600">{selectedEvent.description}</p>
                </div>
              )}

              {selectedEvent.registration_fee > 0 && (
                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="text-sm">
                    <span className="font-semibold">Registration Fee:</span> ₹{selectedEvent.registration_fee}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => addToCalendar(selectedEvent)}
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Add to Calendar
                </Button>

                {selectedEvent.requires_registration && !isUserRegistered(selectedEvent.id) && (
                  <Button
                    onClick={() => {
                      setSelectedEvent(selectedEvent);
                      setShowRSVPModal(true);
                    }}
                    disabled={selectedEvent.max_attendees && selectedEvent.current_attendees >= selectedEvent.max_attendees}
                    className="flex-1 bg-orange-500 hover:bg-orange-600"
                  >
                    {selectedEvent.max_attendees && selectedEvent.current_attendees >= selectedEvent.max_attendees
                      ? 'Event Full'
                      : 'RSVP Now'}
                  </Button>
                )}

                {isUserRegistered(selectedEvent.id) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      const rsvp = getUserRSVP(selectedEvent.id);
                      if (rsvp) {
                        cancelRSVPMutation.mutate({
                          rsvpId: rsvp.id,
                          eventId: selectedEvent.id,
                          attendeeCount: rsvp.num_attendees
                        });
                      }
                    }}
                    disabled={cancelRSVPMutation.isPending}
                    className="flex-1"
                  >
                    {cancelRSVPMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Check className="w-4 h-4 mr-2" />
                    )}
                    Registered
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* RSVP Modal */}
      <Dialog open={showRSVPModal} onOpenChange={setShowRSVPModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>RSVP for {selectedEvent?.title}</DialogTitle>
            <DialogDescription>
              Confirm your attendance at this event
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label className="mb-2 block">Number of Attendees</Label>
              <Input
                type="number"
                min="1"
                max="10"
                value={numAttendees}
                onChange={(e) => setNumAttendees(Number(e.target.value))}
              />
            </div>

            <div>
              <Label className="mb-2 block">Special Requirements (Optional)</Label>
              <Textarea
                placeholder="Any special needs or requests..."
                value={specialRequirements}
                onChange={(e) => setSpecialRequirements(e.target.value)}
              />
            </div>

            {selectedEvent?.registration_fee > 0 && (
              <div className="bg-orange-50 p-3 rounded-lg">
                <p className="text-sm font-semibold">
                  Total: ₹{selectedEvent.registration_fee * numAttendees}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => setShowRSVPModal(false)} 
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRSVP}
              disabled={rsvpMutation.isPending}
              className="flex-1 bg-orange-500 hover:bg-orange-600"
            >
              {rsvpMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              Confirm RSVP
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}