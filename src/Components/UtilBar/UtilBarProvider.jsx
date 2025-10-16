import { createContext, useContext, useState, useCallback } from 'react';

const UtilBarContext = createContext();

export function UtilBarProvider({ children }) {
  const [defaultItems, setDefaultItems] = useState([]);
  const [overrideItems, setOverrideItems] = useState(null);

  const items = overrideItems || defaultItems;

  const setDefault = useCallback((items) => setDefaultItems(items), []);
  const setOverride = useCallback((items) => setOverrideItems(items), []);
  const clearOverride = useCallback(() => setOverrideItems(null), []);

  return (
    <UtilBarContext.Provider value={{ items, setDefault, setOverride, clearOverride }}>
      {children}
    </UtilBarContext.Provider>
  );
}

export function useUtilBar() {
  const context = useContext(UtilBarContext);
  if (!context) {
    throw new Error('useUtilBar must be used within UtilBarProvider');
  }
  return context;
}
