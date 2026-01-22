import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Loader2, Package, ShoppingBag, Settings, Plus, Edit2, Trash2, CheckCircle, Clock, Truck, AlertCircle, X } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function Admin() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"products" | "orders" | "slips" | "settings" | "transactions">("products");
  
  const { data: products, isLoading: productsLoading, refetch: refetchProducts } = trpc.products.list.useQuery();
  const { data: orders, isLoading: ordersLoading } = trpc.orders.getAllOrders.useQuery();
  const { data: pendingSlips, isLoading: slipsLoading, refetch: refetchSlips } = trpc.paymentSlip.getPending.useQuery();
  const { data: settings, isLoading: settingsLoading } = trpc.settings.getAll.useQuery();
  
  const createProductMutation = trpc.products.create.useMutation();
  const updateProductMutation = trpc.products.update.useMutation();
  const deleteProductMutation = trpc.products.delete.useMutation();
  const uploadImageMutation = trpc.uploadImage.useMutation();
  const updateOrderStatusMutation = trpc.orders.updateStatus.useMutation();
  const verifySlipMutation = trpc.paymentSlip.verify.useMutation();
  const cancelOrderMutation = trpc.cancelOrder.useMutation();
  const updateSettingMutation = trpc.settings.update.useMutation();
  const { data: transactionHistory, isLoading: transactionHistoryLoading, refetch: refetchTransactions } = trpc.getTransactionHistory.useQuery({});
  const verifyTransactionMutation = trpc.verifyTransaction.useMutation();
  const rejectTransactionMutation = trpc.rejectTransaction.useMutation();
  const { data: bankAccountsList, isLoading: bankAccountsLoading, refetch: refetchBankAccounts } = trpc.bankAccounts.getAll.useQuery();
  const createBankAccountMutation = trpc.bankAccounts.create.useMutation();
  const updateBankAccountMutation = trpc.bankAccounts.update.useMutation();
  
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    discount: "",
    stock: "",
    category: "",
    imageFile: null as File | null,
    imagePreview: "" as string,
  });

  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    price: "",
    discount: "",
    stock: "",
    category: "",
    imageFile: null as File | null,
    imagePreview: "" as string,
  });
  
  const [siteSettings, setSiteSettings] = useState({
    siteName: "",
    siteDescription: "",
    accentColor: "#FF6B5B",
  });

  const [cancelOrderReason, setCancelOrderReason] = useState("");
  const [selectedOrderToCancel, setSelectedOrderToCancel] = useState<number | null>(null);
  const [newBankAccount, setNewBankAccount] = useState({
    bankName: "",
    accountNumber: "",
    accountName: "",
    qrCode: "",
  });
  const [editingBankAccount, setEditingBankAccount] = useState<any>(null);

  useEffect(() => {
    if (settings && Array.isArray(settings) && settings.length > 0) {
      const settingsMap: Record<string, string> = {};
      settings.forEach((setting: any) => {
        settingsMap[setting.key] = setting.value;
      });
      setSiteSettings({
        siteName: settingsMap.siteName || "",
        siteDescription: settingsMap.siteDescription || "",
        accentColor: settingsMap.accentColor || "#FF6B5B",
      });
    }
  }, [settings]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-serif font-bold">Admin Access Required</h1>
          <p className="text-muted-foreground">Please sign in with admin credentials</p>
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90">
            <a href={getLoginUrl()}>Sign In</a>
          </Button>
        </div>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-serif font-bold">Access Denied</h1>
          <p className="text-muted-foreground">You do not have admin permissions</p>
          <Button onClick={() => setLocation("/")} className="bg-accent hover:bg-accent/90">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const handleCreateProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.stock) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const product = await createProductMutation.mutateAsync({
        name: newProduct.name,
        description: newProduct.description,
        price: newProduct.price,
        discount: newProduct.discount ? parseInt(newProduct.discount) : 0,
        stock: parseInt(newProduct.stock),
        category: newProduct.category,
      });

      if (newProduct.imageFile) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const base64String = (e.target?.result as string).split(',')[1];
          try {
            await uploadImageMutation.mutateAsync({
              productId: (product as any).id,
              imageBase64: base64String,
              fileName: newProduct.imageFile!.name,
            });
            toast.success("Image uploaded successfully!");
            refetchProducts();
          } catch (error) {
            toast.error("Failed to upload image");
          }
        };
        reader.readAsDataURL(newProduct.imageFile);
      }

      setNewProduct({ name: "", description: "", price: "", discount: "", stock: "", category: "", imageFile: null, imagePreview: "" });
      refetchProducts();
      toast.success("Product created successfully!");
    } catch (error) {
      toast.error("Failed to create product");
    }
  };

  const handleUpdateProduct = async () => {
    if (!editForm.name || !editForm.price || !editForm.stock) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await updateProductMutation.mutateAsync({
        id: editingProduct.id,
        name: editForm.name,
        description: editForm.description,
        price: editForm.price,
        discount: editForm.discount ? parseInt(editForm.discount) : 0,
        stock: parseInt(editForm.stock),
        category: editForm.category,
      });

      // Upload new image if selected
      if (editForm.imageFile) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const base64String = (e.target?.result as string).split(',')[1];
          try {
            await uploadImageMutation.mutateAsync({
              productId: editingProduct.id,
              imageBase64: base64String,
              fileName: editForm.imageFile!.name,
            });
            toast.success("Image updated successfully!");
            refetchProducts();
          } catch (error) {
            toast.error("Failed to upload image");
          }
        };
        reader.readAsDataURL(editForm.imageFile);
      }

      setEditingProduct(null);
      setEditForm({ name: "", description: "", price: "", discount: "", stock: "", category: "", imageFile: null, imagePreview: "" });
      refetchProducts();
      toast.success("Product updated successfully!");
    } catch (error) {
      toast.error("Failed to update product");
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await deleteProductMutation.mutateAsync({ id: productId });
      refetchProducts();
      toast.success("Product deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  const handleVerifySlip = async (slipId: number, approved: boolean) => {
    try {
      await verifySlipMutation.mutateAsync({
        slipId,
        status: approved ? "verified" : "rejected",
        rejectionReason: approved ? undefined : "Slip verification failed",
      });
      refetchSlips();
      toast.success(approved ? "Slip approved!" : "Slip rejected!");
    } catch (error) {
      toast.error("Failed to verify slip");
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, status: string) => {
    try {
      await updateOrderStatusMutation.mutateAsync({
        orderId,
        status: status as any,
      });
      toast.success("Order status updated!");
    } catch (error) {
      toast.error("Failed to update order status");
    }
  };

  const handleCancelOrder = async () => {
    if (!selectedOrderToCancel || !cancelOrderReason.trim()) {
      toast.error("Please enter a cancellation reason");
      return;
    }

    try {
      await cancelOrderMutation.mutateAsync({
        orderId: selectedOrderToCancel,
        reason: cancelOrderReason,
      });
      setSelectedOrderToCancel(null);
      setCancelOrderReason("");
      refetchProducts();
      toast.success("Order cancelled successfully!");
    } catch (error) {
      toast.error("Failed to cancel order");
    }
  };

  const handleVerifyTransaction = async (transactionId: number) => {
    try {
      await verifyTransactionMutation.mutateAsync({ transactionId });
      refetchTransactions();
      toast.success("Transaction verified!");
    } catch (error) {
      toast.error("Failed to verify transaction");
    }
  };

  const handleRejectTransaction = async (transactionId: number) => {
    try {
      await rejectTransactionMutation.mutateAsync({ transactionId, reason: "Rejected by admin" });
      refetchTransactions();
      toast.success("Transaction rejected!");
    } catch (error) {
      toast.error("Failed to reject transaction");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50">
        <div className="container py-6">
          <h1 className="text-3xl font-serif font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage products, orders, payments, and site settings</p>
        </div>
      </div>

      <div className="container py-12">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-border overflow-x-auto">
          <button
            onClick={() => setActiveTab("products")}
            className={`pb-3 px-4 font-medium transition-colors whitespace-nowrap ${
              activeTab === "products"
                ? "text-accent border-b-2 border-accent"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Package className="w-4 h-4 inline mr-2" />
            Products
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`pb-3 px-4 font-medium transition-colors whitespace-nowrap ${
              activeTab === "orders"
                ? "text-accent border-b-2 border-accent"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ShoppingBag className="w-4 h-4 inline mr-2" />
            Orders
          </button>
          <button
            onClick={() => setActiveTab("slips")}
            className={`pb-3 px-4 font-medium transition-colors whitespace-nowrap ${
              activeTab === "slips"
                ? "text-accent border-b-2 border-accent"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <AlertCircle className="w-4 h-4 inline mr-2" />
            Payment Slips
          </button>
          <button
            onClick={() => setActiveTab("transactions")}
            className={`pb-3 px-4 font-medium transition-colors whitespace-nowrap ${
              activeTab === "transactions"
                ? "text-accent border-b-2 border-accent"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Clock className="w-4 h-4 inline mr-2" />
            Transactions
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`pb-3 px-4 font-medium transition-colors whitespace-nowrap ${
              activeTab === "settings"
                ? "text-accent border-b-2 border-accent"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Settings className="w-4 h-4 inline mr-2" />
            Settings
          </button>
        </div>

        {/* Content */}
        <div>
          {/* Products Tab */}
          {activeTab === "products" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Add New Product</CardTitle>
                  <CardDescription>Create a new lamp product</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="productName">Product Name *</Label>
                      <Input
                        id="productName"
                        placeholder="e.g., Premium Table Lamp"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        placeholder="e.g., Modern, Classic"
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (THB) *</Label>
                      <Input
                        id="price"
                        type="number"
                        placeholder="0.00"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="discount">Discount (%)</Label>
                      <Input
                        id="discount"
                        type="number"
                        placeholder="0"
                        min="0"
                        max="100"
                        value={newProduct.discount}
                        onChange={(e) => setNewProduct({ ...newProduct, discount: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stock">Stock *</Label>
                      <Input
                        id="stock"
                        type="number"
                        placeholder="0"
                        value={newProduct.stock}
                        onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Product description..."
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="productImage">Product Image</Label>
                    <Input
                      id="productImage"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setNewProduct({ ...newProduct, imageFile: file, imagePreview: URL.createObjectURL(file) });
                        }
                      }}
                    />
                    {newProduct.imagePreview && (
                      <div className="mt-2">
                        <img src={newProduct.imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded border border-border" />
                      </div>
                    )}
                  </div>
                  <Button
                    className="bg-accent hover:bg-accent/90"
                    onClick={handleCreateProduct}
                    disabled={createProductMutation.isPending}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Product
                  </Button>
                </CardContent>
              </Card>

              <div>
                <h3 className="text-xl font-bold mb-4">Products</h3>
                {productsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-accent" />
                  </div>
                ) : products && products.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((product: any) => (
                      <Card key={product.id}>
                        <CardContent className="pt-6">
                          {product.imageUrl && (
                            <img src={product.imageUrl} alt={product.name} className="w-full h-40 object-cover rounded mb-4 border border-border" />
                          )}
                          <h4 className="font-bold mb-2">{product.name}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
                          <div className="flex justify-between mb-4">
                            <span className="font-bold text-accent">฿{parseFloat(product.price).toFixed(2)}</span>
                            <span className="text-sm">Stock: {product.stock}</span>
                          </div>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => {
                                    setEditingProduct(product);
                                    setEditForm({
                                      name: product.name,
                                      description: product.description,
                                      price: product.price,
                                      discount: product.discount?.toString() || "0",
                                      stock: product.stock.toString(),
                                      category: product.category,
                                      imageFile: null,
                                      imagePreview: product.imageUrl || "",
                                    });
                                  }}
                                >
                                  <Edit2 className="w-4 h-4 mr-1" />
                                  Edit
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Edit Product</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label>Product Name</Label>
                                    <Input
                                      value={editForm.name}
                                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Category</Label>
                                    <Input
                                      value={editForm.category}
                                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Price</Label>
                                    <Input
                                      type="number"
                                      value={editForm.price}
                                      onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Discount (%)</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      max="100"
                                      placeholder="0"
                                      value={editForm.discount}
                                      onChange={(e) => setEditForm({ ...editForm, discount: e.target.value })}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Stock</Label>
                                    <Input
                                      type="number"
                                      value={editForm.stock}
                                      onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Textarea
                                      value={editForm.description}
                                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                      rows={3}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Product Image</Label>
                                    {(editForm.imagePreview || editingProduct?.imageUrl) && (
                                      <div className="mb-2">
                                        <img
                                          src={editForm.imagePreview || editingProduct?.imageUrl}
                                          alt="Preview"
                                          className="w-32 h-32 object-cover rounded-lg border"
                                        />
                                      </div>
                                    )}
                                    <Input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          setEditForm({
                                            ...editForm,
                                            imageFile: file,
                                            imagePreview: URL.createObjectURL(file),
                                          });
                                        }
                                      }}
                                    />
                                  </div>
                                  <Button
                                    className="bg-accent hover:bg-accent/90"
                                    onClick={handleUpdateProduct}
                                    disabled={updateProductMutation.isPending || uploadImageMutation.isPending}
                                  >
                                    Save Changes
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleDeleteProduct(product.id)}
                              disabled={deleteProductMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No products yet</p>
                )}
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="space-y-4">
              {ordersLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-accent" />
                </div>
              ) : orders && orders.length > 0 ? (
                orders.map((order: any) => (
                  <Card key={order.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-bold">Order #{order.orderNumber}</h4>
                          <p className="text-sm text-muted-foreground">฿{parseFloat(order.totalAmount).toFixed(2)}</p>
                          {order.cancellationReason && (
                            <p className="text-sm text-red-600 mt-1">Cancelled: {order.cancellationReason}</p>
                          )}
                        </div>
                        <span className="text-sm font-semibold">{order.status}</span>
                      </div>
                      
                      {/* Customer Address */}
                      <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1">📍 Shipping Address</p>
                            <p className="text-sm">
                              {order.shippingAddress || order.user?.address || "No address provided"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1">📞 Phone Number</p>
                            <p className="text-sm">
                              {order.shippingPhone || order.user?.phone || "No phone provided"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1">📝 Order Notes</p>
                            <p className="text-sm">
                              {order.notes || "No notes"}
                            </p>
                          </div>
                        </div>
                        {order.user && (
                          <div className="mt-2 pt-2 border-t border-border">
                            <p className="text-xs text-muted-foreground">
                              👤 Customer: {order.user.name || "N/A"} • {order.user.email || "No email"}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2 mb-4 flex-wrap">
                        {["pending", "confirmed", "processing", "shipped", "delivered"].map((status) => (
                          <Button
                            key={status}
                            variant={order.status === status ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleUpdateOrderStatus(order.id, status)}
                            className={order.status === status ? "bg-accent hover:bg-accent/90" : ""}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </Button>
                        ))}
                      </div>
                      {order.status !== "cancelled" && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setSelectedOrderToCancel(order.id)}
                            >
                              <X className="w-4 h-4 mr-2" />
                              Cancel Order
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Cancel Order #{order.orderNumber}</DialogTitle>
                              <DialogDescription>Please provide a reason for cancellation</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <Textarea
                                placeholder="Enter cancellation reason..."
                                value={cancelOrderReason}
                                onChange={(e) => setCancelOrderReason(e.target.value)}
                                rows={4}
                              />
                              <Button
                                variant="destructive"
                                onClick={handleCancelOrder}
                                disabled={cancelOrderMutation.isPending}
                              >
                                {cancelOrderMutation.isPending ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Cancelling...
                                  </>
                                ) : (
                                  "Confirm Cancellation"
                                )}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">No orders yet</p>
              )}
            </div>
          )}

          {/* Payment Slips Tab */}
          {activeTab === "slips" && (
            <div className="space-y-4">
              {slipsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-accent" />
                </div>
              ) : pendingSlips && pendingSlips.length > 0 ? (
                pendingSlips.map((slip: any) => (
                  <Card key={slip.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-bold">Slip #{slip.id}</h4>
                          <p className="text-sm text-muted-foreground">Amount: ฿{parseFloat(slip.amount).toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">Status: {slip.status}</p>
                        </div>
                      </div>
                      {slip.imageUrl && (
                        <img src={slip.imageUrl} alt="Payment Slip" className="w-full mb-4 rounded border border-border max-h-48 object-cover" />
                      )}
                      <div className="flex gap-2">
                        <Button
                          className="bg-green-600 hover:bg-green-700 flex-1"
                          onClick={() => handleVerifySlip(slip.id, true)}
                          disabled={verifySlipMutation.isPending}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          className="flex-1"
                          onClick={() => handleVerifySlip(slip.id, false)}
                          disabled={verifySlipMutation.isPending}
                        >
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">No pending slips</p>
              )}
            </div>
          )}

          {/* Transaction History Tab */}
          {activeTab === "transactions" && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>Manage wallet transactions</CardDescription>
                </CardHeader>
              </Card>
              {transactionHistoryLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-accent" />
                </div>
              ) : transactionHistory && transactionHistory.length > 0 ? (
                transactionHistory.map((transaction: any) => (
                  <Card key={transaction.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-bold">Transaction #{transaction.id}</h4>
                          <p className="text-sm text-muted-foreground">Amount: ฿{parseFloat(transaction.amount).toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">Status: {transaction.status}</p>
                          <p className="text-sm text-muted-foreground">Type: {transaction.type}</p>
                        </div>
                      </div>
                      {transaction.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            className="bg-green-600 hover:bg-green-700 flex-1"
                            onClick={() => handleVerifyTransaction(transaction.id)}
                            disabled={verifyTransactionMutation.isPending}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Verify
                          </Button>
                          <Button
                            variant="destructive"
                            className="flex-1"
                            onClick={() => handleRejectTransaction(transaction.id)}
                            disabled={rejectTransactionMutation.isPending}
                          >
                            <AlertCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">No transactions</p>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Site Customization</CardTitle>
                  <CardDescription>Customize your site appearance and content</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      placeholder="Nyxos"
                      value={siteSettings.siteName}
                      onChange={(e) => setSiteSettings({ ...siteSettings, siteName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="siteDescription">Site Description</Label>
                    <Textarea
                      id="siteDescription"
                      placeholder="Describe your lamp shop..."
                      value={siteSettings.siteDescription}
                      onChange={(e) => setSiteSettings({ ...siteSettings, siteDescription: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accentColor">Accent Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="accentColor"
                        type="color"
                        value={siteSettings.accentColor}
                        onChange={(e) => setSiteSettings({ ...siteSettings, accentColor: e.target.value })}
                        className="w-20 h-10"
                      />
                      <Input
                        type="text"
                        value={siteSettings.accentColor}
                        onChange={(e) => setSiteSettings({ ...siteSettings, accentColor: e.target.value })}
                        placeholder="#FF6B5B"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <Button
                    className="bg-accent hover:bg-accent/90"
                    onClick={async () => {
                      try {
                        if (siteSettings.siteName) {
                          await updateSettingMutation.mutateAsync({
                            key: "siteName",
                            value: siteSettings.siteName,
                          });
                        }
                        if (siteSettings.siteDescription) {
                          await updateSettingMutation.mutateAsync({
                            key: "siteDescription",
                            value: siteSettings.siteDescription,
                          });
                        }
                        if (siteSettings.accentColor) {
                          await updateSettingMutation.mutateAsync({
                            key: "accentColor",
                            value: siteSettings.accentColor,
                          });
                        }
                        toast.success("Settings saved successfully!");
                      } catch (error) {
                        toast.error("Failed to save settings");
                      }
                    }}
                    disabled={updateSettingMutation.isPending}
                  >
                    {updateSettingMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Settings"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
