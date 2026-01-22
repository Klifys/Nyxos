# Nyxos Lamp Shop - Project TODO

## Phase 1: Architecture & Design
- [x] Analyze reference design and create design system
- [x] Plan database schema with all entities
- [x] Define API endpoints and tRPC procedures
- [ ] Set up Stripe integration for payment processing

## Phase 2: Database & Core Backend
- [x] Initialize project with web-db-user scaffold
- [x] Create database schema (users, products, orders, payments, wallets, slips)
- [x] Implement database query helpers
- [x] Create core tRPC procedures for authentication

## Phase 3: Authentication & User Management
- [x] Implement user registration and login (via Manus OAuth)
- [x] Set up role-based access control (admin/user)
- [ ] Create user profile management page
- [x] Implement logout functionality

## Phase 4: Product Catalog & Homepage
- [x] Design and implement homepage layout
- [x] Create product display component
- [x] Implement product filtering and search
- [ ] Set up product image storage (S3)
- [x] Create modern UX/UI with lighting aesthetics

## Phase 5: Wallet System & QR Payment
- [x] Design wallet data model
- [x] Implement wallet top-up functionality
- [ ] Generate QR codes for bank transfers
- [x] Create wallet balance display
- [x] Implement wallet transaction history

## Phase 6: Slip Verification & Payment Processing
- [x] Implement slip upload functionality
- [ ] Set up automatic image recognition for slip verification
- [ ] Extract transaction details from slips
- [ ] Match slips with pending orders
- [ ] Implement payment confirmation workflow

## Phase 7: Checkout & Order Management
- [x] Implement standard checkout mode
- [x] Implement custom address checkout mode
- [x] Create order creation and processing
- [x] Implement order status tracking
- [x] Create order history for users

## Phase 8: Admin Dashboard
- [ ] Create admin layout and navigation
- [ ] Implement product management (CRUD)
- [ ] Implement order management interface
- [ ] Create site customization panel (colors, name, content)
- [ ] Implement sales analytics and reporting

## Phase 9: Email Notifications
- [ ] Set up email service integration
- [ ] Implement order confirmation emails
- [ ] Implement order status update emails
- [ ] Implement admin notification for new orders
- [ ] Create email templates

## Phase 10: Performance & Testing
- [x] Write comprehensive test suite (21 tests passing)
- [ ] Optimize image loading and caching
- [ ] Implement lazy loading for products
- [ ] Test all checkout flows
- [ ] Test payment verification system
- [ ] Optimize database queries
- [ ] Test admin panel functionality
- [ ] Performance testing and optimization

## Phase 11: Deployment
- [ ] Create final checkpoint
- [ ] Verify all features working
- [ ] Deploy website


## Bug Fixes & Issues
- [x] Fix wallet top-up flow - should NOT auto-credit, require slip verification first
- [x] Fix order creation failure - added error logging to ProductDetail
- [x] Create Admin page - Admin Dashboard created with product/order management
- [x] Improve error handling and user feedback
- [x] Create Profile page for user account management
- [x] Fix wallet transaction - prevent pending transaction creation without slip upload
- [x] Implement QR code generation for bank transfers
- [x] Add payment slip verification UI in admin panel (verify/reject buttons)
- [x] Implement Edit Product functionality in Admin
- [x] Implement Delete Product functionality in Admin

## Recent Issues to Fix
- [x] Add Cancel button to Wallet page
- [x] Create Orders detail page (fix 404 error)
- [x] Reorganize navigation bar (Wallet, Shop, Orders order)
- [ ] Show rejection reason in Payment Slip page
- [ ] Improve sign-in/sign-up flow
- [x] Fix Settings save - color and site name not persisting to database

## New Issues Found
- [x] Add Cancel/Reject button for payment slips (Reject button already exists)
- [x] Group products by category in Admin and Shop pages (already implemented)
- [x] Apply accent color to entire website (CSS variables now updating via useEffect)
- [x] Fix order items not being saved to database during checkout (fixed createOrder to return insertId)

## Phase 12: Advanced Features (Current)

### 12.1 Automatic Slip Verification (AI/OCR)
- [x] Create slipVerification.ts with AI/OCR capability
- [x] Add verifyPaymentSlip() function using LLM with vision
- [x] Add validateSlipData() for validation logic
- [ ] Add procedures to routers.ts for slip auto-verification
- [ ] Create admin UI for manual slip verification
- [ ] Write tests for slip verification

