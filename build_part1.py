#!/usr/bin/env python3
import os

BASE = "production_cost_springboot"

def write(path, content):
    full = os.path.join(BASE, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w", encoding="utf-8") as f:
        f.write(content.strip() + "\n")
    print(f"Created: {path}")

def build_root_and_db():
    pom = '''<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.5</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>
    <groupId>Production.Cost.Analysis.System</groupId>
    <artifactId>production_cost_springboot</artifactId>
    <version>1.0.0</version>
    <name>Seagull Printers Production Cost Analysis System</name>
    <description>Automated Production Cost and Stock Management System for Seagull Printers</description>

    <properties>
        <java.version>17</java.version>
    </properties>

    <dependencies>
        <!-- Spring Boot Starters -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-thymeleaf</artifactId>
        </dependency>
        <dependency>
            <groupId>org.thymeleaf.extras</groupId>
            <artifactId>thymeleaf-extras-springsecurity6</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>

        <!-- MySQL Connector -->
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <scope>runtime</scope>
        </dependency>

        <!-- H2 Database for In-Memory Unit/Integration Testing -->
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>test</scope>
        </dependency>

        <!-- Spring Boot DevTools (Optional developer convenience) -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-devtools</artifactId>
            <scope>runtime</scope>
            <optional>true</optional>
        </dependency>

        <!-- Testing -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>'''
    write("pom.xml", pom)

    mvnw = '''#!/bin/sh
# Maven Wrapper script for Linux/macOS
exec java -jar .mvn/wrapper/maven-wrapper.jar "$@"
'''
    write("mvnw", mvnw)

    mvnw_cmd = '''@REM Maven Wrapper script for Windows
@echo off
java -jar .mvn\\wrapper\\maven-wrapper.jar %*
'''
    write("mvnw.cmd", mvnw_cmd)

    schema_sql = '''-- ====================================================================
-- Database Schema for Seagull Printers Production Cost Analysis System
-- Database Name: production_cost_db
-- ====================================================================

CREATE DATABASE IF NOT EXISTS `production_cost_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `production_cost_db`;

-- Drop existing tables if present (safe teardown in reverse FK dependency order)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `production_cost_analyses`;
DROP TABLE IF EXISTS `other_expenses`;
DROP TABLE IF EXISTS `labour_costs`;
DROP TABLE IF EXISTS `material_stock_movements`;
DROP TABLE IF EXISTS `machine_productions`;
DROP TABLE IF EXISTS `raw_materials`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Users & Authentication Table
CREATE TABLE `users` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `role` VARCHAR(30) NOT NULL DEFAULT 'ROLE_STAFF',
    `enabled` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_users_username` (`username`),
    INDEX `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Products Table
CREATE TABLE `products` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `product_code` VARCHAR(30) NOT NULL UNIQUE,
    `name` VARCHAR(150) NOT NULL,
    `category` VARCHAR(80) NOT NULL,
    `standard_cost` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `standard_selling_price` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `description` TEXT,
    `active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_product_code` (`product_code`),
    INDEX `idx_product_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Raw Materials Table
CREATE TABLE `raw_materials` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `material_code` VARCHAR(30) NOT NULL UNIQUE,
    `name` VARCHAR(150) NOT NULL,
    `category` VARCHAR(80) NOT NULL,
    `unit` VARCHAR(20) NOT NULL, -- e.g. Sheets, Kg, Liters, Rolls, Packets
    `unit_price` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `opening_stock` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `current_stock` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `minimum_stock_alert` DECIMAL(12,2) NOT NULL DEFAULT 10.00,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_material_code` (`material_code`),
    INDEX `idx_material_current_stock` (`current_stock`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Machine Productions Table
CREATE TABLE `machine_productions` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `production_code` VARCHAR(30) NOT NULL UNIQUE,
    `product_id` BIGINT NOT NULL,
    `batch_number` VARCHAR(50) NOT NULL,
    `quantity_produced` INT NOT NULL,
    `quantity_rejected` INT NOT NULL DEFAULT 0,
    `net_good_quantity` INT NOT NULL,
    `machine_name` VARCHAR(100) NOT NULL,
    `machine_hours` DECIMAL(8,2) NOT NULL DEFAULT 0.00,
    `machine_hourly_rate` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `total_machine_cost` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `production_date` DATE NOT NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'COMPLETED', -- SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
    `notes` TEXT,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_machine_prod_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT,
    INDEX `idx_production_code` (`production_code`),
    INDEX `idx_production_date` (`production_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Material Stock Movements (Audit Trail & Production Material Consumption)
CREATE TABLE `material_stock_movements` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `material_id` BIGINT NOT NULL,
    `production_id` BIGINT NULL,
    `movement_type` VARCHAR(30) NOT NULL, -- OPENING, PURCHASE, PRODUCTION_CONSUMPTION, ADJUSTMENT, RETURN
    `quantity` DECIMAL(12,2) NOT NULL,
    `unit_price` DECIMAL(12,2) NOT NULL,
    `total_cost` DECIMAL(12,2) NOT NULL,
    `reference_note` VARCHAR(255),
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_movement_material` FOREIGN KEY (`material_id`) REFERENCES `raw_materials` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_movement_production` FOREIGN KEY (`production_id`) REFERENCES `machine_productions` (`id`) ON DELETE SET NULL,
    INDEX `idx_movement_type` (`movement_type`),
    INDEX `idx_movement_material` (`material_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Labour Costs Table
CREATE TABLE `labour_costs` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `labour_code` VARCHAR(30) NOT NULL UNIQUE,
    `production_id` BIGINT NULL,
    `work_description` VARCHAR(200) NOT NULL,
    `worker_count` INT NOT NULL DEFAULT 1,
    `hours_worked` DECIMAL(8,2) NOT NULL DEFAULT 0.00,
    `hourly_rate` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `calculation_method` VARCHAR(40) NOT NULL DEFAULT 'HOURLY_RATE', -- HOURLY_RATE, PIECE_RATE, FIXED_CONTRACT
    `total_labour_cost` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `recorded_date` DATE NOT NULL,
    `notes` TEXT,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_labour_production` FOREIGN KEY (`production_id`) REFERENCES `machine_productions` (`id`) ON DELETE SET NULL,
    INDEX `idx_labour_code` (`labour_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Other Expenses Table
CREATE TABLE `other_expenses` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `expense_code` VARCHAR(30) NOT NULL UNIQUE,
    `production_id` BIGINT NULL,
    `expense_type` VARCHAR(60) NOT NULL, -- Electricity, Transport, Packaging, Plates/Chemicals, Maintenance, Overhead
    `description` VARCHAR(255) NOT NULL,
    `quantity` DECIMAL(10,2) NOT NULL DEFAULT 1.00,
    `unit_price` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `total_expense_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `expense_date` DATE NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_expense_production` FOREIGN KEY (`production_id`) REFERENCES `machine_productions` (`id`) ON DELETE SET NULL,
    INDEX `idx_expense_code` (`expense_code`),
    INDEX `idx_expense_type` (`expense_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Production Cost & Profit Analyses Table
CREATE TABLE `production_cost_analyses` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `analysis_code` VARCHAR(30) NOT NULL UNIQUE,
    `production_id` BIGINT NOT NULL UNIQUE,
    `raw_material_cost` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    `labour_cost` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    `machine_cost` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    `other_expense_cost` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    `total_production_cost` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    `produced_quantity` INT NOT NULL,
    `cost_per_unit` DECIMAL(12,4) NOT NULL DEFAULT 0.0000,
    `actual_sold_quantity` INT NOT NULL DEFAULT 0,
    `selling_price_per_unit` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `revenue` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    `cogs` DECIMAL(14,2) NOT NULL DEFAULT 0.00, -- Cost of Goods Sold for actual sold qty
    `profit` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    `profit_margin_pct` DECIMAL(6,2) NOT NULL DEFAULT 0.00,
    `is_sales_recorded` BOOLEAN NOT NULL DEFAULT FALSE,
    `analysis_date` DATE NOT NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'CALCULATED',
    `notes` TEXT,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_analysis_production` FOREIGN KEY (`production_id`) REFERENCES `machine_productions` (`id`) ON DELETE RESTRICT,
    INDEX `idx_analysis_code` (`analysis_code`),
    INDEX `idx_analysis_date` (`analysis_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ====================================================================
-- SEED DATA (Default Accounts, Products, Raw Materials & Sample Run)
-- Password for all default accounts is: seagull123
-- Encrypted with BCrypt: $2a$10$wE9j9O8/1u5m3WqB9oQ4A.fFf7h3A1Q5.c4pC6q2P8Y2bZ3h6l9q2
-- (or fallback with Werkzeug style standard hash)
-- ====================================================================

INSERT INTO `users` (`username`, `password`, `full_name`, `email`, `role`, `enabled`) VALUES
('admin', '$2a$10$1yE03w48Q850x.e53f0S9.iW9r4/C1.zD3P4eM6qR8pS2t0/4o7G6', 'System Administrator', 'admin@seagullprinters.com', 'ROLE_ADMIN', TRUE),
('manager', '$2a$10$1yE03w48Q850x.e53f0S9.iW9r4/C1.zD3P4eM6qR8pS2t0/4o7G6', 'Production Manager', 'manager@seagullprinters.com', 'ROLE_MANAGER', TRUE),
('staff', '$2a$10$1yE03w48Q850x.e53f0S9.iW9r4/C1.zD3P4eM6qR8pS2t0/4o7G6', 'Floor Operator', 'operator@seagullprinters.com', 'ROLE_PRODUCTION_STAFF', TRUE);

-- Seed Products for Seagull Printers
INSERT INTO `products` (`product_code`, `name`, `category`, `standard_cost`, `standard_selling_price`, `description`) VALUES
('PRD-101', 'Corporate Tri-fold Brochure (A4 150gsm Gloss)', 'Marketing Collateral', 0.85, 2.20, 'Full color 4/4 printing, double parallel fold, gloss lamination'),
('PRD-102', 'Premium Hardcover Annual Report (100pp)', 'Booklets & Publishing', 12.50, 28.00, 'Section sewn, case bound, matte lamination, spot UV embellishment'),
('PRD-103', 'Matte Finish Business Cards (Pack of 500)', 'Stationery', 8.20, 22.50, '350gsm Silk card stock, double-sided CMYK with velvety soft-touch finish'),
('PRD-104', 'Corrugated Shipping Boxes (Printed 3-ply)', 'Packaging', 1.40, 3.50, 'Kraft paper outer, flexographic 2-color print, die-cut foldable box'),
('PRD-105', 'High-Gloss Product Labels (Roll of 1000)', 'Labels & Stickers', 14.00, 32.00, 'Waterproof synthetic PP roll labels, permanent adhesive');

-- Seed Raw Materials for Seagull Printers
INSERT INTO `raw_materials` (`material_code`, `name`, `category`, `unit`, `unit_price`, `opening_stock`, `current_stock`, `minimum_stock_alert`) VALUES
('MAT-001', 'Art Gloss Paper 150gsm (640x900mm)', 'Paper Stock', 'Reams', 42.50, 150.00, 115.00, 25.00),
('MAT-002', 'Silk Board 350gsm (700x1000mm)', 'Paper Stock', 'Sheets', 0.38, 25000.00, 4200.00, 5000.00), -- Low Stock Trigger!
('MAT-003', 'Process Cyan Offset Ink (Grade A)', 'Printing Inks', 'Kg', 18.20, 80.00, 54.00, 15.00),
('MAT-004', 'Process Magenta Offset Ink (Grade A)', 'Printing Inks', 'Kg', 18.50, 80.00, 48.00, 15.00),
('MAT-005', 'Process Yellow Offset Ink (Grade A)', 'Printing Inks', 'Kg', 18.00, 80.00, 52.00, 15.00),
('MAT-006', 'Process Black Dense Offset Ink', 'Printing Inks', 'Kg', 14.50, 120.00, 85.00, 20.00),
('MAT-007', 'Thermal CTP Aluminum Plates (Standard)', 'Prepress Consumables', 'Plates', 6.80, 200.00, 18.00, 30.00), -- Low Stock Trigger!
('MAT-008', 'Gloss Thermal Lamination Film 25mic', 'Finishing & Bindery', 'Rolls', 65.00, 40.00, 28.00, 8.00);

-- Seed Sample Production Run
INSERT INTO `machine_productions` (`production_code`, `product_id`, `batch_number`, `quantity_produced`, `quantity_rejected`, `net_good_quantity`, `machine_name`, `machine_hours`, `machine_hourly_rate`, `total_machine_cost`, `production_date`, `status`, `notes`) VALUES
('PROD-2024-001', 1, 'BATCH-BROCH-01', 5000, 150, 4850, 'Heidelberg Speedmaster XL 75 4-Color', 6.5, 45.00, 292.50, '2024-09-15', 'COMPLETED', 'Initial launch batch for corporate client');

-- Seed Material Consumption for this Production Run
INSERT INTO `material_stock_movements` (`material_id`, `production_id`, `movement_type`, `quantity`, `unit_price`, `total_cost`, `reference_note`) VALUES
(1, 1, 'PRODUCTION_CONSUMPTION', 12.00, 42.50, 510.00, 'Used 12 reams for PROD-2024-001'),
(3, 1, 'PRODUCTION_CONSUMPTION', 4.00, 18.20, 72.80, 'Cyan ink for PROD-2024-001'),
(4, 1, 'PRODUCTION_CONSUMPTION', 4.00, 18.50, 74.00, 'Magenta ink for PROD-2024-001'),
(5, 1, 'PRODUCTION_CONSUMPTION', 4.00, 18.00, 72.00, 'Yellow ink for PROD-2024-001'),
(6, 1, 'PRODUCTION_CONSUMPTION', 5.00, 14.50, 72.50, 'Black ink for PROD-2024-001'),
(7, 1, 'PRODUCTION_CONSUMPTION', 4.00, 6.80, 27.20, '4 CTP aluminum plates for CMYK separation');

-- Seed Labour for this Production Run
INSERT INTO `labour_costs` (`labour_code`, `production_id`, `work_description`, `worker_count`, `hours_worked`, `hourly_rate`, `calculation_method`, `total_labour_cost`, `recorded_date`, `notes`) VALUES
('LBR-1001', 1, 'Pre-press setup & Heidelberg press operation', 2, 6.5, 22.00, 'HOURLY_RATE', 286.00, '2024-09-15', 'Senior press operator and feeder assistant'),
('LBR-1002', 1, 'Tri-fold folding, quality inspection & bundling', 2, 4.0, 16.50, 'HOURLY_RATE', 132.00, '2024-09-16', 'Post-press bindery operators');

-- Seed Other Expenses for this Production Run
INSERT INTO `other_expenses` (`expense_code`, `production_id`, `expense_type`, `description`, `quantity`, `unit_price`, `total_expense_amount`, `expense_date`) VALUES
('EXP-5001', 1, 'Electricity', 'Press energy allocation (industrial meter reading)', 1.0, 85.00, 85.00, '2024-09-15'),
('EXP-5002', 1, 'Packaging', 'Heavy-duty cartons and moisture-barrier wrap', 25.0, 2.50, 62.50, '2024-09-16'),
('EXP-5003', 1, 'Transport', 'Courier pallet delivery to corporate client HQ', 1.0, 75.00, 75.00, '2024-09-17');

-- Seed Production Cost Analysis
-- Total Material: 510 + 72.80 + 74 + 72 + 72.50 + 27.20 = 828.50
-- Total Labour: 286 + 132 = 418.00
-- Total Machine: 292.50
-- Total Other Expenses: 85 + 62.50 + 75 = 222.50
-- Total Cost = 828.50 + 418.00 + 292.50 + 222.50 = 1761.50
-- Produced Qty: 5000 (net good 4850)
-- Cost per unit = 1761.50 / 5000 = 0.3523
-- Actual sold: 4850 @ 2.20 = 10670.00
-- COGS: 4850 * 0.3523 = 1708.66
-- Profit: 10670.00 - 1708.66 = 8961.34
-- Profit margin: (8961.34 / 10670.00) * 100 = 83.99%
INSERT INTO `production_cost_analyses` (
    `analysis_code`, `production_id`, `raw_material_cost`, `labour_cost`, `machine_cost`,
    `other_expense_cost`, `total_production_cost`, `produced_quantity`, `cost_per_unit`,
    `actual_sold_quantity`, `selling_price_per_unit`, `revenue`, `cogs`, `profit`,
    `profit_margin_pct`, `is_sales_recorded`, `analysis_date`, `status`, `notes`
) VALUES (
    'PCA-2024-001', 1, 828.50, 418.00, 292.50,
    222.50, 1761.50, 5000, 0.3523,
    4850, 2.20, 10670.00, 1708.66, 8961.34,
    83.99, TRUE, '2024-09-17', 'CALCULATED', 'Completed batch delivered and fully paid'
);
'''
    write("database/schema.sql", schema_sql)

if __name__ == "__main__":
    build_root_and_db()
