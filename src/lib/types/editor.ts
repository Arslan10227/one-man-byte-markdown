export interface OpenFile {
  id: string;
  path?: string;
  name: string;
  content: string;
  savedContent: string;
  isDirty: boolean;
  isNew?: boolean;
}

export interface FileNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileNode[];
  extension?: string;
}

export interface TocHeading {
  level: number;
  text: string;
  slug: string;
  line?: number;
}

export type ViewMode = 'split' | 'editor' | 'preview';
export type ThemeMode = 'dark' | 'light' | 'system';

export interface EditorSettings {
  theme: ThemeMode;
  editorFontSize: number;
  previewFontSize: number;
  fontFamily: string;
  previewFontFamily: string;
  tabSize: number;
  wordWrap: boolean;
  lineNumbers: boolean;
  syncScroll: boolean;
  autoSave: boolean;
  autoSaveDelay: number;
  highlightActiveLine: boolean;
}

export interface ToastMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  duration?: number;
}
