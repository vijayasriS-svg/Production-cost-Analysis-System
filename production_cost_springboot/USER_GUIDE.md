# Seagull Printers - Beginner-Friendly User Guide

Welcome to the **Seagull Printers Production Cost Analysis System**! This guide walks you through every daily task across all eight modules.

---

### Step 1: Logging In
1. Navigate to `http://localhost:8080`.
2. Enter username `admin` and password `seagull123`.
3. Click **Sign In to System**. You will be directed to the **Executive Dashboard**.

---

### Step 2: Adding Print Products
1. Click **Product Catalog** in the left sidebar.
2. Click **Add New Product**.
3. Notice that the system automatically generates a unique code like `PRD-106`.
4. Enter Product Name (e.g., `Glossy Event Posters A2`), Category (`Marketing Collateral`), Standard Cost (`$1.10`), and Standard Selling Price (`$3.50`).
5. Click **Save Product**.

---

### Step 3: Managing Raw Materials & Low-Stock Alerts
1. Click **Raw Materials & Stock** in the sidebar.
2. You will see current stock levels, unit prices, and status badges.
3. If any stock level drops below its minimum alert threshold, an orange **LOW STOCK** badge will appear.
4. **Recording a Purchase Order**: Click **Stock Purchase Order** at the top right, pick the material, enter quantity added, and click **Add to Stock**. The ledger will record an audit trail.

---

### Step 4: Recording a Machine Production Order
1. Click **Machine Production** &rarr; **New Production Run**.
2. Select the product (e.g., `Corporate Tri-fold Brochure`).
3. Enter Total Quantity Produced (e.g. `5,000`) and Quantity Rejected (e.g. `150`).
4. Notice that **Net Good Quantity** automatically updates to `4,850` in green!
5. Enter Machine Hours (e.g. `6.5`) and Machine Hourly Rate (`$45.00`). Total Machine Cost automatically previews `$292.50`.
6. Click **Save Production Run**.
7. In the order details page, under **Deduct Raw Material**, select the paper or ink used and click **Deduct from Inventory**. The system automatically reduces current inventory and prevents negative stock!

---

### Step 5: Recording Labour Costs
1. Click **Labour Costs** &rarr; **Record Labour Work**.
2. Link the work to your Production Order from the dropdown.
3. Enter Worker Count (`2`), Hours Worked (`6.5`), and Hourly Rate (`$22.00`).
4. The live calculator preview instantly computes `$286.00`.
5. Click **Save Labour Record**.

---

### Step 6: Recording Other Expenses
1. Click **Other Expenses** &rarr; **Add New Expense**.
2. Choose Expense Type (e.g. `Electricity`, `Transport`, `Packaging`).
3. Link it to the Production Order, enter quantity and unit cost.
4. Click **Save Expense**.

---

### Step 7: Automated Cost & Profit Analysis
1. Click **Cost & Profit Analysis** in the sidebar.
2. Under **One-Click Auto Pull & Calculate**, pick your production run from the dropdown.
3. Enter Actual Sold Quantity (`4,850`) and Selling Price (`$2.20`).
4. Click **Run Analysis**.
5. The system pulls all four cost centers from the database:
   - Raw Material Cost
   - Direct Labour Cost
   - Machine Operational Cost
   - Other Expenses
6. It automatically calculates:
   - Total Cost: `$1,761.50`
   - Cost Per Unit: `$0.3523`
   - Realized Revenue: `$10,670.00`
   - COGS: `$1,708.66`
   - Net Profit: `$8,961.34`
   - Margin: `83.99%`
7. Click **Verify & Save Analysis** to record the financial ledger.

---

### Step 8: Checking the Executive Dashboard
Return to **Dashboard** to see updated KPIs, live charts, low-stock warnings, and recent order history!
