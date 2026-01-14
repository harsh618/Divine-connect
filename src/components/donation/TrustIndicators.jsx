import React from 'react';
import { Shield, FileCheck, Eye, CreditCard, Award, CheckCircle } from 'lucide-react';

const TRUST_BADGES = [
  { icon: FileCheck, label: '80G Tax Benefits', description: 'Get tax exemption on donations' },
  { icon: Shield, label: 'FCRA Certified', description: 'Foreign contributions registered' },
  { icon: Eye, label: 'Transparent Reporting', description: 'See exactly how funds are used' },
  { icon: CreditCard, label: 'Zero Platform Fees', description: '100% goes to the cause' },
];

const PARTNERS = [
  'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Government_of_India_logo.svg/100px-Government_of_India_logo.svg.png',
];

export default function TrustIndicators() {
  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full text-green-700 text-sm font-medium mb-2">
          <Shield className="w-4 h-4" />
          100% Trusted & Secure
        </div>
        <h3 className="text-xl font-bold text-gray-900">Your Trust, Our Commitment</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {TRUST_BADGES.map((badge, idx) => (
          <div key={idx} className="text-center">
            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto mb-2">
              <badge.icon className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900 text-sm">{badge.label}</h4>
            <p className="text-xs text-gray-500 mt-0.5">{badge.description}</p>
          </div>
        ))}
      </div>

      {/* Security Badges */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-6 pt-6 border-t border-green-200">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <CheckCircle className="w-4 h-4 text-green-500" />
          SSL Encrypted
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <CheckCircle className="w-4 h-4 text-green-500" />
          PCI DSS Compliant
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <CheckCircle className="w-4 h-4 text-green-500" />
          256-bit Security
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <CheckCircle className="w-4 h-4 text-green-500" />
          Verified Organization
        </div>
      </div>
    </div>
  );
}