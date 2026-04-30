'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Crown, CheckCircle2 } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export interface ProductCardProps {
  productName: string;
  productImageId: string;
  title: string;
  description: string;
  originalPrice: string;
  currentPrice: string;
  currentPriceCents: string;
  features: string[];
  isBestSeller?: boolean;
  purchaseUrl?: string;
}


export default function ProductCard({
  productName,
  productImageId,
  title,
  description,
  originalPrice,
  currentPrice,
  currentPriceCents,
  features,
  isBestSeller,
  purchaseUrl = '#',
}: ProductCardProps) {
  const productImage = PlaceHolderImages.find((img) => img.id === productImageId);

  return (
    <div className="product-card-wrapper">
      <div className="product-card">
        {isBestSeller && (
          <div className="best-seller-badge">
            <Crown className="w-4 h-4" />
            MAIS VENDIDO
          </div>
        )}
        <p className="product-name">{productName}</p>
        <div className="product-image-container">
          {productImage && (
            <Image
              src={productImage.imageUrl}
              alt={productImage.description}
              width={200}
              height={200}
              className="mx-auto"
              data-ai-hint={productImage.imageHint}
            />
          )}
        </div>
        <h3 className="product-title">{title}</h3>
        <p className="product-description">
          {description}
        </p>
        <div className="price-container">
          <p className="price-original">R$ {originalPrice}</p>
          <p className="price-current">
            <span className="currency">R$</span>{currentPrice}<span className="text-2xl align-super">,{currentPriceCents}</span>
          </p>
        </div>
        <ul className="feature-list">
          {features.map((feature, index) => (
            <li key={index} className="feature-item">
              <CheckCircle2 />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <Link href={purchaseUrl} className="btn buy-button">
          COMPRAR AGORA
        </Link>
      </div>
    </div>
  );
}
