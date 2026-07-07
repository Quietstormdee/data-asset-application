import { createContext, useContext, useState } from 'react';

const AppContext = createContext(null);

export const ROLES = {
  user:  { label: 'End user',    color: '#378ADD', bg: '#e6f1fb', desc: 'View dashboard and submit asset entries' },
  owner: { label: 'Data owner',  color: '#1D9E75', bg: '#e8f5e9', desc: 'Manage data and approve submissions' },
  admin: { label: 'Admin',       color: '#7F77DD', bg: '#EEEDFE', desc: 'Full access including user management' },
};

export const DIRECTORATES = ['PMO-1','PMO-2','PMO-3','PMO-4','PMO-5','PMO-6','PMO-7','PMO-8'];
export const ASSET_TYPES  = ['Report','Policy','Plan','Metrics','Training','Presentation','IT','Summaries'];
export const PALETTE      = ['#378ADD','#1D9E75','#D85A30','#7F77DD','#D4537E','#BA7517','#639922','#888780'];

export const BASE_ASSET_DATA = [
  { directorate: 'PMO-1', assets: 3000  },
  { directorate: 'PMO-2', assets: 15000 },
  { directorate: 'PMO-3', assets: 8000  },
  { directorate: 'PMO-4', assets: 13000 },
  { directorate: 'PMO-5', assets: 34000 },
  { directorate: 'PMO-6', assets: 2000  },
  { directorate: 'PMO-7', assets: 5000  },
  { directorate: 'PMO-8', assets: 17000 },
];

const INITIAL_SUBMISSIONS = [
  { id: 1, user: 'Alex H', directorate: 'PMO-3', type: 'Report',   assets: 120, note: 'Q1 reports added',         status: 'pending',  date: '2024-06-01' },
  { id: 2, user: 'Dee L',  directorate: 'PMO-1', type: 'IT',       assets: 85,  note: 'New IT assets catalogued',  status: 'pending',  date: '2024-06-02' },
  { id: 3, user: 'Craig H', directorate: 'PMO-5', type: 'Training', assets: 200, note: 'Training materials update', status: 'approved', date: '2024-05-28' },
  { id: 4, user: 'Lionel M',  directorate: 'PMO-2', type: 'Policy',   assets: 45,  note: 'Policy revision docs',      status: 'rejected', date: '2024-05-25' },
];

const INITIAL_USERS = [
  { id: 1, name: 'Alex H', email: 'alex@agency.gov',  role: 'user',  joined: '2024-01-15' },
  { id: 2, name: 'Craig H',   email: 'craig@agency.gov', role: 'owner', joined: '2024-02-03' },
  { id: 3, name: 'Dee L', email: 'dee@agency.gov', role: 'admin', joined: '2023-12-01' },
  { id: 4, name: 'Lionel M',  email: 'lionel@agency.gov', role: 'user',  joined: '2024-03-10' },
];

export function AppProvider({ children }) {
  const [role,        setRole]        = useState(null);
  const [submissions, setSubmissions] = useState(INITIAL_SUBMISSIONS);
  const [users,       setUsers]       = useState(INITIAL_USERS);
  const [toast,       setToast]       = useState(null);
  const [assetData,   setAssetData]   = useState(BASE_ASSET_DATA);
  const [uploadHistory, setUploadHistory] = useState([]);

  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function addSubmission(entry) {
    const sub = {
      id: Date.now(),
      user: 'Current User',
      ...entry,
      assets: Number(entry.assets),
      status: 'pending',
      date: new Date().toISOString().slice(0, 10),
    };
    setSubmissions(prev => [sub, ...prev]);
    showToast('Entry submitted for approval!');
  }

  function approveSubmission(id) {
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: 'approved' } : s));
    showToast('Submission approved');
  }

  function rejectSubmission(id) {
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: 'rejected' } : s));
    showToast('Submission rejected');
  }

  function changeUserRole(userId, newRole) {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    showToast('Role updated');
  }

  function mergeCSVData(newRows, fileName) {
    // newRows = [{ directorate, assets }]
    // Merge into existing asset data by adding to matching directorates
    setAssetData(prev => {
      const merged = prev.map(d => ({ ...d }));
      newRows.forEach(row => {
        const existing = merged.find(d => d.directorate === row.directorate);
        if (existing) {
          existing.assets += row.assets;
        } else {
          merged.push({ directorate: row.directorate, assets: row.assets });
        }
      });
      return merged;
    });
    setUploadHistory(prev => [{
      id: Date.now(),
      fileName,
      rows: newRows.length,
      date: new Date().toISOString().slice(0, 10),
      uploadedBy: 'Current User',
    }, ...prev]);
    showToast(`✓ ${fileName} merged — ${newRows.length} rows added`);
  }

  return (
    <AppContext.Provider value={{
      role, setRole,
      submissions, addSubmission, approveSubmission, rejectSubmission,
      users, changeUserRole,
      toast, showToast,
      assetData, mergeCSVData,
      uploadHistory,
      validDirectorates: BASE_ASSET_DATA.map(d => d.directorate),
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
