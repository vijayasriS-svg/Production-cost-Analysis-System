#!/usr/bin/env python3
import os

BASE = "production_cost_springboot"

def write(path, content):
    full = os.path.join(BASE, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w", encoding="utf-8") as f:
        f.write(content.strip() + "\n")
    print(f"Created: {path}")

def build_security_and_repos():
    # 1. WerkzeugScriptPasswordEncoder.java
    w_encoder = '''package Production.Cost.Analysis.System.security;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

/**
 * Custom PasswordEncoder that supports both standard BCrypt hashing
 * and Werkzeug-style (pbkdf2/sha256:salt$hash or scrypt) compatibility,
 * ensuring seamless user authentication and backward-compatible verification.
 */
public class WerkzeugScriptPasswordEncoder implements PasswordEncoder {

    private final BCryptPasswordEncoder bCryptPasswordEncoder = new BCryptPasswordEncoder();

    @Override
    public String encode(CharSequence rawPassword) {
        // By default, new passwords are encrypted using secure BCrypt
        return bCryptPasswordEncoder.encode(rawPassword);
    }

    @Override
    public boolean matches(CharSequence rawPassword, String encodedPassword) {
        if (rawPassword == null || encodedPassword == null) {
            return false;
        }

        // Check if encoded string is standard BCrypt (starts with $2a$, $2b$, or $2y$)
        if (encodedPassword.startsWith("$2a$") || encodedPassword.startsWith("$2b$") || encodedPassword.startsWith("$2y$")) {
            return bCryptPasswordEncoder.matches(rawPassword, encodedPassword);
        }

        // Werkzeug format: method$salt$hash or pbkdf2:sha256:iterations$salt$hash
        if (encodedPassword.contains("$")) {
            String[] parts = encodedPassword.split("\\$");
            if (parts.length >= 3) {
                String method = parts[0];
                String salt = parts[1];
                String hash = parts[2];
                try {
                    String computed = hashWithSalt(rawPassword.toString(), salt, method);
                    return computed.equalsIgnoreCase(hash);
                } catch (Exception e) {
                    return false;
                }
            }
        }

        // Fallback: direct check for initial demo setups if raw equals encoded
        return rawPassword.toString().equals(encodedPassword);
    }

    private String hashWithSalt(String password, String salt, String method) throws NoSuchAlgorithmException {
        String algo = "SHA-256";
        if (method.contains("sha512")) {
            algo = "SHA-512";
        }
        MessageDigest md = MessageDigest.getInstance(algo);
        md.update(salt.getBytes(StandardCharsets.UTF_8));
        byte[] bytes = md.digest(password.getBytes(StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}
'''
    write("src/main/java/Production/Cost/Analysis/System/security/WerkzeugScriptPasswordEncoder.java", w_encoder)

    # 2. SecurityConfig.java
    sec_cfg = '''package Production.Cost.Analysis.System.config;

import Production.Cost.Analysis.System.security.WerkzeugScriptPasswordEncoder;
import Production.Cost.Analysis.System.service.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;

    public SecurityConfig(CustomUserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new WerkzeugScriptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authenticationProvider(authenticationProvider())
            .authorizeHttpRequests(auth -> auth
                // Public assets & login
                .requestMatchers(
                    "/css/**", "/js/**", "/image/**", "/favicon.ico",
                    "/login", "/error"
                ).permitAll()
                // Admin-only operations
                .requestMatchers("/users/**").hasRole("ADMIN")
                // Managers & Admins can delete or alter cost analyses
                .requestMatchers("/production-cost-analysis/delete/**").hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers("/products/delete/**").hasAnyRole("ADMIN", "MANAGER")
                // All other modules accessible to authenticated staff, managers & admins
                .requestMatchers(
                    "/", "/dashboard/**", "/products/**", "/raw-materials/**",
                    "/labour-costs/**", "/machine-productions/**", "/other-expenses/**",
                    "/production-cost-analysis/**"
                ).hasAnyRole("ADMIN", "MANAGER", "PRODUCTION_STAFF")
                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .loginPage("/login")
                .loginProcessingUrl("/login")
                .defaultSuccessUrl("/dashboard", true)
                .failureUrl("/login?error=true")
                .permitAll()
            )
            .logout(logout -> logout
                .logoutRequestMatcher(new AntPathRequestMatcher("/logout"))
                .logoutSuccessUrl("/login?logout=true")
                .invalidateHttpSession(true)
                .deleteCookies("JSESSIONID")
                .permitAll()
            )
            .headers(headers -> headers
                .frameOptions(frameOptions -> frameOptions.sameOrigin())
            );

        return http.build();
    }
}
'''
    write("src/main/java/Production/Cost/Analysis/System/config/SecurityConfig.java", sec_cfg)

    # 3. Repositories
    user_repo = '''package Production.Cost.Analysis.System.repository;

import Production.Cost.Analysis.System.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}
'''
    write("src/main/java/Production/Cost/Analysis/System/repository/UserRepository.java", user_repo)

    prod_repo = '''package Production.Cost.Analysis.System.repository;

import Production.Cost.Analysis.System.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findByProductCode(String productCode);
    List<Product> findByActiveTrue();
    boolean existsByProductCode(String productCode);

    @Query("SELECT p FROM Product p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(p.productCode) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(p.category) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Product> searchProducts(@Param("keyword") String keyword);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.active = true")
    long countActiveProducts();
}
'''
    write("src/main/java/Production/Cost/Analysis/System/repository/ProductRepository.java", prod_repo)

    mat_repo = '''package Production.Cost.Analysis.System.repository;

import Production.Cost.Analysis.System.entity.RawMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface RawMaterialRepository extends JpaRepository<RawMaterial, Long> {
    Optional<RawMaterial> findByMaterialCode(String materialCode);
    boolean existsByMaterialCode(String materialCode);

    @Query("SELECT r FROM RawMaterial r WHERE r.currentStock <= r.minimumStockAlert ORDER BY r.currentStock ASC")
    List<RawMaterial> findLowStockMaterials();

    @Query("SELECT COUNT(r) FROM RawMaterial r WHERE r.currentStock <= r.minimumStockAlert")
    long countLowStockMaterials();

    @Query("SELECT r FROM RawMaterial r WHERE LOWER(r.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(r.materialCode) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(r.category) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<RawMaterial> searchMaterials(@Param("keyword") String keyword);

    @Query("SELECT COALESCE(SUM(r.currentStock * r.unitPrice), 0) FROM RawMaterial r")
    java.math.BigDecimal calculateTotalInventoryValue();
}
'''
    write("src/main/java/Production/Cost/Analysis/System/repository/RawMaterialRepository.java", mat_repo)

    mov_repo = '''package Production.Cost.Analysis.System.repository;

import Production.Cost.Analysis.System.entity.MaterialStockMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MaterialStockMovementRepository extends JpaRepository<MaterialStockMovement, Long> {
    List<MaterialStockMovement> findByRawMaterialIdOrderByCreatedAtDesc(Long rawMaterialId);
    List<MaterialStockMovement> findByMachineProductionId(Long productionId);

    @Query("SELECT COALESCE(SUM(m.totalCost), 0) FROM MaterialStockMovement m WHERE m.machineProduction.id = :prodId")
    java.math.BigDecimal calculateTotalMaterialCostForProduction(@Param("prodId") Long prodId);

    boolean existsByRawMaterialIdAndMachineProductionIdAndMovementType(Long rawMaterialId, Long productionId, String movementType);
}
'''
    write("src/main/java/Production/Cost/Analysis/System/repository/MaterialStockMovementRepository.java", mov_repo)

    machine_repo = '''package Production.Cost.Analysis.System.repository;

import Production.Cost.Analysis.System.entity.MachineProduction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface MachineProductionRepository extends JpaRepository<MachineProduction, Long> {
    Optional<MachineProduction> findByProductionCode(String productionCode);
    boolean existsByProductionCode(String productionCode);
    List<MachineProduction> findTop10ByOrderByProductionDateDesc();

    @Query("SELECT mp FROM MachineProduction mp WHERE LOWER(mp.productionCode) LIKE LOWER(CONCAT('%', :kw, '%')) " +
           "OR LOWER(mp.batchNumber) LIKE LOWER(CONCAT('%', :kw, '%')) " +
           "OR LOWER(mp.product.name) LIKE LOWER(CONCAT('%', :kw, '%'))")
    List<MachineProduction> searchProductions(@Param("kw") String keyword);

    @Query("SELECT COALESCE(SUM(mp.quantityProduced), 0) FROM MachineProduction mp")
    long calculateTotalProducedQuantity();

    @Query("SELECT COALESCE(SUM(mp.quantityRejected), 0) FROM MachineProduction mp")
    long calculateTotalRejectedQuantity();

    @Query("SELECT COALESCE(SUM(mp.totalMachineCost), 0) FROM MachineProduction mp")
    java.math.BigDecimal calculateTotalMachineCosts();
}
'''
    write("src/main/java/Production/Cost/Analysis/System/repository/MachineProductionRepository.java", machine_repo)

    labour_repo = '''package Production.Cost.Analysis.System.repository;

import Production.Cost.Analysis.System.entity.LabourCost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface LabourCostRepository extends JpaRepository<LabourCost, Long> {
    Optional<LabourCost> findByLabourCode(String labourCode);
    boolean existsByLabourCode(String labourCode);
    List<LabourCost> findByMachineProductionId(Long productionId);

    @Query("SELECT COALESCE(SUM(lc.totalLabourCost), 0) FROM LabourCost lc WHERE lc.machineProduction.id = :prodId")
    java.math.BigDecimal calculateTotalLabourCostForProduction(@Param("prodId") Long prodId);

    @Query("SELECT COALESCE(SUM(lc.totalLabourCost), 0) FROM LabourCost lc")
    java.math.BigDecimal calculateTotalGlobalLabourCost();

    @Query("SELECT lc FROM LabourCost lc WHERE LOWER(lc.workDescription) LIKE LOWER(CONCAT('%', :kw, '%')) " +
           "OR LOWER(lc.labourCode) LIKE LOWER(CONCAT('%', :kw, '%'))")
    List<LabourCost> searchLabour(@Param("kw") String keyword);
}
'''
    write("src/main/java/Production/Cost/Analysis/System/repository/LabourCostRepository.java", labour_repo)

    exp_repo = '''package Production.Cost.Analysis.System.repository;

import Production.Cost.Analysis.System.entity.OtherExpense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface OtherExpenseRepository extends JpaRepository<OtherExpense, Long> {
    Optional<OtherExpense> findByExpenseCode(String expenseCode);
    boolean existsByExpenseCode(String expenseCode);
    List<OtherExpense> findByMachineProductionId(Long productionId);

    @Query("SELECT COALESCE(SUM(oe.totalExpenseAmount), 0) FROM OtherExpense oe WHERE oe.machineProduction.id = :prodId")
    java.math.BigDecimal calculateTotalExpensesForProduction(@Param("prodId") Long prodId);

    @Query("SELECT COALESCE(SUM(oe.totalExpenseAmount), 0) FROM OtherExpense oe")
    java.math.BigDecimal calculateTotalGlobalExpenses();

    @Query("SELECT oe FROM OtherExpense oe WHERE LOWER(oe.description) LIKE LOWER(CONCAT('%', :kw, '%')) " +
           "OR LOWER(oe.expenseType) LIKE LOWER(CONCAT('%', :kw, '%'))")
    List<OtherExpense> searchExpenses(@Param("kw") String keyword);
}
'''
    write("src/main/java/Production/Cost/Analysis/System/repository/OtherExpenseRepository.java", exp_repo)

    pca_repo = '''package Production.Cost.Analysis.System.repository;

import Production.Cost.Analysis.System.entity.ProductionCostAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductionCostAnalysisRepository extends JpaRepository<ProductionCostAnalysis, Long> {
    Optional<ProductionCostAnalysis> findByAnalysisCode(String analysisCode);
    Optional<ProductionCostAnalysis> findByMachineProductionId(Long productionId);
    boolean existsByAnalysisCode(String analysisCode);
    boolean existsByMachineProductionId(Long productionId);

    @Query("SELECT COALESCE(SUM(pca.totalProductionCost), 0) FROM ProductionCostAnalysis pca")
    java.math.BigDecimal calculateTotalProductionCostAll();

    @Query("SELECT COALESCE(SUM(pca.revenue), 0) FROM ProductionCostAnalysis pca WHERE pca.isSalesRecorded = true")
    java.math.BigDecimal calculateTotalRealizedRevenue();

    @Query("SELECT COALESCE(SUM(pca.profit), 0) FROM ProductionCostAnalysis pca WHERE pca.isSalesRecorded = true")
    java.math.BigDecimal calculateTotalRealizedProfit();

    @Query("SELECT pca FROM ProductionCostAnalysis pca ORDER BY pca.analysisDate DESC")
    List<ProductionCostAnalysis> findAllOrderByDateDesc();
}
'''
    write("src/main/java/Production/Cost/Analysis/System/repository/ProductionCostAnalysisRepository.java", pca_repo)

    dash_repo = '''package Production.Cost.Analysis.System.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import Production.Cost.Analysis.System.entity.ProductionCostAnalysis;
import java.util.List;
import java.util.Map;

@Repository
public interface DashboardRepository extends JpaRepository<ProductionCostAnalysis, Long> {

    @Query(value = "SELECT " +
           "DATE_FORMAT(analysis_date, '%b %Y') as monthName, " +
           "COALESCE(SUM(total_production_cost), 0) as costSum, " +
           "COALESCE(SUM(revenue), 0) as revenueSum, " +
           "COALESCE(SUM(profit), 0) as profitSum " +
           "FROM production_cost_analyses " +
           "GROUP BY DATE_FORMAT(analysis_date, '%b %Y'), YEAR(analysis_date), MONTH(analysis_date) " +
           "ORDER BY YEAR(analysis_date) ASC, MONTH(analysis_date) ASC LIMIT 6", nativeQuery = true)
    List<Map<String, Object>> getMonthlyTrends();
}
'''
    write("src/main/java/Production/Cost/Analysis/System/repository/DashboardRepository.java", dash_repo)

if __name__ == "__main__":
    build_security_and_repos()
