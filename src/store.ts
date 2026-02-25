export interface Member {
  id: string;
  name: string;
  phone: string;
  dob: string;
  visits: number;
  totalRewards: number;
  createdAt: number;
}

export const STORAGE_KEYS = {
  MEMBERS: 'tee_phyno_members',
  CURRENT_MEMBER_ID: 'tee_phyno_current_member_id',
  APP_MODE: 'tee_phyno_app_mode',
};

export const getMembers = (): Member[] => {
  const data = localStorage.getItem(STORAGE_KEYS.MEMBERS);
  return data ? JSON.parse(data) : [];
};

export const saveMembers = (members: Member[]) => {
  localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
};

export const getMemberById = (id: string): Member | undefined => {
  const members = getMembers();
  return members.find(m => m.id === id);
};

export const getCurrentMemberId = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.CURRENT_MEMBER_ID);
};

export const setCurrentMemberId = (id: string) => {
  localStorage.setItem(STORAGE_KEYS.CURRENT_MEMBER_ID, id);
};

export const addMember = (name: string, phone: string, dob: string): Member => {
  const members = getMembers();
  const newMember: Member = {
    id: `TPC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    name,
    phone,
    dob,
    visits: 0,
    totalRewards: 0,
    createdAt: Date.now(),
  };
  members.push(newMember);
  saveMembers(members);
  return newMember;
};

export const updateVisit = (id: string): Member | null => {
  const members = getMembers();
  const index = members.findIndex(m => m.id === id);
  if (index !== -1) {
    members[index].visits += 1;
    saveMembers(members);
    return members[index];
  }
  return null;
};

export const redeemReward = (id: string): Member | null => {
  const members = getMembers();
  const index = members.findIndex(m => m.id === id);
  if (index !== -1 && members[index].visits >= 10) {
    members[index].visits = 0;
    members[index].totalRewards += 1;
    saveMembers(members);
    return members[index];
  }
  return null;
};

export const setAppMode = (mode: 'member' | 'staff') => {
  localStorage.setItem(STORAGE_KEYS.APP_MODE, mode);
};

export const getAppMode = (): 'member' | 'staff' | null => {
  return localStorage.getItem(STORAGE_KEYS.APP_MODE) as 'member' | 'staff' | null;
};
