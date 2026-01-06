import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { temples, start_date, end_date, hotels } = await req.json();

    if (!temples || temples.length === 0) {
      return Response.json({ error: 'At least one temple required' }, { status: 400 });
    }

    // Calculate optimal route
    const route = temples.map(t => t.city);
    
    // Generate day-by-day itinerary
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    
    const daysPerTemple = Math.floor(totalDays / temples.length);
    const extraDays = totalDays % temples.length;
    
    const days = [];
    let currentDay = 0;
    
    for (let i = 0; i < temples.length; i++) {
      const temple = temples[i];
      const stayDays = daysPerTemple + (i < extraDays ? 1 : 0);
      
      for (let d = 0; d < stayDays; d++) {
        const isFirstDay = d === 0;
        const dayActivities = [];
        
        if (isFirstDay && i > 0) {
          // Travel day
          dayActivities.push({
            time: '8:00 AM',
            name: `Travel to ${temple.city}`,
            description: `Journey from ${temples[i-1].city} to ${temple.city}. Expected travel time: 4-6 hours`,
            category: 'travel'
          });
          dayActivities.push({
            time: '2:00 PM',
            name: 'Check-in & Rest',
            description: 'Check into hotel and rest after journey',
            category: 'accommodation'
          });
          dayActivities.push({
            time: '6:00 PM',
            name: `Evening Darshan at ${temple.name}`,
            description: `Visit the sacred ${temple.name} for evening prayers and aarti`,
            location: temple.name,
            category: 'temple'
          });
        } else {
          // Temple visit day
          dayActivities.push({
            time: '5:00 AM',
            name: `Morning Darshan at ${temple.name}`,
            description: `Early morning visit to ${temple.name}, dedicated to ${temple.deity}. Experience the peaceful morning prayers`,
            location: temple.name,
            category: 'temple'
          });
          dayActivities.push({
            time: '9:00 AM',
            name: 'Breakfast',
            description: 'Traditional breakfast at hotel or nearby restaurant',
            category: 'meal'
          });
          dayActivities.push({
            time: '11:00 AM',
            name: 'Local Sightseeing',
            description: `Explore nearby ghats, spiritual sites, and cultural landmarks in ${temple.city}`,
            location: temple.city,
            category: 'sightseeing'
          });
          dayActivities.push({
            time: '1:00 PM',
            name: 'Lunch',
            description: 'Traditional vegetarian lunch',
            category: 'meal'
          });
          dayActivities.push({
            time: '3:00 PM',
            name: 'Rest & Meditation',
            description: 'Return to hotel for rest and personal meditation time',
            category: 'rest'
          });
          dayActivities.push({
            time: '6:00 PM',
            name: `Evening Aarti at ${temple.name}`,
            description: 'Attend the evening aarti ceremony, a spiritual experience with hymns and prayers',
            location: temple.name,
            category: 'temple'
          });
        }
        
        const accommodation = hotels?.[temple.city] 
          ? `${hotels[temple.city].name} - ${temple.city}`
          : `Recommended accommodation in ${temple.city} near ${temple.name}`;
        
        days.push({
          title: isFirstDay && i > 0 ? `Journey to ${temple.city}` : `${temple.name} Darshan`,
          location: temple.city,
          activities: dayActivities,
          accommodation: accommodation
        });
        
        currentDay++;
      }
    }

    // Calculate total distance (mock estimation)
    const distancePerLeg = 300; // km average
    const totalDistance = `${(temples.length - 1) * distancePerLeg} km`;

    const itinerary = {
      route: route,
      total_distance: totalDistance,
      days: days,
      highlights: temples.map(t => `Darshan at ${t.name}, ${t.city}`),
      tips: [
        'Book accommodations in advance during festival seasons',
        'Carry appropriate temple attire',
        'Keep emergency contacts and important documents handy',
        'Stay hydrated and carry medications if needed',
        'Respect local customs and temple timings'
      ]
    };

    return Response.json(itinerary);
  } catch (error) {
    console.error('Error generating itinerary:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});