// AgentBazaar AI - Mock UPI Payment & Digital Receipt Generator
// Complies with Section 14: Mock Indian UPI gateway with authentic UX & clear simulation notices

class PaymentGateway {
  constructor() {
    this.selectedUpiApp = "gpay";
  }

  // Opens Mock UPI Payment Modal
  openPaymentModal(dealData) {
    this.pendingDeal = dealData || window.negotiationRoom?.offers?.SELLER_B || window.agentEngine.generateSellerOfferB({}, 3);
    const modal = document.getElementById("genericModal");
    if (!modal) return;

    const currentUser = window.db.getCurrentUser() || { name: "Priya Sharma", savedPaymentUPI: "priyasharma@okhdfcbank" };
    const amount = this.pendingDeal.finalTotal || 19800;

    modal.innerHTML = `
      <div class="modal-overlay" onclick="window.app.closeModal(event)">
        <div class="modal-content" style="max-width: 520px;" onclick="event.stopPropagation()">
          
          <div class="modal-header" style="background:#0b192c; color:#fff; border-top-left-radius:var(--radius-xl); border-top-right-radius:var(--radius-xl);">
            <div>
              <div class="card-title" style="color:#fff; font-size:1.1rem;">
                <span>⚡ Unified Payments Interface (UPI)</span>
              </div>
              <div class="text-xs" style="color:#94a3b8;">AgentBazaar Mock Escrow Gateway</div>
            </div>
            <button class="modal-close-btn" style="color:#cbd5e1;" onclick="window.app.closeModal()">&times;</button>
          </div>

          <div class="modal-body" style="padding:1.5rem;">
            
            <!-- Clear Demo Mode Alert Banner -->
            <div class="card mb-3" style="background:var(--warning-light); border:1px solid #fde68a; padding:0.75rem 1rem;">
              <div class="flex items-center gap-2">
                <span style="font-size:1.2rem;">⚠️</span>
                <div>
                  <div style="font-weight:700; font-size:0.85rem; color:#92400e;">SIMULATED PAYMENT ENVIRONMENT</div>
                  <div style="font-size:0.75rem; color:#b45309;">
                    This is a prototype demonstration. <b>No real money or bank debit will occur.</b>
                  </div>
                </div>
              </div>
            </div>

            <!-- Amount Card -->
            <div class="card mb-3 text-center" style="background:#f8fafc; border:1px solid var(--border); padding:1.25rem;">
              <span class="text-xs text-muted" style="text-transform:uppercase; letter-spacing:0.05em;">Total Negotiated Amount</span>
              <div style="font-size:2rem; font-weight:800; color:var(--primary); margin:0.25rem 0;">
                ₹${amount.toLocaleString()}
              </div>
              <div class="flex items-center justify-center gap-2 text-xs text-muted">
                <span>Beneficiary: <b>${dealData.sellerName}</b></span>
                <span>•</span>
                <span style="color:var(--success); font-weight:700;">Saved ₹${dealData.discountAmount.toLocaleString()} via AI</span>
              </div>
            </div>

            <!-- UPI App Chooser -->
            <label class="form-label mb-2">Select UPI App / Provider</label>
            <div class="grid grid-4 gap-2 mb-3">
              <div class="upi-option active" id="upi-gpay" onclick="window.paymentGateway.selectUpiApp('gpay')" style="border:2px solid var(--accent-cyan); border-radius:8px; padding:0.6rem; text-align:center; cursor:pointer; background:var(--accent-cyan-light);">
                <div style="font-weight:700; font-size:0.85rem; color:#0369a1;">Google Pay</div>
              </div>
              <div class="upi-option" id="upi-phonepe" onclick="window.paymentGateway.selectUpiApp('phonepe')" style="border:1px solid var(--border); border-radius:8px; padding:0.6rem; text-align:center; cursor:pointer; background:#fff;">
                <div style="font-weight:700; font-size:0.85rem; color:var(--text-main);">PhonePe</div>
              </div>
              <div class="upi-option" id="upi-paytm" onclick="window.paymentGateway.selectUpiApp('paytm')" style="border:1px solid var(--border); border-radius:8px; padding:0.6rem; text-align:center; cursor:pointer; background:#fff;">
                <div style="font-weight:700; font-size:0.85rem; color:var(--text-main);">Paytm</div>
              </div>
              <div class="upi-option" id="upi-bhim" onclick="window.paymentGateway.selectUpiApp('bhim')" style="border:1px solid var(--border); border-radius:8px; padding:0.6rem; text-align:center; cursor:pointer; background:#fff;">
                <div style="font-weight:700; font-size:0.85rem; color:var(--text-main);">BHIM UPI</div>
              </div>
            </div>

            <!-- VPA / UPI ID Input -->
            <div class="form-group mb-3">
              <label class="form-label">Virtual Payment Address (VPA)</label>
              <input type="text" id="upiVpaInput" class="form-control" value="${currentUser.savedPaymentUPI || 'priyasharma@okhdfcbank'}">
              <span class="text-xs text-muted">Demo VPA prefilled. Any test format accepted.</span>
            </div>

            <!-- Demo Escrow Protection Badge -->
            <div class="flex items-center gap-2 text-xs text-muted mb-2">
              <span style="color:var(--success);">🛡️</span>
              <span>Protected by <b>AgentBazaar Smart Escrow</b>. Funds released only upon delivery acceptance.</span>
            </div>

          </div>

          <div class="modal-footer">
            <button class="btn btn-outline" onclick="window.app.closeModal()">Cancel</button>
            <button class="btn btn-accent btn-lg" id="payNowBtn" onclick="window.paymentGateway.executeDemoPayment()">
              <span>Pay ₹${amount.toLocaleString()} – Demo UPI</span>
            </button>
          </div>

        </div>
      </div>
    `;
  }

