#!/usr/bin/env python3
import os

BASE = "production_cost_springboot"

def write(path, content):
    full = os.path.join(BASE, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w", encoding="utf-8") as f:
        f.write(content.strip() + "\n")
    print(f"Created: {path}")

def get_sidebar_html(active):
    def act(page):
        return 'active' if page == active else ''
    
    return '''
    <aside class="app-sidebar">
        <div class="brand-header">
            <div style="width:36px; height:36px; background:#0ea5e9; border-radius:8px; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:800; font-size:1.1rem;">
                SP
            </div>
            <div>
                <h1 class="brand-title">Seagull Printers</h1>
                <p class="brand-subtitle">Cost Analysis & Stock</p>
            </div>
        </div>

        <nav class="sidebar-nav">
            <div class="nav-section-label">Main Console</div>
            <a href="/dashboard" class="nav-link-custom ''' + act('dashboard') + '''">
                <i class="bi bi-grid-fill"></i> Dashboard
            </a>

            <div class="nav-section-label">Manufacturing Operations</div>
            <a href="/products" class="nav-link-custom ''' + act('products') + '''">
                <i class="bi bi-box-seam-fill"></i> Product Catalog
            </a>
            <a href="/raw-materials" class="nav-link-custom ''' + act('raw-materials') + '''">
                <i class="bi bi-layers-fill"></i> Raw Materials & Stock
            </a>
            <a href="/machine-productions" class="nav-link-custom ''' + act('machine-productions') + '''">
                <i class="bi bi-gear-wide-connected"></i> Machine Production
            </a>

            <div class="nav-section-label">Cost Centers</div>
            <a href="/labour-costs" class="nav-link-custom ''' + act('labour-costs') + '''">
                <i class="bi bi-people-fill"></i> Labour Costs
            </a>
            <a href="/other-expenses" class="nav-link-custom ''' + act('other-expenses') + '''">
                <i class="bi bi-receipt-cutoff"></i> Other Expenses
            </a>

            <div class="nav-section-label">Financial Analytics</div>
            <a href="/production-cost-analysis" class="nav-link-custom ''' + act('production-cost-analysis') + '''">
                <i class="bi bi-calculator-fill"></i> Cost & Profit Analysis
            </a>
        </nav>

        <div class="sidebar-user">
            <div class="d-flex align-items-center justify-content-between">
                <div>
                    <div class="fw-bold text-white small" sec:authentication="name">Operator</div>
                    <div class="text-muted" style="font-size:0.75rem;">Seagull Printers Team</div>
                </div>
                <form th:action="@{/logout}" method="post" class="m-0">
                    <button type="submit" class="btn btn-sm btn-outline-danger" title="Logout">
                        <i class="bi bi-box-arrow-right"></i>
                    </button>
                </form>
            </div>
        </div>
    </aside>
    '''

def build_templates():
    # 1. login.html
    login_html = '''<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Seagull Printers Cost Analysis</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="stylesheet" th:href="@{/css/style.css}">
    <style>
        body {
            background: linear-gradient(135deg, #071727 0%, #0c2340 50%, #034b75 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 1.5rem;
        }
        .login-card {
            max-width: 440px;
            width: 100%;
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        .login-header {
            background: #0c2340;
            color: #ffffff;
            padding: 2rem 2rem 1.5rem;
            text-align: center;
        }
    </style>
</head>
<body>
<div class="login-card">
    <div class="login-header">
        <div class="d-inline-flex align-items-center justify-content-center bg-info text-white rounded-3 mb-2" style="width:48px; height:48px; font-weight:800; font-size:1.4rem;">
            SP
        </div>
        <h4 class="fw-bold mb-1">Seagull Printers</h4>
        <p class="text-white-50 small mb-0">Production Cost Analysis & Stock Automation</p>
    </div>
    <div class="p-4 p-md-5">
        <div th:if="${errorMessage}" class="alert alert-danger py-2 small" th:text="${errorMessage}"></div>
        <div th:if="${logoutMessage}" class="alert alert-success py-2 small" th:text="${logoutMessage}"></div>

        <form th:action="@{/login}" method="post">
            <div class="mb-3">
                <label class="form-label small fw-semibold">Username</label>
                <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-person"></i></span>
                    <input type="text" name="username" class="form-control" placeholder="Enter username (e.g. admin)" required autofocus>
                </div>
            </div>

            <div class="mb-4">
                <label class="form-label small fw-semibold">Password</label>
                <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-lock"></i></span>
                    <input type="password" name="password" class="form-control" placeholder="Enter password (e.g. seagull123)" required>
                </div>
            </div>

            <button type="submit" class="btn btn-primary w-100 py-2 fw-semibold" style="background:#0284c7; border-color:#0284c7;">
                Sign In to System
            </button>
        </form>

        <div class="mt-4 pt-3 border-top text-center text-muted small">
            <p class="mb-1"><strong>Default Demo Accounts:</strong></p>
            <p class="mb-0 text-secondary">admin / manager / staff &bull; Password: <code>seagull123</code></p>
        </div>
    </div>
</div>
</body>
</html>'''
    write("src/main/resources/templates/login.html", login_html)

    # 2. dashboard.html
    dash_html = '''<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org" xmlns:sec="http://www.thymeleaf.org/extras/spring-security">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Seagull Printers Production Cost Analysis</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="stylesheet" th:href="@{/css/style.css}">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>

''' + get_sidebar_html('dashboard') + '''

<main class="main-wrapper">
    <div class="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div>
            <h2 class="fw-bold mb-0 text-navy">Executive Production Dashboard</h2>
            <p class="text-muted small mb-0">Real-time automation metrics, inventory levels, and production financial analytics.</p>
        </div>
        <div class="d-flex gap-2 mt-2 mt-md-0">
            <a href="/machine-productions/new" class="btn btn-primary btn-sm">
                <i class="bi bi-plus-circle me-1"></i> New Production Run
            </a>
            <a href="/production-cost-analysis/new" class="btn btn-outline-primary btn-sm">
                <i class="bi bi-calculator me-1"></i> Cost Analysis
            </a>
        </div>
    </div>

    <!-- Alert for Low Stock Materials -->
    <div th:if="${metrics.lowStockCount > 0}" class="alert alert-warning alert-dismissible fade show d-flex align-items-center mb-4 shadow-sm" role="alert">
        <i class="bi bi-exclamation-triangle-fill fs-4 me-3 text-warning"></i>
        <div>
            <strong>Low Inventory Warning:</strong> There are <span class="badge bg-danger" th:text="${metrics.lowStockCount}">0</span> raw material items that have fallen below their safety reorder thresholds!
            <a href="/raw-materials" class="alert-link ms-2">Review stock & replenish &rarr;</a>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>

    <!-- Metric Cards Grid -->
    <div class="row g-3 mb-4">
        <div class="col-sm-6 col-xl-3">
            <div class="metric-card border-start border-4 border-primary">
                <div class="metric-label">Active Products</div>
                <div class="metric-value" th:text="${metrics.totalProducts}">0</div>
                <small class="text-muted">Standard print catalog items</small>
            </div>
        </div>
        <div class="col-sm-6 col-xl-3">
            <div class="metric-card border-start border-4 border-info">
                <div class="metric-label">Raw Material Stock</div>
                <div class="metric-value" th:text="${metrics.totalMaterials}">0</div>
                <small class="text-muted">Valued at $<span th:text="${#numbers.formatDecimal(metrics.inventoryValue, 1, 'COMMA', 2, 'POINT')}">0.00</span></small>
            </div>
        </div>
        <div class="col-sm-6 col-xl-3">
            <div class="metric-card border-start border-4 border-warning">
                <div class="metric-label">Units Produced</div>
                <div class="metric-value" th:text="${#numbers.formatInteger(metrics.totalUnitsProduced, 1, 'COMMA')}">0</div>
                <small class="text-danger"><i class="bi bi-x-circle me-1"></i><span th:text="${metrics.totalUnitsRejected}">0</span> rejected defect units</small>
            </div>
        </div>
        <div class="col-sm-6 col-xl-3">
            <div class="metric-card border-start border-4 border-success">
                <div class="metric-label">Realized Profit</div>
                <div class="metric-value text-success">$<span th:text="${#numbers.formatDecimal(metrics.totalRealizedProfit, 1, 'COMMA', 2, 'POINT')}">0.00</span></div>
                <small class="text-muted">From actual customer sales records</small>
            </div>
        </div>
    </div>

    <!-- Cost Breakdown & Production Trends Charts -->
    <div class="row g-4 mb-4">
        <div class="col-lg-7">
            <div class="card border-0 shadow-sm p-4 h-100">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5 class="fw-bold mb-0">Production Cost Allocation Breakdown</h5>
                    <span class="badge bg-light text-secondary border">Automated</span>
                </div>
                <div style="height: 280px; position: relative;">
                    <canvas id="costBreakdownChart"></canvas>
                </div>
            </div>
        </div>
        <div class="col-lg-5">
            <div class="card border-0 shadow-sm p-4 h-100">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5 class="fw-bold mb-0">Total Manufacturing Expense</h5>
                    <span class="badge bg-primary">All-Time</span>
                </div>
                <ul class="list-group list-group-flush mb-3">
                    <li class="list-group-item d-flex justify-content-between align-items-center px-0">
                        <span><i class="bi bi-circle-fill text-primary me-2"></i>Total Machine Cost</span>
                        <span class="fw-bold">$<span th:text="${#numbers.formatDecimal(metrics.totalMachineCosts, 1, 'COMMA', 2, 'POINT')}">0.00</span></span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-center px-0">
                        <span><i class="bi bi-circle-fill text-warning me-2"></i>Total Labour Cost</span>
                        <span class="fw-bold">$<span th:text="${#numbers.formatDecimal(metrics.totalLabourCosts, 1, 'COMMA', 2, 'POINT')}">0.00</span></span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-center px-0">
                        <span><i class="bi bi-circle-fill text-info me-2"></i>Other Expenses (Overheads)</span>
                        <span class="fw-bold">$<span th:text="${#numbers.formatDecimal(metrics.totalOtherExpenses, 1, 'COMMA', 2, 'POINT')}">0.00</span></span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-center px-0 bg-light p-2 rounded mt-2">
                        <span class="fw-bold">Total Aggregated Production Cost</span>
                        <span class="fw-bold text-navy fs-5">$<span th:text="${#numbers.formatDecimal(metrics.totalProductionCosts, 1, 'COMMA', 2, 'POINT')}">0.00</span></span>
                    </li>
                </ul>
                <div class="p-3 bg-light rounded text-muted small">
                    <i class="bi bi-shield-check text-success me-1"></i> Fully automated formula: <code>Total Cost = Material + Labour + Machine + Expenses</code>
                </div>
            </div>
        </div>
    </div>

    <!-- Recent Production Runs Table -->
    <div class="card border-0 shadow-sm p-4 mb-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="fw-bold mb-0">Recent Production Runs</h5>
            <a href="/machine-productions" class="btn btn-outline-secondary btn-sm">View All Orders</a>
        </div>
        <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                    <tr>
                        <th>Order Code</th>
                        <th>Product Item</th>
                        <th>Batch #</th>
                        <th>Produced Qty</th>
                        <th>Net Good</th>
                        <th>Machine Total</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr th:each="p : ${metrics.recentProductions}">
                        <td class="fw-bold" th:text="${p.productionCode}">PROD-001</td>
                        <td th:text="${p.product != null ? p.product.name : 'N/A'}">Brochure</td>
                        <td><span class="badge bg-secondary" th:text="${p.batchNumber}">BATCH</span></td>
                        <td th:text="${#numbers.formatInteger(p.quantityProduced, 1, 'COMMA')}">1000</td>
                        <td class="text-success fw-bold" th:text="${#numbers.formatInteger(p.netGoodQuantity, 1, 'COMMA')}">980</td>
                        <td>$<span th:text="${#numbers.formatDecimal(p.totalMachineCost, 1, 'COMMA', 2, 'POINT')}">0.00</span></td>
                        <td>
                            <span class="badge bg-success" th:if="${p.status == 'COMPLETED'}" th:text="${p.status}">COMPLETED</span>
                            <span class="badge bg-primary" th:if="${p.status != 'COMPLETED'}" th:text="${p.status}">IN_PROGRESS</span>
                        </td>
                        <td>
                            <a th:href="@{'/machine-productions/edit/' + ${p.id}}" class="btn btn-sm btn-outline-primary">Manage</a>
                        </td>
                    </tr>
                    <tr th:if="${#lists.isEmpty(metrics.recentProductions)}">
                        <td colspan="8" class="text-center text-muted py-4">No production runs recorded yet.</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</main>

<script th:inline="javascript">
    const machineCost = /*[[${metrics.totalMachineCosts}]]*/ 300.0;
    const labourCost = /*[[${metrics.totalLabourCosts}]]*/ 400.0;
    const otherCost = /*[[${metrics.totalOtherExpenses}]]*/ 200.0;

    const ctx = document.getElementById('costBreakdownChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Machine Operational Costs', 'Direct Labour Costs', 'Other Overhead Expenses'],
            datasets: [{
                data: [machineCost, labourCost, otherCost],
                backgroundColor: ['#0284c7', '#f59e0b', '#06b6d4'],
                hoverOffset: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
</script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script th:src="@{/js/main.js}"></script>
</body>
</html>'''
    write("src/main/resources/templates/dashboard.html", dash_html)

    # 3. products.html
    prod_html = '''<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Products - Seagull Printers Cost Analysis</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="stylesheet" th:href="@{/css/style.css}">
</head>
<body>
''' + get_sidebar_html('products') + '''

<main class="main-wrapper">
    <div class="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div>
            <h2 class="fw-bold mb-0">Product Management</h2>
            <p class="text-muted small mb-0">Catalog of print jobs, specifications, and baseline pricing.</p>
        </div>
        <div>
            <a href="/products/new" class="btn btn-primary btn-sm">
                <i class="bi bi-plus-lg me-1"></i> Add New Product
            </a>
        </div>
    </div>

    <div th:if="${successMessage}" class="alert alert-success py-2" th:text="${successMessage}"></div>
    <div th:if="${errorMessage}" class="alert alert-danger py-2" th:text="${errorMessage}"></div>

    <div class="card border-0 shadow-sm p-4 mb-4">
        <form th:action="@{/products}" method="get" class="row g-2 mb-3">
            <div class="col-md-5">
                <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-search"></i></span>
                    <input type="text" name="search" th:value="${search}" class="form-control" placeholder="Search by name, code, or category...">
                    <button class="btn btn-outline-secondary" type="submit">Search</button>
                    <a th:if="${search != null and !search.isEmpty()}" href="/products" class="btn btn-outline-danger">Clear</a>
                </div>
            </div>
        </form>

        <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                    <tr>
                        <th>Code</th>
                        <th>Product Name</th>
                        <th>Category</th>
                        <th>Std Cost</th>
                        <th>Std Selling Price</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr th:each="p : ${products}">
                        <td class="fw-bold" th:text="${p.productCode}">PRD-001</td>
                        <td th:text="${p.name}">Flyer</td>
                        <td><span class="badge bg-light text-dark border" th:text="${p.category}">Marketing</span></td>
                        <td>$<span th:text="${#numbers.formatDecimal(p.standardCost, 1, 'COMMA', 2, 'POINT')}">0.00</span></td>
                        <td class="fw-bold text-navy">$<span th:text="${#numbers.formatDecimal(p.standardSellingPrice, 1, 'COMMA', 2, 'POINT')}">0.00</span></td>
                        <td>
                            <span th:if="${p.active}" class="badge bg-success">Active</span>
                            <span th:unless="${p.active}" class="badge bg-secondary">Archived</span>
                        </td>
                        <td>
                            <a th:href="@{'/products/edit/' + ${p.id}}" class="btn btn-sm btn-outline-primary me-1"><i class="bi bi-pencil"></i> Edit</a>
                            <a th:href="@{'/products/delete/' + ${p.id}}" class="btn btn-sm btn-outline-danger" data-confirm="Are you sure you want to deactivate this product?"><i class="bi bi-archive"></i></a>
                        </td>
                    </tr>
                    <tr th:if="${#lists.isEmpty(products)}">
                        <td colspan="7" class="text-center text-muted py-4">No products found matching your search.</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</main>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script th:src="@{/js/main.js}"></script>
</body>
</html>'''
    write("src/main/resources/templates/products.html", prod_html)

    # 4. product-form.html
    prod_form_html = '''<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Edit Product - Seagull Printers</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="stylesheet" th:href="@{/css/style.css}">
</head>
<body>
''' + get_sidebar_html('products') + '''

<main class="main-wrapper">
    <div class="mb-4">
        <a href="/products" class="text-decoration-none small text-muted">&larr; Back to Products</a>
        <h2 class="fw-bold mb-0" th:text="${isNew ? 'Create New Product' : 'Edit Product Details'}">Product Form</h2>
    </div>

    <div class="card border-0 shadow-sm p-4" style="max-width: 800px;">
        <form th:action="@{/products/save}" th:object="${product}" method="post">
            <input type="hidden" th:field="*{id}">

            <div class="row g-3 mb-3">
                <div class="col-md-4">
                    <label class="form-label small fw-semibold">Product Code (Auto-generated)</label>
                    <input type="text" th:field="*{productCode}" class="form-control" readonly style="background:#f8fafc;">
                </div>
                <div class="col-md-8">
                    <label class="form-label small fw-semibold">Product Name <span class="text-danger">*</span></label>
                    <input type="text" th:field="*{name}" class="form-control" required placeholder="e.g. A4 Gloss Tri-Fold Brochure">
                    <div class="text-danger small" th:if="${#fields.hasErrors('name')}" th:errors="*{name}"></div>
                </div>
            </div>

            <div class="row g-3 mb-3">
                <div class="col-md-4">
                    <label class="form-label small fw-semibold">Category <span class="text-danger">*</span></label>
                    <input type="text" th:field="*{category}" class="form-control" required placeholder="e.g. Marketing Collateral">
                </div>
                <div class="col-md-4">
                    <label class="form-label small fw-semibold">Standard Cost ($)</label>
                    <input type="number" step="0.01" th:field="*{standardCost}" class="form-control" required>
                </div>
                <div class="col-md-4">
                    <label class="form-label small fw-semibold">Standard Selling Price ($)</label>
                    <input type="number" step="0.01" th:field="*{standardSellingPrice}" class="form-control" required>
                </div>
            </div>

            <div class="mb-3">
                <label class="form-label small fw-semibold">Description / Printing Specifications</label>
                <textarea th:field="*{description}" class="form-control" rows="3" placeholder="Paper type, ink specifications, finishing requirements..."></textarea>
            </div>

            <div class="form-check form-switch mb-4">
                <input class="form-check-input" type="checkbox" th:field="*{active}" id="activeSwitch">
                <label class="form-check-label small fw-semibold" for="activeSwitch">Active in production catalog</label>
            </div>

            <div class="d-flex gap-2">
                <button type="submit" class="btn btn-primary px-4">Save Product</button>
                <a href="/products" class="btn btn-outline-secondary">Cancel</a>
            </div>
        </form>
    </div>
</main>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script th:src="@{/js/main.js}"></script>
</body>
</html>'''
    write("src/main/resources/templates/product-form.html", prod_form_html)

    # 5. raw-materials.html
    raw_html = '''<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Raw Materials & Stock - Seagull Printers</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="stylesheet" th:href="@{/css/style.css}">
</head>
<body>
''' + get_sidebar_html('raw-materials') + '''

<main class="main-wrapper">
    <div class="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div>
            <h2 class="fw-bold mb-0">Raw Materials & Stock Inventory</h2>
            <p class="text-muted small mb-0">Track stock movements, purchases, consumption deductions, and reorder levels.</p>
        </div>
        <div class="d-flex gap-2">
            <button class="btn btn-outline-primary btn-sm" data-bs-toggle="modal" data-bs-target="#purchaseModal">
                <i class="bi bi-cart-plus me-1"></i> Stock Purchase Order
            </button>
            <a href="/raw-materials/new" class="btn btn-primary btn-sm">
                <i class="bi bi-plus-lg me-1"></i> New Material Definition
            </a>
        </div>
    </div>

    <div th:if="${successMessage}" class="alert alert-success py-2" th:text="${successMessage}"></div>
    <div th:if="${errorMessage}" class="alert alert-danger py-2" th:text="${errorMessage}"></div>

    <div class="card border-0 shadow-sm p-4 mb-4">
        <form th:action="@{/raw-materials}" method="get" class="row g-2 mb-3">
            <div class="col-md-5">
                <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-search"></i></span>
                    <input type="text" name="search" th:value="${search}" class="form-control" placeholder="Search materials by code or name...">
                    <button class="btn btn-outline-secondary" type="submit">Search</button>
                    <a th:if="${search != null and !search.isEmpty()}" href="/raw-materials" class="btn btn-outline-danger">Clear</a>
                </div>
            </div>
        </form>

        <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                    <tr>
                        <th>Material Code</th>
                        <th>Material Name</th>
                        <th>Category</th>
                        <th>Unit</th>
                        <th>Unit Price</th>
                        <th>Current Stock</th>
                        <th>Min Alert</th>
                        <th>Stock Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr th:each="m : ${materials}">
                        <td class="fw-bold" th:text="${m.materialCode}">MAT-001</td>
                        <td th:text="${m.name}">Gloss Art Paper</td>
                        <td><span class="badge bg-light text-dark border" th:text="${m.category}">Paper</span></td>
                        <td th:text="${m.unit}">Reams</td>
                        <td>$<span th:text="${#numbers.formatDecimal(m.unitPrice, 1, 'COMMA', 2, 'POINT')}">0.00</span></td>
                        <td class="fw-bold" th:text="${#numbers.formatDecimal(m.currentStock, 1, 'COMMA', 2, 'POINT')}">100.00</td>
                        <td class="text-muted" th:text="${#numbers.formatDecimal(m.minimumStockAlert, 1, 'COMMA', 2, 'POINT')}">10.00</td>
                        <td>
                            <span th:if="${m.isLowStock()}" class="badge badge-low-stock">
                                <i class="bi bi-exclamation-triangle me-1"></i> LOW STOCK
                            </span>
                            <span th:unless="${m.isLowStock()}" class="badge badge-in-stock">
                                <i class="bi bi-check-circle me-1"></i> Available
                            </span>
                        </td>
                        <td>
                            <a th:href="@{'/raw-materials/edit/' + ${m.id}}" class="btn btn-sm btn-outline-primary"><i class="bi bi-pencil"></i> View / Audit</a>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</main>

<!-- Purchase Stock Modal -->
<div class="modal fade" id="purchaseModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <form th:action="@{/raw-materials/purchase}" method="post">
                <div class="modal-header">
                    <h5 class="modal-title fw-bold">Record Stock Purchase</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label small fw-semibold">Select Material</label>
                        <select name="materialId" class="form-select" required>
                            <option th:each="mat : ${materials}" th:value="${mat.id}" th:text="${mat.materialCode + ' - ' + mat.name + ' (' + mat.unit + ')'}"></option>
                        </select>
                    </div>
                    <div class="row g-2 mb-3">
                        <div class="col-6">
                            <label class="form-label small fw-semibold">Purchase Quantity</label>
                            <input type="number" step="0.01" name="quantity" class="form-control" required min="0.01">
                        </div>
                        <div class="col-6">
                            <label class="form-label small fw-semibold">Unit Price ($)</label>
                            <input type="number" step="0.01" name="unitPrice" class="form-control" placeholder="Leave blank for standard">
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label small fw-semibold">Supplier / Reference Note</label>
                        <input type="text" name="notes" class="form-control" placeholder="e.g. Supplier PO #4092">
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">Add to Stock</button>
                </div>
            </form>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script th:src="@{/js/main.js}"></script>
</body>
</html>'''
    write("src/main/resources/templates/raw-materials.html", raw_html)

    # 6. raw-material-form.html
    raw_form_html = '''<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Raw Material Details - Seagull Printers</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="stylesheet" th:href="@{/css/style.css}">
</head>
<body>
''' + get_sidebar_html('raw-materials') + '''

<main class="main-wrapper">
    <div class="mb-4">
        <a href="/raw-materials" class="text-decoration-none small text-muted">&larr; Back to Raw Materials</a>
        <h2 class="fw-bold mb-0" th:text="${isNew ? 'Register New Raw Material' : 'Edit Material & Stock Movement History'}">Material Form</h2>
    </div>

    <div class="row g-4">
        <div class="col-lg-6">
            <div class="card border-0 shadow-sm p-4">
                <h5 class="fw-bold mb-3">Material Profile</h5>
                <form th:action="@{/raw-materials/save}" th:object="${material}" method="post">
                    <input type="hidden" th:field="*{id}">

                    <div class="row g-3 mb-3">
                        <div class="col-md-5">
                            <label class="form-label small fw-semibold">Material Code</label>
                            <input type="text" th:field="*{materialCode}" class="form-control" readonly style="background:#f8fafc;">
                        </div>
                        <div class="col-md-7">
                            <label class="form-label small fw-semibold">Material Name <span class="text-danger">*</span></label>
                            <input type="text" th:field="*{name}" class="form-control" required placeholder="e.g. Cyan Offset Ink">
                        </div>
                    </div>

                    <div class="row g-3 mb-3">
                        <div class="col-md-6">
                            <label class="form-label small fw-semibold">Category <span class="text-danger">*</span></label>
                            <input type="text" th:field="*{category}" class="form-control" required placeholder="Paper, Ink, Chemicals...">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label small fw-semibold">Measurement Unit <span class="text-danger">*</span></label>
                            <input type="text" th:field="*{unit}" class="form-control" required placeholder="Sheets, Reams, Kg, Liters...">
                        </div>
                    </div>

                    <div class="row g-3 mb-3">
                        <div class="col-md-4">
                            <label class="form-label small fw-semibold">Unit Price ($)</label>
                            <input type="number" step="0.01" th:field="*{unitPrice}" class="form-control" required>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label small fw-semibold">Opening Stock</label>
                            <input type="number" step="0.01" th:field="*{openingStock}" class="form-control" required>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label small fw-semibold">Current Stock</label>
                            <input type="number" step="0.01" th:field="*{currentStock}" class="form-control" required>
                        </div>
                    </div>

                    <div class="mb-4">
                        <label class="form-label small fw-semibold">Minimum Safety Stock Alert Threshold</label>
                        <input type="number" step="0.01" th:field="*{minimumStockAlert}" class="form-control" required>
                        <div class="form-text small">Alert triggers automatically when current stock &le; threshold.</div>
                    </div>

                    <div class="d-flex gap-2">
                        <button type="submit" class="btn btn-primary px-4">Save Material</button>
                        <a href="/raw-materials" class="btn btn-outline-secondary">Cancel</a>
                    </div>
                </form>
            </div>
        </div>

        <!-- Stock Movement History (Audit Trail) -->
        <div class="col-lg-6" th:if="${!isNew}">
            <div class="card border-0 shadow-sm p-4 h-100">
                <h5 class="fw-bold mb-3"><i class="bi bi-clock-history me-2 text-primary"></i>Stock Movement Ledger</h5>
                <div class="table-responsive" style="max-height: 400px; overflow-y:auto;">
                    <table class="table table-sm align-middle">
                        <thead class="table-light">
                            <tr>
                                <th>Type</th>
                                <th>Quantity</th>
                                <th>Total Cost</th>
                                <th>Note / Order</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr th:each="mov : ${movements}">
                                <td>
                                    <span th:if="${mov.movementType == 'PURCHASE'}" class="badge bg-success">PURCHASE</span>
                                    <span th:if="${mov.movementType == 'PRODUCTION_CONSUMPTION'}" class="badge bg-danger">CONSUMED</span>
                                    <span th:if="${mov.movementType == 'OPENING'}" class="badge bg-secondary">OPENING</span>
                                </td>
                                <td class="fw-semibold" th:text="${#numbers.formatDecimal(mov.quantity, 1, 'COMMA', 2, 'POINT')}">0</td>
                                <td>$<span th:text="${#numbers.formatDecimal(mov.totalCost, 1, 'COMMA', 2, 'POINT')}">0.00</span></td>
                                <td class="small text-muted" th:text="${mov.referenceNote}">Note</td>
                            </tr>
                            <tr th:if="${#lists.isEmpty(movements)}">
                                <td colspan="4" class="text-center text-muted py-3">No movement logs recorded yet.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</main>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script th:src="@{/js/main.js}"></script>
</body>
</html>'''
    write("src/main/resources/templates/raw-material-form.html", raw_form_html)

    # 7. machine-productions.html
    mach_html = '''<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Machine Productions - Seagull Printers</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="stylesheet" th:href="@{/css/style.css}">
</head>
<body>
''' + get_sidebar_html('machine-productions') + '''

<main class="main-wrapper">
    <div class="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div>
            <h2 class="fw-bold mb-0">Machine & Production Orders</h2>
            <p class="text-muted small mb-0">Record press runs, machine hours, rejected defect tracking, and material consumption.</p>
        </div>
        <div>
            <a href="/machine-productions/new" class="btn btn-primary btn-sm">
                <i class="bi bi-plus-lg me-1"></i> New Production Run
            </a>
        </div>
    </div>

    <div th:if="${successMessage}" class="alert alert-success py-2" th:text="${successMessage}"></div>
    <div th:if="${errorMessage}" class="alert alert-danger py-2" th:text="${errorMessage}"></div>

    <div class="card border-0 shadow-sm p-4 mb-4">
        <form th:action="@{/machine-productions}" method="get" class="row g-2 mb-3">
            <div class="col-md-5">
                <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-search"></i></span>
                    <input type="text" name="search" th:value="${search}" class="form-control" placeholder="Search orders by code, batch, product...">
                    <button class="btn btn-outline-secondary" type="submit">Search</button>
                </div>
            </div>
        </form>

        <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                    <tr>
                        <th>Order #</th>
                        <th>Product Item</th>
                        <th>Batch Number</th>
                        <th>Produced Qty</th>
                        <th>Rejected</th>
                        <th>Net Good Qty</th>
                        <th>Machine Cost</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr th:each="p : ${productions}">
                        <td class="fw-bold" th:text="${p.productionCode}">PROD-001</td>
                        <td th:text="${p.product != null ? p.product.name : 'Unknown'}">Brochure</td>
                        <td><span class="badge bg-secondary" th:text="${p.batchNumber}">BATCH-01</span></td>
                        <td th:text="${#numbers.formatInteger(p.quantityProduced, 1, 'COMMA')}">1000</td>
                        <td class="text-danger fw-semibold" th:text="${#numbers.formatInteger(p.quantityRejected, 1, 'COMMA')}">20</td>
                        <td class="text-success fw-bold" th:text="${#numbers.formatInteger(p.netGoodQuantity, 1, 'COMMA')}">980</td>
                        <td>$<span th:text="${#numbers.formatDecimal(p.totalMachineCost, 1, 'COMMA', 2, 'POINT')}">0.00</span></td>
                        <td th:text="${p.productionDate}">2024-09-15</td>
                        <td>
                            <span class="badge bg-success" th:if="${p.status == 'COMPLETED'}">COMPLETED</span>
                            <span class="badge bg-warning text-dark" th:if="${p.status == 'IN_PROGRESS'}">IN PROGRESS</span>
                        </td>
                        <td>
                            <a th:href="@{'/machine-productions/edit/' + ${p.id}}" class="btn btn-sm btn-outline-primary me-1"><i class="bi bi-pencil"></i> Manage</a>
                            <a th:href="@{'/machine-productions/delete/' + ${p.id}}" class="btn btn-sm btn-outline-danger" data-confirm="Delete this production run?"><i class="bi bi-trash"></i></a>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</main>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script th:src="@{/js/main.js}"></script>
</body>
</html>'''
    write("src/main/resources/templates/machine-productions.html", mach_html)

    # 8. machine-production-form.html
    mach_form_html = '''<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Production Order - Seagull Printers</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="stylesheet" th:href="@{/css/style.css}">
</head>
<body>
''' + get_sidebar_html('machine-productions') + '''

<main class="main-wrapper">
    <div class="mb-4">
        <a href="/machine-productions" class="text-decoration-none small text-muted">&larr; Back to Production Orders</a>
        <h2 class="fw-bold mb-0" th:text="${isNew ? 'Create Machine Production Order' : 'Manage Production Order #' + production.productionCode}">Order Form</h2>
    </div>

    <div th:if="${successMessage}" class="alert alert-success py-2" th:text="${successMessage}"></div>
    <div th:if="${errorMessage}" class="alert alert-danger py-2" th:text="${errorMessage}"></div>

    <div class="row g-4">
        <div class="col-lg-7">
            <div class="card border-0 shadow-sm p-4">
                <h5 class="fw-bold mb-3">Production Parameters</h5>
                <form th:action="@{/machine-productions/save}" th:object="${production}" method="post">
                    <input type="hidden" th:field="*{id}">

                    <div class="row g-3 mb-3">
                        <div class="col-md-6">
                            <label class="form-label small fw-semibold">Order Code</label>
                            <input type="text" th:field="*{productionCode}" class="form-control" readonly style="background:#f8fafc;">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label small fw-semibold">Batch Number <span class="text-danger">*</span></label>
                            <input type="text" th:field="*{batchNumber}" class="form-control" required>
                        </div>
                    </div>

                    <div class="row g-3 mb-3">
                        <div class="col-md-6">
                            <label class="form-label small fw-semibold">Product Item <span class="text-danger">*</span></label>
                            <select th:field="*{product}" class="form-select" required>
                                <option th:each="prod : ${products}" th:value="${prod.id}" th:text="${prod.productCode + ' - ' + prod.name}"></option>
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label small fw-semibold">Machine / Press Line <span class="text-danger">*</span></label>
                            <input type="text" th:field="*{machineName}" class="form-control" required placeholder="e.g. Heidelberg Speedmaster XL 75">
                        </div>
                    </div>

                    <div class="row g-3 mb-3">
                        <div class="col-md-4">
                            <label class="form-label small fw-semibold">Total Qty Produced <span class="text-danger">*</span></label>
                            <input type="number" id="quantityProduced" th:field="*{quantityProduced}" class="form-control" required min="1">
                        </div>
                        <div class="col-md-4">
                            <label class="form-label small fw-semibold">Defect / Rejected Qty</label>
                            <input type="number" id="quantityRejected" th:field="*{quantityRejected}" class="form-control" min="0">
                        </div>
                        <div class="col-md-4">
                            <label class="form-label small fw-semibold">Net Good Quantity</label>
                            <div class="form-control bg-light fw-bold text-success" id="liveNetGoodQuantity">0</div>
                        </div>
                    </div>

                    <div class="row g-3 mb-3">
                        <div class="col-md-4">
                            <label class="form-label small fw-semibold">Machine Hours</label>
                            <input type="number" step="0.1" id="machineHours" th:field="*{machineHours}" class="form-control" required>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label small fw-semibold">Hourly Rate ($)</label>
                            <input type="number" step="0.01" id="machineHourlyRate" th:field="*{machineHourlyRate}" class="form-control" required>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label small fw-semibold">Machine Cost Total</label>
                            <div class="form-control bg-light fw-bold text-navy" id="liveMachineCost">$0.00</div>
                        </div>
                    </div>

                    <div class="row g-3 mb-3">
                        <div class="col-md-6">
                            <label class="form-label small fw-semibold">Production Date <span class="text-danger">*</span></label>
                            <input type="date" th:field="*{productionDate}" class="form-control" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label small fw-semibold">Status</label>
                            <select th:field="*{status}" class="form-select">
                                <option value="IN_PROGRESS">IN_PROGRESS</option>
                                <option value="COMPLETED">COMPLETED</option>
                                <option value="CANCELLED">CANCELLED</option>
                            </select>
                        </div>
                    </div>

                    <div class="mb-4">
                        <label class="form-label small fw-semibold">Notes</label>
                        <textarea th:field="*{notes}" class="form-control" rows="2"></textarea>
                    </div>

                    <div class="d-flex gap-2">
                        <button type="submit" class="btn btn-primary px-4">Save Production Run</button>
                        <a href="/machine-productions" class="btn btn-outline-secondary">Cancel</a>
                    </div>
                </form>
            </div>
        </div>

        <!-- Material Consumption & Automatic Inventory Deduction -->
        <div class="col-lg-5" th:if="${!isNew}">
            <div class="card border-0 shadow-sm p-4 mb-4">
                <h5 class="fw-bold mb-3"><i class="bi bi-box-arrow-down text-primary me-2"></i>Deduct Raw Material</h5>
                <form th:action="@{/machine-productions/consume-material}" method="post">
                    <input type="hidden" name="productionId" th:value="${production.id}">
                    <div class="mb-3">
                        <label class="form-label small fw-semibold">Raw Material</label>
                        <select name="materialId" class="form-select" required>
                            <option th:each="m : ${materials}" th:value="${m.id}" th:text="${m.materialCode + ' - ' + m.name + ' (Avail: ' + m.currentStock + ')'}"></option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label small fw-semibold">Quantity Consumed</label>
                        <input type="number" step="0.01" name="quantity" class="form-control" required min="0.01" placeholder="e.g. 15.00">
                    </div>
                    <div class="mb-3">
                        <label class="form-label small fw-semibold">Consumption Reference Note</label>
                        <input type="text" name="notes" class="form-control" placeholder="e.g. 15 reams used for batch print">
                    </div>
                    <button type="submit" class="btn btn-warning w-100 fw-semibold text-dark">
                        <i class="bi bi-arrow-down-circle me-1"></i> Deduct from Inventory & Link
                    </button>
                </form>
            </div>

            <div class="card border-0 shadow-sm p-4">
                <h6 class="fw-bold mb-3">Materials Consumed in this Order</h6>
                <div class="table-responsive">
                    <table class="table table-sm align-middle">
                        <thead class="table-light">
                            <tr>
                                <th>Material</th>
                                <th>Qty</th>
                                <th>Cost</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr th:each="mov : ${materialMovements}">
                                <td th:text="${mov.rawMaterial != null ? mov.rawMaterial.name : 'Material'}">Paper</td>
                                <td th:text="${#numbers.formatDecimal(mov.quantity, 1, 'COMMA', 2, 'POINT')}">0</td>
                                <td class="fw-semibold">$<span th:text="${#numbers.formatDecimal(mov.totalCost, 1, 'COMMA', 2, 'POINT')}">0.00</span></td>
                            </tr>
                            <tr th:if="${#lists.isEmpty(materialMovements)}">
                                <td colspan="3" class="text-muted small text-center py-2">No material consumption recorded yet.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</main>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script th:src="@{/js/main.js}"></script>
</body>
</html>'''
    write("src/main/resources/templates/machine-production-form.html", mach_form_html)

    # 9. labour-costs.html & 10. labour-cost-form.html
    labour_html = '''<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Labour Costs - Seagull Printers</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="stylesheet" th:href="@{/css/style.css}">
</head>
<body>
''' + get_sidebar_html('labour-costs') + '''

<main class="main-wrapper">
    <div class="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div>
            <h2 class="fw-bold mb-0">Labour Cost Management</h2>
            <p class="text-muted small mb-0">Operator wages, pre-press setups, bindery labour, and automated hourly calculations.</p>
        </div>
        <div>
            <a href="/labour-costs/new" class="btn btn-primary btn-sm">
                <i class="bi bi-plus-lg me-1"></i> Record Labour Work
            </a>
        </div>
    </div>

    <div th:if="${successMessage}" class="alert alert-success py-2" th:text="${successMessage}"></div>
    <div th:if="${errorMessage}" class="alert alert-danger py-2" th:text="${errorMessage}"></div>

    <div class="card border-0 shadow-sm p-4 mb-4">
        <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                    <tr>
                        <th>Labour Code</th>
                        <th>Work Description</th>
                        <th>Production Order</th>
                        <th>Workers</th>
                        <th>Hours</th>
                        <th>Hourly Rate</th>
                        <th>Total Labour Cost</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr th:each="l : ${labourList}">
                        <td class="fw-bold" th:text="${l.labourCode}">LBR-001</td>
                        <td th:text="${l.workDescription}">Press Operator</td>
                        <td><span class="badge bg-light text-dark border" th:text="${l.machineProduction != null ? l.machineProduction.productionCode : 'General'}">General</span></td>
                        <td th:text="${l.workerCount}">1</td>
                        <td th:text="${l.hoursWorked}">8.0</td>
                        <td>$<span th:text="${#numbers.formatDecimal(l.hourlyRate, 1, 'COMMA', 2, 'POINT')}">0.00</span></td>
                        <td class="fw-bold text-navy">$<span th:text="${#numbers.formatDecimal(l.totalLabourCost, 1, 'COMMA', 2, 'POINT')}">0.00</span></td>
                        <td th:text="${l.recordedDate}">2024-09-15</td>
                        <td>
                            <a th:href="@{'/labour-costs/edit/' + ${l.id}}" class="btn btn-sm btn-outline-primary me-1"><i class="bi bi-pencil"></i></a>
                            <a th:href="@{'/labour-costs/delete/' + ${l.id}}" class="btn btn-sm btn-outline-danger" data-confirm="Delete this labour entry?"><i class="bi bi-trash"></i></a>
                        </td>
                    </tr>
                    <tr th:if="${#lists.isEmpty(labourList)}">
                        <td colspan="9" class="text-center text-muted py-4">No labour costs recorded yet.</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</main>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script th:src="@{/js/main.js}"></script>
</body>
</html>'''
    write("src/main/resources/templates/labour-costs.html", labour_html)

    labour_form_html = '''<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Labour Cost Form - Seagull Printers</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="stylesheet" th:href="@{/css/style.css}">
</head>
<body>
''' + get_sidebar_html('labour-costs') + '''

<main class="main-wrapper">
    <div class="mb-4">
        <a href="/labour-costs" class="text-decoration-none small text-muted">&larr; Back to Labour Costs</a>
        <h2 class="fw-bold mb-0" th:text="${isNew ? 'Record Labour Expense' : 'Edit Labour Record'}">Labour Form</h2>
    </div>

    <div class="card border-0 shadow-sm p-4" style="max-width: 800px;">
        <form th:action="@{/labour-costs/save}" th:object="${labourCost}" method="post">
            <input type="hidden" th:field="*{id}">
            <input type="hidden" id="totalLabourCost" th:field="*{totalLabourCost}">

            <div class="row g-3 mb-3">
                <div class="col-md-4">
                    <label class="form-label small fw-semibold">Labour Code</label>
                    <input type="text" th:field="*{labourCode}" class="form-control" readonly style="background:#f8fafc;">
                </div>
                <div class="col-md-8">
                    <label class="form-label small fw-semibold">Associated Production Order</label>
                    <select th:field="*{machineProduction}" class="form-select">
                        <option value="">-- General Factory Work (Unallocated) --</option>
                        <option th:each="prod : ${productions}" th:value="${prod.id}" th:text="${prod.productionCode + ' - ' + (prod.product != null ? prod.product.name : '')}"></option>
                    </select>
                </div>
            </div>

            <div class="mb-3">
                <label class="form-label small fw-semibold">Work Description <span class="text-danger">*</span></label>
                <input type="text" th:field="*{workDescription}" class="form-control" required placeholder="e.g. Press setup, UV varnish handling, folding & collation">
            </div>

            <div class="row g-3 mb-3">
                <div class="col-md-4">
                    <label class="form-label small fw-semibold">Worker Count</label>
                    <input type="number" id="workerCount" th:field="*{workerCount}" class="form-control" required min="1">
                </div>
                <div class="col-md-4">
                    <label class="form-label small fw-semibold">Hours Worked</label>
                    <input type="number" step="0.1" id="hoursWorked" th:field="*{hoursWorked}" class="form-control" required min="0">
                </div>
                <div class="col-md-4">
                    <label class="form-label small fw-semibold">Hourly Rate ($)</label>
                    <input type="number" step="0.01" id="hourlyRate" th:field="*{hourlyRate}" class="form-control" required min="0">
                </div>
            </div>

            <div class="calc-preview-box mb-4">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <span class="text-muted small fw-semibold text-uppercase">Automated Calculated Total:</span>
                        <div class="fs-4 fw-bold text-navy" id="liveLabourCost">$0.00</div>
                    </div>
                    <div class="text-end text-muted small">
                        Formula: <code>Worker Count &times; Hours &times; Rate</code>
                    </div>
                </div>
            </div>

            <div class="row g-3 mb-4">
                <div class="col-md-6">
                    <label class="form-label small fw-semibold">Recorded Date</label>
                    <input type="date" th:field="*{recordedDate}" class="form-control" required>
                </div>
                <div class="col-md-6">
                    <label class="form-label small fw-semibold">Calculation Method</label>
                    <select th:field="*{calculationMethod}" class="form-select">
                        <option value="HOURLY_RATE">HOURLY_RATE (Workers &times; Hours &times; Rate)</option>
                        <option value="PIECE_RATE">PIECE_RATE (Output Based)</option>
                        <option value="FIXED_CONTRACT">FIXED_CONTRACT (Contractor Rate)</option>
                    </select>
                </div>
            </div>

            <div class="d-flex gap-2">
                <button type="submit" class="btn btn-primary px-4">Save Labour Record</button>
                <a href="/labour-costs" class="btn btn-outline-secondary">Cancel</a>
            </div>
        </form>
    </div>
</main>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script th:src="@{/js/main.js}"></script>
</body>
</html>'''
    write("src/main/resources/templates/labour-cost-form.html", labour_form_html)

    # 11. other-expenses.html & 12. other-expense-form.html
    exp_html = '''<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Other Expenses - Seagull Printers</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="stylesheet" th:href="@{/css/style.css}">
</head>
<body>
''' + get_sidebar_html('other-expenses') + '''

<main class="main-wrapper">
    <div class="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div>
            <h2 class="fw-bold mb-0">Other Expenses & Overheads</h2>
            <p class="text-muted small mb-0">Track electricity, delivery transport, packaging materials, and maintenance costs.</p>
        </div>
        <div>
            <a href="/other-expenses/new" class="btn btn-primary btn-sm">
                <i class="bi bi-plus-lg me-1"></i> Add New Expense
            </a>
        </div>
    </div>

    <div th:if="${successMessage}" class="alert alert-success py-2" th:text="${successMessage}"></div>
    <div th:if="${errorMessage}" class="alert alert-danger py-2" th:text="${errorMessage}"></div>

    <div class="card border-0 shadow-sm p-4 mb-4">
        <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                    <tr>
                        <th>Code</th>
                        <th>Type</th>
                        <th>Description</th>
                        <th>Production Order</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Total Amount</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr th:each="e : ${expenses}">
                        <td class="fw-bold" th:text="${e.expenseCode}">EXP-001</td>
                        <td><span class="badge bg-light text-dark border" th:text="${e.expenseType}">Electricity</span></td>
                        <td th:text="${e.description}">Press power</td>
                        <td><span class="badge bg-secondary" th:text="${e.machineProduction != null ? e.machineProduction.productionCode : 'Factory Overhead'}">General</span></td>
                        <td th:text="${e.quantity}">1</td>
                        <td>$<span th:text="${#numbers.formatDecimal(e.unitPrice, 1, 'COMMA', 2, 'POINT')}">0.00</span></td>
                        <td class="fw-bold text-navy">$<span th:text="${#numbers.formatDecimal(e.totalExpenseAmount, 1, 'COMMA', 2, 'POINT')}">0.00</span></td>
                        <td th:text="${e.expenseDate}">2024-09-15</td>
                        <td>
                            <a th:href="@{'/other-expenses/edit/' + ${e.id}}" class="btn btn-sm btn-outline-primary me-1"><i class="bi bi-pencil"></i></a>
                            <a th:href="@{'/other-expenses/delete/' + ${e.id}}" class="btn btn-sm btn-outline-danger" data-confirm="Delete this expense?"><i class="bi bi-trash"></i></a>
                        </td>
                    </tr>
                    <tr th:if="${#lists.isEmpty(expenses)}">
                        <td colspan="9" class="text-center text-muted py-4">No expenses recorded yet.</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</main>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script th:src="@{/js/main.js}"></script>
</body>
</html>'''
    write("src/main/resources/templates/other-expenses.html", exp_html)

    exp_form_html = '''<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Expense Form - Seagull Printers</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="stylesheet" th:href="@{/css/style.css}">
</head>
<body>
''' + get_sidebar_html('other-expenses') + '''

<main class="main-wrapper">
    <div class="mb-4">
        <a href="/other-expenses" class="text-decoration-none small text-muted">&larr; Back to Other Expenses</a>
        <h2 class="fw-bold mb-0" th:text="${isNew ? 'Record Expense' : 'Edit Expense Details'}">Expense Form</h2>
    </div>

    <div class="card border-0 shadow-sm p-4" style="max-width: 800px;">
        <form th:action="@{/other-expenses/save}" th:object="${expense}" method="post">
            <input type="hidden" th:field="*{id}">

            <div class="row g-3 mb-3">
                <div class="col-md-4">
                    <label class="form-label small fw-semibold">Expense Code</label>
                    <input type="text" th:field="*{expenseCode}" class="form-control" readonly style="background:#f8fafc;">
                </div>
                <div class="col-md-4">
                    <label class="form-label small fw-semibold">Expense Type <span class="text-danger">*</span></label>
                    <select th:field="*{expenseType}" class="form-select" required>
                        <option value="Electricity">Electricity</option>
                        <option value="Transport">Transport / Delivery</option>
                        <option value="Packaging">Packaging Materials</option>
                        <option value="Plates/Chemicals">Plates & Wash Chemicals</option>
                        <option value="Maintenance">Maintenance & Repair</option>
                        <option value="Overhead">Factory Overhead</option>
                    </select>
                </div>
                <div class="col-md-4">
                    <label class="form-label small fw-semibold">Linked Production Order</label>
                    <select th:field="*{machineProduction}" class="form-select">
                        <option value="">-- General / Unallocated --</option>
                        <option th:each="prod : ${productions}" th:value="${prod.id}" th:text="${prod.productionCode + ' - ' + (prod.product != null ? prod.product.name : '')}"></option>
                    </select>
                </div>
            </div>

            <div class="mb-3">
                <label class="form-label small fw-semibold">Description <span class="text-danger">*</span></label>
                <input type="text" th:field="*{description}" class="form-control" required placeholder="e.g. Courier delivery pallets, press meter electricity consumption">
            </div>

            <div class="row g-3 mb-3">
                <div class="col-md-4">
                    <label class="form-label small fw-semibold">Quantity</label>
                    <input type="number" step="0.01" id="expenseQuantity" th:field="*{quantity}" class="form-control" required min="0.01">
                </div>
                <div class="col-md-4">
                    <label class="form-label small fw-semibold">Unit Price ($)</label>
                    <input type="number" step="0.01" id="expenseUnitPrice" th:field="*{unitPrice}" class="form-control" required min="0">
                </div>
                <div class="col-md-4">
                    <label class="form-label small fw-semibold">Calculated Total</label>
                    <div class="form-control bg-light fw-bold text-navy" id="liveExpenseTotal">$0.00</div>
                </div>
            </div>

            <div class="row g-3 mb-4">
                <div class="col-md-6">
                    <label class="form-label small fw-semibold">Expense Date</label>
                    <input type="date" th:field="*{expenseDate}" class="form-control" required>
                </div>
            </div>

            <div class="d-flex gap-2">
                <button type="submit" class="btn btn-primary px-4">Save Expense</button>
                <a href="/other-expenses" class="btn btn-outline-secondary">Cancel</a>
            </div>
        </form>
    </div>
</main>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script th:src="@{/js/main.js}"></script>
</body>
</html>'''
    write("src/main/resources/templates/other-expense-form.html", exp_form_html)

    # 13. production-cost-analysis.html & 14. production-cost-analysis-form.html
    pca_html = '''<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Production Cost & Profit Analysis - Seagull Printers</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="stylesheet" th:href="@{/css/style.css}">
</head>
<body>
''' + get_sidebar_html('production-cost-analysis') + '''

<main class="main-wrapper">
    <div class="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div>
            <h2 class="fw-bold mb-0">Production Cost & Profit Analysis</h2>
            <p class="text-muted small mb-0">Automated unit costing, revenue realization, margin calculations, and inventory safety.</p>
        </div>
        <div>
            <a href="/production-cost-analysis/new" class="btn btn-primary btn-sm">
                <i class="bi bi-cpu me-1"></i> Run Automated Cost Analysis
            </a>
        </div>
    </div>

    <div th:if="${successMessage}" class="alert alert-success py-2" th:text="${successMessage}"></div>
    <div th:if="${errorMessage}" class="alert alert-danger py-2" th:text="${errorMessage}"></div>

    <div class="card border-0 shadow-sm p-4 mb-4">
        <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                    <tr>
                        <th>Analysis #</th>
                        <th>Production Order</th>
                        <th>Product Item</th>
                        <th>Total Cost</th>
                        <th>Produced Qty</th>
                        <th>Cost / Unit</th>
                        <th>Actual Sales</th>
                        <th>Revenue</th>
                        <th>Profit</th>
                        <th>Margin %</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr th:each="a : ${analyses}">
                        <td class="fw-bold" th:text="${a.analysisCode}">PCA-001</td>
                        <td><span class="badge bg-secondary" th:text="${a.machineProduction != null ? a.machineProduction.productionCode : 'N/A'}">PROD</span></td>
                        <td th:text="${a.machineProduction != null && a.machineProduction.product != null ? a.machineProduction.product.name : 'N/A'}">Brochure</td>
                        <td class="fw-bold text-navy">$<span th:text="${#numbers.formatDecimal(a.totalProductionCost, 1, 'COMMA', 2, 'POINT')}">0.00</span></td>
                        <td th:text="${#numbers.formatInteger(a.producedQuantity, 1, 'COMMA')}">1,000</td>
                        <td class="text-primary fw-semibold">$<span th:text="${#numbers.formatDecimal(a.costPerUnit, 1, 'COMMA', 4, 'POINT')}">0.0000</span></td>
                        <td>
                            <span th:if="${a.isSalesRecorded}" class="badge bg-info text-dark" th:text="${a.actualSoldQuantity + ' sold'}">4,850 sold</span>
                            <span th:unless="${a.isSalesRecorded}" class="badge bg-light text-muted border">Unsold</span>
                        </td>
                        <td>
                            <span th:if="${a.isSalesRecorded}">$<span th:text="${#numbers.formatDecimal(a.revenue, 1, 'COMMA', 2, 'POINT')}">0.00</span></span>
                            <span th:unless="${a.isSalesRecorded}" class="text-muted small">Pending Sale</span>
                        </td>
                        <td>
                            <span th:if="${a.isSalesRecorded}" class="fw-bold text-success">$<span th:text="${#numbers.formatDecimal(a.profit, 1, 'COMMA', 2, 'POINT')}">0.00</span></span>
                            <span th:unless="${a.isSalesRecorded}" class="text-muted small">-</span>
                        </td>
                        <td>
                            <span th:if="${a.isSalesRecorded}" class="badge bg-success" th:text="${a.profitMarginPct + '%'}">0%</span>
                            <span th:unless="${a.isSalesRecorded}" class="badge bg-secondary">Unrealized</span>
                        </td>
                        <td>
                            <a th:href="@{'/production-cost-analysis/edit/' + ${a.id}}" class="btn btn-sm btn-outline-primary me-1"><i class="bi bi-eye"></i> Details</a>
                            <a th:href="@{'/production-cost-analysis/delete/' + ${a.id}}" class="btn btn-sm btn-outline-danger" data-confirm="Delete this cost analysis?"><i class="bi bi-trash"></i></a>
                        </td>
                    </tr>
                    <tr th:if="${#lists.isEmpty(analyses)}">
                        <td colspan="11" class="text-center text-muted py-4">No production cost analyses generated yet.</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</main>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script th:src="@{/js/main.js}"></script>
</body>
</html>'''
    write("src/main/resources/templates/production-cost-analysis.html", pca_html)

    pca_form_html = '''<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cost Analysis Form - Seagull Printers</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="stylesheet" th:href="@{/css/style.css}">
</head>
<body>
''' + get_sidebar_html('production-cost-analysis') + '''

<main class="main-wrapper">
    <div class="mb-4">
        <a href="/production-cost-analysis" class="text-decoration-none small text-muted">&larr; Back to Cost Analyses</a>
        <h2 class="fw-bold mb-0">Production Cost & Profit Analysis Engine</h2>
        <p class="text-muted small">Server-side automated validation & live mathematical breakdown</p>
    </div>

    <!-- Automated Run Trigger Card -->
    <div class="card border-primary mb-4 shadow-sm" style="background:#f0f9ff; border-style:dashed;">
        <div class="card-body p-4">
            <h5 class="fw-bold text-primary mb-2"><i class="bi bi-lightning-charge-fill me-2"></i>One-Click Auto Pull & Calculate</h5>
            <p class="text-muted small mb-3">Select a production order to automatically pull consumed raw materials, operational machine hours, recorded labour, and allocated expenses from database tables:</p>
            <form th:action="@{/production-cost-analysis/calculate}" method="post" class="row g-3 align-items-end">
                <div class="col-md-5">
                    <label class="form-label small fw-semibold">Target Production Run</label>
                    <select name="productionId" class="form-select" required>
                        <option th:each="p : ${productions}" th:value="${p.id}" th:text="${p.productionCode + ' (' + (p.product != null ? p.product.name : '') + ') - Qty: ' + p.quantityProduced}"></option>
                    </select>
                </div>
                <div class="col-md-3">
                    <label class="form-label small fw-semibold">Actual Sold Quantity</label>
                    <input type="number" name="actualSoldQuantity" class="form-control" placeholder="0 if unsold" min="0">
                </div>
                <div class="col-md-2">
                    <label class="form-label small fw-semibold">Selling Price / Unit ($)</label>
                    <input type="number" step="0.01" name="sellingPricePerUnit" class="form-control" placeholder="Std Price">
                </div>
                <div class="col-md-2">
                    <button type="submit" class="btn btn-primary w-100 fw-semibold">
                        <i class="bi bi-arrow-repeat me-1"></i> Run Analysis
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- Detailed Form Card -->
    <div class="card border-0 shadow-sm p-4 mb-4">
        <form th:action="@{/production-cost-analysis/save}" th:object="${analysis}" method="post">
            <input type="hidden" th:field="*{id}">

            <div class="row g-3 mb-4">
                <div class="col-md-4">
                    <label class="form-label small fw-semibold">Analysis Code</label>
                    <input type="text" th:field="*{analysisCode}" class="form-control" readonly style="background:#f8fafc;">
                </div>
                <div class="col-md-4">
                    <label class="form-label small fw-semibold">Selected Production Run <span class="text-danger">*</span></label>
                    <select th:field="*{machineProduction}" class="form-select" required>
                        <option th:each="prod : ${productions}" th:value="${prod.id}" th:text="${prod.productionCode + ' - ' + (prod.product != null ? prod.product.name : '')}"></option>
                    </select>
                </div>
                <div class="col-md-4">
                    <label class="form-label small fw-semibold">Analysis Date</label>
                    <input type="date" th:field="*{analysisDate}" class="form-control" required>
                </div>
            </div>

            <h6 class="fw-bold text-navy border-bottom pb-2 mb-3">Cost Component Breakdown (Database Sourced)</h6>
            <div class="row g-3 mb-4">
                <div class="col-md-3">
                    <label class="form-label small fw-semibold">Raw Material Cost ($)</label>
                    <input type="number" step="0.01" id="rawMaterialCost" th:field="*{rawMaterialCost}" class="form-control" required>
                </div>
                <div class="col-md-3">
                    <label class="form-label small fw-semibold">Labour Cost ($)</label>
                    <input type="number" step="0.01" id="labourCost" th:field="*{labourCost}" class="form-control" required>
                </div>
                <div class="col-md-3">
                    <label class="form-label small fw-semibold">Machine Operational Cost ($)</label>
                    <input type="number" step="0.01" id="machineCost" th:field="*{machineCost}" class="form-control" required>
                </div>
                <div class="col-md-3">
                    <label class="form-label small fw-semibold">Other Expenses ($)</label>
                    <input type="number" step="0.01" id="otherExpenseCost" th:field="*{otherExpenseCost}" class="form-control" required>
                </div>
            </div>

            <div class="row g-3 mb-4">
                <div class="col-md-4">
                    <label class="form-label small fw-semibold">Produced Quantity</label>
                    <input type="number" id="analysisProducedQty" th:field="*{producedQuantity}" class="form-control" required min="1">
                </div>
                <div class="col-md-4">
                    <label class="form-label small fw-semibold">Actual Realized Sold Quantity</label>
                    <input type="number" id="actualSoldQuantity" th:field="*{actualSoldQuantity}" class="form-control" min="0">
                    <div class="form-text small">Only sold quantities count toward realized revenue.</div>
                </div>
                <div class="col-md-4">
                    <label class="form-label small fw-semibold">Selling Price Per Unit ($)</label>
                    <input type="number" step="0.01" id="sellingPricePerUnit" th:field="*{sellingPricePerUnit}" class="form-control" min="0">
                </div>
            </div>

            <div class="form-check form-switch mb-4">
                <input class="form-check-input" type="checkbox" th:field="*{salesRecorded}" id="salesRecordedSwitch">
                <label class="form-check-label small fw-semibold" for="salesRecordedSwitch">Enable Realized Sales Revenue & Profit Reporting</label>
            </div>

            <!-- Mathematical Live Automated Preview -->
            <div class="p-4 bg-light rounded-3 border mb-4">
                <div class="row text-center g-3">
                    <div class="col-md-2 col-6">
                        <div class="text-muted small fw-semibold">TOTAL PRODUCTION COST</div>
                        <div class="fs-5 fw-bold text-navy" id="liveTotalCost">$0.00</div>
                    </div>
                    <div class="col-md-2 col-6">
                        <div class="text-muted small fw-semibold">COST PER UNIT</div>
                        <div class="fs-5 fw-bold text-primary" id="liveCostPerUnit">$0.0000</div>
                    </div>
                    <div class="col-md-3 col-6">
                        <div class="text-muted small fw-semibold">REALIZED REVENUE</div>
                        <div class="fs-5 fw-bold text-success" id="liveRevenue">$0.00</div>
                    </div>
                    <div class="col-md-3 col-6">
                        <div class="text-muted small fw-semibold">NET REALIZED PROFIT</div>
                        <div class="fs-5 fw-bold text-success" id="liveProfit">$0.00</div>
                    </div>
                    <div class="col-md-2 col-12">
                        <div class="text-muted small fw-semibold">PROFIT MARGIN</div>
                        <div class="fs-5 fw-bold text-info" id="liveProfitMargin">0.00%</div>
                    </div>
                </div>
            </div>

            <div class="mb-4">
                <label class="form-label small fw-semibold">Financial & Production Notes</label>
                <textarea th:field="*{notes}" class="form-control" rows="2" placeholder="Audit remarks, wastage factor, client order invoice number..."></textarea>
            </div>

            <div class="d-flex gap-2">
                <button type="submit" class="btn btn-primary px-4">Verify & Save Analysis</button>
                <a href="/production-cost-analysis" class="btn btn-outline-secondary">Cancel</a>
            </div>
        </form>
    </div>
</main>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script th:src="@{/js/main.js}"></script>
</body>
</html>'''
    write("src/main/resources/templates/production-cost-analysis-form.html", pca_form_html)

if __name__ == "__main__":
    build_templates()
