"use client";

interface ProductCardProps {
  product: {
    productId: string;
    name_bn: string;
    price: number;
    imageUrl?: string | null;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="border rounded-xl overflow-hidden bg-white shadow-sm text-left">
      {product.imageUrl && (
        <div className="w-full h-40 bg-gray-100 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.imageUrl}
            alt={product.name_bn}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-2">
        <div className="text-xs font-semibold mb-1">{product.name_bn}</div>
        <div className="text-xs text-blue-700 font-bold">
          {product.price} টাকা
        </div>
      </div>
    </div>
  );
}
