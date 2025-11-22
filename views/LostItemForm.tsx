import React, { useState } from 'react';
import type { LostItemReport, Profile } from '../types';
import { ImageUploader } from '../components/ImageUploader';

interface LostItemFormProps {
  addLostItem: (item: LostItemReport) => void;
  onClose: () => void;
}

const LOCATIONS = ["Library", "Gym", "Canteen", "Student Hub", "Parking Lot", "Room 301", "Anywhere on Campus", "Other"];

const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label} {props.required && <span className="text-red-500">*</span>}</label>
        <input {...props} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
    </div>
);

const SelectField: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string, children: React.ReactNode }> = ({ label, children, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label} {props.required && <span className="text-red-500">*</span>}</label>
        <select {...props} className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
            {children}
        </select>
    </div>
);


export const LostItemForm: React.FC<LostItemFormProps> = ({ addLostItem, onClose }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<Omit<Profile, 'schoolEmail'>>({
    fullName: '',
    sectionYear: '',
    contactNumber: '',
  });
  const [itemDetails, setItemDetails] = useState({
    itemName: '',
    dateLost: '',
    lastKnownLocation: LOCATIONS[0],
    description: '',
    image: '',
  });
  const [error, setError] = useState<string | null>(null);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleItemChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setItemDetails({ ...itemDetails, [e.target.name]: e.target.value });
  };
  
  const handleImageUpload = (base64Image: string) => {
    setItemDetails({ ...itemDetails, image: base64Image });
  };

  const nextStep = () => {
    const { fullName, sectionYear, contactNumber } = profile;
    if (!fullName || !sectionYear || !contactNumber) {
        setError("Please fill in all profile fields.");
        return;
    }
    setError(null);
    setStep(2);
  };

  const prevStep = () => setStep(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { dateLost, lastKnownLocation, description, image, itemName } = itemDetails;
    if(!dateLost || !lastKnownLocation || !description || !image || !itemName) {
        setError("Please fill in all item details and upload an image.");
        return;
    }
    setError(null);
    const newLostItem: LostItemReport = {
      id: `lost-${Date.now()}`,
      profile,
      ...itemDetails,
    };
    addLostItem(newLostItem);
    alert('Your lost item report has been submitted. We will notify you if a potential match is found.');
    onClose();
  };

  const renderStepIndicator = () => (
    <div className="mb-4 text-center">
        <span className={`inline-block w-4 h-4 rounded-full ${step === 1 ? 'bg-blue-600' : 'bg-gray-300'}`}></span>
        <span className="inline-block w-8 h-1 bg-gray-300 align-middle mx-2"></span>
        <span className={`inline-block w-4 h-4 rounded-full ${step === 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></span>
        <p className="text-sm text-gray-500 mt-2">Step {step} of 2: {step === 1 ? "About You" : "About the Lost Item"}</p>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-full overflow-y-auto">
        <div className="p-8 relative">
           <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">Report Your Lost Item</h2>
              <p className="mt-1 text-sm text-gray-600">
                Provide as much detail as possible to help us find it.
              </p>
            </div>
            <div className="mt-6">
                {renderStepIndicator()}
                <form className="space-y-6" onSubmit={handleSubmit}>
                    {step === 1 && (
                    <>
                        <h3 className="text-lg font-medium text-gray-900 text-center">Your Profile</h3>
                        <InputField label="Full Name" name="fullName" type="text" value={profile.fullName} onChange={handleProfileChange} required />
                        <InputField label="Section & Year Level" name="sectionYear" type="text" value={profile.sectionYear} onChange={handleProfileChange} required placeholder="e.g., BSIT 3-A" />
                        <InputField label="Contact Number" name="contactNumber" type="tel" value={profile.contactNumber} onChange={handleProfileChange} required />
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        <button type="button" onClick={nextStep} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Next: Item Details
                        </button>
                    </>
                    )}
                    {step === 2 && (
                    <>
                        <h3 className="text-lg font-medium text-gray-900 text-center">Your Lost Item</h3>
                        <InputField label="Item Name" name="itemName" type="text" value={itemDetails.itemName} onChange={handleItemChange} required placeholder="e.g., Black Umbrella, Silver Watch"/>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Picture of Item <span className="text-red-500">*</span></label>
                            <ImageUploader onImageUpload={handleImageUpload} instructionText="If you don't have an exact photo, upload one of a similar-looking item." />
                        </div>
                        <InputField label="Description" name="description" type="text" value={itemDetails.description} onChange={handleItemChange} required placeholder="e.g., Has a cat sticker, scratched on the face" />
                        <SelectField label="Last Known Location" name="lastKnownLocation" value={itemDetails.lastKnownLocation} onChange={handleItemChange} required>
                            {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                        </SelectField>
                        <InputField label="Date Lost" name="dateLost" type="date" value={itemDetails.dateLost} onChange={handleItemChange} required />
                        
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        <div className="flex gap-4">
                        <button type="button" onClick={prevStep} className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Back
                        </button>
                        <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            Submit Report
                        </button>
                        </div>
                    </>
                    )}
                </form>
            </div>
        </div>
      </div>
    </div>
  );
};
