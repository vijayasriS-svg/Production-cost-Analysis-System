package Production.Cost.Analysis.System.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_code", nullable = false, unique = true, length = 30)
    private String productCode;

    @NotBlank(message = "Product name cannot be empty")
    @Column(nullable = false, length = 150)
    private String name;

    @NotBlank(message = "Category is required")
    @Column(nullable = false, length = 80)
    private String category;

    @NotNull(message = "Standard cost is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Standard cost must be >= 0")
    @Column(name = "standard_cost", precision = 12, scale = 2, nullable = false)
    private BigDecimal standardCost = BigDecimal.ZERO;

    @NotNull(message = "Standard selling price is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Standard selling price must be >= 0")
    @Column(name = "standard_selling_price", precision = 12, scale = 2, nullable = false)
    private BigDecimal standardSellingPrice = BigDecimal.ZERO;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Product() {}

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getProductCode() { return productCode; }
    public void setProductCode(String productCode) { this.productCode = productCode; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public BigDecimal getStandardCost() { return standardCost; }
    public void setStandardCost(BigDecimal standardCost) { this.standardCost = standardCost; }

    public BigDecimal getStandardSellingPrice() { return standardSellingPrice; }
    public void setStandardSellingPrice(BigDecimal standardSellingPrice) { this.standardSellingPrice = standardSellingPrice; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
