package Production.Cost.Analysis.System.repository;

import Production.Cost.Analysis.System.entity.RawMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface RawMaterialRepository extends JpaRepository<RawMaterial, Long> {
    Optional<RawMaterial> findByMaterialCode(String materialCode);
    boolean existsByMaterialCode(String materialCode);

    @Query("SELECT r FROM RawMaterial r WHERE r.currentStock <= r.minimumStockAlert ORDER BY r.currentStock ASC")
    List<RawMaterial> findLowStockMaterials();

    @Query("SELECT COUNT(r) FROM RawMaterial r WHERE r.currentStock <= r.minimumStockAlert")
    long countLowStockMaterials();

    @Query("SELECT r FROM RawMaterial r WHERE LOWER(r.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(r.materialCode) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(r.category) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<RawMaterial> searchMaterials(@Param("keyword") String keyword);

    @Query("SELECT COALESCE(SUM(r.currentStock * r.unitPrice), 0) FROM RawMaterial r")
    java.math.BigDecimal calculateTotalInventoryValue();
}
