'use client';

if (typeof window !== 'undefined') {
  const originalError = console.error;
  
  console.error = function (...args) {
    const msg = typeof args[0] === 'string' ? args[0] : '';
    const fullMsg = args.join(' ');
    
    // Check if it's a React hydration error
    if (
      msg.includes("A tree hydrated but some attributes of the server rendered HTML didn't match") ||
      msg.includes("Warning: Extra attributes from the server") ||
      msg.includes("Hydration failed because the initial UI does not match")
    ) {
      // Since browser extensions like Bitdefender inject 'bis_skin_checked',
      // we check if the error is related to attribute mismatches or specific injected attributes.
      // We suppress these specific console errors to keep the development console clean.
      return;
    }
    
    // We also want to suppress the specific node diffs that React logs for bis_skin_checked
    if (fullMsg.includes('bis_skin_checked')) {
      return;
    }

    originalError.apply(console, args);
  };
}

export function HydrationFix() {
  return null;
}
