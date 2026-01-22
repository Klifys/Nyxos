import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Loader2, Wallet, ChevronLeft, Plus, Copy, Check, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import QRCode from "qrcode";

export default function WalletPage() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { data: balance, isLoading: balanceLoading } = trpc.wallet.getBalance.useQuery();
  const { data: transactions, isLoading: transactionsLoading } = trpc.wallet.getTransactions.useQuery();
  const initiateTopupMutation = trpc.wallet.initiateTopup.useMutation();
  
  const [topupAmount, setTopupAmount] = useState("");
  const [showQRCode, setShowQRCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentTransactionId, setCurrentTransactionId] = useState<number | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  useEffect(() => {
    if (showQRCode && topupAmount) {
      generateQRCode();
    }
  }, [showQRCode, topupAmount]);

  const generateQRCode = async () => {
    try {
      const qrText = `KASIKORNBANK|141-1-49966-5|${topupAmount}|ด.ช. ดรัณภพ นนท์นภัส`;
      const url = await QRCode.toDataURL(qrText);
      setQrCodeUrl(url);
    } catch (error) {
      console.error("Failed to generate QR code:", error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-serif font-bold">Please Sign In</h1>
          <p className="text-muted-foreground">You need to sign in to access your wallet</p>
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90">
            <a href={getLoginUrl()}>Sign In</a>
          </Button>
        </div>
      </div>
    );
  }

  const handleTopup = async () => {
    if (!topupAmount || parseFloat(topupAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      const result = await initiateTopupMutation.mutateAsync({ amount: topupAmount });
      setCurrentTransactionId(result.transactionId);
      setShowQRCode(true);
      toast.success("Top-up initiated. Please transfer the amount and upload the slip.");
    } catch (error) {
      toast.error("Failed to initiate top-up");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50">
        <div className="container py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/")}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-3xl font-serif font-bold">My Wallet</h1>
          </div>
        </div>
      </div>

      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Balance Card */}
          <div className="lg:col-span-1">
            <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="w-5 h-5" />
                  Balance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {balanceLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-accent" />
                  </div>
                ) : (
                  <>
                    <div className="text-4xl font-bold text-accent">
                      ฿{parseFloat(balance?.balance || "0").toFixed(2)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Available balance in your wallet
                    </p>
                    <Button
                      className="w-full bg-accent hover:bg-accent/90"
                      onClick={() => setShowQRCode(!showQRCode)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Top Up Balance
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Top-up Section */}
          <div className="lg:col-span-2">
            {showQRCode ? (
              <Card>
                <CardHeader>
                  <CardTitle>Top-up via Bank Transfer</CardTitle>
                  <CardDescription>
                    Transfer the amount and upload the payment slip for verification
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Warning Box */}
                  <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-900 dark:text-blue-100">
                      <p className="font-semibold mb-1">Important:</p>
                      <p>Your wallet will be credited AFTER we verify your payment slip. Please upload the slip to complete the top-up.</p>
                    </div>
                  </div>

                  <div className="bg-muted p-8 rounded-lg flex items-center justify-center">
                    <div className="text-center space-y-4">
                      {qrCodeUrl ? (
                        <img
                          src={qrCodeUrl}
                          alt="QR Code"
                          className="w-48 h-48 rounded-lg border-4 border-white shadow-lg mx-auto"
                        />
                      ) : (
                        <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center mx-auto">
                          <Loader2 className="w-8 h-8 animate-spin text-accent" />
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Amount: <span className="font-bold text-foreground">฿{topupAmount}</span>
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Manual Transfer Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between p-3 bg-muted rounded">
                        <span className="text-muted-foreground">Bank:</span>
                        <span className="font-mono">KASIKORNBANK</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted rounded">
                        <span className="text-muted-foreground">Account:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono">141-1-49966-5</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-6 h-6"
                            onClick={() => copyToClipboard("141-1-49966-5")}
                          >
                            {copied ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted rounded">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-mono">ด.ช. ดรัณภพ นนท์นภัส</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted rounded">
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="font-mono font-bold">฿{topupAmount}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowQRCode(false);
                        setTopupAmount("");
                        setCurrentTransactionId(null);
                        setQrCodeUrl("");
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 bg-accent hover:bg-accent/90"
                      onClick={() => {
                        if (!currentTransactionId) {
                          toast.error("Transaction ID not found");
                          return;
                        }
                        setLocation(`/payment-slip?transactionId=${currentTransactionId}&amount=${topupAmount}`);
                      }}
                    >
                      Upload Slip
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Top-up Amount</CardTitle>
                  <CardDescription>
                    Enter the amount you want to add to your wallet
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Amount (THB)</label>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-muted-foreground">฿</span>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={topupAmount}
                        onChange={(e) => setTopupAmount(e.target.value)}
                        className="text-2xl font-bold"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {[100, 500, 1000, 5000].map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        onClick={() => setTopupAmount(amount.toString())}
                        className="text-sm"
                      >
                        ฿{amount}
                      </Button>
                    ))}
                  </div>

                  <Button
                    className="w-full bg-accent hover:bg-accent/90"
                    onClick={handleTopup}
                    disabled={initiateTopupMutation.isPending}
                  >
                    {initiateTopupMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Continue to QR Code
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Transaction History */}
        <div className="mt-12">
          <h2 className="text-2xl font-serif font-bold mb-6">Transaction History</h2>
          {transactionsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : transactions && transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <Card key={transaction.id}>
                  <CardContent className="py-4 flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium capitalize">
                        {transaction.type} - {transaction.description}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.createdAt).toLocaleDateString('th-TH', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className={`font-bold text-lg ${
                        transaction.type === 'topup' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'topup' ? '+' : '-'}฿{parseFloat(transaction.amount).toFixed(2)}
                      </p>
                      <p className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground capitalize">
                        {transaction.status}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Wallet className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                <p className="text-muted-foreground">No transactions yet</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
