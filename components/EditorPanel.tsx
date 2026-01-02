
import React from 'react';

interface EditorPanelProps {
  title: string;
  value: string;
  onChange?: (val: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  onCopy?: () => void;
  onDownload?: () => void;
  showActions?: boolean;
}

const EditorPanel: React.FC<EditorPanelProps> = ({
  title,
  value,
  onChange,
  placeholder,
  readOnly,
  onCopy,
  onDownload,
  showActions
}) => {
  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          {readOnly ? <i className="fas fa-language text-blue-500"></i> : <i className="fas fa-file-alt text-blue-500"></i>}
          {title}
        </h3>
        {showActions && value && (
          <div className="flex gap-2">
            <button
              onClick={onCopy}
              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Copy to clipboard"
            >
              <i className="fas fa-copy"></i>
            </button>
            {onDownload && (
              <button
                onClick={onDownload}
                className="p-2 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Download .srt"
              >
                <i className="fas fa-download"></i>
              </button>
            )}
          </div>
        )}
      </div>
      <textarea
        className="flex-1 p-6 text-sm font-mono text-slate-600 focus:outline-none resize-none bg-transparent leading-relaxed"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
      />
    </div>
  );
};

export default EditorPanel;
