'use client';

import { store } from '@/utils/store';
import type { ReactNode } from 'react';
import { Provider } from "react-redux";

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <Provider store={store}>
      {children}
    </Provider>
  );
}