'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useGetProductByIdQuery } from '../../../../../features/vendor/vendorApi';
import { baseURL } from '../../../../../utils/BaseURL';

// Types
interface Color {
  name: string;
  code: string;
}

interface Storage {
  size: string;
  unit: string;
}

interface VariantId {
  _id: string;
  color: Color;
  storage: Storage;
  ram: string;
  operating_system: string;
  images: string[];
}

interface ProductVariantDetail {
  variantId: VariantId;
  variantPrice: number;
  variantQuantity: number;
}

interface Category {
  _id: string;
  name: string;
}

interface Brand {
  _id: string;
  name: string;
}

interface Shop {
  _id: string;
  name: string;
}

interface Product {
  _id: string;
  name: string;
  basePrice: number;
  avg_rating: number;
  totalReviews: number;
  purchaseCount: number;
  viewCount: number;
  categoryId: Category;
  brandId?: Brand;
  shopId?: Shop;
  tags: string[];
  totalStock: number;
  images: string[];
  product_variant_Details: ProductVariantDetail[];
}


interface ZoomPosition {
  x: number;
  y: number;
}

export default function ProductDetailPage() {
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [selectedVariant, setSelectedVariant] = useState<number>(0);
  const [isZooming, setIsZooming] = useState<boolean>(false);
  const [zoomPosition, setZoomPosition] = useState<ZoomPosition>({ x: 0, y: 0 });

  const { productId } = useParams();
  const { data: productData, isLoading: productLoading } = useGetProductByIdQuery(productId as string);

  if (productLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!productData?.data) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-lg text-red-600">Product not found</div>
      </div>
    );
  }

  const product: Product = productData.data;
  const variants: ProductVariantDetail[] = product.product_variant_Details || [];
  const selectedVariantData: ProductVariantDetail | undefined = variants[selectedVariant];

  // Use product images if available, otherwise use variant images
  const productImages: string[] = product.images && product.images.length > 0
    ? product.images
    : (selectedVariantData?.variantId?.images || []);

  // Get unique colors from variants
  const uniqueColors: Color[] = variants.reduce((acc: Color[], variant: ProductVariantDetail) => {
    const color = variant.variantId.color;
    if (!acc.find(c => c.code === color.code)) {
      acc.push(color);
    }
    return acc;
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZooming) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setZoomPosition({ x, y });
  };

  const getImageUrl = (imagePath: string): string => {
    return imagePath.startsWith('http') ? imagePath : `${baseURL}${imagePath}`;
  };

  return (
    <div className=" bg-gray-50 p-8">
      <div className="">
        <button
          onClick={() => window.history.back()}
          className='border mb-3 px-5 py-1 rounded bg-red-100 cursor-pointer text-gray-500'
        >
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Images */}
          <div className="space-y-4">
            {/* Main Image with Zoom */}
            <Card className="overflow-hidden bg-gray-100 p-0">
              <CardContent className="p-0">
                <div
                  className="relative w-full aspect-square cursor-crosshair overflow-hidden"
                  onMouseEnter={() => setIsZooming(true)}
                  onMouseLeave={() => setIsZooming(false)}
                  onMouseMove={handleMouseMove}
                >
                  {productImages.length > 0 ? (
                    <Image
                      width={1000}
                      height={1000}
                      src={getImageUrl(productImages[selectedImage])}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-200"
                      style={{
                        transform: isZooming ? 'scale(2)' : 'scale(1)',
                        transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <span className="text-gray-500">No Image Available</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Thumbnail Images */}
            {productImages.length > 0 && (
              <div className="grid grid-cols-4 gap-4">
                {productImages.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${selectedImage === index
                      ? 'border-red-600 ring-2 ring-red-200'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <Image
                      width={200}
                      height={200}
                      src={getImageUrl(image)}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Side - Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                {product.name}
              </h1>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-red-600">
                    ${selectedVariantData?.variantPrice || product.basePrice}
                  </span>
                  {selectedVariantData?.variantPrice !== product.basePrice && (
                    <span className="text-xl text-gray-400 line-through">
                      ${product.basePrice}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-gray-900">
                    {product.avg_rating || 0}
                  </span>
                </div>
                <span className="text-gray-500">({product.totalReviews})</span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-500">{product.purchaseCount} sold</span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-500">{product.viewCount} views</span>
              </div>
            </div>

            {/* Variant Selection */}
            {variants.length > 0 && (
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-3">
                  Variants:
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {variants.map((variant: ProductVariantDetail, index: number) => (
                    <Button
                      key={variant.variantId._id}
                      variant={selectedVariant === index ? "default" : "outline"}
                      onClick={() => setSelectedVariant(index)}
                      className={`justify-start h-auto py-3 ${selectedVariant === index
                        ? 'bg-gray-900 hover:bg-gray-800 text-white'
                        : 'hover:border-gray-400'
                        }`}
                    >
                      <div className="text-left">
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className="w-4 h-4 rounded-full border border-gray-300"
                            style={{ backgroundColor: variant.variantId.color.code }}
                          />
                          <span>{variant.variantId.color.name}</span>
                        </div>
                        <div className="text-sm opacity-90">
                          {variant?.variantId?.storage?.size} {variant?.variantId?.storage?.unit} • {variant?.variantId?.ram} • {variant?.variantId?.operating_system}
                        </div>
                        <div className="text-sm font-semibold">
                          ${variant?.variantPrice} • {variant?.variantQuantity} in stock
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {uniqueColors.length > 0 && (
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-3">
                  Color:
                </label>
                <div className="flex gap-3">
                  {uniqueColors.map((color: Color) => (
                    <button
                      key={color.code}
                      onClick={() => {
                        // Find first variant with this color
                        const variantIndex = variants.findIndex(
                          (v: ProductVariantDetail) => v?.variantId?.color.code === color?.code
                        );
                        if (variantIndex !== -1) {
                          setSelectedVariant(variantIndex);
                        }
                      }}
                      className={`w-10 h-10 rounded-full border-2 border-gray-300 transition-all ${selectedVariantData?.variantId.color.code === color.code
                        ? 'ring-2 ring-offset-2 ring-gray-900 scale-110'
                        : 'hover:scale-105'
                        }`}
                      style={{ backgroundColor: color?.code }}
                      title={color?.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Category */}
            <div className="flex items-start gap-2">
              <span className="font-semibold text-gray-900">•</span>
              <div>
                <span className="font-semibold text-gray-900">Category: </span>
                <span className="text-gray-700">{product?.categoryId?.name}</span>
              </div>
            </div>

            {/* Brand */}
            {product.brandId && (
              <div className="flex items-start gap-2">
                <span className="font-semibold text-gray-900">•</span>
                <div>
                  <span className="font-semibold text-gray-900">Brand: </span>
                  <span className="text-gray-700">{product?.brandId.name}</span>
                </div>
              </div>
            )}

            {/* Shop */}
            {product.shopId && (
              <div className="flex items-start gap-2">
                <span className="font-semibold text-gray-900">•</span>
                <div>
                  <span className="font-semibold text-gray-900">Shop: </span>
                  <span className="text-gray-700">{product?.shopId.name}</span>
                </div>
              </div>
            )}

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex items-start gap-2">
                <span className="font-semibold text-gray-900">•</span>
                <div>
                  <span className="font-semibold text-gray-900">Tags: </span>
                  <span className="text-gray-700">{product?.tags.join(', ')}</span>
                </div>
              </div>
            )}

            {/* Stock Information */}
            <div className="flex items-start gap-2">
              <span className="font-semibold text-gray-900">•</span>
              <div>
                <span className="font-semibold text-gray-900">Stock: </span>
                <span className="text-gray-700">
                  {selectedVariantData?.variantQuantity || product?.totalStock} available
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}