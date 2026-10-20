package Production.Cost.Analysis.System.repository;

import Production.Cost.Analysis.System.entity.MachineProduction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface MachineProductionRepository extends JpaRepository<MachineProduction, Long> {
    Optional<MachineProduction> findByProductionCode(String productionCode);
    boolean existsByProductionCode(String productionCode);
    List<MachineProduction> findTop10ByOrderByProductionDateDesc();

    @Query("SELECT mp FROM MachineProduction mp WHERE LOWER(mp.productionCode) LIKE LOWER(CONCAT('%', :kw, '%')) " +
           "OR LOWER(mp.batchNumber) LIKE LOWER(CONCAT('%', :kw, '%')) " +
           "OR LOWER(mp.product.name) LIKE LOWER(CONCAT('%', :kw, '%'))")
    List<MachineProduction> searchProductions(@Param("kw") String keyword);

    @Query("SELECT COALESCE(SUM(mp.quantityProduced), 0) FROM MachineProduction mp")
    long calculateTotalProducedQuantity();

    @Query("SELECT COALESCE(SUM(mp.quantityRejected), 0) FROM MachineProduction mp")
    long calculateTotalRejectedQuantity();

    @Query("SELECT COALESCE(SUM(mp.totalMachineCost), 0) FROM MachineProduction mp")
    java.math.BigDecimal calculateTotalMachineCosts();
}
