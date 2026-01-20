"use client";
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SmoothScroll } from '@/components/SmoothScroll';
import { ScrollToTop } from '@/components/ScrollToTop';
import SidebarCart from '@/components/SidebarCart';
import SidebarFavorites from '@/components/SidebarFavorites';
export function LayoutShell({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const isAdmin = pathname?.startsWith('/admin');

	// Use Context for Sidebar State
	const { isCartSidebarOpen, setIsCartSidebarOpen } = useCart()
	const { isFavoritesSidebarOpen, setIsFavoritesSidebarOpen } = useFavorites()

	// Legacy event listeners removed in favor of Context API
	// If other components still emit 'openCart', we can keep a listener that bridges to context if strictly necessary, 
	// but looking at the codebase, we should rely on Context.

	// However, to ensure backward compatibility if any legacy code triggers events:
	useEffect(() => {
		const openCart = () => setIsCartSidebarOpen(true)
		const openFavorites = () => setIsFavoritesSidebarOpen(true)

		document.addEventListener('openCart', openCart)
		document.addEventListener('openFavorites', openFavorites)

		return () => {
			document.removeEventListener('openCart', openCart)
			document.removeEventListener('openFavorites', openFavorites)
		}
	}, [setIsCartSidebarOpen, setIsFavoritesSidebarOpen])

	if (isAdmin) {
		return (
			<>
				<ScrollToTop />
				{children}
			</>
		);
	}
	return (
		<SmoothScroll
			options={{
				duration: 1.2,
				easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
				smoothWheel: true,
				wheelMultiplier: 1,
				touchMultiplier: 2,
				lerp: 0.1,
			}}
		>
			<ScrollToTop />
			<Header />
			<SidebarCart open={isCartSidebarOpen} onClose={() => setIsCartSidebarOpen(false)} />
			<SidebarFavorites open={isFavoritesSidebarOpen} onClose={() => setIsFavoritesSidebarOpen(false)} />
			<main className="overflow-x-hidden">
				{children}
			</main>
			<Footer />
		</SmoothScroll>
	);
}
