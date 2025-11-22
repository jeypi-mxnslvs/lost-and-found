import React, { useState } from 'react';
import type { FoundItemReport } from '../types';
import { ImageUploader } from '../components/ImageUploader';

interface FoundItemFormProps {
  addFoundItem: (item: FoundItemReport) => void;
  onClose: () => void;
}

const LOCATIONS = ["Library", "Gym", "Canteen", "Student Hub", "Parking Lot", "Room 301", "Other"];

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

export const FoundItemForm: React.FC<FoundItemFormProps> = ({ addFoundItem, onClose }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    itemName: '',
    image: '',
    description: '',
    locationFound: LOCATIONS[0],
    dateFound: '',
    finderName: '',
    finderContact: '',
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (base64Image: string) => {
    setFormData({ ...formData, image: base64Image });
  };
  
  const nextStep = () => {
     if (!formData.image || !formData.description || !formData.locationFound || !formData.dateFound || !formData.itemName) {
      setError('Please fill in all required fields and upload an image.');
      return;
    }
    setError(null);
    setStep(2);
  }
  
  const prevStep = () => setStep(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const newFoundItem: FoundItemReport = {
      id: `found-${Date.now()}`,
      ...formData,
    };
    addFoundItem(newFoundItem);
    alert('Thank you for your submission! Your report has been filed.');
    onClose();
  };
  
  const renderStepIndicator = () => (
    <div className="mb-4 text-center">
        <span className={`inline-block w-4 h-4 rounded-full ${step === 1 ? 'bg-blue-600' : 'bg-gray-300'}`}></span>
        <span className="inline-block w-8 h-1 bg-gray-300 align-middle mx-2"></span>
        <span className={`inline-block w-4 h-4 rounded-full ${step === 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></span>
        <p className="text-sm text-gray-500 mt-2">Step {step} of 2: {step === 1 ? "Item Details" : "Your Contact Info (Optional)"}</p>
    </div>
  );

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
                    <h2 className="text-2xl font-bold text-gray-900">Report a Found Item</h2>
                    <p className="mt-1 text-sm text-gray-600">
                      Thank you for helping reunite an item with its owner.
                    </p>
                </div>

                <div className="mt-6">
                    {renderStepIndicator()}
                     <form className="space-y-6" onSubmit={handleSubmit}>
                        {step === 1 && (
                            <>
                                <InputField label="Item Name" name="itemName" type="text" value={formData.itemName} onChange={handleChange} required placeholder="e.g. Umbrella, Watch"/>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Upload Picture <span className="text-red-500">*</span></label>
                                    <ImageUploader onImageUpload={handleImageUpload} instructionText="A clear photo is the best way to identify the item." />
                                </div>
                                <InputField label="Description" name="description" type="text" value={formData.description} onChange={handleChange} required placeholder="e.g. Silver watch with leather strap"/>
                                <SelectField label="Location Found" name="locationFound" value={formData.locationFound} onChange={handleChange} required>
                                    {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                                </SelectField>
                                <InputField label="Date Found" name="dateFound" type="date" value={formData.dateFound} onChange={handleChange} required />
                                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                                <button type="button" onClick={nextStep} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                    Next: Your Info
                                </button>
                            </>
                        )}
                        {step === 2 && (
                             <>
                                <h3 className="text-lg font-medium text-gray-900 text-center">Your Contact Info</h3>
                                <p className="text-sm text-center text-gray-500">This is optional, but helps owners connect with you.</p>
                                <InputField label="Your Name" name="finderName" type="text" value={formData.finderName} onChange={handleChange} />
                                <InputField label="Your Contact Number" name="finderContact" type="tel" value={formData.finderContact} onChange={handleChange} />
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
