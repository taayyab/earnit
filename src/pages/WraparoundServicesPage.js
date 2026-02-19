import React from 'react';
import PageHeader from '../components/PageHeader';
import WraparoundServices from '../components/WraparoundServices';

export default function WraparoundServicesPage() {
  return (
    <div className="min-h-screen bg-white">
      <PageHeader 
        title="Support Services"
        subtitle="Connect with resources for housing, employment, mental health, and more"
        backTo="/dashboard"
      />
      
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
        <WraparoundServices />
      </div>
    </div>
  );
}
