package Production.Cost.Analysis.System;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@ActiveProfiles("test")
public class ProductionCostSystemApplicationTests {

    @Test
    void contextLoads() {
        // Confirms Spring Boot application context bootstraps successfully
        assertTrue(true, "Application context loaded successfully");
    }
}
