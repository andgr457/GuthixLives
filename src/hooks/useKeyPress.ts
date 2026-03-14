import { useEffect, useCallback } from 'react';

export const useKeyPress = (targetKey: any, callback: any) => {
  const handleKeyDown = useCallback((event: any) => {
    if (event.key === targetKey) {
      callback();
    }
  }, [targetKey, callback]);

  useEffect(() => {
    // Add event listener when the component mounts
    document.addEventListener('keydown', handleKeyDown);

    // Remove event listener when the component unmounts
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]); // Depend on handleKeyDown to ensure correct function reference
};
