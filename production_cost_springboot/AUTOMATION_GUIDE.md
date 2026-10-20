# Seagull Printers - Automation Architecture & Mathematical Formulas

This document details the automated algorithms, transactional safety guarantees, and business logic implemented in the Seagull Printers system.

---

## 1. Automated Mathematical Formulas

### 1.1 Total Production Cost
```
Total Production Cost = Raw Material Cost + Labour Cost + Machine Cost + Other Expenses
```
- **Authoritative Source**: Aggregated from database tables (`material_stock_movements`, `labour_costs`, `machine_productions`, `other_expenses`) filtered by `production_id`.

### 1.2 Cost Per Unit
```
Cost Per Unit = Total Production Cost / Produced Quantity
```
- Handled safely when `Produced Quantity == 0` (falls back to `0.0000` to prevent division by zero).

### 1.3 Revenue & Cost of Goods Sold (COGS)
```
Realized Revenue = Actual Sold Quantity × Selling Price Per Unit
COGS = Cost Per Unit × Actual Sold Quantity
```
- **Unsold Inventory Guard**: Unsold stock is NOT counted as revenue. If `isSalesRecorded == false` or `Actual Sold Quantity == 0`, revenue and realized profit are set to `0.00` rather than displaying unearned paper figures.

### 1.4 Realized Profit and Profit Margin
```
Profit = Realized Revenue - COGS
Profit Margin (%) = (Profit / Realized Revenue) × 100
```
- Verified mathematically with 2-decimal half-up precision.

---

## 2. Stock Management & Inventory Automation Rules
1. **Unique Code Generation**: `PRD-xxx`, `MAT-xxx`, `PROD-YYYY-xxx`, `LBR-xxxx`, `EXP-xxxx`, `PCA-YYYY-xxx` are automatically incremented and validated for uniqueness before saving.
2. **Negative Stock Prevention**: When deducting materials for a production run, the system checks:
   ```java
   if (material.getCurrentStock().compareTo(quantity) < 0) {
       throw new IllegalStateException("Insufficient stock for material...");
   }
   ```
3. **Duplicate Deduction Guard**: The system checks `stockMovementRepository.existsByRawMaterialIdAndMachineProductionIdAndMovementType(...)` to prevent accidental double-clicks or duplicate deductions of the same raw material for the same batch.
4. **Automatic Low-Stock Trigger**: `isLowStock()` evaluates `currentStock <= minimumStockAlert`. A dashboard warning and red status badge are immediately triggered.
5. **Database Transactional Consistency**: All stock updates and consumption recordings run under Spring's `@Transactional` boundary; if an error occurs during allocation, all database updates rollback completely.
