import React from 'react';
import { Toaster } from 'sonner';

export { Toaster };

export function ToastProvider({ children, position = 'top-right', richColors = true, ...props }) {
  return (
    <>
      {children}
      <Toaster position={position} richColors={richColors} {...props} />
    </>
  );
}

export default ToastProvider;
