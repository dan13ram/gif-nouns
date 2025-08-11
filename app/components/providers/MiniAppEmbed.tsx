"use client";

import { useEffect, useState } from 'react';
import { useSDK } from './SDKProvider';

interface MiniAppEmbedProps {
  children: React.ReactNode;
}

export function MiniAppEmbed({ children }: MiniAppEmbedProps) {
  const { isSDKReady, sdkError, initializeSDK, callReady } = useSDK();
  const [isEmbedReady, setIsEmbedReady] = useState(false);

  useEffect(() => {
    // Initialize SDK if not already done
    if (!isSDKReady && !sdkError) {
      console.log('🔄 MiniAppEmbed: Initializing SDK...');
      initializeSDK();
    }
  }, [isSDKReady, sdkError, initializeSDK]);

  useEffect(() => {
    // Auto-call ready() when SDK is available
    if (isSDKReady && !isEmbedReady && typeof window !== 'undefined') {
      console.log('🔄 MiniAppEmbed: SDK is ready, ensuring ready() is called...');
      
      // Always call ready() regardless of environment
      const timer = setTimeout(async () => {
        try {
          await callReady();
          setIsEmbedReady(true);
          console.log('✅ MiniAppEmbed: Ready state confirmed');
        } catch (error) {
          console.error('❌ MiniAppEmbed: Failed to confirm ready state:', error);
          // Still mark as ready to prevent splash screen persistence
          setIsEmbedReady(true);
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isSDKReady, isEmbedReady, callReady]);

  // Show loading state while initializing
  if (!isEmbedReady && typeof window !== 'undefined') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-purple-600">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold mb-2">GifNouns</h1>
          <p className="text-lg">Loading your animated Nouns experience...</p>
        </div>
      </div>
    );
  }

  // Show children when ready
  return <>{children}</>;
}
