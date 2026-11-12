export {};
/* eslint-disable 
   @typescript-eslint/no-unused-vars 
   These methods are responsible for opening and interacting with the file explorer, respectively. */
declare global {
  interface Window {
    apothecary: {
      selectFile: () => Promise<{
        canceled: boolean;
        filePath?: string;
        fileName?: string;
      }>;
      openFile: (filePath: string) => Promise<string>;
      copyFilePath: (filePath: string) => Promise<boolean>;
      getFileSize: (filePath: string) => Promise<number>;
    };
  }
}
