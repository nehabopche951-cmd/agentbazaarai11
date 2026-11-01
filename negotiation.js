// AgentBazaar AI - Live Agent-to-Agent Negotiation Room & Simulation
// Coordinates parallel negotiations between Buyer Agent and Sellers A, B, and C

class NegotiationRoom {
  constructor() {
    this.currentRound = 1;
    this.maxRounds = 3;
    this.isSimulating = false;
    this.activeCriteria = null;
    this.offers = {
      SELLER_A: null,
      SELLER_B: null,
      SELLER_C: null
    };
    this.conversationHistory = [];
  }

  // Start a new negotiation session
  startSession(criteria) {
    this.currentRound = 1;
    this.activeCriteria = criteria || {
      product: "Royal Basmati Rice 5kg",
      quantity: 40,
      maxBudget: 22000,
      minQuality: 75,
      deliveryDate: "Before Diwali (4 Days)",
      paymentTerms: "Mock UPI Escrow"
    };

    this.conversationHistory = [];
    window.db.clearA2AHistory();

    const buyerUser = window.db.getCurrentUser() || { name: "Priya Sharma" };
    const buyerAgent = {
      agentId: "BUYER_AGENT_001",
      role: "buyer_agent",
      name: "BazaarCopilot AI"
    };

    // Buyer Agent initial broadcast RFQ
    const rfqText = `Requirement Broadcast: Seeking quotes for ${this.activeCriteria.quantity} units of ${this.activeCriteria.product}. Maximum budget cap: ₹${this.activeCriteria.maxBudget.toLocaleString()}. Preferred delivery: ${this.activeCriteria.deliveryDate}. Minimum quality threshold: ${this.activeCriteria.minQuality}/100.`;
    
    this.addMessage("BUYER", buyerAgent.name, rfqText, "RFQ_BROADCAST", "chat-bubble-buyer");

    // Generate Round 1 offers from all 3 sellers
    this.offers.SELLER_A = window.agentEngine.generateSellerOfferA(this.activeCriteria, 1);
    this.offers.SELLER_B = window.agentEngine.generateSellerOfferB(this.activeCriteria, 1);
    this.offers.SELLER_C = window.agentEngine.generateSellerOfferC(this.activeCriteria, 1);

    // Record A2A protocol packets
    this.recordA2ARound(1);

    // Save session state to database
    window.db.setActiveNegotiation({
      criteria: this.activeCriteria,
      round: 1,
      offers: this.offers,
      history: this.conversationHistory
    });

    this.renderRoom();
  }

  recordA2ARound(round) {
    const buyer = { agentId: "BUYER_AGENT_001", role: "buyer_agent", name: "BazaarCopilot AI" };

    ["SELLER_A", "SELLER_B", "SELLER_C"].forEach(key => {
      const offer = this.offers[key];
      if (offer) {
        // Buyer RFQ to Seller
        window.agentEngine.createA2AMessage("RFQ_REQUEST", buyer, {
          agentId: offer.agentId,
          role: "seller_agent",
          name: offer.agentName
        }, {
          product: this.activeCriteria.product,
          quantity: this.activeCriteria.quantity,
          max_budget: this.activeCriteria.maxBudget,
          round: round
        });

        // Seller offer response
        window.agentEngine.createA2AMessage(round === 3 ? "FINAL_OFFER_BAFO" : "PRICE_OFFER", {
          agentId: offer.agentId,
          role: "seller_agent",
          name: offer.agentName
        }, buyer, {
          product: offer.productName,
          quantity: offer.quantity,
          original_unit: offer.originalUnitPrice,
          offered_unit: offer.offeredUnitPrice,
          total: offer.finalTotal,
          discount_pct: offer.discountPercent,
          delivery_days: offer.deliveryDays,
          quality_score: offer.qualityScore,
          trust_score: offer.trustScore
        });

        // Add to visual conversation
        let bubbleClass = key === "SELLER_A" ? "chat-bubble-seller-a" : key === "SELLER_B" ? "chat-bubble-seller-b" : "chat-bubble-seller-c";
        this.addMessage(key, offer.agentName, offer.textResponse, `ROUND_${round}_QUOTE`, bubbleClass);
      }
    });
  }

