import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Loader2, ShoppingCart, Zap, Search, ChevronLeft } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function Shop() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { data: products, isLoading } = trpc.products.list.useQuery();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const categories = useMemo(() => {
    if (!products) return [];
    const cats = new Set(products.map(p => p.category).filter(Boolean));
    return Array.from(cats);
  }, [products]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="absolute top-4 right-4">
          <LanguageSwitcher />
        </div>
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-serif font-bold">{t("common.signIn")}</h1>
          <p className="text-muted-foreground">{t("shop.noProducts")}</p>
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90">
            <a href={getLoginUrl()}>{t("common.signIn")}</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50">
        <div className="container py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation("/")}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-3xl font-serif font-bold">{t("shop.title")}</h1>
            </div>
            <LanguageSwitcher />
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder={t("shop.searchProducts")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                >
                  {t("shop.allProducts")}
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container py-12">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
              >
                <div
                  className="relative h-56 bg-gradient-to-br from-accent/20 to-accent/5 overflow-hidden cursor-pointer"
                  onClick={() => setLocation(`/shop/${product.id}`)}
                >
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Zap className="w-12 h-12 text-accent opacity-30" />
                    </div>
                  )}
                  {product.stock > 0 && (
                    <div className="absolute top-3 right-3 bg-accent text-accent-foreground px-2 py-1 rounded-full text-xs font-medium">
                      {t("shop.inStock")}
                    </div>
                  )}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-semibold">{t("shop.outOfStock")}</span>
                    </div>
                  )}
                </div>
                <CardHeader>
                  <CardTitle
                    className="text-lg line-clamp-2 cursor-pointer hover:text-accent transition"
                    onClick={() => setLocation(`/shop/${product.id}`)}
                  >
                    {product.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">{product.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      {product.discount && product.discount > 0 ? (
                        <>
                          <span className="text-sm text-muted-foreground line-through">
                            ฿{parseFloat(product.price).toFixed(2)}
                          </span>
                          <span className="text-2xl font-bold text-accent">
                            ฿{(parseFloat(product.price) * (1 - product.discount / 100)).toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <span className="text-2xl font-bold text-accent">
                          ฿{parseFloat(product.price).toFixed(2)}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {product.discount && product.discount > 0 && (
                        <span className="text-xs font-semibold text-white bg-red-500 px-2 py-0.5 rounded">
                          -{product.discount}%
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        {product.stock} {t("shop.left")}
                      </span>
                    </div>
                  </div>
                  <Button
                    className="w-full bg-accent hover:bg-accent/90"
                    disabled={product.stock === 0}
                    onClick={() => setLocation(`/shop/${product.id}`)}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {t("shop.viewDetails")}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Zap className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">{t("shop.noProducts")}</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? t("shop.noProducts") : t("shop.noProducts")}
            </p>
            {searchQuery && (
              <Button
                variant="outline"
                onClick={() => setSearchQuery("")}
              >
                {t("common.cancel")}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
