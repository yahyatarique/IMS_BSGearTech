 'use client'
 
import { ProgressProvider } from '@bprogress/next/app';


const BpProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProgressProvider 
      height="4px"
      color="#2b6cb0"
      options={{ showSpinner: false }}
      shallowRouting
    >
      {children}
    </ProgressProvider>
  );
};
 
export default BpProvider;