"use client";
import { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
function ProdutosContent() {
  const searchParams = useSearchParams();
  const [produtos, setProdutos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [modelos, setModelos] = useState<any[]>([]);
  const [modeloSelecionado, setModeloSelecionado] = useState<string | null>(null);
  const [precoMin, setPrecoMin] = useState(0);
  const [precoMax, setPrecoMax] = useState(2000);
  const [filtros, setFiltros] = useState<{ preco: number[]; order: string }>({ preco: [0, 2000], order: '' });
  const [precoEmEdicao, setPrecoEmEdicao] = useState<number | null>(null);
  useEffect(() => {
    const search = searchParams.get('search');
    if (search) {
      setSearchQuery(search);
    }
  }, [searchParams]);
  useEffect(() => {
    async function fetchFiltros() {
      const resModelos = await fetch('/api/models');
      const dataModelos = await resModelos.json();
      setModelos(dataModelos.data || []);
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
      if (modeloSelecionado) {
        const res = await fetch(`/api/products/by-model/${modeloSelecionado}`);
        const data = await res.json();
        setProdutos(data.data || []);
        setLoading(false);
        return;
      }
      const params = new URLSearchParams();
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      if (filtros.preco) {
        params.append('min_price', String(filtros.preco[0]));
        params.append('max_price', String(filtros.preco[1]));
      }
      if (filtros.order) params.append('order', filtros.order);
      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      setProdutos(data.data || []);
      setLoading(false);
    }
    fetchProdutos();
  }, [filtros, modeloSelecionado, searchQuery]);
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
  function handleModeloClick(slug: string) {
    setModeloSelecionado(prev => prev === slug ? null : slug);
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
              {searchQuery ? `Resultados para "${searchQuery}"` : 'Todos os Produtos'}
            </h1>
            <p className="text-sage-800 text-lg mb-8 text-center">
              {searchQuery 
                ? `${produtos.length} produto(s) encontrado(s)` 
                : 'Encontre o modelo perfeito para você'
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
              <aside className="w-full bg-primary-50 border border-cloud-100 rounded-2xl p-6 mb-4 md:mb-0 shadow-sm md:sticky md:top-8 animate-pulse">
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
              <aside className="w-full bg-primary-50 border border-cloud-100 rounded-2xl p-6 mb-4 md:mb-0 shadow-sm md:sticky md:top-8">
                <h2 className="text-lg font-bold text-sage-900 mb-4">Filtrar</h2>
                <div className="mb-6">
                  <label className="block text-sage-900 font-semibold mb-2">Modelos</label>
                  <div className="flex flex-wrap gap-2">
                    {modelos.map((modelo: any) => (
                      <button
                        key={modelo.slug}
                        onClick={() => handleModeloClick(modelo.slug)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-sm
                          ${modeloSelecionado === modelo.slug 
                            ? 'bg-primary-500 text-white border-primary-600 shadow-sm' 
                            : 'bg-white border-cloud-200 text-sage-800 hover:bg-primary-50 hover:border-primary-300 hover:text-primary-600'
                          }`}
                      >
                        {modelo.image_url && (
                          <Image src={modelo.image_url} alt={modelo.name} width={24} height={24} className="rounded-full object-cover" />
                        )}
                        {modelo.name}
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
                              background: `linear-gradient(to right, #0F4024 0%, #0F4024 ${percentual}%, #D9D9D9 ${percentual}%, #D9D9D9 100%)`
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
                  <div key={i} className="group bg-sage-50 rounded-2xl overflow-hidden border border-cloud-100 flex flex-col items-center p-4 shadow-sm animate-pulse">
                    <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden mb-3 bg-cloud-100">
                      <div className="absolute inset-0 bg-cloud-200 animate-pulse" />
                    </div>
                    <div className="h-4 w-3/4 bg-cloud-100 rounded mb-2 animate-pulse" />
                    <div className="h-3 w-1/2 bg-cloud-100 rounded mb-1 animate-pulse" />
                    <div className="h-5 w-1/2 bg-cloud-100 rounded mb-2 animate-pulse" />
                    <div className="w-full h-8 bg-cloud-100 rounded-xl mt-auto animate-pulse" />
                  </div>
                ))}
              </div>
            ) : produtos.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-sage-800 text-lg">Nenhum produto encontrado.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {produtos.map((prod) => (
                  <Link
                    key={prod.id}
                    href={`/produto/${prod.slug}`}
                    className="group relative bg-white rounded-2xl overflow-hidden border border-cloud-200 hover:border-primary-300 transition-all duration-300 shadow-md hover:shadow-xl"
                  >
                    <div className="relative w-full aspect-[2/3] overflow-hidden bg-cloud-100">
                      <Image 
                        src={prod.primary_image || (prod.images && prod.images[0]?.url) || prod.image || '/images/logo.png'} 
                        alt={prod.name} 
                        fill 
                        className="object-cover group-hover:scale-110 transition-transform duration-700" 
                        sizes="(max-width: 768px) 100vw, 220px" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-sage-900/70 via-sage-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-5 z-10">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          whileHover={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className="opacity-0 group-hover:opacity-100"
                        >
                          <h3 className="text-white font-semibold text-base sm:text-lg mb-2 line-clamp-2 drop-shadow-lg">
                            {prod.name}
                          </h3>
                          <div className="flex items-center justify-between">
                            <span className="text-xl sm:text-2xl font-bold text-white drop-shadow-lg">
                              R$ {Number(prod.price).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="bg-primary-500 hover:bg-primary-600 text-white rounded-full p-2 shadow-lg"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </motion.div>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                    <div className="p-4 sm:p-5 bg-white">
                      <h3 className="text-base sm:text-lg font-semibold text-sage-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors duration-300">
                        {prod.name}
                      </h3>
                      <span className="text-xl sm:text-2xl font-bold text-primary-600">
                        R$ {Number(prod.price).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </Link>
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