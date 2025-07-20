export interface Perfume {
  _id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  fragrance?: string;
  stock: number;
}

export interface PerfumeRequest {
  name: string;
  description?: string;
  price: number;
  image?: string;
  fragrance?: string;
  stock: number;
}
