import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Loader2, ChevronLeft, ShoppingBag, Truck, CheckCircle, Clock, XCircle, AlertTriangle } from "lucide-react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function Orders() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { data: orders, isLoading } = trpc.orders.getUserOrders.useQuery();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="absolute top-4 right-4">
          <LanguageSwitcher />
        </div>
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-serif font-bold">{t("common.signIn")}</h1>
          <p className="text-muted-foreground">{t("orders.noOrders")}</p>
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90">
            <a href={getLoginUrl()}>{t("common.signIn")}</a>
          </Button>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5" />;
      case "confirmed":
      case "processing":
        return <Clock className="w-5 h-5" />;
      case "shipped":
        return <Truck className="w-5 h-5" />;
      case "delivered":
        return <CheckCircle className="w-5 h-5" />;
      case "cancelled":
        return <XCircle className="w-5 h-5" />;
      default:
        return <ShoppingBag className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
      case "confirmed":
      case "processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
      case "shipped":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100";
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100";
    }
  };

  const getStatusLabel = (status: string) => {
    const statusKey = status as keyof typeof statusMap;
    const statusMap = {
      pending: t("orders.pending"),
      confirmed: t("orders.confirmed"),
      processing: t("orders.processing"),
      shipped: t("orders.shipped"),
      delivered: t("orders.delivered"),
      cancelled: t("orders.cancelled"),
    };
    return statusMap[statusKey] || status;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation("/")}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-3xl font-serif font-bold">{t("orders.title")}</h1>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      <div className="container py-12">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card
                key={order.id}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setLocation(`/orders/${order.id}`)}
              >
                <CardContent className="py-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                    {/* Order Info */}
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">{t("orders.orderNumber")}</p>
                      <p className="font-mono font-bold">{order.orderNumber}</p>
                    </div>

                    {/* Date */}
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">{t("orders.orderDate")}</p>
                      <p className="font-medium">
                        {new Date(order.createdAt).toLocaleDateString('th-TH', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>

                    {/* Amount */}
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">{t("orders.totalAmount")}</p>
                      <p className="text-xl font-bold text-accent">
                        ฿{parseFloat(order.totalAmount).toFixed(2)}
                      </p>
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">{t("orders.orderStatus")}</p>
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-full ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusLabel(order.status)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Cancellation Reason - Show if order is cancelled */}
                  {order.status === "cancelled" && order.cancellationReason && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-red-700 dark:text-red-300">
                            {t("orders.cancellationReason")}:
                          </p>
                          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                            {order.cancellationReason}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Checkout Mode */}
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      {order.checkoutMode === "standard"
                        ? t("product.standardCheckout")
                        : t("product.customAddress")}
                      {order.shippingAddress && ` • ${order.shippingAddress}`}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">{t("orders.noOrders")}</h3>
              <p className="text-muted-foreground mb-6">
                {t("orders.noOrders")}
              </p>
              <Button
                className="bg-accent hover:bg-accent/90"
                onClick={() => setLocation("/shop")}
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                {t("home.startShopping")}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
