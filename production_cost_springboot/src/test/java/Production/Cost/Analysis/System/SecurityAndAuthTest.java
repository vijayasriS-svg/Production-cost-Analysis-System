package Production.Cost.Analysis.System;

import Production.Cost.Analysis.System.security.WerkzeugScriptPasswordEncoder;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class SecurityAndAuthTest {

    private final WerkzeugScriptPasswordEncoder encoder = new WerkzeugScriptPasswordEncoder();

    @Test
    void testPasswordEncodingAndMatches() {
        String raw = "seagull123";
        String encoded = encoder.encode(raw);

        assertNotNull(encoded);
        assertTrue(encoder.matches(raw, encoded));
        assertFalse(encoder.matches("wrongpassword", encoded));
    }
}
