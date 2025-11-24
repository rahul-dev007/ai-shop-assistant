// components/ProductCard.tsx

import type { FC } from "react";

type UiProduct = {
  productId: string;
  name_bn: string;
  name_en?: string;
  category: string;
  price: number;
  tags?: string[];
  imageUrl?: string;
  description_bn?: string;
  colors?: string[];
  sizes?: string[];
  stock?: number;
};

interface ProductCardProps {
  product: UiProduct;
}

const ProductCard: FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="rounded-2xl bg-slate-950/95 border border-slate-800 overflow-hidden text-xs text-slate-100 shadow-sm">
      {/* image */}
      <div className="aspect-[4/3] bg-slate-900 relative">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name_bn}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">
            No image
          </div>
        )}
      </div>

      {/* content */}
      <div className="p-2 space-y-1">
        <div className="font-semibold text-slate-50 leading-snug line-clamp-2">
          {product.name_bn}
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="text-emerald-400 font-semibold">
            {product.price.toLocaleString("bn-BD")} টাকা
          </div>
          {typeof product.stock === "number" && (
            <div className="text-[10px] text-slate-400">
              স্টক: {product.stock > 0 ? product.stock : "আউট অফ স্টক"}
            </div>
          )}
        </div>

        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {product.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full bg-slate-900 text-[10px] text-slate-300 border border-slate-700"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
