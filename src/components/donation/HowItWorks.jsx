import React from 'react';
import { Target, Shield, BarChart3, ArrowRight } from 'lucide-react';

const STEPS = [
  {
    icon: Target,
    title: 'Choose Your Cause',
    description: 'Browse 50+ verified campaigns across temples, education, food, and medical aid.',
    color: 'from-orange-500 to-amber-500'
  },
  {
    icon: Shield,
    title: 'Donate Securely',
    description: '100% secure payment with tax benefits. Every rupee goes to the cause.',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: BarChart3,
    title: 'See Your Impact',
    description: 'Get updates with photos and reports showing how your donation helped.',
    color: 'from-blue-500 to-indigo-500'
  }
];

export default function HowItWorks() {
  return (
    <div className="py-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">How It Works</h2>
        <p className="text-gray-500">Three simple steps to make a difference</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {STEPS.map((step, idx) => (
          <div key={idx} className="relative">
            <div className="text-center">
              {/* Step Number */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center text-sm font-bold text-gray-700 border-2 border-gray-100 z-10">
                {idx + 1}
              </div>
              
              {/* Icon */}
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                <step.icon className="w-10 h-10 text-white" />
              </div>
              
              <h3 className="font-bold text-gray-900 text-lg mb-2">{step.title}</h3>
              <p className="text-gray-500 text-sm">{step.description}</p>
            </div>

            {/* Connector Arrow */}
            {idx < STEPS.length - 1 && (
              <div className="hidden md:block absolute top-10 -right-3 z-20">
                <ArrowRight className="w-6 h-6 text-gray-300" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}