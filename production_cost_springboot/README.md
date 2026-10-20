# Seagull Printers - Production Cost Analysis & Stock Automation System

Enterprise Java & Spring Boot application developed for **Seagull Printers** to automate manufacturing cost accounting, raw material stock levels, press room operations, overhead expense allocation, and executive profitability analytics.

---

## 1. Technology Stack
- **Framework**: Java 17+, Spring Boot 3.2.5
- **Security**: Spring Security 6 with Role-Based Access Control (Admin, Manager, Staff) & Werkzeug password verification
- **Persistence**: Spring Data JPA, Hibernate, MySQL 8.x
- **Frontend**: Thymeleaf, Bootstrap 5.3, Bootstrap Icons, Chart.js, Vanilla JavaScript
- **Build & Test**: Maven 3.9+, JUnit 5, Mockito, H2 in-memory test database

---

## 2. Implemented Modules
1. **User and Login Management**: Secure BCrypt authentication, session handling, RBAC for Admin, Manager, and Production Staff.
2. **Product Management**: Automated unique product code generation (`PRD-xxx`), standard costs, selling prices, catalog filtering, safe archival.
3. **Raw Material Management**: Real-time stock tracking (opening, purchases, production consumption), automated low-stock warnings, negative stock prevention, duplicate deduction safeguards, and movement audit ledger.
4. **Labour Cost Management**: Automated wage calculation via `Worker Count × Hours Worked × Hourly Rate`, piece-rate and contract support, linked to production runs.
5. **Machine & Production Management**: Press order tracking, defect/rejection counting, automated net good quantities, operational machine hourly costs, and material consumption deductions.
6. **Other Expense Management**: Electricity meter tracking, delivery transport, packaging supplies, chemical washes, overhead cost allocation, and duplicate submission prevention.
7. **Production Cost & Profit Analysis**: Authoritative automated formula calculation:
   - `Total Production Cost = Raw Material Cost + Labour Cost + Machine Cost + Other Expenses`
   - `Cost Per Unit = Total Production Cost / Produced Quantity`
   - `Revenue = Actual Sold Quantity × Selling Price Per Unit`
   - `COGS = Cost Per Unit × Actual Sold Quantity`
   - `Profit = Revenue - COGS`
   - `Profit Margin (%) = (Profit / Revenue) × 100`
   - Strict unsold inventory protection: unsold items never fabricated as realized revenue.
8. **Executive Dashboard**: Real-time KPI summaries, cost allocation doughnut chart, low-stock alerts, and recent production status.

---

## 3. Database Setup Instructions (MySQL)
1. Start your local or cloud MySQL server on port `3306`.
2. Connect to MySQL using MySQL Workbench, DBeaver, or command line:
   ```bash
   mysql -u root -p
   ```
3. Execute the schema script located at `database/schema.sql`:
   ```sql
   SOURCE database/schema.sql;
   ```
   *This automatically provisions the `production_cost_db` database, 8 relational tables with foreign keys and indexes, and pre-seeds initial user accounts and sample printing jobs.*

4. Verify credentials in `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/production_cost_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true&createDatabaseIfNotExist=true
   spring.datasource.username=root
   spring.datasource.password=root1234
   ```

---

## 4. How to Build and Run
Execute the following commands in the project root directory:

```bash
# Clean and compile the Spring Boot application
mvn clean compile

# Execute all JUnit automated tests
mvn test

# Package into executable JAR
mvn package -DskipTests

# Run the Spring Boot application
mvn spring-boot:run
```

Once started, open your web browser at:
**`http://localhost:8080`**

---

## 5. Default Login Accounts
| Role | Username | Password | Permissions |
|---|---|---|---|
| **System Administrator** | `admin` | `seagull123` | Full access to all 8 modules, user management, and deletions |
| **Production Manager** | `manager` | `seagull123` | Production orders, cost analyses, stock purchases, and pricing |
| **Floor Operator / Staff** | `staff` | `seagull123` | Log machine hours, deduct materials, view product specifications |
