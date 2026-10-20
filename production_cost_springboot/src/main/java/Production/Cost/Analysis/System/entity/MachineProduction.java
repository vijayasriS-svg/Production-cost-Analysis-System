package Production.Cost.Analysis.System.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "machine_productions")
public class MachineProduction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "production_code", nullable = false, unique = true, length = 30)
    private String productionCode;

    @NotNull(message = "Product selection is required")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @NotBlank(message = "Batch number is required")
    @Column(name = "batch_number", nullable = false, length = 50)
    private String batchNumber;

    @NotNull(message = "Produced quantity is required")
    @Min(value = 1, message = "Produced quantity must be at least 1")
    @Column(name = "quantity_produced", nullable = false)
    private Integer quantityProduced;

    @Min(value = 0, message = "Rejected quantity cannot be negative")
    @Column(name = "quantity_rejected", nullable = false)
    private Integer quantityRejected = 0;

    @Column(name = "net_good_quantity", nullable = false)
    private Integer netGoodQuantity;

    @NotBlank(message = "Machine name is required")
    @Column(name = "machine_name", nullable = false, length = 100)
    private String machineName;

    @NotNull(message = "Machine hours is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Machine hours must be >= 0")
    @Column(name = "machine_hours", precision = 8, scale = 2, nullable = false)
    private BigDecimal machineHours = BigDecimal.ZERO;

    @NotNull(message = "Machine hourly rate is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Machine hourly rate must be >= 0")
    @Column(name = "machine_hourly_rate", precision = 10, scale = 2, nullable = false)
    private BigDecimal machineHourlyRate = BigDecimal.ZERO;

    @Column(name = "total_machine_cost", precision = 12, scale = 2, nullable = false)
    private BigDecimal totalMachineCost = BigDecimal.ZERO;

    @NotNull(message = "Production date is required")
    @Column(name = "production_date", nullable = false)
    private LocalDate productionDate;

    @Column(nullable = false, length = 30)
    private String status = "COMPLETED"; // SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public MachineProduction() {}

    @PrePersist
    @PreUpdate
    public void calculateDerivedValues() {
        if (quantityProduced == null) quantityProduced = 0;
        if (quantityRejected == null) quantityRejected = 0;
        this.netGoodQuantity = Math.max(0, quantityProduced - quantityRejected);

        if (machineHours != null && machineHourlyRate != null) {
            this.totalMachineCost = machineHours.multiply(machineHourlyRate);
        } else {
            this.totalMachineCost = BigDecimal.ZERO;
        }
    }

    public double getRejectionRatePercentage() {
        if (quantityProduced == null || quantityProduced == 0) return 0.0;
        return ((double) (quantityRejected != null ? quantityRejected : 0) / quantityProduced) * 100.0;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getProductionCode() { return productionCode; }
    public void setProductionCode(String productionCode) { this.productionCode = productionCode; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public String getBatchNumber() { return batchNumber; }
    public void setBatchNumber(String batchNumber) { this.batchNumber = batchNumber; }

    public Integer getQuantityProduced() { return quantityProduced; }
    public void setQuantityProduced(Integer quantityProduced) { this.quantityProduced = quantityProduced; }

    public Integer getQuantityRejected() { return quantityRejected; }
    public void setQuantityRejected(Integer quantityRejected) { this.quantityRejected = quantityRejected; }

    public Integer getNetGoodQuantity() { return netGoodQuantity; }
    public void setNetGoodQuantity(Integer netGoodQuantity) { this.netGoodQuantity = netGoodQuantity; }

    public String getMachineName() { return machineName; }
    public void setMachineName(String machineName) { this.machineName = machineName; }

    public BigDecimal getMachineHours() { return machineHours; }
    public void setMachineHours(BigDecimal machineHours) { this.machineHours = machineHours; }

    public BigDecimal getMachineHourlyRate() { return machineHourlyRate; }
    public void setMachineHourlyRate(BigDecimal machineHourlyRate) { this.machineHourlyRate = machineHourlyRate; }

    public BigDecimal getTotalMachineCost() { return totalMachineCost; }
    public void setTotalMachineCost(BigDecimal totalMachineCost) { this.totalMachineCost = totalMachineCost; }

    public LocalDate getProductionDate() { return productionDate; }
    public void setProductionDate(LocalDate productionDate) { this.productionDate = productionDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
