
import React from 'react';
// Fix: Import 'Page' as a value, not just a type, since it's an enum used at runtime.
import { Page } from '../types';
import { ArrowRightIcon } from '../components/icons/ArrowRightIcon';

interface HomePageProps {
  setPage: (page: Page) => void;
  setModal: (modal: 'lost' | 'found' | null) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ setPage, setModal }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-800">
          NEUST <span className="text-blue-600">Lost & Found</span>
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          The central hub for finding what's lost and reporting what's found on campus.
        </p>
         <button onClick={() => setPage(Page.Dashboard)} className="mt-4 text-sm text-blue-500 hover:underline">
            View Matching Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <div
          onClick={() => setModal('lost')}
          className="group bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer border border-transparent hover:border-red-500"
        >
          <div className="flex items-center justify-between">
            <div>
                <h2 className="text-2xl font-bold text-red-600">I Lost Something</h2>
                <p className="mt-2 text-gray-500">Report a lost item to get help finding it.</p>
            </div>
            <ArrowRightIcon className="w-8 h-8 text-red-400 group-hover:text-red-600 transition-colors" />
          </div>
        </div>

        <div
          onClick={() => setModal('found')}
          className="group bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer border border-transparent hover:border-green-500"
        >
          <div className="flex items-center justify-between">
            <div>
                <h2 className="text-2xl font-bold text-green-600">I Found Something</h2>
                <p className="mt-2 text-gray-500">Report a found item to help it get back to its owner.</p>
            </div>
             <ArrowRightIcon className="w-8 h-8 text-green-400 group-hover:text-green-600 transition-colors" />
          </div>
        </div>
      </div>
    </div>
  );
};
