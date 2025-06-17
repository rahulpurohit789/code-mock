import React, { useState } from 'react';
import { useTheme } from '../hooks/useTheme';

const AddTestCaseModal = ({ isOpen, onClose, onAdd, isDarkMode, onTestInput }) => {
  const { colors } = useTheme(isDarkMode);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    setIsLoading(true);
    try {
      const expectedOutput = await onTestInput(input);
      onAdd({ input, expectedOutput });
      setInput('');
      onClose();
    } catch (error) {
      console.error('Error adding test case:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div 
        className="relative rounded-lg shadow-xl max-w-md w-full mx-4"
        style={{ backgroundColor: colors.background.secondary }}
      >
        <div className="p-6">
          <h3 
            className="text-lg font-medium mb-4"
            style={{ color: colors.text.primary }}
          >
            Add Test Case
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label 
                  className="block text-sm font-medium mb-1"
                  style={{ color: colors.text.secondary }}
                >
                  Input
                </label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-md font-mono text-sm"
                  style={{
                    backgroundColor: colors.background.primary,
                    color: colors.text.primary,
                    border: `1px solid ${colors.border.secondary}`,
                  }}
                  rows={3}
                  placeholder="Enter input value(s) e.g. [2,7,11,15]"
                  required
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150"
                style={{
                  backgroundColor: colors.button.secondary.background,
                  color: colors.button.secondary.text,
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150"
                style={{
                  backgroundColor: colors.button.primary.background,
                  color: colors.button.primary.text,
                  opacity: !input.trim() || isLoading ? 0.7 : 1,
                }}
              >
                {isLoading ? 'Adding...' : 'Add Test Case'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddTestCaseModal; 