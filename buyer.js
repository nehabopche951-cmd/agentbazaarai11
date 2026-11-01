// AgentBazaar AI - Buyer Dashboard Controller
// Complies with Section 3 & Section 4: Search, Natural Language RFQ, Seller Directory, Orders

class BuyerDashboard {
  constructor() {
    this.selectedSampleImage = "PRESET_CLEAN";
  }

  // Pre-fills natural language prompts into search and structured fields
  setQueryPreset(presetType) {
    const input = document.getElementById("buyerNaturalQuery");
    const nameInput = document.getElementById("rfqProductName");
    const qtyInput = document.getElementById("rfqQuantity");
    const budgetInput = document.getElementById("rfqMaxBudget");
    const qualityInput = document.getElementById("rfqMinQuality");
    const deliveryInput = document.getElementById("rfqDeliveryDate");

    if (presetType === "diwali") {
      if (input) input.value = "I need 40 packets of rice, 20 oil bottles and 30 sugar packets before Diwali.";
      if (nameInput) nameInput.value = "Royal Basmati Rice (5kg Bag)";
      if (qtyInput) qtyInput.value = 40;
      if (budgetInput) budgetInput.value = 22000;
      if (qualityInput) qualityInput.value = 75;
      if (deliveryInput) deliveryInput.value = "Before Diwali (4 Days)";
    } else if (presetType === "restaurant") {
      if (input) input.value = "Bulk commercial requirement: 60 basmati bags and 30 mustard oil canisters within 48 hours.";
      if (nameInput) nameInput.value = "Royal Basmati Rice (5kg Bag)";
      if (qtyInput) qtyInput.value = 60;
      if (budgetInput) budgetInput.value = 30000;
      if (qualityInput) qualityInput.value = 80;
      if (deliveryInput) deliveryInput.value = "Immediate Express (2 Days)";
    } else if (presetType === "organic") {
      if (input) input.value = "Looking for certified 100% organic estate basmati rice with ISO certification for export.";
      if (nameInput) nameInput.value = "Estate Reserve Organic Basmati (5kg Bag)";
      if (qtyInput) qtyInput.value = 35;
      if (budgetInput) budgetInput.value = 25000;
      if (qualityInput) qualityInput.value = 90;
      if (deliveryInput) deliveryInput.value = "Standard (3-5 Days)";
    }

    window.app.showToast("Preset loaded into AI Shopping Agent!", "success");
  }

  // "Find Best Deals with AI" button trigger
  startAiNegotiationFromForm() {
    const productName = document.getElementById("rfqProductName")?.value || "Royal Basmati Rice (5kg Bag)";
    const quantity = parseInt(document.getElementById("rfqQuantity")?.value) || 40;
    const maxBudget = parseInt(document.getElementById("rfqMaxBudget")?.value) || 22000;
    const minQuality = parseInt(document.getElementById("rfqMinQuality")?.value) || 75;
    const deliveryDate = document.getElementById("rfqDeliveryDate")?.value || "Before Diwali (4 Days)";
    const paymentTerms = document.getElementById("rfqPaymentTerms")?.value || "Mock UPI on Delivery Approval";

    const criteria = {
      product: productName,
      quantity,
      maxBudget,
      minQuality,
      deliveryDate,
      paymentTerms
    };

    window.app.showToast("🚀 Buyer AI Agent Activated! Connecting to sellers...", "success");

    // Launch into Negotiation Room
    window.app.navigateTo("negotiationRoom");
    setTimeout(() => {
      window.negotiationRoom.startSession(criteria);
    }, 100);
  }

