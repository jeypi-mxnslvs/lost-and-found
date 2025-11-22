
import React, { useState } from 'react';
import { Page } from './types';
import type { LostItemReport, FoundItemReport } from './types';

import { HomePage } from './views/HomePage';
import { LostItemForm } from './views/LostItemForm';
import { FoundItemForm } from './views/FoundItemForm';
import { MatchingDashboard } from './views/MatchingDashboard';

// Placeholder data for demonstration
const initialLostItems: LostItemReport[] = [
    {
        id: 'lost-1',
        profile: {
            fullName: 'Jane Doe',
            sectionYear: 'BSCS 4-B',
            contactNumber: '09123456789',
        },
        itemName: "Jansport Backpack",
        dateLost: '2023-10-26',
        lastKnownLocation: 'University Library',
        description: 'Black Jansport backpack with a NASA patch and a water bottle in the side pocket.',
        image: 'https://picsum.photos/seed/backpack/400/400'
    },
    {
        id: 'lost-2',
        profile: {
            fullName: 'John Smith',
            sectionYear: 'BSME 2-A',
            contactNumber: '09987654321',
        },
        itemName: 'Hydro-Flask Bottle',
        dateLost: '2023-10-25',
        lastKnownLocation: 'Gym',
        description: 'Blue Hydro-Flask water bottle with several stickers on it, slightly dented at the bottom.',
        image: 'https://picsum.photos/seed/bottle/400/400'
    }
];

const initialFoundItems: FoundItemReport[] = [
    {
        id: 'found-1',
        itemName: 'Backpack',
        image: 'https://picsum.photos/seed/backpack/400/400',
        description: 'A black backpack was left on a chair. It has a distinctive NASA patch.',
        locationFound: 'Library',
        dateFound: '2023-10-26',
        finderName: 'Library Staff',
        finderContact: 'N/A'
    },
     {
        id: 'found-2',
        itemName: 'Keys',
        image: 'https://picsum.photos/seed/keys/400/400',
        description: 'Set of keys on a blue lanyard with a car key.',
        locationFound: 'Canteen',
        dateFound: '2023-10-27',
        finderName: 'Mark',
        finderContact: '09112233445'
    }
];


function App() {
  const [page, setPage] = useState<Page>(Page.Home);
  const [activeModal, setActiveModal] = useState<'lost' | 'found' | null>(null);
  const [lostItems, setLostItems] = useState<LostItemReport[]>(initialLostItems);
  const [foundItems, setFoundItems] = useState<FoundItemReport[]>(initialFoundItems);

  const addLostItem = (item: LostItemReport) => {
    setLostItems(prev => [...prev, item]);
  };

  const addFoundItem = (item: FoundItemReport) => {
    setFoundItems(prev => [...prev, item]);
  };
  
  const renderContent = () => {
    if (page === Page.Dashboard) {
      return <MatchingDashboard foundItems={foundItems} lostItems={lostItems} setPage={setPage} />;
    }

    return (
        <>
            <HomePage setPage={setPage} setModal={setActiveModal} />
            {activeModal === 'lost' && <LostItemForm addLostItem={addLostItem} onClose={() => setActiveModal(null)} />}
            {activeModal === 'found' && <FoundItemForm addFoundItem={addFoundItem} onClose={() => setActiveModal(null)}/>}
        </>
    )
  };

  return <div className="App">{renderContent()}</div>;
}

export default App;
