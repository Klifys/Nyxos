import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Loader2, ChevronLeft, Upload, CheckCircle, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useRef } from "react";
import { toast } from "sonner";

export default function PaymentSlip() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const uploadMutation = trpc.paymentSlip.upload.useMutation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<number | null>(null);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-serif font-bold">Please Sign In</h1>
          <p className="text-muted-foreground">You need to sign in to upload payment slips</p>
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90">
            <a href={getLoginUrl()}>Sign In</a>
          </Button>
        </div>
      </div>
    );
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !transactionId) {
      toast.error("Please select a file and enter transaction ID");
      return;
    }

    try {
      // In a real implementation, upload to S3 first
      // For now, we'll use a data URL
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageUrl = e.target?.result as string;
        
        await uploadMutation.mutateAsync({
          transactionId,
          imageUrl,
          imageKey: `slip-${Date.now()}-${selectedFile.name}`,
        });

        toast.success("Payment slip uploaded successfully! Waiting for verification...");
        setSelectedFile(null);
        setPreview(null);
        setTransactionId(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      toast.error("Failed to upload payment slip");
    }
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
              onClick={() => setLocation("/wallet")}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-3xl font-serif font-bold">Upload Payment Slip</h1>
          </div>
        </div>
      </div>

      <div className="container py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>How to Upload Your Payment Slip</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-semibold">Take a screenshot or photo of your payment slip</p>
                    <p className="text-sm text-muted-foreground">
                      Make sure the transaction details are clearly visible
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-semibold">Upload the image file below</p>
                    <p className="text-sm text-muted-foreground">
                      Supported formats: JPG, PNG (Max 5MB)
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-semibold">Wait for verification</p>
                    <p className="text-sm text-muted-foreground">
                      Our system will automatically verify your payment and credit your wallet
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upload Form */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Payment Slip</CardTitle>
              <CardDescription>
                Select the payment slip image to upload for verification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Input */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Payment Slip Image</label>
                <div
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-accent/50 transition"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  {preview ? (
                    <div className="space-y-4">
                      <img
                        src={preview}
                        alt="Preview"
                        className="max-h-64 mx-auto rounded-lg"
                      />
                      <p className="text-sm text-muted-foreground">
                        {selectedFile?.name}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                          setPreview(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                          }
                        }}
                      >
                        Change Image
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                      <p className="font-medium">Click to upload or drag and drop</p>
                      <p className="text-sm text-muted-foreground">
                        PNG, JPG up to 5MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Transaction ID */}
              <div className="space-y-3">
                <label htmlFor="transactionId" className="text-sm font-medium">
                  Transaction ID (Optional)
                </label>
                <input
                  id="transactionId"
                  type="number"
                  placeholder="Enter transaction ID if available"
                  value={transactionId || ""}
                  onChange={(e) => setTransactionId(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <p className="text-xs text-muted-foreground">
                  This helps us match your payment slip with your top-up request
                </p>
              </div>

              {/* Upload Button */}
              <Button
                className="w-full bg-accent hover:bg-accent/90"
                onClick={handleUpload}
                disabled={!selectedFile || uploadMutation.isPending}
              >
                {uploadMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Payment Slip
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Important Notes */}
          <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-blue-900 dark:text-blue-100 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Important Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-900 dark:text-blue-100 space-y-2">
              <p>
                • Make sure the payment slip clearly shows the transaction amount and date
              </p>
              <p>
                • The slip must match the amount you entered for top-up
              </p>
              <p>
                • Verification typically takes 5-10 minutes
              </p>
              <p>
                • If verification fails, you'll be notified with the reason
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
