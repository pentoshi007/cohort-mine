export interface User {
  _id: string;
  email: string;
}

export interface Tag {
  _id: string;
  title: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Content {
  _id: string;
  title: string;
  type: ContentType;
  link?: string;
  content?: string;
  tags: Tag[];
  userId: User | string;
  createdAt: string;
  updatedAt: string;
}

export type ContentType = "note" | "video" | "tweet" | "link";

export interface AuthResponse {
  token: string;
}

export interface MessageResponse {
  message: string;
}

export interface ContentResponse {
  content: Content[];
}

export interface TagsResponse {
  tags: Tag[];
}

export interface TagResponse {
  tag: Tag;
  message: string;
}

export interface ShareLinkResponse {
  hash: string;
  message: string;
}

export interface SharedBrainResponse {
  username: string;
  contents: Content[];
}

