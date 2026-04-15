import React from 'react';
import { Clock, Construction, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ComingSoon = ({ title = "Order Management" }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center transform transition-all hover:scale-[1.01]">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600 animate-pulse">
          <Clock size={40} />
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
        <div className="inline-block px-4 py-1.5 bg-blue-600 text-white text-xs font-bold tracking-widest uppercase rounded-full mb-6 shadow-sm">
          Coming Soon
        </div>
        
        <p className="text-gray-600 mb-2 leading-relaxed">
          We're currently refining this module to provide you with a superior manufacturing experience. Check back soon for advanced order tracking and streamlined processing.
        </p>
        
        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-2 text-gray-400 text-sm">
          <Construction size={16} />
          <span>System Maintenance v2.1</span>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
