export interface BimfaceProcessResult {
  metaInfo: string;
  processId: number;
  fileId: number;
  status: "success" | "failed" | "processing";
}