  // Advance to Next Round (Counter-offer & negotiation)
  advanceRound() {
    if (this.currentRound >= this.maxRounds) {
      window.app.showToast("Final round already reached. Review comparison and AI recommendations below.", "warning");
      return;
    }

    this.currentRound++;
    const buyerAgentName = "BazaarCopilot AI";

    if (this.currentRound === 2) {
      // Buyer counter-offer message
      const counterText = `Counter-Offer & Bulk Incentive Query: We acknowledge the initial quotes. Given that we are ordering a high volume of ${this.activeCriteria.quantity} bags, what is your most aggressive bulk discount? Also, please confirm delivery guarantees and return policies.`;
      this.addMessage("BUYER", buyerAgentName, counterText, "COUNTER_OFFER_REQUEST", "chat-bubble-buyer");

      // Sellers respond with Round 2 concessions
      this.offers.SELLER_A = window.agentEngine.generateSellerOfferA(this.activeCriteria, 2);
      this.offers.SELLER_B = window.agentEngine.generateSellerOfferB(this.activeCriteria, 2);
      this.offers.SELLER_C = window.agentEngine.generateSellerOfferC(this.activeCriteria, 2);

      this.recordA2ARound(2);
      window.app.showToast("Round 2 Negotiations Completed: Sellers countered with volume discounts!", "success");
    } else if (this.currentRound === 3) {
      // Final Round
      const finalCallText = `Final Call (BAFO): Buyer Agent requesting final best-and-final offers. System will calculate composite deal score based on verified quality, trust score, price savings, and delivery speed.`;
      this.addMessage("BUYER", buyerAgentName, finalCallText, "FINAL_CALL_REQUEST", "chat-bubble-buyer");

      this.offers.SELLER_A = window.agentEngine.generateSellerOfferA(this.activeCriteria, 3);
      this.offers.SELLER_B = window.agentEngine.generateSellerOfferB(this.activeCriteria, 3);
      this.offers.SELLER_C = window.agentEngine.generateSellerOfferC(this.activeCriteria, 3);

      this.recordA2ARound(3);
      window.app.showToast("Final Offers Received! Proceeding to AI Quality & Deal Analysis.", "success");
    }

    // Update active negotiation in DB
    window.db.setActiveNegotiation({
      criteria: this.activeCriteria,
      round: this.currentRound,
      offers: this.offers,
      history: this.conversationHistory
    });

    this.renderRoom();
  }

  // Run full automatic simulation
  runFullSimulation(callback) {
    this.startSession(this.activeCriteria);
    setTimeout(() => {
      this.advanceRound();
      setTimeout(() => {
        this.advanceRound();
        if (callback) callback();
      }, 1500);
    }, 1500);
  }

  addMessage(senderKey, senderName, text, protocolType, bubbleClass) {
    this.conversationHistory.push({
      senderKey,
      senderName,
      text,
      protocolType,
      bubbleClass,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    });
  }

