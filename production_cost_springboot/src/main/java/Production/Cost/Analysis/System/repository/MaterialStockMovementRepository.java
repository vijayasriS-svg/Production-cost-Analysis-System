package Production.Cost.Analysis.System.repository;

import Production.Cost.Analysis.System.entity.MaterialStockMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MaterialStockMovementRepository extends JpaRepository<MaterialStockMovement, Long> {
    List<MaterialStockMovement> findByRawMaterialIdOrderByCreatedAtDesc(Long rawMaterialId);
    List<MaterialStockMovement> findByMachineProductionId(Long productionId);

    @Query("SELECT COALESCE(SUM(m.totalCost), 0) FROM MaterialStockMovement m WHERE m.machineProduction.id = :prodId")
    java.math.BigDecimal calculateTotalMaterialCostForProduction(@Param("prodId") Long prodId);

    boolean existsByRawMaterialIdAndMachineProductionIdAndMovementType(Long rawMaterialId, Long productionId, String movementType);
}
