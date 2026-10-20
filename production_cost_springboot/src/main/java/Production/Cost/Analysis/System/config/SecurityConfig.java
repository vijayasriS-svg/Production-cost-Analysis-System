package Production.Cost.Analysis.System.config;

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
    public org.springframework.security.web.authentication.AuthenticationSuccessHandler authenticationSuccessHandler(Production.Cost.Analysis.System.repository.UserRepository userRepository) {
        return (request, response, authentication) -> {
            String username = authentication.getName();
            userRepository.findByUsername(username).ifPresentOrElse(user -> {
                try {
                    if (user.isMustChangePassword()) {
                        response.sendRedirect("/users/change-password");
                    } else {
                        response.sendRedirect("/dashboard");
                    }
                } catch (Exception e) {
                    try { response.sendRedirect("/dashboard"); } catch (Exception ignored) {}
                }
            }, () -> {
                try { response.sendRedirect("/dashboard"); } catch (Exception ignored) {}
            });
        };
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, Production.Cost.Analysis.System.repository.UserRepository userRepository) throws Exception {
        http
            .authenticationProvider(authenticationProvider())
            .authorizeHttpRequests(auth -> auth
                // Public assets & login
                .requestMatchers(
                    "/css/**", "/js/**", "/image/**", "/favicon.ico",
                    "/login", "/error"
                ).permitAll()
                // Self-service password change for any authenticated user needing update
                .requestMatchers("/users/change-password").authenticated()
                // Admin-only user management & account creation
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
                .successHandler(authenticationSuccessHandler(userRepository))
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
