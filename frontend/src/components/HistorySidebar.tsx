import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock } from 'lucide-react';
import type { HistoryItem } from '../types';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
}

export default function HistorySidebar({ isOpen, onClose, history }: HistorySidebarProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-molten-surface border-l border-molten-border z-50 flex flex-col shadow-2xl"
          >
            <div className="p-6 border-b border-molten-border flex justify-between items-center">
              <h2 className="font-mono uppercase tracking-widest text-molten-textSecondary text-sm flex items-center gap-2">
                <Clock size={16} /> Recent Analyses
              </h2>
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="text-molten-textSecondary hover:text-white transition-colors"
              >
                <X size={20} />
              </motion.button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {history.length === 0 ? (
                <div className="text-center text-molten-textSecondary font-mono text-sm mt-10 opacity-50">
                  No previous analyses found.
                </div>
              ) : (
                history.map((item) => (
                  <motion.div 
                    key={item.id}
                    whileHover={{ y: -2, scale: 1.02 }}
                    className="premium-card p-4 hover:border-molten-border/80 transition-all group cursor-default"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="font-mono text-xs text-molten-textPrimary truncate max-w-[180px]" title={item.filename}>
                        {item.filename}
                      </div>
                      <div className="font-mono text-[10px] text-molten-textSecondary">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`px-2 py-1 rounded text-[10px] font-mono uppercase tracking-wider font-bold ${
                        item.verdict === 'human' 
                          ? 'bg-molten-human/10 text-molten-human border border-molten-human/20' 
                          : 'bg-molten-spoof/10 text-molten-spoof border border-molten-spoof/20'
                      }`}>
                        {item.verdict}
                      </div>
                      <div className="font-mono text-xs">
                        {item.confidence.toFixed(1)}% Conf
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
