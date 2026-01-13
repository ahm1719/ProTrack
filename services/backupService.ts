import { AppConfig, DailyLog, Observation, Task } from "../types";

// Type definitions for File System Access API (often not included in standard TS lib yet)
interface FileSystemHandle {
  kind: 'file' | 'directory';
  name: string;
}

interface FileSystemDirectoryHandle extends FileSystemHandle {
  getFileHandle(name: string, options?: { create?: boolean }): Promise<FileSystemFileHandle>;
}

interface FileSystemFileHandle extends FileSystemHandle {
  createWritable(): Promise<FileSystemWritableFileStream>;
}

interface FileSystemWritableFileStream extends WritableStream {
  write(data: any): Promise<void>;
  close(): Promise<void>;
}

declare global {
  interface Window {
    showDirectoryPicker(): Promise<FileSystemDirectoryHandle>;
  }
}

export const selectBackupFolder = async (): Promise<FileSystemDirectoryHandle | null> => {
  if (!('showDirectoryPicker' in window)) {
    alert("Your browser does not support the File System Access API (Chrome, Edge, or Opera required).");
    return null;
  }

  try {
    const handle = await window.showDirectoryPicker();
    return handle;
  } catch (error: any) {
    if (error.name !== 'AbortError') {
      console.error("Error selecting folder:", error);
      alert("Could not access folder. " + error.message);
    }
    return null;
  }
};

export const performBackup = async (
  dirHandle: FileSystemDirectoryHandle, 
  data: { tasks: Task[], logs: DailyLog[], observations: Observation[], offDays: string[], appConfig: AppConfig }
): Promise<boolean> => {
  try {
    // Generate filename with timestamp: ProTrack_Backup_2023-10-27_14-30.json
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = `${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}`;
    const filename = `ProTrack_Backup_${dateStr}_${timeStr}.json`;

    // 1. Get file handle (create if doesn't exist)
    const fileHandle = await dirHandle.getFileHandle(filename, { create: true });

    // 2. Create writable stream
    const writable = await fileHandle.createWritable();

    // 3. Write data
    const jsonContent = JSON.stringify(data, null, 2);
    await writable.write(jsonContent);

    // 4. Close file
    await writable.close();

    return true;
  } catch (error) {
    console.error("Backup failed:", error);
    return false;
  }
};