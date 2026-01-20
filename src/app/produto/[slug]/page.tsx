"use client"
import { useEffect, useState, useRef, useMemo } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Heart, Share, Truck, Shield, Clock, Package, ArrowLeft, ArrowRight, MagnifyingGlass, MagnifyingGlassMinus, CheckCircle, Lock, CreditCard, Medal } from "phosphor-react";
import Link from "next/link";
import { useCart } from '@/contexts/CartContext'
import { useFavorites } from '@/contexts/FavoritesContext'
import { useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faShirt, faCheck, faMoneyBillWave } from '@fortawesome/free-solid-svg-icons';
import CustomVideoPlayer from '@/components/CustomVideoPlayer';
export default function ProdutoPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [cep, setCep] = useState("");
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<any | null>(null);
  const [isLoadingShipping, setIsLoadingShipping] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);
  const [zoomEnabled, setZoomEnabled] = useState(true);
  const [zoomPos, setZoomPos] = useState<{ x: number; y: number } | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const zoomRef = useRef<HTMLDivElement>(null);
  const zoomLensRef = useRef<HTMLDivElement>(null);
  const rafIdRef = useRef<number | null>(null);
  const rectCacheRef = useRef<DOMRect | null>(null);
  const mousePosRef = useRef<{ x: number; y: number } | null>(null);
  const isZoomActiveRef = useRef<boolean>(false);
  const [suggested, setSuggested] = useState<any[]>([]);
  const [similar, setSimilar] = useState<any[]>([]);
  const { addItem } = useCart();
  const { addFavorite, removeFavorite, isProductFavorite, getProductFavoriteId } = useFavorites();
  const [addedToCart, setAddedToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const preloadImages = useCallback((images: any[]) => {
    images.forEach((img) => {
      const imageElement = new window.Image();
      imageElement.src = img.url;
    });
  }, []);
  const handleImageChange = useCallback((index: number) => {
    setSelectedImage(index);
    setCurrentImageIndex(index);
  }, []);
  const images = useMemo(() => product?.images || [], [product?.images]);
  const videos = useMemo(() => product?.videos || [], [product?.videos]);
  const allMedia = useMemo(() => [
    ...images.map((img: any) => ({ ...img, type: 'image' })),
    ...videos.map((vid: any) => ({ ...vid, type: 'video', url: vid.url }))
  ].sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1;
    if (!a.isPrimary && b.isPrimary) return 1;
    return 0;
  }), [images, videos]);
  const handleAddToCart = useCallback(() => {
    if (!product) return;
    const image = product.primary_image || product.image || (allMedia && allMedia[0]?.url) || '/images/Logo.png';
    const colorName = selectedColor || undefined;
    addItem(product, quantity, selectedSize || undefined, colorName, image);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }, [addItem, product, selectedSize, selectedColor, quantity, allMedia]);
  const isCurrentMediaVideo = allMedia[selectedImage]?.type === 'video';
  const effectiveZoomEnabled = zoomEnabled && !isCurrentMediaVideo;

  const invalidateRectCache = useCallback(() => {
    rectCacheRef.current = null;
  }, []);

  const animationLoopRef = useRef<number | null>(null);

  const startAnimationLoop = useCallback(() => {
    if (animationLoopRef.current !== null) return;

    const loop = () => {
      if (!zoomRef.current || !zoomLensRef.current || !mousePosRef.current || !effectiveZoomEnabled) {
        animationLoopRef.current = null;
        return;
      }

      if (!rectCacheRef.current) {
        rectCacheRef.current = zoomRef.current.getBoundingClientRect();
      }

      const rect = rectCacheRef.current;
      const width = zoomRef.current.offsetWidth;
      const height = zoomRef.current.offsetHeight;
      const lens = zoomLensRef.current;
      const { x, y } = mousePosRef.current;

      const clampedX = Math.max(0, Math.min(x - rect.left, width));
      const clampedY = Math.max(0, Math.min(y - rect.top, height));

      const left = Math.max(0, Math.min(clampedX - 64, width - 128));
      const top = Math.max(0, Math.min(clampedY - 64, height - 128));

      const bgX = (clampedX / width) * 87.5;
      const bgY = (clampedY / height) * 87.5;

      lens.style.transform = `translate3d(${Math.round(left)}px, ${Math.round(top)}px, 0)`;
      lens.style.backgroundPosition = `${Math.round(bgX * 10) / 10}% ${Math.round(bgY * 10) / 10}%`;

      if (!isZoomActiveRef.current) {
        isZoomActiveRef.current = true;
        lens.style.opacity = '1';
        lens.style.display = 'block';
        setZoomPos({ x: clampedX, y: clampedY });
      }

      animationLoopRef.current = requestAnimationFrame(loop);
    };

    animationLoopRef.current = requestAnimationFrame(loop);
  }, [effectiveZoomEnabled]);

  const stopAnimationLoop = useCallback(() => {
    if (animationLoopRef.current !== null) {
      cancelAnimationFrame(animationLoopRef.current);
      animationLoopRef.current = null;
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!effectiveZoomEnabled || !zoomRef.current || !zoomLensRef.current) return;

    mousePosRef.current = { x: e.clientX, y: e.clientY };

    if (animationLoopRef.current === null) {
      startAnimationLoop();
    }
  }, [effectiveZoomEnabled, startAnimationLoop]);

  const handleMouseLeave = useCallback(() => {
    mousePosRef.current = null;
    stopAnimationLoop();

    if (zoomLensRef.current) {
      zoomLensRef.current.style.opacity = '0';
      zoomLensRef.current.style.display = 'none';
    }

    isZoomActiveRef.current = false;
    setZoomPos(null);
    invalidateRectCache();
  }, [invalidateRectCache, stopAnimationLoop]);

  useEffect(() => {
    return () => {
      stopAnimationLoop();
    };
  }, [stopAnimationLoop]);

  useEffect(() => {
    if (isCurrentMediaVideo) {
      handleMouseLeave();
    }
  }, [isCurrentMediaVideo, handleMouseLeave]);

  useEffect(() => {
    invalidateRectCache();
  }, [selectedImage, invalidateRectCache]);

  useEffect(() => {
    const handleResize = () => {
      invalidateRectCache();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [invalidateRectCache]);

  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);
  const toggleFavorite = useCallback(() => {
    if (!product) return;

    const favoriteId = getProductFavoriteId(product.id);
    const image = product.primary_image || product.image || (allMedia && allMedia[0]?.url) || '/images/Logo.png';

    if (favoriteId) {
      removeFavorite(favoriteId);
    } else {
      addFavorite(product, selectedSize || undefined, selectedColor || undefined, image);
    }
  }, [product, selectedSize, selectedColor, allMedia, addFavorite, removeFavorite, getProductFavoriteId]);

  const isFavorite = product ? isProductFavorite(product.id) : false;
  const nextImage = useCallback(() => {
    setCurrentImageIndex(prev => {
      if (!allMedia || allMedia.length === 0) return prev;
      const next = (prev + 1) % allMedia.length;
      setSelectedImage(next);
      return next;
    });
  }, [allMedia]);
  const prevImage = useCallback(() => {
    setCurrentImageIndex(prev => {
      if (!allMedia || allMedia.length === 0) return prev;
      const newPrev = prev === 0 ? allMedia.length - 1 : prev - 1;
      setSelectedImage(newPrev);
      return newPrev;
    });
  }, [allMedia]);
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [nextImage, prevImage]);
  const shareProduct = async () => {
    if (!product) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name || 'Produto',
          text: `Confira ${product?.name || 'este produto'} na Luxúria Modas!`,
          url: window.location.href,
        });
      } catch (error) {

      }
    } else {
      setShowShareModal(true);
    }
  };
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      const res = await fetch(`/api/products/${slug}`);
      const data = await res.json();

      if (data.colorVariations && data.colorVariations.length > 0) {

      }
      setProduct(data);
      if (data && data.images && data.images.length > 0) {
        preloadImages(data.images);
      }
      if (data && data.videos && data.videos.length > 0) {
        data.videos.forEach((video: any) => {
          const videoElement = document.createElement('video');
          videoElement.src = video.url;
          videoElement.preload = 'metadata';
        });
      }
      setLoading(false);
      if (data && data.id) {
        const sug = await fetch(`/api/products/by-model/${data.slug}`);
        const sugData = await sug.json();
        setSuggested((sugData.data || []).filter((p: any) => p.slug !== data.slug).slice(0, 8));
        const sim = await fetch(`/api/products/similar/${data.id}`);
        const simData = await sim.json();
        setSimilar((simData.data || []).slice(0, 8));
      }
    };
    if (slug) fetchProduct();
  }, [slug, preloadImages]);
  async function handleCalcularFrete() {
    if (!cep || cep.replace(/\D/g, '').length !== 8) {
      setShippingError("Digite um CEP válido com 8 dígitos.");
      setShippingOptions([]);
      return;
    }

    if (!product) {
      setShippingError("Produto não disponível.");
      return;
    }

    setIsLoadingShipping(true);
    setShippingError(null);
    setShippingOptions([]);
    setSelectedShipping(null);

    try {
      const cleanedCep = cep.replace(/\D/g, '');

      const products = [{
        id: product.id.toString(),
        weight: (product as any).weight || 0.3,
        length: (product as any).length || 20,
        width: (product as any).width || 15,
        height: (product as any).height || 5,
        price: parseFloat(product.price),
        quantity: quantity
      }];

      const response = await fetch('/api/shipping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          postalCode: cleanedCep,
          products
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erro ao calcular frete');
      }

      const options = data.data || [];

      if (options.length === 0) {
        setShippingError('Nenhuma opção de frete disponível para este CEP');
        setShippingOptions([]);
      } else {
        setShippingOptions(options);
        setSelectedShipping(options[0]);
        setShippingError(null);
      }
    } catch (error: any) {
      console.error('Erro ao calcular frete:', error);
      setShippingError(error.message || 'Erro ao calcular frete. Tente novamente.');
      setShippingOptions([]);
    } finally {
      setIsLoadingShipping(false);
    }
  }

  useEffect(() => {
    setShippingOptions([]);
    setSelectedShipping(null);
    setShippingError(null);
  }, [product?.id, quantity, selectedSize, selectedColor]);

  useEffect(() => {
    if (product) {



      if (product?.colorVariations && product.colorVariations.length > 0) {

      }
    }
  }, [product]);

  if (loading || !product) {
    return (
      <section className="min-h-screen bg-sand-100 pt-48 pb-16 px-4 md:px-0">
        <div className="max-w-6xl mx-auto px-0 md:px-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-6">
              <div className="bg-sage-50 rounded-3xl p-6">
                <div className="aspect-square bg-sand-100 rounded-2xl animate-pulse" />
                <div className="flex gap-3 mt-4">
                  {Array(6).fill(0).map((_, i) => (
                    <div key={i} className="w-16 h-16 bg-sand-100 rounded-lg animate-pulse" />
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-sage-50 rounded-3xl p-8">
                <div className="h-8 bg-sand-100 rounded mb-6 animate-pulse" />
                <div className="space-y-4">
                  <div className="h-6 bg-sand-100 rounded w-3/4 animate-pulse" />
                  <div className="h-6 bg-sand-100 rounded w-1/2 animate-pulse" />
                  <div className="h-6 bg-sand-100 rounded w-2/3 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
  const sizes = Array.from(new Set(product.sizes || [])) as string[];
  const colorVariations = product?.colorVariations || [];

  const hasSizes = sizes.length > 0;
  const hasColors = colorVariations.length > 0;
  const isFavoriteButtonDisabled = !isFavorite && (
    (hasSizes && !selectedSize) ||
    (hasColors && !selectedColor)
  );
  const care = product.care_instructions || `Evite lavar na máquina para preservar a estrutura.\nLimpe com pano úmido e sabão neutro.\nSeque à sombra para evitar desbotamento.\nGuarde em local arejado.`;
  const discount = product?.originalPrice && product?.price && product.originalPrice > product.price
    ? ((product.originalPrice - product.price) / product.originalPrice) * 100
    : 0;
  return (
    <section className="min-h-screen bg-dark-950 pt-48 pb-16 px-4 md:px-0">
      <div className="max-w-6xl mx-auto space-y-10">
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs sm:text-sm text-sage-800 flex items-center gap-1.5 sm:gap-2 px-1 overflow-x-auto scrollbar-hide"
        >
          <Link href="/" className="hover:text-primary-400 transition-colors flex items-center gap-1 flex-shrink-0">
            <FontAwesomeIcon icon={faHome} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Página inicial</span>
          </Link>
          <span className="text-sage-500 flex-shrink-0">/</span>
          <Link href="/produtos" className="hover:text-primary-400 transition-colors flex items-center gap-1 flex-shrink-0">
            <FontAwesomeIcon icon={faShirt} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Todos os produtos</span>
          </Link>
          <span className="text-sage-500 flex-shrink-0">/</span>
          <span className="text-sage-900 font-semibold truncate max-w-[200px] sm:max-w-xs">{product?.name || 'Produto'}</span>
        </motion.nav>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="rounded-3xl p-6 bg-sage-50 shadow-sm">
              <div className="relative group">
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 hover:bg-primary-500 rounded-full flex items-center justify-center text-sage-800 hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 backdrop-blur-sm shadow-lg"
                    >
                      <ArrowLeft size={20} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 hover:bg-primary-500 rounded-full flex items-center justify-center text-sage-800 hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 backdrop-blur-sm shadow-lg"
                    >
                      <ArrowRight size={20} />
                    </button>
                  </>
                )}
                <div
                  ref={zoomRef}
                  className={`relative w-full aspect-square rounded-2xl overflow-hidden bg-sand-100 shadow-lg transition-all duration-300 ${effectiveZoomEnabled
                    ? 'cursor-zoom-in border-primary-500 ring-2 ring-primary-500/30'
                    : 'cursor-pointer hover:border-primary-500/50'
                    }`}
                  onMouseMove={effectiveZoomEnabled ? handleMouseMove : undefined}
                  onMouseLeave={handleMouseLeave}
                  onMouseEnter={invalidateRectCache}
                >
                  {allMedia[selectedImage] && (
                    <>
                      {allMedia[selectedImage].type === 'video' ? (
                        <CustomVideoPlayer
                          src={allMedia[selectedImage].url}
                          alt={allMedia[selectedImage].alt || 'Vídeo do produto'}
                          className="w-full h-full"
                        />
                      ) : (
                        <Image
                          src={allMedia[selectedImage].url}
                          alt={`${product.name} - ${allMedia[selectedImage].alt || 'Imagem principal'}`}
                          fill
                          className="object-cover object-top transition-transform duration-300"
                          priority={selectedImage === 0}
                          sizes="(max-width: 1024px) 100vw, 50vw"
                        />
                      )}
                    </>
                  )}
                  {effectiveZoomEnabled && allMedia[selectedImage] && allMedia[selectedImage].type === 'image' && (
                    <div
                      ref={zoomLensRef}
                      className="absolute w-32 h-32 rounded-full border-2 border-primary-500 shadow-2xl shadow-primary-500/50 pointer-events-none z-20 overflow-hidden"
                      style={{
                        opacity: 0,
                        display: 'none',
                        backgroundImage: `url(${allMedia[selectedImage].url})`,
                        backgroundSize: '800% 800%',
                        backgroundRepeat: 'no-repeat',
                        willChange: 'transform, background-position',
                        transform: 'translate3d(0, 0, 0)',
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        perspective: 1000,
                        WebkitPerspective: 1000,
                      }}
                    />
                  )}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      onClick={() => setZoomEnabled(!zoomEnabled)}
                      disabled={isCurrentMediaVideo}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm ${isCurrentMediaVideo
                        ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                        : effectiveZoomEnabled
                          ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                          : 'bg-white/90 text-sage-800 hover:bg-primary-500 hover:text-white hover:shadow-lg hover:shadow-primary-500/30'
                        }`}
                      title={isCurrentMediaVideo ? 'Zoom não disponível para vídeos' : effectiveZoomEnabled ? 'Desativar zoom' : 'Ativar zoom'}
                    >
                      {isCurrentMediaVideo ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                      ) : effectiveZoomEnabled ? (
                        <MagnifyingGlassMinus size={20} />
                      ) : (
                        <MagnifyingGlass size={20} />
                      )}
                    </button>
                  </div>
                </div>
                <div className="text-center mt-4">
                  <span className="text-xs text-sage-800 flex items-center justify-center gap-2 bg-white/80 px-3 py-2 rounded-full">
                    {isCurrentMediaVideo ? (
                      <>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                        Zoom não disponível para vídeos
                      </>
                    ) : (
                      <>
                        <MagnifyingGlass size={14} />
                        {effectiveZoomEnabled ? 'Zoom ativo • Mova o mouse sobre a imagem' : 'Clique no ícone de lupa para ativar o zoom'}
                      </>
                    )}
                    {allMedia.length > 1 && ' • Use as setas para navegar'}
                  </span>
                </div>
              </div>
              {allMedia.length > 1 && (
                <div className="flex gap-3 mt-6 overflow-x-auto pb-2">
                  {allMedia.map((media: any, idx: number) => (
                    <motion.button
                      key={idx}
                      onClick={() => handleImageChange(idx)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border transition-all duration-300 ${selectedImage === idx
                        ? "border-primary-500 ring-2 ring-primary-500/30"
                        : "border-cloud-100 hover:border-primary-400"
                        }`}
                    >
                      {media.type === 'video' ? (
                        <div className="relative w-full h-full bg-sand-100 flex items-center justify-center">
                          <video
                            src={media.url}
                            className="w-full h-full object-cover"
                            muted
                            preload="metadata"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-6 h-6 bg-white/80 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-dark-900 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <Image
                          src={media.url}
                          alt={`${product.name} - Miniatura ${idx + 1}`}
                          width={80}
                          height={80}
                          className="object-cover w-full h-full"
                          loading="lazy"
                          sizes="80px"
                        />
                      )}
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
            <div className="hidden lg:block rounded-3xl overflow-hidden bg-sage-50 shadow-sm">
              <div className="flex border-b border-sage-200">
                {['description', 'care'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-300 ${activeTab === tab
                      ? 'text-primary-600 border-b-2 border-primary-500 bg-primary-50'
                      : 'text-sage-800 hover:text-primary-600 hover:bg-sage-100'
                      }`}
                  >
                    {tab === 'description' && 'Descrição'}
                    {tab === 'care' && 'Cuidados'}
                  </button>
                ))}
              </div>
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {activeTab === 'description' && (
                    <motion.div
                      key="description"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="text-sage-900 leading-relaxed"
                    >
                      {product?.description || 'Descrição não disponível.'}
                    </motion.div>
                  )}
                  {activeTab === 'care' && (
                    <motion.div
                      key="care"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-3"
                    >
                      {care.split('\n').map((line: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-3">
                          <span className="text-primary-600 mt-1">•</span>
                          <span className="text-sage-900">{line}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="rounded-3xl p-4 sm:p-6 lg:p-8 bg-sage-50 shadow-sm">
              <div className="flex gap-2 mb-4 lg:hidden justify-end">
                <button
                  onClick={toggleFavorite}
                  disabled={isFavoriteButtonDisabled}
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 ${isFavoriteButtonDisabled
                    ? 'bg-dark-800/50 text-gray-600 cursor-not-allowed opacity-50'
                    : isFavorite
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-primary-500 text-white hover:bg-primary-600'
                    }`}
                  title={
                    isFavoriteButtonDisabled
                      ? hasSizes && !selectedSize && hasColors && !selectedColor
                        ? 'Selecione um tamanho e uma cor para adicionar aos favoritos'
                        : hasSizes && !selectedSize
                          ? 'Selecione um tamanho para adicionar aos favoritos'
                          : hasColors && !selectedColor
                            ? 'Selecione uma cor para adicionar aos favoritos'
                            : 'Selecione as opções necessárias para adicionar aos favoritos'
                      : isFavorite
                        ? 'Remover dos favoritos'
                        : 'Adicionar aos favoritos'
                  }
                >
                  <Heart size={20} weight={isFavorite ? 'fill' : 'regular'} />
                </button>
                <button
                  onClick={shareProduct}
                  className="w-11 h-11 bg-primary-500 text-white hover:bg-primary-600 rounded-full flex items-center justify-center transition-all duration-300"
                  title="Compartilhar produto"
                >
                  <Share size={20} />
                </button>
              </div>
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4 sm:mb-6 gap-3 lg:gap-0">
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-sage-900 mb-2 sm:mb-0 leading-tight">
                    {product?.name || 'Carregando...'}
                  </h1>
                </div>
                <div className="hidden lg:flex gap-2 ml-4 flex-shrink-0">
                  <button
                    onClick={toggleFavorite}
                    disabled={isFavoriteButtonDisabled}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isFavoriteButtonDisabled
                      ? 'bg-dark-800/50 text-gray-600 cursor-not-allowed opacity-50'
                      : isFavorite
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-primary-500 text-white hover:bg-primary-600'
                      }`}
                    title={
                      isFavoriteButtonDisabled
                        ? hasSizes && !selectedSize && hasColors && !selectedColor
                          ? 'Selecione um tamanho e uma cor para adicionar aos favoritos'
                          : hasSizes && !selectedSize
                            ? 'Selecione um tamanho para adicionar aos favoritos'
                            : hasColors && !selectedColor
                              ? 'Selecione uma cor para adicionar aos favoritos'
                              : 'Selecione as opções necessárias para adicionar aos favoritos'
                        : isFavorite
                          ? 'Remover dos favoritos'
                          : 'Adicionar aos favoritos'
                    }
                  >
                    <Heart size={20} weight={isFavorite ? 'fill' : 'regular'} />
                  </button>
                  <button
                    onClick={shareProduct}
                    className="w-12 h-12 bg-primary-500 text-white hover:bg-primary-600 rounded-full flex items-center justify-center transition-all duration-300"
                    title="Compartilhar produto"
                  >
                    <Share size={20} />
                  </button>
                </div>
              </div>
              <div className="mb-8">
                <div className="flex items-baseline gap-3 mb-3">
                  <span className="text-4xl lg:text-5xl font-bold text-primary-600">
                    R$ {product?.price ? product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00'}
                  </span>
                  {product?.originalPrice && product?.price && product.originalPrice > product.price && (
                    <span className="text-xl text-sage-600 line-through">
                      R$ {product.originalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  )}
                </div>
                <div className="text-sage-900 mb-4">
                  <span className="text-lg font-medium">
                    ou em até <strong className="font-bold">12x de R$ {product?.price ? (product.price / 12).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00'}</strong>
                  </span>
                </div>
                {discount > 0 && (
                  <div className="inline-block bg-primary-500/20 border border-primary-300 text-primary-600 px-4 py-2 rounded-full text-sm font-bold">
                    <FontAwesomeIcon icon={faMoneyBillWave} className="mr-2" /> {Math.round(discount)}% de desconto
                  </div>
                )}
              </div>
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold text-sage-900">Tamanho</span>
                </div>
                {sizes.length > 0 ? (
                  <div className="grid grid-cols-4 gap-3">
                    {sizes.map((sizeData: any) => {
                      const size = typeof sizeData === 'string' ? sizeData : sizeData.size;
                      const stock = typeof sizeData === 'object' ? sizeData.stock : 0;
                      const available = typeof sizeData === 'object' ? sizeData.available : true;
                      const isSelected = selectedSize === size;
                      const isOutOfStock = !available || stock <= 0;
                      return (
                        <motion.button
                          key={size}
                          onClick={() => !isOutOfStock && setSelectedSize(size)}
                          whileHover={!isOutOfStock ? { scale: 1.05 } : {}}
                          whileTap={!isOutOfStock ? { scale: 0.95 } : {}}
                          disabled={isOutOfStock}
                          className={`py-3 px-2 rounded-xl border font-bold transition-all duration-300 relative ${isOutOfStock
                            ? 'cursor-not-allowed size-out-of-stock bg-cloud-100 border-cloud-200'
                            : isSelected
                              ? 'border-primary-500 bg-primary-500 text-white shadow-lg shadow-primary-500/25 size-available'
                              : 'border-cloud-100 bg-white text-sage-800 hover:border-primary-400 hover:bg-primary-50 size-available'
                            }`}
                        >
                          <span className="relative z-10">{size}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-sage-800">
                    <Package size={48} className="mx-auto mb-3 opacity-50" />
                    <p>Nenhum tamanho disponível no momento</p>
                  </div>
                )}
              </div>
              {colorVariations && Array.isArray(colorVariations) && colorVariations.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-semibold text-sage-900">Cor</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {colorVariations.map((color: any) => {
                      const stock = color.stock_quantity || 0;
                      const available = stock > 0 && (color.is_active !== false);
                      const isSelected = selectedColor === color.color_name;
                      const isOutOfStock = !available || stock <= 0;
                      return (
                        <motion.button
                          key={color.id || `color-${color.color_name}`}
                          onClick={() => !isOutOfStock && setSelectedColor(color.color_name)}
                          whileHover={!isOutOfStock ? { scale: 1.05 } : {}}
                          whileTap={!isOutOfStock ? { scale: 0.95 } : {}}
                          disabled={isOutOfStock}
                          className={`py-3 px-4 rounded-xl border font-bold transition-all duration-300 relative whitespace-nowrap ${isOutOfStock
                            ? 'cursor-not-allowed bg-cloud-100 border-cloud-200'
                            : isSelected
                              ? 'border-primary-500 bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                              : 'border-cloud-100 bg-white text-sage-800 hover:border-primary-400 hover:bg-primary-50'
                            }`}
                          title={color.color_name}
                        >
                          <span className="relative z-10 flex items-center justify-center gap-2">
                            {color.color_hex && (
                              <span
                                className="w-6 h-6 rounded-full border-2 border-white/30 flex-shrink-0"
                                style={{ backgroundColor: color.color_hex }}
                              />
                            )}
                            <span>{color.color_name}</span>
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}
              <div className="mb-8">
                <span className="block text-lg font-semibold text-sage-900 mb-3">Quantidade</span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-white border border-cloud-100 rounded-xl px-3 py-2">
                    <button
                      className="w-8 h-8 rounded-lg bg-cloud-200 hover:bg-primary-500 text-sage-800 hover:text-white transition-colors flex items-center justify-center"
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-bold text-sage-900">{quantity}</span>
                    <button
                      className="w-8 h-8 rounded-lg bg-cloud-200 hover:bg-primary-500 text-sage-800 hover:text-white transition-colors flex items-center justify-center"
                      onClick={() => setQuantity(q => q + 1)}
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm text-sage-900">
                    {quantity} {quantity === 1 ? 'unidade' : 'unidades'}
                  </span>
                </div>
              </div>
              <div className="mb-8 pt-6 border-t border-cloud-200">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <Truck size={18} className="sm:w-5 sm:h-5 text-primary-500" />
                  <h3 className="text-base sm:text-lg font-semibold text-sage-900">Calcular Frete</h3>
                </div>
                <div className="relative mb-3 flex">
                  <input
                    type="text"
                    placeholder="Digite seu CEP"
                    value={cep}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                      setCep(value);
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && cep.replace(/\D/g, '').length === 8) {
                        handleCalcularFrete();
                      }
                    }}
                    className="flex-1 bg-white border border-cloud-100 border-r-0 rounded-l-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sage-900 placeholder-sage-400 focus:border-primary-500 focus:outline-none focus:z-10 transition-colors text-sm"
                    maxLength={8}
                  />
                  <button
                    onClick={handleCalcularFrete}
                    disabled={isLoadingShipping}
                    className="bg-primary-500 hover:bg-primary-600 text-white px-3 sm:px-4 rounded-r-lg border border-primary-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0"
                    title="Calcular frete"
                  >
                    {isLoadingShipping ? (
                      <Clock size={18} className="sm:w-5 sm:h-5 animate-spin" />
                    ) : (
                      <MagnifyingGlass size={18} className="sm:w-5 sm:h-5" />
                    )}
                  </button>
                </div>
                {isLoadingShipping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-3 p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-xs text-center"
                  >
                    Calculando opções de frete...
                  </motion.div>
                )}
                {shippingError && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs"
                  >
                    {shippingError}
                  </motion.div>
                )}
                {shippingOptions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                  >
                    <label className="block text-sage-900 mb-2 font-medium text-xs">
                      Opções de Frete
                    </label>
                    {shippingOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setSelectedShipping(option)}
                        className={`w-full text-left p-2.5 sm:p-3 rounded-lg border transition-colors ${selectedShipping?.id === option.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-cloud-200 hover:border-primary-300'
                          }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sage-900 text-xs sm:text-sm truncate">{option.company || option.name}</div>
                            <div className="text-xs text-sage-600">
                              {option.estimatedDays} {option.estimatedDays === 1 ? 'dia útil' : 'dias úteis'}
                            </div>
                          </div>
                          <div className="font-bold text-primary-600 text-sm sm:text-base flex-shrink-0">
                            R$ {option.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold py-4 px-8 rounded-2xl text-lg shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${addedToCart ? 'ring-4 ring-green-500/50 bg-green-500' : ''
                  }`}
                disabled={
                  (sizes.length > 0 && !selectedSize) ||
                  (colorVariations.length > 0 && !selectedColor) ||
                  (product?.stockQuantity === 0)
                }
                title={
                  sizes.length > 0 && !selectedSize
                    ? 'Selecione um tamanho'
                    : colorVariations.length > 0 && !selectedColor
                      ? 'Selecione uma cor'
                      : product?.stockQuantity === 0
                        ? 'Produto fora de estoque'
                        : 'Adicionar ao carrinho'
                }
                onClick={handleAddToCart}
              >
                <AnimatePresence mode="wait">
                  {addedToCart ? (
                    <motion.span
                      key="added"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center justify-center gap-2"
                    >
                      <FontAwesomeIcon icon={faCheck} className="text-green-400" /> Adicionado ao carrinho!
                    </motion.span>
                  ) : (
                    <motion.span
                      key="add"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center justify-center gap-2"
                    >
                      Adicionar ao Carrinho
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-sm text-sage-800">
                  <Shield size={18} />
                  <span>Garantia de 30 dias</span>
                </div>
              </div>
            </div>
            <div className="lg:hidden rounded-3xl overflow-hidden mt-6 bg-sage-50 shadow-sm">
              <div className="flex border-b border-sage-200">
                {['description', 'care'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-300 ${activeTab === tab
                      ? 'text-primary-600 border-b-2 border-primary-500 bg-primary-50'
                      : 'text-sage-800 hover:text-primary-600 hover:bg-sage-100'
                      }`}
                  >
                    {tab === 'description' && 'Descrição'}
                    {tab === 'care' && 'Cuidados'}
                  </button>
                ))}
              </div>
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {activeTab === 'description' && (
                    <motion.div
                      key="description"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="text-sage-900 leading-relaxed"
                    >
                      {product?.description || 'Descrição não disponível.'}
                    </motion.div>
                  )}
                  {activeTab === 'care' && (
                    <motion.div
                      key="care"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-3"
                    >
                      {care.split('\n').map((line: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-3">
                          <span className="text-primary-600 mt-1">•</span>
                          <span className="text-sage-900">{line}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-24 mb-16"
        >
          <div className="bg-sage-50 rounded-3xl p-8 md:p-12 shadow-sm">
            <h3 className="text-2xl md:text-3xl font-bold text-sage-900 mb-8 text-center">
              Por que escolher a Luxúria Modas?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex flex-col items-center text-center group"
              >
                <div className="w-16 h-16 rounded-full bg-primary-500/20 border-2 border-primary-400 flex items-center justify-center mb-4 group-hover:bg-primary-500/30 group-hover:border-primary-400 transition-all duration-300">
                  <Truck size={28} className="text-primary-400" weight="fill" />
                </div>
                <h4 className="text-lg font-semibold text-sage-900 mb-2">Frete Grátis</h4>
                <p className="text-sage-900 text-sm leading-relaxed">Para todo o Brasil em compras acima de R$ 200</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="flex flex-col items-center text-center group"
              >
                <div className="w-16 h-16 rounded-full bg-primary-500/20 border-2 border-primary-400 flex items-center justify-center mb-4 group-hover:bg-primary-500/30 group-hover:border-primary-400 transition-all duration-300">
                  <Shield size={28} className="text-primary-400" weight="fill" />
                </div>
                <h4 className="text-lg font-semibold text-sage-900 mb-2">Garantia de 30 Dias</h4>
                <p className="text-sage-900 text-sm leading-relaxed">Troca ou devolução garantida se não ficar satisfeita</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="flex flex-col items-center text-center group"
              >
                <div className="w-16 h-16 rounded-full bg-primary-500/20 border-2 border-primary-400 flex items-center justify-center mb-4 group-hover:bg-primary-500/30 group-hover:border-primary-400 transition-all duration-300">
                  <Lock size={28} className="text-primary-400" weight="fill" />
                </div>
                <h4 className="text-lg font-semibold text-sage-900 mb-2">Compra Segura</h4>
                <p className="text-sage-900 text-sm leading-relaxed">Pagamento 100% seguro e dados protegidos</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="flex flex-col items-center text-center group"
              >
                <div className="w-16 h-16 rounded-full bg-primary-500/20 border-2 border-primary-400 flex items-center justify-center mb-4 group-hover:bg-primary-500/30 group-hover:border-primary-400 transition-all duration-300">
                  <Medal size={28} className="text-primary-400" weight="fill" />
                </div>
                <h4 className="text-lg font-semibold text-sage-900 mb-2">Qualidade Premium</h4>
                <p className="text-sage-900 text-sm leading-relaxed">Produtos selecionados com os melhores materiais</p>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {similar.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mb-12"
          >
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-cloud-100"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-sand-100 px-6 text-lg md:text-xl font-semibold text-sage-900">
                  Produtos Semelhantes
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {suggested.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-20"
          >
            <div className="container mx-auto">
              <h3 className="text-2xl font-bold text-sage-900 mb-8 text-center">
                Produtos Recomendados
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {suggested.map((prod, index) => (
                  <motion.div
                    key={prod.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="h-full"
                  >
                    <Link
                      href={`/produto/${prod.slug}`}
                      className="block bg-sage-50 rounded-2xl overflow-hidden hover:shadow-lg h-full flex flex-col shadow-sm transition-all duration-300"
                    >
                      <div className="relative aspect-square overflow-hidden bg-sand-100">
                        <Image
                          src={prod.primary_image || (prod.images && prod.images[0]?.url) || '/images/Logo.png'}
                          alt={prod.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <h4 className="font-semibold text-sage-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors flex-1">
                          {prod.name}
                        </h4>
                        <span className="text-primary-600 font-bold text-lg">
                          R$ {prod.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
        {similar.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="mb-8"
          >
            <div className="container mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {similar.slice(0, 5).map((prod, index) => (
                  <motion.div
                    key={prod.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="h-full"
                  >
                    <Link
                      href={`/produto/${prod.slug}`}
                      className="block bg-sage-50 rounded-2xl overflow-hidden hover:shadow-lg h-full flex flex-col shadow-sm transition-all duration-300"
                    >
                      <div className="relative aspect-square overflow-hidden bg-sand-100">
                        <Image
                          src={prod.primary_image || (prod.images && prod.images[0]?.url) || '/images/Logo.png'}
                          alt={prod.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 20vw"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <h4 className="font-semibold text-sage-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors flex-1">
                          {prod.name}
                        </h4>
                        <span className="text-primary-600 font-bold text-lg">
                          R$ {prod.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-dark-900 border border-dark-700 rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4">Compartilhar Produto</h3>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    setShowShareModal(false);
                  }}
                  className="w-full bg-primary-500 hover:bg-gradient-to-r hover:from-[var(--logo-gold,#D4A574)] hover:via-[var(--logo-gold-light,#E6B896)] hover:to-[var(--logo-gold,#D4A574)] text-white py-3 px-4 rounded-xl font-semibold transition-all"
                >
                  Copiar Link
                </button>
                <button
                  onClick={() => {
                    window.open(`https://wa.me/?text=Confira ${product?.name || 'este produto'} na Luxúria Modas! ${window.location.href}`, '_blank');
                    setShowShareModal(false);
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl font-semibold transition-colors"
                >
                  Compartilhar no WhatsApp
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}









