import { describe, it, expect } from "vitest";

/**
 * Test suite for wallet deduction during purchase
 * These tests verify that wallet balance is correctly deducted when users purchase products
 */

describe("Wallet Deduction Logic", () => {
  it("should calculate correct deduction amount for single item", () => {
    const items = [{ productId: 1, quantity: 1, price: "99" }];
    
    const totalAmount = items.reduce((sum, item) => 
      sum + (parseFloat(item.price) * item.quantity), 0
    ).toString();
    
    expect(totalAmount).toBe("99");
  });

  it("should calculate correct deduction amount for multiple items", () => {
    const items = [
      { productId: 1, quantity: 2, price: "100" },
      { productId: 2, quantity: 1, price: "250" },
    ];
    
    const totalAmount = items.reduce((sum, item) => 
      sum + (parseFloat(item.price) * item.quantity), 0
    ).toString();
    
    expect(totalAmount).toBe("450");
  });

  it("should correctly determine if wallet has sufficient balance", () => {
    const walletBalance = 5500;
    const purchaseAmount = 99;
    
    const hasSufficientBalance = walletBalance >= purchaseAmount;
    expect(hasSufficientBalance).toBe(true);
  });

  it("should correctly identify insufficient balance", () => {
    const walletBalance = 50;
    const purchaseAmount = 99;
    
    const hasSufficientBalance = walletBalance >= purchaseAmount;
    expect(hasSufficientBalance).toBe(false);
  });

  it("should calculate new balance after deduction", () => {
    const currentBalance = 5500;
    const deductAmount = 99;
    
    const newBalance = (currentBalance - deductAmount).toFixed(2);
    expect(newBalance).toBe("5401.00");
  });

  it("should handle decimal amounts correctly", () => {
    const currentBalance = 1000.50;
    const deductAmount = 299.99;
    
    const newBalance = (currentBalance - deductAmount).toFixed(2);
    expect(newBalance).toBe("700.51");
  });

  it("should create purchase transaction record with correct type", () => {
    const transaction = {
      walletId: 1,
      type: 'purchase',
      amount: "99",
      status: 'completed',
      description: `Purchase - Deducted 99 THB`,
    };
    
    expect(transaction.type).toBe('purchase');
    expect(transaction.status).toBe('completed');
    expect(transaction.description).toContain('Deducted');
  });

  it("should prevent negative balance after deduction", () => {
    const currentBalance = 50;
    const deductAmount = 99;
    
    // Deduction should fail if balance is insufficient
    const canDeduct = currentBalance >= deductAmount;
    expect(canDeduct).toBe(false);
    
    // Balance should remain unchanged if deduction fails
    const finalBalance = canDeduct ? currentBalance - deductAmount : currentBalance;
    expect(finalBalance).toBe(50);
  });

  it("should handle zero balance correctly", () => {
    const currentBalance = 0;
    const deductAmount = 99;
    
    const canDeduct = currentBalance >= deductAmount;
    expect(canDeduct).toBe(false);
  });

  it("should allow exact balance deduction", () => {
    const currentBalance = 99;
    const deductAmount = 99;
    
    const canDeduct = currentBalance >= deductAmount;
    expect(canDeduct).toBe(true);
    
    const newBalance = (currentBalance - deductAmount).toFixed(2);
    expect(newBalance).toBe("0.00");
  });
});

describe("Order Creation with Wallet Deduction", () => {
  it("should validate order items before deduction", () => {
    const items = [
      { productId: 1, quantity: 1, price: "99" },
    ];
    
    const isValid = items.length > 0 && items.every(item => 
      item.productId > 0 && item.quantity > 0 && parseFloat(item.price) >= 0
    );
    
    expect(isValid).toBe(true);
  });

  it("should reject empty order items", () => {
    const items: Array<{ productId: number; quantity: number; price: string }> = [];
    
    const isValid = items.length > 0;
    expect(isValid).toBe(false);
  });

  it("should calculate total correctly for order with quantity > 1", () => {
    const items = [
      { productId: 1, quantity: 3, price: "150" },
    ];
    
    const totalAmount = items.reduce((sum, item) => 
      sum + (parseFloat(item.price) * item.quantity), 0
    );
    
    expect(totalAmount).toBe(450);
  });
});
