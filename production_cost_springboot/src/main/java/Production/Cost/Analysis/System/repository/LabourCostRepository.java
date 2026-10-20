package Production.Cost.Analysis.System.repository;

import Production.Cost.Analysis.System.entity.LabourCost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface LabourCostRepository extends JpaRepository<LabourCost, Long> {
    Optional<LabourCost> findByLabourCode(String labourCode);
    boolean existsByLabourCode(String labourCode);
    List<LabourCost> findByMachineProductionId(Long productionId);

    @Query("SELECT COALESCE(SUM(lc.totalLabourCost), 0) FROM LabourCost lc WHERE lc.machineProduction.id = :prodId")
    java.math.BigDecimal calculateTotalLabourCostForProduction(@Param("prodId") Long prodId);

    @Query("SELECT COALESCE(SUM(lc.totalLabourCost), 0) FROM LabourCost lc")
    java.math.BigDecimal calculateTotalGlobalLabourCost();

    @Query("SELECT lc FROM LabourCost lc WHERE LOWER(lc.workDescription) LIKE LOWER(CONCAT('%', :kw, '%')) " +
           "OR LOWER(lc.labourCode) LIKE LOWER(CONCAT('%', :kw, '%'))")
    List<LabourCost> searchLabour(@Param("kw") String keyword);
}
