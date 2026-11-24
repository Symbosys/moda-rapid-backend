import { CategoryRepository } from './category.repository';

export interface CategoryModel {
  id: string;
  name: string;
  icon: string;
  imageUrl?: string;
  productCount?: number;
  subcategories: CategoryModel[];
}

export class CategoryService {
  constructor(private readonly categoryRepo: CategoryRepository = new CategoryRepository()) {}

  private fallbackCategories(): CategoryModel[] {
    return [
      {
        id: 'cat_men',
        name: 'Men',
        icon: '👔',
        imageUrl: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e',
        productCount: 420,
        subcategories: [
          { id: 'cat_men_shirts', name: 'Shirts', icon: '👔', subcategories: [] },
          { id: 'cat_men_tshirts', name: 'T-Shirts', icon: '👕', subcategories: [] },
          { id: 'cat_men_jeans', name: 'Jeans & Trousers', icon: '👖', subcategories: [] },
          { id: 'cat_men_jackets', name: 'Jackets & Hoodies', icon: '🧥', subcategories: [] },
        ],
      },
      {
        id: 'cat_women',
        name: 'Women',
        icon: '👗',
        imageUrl: 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3',
        productCount: 580,
        subcategories: [
          { id: 'cat_women_dresses', name: 'Dresses', icon: '👗', subcategories: [] },
          { id: 'cat_women_kurtas', name: 'Kurtis & Sarees', icon: '👘', subcategories: [] },
          { id: 'cat_women_tops', name: 'Tops & Tees', icon: '👚', subcategories: [] },
          { id: 'cat_women_bottoms', name: 'Pants & Skirts', icon: '👖', subcategories: [] },
        ],
      },
      {
        id: 'cat_kids',
        name: 'Kids',
        icon: '🧸',
        imageUrl: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4',
        productCount: 230,
        subcategories: [
          { id: 'cat_kids_boys', name: 'Boys Clothing', icon: '👕', subcategories: [] },
          { id: 'cat_kids_girls', name: 'Girls Clothing', icon: '👗', subcategories: [] },
        ],
      },
      {
        id: 'cat_footwear',
        name: 'Footwear',
        icon: '👟',
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
        productCount: 195,
        subcategories: [
          { id: 'cat_sneakers', name: 'Sneakers', icon: '👟', subcategories: [] },
          { id: 'cat_formal_shoes', name: 'Formal Shoes', icon: '👞', subcategories: [] },
        ],
      },
      {
        id: 'cat_accessories',
        name: 'Accessories',
        icon: '🕶️',
        imageUrl: 'https://images.unsplash.com/photo-1509695507497-903c140c43b0',
        productCount: 160,
        subcategories: [
          { id: 'cat_watches', name: 'Watches', icon: '⌚', subcategories: [] },
          { id: 'cat_belts', name: 'Belts & Wallets', icon: '👜', subcategories: [] },
        ],
      },
    ];
  }

  async getAllCategories(): Promise<CategoryModel[]> {
    try {
      const dbCategories = await this.categoryRepo.findAll();
      if (!dbCategories || dbCategories.length === 0) {
        return this.fallbackCategories();
      }

      return dbCategories.map((c) => ({
        id: c.id,
        name: c.name,
        icon: c.icon,
        imageUrl: c.imageUrl || undefined,
        subcategories: c.children.map((sub) => ({
          id: sub.id,
          name: sub.name,
          icon: sub.icon,
          imageUrl: sub.imageUrl || undefined,
          subcategories: [],
        })),
      }));
    } catch {
      return this.fallbackCategories();
    }
  }

  async getQuickCategories(): Promise<CategoryModel[]> {
    const all = await this.getAllCategories();
    return all.slice(0, 6);
  }
}