  // Render the Live Negotiation Room view
  renderRoom() {
    const container = document.getElementById("negotiationRoomContent");
    if (!container) return;

    const offerA = this.offers.SELLER_A;
    const offerB = this.offers.SELLER_B;
    const offerC = this.offers.SELLER_C;

    // Check if we have final recommendations ready
    let recommendationData = null;
    if (this.currentRound >= 2) {
      recommendationData = window.agentEngine.evaluateAndRecommendDeals([offerA, offerB, offerC], this.activeCriteria);
    }

    let messagesHtml = this.conversationHistory.map(msg => `
      <div class="chat-bubble ${msg.bubbleClass}">
        <div class="chat-agent-meta">
          <span>${msg.senderName}</span>
          <span class="protocol-tag">${msg.protocolType} • ${msg.time}</span>
        </div>
        <div>${msg.text}</div>
      </div>
    `).join("");

    container.innerHTML = `
      <!-- Top Status Bar -->
      <div class="card mb-4" style="background: linear-gradient(135deg, #0b192c, #1e3e62); color: #fff;">
        <div class="flex items-center justify-between" style="flex-wrap: wrap; gap: 1rem;">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="badge badge-cyan" style="background: rgba(0, 173, 181, 0.2); color: #5eead4;">LIVE A2A ROOM</span>
              <span class="badge badge-purple" style="background: rgba(139, 92, 246, 0.2); color: #d8b4fe;">ROUND ${this.currentRound} OF ${this.maxRounds}</span>
              <span class="badge badge-success" style="background: rgba(16, 185, 129, 0.2); color: #6ee7b7;">3 SELLERS ACTIVE</span>
            </div>
            <h2 style="font-size: 1.35rem; color:#fff;">Negotiating: ${this.activeCriteria.quantity} units of ${this.activeCriteria.product}</h2>
            <p style="color: #cbd5e1; font-size: 0.85rem;">Buyer Agent: <b>BazaarCopilot AI</b> | Maximum Ceiling Budget: <b>₹${this.activeCriteria.maxBudget.toLocaleString()}</b></p>
          </div>

          <div class="flex items-center gap-2">
            ${this.currentRound < this.maxRounds ? `
              <button class="btn btn-accent btn-sm" onclick="window.negotiationRoom.advanceRound()">
                <span>⚡ Next Negotiation Round (${this.currentRound + 1}/${this.maxRounds})</span>
              </button>
            ` : `
              <span class="badge badge-success" style="font-size:0.85rem; padding:0.4rem 0.8rem;">✓ Final Offers Sealed</span>
            `}
            <button class="btn btn-outline btn-sm" style="color:#fff; border-color: rgba(255,255,255,0.25);" onclick="window.negotiationRoom.openProtocolInspector()">
              <span>🔍 Inspect A2A JSON Packets</span>
            </button>
            <button class="btn btn-purple btn-sm" onclick="window.securityGuardian.simulateAdversarialAttack(); window.negotiationRoom.renderRoom();">
              <span>🛡️ Test Security Attack</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Main Layout: Seller Cards + Live Chat + Comparison -->
      <div class="negotiation-container">
        
        <!-- Left Column: Seller Agent Personas & Current Quote -->
        <div class="flex flex-col gap-3">
          <h4 style="font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted);">Competing Seller Agents</h4>

          <!-- Seller A Card -->
          <div class="agent-card ${recommendationData?.recommendedDeal?.sellerId === 'SELLER_A' ? 'active' : ''}">
            <div class="flex items-center justify-between mb-2">
              <span class="badge badge-success">Seller A (Budget)</span>
              <span class="badge badge-dark">Trust ${offerA.trustScore}%</span>
            </div>
            <div style="font-weight: 700; font-size: 0.95rem;">${offerA.sellerName}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.5rem;">${offerA.agentName}</div>
            <div class="flex items-center justify-between" style="background:#f8fafc; padding:0.4rem 0.6rem; border-radius:6px; font-size:0.85rem;">
              <span>Offered Total:</span>
              <span style="font-weight:800; color:var(--primary);">₹${offerA.finalTotal.toLocaleString()}</span>
            </div>
            <div class="flex items-center justify-between text-xs text-muted mt-1">
              <span>Per bag: ₹${offerA.offeredUnitPrice}</span>
              <span style="color:var(--success); font-weight:700;">-${offerA.discountPercent}% Off</span>
            </div>
            <div class="text-xs text-muted mt-1">Delivery: ${offerA.deliveryDays} days | Quality: ${offerA.qualityScore}/100</div>
          </div>

          <!-- Seller B Card -->
          <div class="agent-card ${recommendationData?.recommendedDeal?.sellerId === 'SELLER_B' ? 'active' : ''}">
            <div class="flex items-center justify-between mb-2">
              <span class="badge badge-purple">Seller B (Premium)</span>
              <span class="badge badge-dark">Trust ${offerB.trustScore}%</span>
            </div>
            <div style="font-weight: 700; font-size: 0.95rem;">${offerB.sellerName}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.5rem;">${offerB.agentName}</div>
            <div class="flex items-center justify-between" style="background:#f8fafc; padding:0.4rem 0.6rem; border-radius:6px; font-size:0.85rem;">
              <span>Offered Total:</span>
              <span style="font-weight:800; color:var(--primary);">₹${offerB.finalTotal.toLocaleString()}</span>
            </div>
            <div class="flex items-center justify-between text-xs text-muted mt-1">
              <span>Per bag: ₹${offerB.offeredUnitPrice}</span>
              <span style="color:var(--success); font-weight:700;">-${offerB.discountPercent}% Off</span>
            </div>
            <div class="text-xs text-muted mt-1">Express Delivery: ${offerB.deliveryDays} days | Quality: ${offerB.qualityScore}/100</div>
          </div>

          <!-- Seller C Card -->
          <div class="agent-card ${recommendationData?.recommendedDeal?.sellerId === 'SELLER_C' ? 'active' : ''}">
            <div class="flex items-center justify-between mb-2">
              <span class="badge badge-warning">Seller C (Clearance)</span>
              <span class="badge badge-dark">Trust ${offerC.trustScore}%</span>
            </div>
            <div style="font-weight: 700; font-size: 0.95rem;">${offerC.sellerName}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.5rem;">${offerC.agentName}</div>
            <div class="flex items-center justify-between" style="background:#f8fafc; padding:0.4rem 0.6rem; border-radius:6px; font-size:0.85rem;">
              <span>Offered Total:</span>
              <span style="font-weight:800; color:var(--primary);">₹${offerC.finalTotal.toLocaleString()}</span>
            </div>
            <div class="flex items-center justify-between text-xs text-muted mt-1">
              <span>Per bag: ₹${offerC.offeredUnitPrice}</span>
              <span style="color:var(--success); font-weight:700;">-${offerC.discountPercent}% Off</span>
            </div>
            <div class="text-xs text-muted mt-1">Delivery: ${offerC.deliveryDays} days | Quality: ${offerC.qualityScore}/100</div>
          </div>

        </div>

        <!-- Middle Column: Live A2A Chat Stream -->
        <div class="chat-window">
          <div class="chat-header">
            <div class="flex items-center gap-2">
              <div class="agent-avatar-sm" style="background:var(--primary); color:#fff;">AI</div>
              <div>
                <div style="font-weight:700; font-size:0.9rem;">Autonomous A2A Protocol Stream</div>
                <div class="text-xs text-muted">Buyer Agent ↔ 3 Autonomous Seller Bots</div>
              </div>
            </div>
            <span class="badge badge-cyan" style="font-size:0.7rem;">Protocol: AB-A2A/1.0</span>
          </div>

          <div class="chat-messages" id="a2aMessageScroll">
            ${messagesHtml}
          </div>
        </div>

        <!-- Right Column: Live Comparison & AI Decision Recommendation -->
        <div class="flex flex-col gap-3">
          <h4 style="font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted);">Deal Evaluation</h4>

          ${recommendationData ? `
            <div class="card" style="border-top: 4px solid var(--accent-purple); padding:1.15rem;">
              <div class="flex items-center justify-between mb-2">
                <span class="badge badge-purple" style="font-weight:700;">AI BEST DEAL MATCH</span>
                <span style="font-size:0.8rem; font-weight:800; color:var(--accent-purple);">SCORE: ${recommendationData.recommendedDeal.compositeScore}/100</span>
              </div>
              <div style="font-weight:800; font-size:1.1rem; color:var(--primary); margin-bottom:0.25rem;">
                ${recommendationData.recommendedDeal.sellerName}
              </div>
              <p style="font-size:0.8rem; color:var(--text-muted); line-height:1.45; margin-bottom:0.85rem;">
                ${recommendationData.recommendationReason}
              </p>

              <div class="flex flex-col gap-1 mb-3" style="background:#f8fafc; padding:0.6rem; border-radius:8px; font-size:0.8rem;">
                <div class="flex justify-between"><span>Negotiated Total:</span><b>₹${recommendationData.recommendedDeal.finalTotal.toLocaleString()}</b></div>
                <div class="flex justify-between"><span>Total Savings:</span><b style="color:var(--success);">₹${recommendationData.recommendedDeal.discountAmount.toLocaleString()} (${recommendationData.recommendedDeal.discountPercent}%)</b></div>
                <div class="flex justify-between"><span>Quality Score:</span><b>${recommendationData.recommendedDeal.qualityScore}/100 (Certified)</b></div>
                <div class="flex justify-between"><span>Delivery:</span><b>${recommendationData.recommendedDeal.deliveryDays} Days Guaranteed</b></div>
              </div>

              <button class="btn btn-primary w-full" onclick="window.app.openApprovalModal('${recommendationData.recommendedDeal.sellerId}')">
                <span>Proceed to Human Approval ➔</span>
              </button>
            </div>
          ` : `
            <div class="card text-center" style="padding:2rem;">
              <div style="font-size:2rem; margin-bottom:0.5rem;">🤖</div>
              <div style="font-weight:700;">Negotiation in Progress</div>
              <p class="text-xs text-muted mt-1">Advance to Round 2 to reveal AI deal rankings and multi-factor evaluation.</p>
            </div>
          `}

          <!-- Quick Comparison Matrix Card -->
          <div class="card" style="padding:1rem;">
            <div class="card-title text-sm mb-2" style="font-size:0.85rem;">📊 Multi-Seller Matrix</div>
            <table class="table" style="font-size:0.75rem;">
              <thead>
                <tr>
                  <th>Seller</th>
                  <th>Price</th>
                  <th>Quality</th>
                  <th>Speed</th>
                </tr>
              </thead>
              <tbody>
                <tr style="${recommendationData?.recommendedDeal?.sellerId === 'SELLER_A' ? 'font-weight:bold; background:#f0fdf4;' : ''}">
                  <td>Balaji (A)</td>
                  <td>₹${offerA.finalTotal.toLocaleString()}</td>
                  <td>${offerA.qualityScore}/100</td>
                  <td>4 Days</td>
                </tr>
                <tr style="${recommendationData?.recommendedDeal?.sellerId === 'SELLER_B' ? 'font-weight:bold; background:#faf5ff;' : ''}">
                  <td>Organic (B)</td>
                  <td>₹${offerB.finalTotal.toLocaleString()}</td>
                  <td>${offerB.qualityScore}/100</td>
                  <td>2 Days ⚡</td>
                </tr>
                <tr style="${recommendationData?.recommendedDeal?.sellerId === 'SELLER_C' ? 'font-weight:bold; background:#fffbeb;' : ''}">
                  <td>Clearance (C)</td>
                  <td>₹${offerC.finalTotal.toLocaleString()}</td>
                  <td>${offerC.qualityScore}/100</td>
                  <td>3 Days</td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>

      </div>
    `;

    // Auto-scroll chat to bottom
    const scrollContainer = document.getElementById("a2aMessageScroll");
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }

