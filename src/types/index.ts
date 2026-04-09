export interface UploadFileResult {
  url: string;
  name: string;
}

export type UploadFile = (file: File) => Promise<UploadFileResult>;
