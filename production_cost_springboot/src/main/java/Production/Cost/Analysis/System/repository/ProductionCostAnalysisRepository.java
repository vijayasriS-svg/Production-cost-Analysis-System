package Production.Cost.Analysis.System.repository;

import Production.Cost.Analysis.System.entity.ProductionCostAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductionCostAnalysisRepository extends JpaRepository<ProductionCostAnalysis, Long> {
    Optional<ProductionCostAnalysis> findByAnalysisCode(String analysisCode);
    Optional<ProductionCostAnalysis> findByMachineProductionId(Long productionId);
    boolean existsByAnalysisCode(String analysisCode);
    boolean existsByMachineProductionId(Long productionId);

    @Query("SELECT COALESCE(SUM(pca.totalProductionCost), 0) FROM ProductionCostAnalysis pca")
    java.math.BigDecimal calculateTotalProductionCostAll();

    @Query("SELECT COALESCE(SUM(pca.revenue), 0) FROM ProductionCostAnalysis pca WHERE pca.isSalesRecorded = true")
    java.math.BigDecimal calculateTotalRealizedRevenue();

    @Query("SELECT COALESCE(SUM(pca.profit), 0) FROM ProductionCostAnalysis pca WHERE pca.isSalesRecorded = true")
    java.math.BigDecimal calculateTotalRealizedProfit();

    @Query("SELECT pca FROM ProductionCostAnalysis pca ORDER BY pca.analysisDate DESC")
    List<ProductionCostAnalysis> findAllOrderByDateDesc();
}
