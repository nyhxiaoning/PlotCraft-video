import React, { ReactNode } from 'react';

import { TooltipProvider } from '@/components/ui/tooltip';
import { SettingsProvider } from '@/context/SettingsContext';
import { ThemeProvider } from '@/context/ThemeContext';

interface AppProviderProps {
  children: ReactNode;
}

/**
 * 应用根Provider组件
 * 包含所有需要的Context Provider
 */
function AppProvider({ children }: AppProviderProps) {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <TooltipProvider delayDuration={300}>{children}</TooltipProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}

export default AppProvider;
