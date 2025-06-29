import React from 'react';
import { X, Play } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-4xl mx-4">
        <div className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-700 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Play className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">NextMind AI Demo</h3>
                <p className="text-gray-400 text-sm">See our AI in action</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          
          {/* Video Container */}
          <div className="relative aspect-video bg-gray-800">
            <iframe
              src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0&modestbranding=1"
              title="NextMind AI Demo Video"
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
            
            {/* Fallback content if video doesn't load */}
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="w-10 h-10 text-white" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-2">Demo Video</h4>
                <p className="text-gray-400 mb-4">Watch how NextMind AI transforms content creation</p>
                <div className="space-y-2 text-left max-w-md">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-gray-300">Generate SEO-optimized blog posts in seconds</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span className="text-gray-300">Create compelling product descriptions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-gray-300">Design high-converting ad campaigns</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span className="text-gray-300">Craft engaging social media posts</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="p-6 bg-gray-800/50 border-t border-gray-700">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
              <div>
                <p className="text-gray-300 font-medium">Ready to get started?</p>
                <p className="text-gray-400 text-sm">Join thousands of businesses already using NextMind AI</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    onClose();
                    // Redirect to pricing after closing modal
                    window.location.href = '/pricing';
                  }}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all"
                >
                  Get Started
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