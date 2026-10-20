package Production.Cost.Analysis.System.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "other_expenses")
public class OtherExpense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "expense_code", nullable = false, unique = true, length = 30)
    private String expenseCode;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "production_id")
    private MachineProduction machineProduction;

    @NotBlank(message = "Expense type is required")
    @Column(name = "expense_type", nullable = false, length = 60)
    private String expenseType; // Electricity, Transport, Packaging, Plates/Chemicals, Maintenance, Overhead

    @NotBlank(message = "Description is required")
    @Column(nullable = false, length = 255)
    private String description;

    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.01", message = "Quantity must be greater than 0")
    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal quantity = BigDecimal.ONE;

    @NotNull(message = "Unit price is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Unit price cannot be negative")
    @Column(name = "unit_price", precision = 12, scale = 2, nullable = false)
    private BigDecimal unitPrice = BigDecimal.ZERO;

    @Column(name = "total_expense_amount", precision = 12, scale = 2, nullable = false)
    private BigDecimal totalExpenseAmount = BigDecimal.ZERO;

    @NotNull(message = "Expense date is required")
    @Column(name = "expense_date", nullable = false)
    private LocalDate expenseDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public OtherExpense() {}

    @PrePersist
    @PreUpdate
    public void calculateTotal() {
        if (quantity != null && unitPrice != null) {
            this.totalExpenseAmount = quantity.multiply(unitPrice);
        } else {
            this.totalExpenseAmount = BigDecimal.ZERO;
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getExpenseCode() { return expenseCode; }
    public void setExpenseCode(String expenseCode) { this.expenseCode = expenseCode; }

    public MachineProduction getMachineProduction() { return machineProduction; }
    public void setMachineProduction(MachineProduction machineProduction) { this.machineProduction = machineProduction; }

    public String getExpenseType() { return expenseType; }
    public void setExpenseType(String expenseType) { this.expenseType = expenseType; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }

    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }

    public BigDecimal getTotalExpenseAmount() { return totalExpenseAmount; }
    public void setTotalExpenseAmount(BigDecimal totalExpenseAmount) { this.totalExpenseAmount = totalExpenseAmount; }

    public LocalDate getExpenseDate() { return expenseDate; }
    public void setExpenseDate(LocalDate expenseDate) { this.expenseDate = expenseDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
