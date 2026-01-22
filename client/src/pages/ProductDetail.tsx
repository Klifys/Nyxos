import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Loader2, ChevronLeft, ShoppingCart, Zap, Minus, Plus } from "lucide-react";
import { useLocation, useParams } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

export default function ProductDetail() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { id } = useParams<{ id: string }>();
  const productId = parseInt(id || "0");
  
  const { data: product, isLoading } = trpc.products.getById.useQuery({ id: productId });
  const createOrderMutation = trpc.orders.create.useMutation();
  
  const [quantity, setQuantity] = useState(1);
  const [checkoutMode, setCheckoutMode] = useState<"standard" | "custom_address">("standard");
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-serif font-bold">Please Sign In</h1>
          <p className="text-muted-foreground">You need to sign in to purchase products</p>
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90">
            <a href={getLoginUrl()}>Sign In</a>
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-serif font-bold">Product Not Found</h1>
          <p className="text-muted-foreground">The product you're looking for doesn't exist</p>
          <Button
            onClick={() => setLocation("/shop")}
            className="bg-accent hover:bg-accent/90"
          >
            Back to Shop
          </Button>
        </div>
      </div>
    );
  }

  const handleCheckout = async () => {
    if (checkoutMode === "custom_address" && (!shippingAddress || !shippingPhone)) {
      toast.error("Please fill in shipping address and phone number");
      return;
    }

    setIsCheckingOut(true);
    try {
      const result = await createOrderMutation.mutateAsync({
        items: [
          {
            productId: product.id,
            quantity,
            price: discountedPrice.toString(),
          },
        ],
        checkoutMode,
        shippingAddress: checkoutMode === "custom_address" ? shippingAddress : undefined,
        shippingPhone: checkoutMode === "custom_address" ? shippingPhone : undefined,
        notes: notes || undefined,
      });

      toast.success("Order created successfully!");
      setLocation(`/orders/${result.orderId}`);
    } catch (error: any) {
      console.error("Order creation error:", error);
      const message = error?.message || "Failed to create order";
      toast.error(message);
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Calculate discounted price
  const originalPrice = parseFloat(product.price);
  const discountedPrice = product.discount && product.discount > 0 
    ? originalPrice * (1 - product.discount / 100) 
    : originalPrice;
  const totalPrice = discountedPrice * quantity;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50">
        <div className="container py-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/shop")}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Product Image */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 rounded-lg bg-gradient-to-br from-accent/20 to-accent/5 h-96 flex items-center justify-center overflow-hidden">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Zap className="w-24 h-24 text-accent opacity-30" />
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <h1 className="text-4xl font-serif font-bold">{product.name}</h1>
                <p className="text-lg text-muted-foreground">{product.description}</p>
              </div>

              <div className="flex items-baseline gap-4">
                {product.discount && product.discount > 0 ? (
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl text-muted-foreground line-through">
                      ฿{originalPrice.toFixed(2)}
                    </span>
                    <span className="text-4xl font-bold text-accent">
                      ฿{discountedPrice.toFixed(2)}
                    </span>
                    <span className="px-2 py-1 bg-red-500 text-white text-sm font-bold rounded">
                      -{product.discount}%
                    </span>
                  </div>
                ) : (
                  <span className="text-4xl font-bold text-accent">
                    ฿{originalPrice.toFixed(2)}
                  </span>
                )}
                {product.stock > 0 ? (
                  <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 text-sm font-medium">
                    {product.stock} in stock
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 text-sm font-medium">
                    Out of stock
                  </span>
                )}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Quantity</Label>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-2xl font-bold w-12 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Checkout Mode Selection */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Checkout Mode</Label>
              <div className="space-y-3">
                <div
                  className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                    checkoutMode === "standard"
                      ? "border-accent bg-accent/5"
                      : "border-border hover:border-accent/50"
                  }`}
                  onClick={() => setCheckoutMode("standard")}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        checkoutMode === "standard"
                          ? "border-accent bg-accent"
                          : "border-border"
                      }`}
                    >
                      {checkoutMode === "standard" && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">Standard Checkout</p>
                      <p className="text-sm text-muted-foreground">
                        Ship to your registered address
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                    checkoutMode === "custom_address"
                      ? "border-accent bg-accent/5"
                      : "border-border hover:border-accent/50"
                  }`}
                  onClick={() => setCheckoutMode("custom_address")}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        checkoutMode === "custom_address"
                          ? "border-accent bg-accent"
                          : "border-border"
                      }`}
                    >
                      {checkoutMode === "custom_address" && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">Custom Address</p>
                      <p className="text-sm text-muted-foreground">
                        Enter a different shipping address
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Address Fields */}
            {checkoutMode === "custom_address" && (
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="address">Shipping Address</Label>
                  <Textarea
                    id="address"
                    placeholder="Enter your shipping address"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="Enter your phone number"
                    value={shippingPhone}
                    onChange={(e) => setShippingPhone(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Order Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any special requests or notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>

            {/* Order Summary */}
            <Card className="bg-accent/5 border-accent/20">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {product.name} × {quantity}
                  </span>
                  <span className="font-semibold">
                    ฿{totalPrice.toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-accent/20 pt-3 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-accent">฿{totalPrice.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Checkout Button */}
            <Button
              size="lg"
              className="w-full bg-accent hover:bg-accent/90"
              onClick={handleCheckout}
              disabled={product.stock === 0 || isCheckingOut || createOrderMutation.isPending}
            >
              {isCheckingOut || createOrderMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Proceed to Checkout
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
