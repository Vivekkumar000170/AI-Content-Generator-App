import React, { useEffect } from 'react';
import { X, Play } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose }) => {
  // Handle escape key press
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      ></div>
      
      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-xs sm:max-w-2xl lg:max-w-4xl xl:max-w-5xl animate-in zoom-in-95 duration-200">
        <div className="bg-gray-900 rounded-lg sm:rounded-2xl overflow-hidden border border-gray-700 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-3 sm:p-6 border-b border-gray-700 bg-gray-800/50">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Play className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm sm:text-xl font-semibold text-white">NextMind AI Demo</h3>
                <p className="text-gray-400 text-xs sm:text-sm hidden sm:block">See our AI content generation in action</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
              aria-label="Close video modal"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300 hover:text-white" />
            </button>
          </div>
          
          {/* Video Container */}
          <div className="relative aspect-video bg-black">
            <iframe
              src="https://www.youtube.com/embed/aircAruvnKk?autoplay=1&rel=0&modestbranding=1&showinfo=0&controls=1&start=0"
              title="AI Content Generation Demo - How Neural Networks Work"
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>
          
          {/* Footer */}
          <div className="p-3 sm:p-6 bg-gray-800/50 border-t border-gray-700">
            <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-center sm:text-left">
                <p className="text-gray-300 font-medium text-sm sm:text-base">Ready to transform your content creation?</p>
                <p className="text-gray-400 text-xs sm:text-sm">Start your free trial today - no credit card required</p>
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 sm:px-6 sm:py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-200 font-medium text-sm sm:text-base"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    onClose();
                    // Use React Router navigation instead of window.location
                    setTimeout(() => {
                      window.location.href = '/pricing';
                    }, 100);
                  }}
                  className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 font-medium text-sm sm:text-base"
                >
                  Start Free Trial
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;