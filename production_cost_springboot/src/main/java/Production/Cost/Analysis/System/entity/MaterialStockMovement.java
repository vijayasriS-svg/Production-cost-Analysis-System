package Production.Cost.Analysis.System.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "material_stock_movements")
public class MaterialStockMovement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "material_id", nullable = false)
    private RawMaterial rawMaterial;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "production_id")
    private MachineProduction machineProduction;

    @Column(name = "movement_type", nullable = false, length = 30)
    private String movementType; // PURCHASE, PRODUCTION_CONSUMPTION, ADJUSTMENT, OPENING

    @Column(precision = 12, scale = 2, nullable = false)
    private BigDecimal quantity;

    @Column(name = "unit_price", precision = 12, scale = 2, nullable = false)
    private BigDecimal unitPrice;

    @Column(name = "total_cost", precision = 12, scale = 2, nullable = false)
    private BigDecimal totalCost;

    @Column(name = "reference_note", length = 255)
    private String referenceNote;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public MaterialStockMovement() {}

    public MaterialStockMovement(RawMaterial rawMaterial, MachineProduction machineProduction,
                                 String movementType, BigDecimal quantity, BigDecimal unitPrice,
                                 BigDecimal totalCost, String referenceNote) {
        this.rawMaterial = rawMaterial;
        this.machineProduction = machineProduction;
        this.movementType = movementType;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.totalCost = totalCost;
        this.referenceNote = referenceNote;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public RawMaterial getRawMaterial() { return rawMaterial; }
    public void setRawMaterial(RawMaterial rawMaterial) { this.rawMaterial = rawMaterial; }

    public MachineProduction getMachineProduction() { return machineProduction; }
    public void setMachineProduction(MachineProduction machineProduction) { this.machineProduction = machineProduction; }

    public String getMovementType() { return movementType; }
    public void setMovementType(String movementType) { this.movementType = movementType; }

    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }

    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }

    public BigDecimal getTotalCost() { return totalCost; }
    public void setTotalCost(BigDecimal totalCost) { this.totalCost = totalCost; }

    public String getReferenceNote() { return referenceNote; }
    public void setReferenceNote(String referenceNote) { this.referenceNote = referenceNote; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
