import { createContext, useContext } from 'react';
import { useProfile } from '../hooks/useProfile';

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const value = useProfile();
  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfileContext() {
  return (
    useContext(ProfileContext) ?? {
      profile: null,
      isLoading: false,
      error: null,
      refresh: () => {},
    }
  );
}
