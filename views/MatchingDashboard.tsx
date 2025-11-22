
import React, { useState, useEffect, useCallback } from 'react';
import { Page } from '../types';
import type { FoundItemReport, LostItemReport, MatchResult } from '../types';
import { findMatches } from '../services/geminiService';
import { ArrowLeftIcon } from '../components/icons/ArrowLeftIcon';

interface MatchingDashboardProps {
  foundItems: FoundItemReport[];
  lostItems: LostItemReport[];
  setPage: (page: Page) => void;
}

// Extended type to include match details with the lost item data
interface ScoredMatch extends LostItemReport {
  confidence: number;
  reasoning: string;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center space-y-3">
        <div className="flex space-x-2">
            <div className="w-4 h-4 rounded-full animate-pulse bg-blue-600"></div>
            <div className="w-4 h-4 rounded-full animate-pulse bg-blue-600" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-4 h-4 rounded-full animate-pulse bg-blue-600" style={{ animationDelay: '0.2s' }}></div>
        </div>
        <span className="text-gray-600 font-medium">AI is analyzing images & descriptions...</span>
    </div>
);

export const MatchingDashboard: React.FC<MatchingDashboardProps> = ({ foundItems, lostItems, setPage }) => {
  const [selectedFoundItem, setSelectedFoundItem] = useState<FoundItemReport | null>(null);
  const [potentialMatches, setPotentialMatches] = useState<ScoredMatch[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const [dismissedMatches, setDismissedMatches] = useState<string[]>([]);

  const getMatches = useCallback(async (item: FoundItemReport) => {
    setIsLoadingMatches(true);
    setPotentialMatches([]);
    setDismissedMatches([]); // Reset dismissed when a new item is selected
    try {
      const matchResults: MatchResult[] = await findMatches(item, lostItems);
      
      const scoredMatches: ScoredMatch[] = matchResults
        .map(result => {
            const originalItem = lostItems.find(li => li.id === result.id);
            if (!originalItem) return null;
            return {
                ...originalItem,
                confidence: result.confidence,
                reasoning: result.reasoning
            };
        })
        .filter((item): item is ScoredMatch => item !== null)
        .sort((a, b) => b.confidence - a.confidence); // Sort by highest confidence

      setPotentialMatches(scoredMatches);
    } catch (error) {
      console.error("Failed to get matches:", error);
      alert("An error occurred while trying to find matches. Please check your API key and network connection.");
    } finally {
      setIsLoadingMatches(false);
    }
  }, [lostItems]);

  useEffect(() => {
    if (selectedFoundItem) {
      getMatches(selectedFoundItem);
    }
  }, [selectedFoundItem, getMatches]);

  const handleNotify = (lostItem: LostItemReport) => {
    alert(`A notification has been sent to ${lostItem.profile.fullName} regarding their "${lostItem.itemName}".`);
  };

  const handleDismiss = (lostItemId: string) => {
    setDismissedMatches(prev => [...prev, lostItemId]);
  };
  
  const visibleMatches = potentialMatches.filter(match => !dismissedMatches.includes(match.id));

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-100">
      <header className="bg-white shadow-md p-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center">
            <button onClick={() => setPage(Page.Home)} className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium mr-4">
                <ArrowLeftIcon className="w-5 h-5 mr-1" />
                Home
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Matching Dashboard</h1>
        </div>
      </header>
      
      <div className="flex-grow flex overflow-hidden">
        {/* Left Column: Found Items */}
        <div className="w-1/3 border-r border-gray-200 overflow-y-auto p-4 bg-white">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 sticky top-0 bg-white py-2 z-10">Found Items ({foundItems.length})</h2>
          {foundItems.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">No items have been reported as found yet.</div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {foundItems.map(item => (
                <div 
                  key={item.id}
                  onClick={() => setSelectedFoundItem(item)}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 border-2 ${selectedFoundItem?.id === item.id ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-transparent bg-gray-50 hover:bg-gray-100 hover:shadow-sm'}`}
                >
                  <div className="flex items-start space-x-3">
                    <img src={item.image} alt={item.description} className="w-24 h-24 object-cover rounded-md bg-gray-200 flex-shrink-0" />
                    <div className="flex-grow">
                      <p className="font-semibold text-gray-800 text-base truncate">{item.itemName}</p>
                      <p className="text-xs text-gray-500 mt-1">Found at: {item.locationFound}</p>
                      <p className="text-xs text-gray-500">On: {new Date(item.dateFound).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Potential Matches */}
        <div className="w-2/3 overflow-y-auto p-6 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 sticky top-0 bg-gray-50 py-2 z-10">
             {selectedFoundItem ? `Potential Matches for "${selectedFoundItem.itemName}"` : 'Potential Matches'}
          </h2>
          {!selectedFoundItem ? (
            <div className="flex flex-col items-center justify-center h-3/4 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p>Select a found item from the left list to search for matches.</p>
            </div>
          ) : isLoadingMatches ? (
             <div className="flex items-center justify-center h-3/4">
                <LoadingSpinner />
             </div>
          ) : visibleMatches.length > 0 ? (
            <div className="space-y-6">
              {visibleMatches.map(match => (
                <div key={match.id} className="bg-white p-6 rounded-xl shadow-md border border-gray-200 transition-shadow hover:shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                        <div className={`px-3 py-1 rounded-full text-sm font-bold border ${getConfidenceColor(match.confidence)}`}>
                            Match Confidence: {match.confidence}%
                        </div>
                        <button onClick={() => handleDismiss(match.id)} className="text-gray-400 hover:text-gray-600" title="Dismiss match">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                             </svg>
                        </button>
                    </div>

                    {/* Visual Comparison Section */}
                    <div className="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-100">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 text-center">Visual Comparison</h4>
                        <div className="flex items-center justify-center gap-6 sm:gap-10">
                            <div className="text-center">
                                <div className="relative inline-block">
                                    <img 
                                        src={selectedFoundItem.image} 
                                        alt="Found Item" 
                                        className="w-32 h-32 sm:w-40 sm:h-40 object-cover rounded-lg border-2 border-blue-500 shadow-sm" 
                                    />
                                    <span className="absolute -top-2 -left-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">FOUND</span>
                                </div>
                            </div>
                            
                            <div className="text-gray-300">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </div>

                            <div className="text-center">
                                <div className="relative inline-block">
                                    <img 
                                        src={match.image} 
                                        alt="Lost Item Match" 
                                        className="w-32 h-32 sm:w-40 sm:h-40 object-cover rounded-lg border-2 border-red-500 shadow-sm" 
                                    />
                                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">LOST</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Match Details */}
                        <div className="space-y-3">
                            <h3 className="font-bold text-lg text-gray-800">{match.itemName}</h3>
                            <p className="text-sm text-gray-600 bg-white p-3 rounded border border-gray-100">{match.description}</p>
                            <div className="text-xs text-gray-500 space-y-1 mt-2">
                                <p><span className="font-medium">Lost At:</span> {match.lastKnownLocation}</p>
                                <p><span className="font-medium">Date:</span> {match.dateLost}</p>
                            </div>
                        </div>
                        
                        {/* AI Reasoning & Contact */}
                        <div className="flex flex-col h-full">
                             <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4 flex-grow">
                                <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wide mb-2">AI Reasoning</h4>
                                <p className="text-sm text-gray-700 italic">"{match.reasoning}"</p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <h4 className="font-semibold text-gray-800 text-sm mb-2">Owner Contact</h4>
                                <div className="space-y-1 text-sm text-gray-600">
                                    <p><span className="font-medium">Name:</span> {match.profile.fullName}</p>
                                    <p><span className="font-medium">Year:</span> {match.profile.sectionYear}</p>
                                    <p><span className="font-medium">Phone:</span> {match.profile.contactNumber}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                         <button onClick={() => handleNotify(match)} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Contact Owner
                        </button>
                    </div>
                </div>
              ))}
            </div>
          ) : (
             <div className="flex items-center justify-center h-3/4 text-gray-500">
                <div className="text-center">
                    <p className="text-lg font-medium">No strong matches found.</p>
                    <p className="text-sm mt-2">The AI analyzed all lost items but didn't find a close match based on images and descriptions.</p>
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
