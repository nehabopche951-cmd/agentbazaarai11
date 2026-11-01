// AgentBazaar AI - Interactive Order Tracking Lifecycle
// Complies with Section 15: Timeline progress with interactive simulation controls

class OrderTrackingService {
  constructor() {}

  renderOrderTracking(targetOrderId = null) {
    const container = document.getElementById("orderTrackingContent");
    if (!container) return;

    const orders = window.db.getOrders();
    if (!orders || orders.length === 0) {
      container.innerHTML = `
        <div class="card text-center" style="padding:3rem;">
          <div style="font-size:3rem; margin-bottom:1rem;">📦</div>
          <h3>No Orders Found</h3>
          <p class="text-muted mt-2">Start a negotiation with your Buyer AI Agent to create your first order.</p>
          <button class="btn btn-primary mt-4" onclick="window.app.navigateTo('buyerDashboard')">Go to Buyer Dashboard</button>
        </div>
      `;
      return;
    }

    const currentOrder = targetOrderId ? (orders.find(o => o.orderId === targetOrderId) || orders[0]) : orders[0];

    container.innerHTML = `
      <div class="flex items-center justify-between mb-4" style="flex-wrap: wrap; gap:1rem;">
        <div>
          <h2>📦 Live Order Fulfillment Tracking</h2>
          <p class="text-sm text-muted">Real-time status updates powered by courier webhook integration.</p>
        </div>
        <div class="flex items-center gap-2">
          <label class="text-xs text-muted">Select Order:</label>
          <select class="form-control" style="width: auto; padding:0.4rem 0.8rem;" onchange="window.orderTracking.renderOrderTracking(this.value)">
            ${orders.map(o => `<option value="${o.orderId}" ${o.orderId === currentOrder.orderId ? 'selected' : ''}>${o.orderId} - ${o.productName.substring(0, 22)}... (₹${o.totalFinal.toLocaleString()})</option>`).join("")}
          </select>
        </div>
      </div>

      <div class="grid grid-3 gap-4">
        
        <!-- Left 2 Cols: Timeline & Controls -->
        <div style="grid-column: span 2;">
          <div class="card mb-4">
            <div class="card-header">
              <div>
                <span class="badge ${currentOrder.status === 'DELIVERED' ? 'badge-success' : 'badge-cyan'}" style="font-size:0.8rem;">
                  STATUS: ${currentOrder.status}
                </span>
                <h3 class="mt-2">${currentOrder.productName}</h3>
                <div class="text-xs text-muted">Quantity: ${currentOrder.quantity} Units | Seller: <b>${currentOrder.sellerName}</b></div>
              </div>
              <div class="text-right">
                <div class="text-xs text-muted">Tracking Code</div>
                <div style="font-family:monospace; font-weight:800; font-size:1.05rem; color:var(--primary);">${currentOrder.trackingNumber}</div>
              </div>
            </div>

            <!-- Stepper Timeline -->
            <div class="stepper" style="margin: 1.5rem 0 1.5rem 0.5rem;">
              ${currentOrder.statusTimeline.map((step, idx) => `
                <div class="step-item ${step.done ? 'done' : ''}">
                  <div class="step-circle">${step.done ? '✓' : (idx + 1)}</div>
                  <div style="font-weight: 700; font-size: 0.95rem; color: ${step.done ? 'var(--text-main)' : 'var(--text-muted)'};">
                    ${step.step}
                  </div>
                  <div class="text-xs text-muted">${step.time}</div>
                </div>
              `).join("")}
            </div>

            <!-- Simulation Controls -->
            <div class="flex items-center justify-between" style="background:#f8fafc; padding:1rem; border-radius:8px; border:1px solid var(--border);">
              <div>
                <div style="font-weight:700; font-size:0.85rem;">Simulate Courier Progression</div>
                <div class="text-xs text-muted">Advance to the next milestone to test real-time state updates.</div>
              </div>
              <button class="btn btn-accent btn-sm" ${currentOrder.status === 'DELIVERED' ? 'disabled' : ''} onclick="window.orderTracking.advanceOrderStatus('${currentOrder.orderId}')">
                <span>⚡ Advance Next Step</span>
              </button>
            </div>

          </div>
        </div>

        <!-- Right Col: Order Meta & Payment Details -->
        <div>
          <div class="card mb-3">
            <div class="card-title text-sm mb-3">Financial & Quality Audit</div>
            <div class="flex flex-col gap-2 text-sm">
              <div class="flex justify-between">
                <span class="text-muted">Total Paid:</span>
                <b>₹${currentOrder.totalFinal.toLocaleString()}</b>
              </div>
              <div class="flex justify-between">
                <span class="text-muted">Negotiated Savings:</span>
                <b style="color:var(--success);">₹${currentOrder.savings.toLocaleString()} (${currentOrder.savingsPercent}%)</b>
              </div>
              <div class="flex justify-between">
                <span class="text-muted">Payment Mode:</span>
                <span>${currentOrder.paymentMethod}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted">Transaction ID:</span>
                <span style="font-family:monospace; font-size:0.75rem;">${currentOrder.paymentTxnId}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted">Quality Score:</span>
                <b>${currentOrder.qualityScore}/100</b>
              </div>
              <div class="flex justify-between">
                <span class="text-muted">Seller TrustScore:</span>
                <b>${currentOrder.trustScore}%</b>
              </div>
            </div>

            <div class="mt-4 pt-3 border-top">
              <button class="btn btn-outline btn-sm w-full" onclick="window.paymentGateway.renderReceiptModal('${currentOrder.orderId}')">
                <span>🧾 View Digital Receipt</span>
              </button>
            </div>
          </div>

          <div class="card" style="background:var(--accent-cyan-light); border-color:rgba(0,173,181,0.3);">
            <div style="font-weight:700; font-size:0.85rem; color:#0369a1; margin-bottom:0.25rem;">Automated Delivery Verification</div>
            <p class="text-xs" style="color:#0c4a6e; line-height:1.4;">
              Buyer Agent monitors courier telemetry. If delivery is delayed beyond agreed date, a penalty credit is automatically deducted via smart escrow.
            </p>
          </div>

        </div>

      </div>
    `;
  }

  advanceOrderStatus(orderId) {
    const updated = window.db.updateOrderStatus(orderId);
    if (updated) {
      window.app.showToast("Order milestone updated successfully!", "success");
      this.renderOrderTracking(orderId);
    } else {
      window.app.showToast("Order is already fully delivered!", "warning");
    }
  }
}

window.orderTracking = new OrderTrackingService();
