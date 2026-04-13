export interface Property {
  id: number;
  title: string;
  location: string;
  price: string;
  image: string;
  beds: number;
  baths: number;
  sqft: number;
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  rating: number;
  quote: string;
  image: string;
}

export interface USP {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  image: string;
  author: string;
  authorImage: string;
  date: string;
  content: string; // Added for full blog post content
}
