import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Loader2, ShoppingCart, Zap, Shield, Truck } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";

export default function Home() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { data: products, isLoading } = trpc.products.list.useQuery();
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const { data: settings } = trpc.settings.getAll.useQuery();

  useEffect(() => {
    if (settings) {
      const accentColorSetting = settings.find((s: any) => s.key === "accentColor");
      if (accentColorSetting?.value) {
        const hex = accentColorSetting.value.replace("#", "");
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        document.documentElement.style.setProperty("--accent", `rgb(${r} ${g} ${b})`);
      }
    }
  }, [settings]);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Zap className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="text-xl font-bold font-serif">Nyxos</span>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            {isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => setLocation("/wallet")}
                >
                  {t("common.wallet")}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setLocation("/shop")}
                >
                  {t("common.shop")}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setLocation("/orders")}
                >
                  {t("common.orders")}
                </Button>
                {user?.role === "admin" && (
                  <Button
                    variant="ghost"
                    onClick={() => setLocation("/admin")}
                  >
                    {t("common.admin")}
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setLocation("/profile")}
                >
                  {user?.name || "Profile"}
                </Button>
              </>
            ) : (
              <Button asChild>
                <a href={getLoginUrl()}>{t("common.signIn")}</a>
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-5xl md:text-6xl font-serif font-bold text-foreground leading-tight">
                  {t("home.title")}
                </h1>
                <p className="text-lg text-muted-foreground">
                  {t("home.subtitle")}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={() => setLocation("/shop")}
                  className="bg-accent hover:bg-accent/90"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {t("home.shopNow")}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                >
                  {t("home.learnMore")}
                </Button>
              </div>
            </div>
            <div className="relative h-96 md:h-full rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-accent/5" />
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Zap className="w-24 h-24 mx-auto text-accent opacity-50" />
                  <p className="text-muted-foreground">{t("home.premiumLighting")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-card/50">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-center mb-12">
            {t("home.whyChooseNyxos")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                icon: Zap,
                title: t("home.premiumQuality"),
                description: t("home.premiumQualityDesc"),
              },
              {
                icon: Shield,
                title: t("home.securePayment"),
                description: t("home.securePaymentDesc"),
              },
              {
                icon: Truck,
                title: t("home.fastShipping"),
                description: t("home.fastShippingDesc"),
              },
              {
                icon: ShoppingCart,
                title: t("home.easyShopping"),
                description: t("home.easyShoppingDesc"),
              },
            ].map((feature, idx) => (
              <Card key={idx} className="border-border hover:shadow-lg transition-shadow">
                <CardHeader>
                  <feature.icon className="w-8 h-8 text-accent mb-2" />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold">
              {t("home.featuredProducts")}
            </h2>
            <Button
              variant="outline"
              onClick={() => setLocation("/shop")}
            >
              {t("home.viewAll")}
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.slice(0, 6).map((product) => (
                <Card
                  key={product.id}
                  className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => setSelectedProduct(product.id)}
                >
                  <div className="relative h-64 bg-gradient-to-br from-accent/20 to-accent/5 overflow-hidden">
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
                      <div className="absolute top-4 right-4 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-medium">
                        {t("shop.inStock")}
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                    <CardDescription className="line-clamp-2">{product.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        {product.discount > 0 ? (
                          <>
                            <span className="text-sm text-muted-foreground line-through">
                              ฿{parseFloat(product.price).toFixed(2)}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-bold text-accent">
                                ฿{(parseFloat(product.price) * (1 - product.discount / 100)).toFixed(2)}
                              </span>
                              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                                -{product.discount}%
                              </span>
                            </div>
                          </>
                        ) : (
                          <span className="text-2xl font-bold text-accent">
                            ฿{parseFloat(product.price).toFixed(2)}
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {product.stock} {t("home.available")}
                      </span>
                    </div>
                    <Button
                      className="w-full bg-accent hover:bg-accent/90"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isAuthenticated) {
                          setLocation(`/shop/${product.id}`);
                        } else {
                          window.location.href = getLoginUrl();
                        }
                      }}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      {t("shop.addToCart")}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t("shop.noProducts")}</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-accent/5 border-t border-border">
        <div className="container text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-serif font-bold">
            {t("home.readyToTransform")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("home.joinThousands")}
          </p>
          <Button
            size="lg"
            className="bg-accent hover:bg-accent/90"
            onClick={() => {
              if (isAuthenticated) {
                setLocation("/shop");
              } else {
                window.location.href = getLoginUrl();
              }
            }}
          >
            {t("home.startShopping")}
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2024 Nyxos. {t("home.allRightsReserved")}</p>
        </div>
      </footer>
    </div>
  );
}
