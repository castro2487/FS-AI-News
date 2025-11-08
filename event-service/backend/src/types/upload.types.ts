export interface UploadedFile {
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  path: string;
  url: string;
}

export interface EventImageDTO {
  eventId: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
}

export interface EventImage {
  id: string;
  eventId: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  createdAt: string;
}