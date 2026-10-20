package Production.Cost.Analysis.System;

import Production.Cost.Analysis.System.entity.User;
import Production.Cost.Analysis.System.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class ProductionCostSystemApplication {

    public static void main(String[] args) {
        SpringApplication.run(ProductionCostSystemApplication.class, args);
    }

    /**
     * Initializes default accounts if database is empty on first boot.
     */
    @Bean
    public CommandLineRunner initDefaultUsers(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.count() == 0) {
                System.out.println(">>> Initializing default users for Seagull Printers System...");
                User admin = new User("admin", passwordEncoder.encode("seagull123"), "System Administrator", "admin@seagullprinters.com", "ROLE_ADMIN");
                User manager = new User("manager", passwordEncoder.encode("seagull123"), "Production Manager", "manager@seagullprinters.com", "ROLE_MANAGER");
                User staff = new User("staff", passwordEncoder.encode("seagull123"), "Floor Operator", "operator@seagullprinters.com", "ROLE_PRODUCTION_STAFF");

                userRepository.save(admin);
                userRepository.save(manager);
                userRepository.save(staff);
                System.out.println(">>> Default users created: admin/seagull123, manager/seagull123, staff/seagull123");
            }
        };
    }
}
