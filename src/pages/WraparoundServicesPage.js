import React from 'react';
import VeteranLayout from '../components/VeteranLayout';
import WraparoundServices from '../components/WraparoundServices';

export default function WraparoundServicesPage() {
  return (
    <VeteranLayout>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Support Services</h1>
        <p className="text-sm text-slate-600 mb-6">Connect with resources for housing, employment, mental health, and more</p>
        <WraparoundServices />
      </div>
    </VeteranLayout>
  );
}
