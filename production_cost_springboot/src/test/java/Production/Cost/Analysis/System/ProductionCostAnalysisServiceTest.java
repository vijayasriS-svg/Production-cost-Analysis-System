package Production.Cost.Analysis.System;

import Production.Cost.Analysis.System.entity.ProductionCostAnalysis;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import static org.junit.jupiter.api.Assertions.*;

public class ProductionCostAnalysisServiceTest {

    @Test
    void testRecalculateFormulas_CompleteCostAndProfitCycle() {
        ProductionCostAnalysis pca = new ProductionCostAnalysis();
        pca.setRawMaterialCost(new BigDecimal("800.00"));
        pca.setLabourCost(new BigDecimal("400.00"));
        pca.setMachineCost(new BigDecimal("300.00"));
        pca.setOtherExpenseCost(new BigDecimal("100.00"));
        pca.setProducedQuantity(4000);

        // Total Production Cost = 800 + 400 + 300 + 100 = 1600.00
        // Cost Per Unit = 1600.00 / 4000 = 0.4000
        pca.recalculateFormulas();

        assertEquals(0, new BigDecimal("1600.00").compareTo(pca.getTotalProductionCost()));
        assertEquals(0, new BigDecimal("0.4000").compareTo(pca.getCostPerUnit()));

        // When Sales are recorded:
        // Actual Sold: 3000 units @ $1.50
        // Revenue = 3000 * 1.50 = 4500.00
        // COGS = 3000 * 0.4000 = 1200.00
        // Profit = 4500.00 - 1200.00 = 3300.00
        // Profit Margin = (3300.00 / 4500.00) * 100 = 73.33%
        pca.setSalesRecorded(true);
        pca.setActualSoldQuantity(3000);
        pca.setSellingPricePerUnit(new BigDecimal("1.50"));
        pca.recalculateFormulas();

        assertEquals(0, new BigDecimal("4500.00").compareTo(pca.getRevenue()));
        assertEquals(0, new BigDecimal("1200.00").compareTo(pca.getCogs()));
        assertEquals(0, new BigDecimal("3300.00").compareTo(pca.getProfit()));
        assertEquals(0, new BigDecimal("73.33").compareTo(pca.getProfitMarginPct()));
    }

    @Test
    void testRecalculateFormulas_UnsoldInventorySafelyZeroed() {
        ProductionCostAnalysis pca = new ProductionCostAnalysis();
        pca.setRawMaterialCost(new BigDecimal("500.00"));
        pca.setLabourCost(new BigDecimal("200.00"));
        pca.setProducedQuantity(1000);
        pca.setSalesRecorded(false); // Unsold
        pca.setActualSoldQuantity(0);

        pca.recalculateFormulas();

        // Revenue & realized profit must NOT be fabricated for unsold units
        assertEquals(BigDecimal.ZERO, pca.getRevenue());
        assertEquals(BigDecimal.ZERO, pca.getProfit());
        assertEquals(BigDecimal.ZERO, pca.getProfitMarginPct());
        assertEquals(0, new BigDecimal("0.7000").compareTo(pca.getCostPerUnit()));
    }
}
