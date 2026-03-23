export interface Category {
  id: number;
  name: string;
  slug: string;
  color: string | null;
  icon: string | null;
  active: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  _count?: { products: number };
}

export interface Product {
  id: number;
  name: string;
  price: number;
  description: string | null;
  image: string | null;
  active: boolean;
  featured: boolean;
  order: number;
  categoryId: number;
  category?: Category;
  createdAt: string;
  updatedAt: string;
}

export interface Template {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  bgImage: string | null;
  bgColor: string;
  overlayColor: string;
  primaryColor: string;
  secondaryColor: string;
  priceColor: string;
  titleColor: string;
  fontStyle: string;
  titleSize: string;
  priceSize: string;
  layout: string;
  logoPosition: string;
  showBanner: boolean;
  bannerText: string | null;
  bannerBgColor: string;
  priceGlowIntensity: number;
  itemsPerPage: number;
  thumbnail: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Promotion {
  id: number;
  title: string;
  subtitle: string | null;
  image: string | null;
  type: string;
  active: boolean;
  priority: number;
  startDate: string | null;
  endDate: string | null;
  bgColor: string | null;
  textColor: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ScreenPromotion {
  id: number;
  screenId: number;
  promotionId: number;
  order: number;
  promotion: Promotion;
}

export interface Screen {
  id: number;
  name: string;
  slug: string;
  active: boolean;
  templateId: number | null;
  template: Template | null;
  displayMode: string;
  rotationInterval: number;
  showPrices: boolean;
  categories: string;
  createdAt: string;
  updatedAt: string;
  screenPromotions?: ScreenPromotion[];
}

export interface PromoSlide {
  id: number;
  screenId: number;
  title: string;
  price: number | null;
  priceUnit: string;
  productImage: string | null;
  bgImage: string | null;
  bgColor: string;
  titleColor: string;
  priceColor: string;
  accentColor: string;
  active: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface AppSetting {
  id: number;
  key: string;
  value: string;
}

export interface TVScreenData {
  screen: Screen;
  template: Template | null;
  products: Product[];
  categories: Category[];
  promotions: Promotion[];
  promoSlides: PromoSlide[];
  settings: Record<string, string>;
}
