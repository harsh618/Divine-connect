import React from 'react';
import { Card } from "@/components/ui/card";
import { Building2, Flame, Stars, Users, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const services = [
  {
    icon: Building2,
    title: "Temples",
    description: "Discover and visit sacred temples across India",
    color: "from-orange-500 to-amber-500",
    link: "Temples"
  },
  {
    icon: Flame,
    title: "Poojas",
    description: "Book virtual or in-person pooja ceremonies",
    color: "from-red-500 to-orange-500",
    link: "Poojas"
  },
  {
    icon: Stars,
    title: "Astrology",
    description: "Get personalized readings from expert astrologers",
    color: "from-purple-500 to-indigo-500",
    link: "Astrology"
  },
  {
    icon: Users,
    title: "Priests",
    description: "Connect with verified pandits for guidance",
    color: "from-teal-500 to-cyan-500",
    link: "Priests"
  },
  {
    icon: Heart,
    title: "Donate",
    description: "Support temples and charitable causes",
    color: "from-pink-500 to-rose-500",
    link: "Donate"
  }
];

export default function ServiceCards() {
  return (
    <section className="py-20 px-6 bg-gradient-to-b from-white to-orange-50/30">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
            Sacred Services
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Everything you need for your spiritual journey, all in one place
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {services.map((service, index) => (
            <Link key={index} to={createPageUrl(service.link)}>
              <Card className="group p-6 border-0 shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer bg-white overflow-hidden relative">
                <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500`}>
                  <service.icon className="w-7 h-7 text-white" />
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{service.description}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}