  selectUpiApp(app) {
    this.selectedUpiApp = app;
    ["gpay", "phonepe", "paytm", "bhim"].forEach(id => {
      const el = document.getElementById("upi-" + id);
      if (el) {
        if (id === app) {
          el.style.borderColor = "var(--accent-cyan)";
          el.style.borderWidth = "2px";
          el.style.background = "var(--accent-cyan-light)";
        } else {
          el.style.borderColor = "var(--border)";
          el.style.borderWidth = "1px";
          el.style.background = "#fff";
        }
      }
    });
  }

  // Execute Simulated UPI Payment
  executeDemoPayment(dealData) {
    const deal = dealData || this.pendingDeal || window.agentEngine.generateSellerOfferB({}, 3);
    const btn = document.getElementById("payNowBtn");
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span>⏳ Authenticating with NPCI Switch...</span>`;
    }

    setTimeout(() => {
      if (btn) btn.innerHTML = `<span>🔒 Debiting Demo VPA...</span>`;
      setTimeout(() => {
        // Generate authentic transaction artifacts
        const txnId = "UPI/" + new Date().getFullYear() + "/TXN/" + Math.floor(100000 + Math.random() * 900000);
        const orderId = "ORD-AB-" + new Date().getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000);
        const trackingNum = "EXP-TRK-" + Math.floor(100000 + Math.random() * 900000);

        const newOrder = {
          orderId: orderId,
          date: new Date().toISOString(),
          buyerId: window.db.getCurrentUser()?.id || "BUYER_001",
          sellerId: deal.sellerId,
          sellerName: deal.sellerName,
          productName: deal.productName,
          quantity: deal.quantity,
          unitPriceOriginal: deal.originalUnitPrice,
          unitPriceFinal: deal.offeredUnitPrice,
          totalOriginal: deal.originalTotal,
          totalFinal: deal.finalTotal,
          savings: deal.discountAmount,
          savingsPercent: deal.discountPercent,
          qualityScore: deal.qualityScore,
          trustScore: deal.trustScore,
          deliveryDays: deal.deliveryDays,
          status: "PAYMENT_CONFIRMED",
          statusTimeline: [
            { step: "Order Approved by Buyer", time: new Date().toLocaleTimeString(), done: true },
            { step: "Mock UPI Payment Successful", time: new Date().toLocaleTimeString(), done: true },
            { step: "Seller Packaging & Inspection", time: "Pending", done: false },
            { step: "Dispatched via Express Logistics", time: "Pending", done: false },
            { step: "Delivered & Verified", time: "Pending", done: false }
          ],
          trackingNumber: trackingNum,
          paymentTxnId: txnId,
          paymentMethod: `Mock UPI (${this.selectedUpiApp.toUpperCase()})`
        };

        window.db.addOrder(newOrder);
        window.app.showToast("🎉 Payment Successful! Order Created.", "success");
        this.renderReceiptModal(newOrder);
      }, 1200);
    }, 1200);
  }

  // Digital Receipt Modal with Print/Download
  renderReceiptModal(orderOrId) {
    const order = typeof orderOrId === "string" ? window.db.getOrderById(orderOrId) : orderOrId;
    if (!order) return;
    const modal = document.getElementById("genericModal");
    if (!modal) return;

    modal.innerHTML = `
      <div class="modal-overlay" onclick="window.app.closeModal(event)">
        <div class="modal-content" style="max-width: 580px;" onclick="event.stopPropagation()">
          
          <div class="modal-header" style="background:#065f46; color:#fff; border-top-left-radius:var(--radius-xl); border-top-right-radius:var(--radius-xl);">
            <div class="card-title" style="color:#fff;">
              <span>✓ Digital Payment Receipt</span>
              <span class="badge" style="background:rgba(255,255,255,0.2); color:#fff; font-size:0.75rem;">PAID • SIMULATED</span>
            </div>
            <button class="modal-close-btn" style="color:#fff;" onclick="window.app.closeModal()">&times;</button>
          </div>

          <div class="modal-body" id="printableReceiptArea" style="padding:1.5rem;">
            
            <div class="text-center mb-4">
              <div style="font-size:2.5rem; margin-bottom:0.25rem;">🧾</div>
              <h3 style="font-size:1.25rem; font-weight:800;">AgentBazaar AI Verified Receipt</h3>
              <div class="text-xs text-muted">Transaction ID: <b>${order.paymentTxnId}</b></div>
              <div class="text-xs text-muted">Order ID: <b>${order.orderId}</b></div>
            </div>

            <div class="card mb-3" style="background:#f8fafc; border:1px solid var(--border); padding:1rem; font-size:0.85rem;">
              <div class="flex justify-between py-1 border-bottom"><span>Merchant Name:</span><b>${order.sellerName}</b></div>
              <div class="flex justify-between py-1 border-bottom"><span>Product:</span><b>${order.productName}</b></div>
              <div class="flex justify-between py-1 border-bottom"><span>Quantity:</span><b>${order.quantity} Units</b></div>
              <div class="flex justify-between py-1 border-bottom"><span>Quality Score:</span><b>${order.qualityScore}/100</b></div>
              <div class="flex justify-between py-1 border-bottom"><span>Seller TrustScore:</span><b>${order.trustScore}%</b></div>
              <div class="flex justify-between py-1 border-bottom"><span>Original Price:</span><s>₹${order.totalOriginal.toLocaleString()}</s></div>
              <div class="flex justify-between py-1 border-bottom" style="color:var(--success); font-weight:700;"><span>Negotiated Savings:</span><span>-₹${order.savings.toLocaleString()} (${order.savingsPercent}%)</span></div>
              <div class="flex justify-between py-1" style="font-size:1.05rem; font-weight:800; color:var(--primary); border-top:1px dashed var(--border); margin-top:0.4rem; padding-top:0.4rem;">
                <span>Total Paid:</span>
                <span>₹${order.totalFinal.toLocaleString()}</span>
              </div>
            </div>

            <div class="text-xs text-muted" style="text-align:center;">
              Simulation Mode Notice: Generated for prototype evaluation. Authenticated via AI-negotiated smart contract.
            </div>

          </div>

          <div class="modal-footer" style="justify-content: space-between;">
            <button class="btn btn-outline btn-sm" onclick="window.print()">
              <span>🖨️ Print / Save PDF</span>
            </button>
            <div class="flex gap-2">
              <button class="btn btn-primary" onclick="window.app.closeModal(); window.app.navigateTo('orderTracking', '${order.orderId}')">
                <span>Track Order Live ➔</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    `;
  }
}

window.paymentGateway = new PaymentGateway();
