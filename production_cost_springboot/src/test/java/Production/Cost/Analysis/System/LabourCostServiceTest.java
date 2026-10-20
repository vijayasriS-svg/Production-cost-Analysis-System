package Production.Cost.Analysis.System;

import Production.Cost.Analysis.System.entity.LabourCost;
import Production.Cost.Analysis.System.repository.LabourCostRepository;
import Production.Cost.Analysis.System.service.LabourCostService;
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
public class LabourCostServiceTest {

    @Mock
    private LabourCostRepository labourCostRepository;

    @InjectMocks
    private LabourCostService labourCostService;

    @Test
    void testSaveLabourCost_CalculatesHourlyTotalAutomatically() {
        LabourCost lc = new LabourCost();
        lc.setWorkDescription("Press setup & plate alignment");
        lc.setWorkerCount(3);
        lc.setHoursWorked(new BigDecimal("4.5"));
        lc.setHourlyRate(new BigDecimal("20.00"));
        lc.setCalculationMethod("HOURLY_RATE");

        when(labourCostRepository.count()).thenReturn(10L);
        when(labourCostRepository.existsByLabourCode(anyString())).thenReturn(false);
        when(labourCostRepository.save(any(LabourCost.class))).thenAnswer(i -> i.getArgument(0));

        LabourCost saved = labourCostService.saveLabourCost(lc);

        // 3 workers * 4.5 hours * $20.00 = $270.00
        assertEquals(0, new BigDecimal("270.00").compareTo(saved.getTotalLabourCost()));
        assertNotNull(saved.getLabourCode());
    }
}