  // Render Buyer Dashboard View
  renderDashboard() {
    const container = document.getElementById("buyerDashboardContent");
    if (!container) return;

    const user = window.db.getCurrentUser() || { name: "Priya Sharma", role: "buyer" };
    const sellers = window.db.getSellers();
    const products = window.db.getProducts();
    const orders = window.db.getOrders();
    const activeNegotiation = window.db.getActiveNegotiation();

    container.innerHTML = `
      <!-- Welcome Hero Banner with Natural Language Search -->
      <div class="search-hero">
        <div class="flex justify-between items-center mb-2">
          <span class="badge badge-cyan" style="background: rgba(0, 173, 181, 0.2); color: #5eead4;">
            🤖 AI-Powered Procurement Desk
          </span>
          <span class="text-xs" style="color: #cbd5e1;">Logged in: <b>${user.name}</b> (Buyer)</span>
        </div>
        <h1 class="search-hero-title">Welcome back, ${user.name}!</h1>
        <p class="search-hero-subtitle">
          Your personal AI Shopping Agent compares prices across verified sellers, checks certified product quality, blocks fraudulent schemes, and negotiates bulk discounts automatically.
        </p>

        <!-- Natural Language Search Box -->
        <div class="card" style="background: #ffffff; color: var(--text-main); padding: 1.5rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-xl);">
          <label class="form-label" style="font-size: 1rem; font-weight: 700; color: var(--primary);">
            What products do you want to purchase?
          </label>
          <div class="flex gap-2 mb-2">
            <input type="text" id="buyerNaturalQuery" class="form-control" style="font-size: 1rem; padding: 0.85rem;" 
              placeholder="e.g. I need 40 packets of rice, 20 oil bottles and 30 sugar packets before Diwali."
              value="I need 40 packets of rice, 20 oil bottles and 30 sugar packets before Diwali.">
            <button class="btn btn-accent btn-lg" onclick="window.buyerDashboard.startAiNegotiationFromForm()">
              <span>Find Best Deals with AI ➔</span>
            </button>
          </div>

          <!-- Quick Preset Chips -->
          <div class="flex items-center gap-2 mt-2" style="flex-wrap: wrap;">
            <span class="text-xs text-muted font-bold">Quick Presets:</span>
            <span class="prompt-chip" onclick="window.buyerDashboard.setQueryPreset('diwali')">🪔 Diwali Grocery Bulk (40 Rice, 20 Oil)</span>
            <span class="prompt-chip" onclick="window.buyerDashboard.setQueryPreset('restaurant')">🍳 Restaurant Bulk Supply (60 Units)</span>
            <span class="prompt-chip" onclick="window.buyerDashboard.setQueryPreset('organic')">🌿 100% Certified Organic Estate Produce</span>
          </div>

          <!-- Structured Constraints Bar -->
          <div class="grid grid-4 gap-3 mt-4 pt-3 border-top" style="font-size: 0.85rem;">
            <div>
              <label class="form-label text-xs">Target Product</label>
              <input type="text" id="rfqProductName" class="form-control form-control-sm" value="Royal Basmati Rice (5kg Bag)">
            </div>
            <div>
              <label class="form-label text-xs">Quantity</label>
              <input type="number" id="rfqQuantity" class="form-control form-control-sm" value="40" min="5" max="500">
            </div>
            <div>
              <label class="form-label text-xs">Maximum Budget (₹)</label>
              <input type="number" id="rfqMaxBudget" class="form-control form-control-sm" value="22000" step="500">
            </div>
            <div>
              <label class="form-label text-xs">Minimum Quality Score</label>
              <select id="rfqMinQuality" class="form-control form-control-sm">
                <option value="70">70+ (Standard Wholesale)</option>
                <option value="75" selected>75+ (High Quality Recommended)</option>
                <option value="85">85+ (Certified Premium Only)</option>
              </select>
            </div>
          </div>

          <div class="grid grid-2 gap-3 mt-2" style="font-size: 0.85rem;">
            <div>
              <label class="form-label text-xs">Preferred Delivery Date</label>
              <input type="text" id="rfqDeliveryDate" class="form-control form-control-sm" value="Before Diwali (4 Days)">
            </div>
            <div>
              <label class="form-label text-xs">Payment Terms</label>
              <select id="rfqPaymentTerms" class="form-control form-control-sm">
                <option value="Mock UPI on Delivery Approval" selected>Mock UPI on Delivery Approval</option>
                <option value="Mock UPI Escrow Protected">Mock UPI Escrow Protected</option>
                <option value="Immediate Mock UPI">Immediate Mock UPI</option>
              </select>
            </div>
          </div>

        </div>
      </div>

      <!-- Live AI Shopping Agent Status Widget -->
      <div class="grid grid-3 gap-4 mb-4">
        
        <!-- Agent Status Card -->
        <div class="card" style="border-top: 4px solid var(--accent-cyan);">
          <div class="flex items-center justify-between mb-2">
            <span class="badge badge-cyan">My AI Shopping Agent</span>
            <span class="badge badge-success">ACTIVE & READY</span>
          </div>
          <div style="font-weight: 800; font-size: 1.15rem; color: var(--primary);">BazaarCopilot AI v2.4</div>
          <p class="text-xs text-muted mt-1 mb-3">
            Autonomous buyer agent with real-time A2A negotiation, adversarial prompt filtering, and quality auditing protocols.
          </p>
          <div class="flex items-center justify-between text-xs" style="background:#f8fafc; padding:0.5rem; border-radius:6px;">
            <span>Negotiation Mode:</span>
            <b>Balanced Value Maximizer</b>
          </div>
          <div class="flex items-center justify-between text-xs mt-1" style="background:#f8fafc; padding:0.5rem; border-radius:6px;">
            <span>Security Guardian:</span>
            <b style="color:var(--success);">Strict Protection Active</b>
          </div>
        </div>

        <!-- Visual Quality Checker Trigger Card -->
        <div class="card" style="border-top: 4px solid var(--accent-purple);">
          <div class="flex items-center justify-between mb-2">
            <span class="badge badge-purple">AI Product Quality Checker</span>
            <span class="badge badge-cyan">Visual & Data Audit</span>
          </div>
          <div style="font-weight: 800; font-size: 1.15rem;">Automated Packaging Inspector</div>
          <p class="text-xs text-muted mt-1 mb-3">
            Upload or inspect packaging images to detect tears, stains, seal tampering, and verify shelf life & certifications.
          </p>
          <button class="btn btn-purple btn-sm w-full" onclick="window.buyerDashboard.openVisualInspectionModal()">
            <span>📷 Run Packaging Inspection</span>
          </button>
        </div>

        <!-- Security Guardian Preview Card -->
        <div class="card" style="border-top: 4px solid var(--danger);">
          <div class="flex items-center justify-between mb-2">
            <span class="badge badge-danger">AI Security Guardian</span>
            <span class="badge badge-dark">Sentinel v3.1</span>
          </div>
          <div style="font-weight: 800; font-size: 1.15rem;">Fraud & Injection Defense</div>
          <p class="text-xs text-muted mt-1 mb-3">
            Protects your budget boundaries and stops malicious sellers from attempting prompt injection or fake MRP markups.
          </p>
          <button class="btn btn-outline btn-sm w-full" onclick="window.app.navigateTo('analytics')">
            <span>🛡️ View Security Incident Logs</span>
          </button>
        </div>

      </div>

      <!-- Available Sellers Network Section -->
      <div class="card mb-4">
        <div class="card-header">
          <div>
            <div class="card-title">🏪 Available Sellers in Network</div>
            <div class="text-xs text-muted">Pre-audited wholesale vendors ready for autonomous A2A negotiations</div>
          </div>
          <button class="btn btn-accent btn-sm" onclick="window.buyerDashboard.startAiNegotiationFromForm()">
            <span>Negotiate with All 3 Sellers ➔</span>
          </button>
        </div>

        <div class="grid grid-3 gap-3">
          ${sellers.filter(s => s.verified).map(s => `
            <div class="card" style="background:#f8fafc; border:1px solid var(--border);">
              <div class="flex items-center justify-between mb-2">
                <span class="badge ${s.type === 'budget' ? 'badge-success' : s.type === 'premium' ? 'badge-purple' : 'badge-warning'}">
                  ${s.badge}
                </span>
                <div class="score-circle ${s.trustScore >= 90 ? 'score-high' : s.trustScore >= 80 ? 'score-mid' : 'score-low'}">
                  ${s.trustScore}
                  <small>TRUST</small>
                </div>
              </div>

              <div style="font-weight:800; font-size:1rem; margin-bottom:0.2rem;">${s.name}</div>
              <p class="text-xs text-muted mb-2">${s.tagline}</p>
              
              <div class="text-xs" style="color:var(--text-main); margin-bottom:0.5rem;">
                <div>📍 Location: ${s.city}</div>
                <div>⭐ Rating: <b>${s.rating}/5.0</b> (${s.reviewsCount} reviews)</div>
                <div>🚚 Fulfillment Rate: <b>${s.metrics.onTimeDelivery}</b></div>
              </div>

              <div class="card" style="background:#ffffff; padding:0.5rem; font-size:0.75rem; border:1px solid #e2e8f0;">
                <div class="flex justify-between">
                  <span class="text-muted">Autonomous Bot:</span>
                  <b>${s.agentPersona.name}</b>
                </div>
                <div class="flex justify-between mt-1">
                  <span class="text-muted">Strategy:</span>
                  <span style="color:var(--primary); font-weight:700;">${s.agentPersona.strategy}</span>
                </div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>

      <!-- Recent Orders & Deal History -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">📦 My Approved Deals & Order History</div>
          <button class="btn btn-outline btn-sm" onclick="window.app.navigateTo('orderTracking')">
            <span>View Live Tracking</span>
          </button>
        </div>

        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Seller</th>
                <th>Product & Qty</th>
                <th>Original</th>
                <th>Negotiated</th>
                <th>Savings</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${orders.map(o => `
                <tr>
                  <td><b>${o.orderId}</b></td>
                  <td>${o.sellerName}</td>
                  <td>${o.productName} (x${o.quantity})</td>
                  <td><s>₹${o.totalOriginal.toLocaleString()}</s></td>
                  <td><b>₹${o.totalFinal.toLocaleString()}</b></td>
                  <td style="color:var(--success); font-weight:700;">₹${o.savings.toLocaleString()} (${o.savingsPercent}%)</td>
                  <td><span class="badge ${o.status === 'DELIVERED' ? 'badge-success' : 'badge-cyan'}">${o.status}</span></td>
                  <td>
                    <button class="btn btn-outline btn-sm" onclick="window.app.navigateTo('orderTracking', '${o.orderId}')">
                      Track ➔
                    </button>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // Opens Visual Packaging Inspection Modal (Section 7)
  openVisualInspectionModal() {
    const modal = document.getElementById("genericModal");
    if (!modal) return;

    modal.innerHTML = `
      <div class="modal-overlay" onclick="window.app.closeModal(event)">
        <div class="modal-content" style="max-width: 680px;" onclick="event.stopPropagation()">
          <div class="modal-header">
            <div class="card-title">
              <span>📷 AI Product Quality - Packaging Visual Inspection</span>
            </div>
            <button class="modal-close-btn" onclick="window.app.closeModal()">&times;</button>
          </div>

          <div class="modal-body">
            
            <p class="text-sm text-muted mb-3">
              Test visual defect detection on sample packaging photos or upload your own product photo. The AI identifies outer defects like torn seams, moisture leaks, or broken seals.
            </p>

            <!-- Sample Selector Buttons -->
            <label class="form-label text-xs">Select Packaging Sample to Audit:</label>
            <div class="grid grid-3 gap-2 mb-3">
              <button class="btn btn-outline btn-sm" id="btnPresetClean" onclick="window.buyerDashboard.runSampleInspection('PRESET_CLEAN')">
                <span>✓ Pristine Factory Pack</span>
              </button>
              <button class="btn btn-outline btn-sm" id="btnPresetDented" onclick="window.buyerDashboard.runSampleInspection('PRESET_DENTED')">
                <span>⚠️ Minor Exterior Wear</span>
              </button>
              <button class="btn btn-outline btn-sm" id="btnPresetDamaged" onclick="window.buyerDashboard.runSampleInspection('PRESET_DAMAGED')">
                <span>❌ Compromised & Stained</span>
              </button>
            </div>

            <!-- Custom File Upload -->
            <div class="form-group mb-3">
              <label class="form-label text-xs">Or Upload Your Own Packaging Image:</label>
              <input type="file" id="visualUploadInput" class="form-control" accept="image/*" onchange="window.buyerDashboard.handleCustomImageUpload(this)">
            </div>

            <!-- Inspection Result Area -->
            <div id="visualInspectionResultBox">
              <!-- Default sample result -->
            </div>

          </div>

          <div class="modal-footer">
            <button class="btn btn-primary" onclick="window.app.closeModal()">Done</button>
          </div>
        </div>
      </div>
    `;

    // Run clean sample initially
    this.runSampleInspection("PRESET_CLEAN");
  }

  runSampleInspection(presetKey) {
    const report = window.qualityChecker.runVisualInspection(presetKey);
    this.renderInspectionResult(report);
  }

  handleCustomImageUpload(input) {
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const report = window.qualityChecker.runVisualInspection({
          dataUrl: e.target.result,
          fileName: file.name
        });
        this.renderInspectionResult(report);
      };
      reader.readAsDataURL(file);
    }
  }

  renderInspectionResult(report) {
    const resultBox = document.getElementById("visualInspectionResultBox");
    if (!report || !resultBox) return;

    const isDefective = report.visibleTears || report.leakageDetected;

    resultBox.innerHTML = `
      <div class="card" style="background:#f8fafc; border:1px solid var(--border); padding:1rem;">
        <div class="flex gap-3" style="flex-wrap:wrap;">
          
          <div style="flex: 1; min-width: 200px;">
            <img src="${report.imageUrl}" alt="Inspected Pack" style="width:100%; height:180px; object-fit:cover; border-radius:8px; border:1px solid #cbd5e1;">
            <div class="text-xs text-muted mt-1 text-center">${report.title}</div>
          </div>

          <div style="flex: 1.5; min-width: 240px;">
            <div class="flex items-center justify-between mb-2">
              <span class="badge ${isDefective ? 'badge-danger' : 'badge-success'}">
                ${isDefective ? 'DEFECT DETECTED' : 'PACKAGING APPROVED'}
              </span>
              <span class="text-xs text-muted">Audited at ${report.analyzedAt}</span>
            </div>

            <div class="flex flex-col gap-1 text-xs mb-2">
              <div class="flex justify-between"><span>Seal Integrity:</span><b>${report.sealIntegrity}</b></div>
              <div class="flex justify-between"><span>Surface Tears:</span><b>${report.visibleTears ? 'YES (FLAGGED)' : 'NONE'}</b></div>
              <div class="flex justify-between"><span>Moisture Leakage:</span><b>${report.leakageDetected ? 'YES (FLAGGED)' : 'NONE'}</b></div>
              <div class="flex justify-between"><span>Contamination:</span><span>${report.surfaceContamination}</span></div>
            </div>

            <div class="card mb-2" style="background:#ffffff; padding:0.6rem; border:1px solid #e2e8f0; font-size:0.75rem;">
              <b>AI Inspector Note:</b> ${report.notes}
            </div>

            <div class="text-xs text-muted" style="background:#fffbeb; color:#92400e; padding:0.4rem; border-radius:4px; border:1px solid #fde68a; font-size:0.7rem;">
              ⚠️ ${report.disclaimer}
            </div>
          </div>

        </div>
      </div>
    `;
  }
}

window.buyerDashboard = new BuyerDashboard();

