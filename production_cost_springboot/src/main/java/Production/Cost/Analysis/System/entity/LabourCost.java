package Production.Cost.Analysis.System.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "labour_costs")
public class LabourCost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "labour_code", nullable = false, unique = true, length = 30)
    private String labourCode;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "production_id")
    private MachineProduction machineProduction;

    @NotBlank(message = "Work description is required")
    @Column(name = "work_description", nullable = false, length = 200)
    private String workDescription;

    @NotNull(message = "Worker count is required")
    @Min(value = 1, message = "Worker count must be at least 1")
    @Column(name = "worker_count", nullable = false)
    private Integer workerCount = 1;

    @NotNull(message = "Hours worked is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Hours worked cannot be negative")
    @Column(name = "hours_worked", precision = 8, scale = 2, nullable = false)
    private BigDecimal hoursWorked = BigDecimal.ZERO;

    @NotNull(message = "Hourly rate is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Hourly rate cannot be negative")
    @Column(name = "hourly_rate", precision = 10, scale = 2, nullable = false)
    private BigDecimal hourlyRate = BigDecimal.ZERO;

    @NotBlank(message = "Calculation method is required")
    @Column(name = "calculation_method", nullable = false, length = 40)
    private String calculationMethod = "HOURLY_RATE"; // HOURLY_RATE, PIECE_RATE, FIXED_CONTRACT

    @Column(name = "total_labour_cost", precision = 12, scale = 2, nullable = false)
    private BigDecimal totalLabourCost = BigDecimal.ZERO;

    @NotNull(message = "Recorded date is required")
    @Column(name = "recorded_date", nullable = false)
    private LocalDate recordedDate;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public LabourCost() {}

    @PrePersist
    @PreUpdate
    public void calculateTotal() {
        if ("HOURLY_RATE".equalsIgnoreCase(calculationMethod)) {
            if (workerCount != null && hoursWorked != null && hourlyRate != null) {
                this.totalLabourCost = BigDecimal.valueOf(workerCount)
                        .multiply(hoursWorked)
                        .multiply(hourlyRate);
            }
        } else {
            // For fixed or manual rates, ensure it doesn't stay null
            if (this.totalLabourCost == null) {
                this.totalLabourCost = BigDecimal.ZERO;
            }
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getLabourCode() { return labourCode; }
    public void setLabourCode(String labourCode) { this.labourCode = labourCode; }

    public MachineProduction getMachineProduction() { return machineProduction; }
    public void setMachineProduction(MachineProduction machineProduction) { this.machineProduction = machineProduction; }

    public String getWorkDescription() { return workDescription; }
    public void setWorkDescription(String workDescription) { this.workDescription = workDescription; }

    public Integer getWorkerCount() { return workerCount; }
    public void setWorkerCount(Integer workerCount) { this.workerCount = workerCount; }

    public BigDecimal getHoursWorked() { return hoursWorked; }
    public void setHoursWorked(BigDecimal hoursWorked) { this.hoursWorked = hoursWorked; }

    public BigDecimal getHourlyRate() { return hourlyRate; }
    public void setHourlyRate(BigDecimal hourlyRate) { this.hourlyRate = hourlyRate; }

    public String getCalculationMethod() { return calculationMethod; }
    public void setCalculationMethod(String calculationMethod) { this.calculationMethod = calculationMethod; }

    public BigDecimal getTotalLabourCost() { return totalLabourCost; }
    public void setTotalLabourCost(BigDecimal totalLabourCost) { this.totalLabourCost = totalLabourCost; }

    public LocalDate getRecordedDate() { return recordedDate; }
    public void setRecordedDate(LocalDate recordedDate) { this.recordedDate = recordedDate; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
