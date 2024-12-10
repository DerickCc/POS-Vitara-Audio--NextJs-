'use client';

import { createContext, ReactNode, useContext, useState } from 'react';
import Spinner from '@/components/spinner';

interface OverlayLoadingContextType {
  showOverlayLoading: (text?: string) => void;
  hideOverlayLoading: () => void;
}

const OverlayLoadingContext = createContext<OverlayLoadingContextType | undefined>(undefined);

export function OverlayLoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [text, setText] = useState<string | null>(null);

  const showOverlayLoading = (text: string = 'Loading...') => {
    setIsLoading(true);
    setText(text);
  };

  const hideOverlayLoading = () => {
    setIsLoading(false);
    setText(null);
  };

  return (
    <OverlayLoadingContext.Provider value={{ showOverlayLoading, hideOverlayLoading }}>
      {isLoading && (
        <div className='fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-80 flex items-center justify-center z-[9999]'>
          <Spinner /> <h5 className='text-white ml-4'>{text}</h5>
        </div>
      )}
      {children}
    </OverlayLoadingContext.Provider>
  );
}

export const useOverlayLoading = () => {
  const context = useContext(OverlayLoadingContext);
  if (!context) {
    throw new Error('useOverlayLoading must be used within a OverlayLoadingProvider');
  }
  return context;
};
