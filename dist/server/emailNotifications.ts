export type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";

export type EmailTemplate = {
  subject: string;
  html: string;
  text: string;
};

export function generateOrderConfirmationEmail(
  orderNumber: string,
  customerName: string,
  totalAmount: string,
  items: Array<{ name: string; quantity: number; price: string }>
): EmailTemplate {
  const itemsHtml = items
    .map((item) => `<tr><td style="padding: 8px;">${item.name}</td><td style="text-align: center;">${item.quantity}</td><td style="text-align: right;">฿${item.price}</td></tr>`)
    .join("");

  return {
    subject: `ยืนยันการสั่งซื้อ - ${orderNumber}`,
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px;"><h2 style="color: #ea580c;">ยืนยันการสั่งซื้อ</h2><p>สวัสดี ${customerName},</p><p><strong>เลขที่ออเดอร์:</strong> ${orderNumber}</p><table style="width: 100%; border-collapse: collapse;">${itemsHtml}</table><p><strong>รวม: ฿${totalAmount}</strong></p></div>`,
    text: `ยืนยันการสั่งซื้อ\nเลขที่ออเดอร์: ${orderNumber}\nรวม: ฿${totalAmount}`,
  };
}

export function generateOrderStatusEmail(
  orderNumber: string,
  customerName: string,
  status: OrderStatus,
  trackingNumber?: string
): EmailTemplate {
  const messages: Record<OrderStatus, string> = {
    confirmed: "ออเดอร์ของคุณได้รับการยืนยันแล้ว",
    processing: "เรากำลังเตรียมสินค้า",
    shipped: "สินค้าของคุณได้ส่งออกแล้ว",
    delivered: "สินค้าของคุณได้ส่งถึงแล้ว",
    cancelled: "ออเดอร์ของคุณได้ยกเลิกแล้ว",
    pending: "ออเดอร์ของคุณรอดำเนินการ",
  };

  return {
    subject: `อัปเดตสถานะออเดอร์ - ${orderNumber}`,
    html: `<div style="font-family: Arial, sans-serif;"><h2 style="color: #ea580c;">อัปเดตสถานะออเดอร์</h2><p>เลขที่ออเดอร์: ${orderNumber}</p><p>${messages[status]}</p>${trackingNumber ? `<p>เลขที่ติดตาม: ${trackingNumber}</p>` : ""}</div>`,
    text: `อัปเดตสถานะออเดอร์\nเลขที่ออเดอร์: ${orderNumber}\n${messages[status]}${trackingNumber ? `\nเลขที่ติดตาม: ${trackingNumber}` : ""}`,
  };
}

export function generatePaymentVerificationEmail(
  customerName: string,
  amount: string,
  status: "verified" | "rejected",
  rejectionReason?: string
): EmailTemplate {
  const isVerified = status === "verified";

  return {
    subject: `สลิปโอนเงิน${isVerified ? "ยืนยันแล้ว" : "ไม่ผ่าน"}`,
    html: `<div style="font-family: Arial, sans-serif;"><h2 style="color: ${isVerified ? "#4CAF50" : "#f44336"};">สลิปโอนเงิน${isVerified ? "ยืนยันแล้ว" : "ไม่ผ่าน"}</h2><p>จำนวนเงิน: ฿${amount}</p>${isVerified ? "<p>ขอบคุณ! สลิปได้รับการยืนยันแล้ว</p>" : `<p>สลิปไม่ผ่านการตรวจสอบ${rejectionReason ? `\nเหตุผล: ${rejectionReason}` : ""}</p>`}</div>`,
    text: `สลิปโอนเงิน${isVerified ? "ยืนยันแล้ว" : "ไม่ผ่าน"}\nจำนวนเงิน: ฿${amount}\n${isVerified ? "ขอบคุณ! สลิปได้รับการยืนยันแล้ว" : `สลิปไม่ผ่านการตรวจสอบ${rejectionReason ? `\nเหตุผล: ${rejectionReason}` : ""}`}`,
  };
}

export async function sendEmail(
  to: string,
  template: EmailTemplate
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`[Email] Sending to ${to}: ${template.subject}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
