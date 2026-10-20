package Production.Cost.Analysis.System.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "raw_materials")
public class RawMaterial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "material_code", nullable = false, unique = true, length = 30)
    private String materialCode;

    @NotBlank(message = "Material name is required")
    @Column(nullable = false, length = 150)
    private String name;

    @NotBlank(message = "Category is required")
    @Column(nullable = false, length = 80)
    private String category;

    @NotBlank(message = "Unit of measurement is required")
    @Column(nullable = false, length = 20)
    private String unit; // Sheets, Reams, Kg, Liters, Rolls, etc.

    @NotNull(message = "Unit price is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Unit price cannot be negative")
    @Column(name = "unit_price", precision = 12, scale = 2, nullable = false)
    private BigDecimal unitPrice = BigDecimal.ZERO;

    @NotNull(message = "Opening stock is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Opening stock cannot be negative")
    @Column(name = "opening_stock", precision = 12, scale = 2, nullable = false)
    private BigDecimal openingStock = BigDecimal.ZERO;

    @NotNull(message = "Current stock is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Current stock cannot be negative")
    @Column(name = "current_stock", precision = 12, scale = 2, nullable = false)
    private BigDecimal currentStock = BigDecimal.ZERO;

    @NotNull(message = "Minimum stock alert is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Alert threshold cannot be negative")
    @Column(name = "minimum_stock_alert", precision = 12, scale = 2, nullable = false)
    private BigDecimal minimumStockAlert = BigDecimal.TEN;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public RawMaterial() {}

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public boolean isLowStock() {
        return this.currentStock != null && this.minimumStockAlert != null 
            && this.currentStock.compareTo(this.minimumStockAlert) <= 0;
    }

    public BigDecimal getTotalInventoryValue() {
        if (currentStock == null || unitPrice == null) return BigDecimal.ZERO;
        return currentStock.multiply(unitPrice);
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getMaterialCode() { return materialCode; }
    public void setMaterialCode(String materialCode) { this.materialCode = materialCode; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }

    public BigDecimal getOpeningStock() { return openingStock; }
    public void setOpeningStock(BigDecimal openingStock) { this.openingStock = openingStock; }

    public BigDecimal getCurrentStock() { return currentStock; }
    public void setCurrentStock(BigDecimal currentStock) { this.currentStock = currentStock; }

    public BigDecimal getMinimumStockAlert() { return minimumStockAlert; }
    public void setMinimumStockAlert(BigDecimal minimumStockAlert) { this.minimumStockAlert = minimumStockAlert; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
