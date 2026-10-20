package Production.Cost.Analysis.System.repository;

import Production.Cost.Analysis.System.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findByProductCode(String productCode);
    List<Product> findByActiveTrue();
    boolean existsByProductCode(String productCode);

    @Query("SELECT p FROM Product p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(p.productCode) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(p.category) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Product> searchProducts(@Param("keyword") String keyword);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.active = true")
    long countActiveProducts();
}
