#!/usr/bin/env python3
import os

BASE = "production_cost_springboot"

def write(path, content):
    full = os.path.join(BASE, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w", encoding="utf-8") as f:
        f.write(content.strip() + "\n")
    print(f"Created: {path}")

def build_resources_and_templates():
    # 1. application.properties
    app_props = '''# ====================================================================
# Seagull Printers Production Cost Analysis System Configuration
# Database: MySQL (production_cost_db)
# ====================================================================

spring.application.name=production_cost_springboot
server.port=8080

# --- MySQL Datasource Configuration ---
# Adjust username/password according to your local or cloud MySQL server
spring.datasource.url=jdbc:mysql://localhost:3306/production_cost_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true&createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=root1234
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# Hikari Connection Pool Settings
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=2
spring.datasource.hikari.idle-timeout=300000
spring.datasource.hikari.connection-timeout=20000

# --- Hibernate / JPA Settings ---
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

# --- Thymeleaf Settings ---
spring.thymeleaf.cache=false
spring.thymeleaf.mode=HTML
spring.thymeleaf.encoding=UTF-8

# --- Logging ---
logging.level.Production.Cost.Analysis.System=INFO
logging.level.org.springframework.security=WARN
'''
    write("src/main/resources/application.properties", app_props)

    # 2. static/css/style.css
    css = '''/* ==========================================================
   Seagull Printers - Brand Stylesheet
   Color Palette: Deep Maritime Navy (#0c2340), Marine Cyan (#0284c7)
   ========================================================== */

:root {
    --seagull-navy: #0c2340;
    --seagull-dark: #081628;
    --seagull-blue: #0284c7;
    --seagull-light-blue: #e0f2fe;
    --seagull-accent: #06b6d4;
    --seagull-surface: #f8fafc;
    --seagull-border: #e2e8f0;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    background-color: #f1f5f9;
    color: #1e293b;
    min-height: 100vh;
}

/* Sidebar styling */
.app-sidebar {
    width: 260px;
    background: linear-gradient(180deg, var(--seagull-navy) 0%, var(--seagull-dark) 100%);
    color: #fff;
    min-height: 100vh;
    box-shadow: 2px 0 10px rgba(0,0,0,0.1);
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    z-index: 1000;
    display: flex;
    flex-direction: column;
}

.brand-header {
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid rgba(255,255,255,0.1);
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.brand-title {
    font-size: 1.15rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: #ffffff;
    line-height: 1.2;
    margin: 0;
}

.brand-subtitle {
    font-size: 0.7rem;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0;
}

.sidebar-nav {
    padding: 1rem 0.75rem;
    flex-grow: 1;
    overflow-y: auto;
}

.nav-section-label {
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #64748b;
    font-weight: 700;
    padding: 0.75rem 0.75rem 0.25rem 0.75rem;
}

.nav-link-custom {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.65rem 0.85rem;
    color: #cbd5e1;
    text-decoration: none;
    font-size: 0.88rem;
    font-weight: 500;
    border-radius: 8px;
    transition: all 0.15s ease-in-out;
    margin-bottom: 0.25rem;
}

.nav-link-custom:hover {
    color: #ffffff;
    background-color: rgba(255,255,255,0.08);
}

.nav-link-custom.active {
    color: #ffffff;
    background-color: var(--seagull-blue);
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(2, 132, 199, 0.35);
}

.nav-link-custom i {
    font-size: 1.1rem;
    width: 20px;
    text-align: center;
}

/* User footer in sidebar */
.sidebar-user {
    padding: 1rem;
    border-top: 1px solid rgba(255,255,255,0.1);
    background-color: rgba(0,0,0,0.15);
}

/* Main Content Area */
.main-wrapper {
    margin-left: 260px;
    padding: 1.5rem 2rem 3rem 2rem;
    min-height: 100vh;
}

@media (max-width: 992px) {
    .app-sidebar {
        position: relative;
        width: 100%;
        min-height: auto;
    }
    .main-wrapper {
        margin-left: 0;
        padding: 1rem;
    }
}

/* Cards & Metrics */
.metric-card {
    background: #ffffff;
    border-radius: 12px;
    border: 1px solid var(--seagull-border);
    padding: 1.25rem 1.5rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.metric-card:hover {
    box-shadow: 0 6px 16px rgba(0,0,0,0.08);
    transform: translateY(-2px);
}

.metric-label {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #64748b;
    margin-bottom: 0.25rem;
}

.metric-value {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--seagull-navy);
    line-height: 1.2;
}

/* Custom Table Styles */
.table-custom {
    background: #ffffff;
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid var(--seagull-border);
}

.table-custom thead {
    background-color: #f8fafc;
    border-bottom: 2px solid var(--seagull-border);
}

.table-custom th {
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #475569;
    font-weight: 600;
    padding: 0.85rem 1rem;
}

.table-custom td {
    padding: 0.85rem 1rem;
    vertical-align: middle;
    font-size: 0.88rem;
    border-bottom: 1px solid var(--seagull-border);
}

.badge-low-stock {
    background-color: #fee2e2;
    color: #991b1b;
    border: 1px solid #f87171;
    font-weight: 600;
}

.badge-in-stock {
    background-color: #ecfdf5;
    color: #065f46;
    border: 1px solid #6ee7b7;
    font-weight: 600;
}

/* Live Calculator Box */
.calc-preview-box {
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    border: 1px solid #bae6fd;
    border-radius: 12px;
    padding: 1.25rem;
}
'''
    write("src/main/resources/static/css/style.css", css)

    # 3. static/js/main.js
    js = '''/**
 * Seagull Printers Production Cost Analysis System
 * Client-Side Interactive Automation, Formula Previews & Live Validations
 */

document.addEventListener("DOMContentLoaded", function() {
    initCalculationPreviews();
    initConfirmDialogs();
});

function initCalculationPreviews() {
    // 1. Labour Cost Live Calculation
    const workerCountInput = document.getElementById("workerCount");
    const hoursWorkedInput = document.getElementById("hoursWorked");
    const hourlyRateInput = document.getElementById("hourlyRate");
    const totalLabourCostDisplay = document.getElementById("liveLabourCost");

    function updateLabourTotal() {
        if (!workerCountInput || !hoursWorkedInput || !hourlyRateInput || !totalLabourCostDisplay) return;
        const workers = parseFloat(workerCountInput.value) || 0;
        const hours = parseFloat(hoursWorkedInput.value) || 0;
        const rate = parseFloat(hourlyRateInput.value) || 0;
        const total = workers * hours * rate;
        totalLabourCostDisplay.textContent = "$" + total.toFixed(2);
        const hiddenInput = document.getElementById("totalLabourCost");
        if (hiddenInput) hiddenInput.value = total.toFixed(2);
    }

    if (workerCountInput && hoursWorkedInput && hourlyRateInput) {
        [workerCountInput, hoursWorkedInput, hourlyRateInput].forEach(inp => {
            inp.addEventListener("input", updateLabourTotal);
        });
        updateLabourTotal();
    }

    // 2. Machine Cost Live Calculation
    const machineHoursInput = document.getElementById("machineHours");
    const machineHourlyRateInput = document.getElementById("machineHourlyRate");
    const qtyProducedInput = document.getElementById("quantityProduced");
    const qtyRejectedInput = document.getElementById("quantityRejected");
    const liveMachineCost = document.getElementById("liveMachineCost");
    const liveNetQty = document.getElementById("liveNetGoodQuantity");

    function updateMachineTotal() {
        if (machineHoursInput && machineHourlyRateInput && liveMachineCost) {
            const h = parseFloat(machineHoursInput.value) || 0;
            const r = parseFloat(machineHourlyRateInput.value) || 0;
            const cost = h * r;
            liveMachineCost.textContent = "$" + cost.toFixed(2);
        }
        if (qtyProducedInput && qtyRejectedInput && liveNetQty) {
            const produced = parseInt(qtyProducedInput.value) || 0;
            const rejected = parseInt(qtyRejectedInput.value) || 0;
            const net = Math.max(0, produced - rejected);
            liveNetQty.textContent = net.toLocaleString();
        }
    }

    if (machineHoursInput && machineHourlyRateInput) {
        [machineHoursInput, machineHourlyRateInput, qtyProducedInput, qtyRejectedInput].forEach(inp => {
            if (inp) inp.addEventListener("input", updateMachineTotal);
        });
        updateMachineTotal();
    }

    // 3. Other Expense Live Calculation
    const expenseQtyInput = document.getElementById("expenseQuantity");
    const expenseUnitPriceInput = document.getElementById("expenseUnitPrice");
    const liveExpenseTotal = document.getElementById("liveExpenseTotal");

    function updateExpenseTotal() {
        if (!expenseQtyInput || !expenseUnitPriceInput || !liveExpenseTotal) return;
        const q = parseFloat(expenseQtyInput.value) || 0;
        const p = parseFloat(expenseUnitPriceInput.value) || 0;
        liveExpenseTotal.textContent = "$" + (q * p).toFixed(2);
    }

    if (expenseQtyInput && expenseUnitPriceInput) {
        [expenseQtyInput, expenseUnitPriceInput].forEach(inp => inp.addEventListener("input", updateExpenseTotal));
        updateExpenseTotal();
    }

    // 4. Production Cost & Profit Analysis Live Recalculation
    const matCostInput = document.getElementById("rawMaterialCost");
    const labCostInput = document.getElementById("labourCost");
    const machCostInput = document.getElementById("machineCost");
    const otherCostInput = document.getElementById("otherExpenseCost");
    const producedQtyInput = document.getElementById("analysisProducedQty");
    const soldQtyInput = document.getElementById("actualSoldQuantity");
    const sellingPriceInput = document.getElementById("sellingPricePerUnit");

    function updateAnalysisTotals() {
        if (!matCostInput || !labCostInput || !machCostInput || !otherCostInput) return;
        const mat = parseFloat(matCostInput.value) || 0;
        const lab = parseFloat(labCostInput.value) || 0;
        const mach = parseFloat(machCostInput.value) || 0;
        const other = parseFloat(otherCostInput.value) || 0;

        const totalCost = mat + lab + mach + other;
        const producedQty = parseInt(producedQtyInput ? producedQtyInput.value : 0) || 0;
        const costPerUnit = (producedQty > 0) ? (totalCost / producedQty) : 0;

        const soldQty = parseInt(soldQtyInput ? soldQtyInput.value : 0) || 0;
        const price = parseFloat(sellingPriceInput ? sellingPriceInput.value : 0) || 0;

        const liveTotalCost = document.getElementById("liveTotalCost");
        const liveCostPerUnit = document.getElementById("liveCostPerUnit");
        const liveRevenue = document.getElementById("liveRevenue");
        const liveProfit = document.getElementById("liveProfit");
        const liveMargin = document.getElementById("liveProfitMargin");

        if (liveTotalCost) liveTotalCost.textContent = "$" + totalCost.toFixed(2);
        if (liveCostPerUnit) liveCostPerUnit.textContent = "$" + costPerUnit.toFixed(4);

        if (soldQty > 0 && price > 0) {
            const revenue = soldQty * price;
            const cogs = costPerUnit * soldQty;
            const profit = revenue - cogs;
            const margin = (revenue > 0) ? ((profit / revenue) * 100) : 0;

            if (liveRevenue) liveRevenue.textContent = "$" + revenue.toFixed(2);
            if (liveProfit) liveProfit.textContent = "$" + profit.toFixed(2);
            if (liveMargin) liveMargin.textContent = margin.toFixed(2) + "%";
        } else {
            if (liveRevenue) liveRevenue.textContent = "Unsold / $0.00";
            if (liveProfit) liveProfit.textContent = "$0.00 (Pending Sale)";
            if (liveMargin) liveMargin.textContent = "0.00%";
        }
    }

    [matCostInput, labCostInput, machCostInput, otherCostInput, producedQtyInput, soldQtyInput, sellingPriceInput].forEach(inp => {
        if (inp) inp.addEventListener("input", updateAnalysisTotals);
    });
    updateAnalysisTotals();
}

function initConfirmDialogs() {
    document.querySelectorAll("[data-confirm]").forEach(btn => {
        btn.addEventListener("click", function(e) {
            const msg = this.getAttribute("data-confirm") || "Are you sure you want to perform this action?";
            if (!confirm(msg)) {
                e.preventDefault();
            }
        });
    });
}
'''
    write("src/main/resources/static/js/main.js", js)

if __name__ == "__main__":
    build_resources_and_templates()
