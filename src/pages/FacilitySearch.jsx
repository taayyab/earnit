import React from 'react';
import VeteranLayout from '../components/VeteranLayout';
import FacilityFinder from '../components/facilities/FacilityFinder';
import { Card, CardContent } from '../components/ui/card';
import { Building2, Heart, Briefcase, Users, MapPin, Phone, AlertCircle, Wifi } from 'lucide-react';

const APP_NAVY = '#1B3A5F';

export default function FacilitySearch() {
  return (
    <VeteranLayout>
      <div className="min-h-full bg-slate-50">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6">

          {/* Header */}
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">VA Facilities</h1>
              <p className="mt-1 text-gray-500">
                Find VA Medical Centers, Regional Offices, and Vet Centers near you
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-300 font-medium">Sandbox</span>
              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 border border-green-300 font-medium flex items-center gap-1">
                <Wifi className="h-3 w-3" /> VA Connected
              </span>
            </div>
          </div>

          {/* Scenario Banner */}
          <div
            className="rounded-xl p-4 border-2 text-white"
            style={{ background: `linear-gradient(135deg, ${APP_NAVY} 0%, #2a5298 100%)`, borderColor: APP_NAVY }}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-lg">Scenario 11 — VA Facilities Locator</p>
                <p className="text-white/80 text-sm mt-0.5">
                  VA API: <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs">va_facilities/v1</code>
                  &nbsp;·&nbsp;Auth: <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs">API Key</code>
                  &nbsp;·&nbsp;Endpoint: <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs">GET /facilities/v1/facilities</code>
                </p>
                <p className="text-white/70 text-xs mt-2">
                  Medical centers · Regional offices · Vet centers · Drive time · C&P exam locations
                </p>
              </div>
            </div>
          </div>

          {/* Category cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4 flex items-start gap-3">
                <div className="p-2 bg-red-100 rounded-lg flex-shrink-0">
                  <Heart className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-red-900">Medical Centers</h3>
                  <p className="text-xs text-red-700 mt-0.5">Primary care, specialty care, mental health, and C&P exams</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">Regional Offices</h3>
                  <p className="text-xs text-blue-700 mt-0.5">Claims assistance, education benefits, and vocational rehab</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border" style={{ background: `${APP_NAVY}08`, borderColor: `${APP_NAVY}30` }}>
              <CardContent className="p-4 flex items-start gap-3">
                <div className="p-2 rounded-lg flex-shrink-0" style={{ background: `${APP_NAVY}15` }}>
                  <Users className="h-5 w-5" style={{ color: APP_NAVY }} />
                </div>
                <div>
                  <h3 className="font-semibold" style={{ color: APP_NAVY }}>Vet Centers</h3>
                  <p className="text-xs mt-0.5" style={{ color: APP_NAVY }}>Readjustment counseling, PTSD treatment, and family support</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Facility finder */}
          <FacilityFinder defaultState="FL" />

          {/* Emergency banner */}
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-900">Need Immediate Assistance?</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    For emergencies, call 911. Veterans Crisis Line:{' '}
                    <a href="tel:988" className="font-semibold underline">988</a> then press 1.
                    VA Benefits Hotline:{' '}
                    <a href="tel:1-800-827-1000" className="font-semibold underline">1-800-827-1000</a>.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Why find a facility */}
          <div
            className="rounded-xl border p-5 space-y-3"
            style={{ background: `${APP_NAVY}08`, borderColor: `${APP_NAVY}30` }}
          >
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" style={{ color: APP_NAVY }} />
              <h3 className="font-semibold text-sm" style={{ color: APP_NAVY }}>Why Find a VA Facility?</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-700">
              {[
                { icon: MapPin,  title: 'C&P Exams',         desc: 'Compensation & Pension exams are conducted at VA Medical Centers — knowing the nearest one saves time.' },
                { icon: Briefcase, title: 'Claims Assistance', desc: 'Regional Offices help with claim submissions, appeals, and education benefits in person.' },
                { icon: Phone,  title: 'Medical Records',    desc: 'Request service treatment records and evidence directly from VA facilities for your claim.' },
                { icon: Users,  title: 'Vet Center Support', desc: 'Vet Centers offer confidential PTSD counseling, MST support, and family readjustment services.' },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-start gap-2">
                    <Icon className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" style={{ color: APP_NAVY }} />
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </VeteranLayout>
  );
}
