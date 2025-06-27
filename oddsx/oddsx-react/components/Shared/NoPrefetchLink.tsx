'use client';

import { useRouter } from 'next/navigation';
import { ComponentProps, ReactNode, MouseEvent } from 'react';

interface NoPrefetchLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  [key: string]: any;
}

/**
 * 🚨 CRITICAL FIX: No-Prefetch Link Component
 * 
 * This component bypasses Next.js Link prefetching completely
 * to prevent the 200+ HTTP requests per page load issue.
 * 
 * Uses native <a> tag with manual router navigation to avoid
 * the App Router route group prefetching bug.
 */
export default function NoPrefetchLink({ 
  href, 
  children, 
  className = '', 
  onClick,
  ...rest 
}: NoPrefetchLinkProps) {
  const router = useRouter();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    // Prevent default navigation
    event.preventDefault();
    
    // Call custom onClick if provided
    if (onClick) {
      onClick(event);
    }
    
    // Manual navigation without prefetch
    router.push(href);
  };

  return (
    <a
      href={href}
      className={className}
      onClick={handleClick}
      {...rest}
    >
      {children}
    </a>
  );
} 