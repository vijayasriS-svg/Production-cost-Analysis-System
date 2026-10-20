/**
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
        const liveCogs = document.getElementById("liveCogs");
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

            if (liveCogs) liveCogs.textContent = "$" + cogs.toFixed(2);
            if (liveRevenue) liveRevenue.textContent = "$" + revenue.toFixed(2);
            if (liveProfit) liveProfit.textContent = "$" + profit.toFixed(2);
            if (liveMargin) liveMargin.textContent = margin.toFixed(2) + "%";
        } else {
            if (liveCogs) liveCogs.textContent = "$0.00";
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

function applyVis500Preset() {
    const rawMaterial = document.getElementById("rawMaterialCost");
    const labour = document.getElementById("labourCost");
    const machine = document.getElementById("machineCost");
    const other = document.getElementById("otherExpenseCost");
    const produced = document.getElementById("analysisProducedQty");
    const sold = document.getElementById("actualSoldQuantity");
    const price = document.getElementById("sellingPricePerUnit");
    const sw = document.getElementById("salesRecordedSwitch");

    if (rawMaterial) rawMaterial.value = "54.70";
    if (labour) labour.value = "30.00";
    if (machine) machine.value = "25.76";
    if (other) other.value = "6.50";
    if (produced) produced.value = "500";
    if (sold) sold.value = "500";
    if (price) price.value = "0.36";
    if (sw) sw.checked = true;

    if (price) {
        price.dispatchEvent(new Event('input', { bubbles: true }));
    }
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