### 12.2 Email Notifications
- [x] Create emailNotifications.ts with email templates
- [x] Add generateOrderConfirmationEmail()
- [x] Add generateOrderStatusEmail()
- [x] Add generatePaymentVerificationEmail()
- [ ] Add procedures to routers.ts for sending emails
- [ ] Integrate with actual email service (SendGrid/AWS SES)
- [ ] Create admin UI to send manual emails
- [ ] Write tests for email notifications

### 12.3 Product Image Upload (S3 CDN)
- [ ] Add imageUrl and imageKey fields to products table
- [ ] Create image upload component in Admin Products tab
- [ ] Implement storagePut() for S3 upload
- [ ] Add image preview in product list
- [ ] Add image display in product details page
- [ ] Add image deletion functionality
- [ ] Write tests for image upload

### 12.4 Order Items Management
- [ ] Verify orderItems table structure in database
- [ ] Create admin UI to add/remove items from orders
- [ ] Display order items in Order Details page
- [ ] Add item quantity and price editing
- [ ] Recalculate order total when items change
- [ ] Write tests for order items management

### 12.5 Cancel Order with Reason
- [ ] Add cancellationReason field to orders table
- [ ] Add "Cancelled" status to order status enum
- [ ] Create cancel order dialog with reason input
- [ ] Add cancel button to admin Orders tab
- [ ] Send cancellation email to customer
- [ ] Update wallet if payment was made
- [ ] Write tests for order cancellation

### 12.6 Transaction History Management (Admin)
- [ ] Create admin page for Transaction History
- [ ] Display all wallet transactions with user info
- [ ] Add filter by user, status, date range
- [ ] Add manual verification/rejection buttons
- [ ] Create reason input for rejection
- [ ] Update wallet balance on manual verification
- [ ] Send email notification on verification/rejection
- [ ] Write tests for transaction management


## Phase 13: Final Fixes & Export
- [x] Fix Cancel Order backend procedure bug (Failed to cancel order error)
- [x] Add Bank Account Management UI to Admin Settings tab
- [x] Update bank details to KASIKORNBANK 141-1-49966-5 ด.ช. ดรัณภพ นนท์นภัส
- [x] Clean database and reset all data
- [x] Create ZIP file with all project files and documentation

## Phase 14: Image Upload Bug Fixes
- [x] Fix product image not displaying in Shop page (shows lightning icon instead)
- [x] Fix product image not displaying in Product Detail page
- [x] Add image upload field to Edit Product modal
- [x] Verify image upload saves to database correctly


## Phase 15: Standalone Version (No Manus OAuth)
- [x] Create local authentication system (username/password)
- [x] Add seed data script with sample products
- [x] Create default admin user (admin/admin123)
- [x] Update login page to use local auth
- [x] Create clean database seed script
- [x] Export standalone ZIP file


## Phase 16: Multi-Language Support (i18n)
- [x] Install i18n library (react-i18next)
- [x] Create translation files (Thai, Chinese, English)
- [x] Create language context and provider
- [x] Add language switcher component to header
- [x] Translate all pages and components
- [x] Test language switching functionality


## Phase 17: Critical Fixes
- [x] Fix multi-language translation - all text must change when language is selected
- [x] Show cancel order reason in User Orders page
- [x] Add customer address and notes to Admin Orders page for shipping
- [x] Test all fixes


## Phase 18: User Orders Page Redesign
- [ ] Create delivery progress timeline UI (Pending → Confirmed → Processing → Shipped → Delivered)
- [ ] Add order summary sidebar (Total Amount, Payment Method, Status)
- [ ] Show cancelled state without timeline (only show Cancelled status with reason)
- [ ] Add Order Items section
- [ ] Support multi-language translations


## Phase 19: Wallet Deduction Bug Fix
- [x] Fix wallet balance not deducting when purchasing products
- [x] Add deductWalletBalance() function to db.ts
- [x] Update orders.create procedure to deduct wallet before creating order
- [x] Create purchase transaction record in wallet history
- [x] Test wallet deduction - verified balance decreases correctly


## Phase 20: Bug Fixes (Jan 22, 2026)
- [x] Fix Profile Edit - Save button not working (added updateProfile API)
- [x] Fix Admin Orders - Show Phone Number in order details (using shippingPhone field)
- [x] Fix Admin Orders - Show Order Notes (using notes field)
