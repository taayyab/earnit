import React from 'react';
import { Link } from 'react-router-dom';
import FacilityFinder from '../components/facilities/FacilityFinder';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import {
  ArrowLeft,
  Building2,
  Heart,
  Briefcase,
  Users,
  MapPin,
  Phone,
  AlertCircle
} from 'lucide-react';

export default function FacilitySearch() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="bg-[#003366] text-white py-4 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="h-6 w-px bg-white/30" />
            <div className="flex items-center gap-2">
              <Building2 className="h-6 w-6" />
              <span className="font-semibold text-lg">VA Facility Finder</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Find VA Facilities Near You
          </h1>
          <p className="text-lg text-muted-foreground">
            Locate VA Medical Centers, Regional Offices, and Vet Centers for your healthcare and benefits needs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Heart className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-red-900">Medical Centers</h3>
                <p className="text-sm text-red-700">
                  Primary care, specialty care, mental health, and C&P exams
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Briefcase className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">Regional Offices</h3>
                <p className="text-sm text-blue-700">
                  Claims assistance, education benefits, and vocational rehab
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-purple-900">Vet Centers</h3>
                <p className="text-sm text-purple-700">
                  Readjustment counseling, PTSD treatment, and family support
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <FacilityFinder defaultState="TX" />

        <Card className="mt-8 bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-900">Need Immediate Assistance?</h4>
                <p className="text-sm text-amber-700 mt-1">
                  For emergencies, call 911. For the Veterans Crisis Line, call{' '}
                  <a href="tel:988" className="font-semibold underline">988</a> and press 1.
                  The VA Benefits Hotline is available at{' '}
                  <a href="tel:1-800-827-1000" className="font-semibold underline">1-800-827-1000</a>.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 p-6 bg-slate-100 rounded-lg">
          <h3 className="font-semibold text-lg mb-4">Why Find a VA Facility?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-[#003366] mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">C&P Exams</p>
                <p className="text-muted-foreground">
                  Compensation & Pension exams are often conducted at VA Medical Centers
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-[#003366] mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Claims Assistance</p>
                <p className="text-muted-foreground">
                  Regional Offices can help with claim submissions and appeals
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Phone className="h-4 w-4 text-[#003366] mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Medical Records</p>
                <p className="text-muted-foreground">
                  Request medical records and evidence for your claim
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Phone className="h-4 w-4 text-[#003366] mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Support Services</p>
                <p className="text-muted-foreground">
                  Vet Centers offer confidential counseling and readjustment support
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-slate-100 border-t py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            Facility information is provided by the VA Lighthouse API. 
            For the most current information, please contact facilities directly.
          </p>
        </div>
      </footer>
    </div>
  );
}
