
import { SrtBlock } from '../types';

export const parseSrt = (text: string): SrtBlock[] => {
  // Normalize line endings and split by empty lines (usually \n\n or \r\n\r\n)
  const blocks = text.trim().split(/\n\s*\n/);
  
  return blocks.map(block => {
    const lines = block.split(/\r?\n/);
    if (lines.length < 3) return null;

    const id = lines[0].trim();
    const timestamp = lines[1].trim();
    const content = lines.slice(2).join('\n').trim();

    return { id, timestamp, content };
  }).filter((block): block is SrtBlock => block !== null);
};

export const stringifySrt = (blocks: SrtBlock[]): string => {
  return blocks.map(block => {
    return `${block.id}\n${block.timestamp}\n${block.content}\n`;
  }).join('\n');
};

export const downloadSrt = (text: string, filename: string) => {
  const blob = new Blob([text], { type: 'text/srt' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
