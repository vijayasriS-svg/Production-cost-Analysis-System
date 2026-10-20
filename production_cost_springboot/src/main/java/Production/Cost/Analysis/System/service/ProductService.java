package Production.Cost.Analysis.System.service;

import Production.Cost.Analysis.System.entity.Product;
import Production.Cost.Analysis.System.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public List<Product> getActiveProducts() {
        return productRepository.findByActiveTrue();
    }

    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    public Optional<Product> getProductByCode(String code) {
        return productRepository.findByProductCode(code);
    }

    public List<Product> searchProducts(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllProducts();
        }
        return productRepository.searchProducts(keyword.trim());
    }

    public Product saveProduct(Product product) {
        // Automatically generate unique product code if empty
        if (product.getProductCode() == null || product.getProductCode().trim().isEmpty()) {
            product.setProductCode(generateUniqueProductCode());
        }

        // Business validations
        if (product.getName() == null || product.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Product name cannot be empty.");
        }
        if (product.getStandardCost() == null || product.getStandardCost().signum() < 0) {
            throw new IllegalArgumentException("Standard cost cannot be negative.");
        }
        if (product.getStandardSellingPrice() == null || product.getStandardSellingPrice().signum() < 0) {
            throw new IllegalArgumentException("Standard selling price cannot be negative.");
        }

        return productRepository.save(product);
    }

    public void deleteProduct(Long id) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product with ID " + id + " does not exist."));
        // Soft delete or safe deactivate to protect historical production records
        p.setActive(false);
        productRepository.save(p);
    }

    public synchronized String generateUniqueProductCode() {
        long count = productRepository.count() + 1;
        String candidate;
        do {
            candidate = String.format("PRD-%03d", count++);
        } while (productRepository.existsByProductCode(candidate));
        return candidate;
    }
}
