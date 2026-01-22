import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Loader2, ChevronLeft, Clock, CheckCircle, Package, Truck, Home, XCircle, AlertTriangle } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

// Status order for timeline
const STATUS_ORDER = ["pending", "confirmed", "processing", "shipped", "delivered"];

export default function OrderDetail() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/orders/:id");
  const orderId = params?.id ? parseInt(params.id) : null;

  const { data: order, isLoading } = trpc.orders.getById.useQuery(
    { orderId: orderId || 0 },
    { enabled: !!orderId }
  );

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-serif font-bold">{t("orders.orderNotFound")}</h1>
          <p className="text-muted-foreground">{t("orders.orderNotFoundDesc")}</p>
          <Button
            onClick={() => setLocation("/orders")}
            className="bg-accent hover:bg-accent/90"
          >
            {t("orders.backToOrders")}
          </Button>
        </div>
      </div>
    );
  }

  const isCancelled = order.status === "cancelled";
  const currentStatusIndex = STATUS_ORDER.indexOf(order.status);

  const getStatusIcon = (status: string, isActive: boolean, isCompleted: boolean) => {
    const iconClass = `w-5 h-5 ${isCompleted ? "text-white" : isActive ? "text-white" : "text-gray-400"}`;
    
    switch (status) {
      case "pending":
        return <Clock className={iconClass} />;
      case "confirmed":
        return <CheckCircle className={iconClass} />;
      case "processing":
        return <Package className={iconClass} />;
      case "shipped":
        return <Truck className={iconClass} />;
      case "delivered":
        return <Home className={iconClass} />;
      default:
        return <Clock className={iconClass} />;
    }
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: t("orders.pending"),
      confirmed: t("orders.confirmed"),
      processing: t("orders.processing"),
      shipped: t("orders.shipped"),
      delivered: t("orders.delivered"),
      cancelled: t("orders.cancelled"),
    };
    return statusMap[status] || status;
  };

  const getStatusSubLabel = (status: string, isCompleted: boolean, isCurrent: boolean) => {
    if (isCompleted) return t("orders.completed");
    if (isCurrent) return t("orders.currentStatus");
    return t("orders.pendingStatus");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setLocation("/orders")}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              {t("orders.backToOrders")}
            </Button>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Header Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">
                      {t("orders.order")} {order.orderNumber}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t("orders.placedOn")} {new Date(order.createdAt).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'numeric',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <Badge 
                    className={`${
                      isCancelled 
                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100" 
                        : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                    }`}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    {getStatusLabel(order.status)}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Cancelled State - Show only if cancelled */}
            {isCancelled ? (
              <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center">
                      <XCircle className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-red-700 dark:text-red-300">
                        {t("orders.orderCancelled")}
                      </h3>
                      <p className="text-red-600 dark:text-red-400 mt-1">
                        {t("orders.orderCancelledDesc")}
                      </p>
                    </div>
                  </div>
                  
                  {order.cancellationReason && (
                    <div className="mt-6 p-4 bg-white dark:bg-gray-900 rounded-lg border border-red-200 dark:border-red-800">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-red-700 dark:text-red-300">
                            {t("orders.cancellationReason")}:
                          </p>
                          <p className="text-red-600 dark:text-red-400 mt-1">
                            {order.cancellationReason}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              /* Delivery Progress Timeline - Show only if NOT cancelled */
              <Card>
                <CardHeader>
                  <CardTitle>{t("orders.deliveryProgress")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-0">
                    {STATUS_ORDER.map((status, index) => {
                      const isCompleted = index < currentStatusIndex;
                      const isCurrent = index === currentStatusIndex;
                      const isLast = index === STATUS_ORDER.length - 1;
                      
                      return (
                        <div key={status} className="flex">
                          {/* Timeline Icon and Line */}
                          <div className="flex flex-col items-center mr-4">
                            <div 
                              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                isCompleted || isCurrent
                                  ? "bg-accent"
                                  : "bg-gray-200 dark:bg-gray-700"
                              }`}
                            >
                              {getStatusIcon(status, isCurrent, isCompleted)}
                            </div>
                            {!isLast && (
                              <div 
                                className={`w-0.5 h-16 ${
                                  isCompleted
                                    ? "bg-accent"
                                    : "bg-gray-200 dark:bg-gray-700"
                                }`}
                              />
                            )}
                          </div>
                          
                          {/* Status Text */}
                          <div className={`pb-8 ${isLast ? "pb-0" : ""}`}>
                            <p className={`font-semibold ${
                              isCompleted || isCurrent
                                ? "text-foreground"
                                : "text-muted-foreground"
                            }`}>
                              {getStatusLabel(status)}
                            </p>
                            <p className={`text-sm ${
                              isCurrent
                                ? "text-accent font-medium"
                                : "text-muted-foreground"
                            }`}>
                              {getStatusSubLabel(status, isCompleted, isCurrent)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>{t("orders.orderItems")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex items-center gap-4">
                        {item.productImage && (
                          <img 
                            src={item.productImage} 
                            alt={item.productName}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        )}
                        <div>
                          <p className="font-semibold">{item.productName}</p>
                          <p className="text-sm text-muted-foreground">
                            {t("orders.quantity")}: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <p className="font-bold text-accent">฿{parseFloat(item.price).toFixed(2)}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">{t("orders.noItems")}</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Right Side */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>{t("orders.orderSummary")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("orders.totalAmount")}:</span>
                  <span className="font-bold text-lg">฿{parseFloat(order.totalAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("orders.paymentMethod")}:</span>
                  <span className="font-semibold">{t("wallet.title")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("orders.status")}:</span>
                  <span className="font-semibold">{getStatusLabel(order.status)}</span>
                </div>
                
                <div className="border-t border-border pt-4 mt-4">
                  <p className="text-xs text-muted-foreground">
                    {t("orders.orderId")}: {order.id}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("orders.lastUpdated")}: {new Date(order.updatedAt || order.createdAt).toLocaleString('th-TH')}
                  </p>
                </div>

                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => setLocation("/orders")}
                >
                  {t("orders.backToOrders")}
                </Button>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("orders.shippingAddress")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{order.shippingAddress}</p>
                </CardContent>
              </Card>
            )}

            {/* Order Notes */}
            {order.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("orders.orderNotes")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{order.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
