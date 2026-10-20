package Production.Cost.Analysis.System;

import Production.Cost.Analysis.System.entity.MaterialStockMovement;
import Production.Cost.Analysis.System.entity.MachineProduction;
import Production.Cost.Analysis.System.entity.RawMaterial;
import Production.Cost.Analysis.System.repository.MaterialStockMovementRepository;
import Production.Cost.Analysis.System.repository.RawMaterialRepository;
import Production.Cost.Analysis.System.service.RawMaterialService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.math.BigDecimal;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class RawMaterialServiceTest {

    @Mock
    private RawMaterialRepository rawMaterialRepository;

    @Mock
    private MaterialStockMovementRepository stockMovementRepository;

    @InjectMocks
    private RawMaterialService rawMaterialService;

    private RawMaterial material;
    private MachineProduction production;

    @BeforeEach
    void setUp() {
        material = new RawMaterial();
        material.setId(10L);
        material.setMaterialCode("MAT-001");
        material.setName("Gloss Paper 150gsm");
        material.setCategory("Paper");
        material.setUnit("Reams");
        material.setUnitPrice(new BigDecimal("40.00"));
        material.setCurrentStock(new BigDecimal("100.00"));
        material.setMinimumStockAlert(new BigDecimal("20.00"));

        production = new MachineProduction();
        production.setId(100L);
        production.setProductionCode("PROD-2024-001");
    }

    @Test
    void testConsumeForProduction_SuccessAndStockReduction() {
        when(stockMovementRepository.existsByRawMaterialIdAndMachineProductionIdAndMovementType(10L, 100L, "PRODUCTION_CONSUMPTION"))
                .thenReturn(false);
        when(rawMaterialRepository.findById(10L)).thenReturn(Optional.of(material));
        when(stockMovementRepository.save(any(MaterialStockMovement.class))).thenAnswer(i -> i.getArgument(0));

        MaterialStockMovement mov = rawMaterialService.consumeForProduction(
                10L, production, new BigDecimal("25.00"), "Used 25 reams for batch print"
        );

        assertNotNull(mov);
        assertEquals(new BigDecimal("75.00"), material.getCurrentStock());
        assertEquals(new BigDecimal("1000.00"), mov.getTotalCost());
        verify(rawMaterialRepository).save(material);
        verify(stockMovementRepository).save(any(MaterialStockMovement.class));
    }

    @Test
    void testConsumeForProduction_PreventsNegativeStock() {
        when(stockMovementRepository.existsByRawMaterialIdAndMachineProductionIdAndMovementType(10L, 100L, "PRODUCTION_CONSUMPTION"))
                .thenReturn(false);
        when(rawMaterialRepository.findById(10L)).thenReturn(Optional.of(material));

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> {
            rawMaterialService.consumeForProduction(10L, production, new BigDecimal("150.00"), "Exceeding stock");
        });

        assertTrue(ex.getMessage().contains("Insufficient stock"));
        verify(rawMaterialRepository, never()).save(any(RawMaterial.class));
    }

    @Test
    void testConsumeForProduction_PreventsDuplicateDeduction() {
        when(stockMovementRepository.existsByRawMaterialIdAndMachineProductionIdAndMovementType(10L, 100L, "PRODUCTION_CONSUMPTION"))
                .thenReturn(true);

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> {
            rawMaterialService.consumeForProduction(10L, production, new BigDecimal("10.00"), "Duplicate attempt");
        });

        assertTrue(ex.getMessage().contains("already been deducted"));
        verify(rawMaterialRepository, never()).findById(anyLong());
    }

    @Test
    void testLowStockAlertIndicator() {
        material.setCurrentStock(new BigDecimal("15.00")); // Below threshold of 20
        assertTrue(material.isLowStock());

        material.setCurrentStock(new BigDecimal("25.00")); // Above threshold of 20
        assertFalse(material.isLowStock());
    }
}
