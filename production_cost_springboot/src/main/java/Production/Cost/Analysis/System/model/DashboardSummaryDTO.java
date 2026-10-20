package Production.Cost.Analysis.System.model;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import Production.Cost.Analysis.System.entity.MachineProduction;
import Production.Cost.Analysis.System.entity.RawMaterial;

public class DashboardSummaryDTO {
    private long totalProducts;
    private long totalMaterials;
    private long lowStockCount;
    private long totalProductions;
    private long totalUnitsProduced;
    private long totalUnitsRejected;
    private BigDecimal totalProductionCosts;
    private BigDecimal totalMaterialCosts;
    private BigDecimal totalLabourCosts;
    private BigDecimal totalMachineCosts;
    private BigDecimal totalOtherExpenses;
    private BigDecimal totalRealizedRevenue;
    private BigDecimal totalRealizedProfit;
    private BigDecimal inventoryValue;
    private List<RawMaterial> lowStockList;
    private List<MachineProduction> recentProductions;
    private List<Map<String, Object>> monthlyTrends;

    public DashboardSummaryDTO() {}

    public long getTotalProducts() { return totalProducts; }
    public void setTotalProducts(long totalProducts) { this.totalProducts = totalProducts; }

    public long getTotalMaterials() { return totalMaterials; }
    public void setTotalMaterials(long totalMaterials) { this.totalMaterials = totalMaterials; }

    public long getLowStockCount() { return lowStockCount; }
    public void setLowStockCount(long lowStockCount) { this.lowStockCount = lowStockCount; }

    public long getTotalProductions() { return totalProductions; }
    public void setTotalProductions(long totalProductions) { this.totalProductions = totalProductions; }

    public long getTotalUnitsProduced() { return totalUnitsProduced; }
    public void setTotalUnitsProduced(long totalUnitsProduced) { this.totalUnitsProduced = totalUnitsProduced; }

    public long getTotalUnitsRejected() { return totalUnitsRejected; }
    public void setTotalUnitsRejected(long totalUnitsRejected) { this.totalUnitsRejected = totalUnitsRejected; }

    public BigDecimal getTotalProductionCosts() { return totalProductionCosts; }
    public void setTotalProductionCosts(BigDecimal totalProductionCosts) { this.totalProductionCosts = totalProductionCosts; }

    public BigDecimal getTotalMaterialCosts() { return totalMaterialCosts; }
    public void setTotalMaterialCosts(BigDecimal totalMaterialCosts) { this.totalMaterialCosts = totalMaterialCosts; }

    public BigDecimal getTotalLabourCosts() { return totalLabourCosts; }
    public void setTotalLabourCosts(BigDecimal totalLabourCosts) { this.totalLabourCosts = totalLabourCosts; }

    public BigDecimal getTotalMachineCosts() { return totalMachineCosts; }
    public void setTotalMachineCosts(BigDecimal totalMachineCosts) { this.totalMachineCosts = totalMachineCosts; }

    public BigDecimal getTotalOtherExpenses() { return totalOtherExpenses; }
    public void setTotalOtherExpenses(BigDecimal totalOtherExpenses) { this.totalOtherExpenses = totalOtherExpenses; }

    public BigDecimal getTotalRealizedRevenue() { return totalRealizedRevenue; }
    public void setTotalRealizedRevenue(BigDecimal totalRealizedRevenue) { this.totalRealizedRevenue = totalRealizedRevenue; }

    public BigDecimal getTotalRealizedProfit() { return totalRealizedProfit; }
    public void setTotalRealizedProfit(BigDecimal totalRealizedProfit) { this.totalRealizedProfit = totalRealizedProfit; }

    public BigDecimal getInventoryValue() { return inventoryValue; }
    public void setInventoryValue(BigDecimal inventoryValue) { this.inventoryValue = inventoryValue; }

    public List<RawMaterial> getLowStockList() { return lowStockList; }
    public void setLowStockList(List<RawMaterial> lowStockList) { this.lowStockList = lowStockList; }

    public List<MachineProduction> getRecentProductions() { return recentProductions; }
    public void setRecentProductions(List<MachineProduction> recentProductions) { this.recentProductions = recentProductions; }

    public List<Map<String, Object>> getMonthlyTrends() { return monthlyTrends; }
    public void setMonthlyTrends(List<Map<String, Object>> monthlyTrends) { this.monthlyTrends = monthlyTrends; }
}
