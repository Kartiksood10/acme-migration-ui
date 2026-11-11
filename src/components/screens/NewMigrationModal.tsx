import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // <-- 1. Import useNavigate
import { X, CloudUpload, Play } from 'lucide-react';
import { useStartMigration } from '../../hooks/useStartMigration';
import type { MigrationTriggerForm } from '../../types/migration';

interface NewMigrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// The NewMigrationModal component provides a user interface for initiating a new API contract migration. It allows users to input the consumer repository URL and select source and target contracts either via file upload or URL. The form validates inputs and triggers the migration process upon submission.
export default function NewMigrationModal({ isOpen, onClose }: NewMigrationModalProps) {

  // useStartMigration provides the 'mutate' function which executes the actual POST request via Axios/TanStack Query.
  const { mutate, isPending } = useStartMigration();
  const navigate = useNavigate(); // <-- 2. Initialize the navigate hook

  const [formData, setFormData] = useState<MigrationTriggerForm>({
    repositoryUrl: '',
    sourceType: 'FILE',
    targetType: 'FILE',
    sourceUrl: '',
    sourceFile: null,
    targetUrl: '',
    targetFile: null,
  });

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'sourceFile' | 'targetFile') => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, [field]: e.target.files![0] }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate(formData, {
      // 3. Strictly type the response to prevent "Unexpected any" ESLint errors.
      // Your Java MigrationTriggerResponse DTO returns 'jobId'.
      onSuccess: (response: { jobId?: string; job_id?: string } | undefined) => {
        onClose();
        setFormData({
          repositoryUrl: '', sourceType: 'FILE', targetType: 'FILE',
          sourceUrl: '', sourceFile: null, targetUrl: '', targetFile: null,
        });

        // 4. Safely extract the ID and trigger the redirect to the details page
        const newJobId = response?.jobId || response?.job_id;
        if (newJobId) {
          navigate(`/migrations/${newJobId}`);
        }
      }
    });
  };

  // --- UPDATED VALIDATION LOGIC WITH SAFE OPTIONAL CHAINING ---
  const isSourceValid = formData.sourceType === 'FILE' 
    ? formData.sourceFile !== null 
    : (formData.sourceUrl?.trim() ?? '') !== '';

  const isTargetValid = formData.targetType === 'FILE' 
    ? formData.targetFile !== null 
    : (formData.targetUrl?.trim() ?? '') !== '';

  // The form is only valid if repo URL is filled, and both source and target inputs have data.
  const isFormValid = formData.repositoryUrl.trim() !== '' && isSourceValid && isTargetValid;
  // -----------------------------------

  const renderContractInput = (
    label: string, 
    typeField: 'sourceType' | 'targetType',
    fileField: 'sourceFile' | 'targetFile',
    urlField: 'sourceUrl' | 'targetUrl'
  ) => {
    const isFile = formData[typeField] === 'FILE';
    const selectedFile = formData[fileField];

    return (
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-900 dark:text-slate-200 mb-2">
          {label} <span className="text-red-500">*</span>
        </label>
        
        <div className="flex bg-gray-100 dark:bg-slate-800/80 rounded-lg p-1 mb-3">
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, [typeField]: 'FILE' }))}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${isFile ? 'bg-blue-600 text-white shadow' : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'}`}
          >
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, [typeField]: 'URL' }))}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${!isFile ? 'bg-blue-600 text-white shadow' : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'}`}
          >
            Use URL
          </button>
        </div>

        {isFile ? (
          <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 dark:border-slate-700 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-slate-900/50 hover:bg-gray-100 dark:hover:bg-slate-800/80 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <CloudUpload className="w-6 h-6 text-gray-500 dark:text-slate-400 mb-2" />
              <p className="text-xs text-gray-500 dark:text-slate-400 text-center">
                {selectedFile ? (
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{selectedFile.name}</span>
                ) : (
                  <>Drag & drop a JSON or YAML file here, or click to browse<br/>(.json, .yaml, .yml)</>
                )}
              </p>
            </div>
            <input 
              type="file" 
              className="hidden" 
              accept=".json,.yaml,.yml" 
              onChange={(e) => handleFileChange(e, fileField)} 
            />
          </label>
        ) : (
          <input
            type="url"
            name={urlField}
            value={formData[urlField] as string}
            onChange={handleInputChange}
            placeholder={`Enter ${label} URL...`}
            className="w-full pl-3 pr-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
          />
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#0f172a] rounded-xl shadow-xl w-full max-w-lg overflow-hidden dark:border dark:border-slate-800">
        
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 p-1.5 rounded-md">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <span className="font-bold text-gray-900 dark:text-white tracking-tight">ACME</span>
            <span className="text-gray-300 dark:text-slate-600">|</span>
            <span className="text-sm text-gray-500 dark:text-slate-400 font-medium">API Contract Migration Engine</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 max-h-[80vh] overflow-y-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Start New Migration</h2>
          <p className="text-gray-500 dark:text-slate-400 text-sm mb-6">Configure the consumer repository and API contracts.</p>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 dark:text-slate-200 mb-2">
              Consumer Repository URL <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </div>
              <input
                type="url"
                name="repositoryUrl"
                value={formData.repositoryUrl}
                onChange={handleInputChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                placeholder="https://github.com/your-repo.git"
              />
            </div>
          </div>

          {renderContractInput('Source Contract', 'sourceType', 'sourceFile', 'sourceUrl')}
          {renderContractInput('Target Contract', 'targetType', 'targetFile', 'targetUrl')}

          <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-700 dark:text-slate-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              // The form is only valid if repo URL is filled, and both source and target inputs have data.
              disabled={isPending || !isFormValid}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Starting...' : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Migration
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