  // Open A2A Protocol Packet Inspector Modal (Section 12)
  openProtocolInspector() {
    const packets = window.db.getA2AHistory();
    const modal = document.getElementById("genericModal");
    if (!modal) return;

    modal.innerHTML = `
      <div class="modal-overlay" onclick="window.app.closeModal(event)">
        <div class="modal-content" style="max-width: 780px;" onclick="event.stopPropagation()">
          <div class="modal-header">
            <div class="card-title">
              <span>📡 A2A Protocol Packet Inspector</span>
              <span class="badge badge-purple" style="font-size:0.7rem;">AB-A2A/1.0</span>
            </div>
            <button class="modal-close-btn" onclick="window.app.closeModal()">&times;</button>
          </div>
          <div class="modal-body">
            <p class="text-sm text-muted mb-3">
              Standardized JSON messages exchanged between <code>BUYER_AGENT_001</code> and autonomous seller agents. Each packet contains a cryptographic checksum, message ID, role taxonomy, and structured negotiation payload.
            </p>
            <div style="display:flex; flex-direction:column; gap:0.75rem; max-height:450px; overflow-y:auto;">
              ${packets.map((pkt, idx) => `
                <div style="background:#0f172a; color:#e2e8f0; padding:0.85rem; border-radius:8px; font-family:monospace; font-size:0.75rem; border:1px solid #334155;">
                  <div class="flex justify-between mb-1" style="color:var(--accent-cyan); font-weight:bold;">
                    <span>#${idx + 1} [${pkt.message_type}]</span>
                    <span>${pkt.sender.agent_id} ➔ ${pkt.recipient.agent_id}</span>
                  </div>
                  <pre style="white-space:pre-wrap; margin:0; color:#cbd5e1;">${JSON.stringify(pkt, null, 2)}</pre>
                </div>
              `).join("")}
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline btn-sm" onclick="window.app.closeModal()">Close Inspector</button>
          </div>
        </div>
      </div>
    `;
  }
}

window.negotiationRoom = new NegotiationRoom();

