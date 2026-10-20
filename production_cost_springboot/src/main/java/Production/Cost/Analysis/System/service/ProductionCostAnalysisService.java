package Production.Cost.Analysis.System.service;

import Production.Cost.Analysis.System.entity.MachineProduction;
import Production.Cost.Analysis.System.entity.ProductionCostAnalysis;
import Production.Cost.Analysis.System.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ProductionCostAnalysisService {

    private final ProductionCostAnalysisRepository analysisRepository;
    private final MachineProductionRepository machineProductionRepository;
    private final MaterialStockMovementRepository stockMovementRepository;
    private final LabourCostRepository labourCostRepository;
    private final OtherExpenseRepository otherExpenseRepository;

    public ProductionCostAnalysisService(
            ProductionCostAnalysisRepository analysisRepository,
            MachineProductionRepository machineProductionRepository,
            MaterialStockMovementRepository stockMovementRepository,
            LabourCostRepository labourCostRepository,
            OtherExpenseRepository otherExpenseRepository) {
        this.analysisRepository = analysisRepository;
        this.machineProductionRepository = machineProductionRepository;
        this.stockMovementRepository = stockMovementRepository;
        this.labourCostRepository = labourCostRepository;
        this.otherExpenseRepository = otherExpenseRepository;
    }

    public List<ProductionCostAnalysis> getAllAnalyses() {
        return analysisRepository.findAllOrderByDateDesc();
    }

    public Optional<ProductionCostAnalysis> getAnalysisById(Long id) {
        return analysisRepository.findById(id);
    }

    public Optional<ProductionCostAnalysis> getAnalysisByProductionId(Long productionId) {
        return analysisRepository.findByMachineProductionId(productionId);
    }

    /**
     * Fully automates the cost calculation for a given production order
     * by pulling authoritative data directly from all connected modules:
     * - Raw Materials consumed from stock movements
     * - Labour records linked to this production
     * - Machine operational cost from machine hours & hourly rate
     * - Other expenses allocated to this production
     */
    public ProductionCostAnalysis calculateOrUpdateForProduction(Long productionId, Integer actualSoldQty, BigDecimal sellingPrice, String notes) {
        MachineProduction production = machineProductionRepository.findById(productionId)
                .orElseThrow(() -> new IllegalArgumentException("Production not found: " + productionId));

        ProductionCostAnalysis analysis = analysisRepository.findByMachineProductionId(productionId)
                .orElse(new ProductionCostAnalysis());

        if (analysis.getAnalysisCode() == null) {
            analysis.setAnalysisCode(generateUniqueAnalysisCode());
        }
        analysis.setMachineProduction(production);

        // Fetch live aggregated totals from connected database tables
        BigDecimal matCost = stockMovementRepository.calculateTotalMaterialCostForProduction(productionId);
        BigDecimal labCost = labourCostRepository.calculateTotalLabourCostForProduction(productionId);
        BigDecimal machCost = (production.getTotalMachineCost() != null) ? production.getTotalMachineCost() : BigDecimal.ZERO;
        BigDecimal expCost = otherExpenseRepository.calculateTotalExpensesForProduction(productionId);

        analysis.setRawMaterialCost(matCost != null ? matCost : BigDecimal.ZERO);
        analysis.setLabourCost(labCost != null ? labCost : BigDecimal.ZERO);
        analysis.setMachineCost(machCost != null ? machCost : BigDecimal.ZERO);
        analysis.setOtherExpenseCost(expCost != null ? expCost : BigDecimal.ZERO);
        analysis.setProducedQuantity(production.getQuantityProduced());

        // Set selling price (default from Product standard price if not supplied)
        if (sellingPrice != null && sellingPrice.compareTo(BigDecimal.ZERO) > 0) {
            analysis.setSellingPricePerUnit(sellingPrice);
        } else if (production.getProduct() != null && production.getProduct().getStandardSellingPrice() != null) {
            analysis.setSellingPricePerUnit(production.getProduct().getStandardSellingPrice());
        }

        // Handle actual sales data safely:
        // Unsold items are NOT treated as realized revenue
        if (actualSoldQty != null && actualSoldQty > 0) {
            analysis.setActualSoldQuantity(actualSoldQty);
            analysis.setSalesRecorded(true);
        } else {
            analysis.setActualSoldQuantity(0);
            analysis.setSalesRecorded(false);
        }

        analysis.setAnalysisDate(LocalDate.now());
        if (notes != null) analysis.setNotes(notes);

        // Trigger comprehensive formula recalculation
        analysis.recalculateFormulas();

        return analysisRepository.save(analysis);
    }

    public ProductionCostAnalysis saveAnalysis(ProductionCostAnalysis analysis) {
        if (analysis.getAnalysisCode() == null || analysis.getAnalysisCode().trim().isEmpty()) {
            analysis.setAnalysisCode(generateUniqueAnalysisCode());
        }
        analysis.recalculateFormulas();
        return analysisRepository.save(analysis);
    }

    public void deleteAnalysis(Long id) {
        analysisRepository.deleteById(id);
    }

    public synchronized String generateUniqueAnalysisCode() {
        int year = LocalDate.now().getYear();
        long count = analysisRepository.count() + 1;
        String candidate;
        do {
            candidate = String.format("PCA-%d-%03d", year, count++);
        } while (analysisRepository.existsByAnalysisCode(candidate));
        return candidate;
    }
}
