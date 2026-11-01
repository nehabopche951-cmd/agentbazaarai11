// AgentBazaar AI - Seller Dashboard Controller
// Complies with Section 5: Inventory management, Add Product, Minimum Selling Price safeguards, Agent Tuning

class SellerDashboard {
  constructor() {}

  renderDashboard() {
    const container = document.getElementById("sellerDashboardContent");
    if (!container) return;

    const user = window.db.getCurrentUser();
    // Default to Seller A if user logged in as generic or Seller A
    const sellerId = user?.sellerDetails?.id || user?.id || "SELLER_A";
    const seller = window.db.getSellerById(sellerId) || window.db.getSellers()[0];
    const products = window.db.getProducts().filter(p => p.sellerId === seller.id);
    const orders = window.db.getOrders().filter(o => o.sellerId === seller.id);

    container.innerHTML = `
      <!-- Seller Business Profile Header -->
      <div class="card mb-4" style="background: linear-gradient(135deg, #0f172a, #1e293b); color: #fff;">
        <div class="flex items-center justify-between" style="flex-wrap: wrap; gap: 1rem;">
          
          <div class="flex items-center gap-3">
            <div class="brand-logo-icon" style="width: 56px; height: 56px; font-size: 1.5rem;">
              🏪
            </div>
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="badge badge-success">VERIFIED SELLER</span>
                <span class="badge badge-purple">${seller.badge}</span>
                <span class="text-xs text-muted" style="color:#94a3b8;">GSTIN: ${seller.gstin}</span>
              </div>
              <h1 style="font-size: 1.5rem; color:#fff;">${seller.name}</h1>
              <p style="font-size: 0.85rem; color: #cbd5e1;">Owner: <b>${seller.owner}</b> • 📍 ${seller.city}</p>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <div class="score-circle ${seller.trustScore >= 90 ? 'score-high' : 'score-mid'}" style="width:60px; height:60px;">
              ${seller.trustScore}
              <small>TRUST</small>
            </div>
            <div class="flex flex-col gap-1">
              <button class="btn btn-accent btn-sm" onclick="window.sellerDashboard.openAddProductModal()">
                <span>+ Add New Product</span>
              </button>
              <button class="btn btn-outline btn-sm" style="color:#fff; border-color:rgba(255,255,255,0.25);" onclick="window.sellerDashboard.openAgentSettingsModal('${seller.id}')">
                <span>🤖 Tune Seller Bot</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      <!-- Quick KPI Stats -->
      <div class="grid grid-4 gap-3 mb-4">
        <div class="card">
          <span class="text-xs text-muted font-bold">Catalog Inventory</span>
          <div style="font-size: 1.5rem; font-weight:800; color:var(--primary); margin:0.2rem 0;">${products.length} Products</div>
          <span class="text-xs text-muted">Ready for A2A Quotes</span>
        </div>
        <div class="card">
          <span class="text-xs text-muted font-bold">Orders Fulfilled</span>
          <div style="font-size: 1.5rem; font-weight:800; color:var(--success); margin:0.2rem 0;">${seller.metrics.totalOrders + orders.length}</div>
          <span class="text-xs text-muted">${seller.metrics.onTimeDelivery} On-Time Rate</span>
        </div>
        <div class="card">
          <span class="text-xs text-muted font-bold">Seller AI Agent</span>
          <div style="font-size: 1.1rem; font-weight:800; color:var(--accent-purple); margin:0.35rem 0;">${seller.agentPersona.name}</div>
          <span class="badge badge-purple text-xs">${seller.agentPersona.strategy}</span>
        </div>
        <div class="card">
          <span class="text-xs text-muted font-bold">Low Stock Alerts</span>
          <div style="font-size: 1.5rem; font-weight:800; color:var(--accent-cyan); margin:0.2rem 0;">0 Critical</div>
          <span class="text-xs text-muted">Auto-Replenish Enabled</span>
        </div>
      </div>

      <!-- Product Inventory Management Table -->
      <div class="card mb-4">
        <div class="card-header">
          <div>
            <div class="card-title">📦 Manage Product Inventory & Pricing Bounds</div>
            <div class="text-xs text-muted">Set baseline prices and minimum acceptable thresholds. Your autonomous bot will never negotiate below the minimum floor price.</div>
          </div>
          <button class="btn btn-accent btn-sm" onclick="window.sellerDashboard.openAddProductModal()">
            <span>+ Add New Product</span>
          </button>
        </div>

        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Available Stock</th>
                <th>List Price (₹)</th>
                <th>Min Floor Price (₹)</th>
                <th>Quality Score</th>
                <th>Expiry</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${products.map(p => `
                <tr>
                  <td>
                    <div class="flex items-center gap-2">
                      <img src="${p.image}" alt="${p.name}" style="width:36px; height:36px; border-radius:6px; object-fit:cover;">
                      <div>
                        <div style="font-weight:700;">${p.name}</div>
                        <div class="text-xs text-muted">${p.brand}</div>
                      </div>
                    </div>
                  </td>
                  <td>${p.category}</td>
                  <td><b>${p.stock} Units</b></td>
                  <td>₹${p.unitPrice}</td>
                  <td style="color:var(--danger); font-weight:700;">₹${p.minAcceptablePrice}</td>
                  <td><span class="badge badge-success">${p.qualityScore}/100</span></td>
                  <td class="text-xs">${p.expiryDate}</td>
                  <td>
                    <button class="btn btn-outline btn-sm" onclick="window.sellerDashboard.openEditPriceModal('${p.id}')">
                      Edit Price
                    </button>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Seller AI Agent Status & Incoming RFQs -->
      <div class="grid grid-2 gap-4">
        
        <!-- Bot Policy Safeguards Card -->
        <div class="card">
          <div class="card-header">
            <div class="card-title text-sm">🤖 Bot Negotiation Boundaries & Strategy</div>
            <span class="badge badge-cyan">Active Sentinel</span>
          </div>

          <div class="flex flex-col gap-2 text-sm">
            <div class="flex justify-between py-1 border-bottom">
              <span class="text-muted">Agent Code:</span>
              <span style="font-family:monospace;">${seller.agentPersona.code}</span>
            </div>
            <div class="flex justify-between py-1 border-bottom">
              <span class="text-muted">Assigned Strategy:</span>
              <b>${seller.agentPersona.strategy}</b>
            </div>
            <div class="flex justify-between py-1 border-bottom">
              <span class="text-muted">Margin Concession Tolerance:</span>
              <b>Up to ${seller.agentPersona.marginTolerancePercent}%</b>
            </div>
            <div class="flex justify-between py-1 border-bottom">
              <span class="text-muted">Bulk Discount Trigger:</span>
              <b>Orders > ${seller.agentPersona.bulkDiscountThreshold} Units</b>
            </div>
            <div class="flex justify-between py-1 border-bottom">
              <span class="text-muted">Guaranteed Dispatch Window:</span>
              <b>Within ${seller.agentPersona.deliveryGuaranteeDays} Days</b>
            </div>
          </div>

          <p class="text-xs text-muted mt-3" style="background:#f8fafc; padding:0.6rem; border-radius:6px;">
            <b>Autonomous Guarantee:</b> Even during multi-round A2A haggling, the agent protects your bottom-line margin and rejects any counter-offer below your designated floor price.
          </p>
        </div>

        <!-- Incoming Buyer Requests & Orders -->
        <div class="card">
          <div class="card-header">
            <div class="card-title text-sm">📋 Recent Deal Activity & Orders</div>
            <span class="badge badge-success">${orders.length} Active</span>
          </div>

          ${orders.length > 0 ? `
            <div class="flex flex-col gap-2">
              ${orders.map(o => `
                <div class="card" style="background:#f8fafc; padding:0.75rem; border:1px solid var(--border);">
                  <div class="flex justify-between text-xs mb-1">
                    <span style="font-family:monospace; font-weight:700;">${o.orderId}</span>
                    <span class="badge badge-success">${o.status}</span>
                  </div>
                  <div style="font-weight:700; font-size:0.9rem;">${o.productName}</div>
                  <div class="flex justify-between text-xs text-muted mt-1">
                    <span>${o.quantity} Units @ ₹${o.unitPriceFinal}</span>
                    <span style="font-weight:800; color:var(--primary);">Total: ₹${o.totalFinal.toLocaleString()}</span>
                  </div>
                </div>
              `).join("")}
            </div>
          ` : `
            <div class="text-center text-muted" style="padding:2rem;">
              <div>🤝</div>
              <div class="text-sm mt-1">No pending orders right now.</div>
              <div class="text-xs">Your bot is standing by to respond to incoming buyer RFQs.</div>
            </div>
          `}
        </div>

      </div>
    `;
  }

  // Open "Add New Product" Modal (Section 5)
  openAddProductModal() {
    const modal = document.getElementById("genericModal");
    if (!modal) return;

    modal.innerHTML = `
      <div class="modal-overlay" onclick="window.app.closeModal(event)">
        <div class="modal-content" style="max-width: 640px;" onclick="event.stopPropagation()">
          <div class="modal-header">
            <div class="card-title">
              <span>+ Add New Product to Marketplace</span>
            </div>
            <button class="modal-close-btn" onclick="window.app.closeModal()">&times;</button>
          </div>

          <form id="addProductForm" onsubmit="window.sellerDashboard.handleAddProduct(event)">
            <div class="modal-body">
              <div class="grid grid-2 gap-3 mb-3">
                <div class="form-group">
                  <label class="form-label">Product Name *</label>
                  <input type="text" id="newProdName" class="form-control" placeholder="e.g. Premium Sona Masoori Rice" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Category *</label>
                  <select id="newProdCategory" class="form-control" required>
                    <option value="Grains & Rice">Grains & Rice</option>
                    <option value="Edible Oils">Edible Oils</option>
                    <option value="Pulses & Dals">Pulses & Dals</option>
                    <option value="Sweeteners">Sweeteners</option>
                    <option value="Spices & Condiments">Spices & Condiments</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-2 gap-3 mb-3">
                <div class="form-group">
                  <label class="form-label">Brand Name *</label>
                  <input type="text" id="newProdBrand" class="form-control" placeholder="e.g. Harvest Pure" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Available Stock Quantity *</label>
                  <input type="number" id="newProdStock" class="form-control" placeholder="e.g. 250" required min="1">
                </div>
              </div>

              <div class="grid grid-2 gap-3 mb-3">
                <div class="form-group">
                  <label class="form-label">Unit List Price (₹) *</label>
                  <input type="number" id="newProdUnitPrice" class="form-control" placeholder="e.g. 480" required min="1">
                </div>
                <div class="form-group">
                  <label class="form-label">Minimum Selling Floor Price (₹) *</label>
                  <input type="number" id="newProdMinPrice" class="form-control" placeholder="e.g. 430" required min="1">
                  <span class="text-xs text-muted">Bot will never negotiate below this.</span>
                </div>
              </div>

              <div class="grid grid-2 gap-3 mb-3">
                <div class="form-group">
                  <label class="form-label">Manufacturing Date</label>
                  <input type="date" id="newProdMfgDate" class="form-control" value="2026-09-01">
                </div>
                <div class="form-group">
                  <label class="form-label">Expiry Date *</label>
                  <input type="date" id="newProdExpDate" class="form-control" value="2027-09-01" required>
                </div>
              </div>

              <div class="grid grid-2 gap-3 mb-3">
                <div class="form-group">
                  <label class="form-label">Delivery Guarantee (Days) *</label>
                  <input type="number" id="newProdDelivery" class="form-control" value="3" min="1" max="10" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Certifications</label>
                  <input type="text" id="newProdCerts" class="form-control" placeholder="e.g. FSSAI #100293120, Agmark A">
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Description & Quality Details</label>
                <textarea id="newProdDesc" class="form-control" placeholder="Aged grains, moisture-proof multi-layer packing..."></textarea>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-outline" onclick="window.app.closeModal()">Cancel</button>
              <button type="submit" class="btn btn-accent">Save Product</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  handleAddProduct(e) {
    e.preventDefault();
    const user = window.db.getCurrentUser();
    const sellerId = user?.sellerDetails?.id || user?.id || "SELLER_A";

    const name = document.getElementById("newProdName").value;
    const category = document.getElementById("newProdCategory").value;
    const brand = document.getElementById("newProdBrand").value;
    const stock = parseInt(document.getElementById("newProdStock").value) || 100;
    const unitPrice = parseInt(document.getElementById("newProdUnitPrice").value) || 500;
    const minAcceptablePrice = parseInt(document.getElementById("newProdMinPrice").value) || 450;
    const mfgDate = document.getElementById("newProdMfgDate").value;
    const expiryDate = document.getElementById("newProdExpDate").value;
    const deliveryDays = parseInt(document.getElementById("newProdDelivery").value) || 3;
    const certsStr = document.getElementById("newProdCerts").value;
    const desc = document.getElementById("newProdDesc").value;

    const certs = certsStr ? certsStr.split(",").map(c => c.trim()) : ["FSSAI Certified"];

    const newProduct = {
      name,
      category,
      brand,
      sellerId,
      description: desc || "High quality product.",
      image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80",
      stock,
      mrp: unitPrice + 50,
      unitPrice,
      minAcceptablePrice,
      mfgDate,
      expiryDate,
      certifications: certs,
      qualityScore: 85,
      deliveryDays,
      paymentTerms: "Mock UPI on Delivery Approval"
    };

    window.db.addProduct(newProduct);
    window.app.showToast("Product added to marketplace successfully!", "success");
    window.app.closeModal();
    this.renderDashboard();
  }

  // Edit Product Price Modal
  openEditPriceModal(prodId) {
    const prod = window.db.getProductById(prodId);
    if (!prod) return;

    const modal = document.getElementById("genericModal");
    if (!modal) return;

    modal.innerHTML = `
      <div class="modal-overlay" onclick="window.app.closeModal(event)">
        <div class="modal-content" style="max-width: 440px;" onclick="event.stopPropagation()">
          <div class="modal-header">
            <div class="card-title">Edit Price Bounds</div>
            <button class="modal-close-btn" onclick="window.app.closeModal()">&times;</button>
          </div>
          <div class="modal-body">
            <div style="font-weight:700; margin-bottom:1rem;">${prod.name}</div>
            <div class="form-group mb-3">
              <label class="form-label">Catalog Unit Price (₹)</label>
              <input type="number" id="editUnitPrice" class="form-control" value="${prod.unitPrice}">
            </div>
            <div class="form-group mb-3">
              <label class="form-label">Minimum Floor Price (₹)</label>
              <input type="number" id="editMinPrice" class="form-control" value="${prod.minAcceptablePrice}">
              <span class="text-xs text-muted">Bot hard stop boundary.</span>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" onclick="window.app.closeModal()">Cancel</button>
            <button class="btn btn-accent" onclick="window.sellerDashboard.savePriceUpdates('${prod.id}')">Save Changes</button>
          </div>
        </div>
      </div>
    `;
  }

  savePriceUpdates(prodId) {
    const unitPrice = parseInt(document.getElementById("editUnitPrice").value);
    const minAcceptablePrice = parseInt(document.getElementById("editMinPrice").value);

    if (minAcceptablePrice > unitPrice) {
      window.app.showToast("Minimum floor price cannot exceed unit price!", "error");
      return;
    }

    window.db.updateProduct(prodId, { unitPrice, minAcceptablePrice });
    window.app.showToast("Price bounds updated successfully!", "success");
    window.app.closeModal();
    this.renderDashboard();
  }

  // Tune Bot Strategy Modal
  openAgentSettingsModal(sellerId) {
    const seller = window.db.getSellerById(sellerId);
    if (!seller) return;

    const modal = document.getElementById("genericModal");
    if (!modal) return;

    modal.innerHTML = `
      <div class="modal-overlay" onclick="window.app.closeModal(event)">
        <div class="modal-content" style="max-width: 500px;" onclick="event.stopPropagation()">
          <div class="modal-header">
            <div class="card-title">🤖 Configure ${seller.name} AI Agent</div>
            <button class="modal-close-btn" onclick="window.app.closeModal()">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group mb-3">
              <label class="form-label">Negotiation Strategy</label>
              <select id="agentStrategySelect" class="form-control">
                <option value="Budget & Volume" ${seller.agentPersona.strategy.includes("Budget") ? 'selected' : ''}>Budget & Volume (Aggressive Bulk Concessions)</option>
                <option value="Premium Quality & Speed" ${seller.agentPersona.strategy.includes("Premium") ? 'selected' : ''}>Premium Quality & Speed (Firm Pricing)</option>
                <option value="Inventory Liquidation" ${seller.agentPersona.strategy.includes("Liquidation") ? 'selected' : ''}>Inventory Liquidation (Deep Discounts)</option>
              </select>
            </div>
            <div class="form-group mb-3">
              <label class="form-label">Max Concession Tolerance (%)</label>
              <input type="number" id="agentTolerance" class="form-control" value="${seller.agentPersona.marginTolerancePercent}">
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" onclick="window.app.closeModal()">Cancel</button>
            <button class="btn btn-purple" onclick="window.app.showToast('Agent strategy tuned successfully!', 'success'); window.app.closeModal();">Save Settings</button>
          </div>
        </div>
      </div>
    `;
  }
}

window.sellerDashboard = new SellerDashboard();

