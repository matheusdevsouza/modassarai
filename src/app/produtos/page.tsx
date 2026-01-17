"use client";
import { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
function ProdutosContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [produtos, setProdutos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categorias, setCategorias] = useState<any[]>([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string | null>(null);
  const [precoMin, setPrecoMin] = useState(0);
  const [precoMax, setPrecoMax] = useState(2000);
  const [filtros, setFiltros] = useState<{ preco: number[]; order: string }>({ preco: [0, 2000], order: '' });
  const [precoEmEdicao, setPrecoEmEdicao] = useState<number | null>(null);

  useEffect(() => {
    const search = searchParams.get('search');
    const categoria = searchParams.get('categoria');
    if (search) {
      setSearchQuery(search);
    }
    if (categoria) {
      setCategoriaSelecionada(categoria);
    }
  }, [searchParams]);

  useEffect(() => {
    async function fetchFiltros() {
      const resCategorias = await fetch('/api/categories');
      const dataCategorias = await resCategorias.json();
      setCategorias(dataCategorias.data || []);
      const resProdutos = await fetch('/api/products');
      const dataProdutos = await resProdutos.json();
      const precos = (dataProdutos.data || []).map((p: any) => p.price);
      if (precos.length) {
        const min = Math.min(...precos);
        const max = Math.max(...precos);
        setPrecoMin(0);
        setPrecoMax(max);
        setFiltros(f => ({ ...f, preco: [0, max] }));
      }
    }
    fetchFiltros();
  }, []);

  useEffect(() => {
    async function fetchProdutos() {
      setLoading(true);
      setProdutos([]);
      const params = new URLSearchParams();
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      if (categoriaSelecionada) {
        params.append('categoria', categoriaSelecionada);
      }
      if (filtros.preco) {
        params.append('min_price', String(filtros.preco[0]));
        params.append('max_price', String(filtros.preco[1]));
      }
      if (filtros.order) params.append('order', filtros.order);
      try {
        const res = await fetch(`/api/products?${params.toString()}`);
        const data = await res.json();
        const uniqueProducts = (data.data || []).reduce((acc: any[], product: any) => {
          if (!acc.find(p => p.id === product.id)) {
            acc.push(product);
          }
          return acc;
        }, []);
        setProdutos(uniqueProducts);
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        setProdutos([]);
      } finally {
        setLoading(false);
      }
    }
    fetchProdutos();
  }, [filtros, categoriaSelecionada, searchQuery]);
  function handlePrecoChange(e: any) {
    const value = Number(e.target.value);
    setPrecoEmEdicao(value);
  }

  function commitPrecoFiltro() {
    setFiltros(f => {
      const novoValor = precoEmEdicao ?? f.preco[1];
      return { ...f, preco: [precoMin, novoValor] };
    });
    setPrecoEmEdicao(null);
  }
  function handleOrderChange(e: any) {
    setFiltros(f => ({ ...f, order: e.target.value }));
  }
  function handleCategoriaClick(slug: string) {
    const newCategoria = categoriaSelecionada === slug ? null : slug;
    setCategoriaSelecionada(newCategoria);
    const newUrl = newCategoria
      ? `/produtos?categoria=${newCategoria}`
      : '/produtos';
    window.history.pushState({}, '', newUrl);
  }
  return (
    <section className="min-h-screen bg-sand-100 pt-48 pb-12">
      <div className="container mx-auto px-4">
        {loading ? (
          <div className="text-center mb-8">
            <div className="h-12 bg-cloud-100 rounded-lg mx-auto max-w-md mb-4"></div>
            <div className="h-6 bg-cloud-100 rounded-md mx-auto max-w-lg"></div>
          </div>
        ) : (
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl md:text-4xl font-extrabold text-sage-900 mb-2 text-center">
              {searchQuery
                ? `Resultados para "${searchQuery}"`
                : categoriaSelecionada
                  ? categorias.find(c => c.slug === categoriaSelecionada)?.name || 'Produtos'
                  : 'Todos os Produtos'
              }
            </h1>
            <p className="text-sage-800 text-lg mb-8 text-center">
              {searchQuery
                ? `${produtos.length} produto(s) encontrado(s)`
                : categoriaSelecionada
                  ? `${produtos.length} produto(s) nesta categoria`
                  : 'Encontre o produto perfeito para você'
              }
            </p>
            {searchQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => {
                  setSearchQuery('')
                  window.history.pushState({}, '', '/produtos')
                }}
                className="inline-flex items-center gap-2 bg-cloud-100 hover:bg-cloud-200 text-sage-700 hover:text-sage-900 px-4 py-2 rounded-lg transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Limpar busca
              </motion.button>
            )}
          </motion.div>
        )}
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-64 md:self-start">
            {loading ? (
              <aside className="w-full bg-white border border-cloud-200 rounded-2xl p-6 mb-4 md:mb-0 shadow-sm md:sticky md:top-8 animate-pulse">
                <h2 className="text-lg font-bold text-sage-900 mb-4">Filtrar</h2>
                <div className="mb-6">
                  <div className="h-4 w-20 bg-cloud-100 rounded mb-2" />
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-7 w-24 bg-cloud-100 rounded-lg" />
                    ))}
                  </div>
                </div>
                <div className="mb-6">
                  <div className="h-4 w-16 bg-cloud-100 rounded mb-2" />
                  <div className="h-5 w-full bg-cloud-100 rounded mb-2" />
                  <div className="h-3 w-20 bg-cloud-100 rounded" />
                </div>
                <div className="mb-2">
                  <div className="h-4 w-24 bg-cloud-100 rounded mb-2" />
                  <div className="h-8 w-full bg-cloud-100 rounded-lg" />
                </div>
              </aside>
            ) : (
              <aside className="w-full bg-white border border-cloud-200 rounded-2xl p-6 mb-4 md:mb-0 shadow-sm md:sticky md:top-8">
                <h2 className="text-lg font-bold text-sage-900 mb-4">Filtrar</h2>
                <div className="mb-6">
                  <label className="block text-sage-900 font-semibold mb-2">Categorias</label>
                  <div className="flex flex-wrap gap-2">
                    {categorias.map((categoria: any) => (
                      <button
                        key={categoria.slug}
                        onClick={() => handleCategoriaClick(categoria.slug)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-sm
                          ${categoriaSelecionada === categoria.slug
                            ? 'bg-primary-500 text-white border-primary-600 shadow-sm'
                            : 'bg-white border-cloud-200 text-sage-800 hover:bg-primary-50 hover:border-primary-300 hover:text-primary-600'
                          }`}
                      >
                        {categoria.image_url && (
                          <Image src={categoria.image_url} alt={categoria.name} width={24} height={24} className="rounded-full object-cover" />
                        )}
                        {categoria.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-sage-900 font-semibold mb-2">Preço (R$)</label>
                  {(() => {
                    const valorSlider = precoEmEdicao ?? filtros.preco[1];
                    const percentual = precoMax === precoMin ? 100 : ((valorSlider - precoMin) / (precoMax - precoMin)) * 100;
                    return (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="text-sage-700 text-sm">{precoMin.toFixed(1)}</span>
                          <input
                            type="range"
                            min={precoMin}
                            max={precoMax}
                            step={10}
                            value={valorSlider}
                            onChange={handlePrecoChange}
                            className="w-full h-2 bg-cloud-200 rounded-lg appearance-none cursor-pointer slider"
                            style={{
                              background: `linear-gradient(to right, #C49769 0%, #C49769 ${percentual}%, #D9D9D9 ${percentual}%, #D9D9D9 100%)`
                            }}
                            onMouseUp={commitPrecoFiltro}
                            onTouchEnd={commitPrecoFiltro}
                            onKeyUp={(e) => {
                              if (e.key === 'Tab' || e.key === 'Enter') commitPrecoFiltro();
                            }}
                          />
                          <span className="text-sage-700 text-sm">{precoMax.toFixed(1)}</span>
                        </div>
                        <div className="text-xs text-sage-700 mt-1">Até <b className="text-primary-600">{valorSlider.toFixed(1)}</b></div>
                      </>
                    );
                  })()}
                </div>
                <div className="mb-2">
                  <label className="block text-sage-900 font-semibold mb-2">Ordenar por</label>
                  <select className="w-full rounded-lg border border-cloud-200 bg-white text-sage-900 px-3 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all" value={filtros.order} onChange={handleOrderChange}>
                    <option value="">Mais vendidos</option>
                    <option value="price_asc">Menor preço</option>
                    <option value="price_desc">Maior preço</option>
                    <option value="newest">Novidades</option>
                  </select>
                </div>
              </aside>
            )}
          </div>
          <main className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {Array.from({ length: 10 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : produtos.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-sage-800 text-lg">Nenhum produto encontrado.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {produtos.map((prod, index) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    index={index}
                    priority={index < 5}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </section>
  );
}
export default function ProdutosPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-sand-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    }>
      <ProdutosContent />
    </Suspense>
  );
} 