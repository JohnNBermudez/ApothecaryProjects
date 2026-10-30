export {};

declare global {
  interface Window {
    apothecary: {
      selectFile: () => Promise<{
        canceled: boolean;
        filePath?: string;
        fileName?: string;
      }>;
      openFile: (filePath: string) => Promise<string>;
    };
  }
}
