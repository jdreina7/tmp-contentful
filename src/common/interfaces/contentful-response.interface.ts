export interface ContentfulSys {
  type: string;
  id?: string;
  space?: ContentfulLink;
  createdAt?: string;
  updatedAt?: string;
  environment?: ContentfulLink;
  publishedVersion?: number;
  revision?: number;
  contentType?: ContentfulLink;
  locale?: string;
}

export interface ContentfulLink {
  sys: {
    type: string;
    linkType: string;
    id: string;
  };
}

export interface ContentfulMetadata {
  tags: string[];
  concepts: string[];
}

export interface ProductFields {
  sku: number;
  name: string;
  brand: string;
  model: string;
  category: string;
  color: string;
  price: number;
  currency: string;
  stock: number;
}

export interface ContentfulProductEntry {
  metadata: ContentfulMetadata;
  sys: ContentfulSys;
  fields: ProductFields;
}

export interface ContentfulResponse<T = ContentfulProductEntry> {
  sys: ContentfulSys;
  total: number;
  skip: number;
  limit: number;
  items: T[];
}
