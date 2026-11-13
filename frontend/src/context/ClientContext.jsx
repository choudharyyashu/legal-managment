import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_CLIENTS } from '../data/mockClients';
import { mockStorage } from '../services/mockStorage';

const ClientContext = createContext();

export function ClientProvider({ children }) {
  const [clients, setClients] = useState(() => {
    return mockStorage.get('clients', MOCK_CLIENTS);
  });

  // Mock Intake records
  const [intakes, setIntakes] = useState(() => {
    return mockStorage.get('intakes', [
      {
        id: 'INT-901',
        prospectiveClient: 'Clearwater Basin Agricultural Water Co.',
        contactPerson: 'LeRoy Jenkins (Board President)',
        email: 'leroy@clearwaterbasin.org',
        phone: '(435) 555-0311',
        practiceAreaId: 'pa-6',
        practiceAreaName: 'Real Estate, Water Rights & Land Use',
        adverseParties: 'Utah State Water Resources Board, Central Valley Irrigation Canal Co.',
        conflictStatus: 'Cleared',
        reviewedBy: 'Eleanor Heugly, Esq.',
        reviewedAt: '2026-11-04',
        matterSummary: 'Petition for supplemental ground well extraction rights and canal maintenance easement defense.',
        convertedToClient: false,
        createdAt: '2026-11-02',
      },
      {
        id: 'INT-902',
        prospectiveClient: 'Vanguard Medical Devices Corp',
        contactPerson: 'Dr. Gregory Vance',
        email: 'gvance@vanguardmed.com',
        phone: '(801) 555-0988',
        practiceAreaId: 'pa-1',
        practiceAreaName: 'Civil Litigation & Dispute Resolution',
        adverseParties: 'Summit Crest BioSciences Inc., BioNexus Labs',
        conflictStatus: 'Conflict Identified',
        reviewedBy: 'Thomas Bludworth, Esq.',
        reviewedAt: '2026-11-05',
        matterSummary: 'Prospective representation adverse to existing firm client Summit Crest BioSciences. Direct conflict of interest identified under Utah RPC 1.7.',
        convertedToClient: false,
        createdAt: '2026-11-03',
      },
      {
        id: 'INT-903',
        prospectiveClient: 'Bryce Canyon Hospitality Partners',
        contactPerson: 'Marcus Aurelius Sterling',
        email: 'sterling@brycehospitality.com',
        phone: '(435) 555-0622',
        practiceAreaId: 'pa-5',
        practiceAreaName: 'Commercial & Corporate Law',
        adverseParties: 'Garfield County Planning Commission',
        conflictStatus: 'In Review',
        reviewedBy: null,
        reviewedAt: null,
        matterSummary: 'Hotel zoning variances, municipal sewer capacity credits, and resort tax licensing.',
        convertedToClient: false,
        createdAt: '2026-11-05',
      }
    ]);
  });

  useEffect(() => {
    mockStorage.set('clients', clients);
  }, [clients]);

  useEffect(() => {
    mockStorage.set('intakes', intakes);
  }, [intakes]);

  const addClient = (newClientData) => {
    const id = `CLI-${1000 + clients.length + 1}`;
    const newClient = {
      id,
      createdAt: new Date().toISOString().split('T')[0],
      totalMatters: 0,
      outstandingBalance: 0,
      ...newClientData,
    };
    setClients(prev => [newClient, ...prev]);
    return newClient;
  };

  const updateClient = (id, updatedFields) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updatedFields } : c));
  };

  const getClient = (id) => clients.find(c => c.id === id);

  const addIntake = (intakeData) => {
    const id = `INT-${900 + intakes.length + 1}`;
    const newIntake = {
      id,
      conflictStatus: 'Not Started',
      reviewedBy: null,
      reviewedAt: null,
      convertedToClient: false,
      createdAt: new Date().toISOString().split('T')[0],
      ...intakeData,
    };
    setIntakes(prev => [newIntake, ...prev]);
    return newIntake;
  };

  const updateConflictCheck = (id, status, reviewerName) => {
    setIntakes(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          conflictStatus: status,
          reviewedBy: reviewerName,
          reviewedAt: new Date().toISOString().split('T')[0],
        };
      }
      return item;
    }));
  };

  return (
    <ClientContext.Provider value={{
      clients,
      addClient,
      updateClient,
      getClient,
      intakes,
      addIntake,
      updateConflictCheck,
    }}>
      {children}
    </ClientContext.Provider>
  );
}

export const useClients = () => {
  const context = useContext(ClientContext);
  if (!context) throw new Error('useClients must be used within ClientProvider');
  return context;
};

