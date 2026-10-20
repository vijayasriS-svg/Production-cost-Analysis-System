package Production.Cost.Analysis.System.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "production_cost_analyses")
public class ProductionCostAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "analysis_code", nullable = false, unique = true, length = 30)
    private String analysisCode;

    @NotNull(message = "Production reference is required")
    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "production_id", nullable = false, unique = true)
    private MachineProduction machineProduction;

    @Column(name = "raw_material_cost", precision = 14, scale = 2, nullable = false)
    private BigDecimal rawMaterialCost = BigDecimal.ZERO;

    @Column(name = "labour_cost", precision = 14, scale = 2, nullable = false)
    private BigDecimal labourCost = BigDecimal.ZERO;

    @Column(name = "machine_cost", precision = 14, scale = 2, nullable = false)
    private BigDecimal machineCost = BigDecimal.ZERO;

    @Column(name = "other_expense_cost", precision = 14, scale = 2, nullable = false)
    private BigDecimal otherExpenseCost = BigDecimal.ZERO;

    @Column(name = "total_production_cost", precision = 14, scale = 2, nullable = false)
    private BigDecimal totalProductionCost = BigDecimal.ZERO;

    @Column(name = "produced_quantity", nullable = false)
    private Integer producedQuantity = 0;

    @Column(name = "cost_per_unit", precision = 12, scale = 4, nullable = false)
    private BigDecimal costPerUnit = BigDecimal.ZERO;

    @Column(name = "actual_sold_quantity", nullable = false)
    private Integer actualSoldQuantity = 0;

    @Column(name = "selling_price_per_unit", precision = 12, scale = 2, nullable = false)
    private BigDecimal sellingPricePerUnit = BigDecimal.ZERO;

    @Column(precision = 14, scale = 2, nullable = false)
    private BigDecimal revenue = BigDecimal.ZERO;

    @Column(precision = 14, scale = 2, nullable = false)
    private BigDecimal cogs = BigDecimal.ZERO;

    @Column(precision = 14, scale = 2, nullable = false)
    private BigDecimal profit = BigDecimal.ZERO;

    @Column(name = "profit_margin_pct", precision = 6, scale = 2, nullable = false)
    private BigDecimal profitMarginPct = BigDecimal.ZERO;

    @Column(name = "is_sales_recorded", nullable = false)
    private boolean isSalesRecorded = false;

    @NotNull(message = "Analysis date is required")
    @Column(name = "analysis_date", nullable = false)
    private LocalDate analysisDate;

    @Column(nullable = false, length = 30)
    private String status = "CALCULATED";

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public ProductionCostAnalysis() {}

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        recalculateFormulas();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
        recalculateFormulas();
    }

    /**
     * Executes authoritative automated formula calculations according to specifications:
     * Total Production Cost = Raw Material Cost + Labour Cost + Machine Cost + Other Expenses
     * Cost Per Unit = Total Production Cost / Produced Quantity (or 0 if quantity is 0)
     * Revenue = Actual Sold Quantity * Selling Price Per Unit (only if sales are recorded)
     * COGS = Cost Per Unit * Actual Sold Quantity
     * Profit = Revenue - COGS
     * Profit Margin (%) = (Profit / Revenue) * 100
     */
    public void recalculateFormulas() {
        if (rawMaterialCost == null) rawMaterialCost = BigDecimal.ZERO;
        if (labourCost == null) labourCost = BigDecimal.ZERO;
        if (machineCost == null) machineCost = BigDecimal.ZERO;
        if (otherExpenseCost == null) otherExpenseCost = BigDecimal.ZERO;
        if (sellingPricePerUnit == null) sellingPricePerUnit = BigDecimal.ZERO;
        if (actualSoldQuantity == null) actualSoldQuantity = 0;

        // 1. Total Production Cost
        this.totalProductionCost = rawMaterialCost.add(labourCost).add(machineCost).add(otherExpenseCost);

        // 2. Cost Per Unit
        if (producedQuantity != null && producedQuantity > 0) {
            this.costPerUnit = this.totalProductionCost.divide(BigDecimal.valueOf(producedQuantity), 4, RoundingMode.HALF_UP);
        } else {
            this.costPerUnit = BigDecimal.ZERO;
        }

        // 3. Sales, Revenue, COGS, and Profit (Handling unsold / projected safely)
        if (isSalesRecorded && actualSoldQuantity > 0 && sellingPricePerUnit.compareTo(BigDecimal.ZERO) > 0) {
            this.revenue = sellingPricePerUnit.multiply(BigDecimal.valueOf(actualSoldQuantity)).setScale(2, RoundingMode.HALF_UP);
            this.cogs = this.costPerUnit.multiply(BigDecimal.valueOf(actualSoldQuantity)).setScale(2, RoundingMode.HALF_UP);
            this.profit = this.revenue.subtract(this.cogs).setScale(2, RoundingMode.HALF_UP);

            if (this.revenue.compareTo(BigDecimal.ZERO) > 0) {
                this.profitMarginPct = this.profit.multiply(BigDecimal.valueOf(100))
                        .divide(this.revenue, 2, RoundingMode.HALF_UP);
            } else {
                this.profitMarginPct = BigDecimal.ZERO;
            }
        } else {
            // Unsold inventory is not counted as realized revenue
            this.revenue = BigDecimal.ZERO;
            this.cogs = BigDecimal.ZERO;
            this.profit = BigDecimal.ZERO;
            this.profitMarginPct = BigDecimal.ZERO;
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getAnalysisCode() { return analysisCode; }
    public void setAnalysisCode(String analysisCode) { this.analysisCode = analysisCode; }

    public MachineProduction getMachineProduction() { return machineProduction; }
    public void setMachineProduction(MachineProduction machineProduction) { this.machineProduction = machineProduction; }

    public BigDecimal getRawMaterialCost() { return rawMaterialCost; }
    public void setRawMaterialCost(BigDecimal rawMaterialCost) { this.rawMaterialCost = rawMaterialCost; }

    public BigDecimal getLabourCost() { return labourCost; }
    public void setLabourCost(BigDecimal labourCost) { this.labourCost = labourCost; }

    public BigDecimal getMachineCost() { return machineCost; }
    public void setMachineCost(BigDecimal machineCost) { this.machineCost = machineCost; }

    public BigDecimal getOtherExpenseCost() { return otherExpenseCost; }
    public void setOtherExpenseCost(BigDecimal otherExpenseCost) { this.otherExpenseCost = otherExpenseCost; }

    public BigDecimal getTotalProductionCost() { return totalProductionCost; }
    public void setTotalProductionCost(BigDecimal totalProductionCost) { this.totalProductionCost = totalProductionCost; }

    public Integer getProducedQuantity() { return producedQuantity; }
    public void setProducedQuantity(Integer producedQuantity) { this.producedQuantity = producedQuantity; }

    public BigDecimal getCostPerUnit() { return costPerUnit; }
    public void setCostPerUnit(BigDecimal costPerUnit) { this.costPerUnit = costPerUnit; }

    public Integer getActualSoldQuantity() { return actualSoldQuantity; }
    public void setActualSoldQuantity(Integer actualSoldQuantity) { this.actualSoldQuantity = actualSoldQuantity; }

    public BigDecimal getSellingPricePerUnit() { return sellingPricePerUnit; }
    public void setSellingPricePerUnit(BigDecimal sellingPricePerUnit) { this.sellingPricePerUnit = sellingPricePerUnit; }

    public BigDecimal getRevenue() { return revenue; }
    public void setRevenue(BigDecimal revenue) { this.revenue = revenue; }

    public BigDecimal getCogs() { return cogs; }
    public void setCogs(BigDecimal cogs) { this.cogs = cogs; }

    public BigDecimal getProfit() { return profit; }
    public void setProfit(BigDecimal profit) { this.profit = profit; }

    public BigDecimal getProfitMarginPct() { return profitMarginPct; }
    public void setProfitMarginPct(BigDecimal profitMarginPct) { this.profitMarginPct = profitMarginPct; }

    public boolean isSalesRecorded() { return isSalesRecorded; }
    public void setSalesRecorded(boolean salesRecorded) { isSalesRecorded = salesRecorded; }

    public LocalDate getAnalysisDate() { return analysisDate; }
    public void setAnalysisDate(LocalDate analysisDate) { this.analysisDate = analysisDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
