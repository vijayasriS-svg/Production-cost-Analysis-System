package Production.Cost.Analysis.System.service;

import Production.Cost.Analysis.System.model.DashboardSummaryDTO;
import Production.Cost.Analysis.System.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final ProductRepository productRepository;
    private final RawMaterialRepository rawMaterialRepository;
    private final MachineProductionRepository machineProductionRepository;
    private final LabourCostRepository labourCostRepository;
    private final OtherExpenseRepository otherExpenseRepository;
    private final ProductionCostAnalysisRepository analysisRepository;
    private final DashboardRepository dashboardRepository;

    public DashboardService(
            ProductRepository productRepository,
            RawMaterialRepository rawMaterialRepository,
            MachineProductionRepository machineProductionRepository,
            LabourCostRepository labourCostRepository,
            OtherExpenseRepository otherExpenseRepository,
            ProductionCostAnalysisRepository analysisRepository,
            DashboardRepository dashboardRepository) {
        this.productRepository = productRepository;
        this.rawMaterialRepository = rawMaterialRepository;
        this.machineProductionRepository = machineProductionRepository;
        this.labourCostRepository = labourCostRepository;
        this.otherExpenseRepository = otherExpenseRepository;
        this.analysisRepository = analysisRepository;
        this.dashboardRepository = dashboardRepository;
    }

    public DashboardSummaryDTO getDashboardMetrics() {
        DashboardSummaryDTO dto = new DashboardSummaryDTO();

        dto.setTotalProducts(productRepository.countActiveProducts());
        dto.setTotalMaterials(rawMaterialRepository.count());
        dto.setLowStockCount(rawMaterialRepository.countLowStockMaterials());
        dto.setTotalProductions(machineProductionRepository.count());
        dto.setTotalUnitsProduced(machineProductionRepository.calculateTotalProducedQuantity());
        dto.setTotalUnitsRejected(machineProductionRepository.calculateTotalRejectedQuantity());

        dto.setTotalProductionCosts(analysisRepository.calculateTotalProductionCostAll());
        dto.setTotalLabourCosts(labourCostRepository.calculateTotalGlobalLabourCost());
        dto.setTotalMachineCosts(machineProductionRepository.calculateTotalMachineCosts());
        dto.setTotalOtherExpenses(otherExpenseRepository.calculateTotalGlobalExpenses());
        dto.setInventoryValue(rawMaterialRepository.calculateTotalInventoryValue());

        dto.setTotalRealizedRevenue(analysisRepository.calculateTotalRealizedRevenue());
        dto.setTotalRealizedProfit(analysisRepository.calculateTotalRealizedProfit());

        dto.setLowStockList(rawMaterialRepository.findLowStockMaterials());
        dto.setRecentProductions(machineProductionRepository.findTop10ByOrderByProductionDateDesc());

        try {
            List<Map<String, Object>> trends = dashboardRepository.getMonthlyTrends();
            dto.setMonthlyTrends(trends);
        } catch (Exception e) {
            dto.setMonthlyTrends(List.of());
        }

        return dto;
    }
}
