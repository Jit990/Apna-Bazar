'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Category } from '@/types';
import { useState } from 'react';

const pastels = [
    '#E8F5EE', '#FFFDE7', '#FFF3E0', '#FCE4EC',
    '#E3F2FD', '#F3E5F5', '#E0F2F1', '#FFEBEE',
    '#F1F8E9', '#E8EAF6',
];

const categoryEmojis: Record<string, string> = {
    'fruits': '🍎',
    'vegetables': '🥬',
    'fruits & vegetables': '🥗',
    'dairy': '🥛',
    'dairy & eggs': '🥚',
    'atta': '🌾',
    'rice': '🍚',
    'atta, rice & dal': '🌾',
    'oil': '🫒',
    'oil & ghee': '🫒',
    'masala': '🌶️',
    'masala & spices': '🌶️',
    'spices': '🧂',
    'snacks': '🍿',
    'snacks & beverages': '🥤',
    'beverages': '☕',
    'personal care': '🧴',
    'home care': '🧹',
    'baby care': '👶',
    'pet care': '🐾',
    'bakery': '🍞',
    'frozen': '🧊',
    'chocolates': '🍫',
};

function getCategoryEmoji(name: string): string {
    const lower = name.toLowerCase();
    for (const [key, emoji] of Object.entries(categoryEmojis)) {
        if (lower.includes(key)) return emoji;
    }
    return '🛒';
}

interface CategoryCardProps {
    category: Category;
    size?: 'sm' | 'md' | 'lg';
}

export function CategoryCard({ category, size = 'md' }: CategoryCardProps) {
    const [imgError, setImgError] = useState(false);
    const bgColor = pastels[Math.abs(category.name.charCodeAt(0) + category.name.length) % pastels.length];
    const emoji = getCategoryEmoji(category.name);

    return (
        <Link
            href={`/categories/${category.slug}`}
            className="group flex flex-col items-center gap-2 text-center"
        >
            <div
                className="relative w-full aspect-square rounded-2xl flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:shadow-md group-hover:scale-[1.05] border border-white/60"
                style={{ background: bgColor }}
            >
                {category.image_url && !imgError ? (
                    <Image
                        src={category.image_url}
                        alt={category.name}
                        fill
                        sizes="(max-width: 640px) 33vw, 16vw"
                        className="object-contain p-3 transition-transform duration-300 group-hover:scale-110"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <span className="text-3xl md:text-4xl drop-shadow-sm">{emoji}</span>
                )}
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-gray-700 leading-tight line-clamp-2 group-hover:text-[var(--brand-primary)] transition-colors">
                {category.name}
            </span>
        </Link>
    );
}
