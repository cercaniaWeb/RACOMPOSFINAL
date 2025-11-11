import React from 'react';
import { useZxing } from 'react-zxing';
import { X } from 'lucide-react';

const ScannerComponent = ({ onScan, onClose }) => {
  const { ref } = useZxing({
    onResult(result) {
      onScan(result.getText());
    },
    onError(error) {
      console.error(error);
    },
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center z-50">
      <div className="relative w-full max-w-md p-4">
        <video ref={ref} className="w-full rounded-lg" />
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-white bg-black bg-opacity-50 rounded-full p-2"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      <p className="text-white mt-4">Apunte la cámara al código de barras</p>
    </div>
  );
};

export default ScannerComponent;
