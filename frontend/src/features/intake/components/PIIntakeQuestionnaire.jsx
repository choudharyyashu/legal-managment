import React from 'react';
import {
  Car,
  Users,
  Stethoscope,
  Shield,
  FileQuestion,
  Info,
  Calendar,
  MapPin,
  AlertCircle
} from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';

export const ACCIDENT_TYPES = [
  { value: 'Motor Vehicle Collision', label: 'Motor Vehicle Collision (Auto / Car)' },
  { value: 'Commercial Trucking Accident', label: 'Commercial Truck / Semi-Trailer Crash' },
  { value: 'Pedestrian vs Vehicle', label: 'Pedestrian Struck by Vehicle' },
  { value: 'Motorcycle Collision', label: 'Motorcycle Accident' },
  { value: 'Bicycle Collision', label: 'Bicycle Collision' },
  { value: 'Premises Liability / Slip & Fall', label: 'Premises Liability / Slip & Fall' },
  { value: 'Wrongful Death', label: 'Wrongful Death Incident' },
  { value: 'Other Personal Injury', label: 'Other Personal Injury / Tort' },
];

export function PIIntakeQuestionnaire({ piData, onChange }) {
  const update = (field, val) => {
    onChange({
      ...piData,
      [field]: val,
    });
  };

  return (
    <div className="space-y-4 pt-2">
      <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 flex items-start gap-2">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block">Personal Injury Intake Protocol (Utah RPC 1.1 Competence):</span>
          Capture verified accident, medical, and insurance details. Leave unknown fields empty—do not invent or assume information. Missing items will be flagged for follow-up.
        </div>
      </div>

      {/* SECTION A: Accident Information */}
      <div className="p-3 bg-white border border-[#D9D6CF] rounded shadow-subtle space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#06244B] border-b border-[#ECEAE5] pb-2">
          <Car className="w-4 h-4 text-[#B42318]" />
          <span>A. Accident &amp; Incident Information</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <Input
              type="date"
              label="Accident Date"
              value={piData.accidentDate || ''}
              onChange={(e) => update('accidentDate', e.target.value)}
              helperText="Date collision or injury occurred"
            />
          </div>

          <div>
            <Select
              label="Incident / Collision Type"
              options={ACCIDENT_TYPES}
              value={piData.accidentType || ACCIDENT_TYPES[0].value}
              onChange={(e) => update('accidentType', e.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <Input
              label="Accident Location (Street / Intersection, City, State)"
              value={piData.accidentLocation || ''}
              onChange={(e) => update('accidentLocation', e.target.value)}
              placeholder="e.g. Intersection of 700 East & 2100 South, Salt Lake City, UT"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-[#202A35] mb-1">
              Accident Description &amp; Mechanism of Injury
            </label>
            <textarea
              className="w-full text-xs p-2.5 rounded border border-[#D9D6CF] focus:outline-none focus:ring-1 focus:ring-[#06244B]"
              rows={3}
              value={piData.incidentDescription || ''}
              onChange={(e) => update('incidentDescription', e.target.value)}
              placeholder="Describe how the collision occurred, impact dynamics (e.g. rear-end collision at red light), weather, and immediate vehicle damage..."
            />
          </div>
        </div>
      </div>

      {/* SECTION B: People Involved */}
      <div className="p-3 bg-white border border-[#D9D6CF] rounded shadow-subtle space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#06244B] border-b border-[#ECEAE5] pb-2">
          <Users className="w-4 h-4 text-[#A4432B]" />
          <span>B. People Involved &amp; Adversaries</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <Input
              label="Injured Client / Driver"
              value={piData.injuredClient || ''}
              onChange={(e) => update('injuredClient', e.target.value)}
              placeholder="Primary claimant name"
            />
          </div>

          <div>
            <Input
              label="Passengers &amp; Witnesses (If Any)"
              value={piData.relevantParticipants || ''}
              onChange={(e) => update('relevantParticipants', e.target.value)}
              placeholder="e.g. John Doe (Passenger), Witness Jane Smith (801-555-0199)"
            />
          </div>

          <div className="sm:col-span-2">
            <Input
              label="Opposing / Adverse Parties (Drivers &amp; Vehicle Owners)"
              value={piData.opposingParties || ''}
              onChange={(e) => update('opposingParties', e.target.value)}
              placeholder="e.g. Robert Jensen (Adverse Driver), Apex Logistics LLC (Vehicle Owner)"
              helperText="These entities will be screened against the firm's active client database."
            />
          </div>
        </div>
      </div>

      {/* SECTION C: Injury and Medical Information */}
      <div className="p-3 bg-white border border-[#D9D6CF] rounded shadow-subtle space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#06244B] border-b border-[#ECEAE5] pb-2">
          <Stethoscope className="w-4 h-4 text-[#287A55]" />
          <span>C. Injury &amp; Medical Treatment</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="sm:col-span-2">
            <Input
              label="Known Physical &amp; Psychological Injuries"
              value={piData.knownInjuries || ''}
              onChange={(e) => update('knownInjuries', e.target.value)}
              placeholder="e.g. Cervical spine sprain, L4-L5 disc protrusion, mild traumatic brain injury, right shoulder contusion"
            />
          </div>

          <div>
            <Input
              label="Primary Treating Medical Providers"
              value={piData.treatingProviders || ''}
              onChange={(e) => update('treatingProviders', e.target.value)}
              placeholder="e.g. Dr. Arthur Miller, MD; Wasatch Spine & Joint"
            />
          </div>

          <div>
            <Input
              label="Emergency Room / Medical Facilities"
              value={piData.medicalFacilities || ''}
              onChange={(e) => update('medicalFacilities', e.target.value)}
              placeholder="e.g. Intermountain Medical Center ER, Salt Lake Orthopedics"
            />
          </div>
        </div>
      </div>

      {/* SECTION D: Insurance Information */}
      <div className="p-3 bg-white border border-[#D9D6CF] rounded shadow-subtle space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#06244B] border-b border-[#ECEAE5] pb-2">
          <Shield className="w-4 h-4 text-[#06244B]" />
          <span>D. Insurance &amp; Claim Information</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <Input
              label="Adverse Insurance Company"
              value={piData.insuranceCompany || ''}
              onChange={(e) => update('insuranceCompany', e.target.value)}
              placeholder="e.g. State Farm Insurance, Geico, Progressive"
            />
          </div>

          <div>
            <Input
              label="Adverse Policyholder / Insured Name"
              value={piData.insuredName || ''}
              onChange={(e) => update('insuredName', e.target.value)}
              placeholder="Name of insured driver or policyholder"
            />
          </div>

          <div>
            <Input
              label="Claim Number"
              value={piData.claimNumber || ''}
              onChange={(e) => update('claimNumber', e.target.value)}
              placeholder="e.g. 45-9876-K22 (leave blank if not yet assigned)"
            />
          </div>

          <div>
            <Input
              label="Policy Number"
              value={piData.policyNumber || ''}
              onChange={(e) => update('policyNumber', e.target.value)}
              placeholder="Policy # if known"
            />
          </div>

          <div>
            <Input
              label="Assigned Adjuster Name"
              value={piData.adjusterName || ''}
              onChange={(e) => update('adjusterName', e.target.value)}
              placeholder="e.g. Assigned Attorney"
            />
          </div>

          <div>
            <Input
              label="Adjuster Phone / Extension"
              value={piData.adjusterPhone || ''}
              onChange={(e) => update('adjusterPhone', e.target.value)}
              placeholder="e.g. (800) 555-0144 ext 302"
            />
          </div>

          <div className="sm:col-span-2">
            <Input
              label="Adjuster Email (For Representation Letter Delivery)"
              type="email"
              value={piData.adjusterEmail || ''}
              onChange={(e) => update('adjusterEmail', e.target.value)}
              placeholder="e.g. claims.utah@statefarm.com"
            />
          </div>
        </div>
      </div>

      {/* SECTION E: Evidence & Missing Information */}
      <div className="p-3 bg-white border border-[#D9D6CF] rounded shadow-subtle space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#06244B] border-b border-[#ECEAE5] pb-2">
          <FileQuestion className="w-4 h-4 text-purple-700" />
          <span>E. Evidence &amp; Missing Information Tracker</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <Input
              label="Known Evidence in Hand"
              value={piData.knownEvidence || ''}
              onChange={(e) => update('knownEvidence', e.target.value)}
              placeholder="e.g. Photos of vehicle damage, scene photos, witness business card"
            />
          </div>

          <div>
            <Input
              label="Outstanding / Missing Records"
              value={piData.outstandingInformation || ''}
              onChange={(e) => update('outstandingInformation', e.target.value)}
              placeholder="e.g. Awaiting official police accident report, emergency room billing ledger"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-[#202A35] mb-1">
              Additional Intake &amp; Case Strategy Notes
            </label>
            <textarea
              className="w-full text-xs p-2.5 rounded border border-[#D9D6CF] focus:outline-none focus:ring-1 focus:ring-[#06244B]"
              rows={2}
              value={piData.additionalNotes || ''}
              onChange={(e) => update('additionalNotes', e.target.value)}
              placeholder="Any statute of limitations concerns, subrogation liens, comparative negligence allegations, or urgent client deadlines..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
