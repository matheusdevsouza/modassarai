"use client";
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SmoothScroll } from '@/components/SmoothScroll';
import { ScrollToTop } from '@/components/ScrollToTop';
import SidebarCart from '@/components/SidebarCart';
import SidebarFavorites from '@/components/SidebarFavorites';
export function LayoutShell({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const isAdmin = pathname?.startsWith('/admin');
	const [isCartOpen, setIsCartOpen] = useState(false)
	const [isFavoritesOpen, setIsFavoritesOpen] = useState(false)

	useEffect(() => {
		const openCart = () => setIsCartOpen(true)
		const openFavorites = () => setIsFavoritesOpen(true)

		document.addEventListener('openCart', openCart)
		document.addEventListener('openFavorites', openFavorites)

		return () => {
			document.removeEventListener('openCart', openCart)
			document.removeEventListener('openFavorites', openFavorites)
		}
	}, [])

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
			<SidebarCart open={isCartOpen} onClose={() => setIsCartOpen(false)} />
			<SidebarFavorites open={isFavoritesOpen} onClose={() => setIsFavoritesOpen(false)} />
			<main className="overflow-x-hidden">
				{children}
			</main>
			<Footer />
		</SmoothScroll>
	);
}
