package Production.Cost.Analysis.System;

import Production.Cost.Analysis.System.entity.MachineProduction;
import Production.Cost.Analysis.System.repository.MachineProductionRepository;
import Production.Cost.Analysis.System.service.MachineProductionService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.math.BigDecimal;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class MachineProductionServiceTest {

    @Mock
    private MachineProductionRepository machineProductionRepository;

    @InjectMocks
    private MachineProductionService machineProductionService;

    @Test
    void testSaveProduction_CalculatesNetGoodQuantityAndMachineCost() {
        MachineProduction mp = new MachineProduction();
        mp.setBatchNumber("BATCH-101");
        mp.setQuantityProduced(5000);
        mp.setQuantityRejected(150);
        mp.setMachineName("Heidelberg Speedmaster");
        mp.setMachineHours(new BigDecimal("8.0"));
        mp.setMachineHourlyRate(new BigDecimal("40.00"));

        when(machineProductionRepository.count()).thenReturn(1L);
        when(machineProductionRepository.existsByProductionCode(anyString())).thenReturn(false);
        when(machineProductionRepository.save(any(MachineProduction.class))).thenAnswer(i -> i.getArgument(0));

        MachineProduction saved = machineProductionService.saveProduction(mp);

        // Net Good = 5000 - 150 = 4850
        assertEquals(4850, saved.getNetGoodQuantity());
        // Machine Cost = 8.0 * 40.00 = 320.00
        assertEquals(0, new BigDecimal("320.00").compareTo(saved.getTotalMachineCost()));
    }

    @Test
    void testSaveProduction_RejectsIfRejectedExceedsProduced() {
        MachineProduction mp = new MachineProduction();
        mp.setQuantityProduced(100);
        mp.setQuantityRejected(120); // Invalid

        assertThrows(IllegalArgumentException.class, () -> {
            machineProductionService.saveProduction(mp);
        });
    }
}
