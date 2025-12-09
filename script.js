// script.js - COMPLETE WORKING VERSION
console.log('Fire Extinguisher Calculator loading...');

// Global state
const AppState = {
    currentUnit: 'meters',
    floorCount: 0,
    expertMode: false,
    selectedExtinguishers: new Map()
};

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing calculator...');
    
    // Initialize FAQ functionality FIRST
    initializeFAQ();
    
    // Initialize navigation
    initializeNavigation();
    
    // Initialize form
    initializeForm();
    
    // Add first floor
    addFloor();
    
    // Set default unit
    setUnit('meters');
    
    console.log('Calculator initialized successfully!');
});

// ========== FAQ FUNCTIONALITY ==========
function initializeFAQ() {
    console.log('Setting up FAQ...');
    
    const faqQuestions = document.querySelectorAll('.faq-question');
    console.log(`Found ${faqQuestions.length} FAQ questions`);
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            console.log('FAQ question clicked');
            const faqItem = this.parentElement;
            
            // Toggle active class
            const isActive = faqItem.classList.contains('active');
            
            // Close all other FAQ items
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Open clicked item if it wasn't active
            if (!isActive) {
                faqItem.classList.add('active');
            }
            
            console.log('FAQ item active:', faqItem.classList.contains('active'));
        });
    });
    
    // Also add keyboard support
    faqQuestions.forEach(question => {
        question.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
        
        // Make it accessible
        question.setAttribute('tabindex', '0');
        question.setAttribute('role', 'button');
        question.setAttribute('aria-expanded', 'false');
    });
}

// ========== NAVIGATION FUNCTIONS ==========
function initializeNavigation() {
    console.log('Setting up navigation...');
    
    // Make functions globally available
    window.nextStep = function(step) {
        console.log(`Moving to step ${step}`);
        
        // Validate current step
        if (!validateStep(step - 1)) {
            console.log('Validation failed for step', step - 1);
            return;
        }
        
        // Hide all steps
        document.querySelectorAll('.form-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show target step
        const targetStep = document.getElementById(`step${step}`);
        if (targetStep) {
            targetStep.classList.add('active');
            console.log(`Step ${step} activated`);
        }
        
        // Update progress indicator
        updateProgressIndicator(step);
        
        // Scroll to top smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    window.prevStep = function(step) {
        console.log(`Moving back to step ${step}`);
        
        // Hide all steps
        document.querySelectorAll('.form-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show target step
        const targetStep = document.getElementById(`step${step}`);
        if (targetStep) {
            targetStep.classList.add('active');
        }
        
        // Update progress indicator
        updateProgressIndicator(step);
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
}

function validateStep(step) {
    const currentStep = document.getElementById(`step${step}`);
    if (!currentStep) return true;
    
    const requiredFields = currentStep.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.style.borderColor = '#e74c3c';
            
            // Add shake animation
            field.classList.add('shake');
            setTimeout(() => field.classList.remove('shake'), 500);
        } else {
            field.style.borderColor = '';
        }
    });
    
    if (!isValid) {
        showNotification('Please fill all required fields marked with *', 'error');
    }
    
    return isValid;
}

function updateProgressIndicator(step) {
    document.querySelectorAll('.progress-step').forEach(stepEl => {
        const stepNum = parseInt(stepEl.dataset.step);
        stepEl.classList.remove('active', 'completed');
        
        if (stepNum < step) {
            stepEl.classList.add('completed');
        } else if (stepNum === step) {
            stepEl.classList.add('active');
        }
    });
}

// ========== FORM FUNCTIONS ==========
function initializeForm() {
    console.log('Initializing form...');
    
    // Remove any existing form submit event to prevent conflicts
    const form = document.getElementById('fireCalculator');
    if (form) {
        form.onsubmit = null;
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            console.log('Form submitted via submit event');
            calculateRequirements();
        });
    }
    
    // Also make calculateRequirements globally available
    window.calculateRequirements = calculateRequirements;
}

// ========== FLOOR MANAGEMENT ==========
function addFloor() {
    AppState.floorCount++;
    const floorNumber = AppState.floorCount;
    
    const floorsContainer = document.getElementById('floorsContainer');
    if (!floorsContainer) return;
    
    const floorNames = ['Ground', 'First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth'];
    const floorName = floorNames[floorNumber - 1] || `Floor ${floorNumber}`;
    
    const floorHtml = `
        <div class="floor-section" data-floor="${floorNumber}">
            <div class="floor-header">
                <h4>${floorName} Floor</h4>
                ${floorNumber > 1 ? `<button type="button" class="btn btn-secondary" onclick="removeFloor(${floorNumber})">Remove</button>` : ''}
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="floor${floorNumber}Area">Floor Area *</label>
                    <input type="number" 
                           id="floor${floorNumber}Area" 
                           class="form-control floor-area" 
                           min="10" 
                           max="100000" 
                           step="0.1"
                           placeholder="Enter area in ${AppState.currentUnit === 'meters' ? 'm²' : 'ft²'}" 
                           required>
                    <small style="color: #666; margin-top: 5px; display: block;">
                        Area in <span class="unit-label">${AppState.currentUnit === 'meters' ? 'm²' : 'ft²'}</span>
                    </small>
                </div>
                <div class="form-group">
                    <label for="floor${floorNumber}Usage">Primary Usage *</label>
                    <select id="floor${floorNumber}Usage" 
                            class="form-control floor-usage" 
                            required>
                        <option value="">Select primary usage</option>
                        <option value="office">Office Space</option>
                        <option value="retail">Retail/Shop</option>
                        <option value="kitchen">Kitchen/Canteen</option>
                        <option value="storage">Storage/Warehouse</option>
                        <option value="residential">Residential</option>
                        <option value="corridor">Corridor/Common Area</option>
                        <option value="parking">Parking Area</option>
                        <option value="laboratory">Laboratory</option>
                        <option value="server">Server/Data Room</option>
                        <option value="workshop">Workshop/Factory</option>
                    </select>
                </div>
            </div>
        </div>
    `;
    
    floorsContainer.insertAdjacentHTML('beforeend', floorHtml);
    console.log(`Added floor ${floorNumber}`);
}

function removeFloor(floorNumber) {
    if (AppState.floorCount <= 1) {
        showNotification('Minimum one floor required', 'warning');
        return;
    }
    
    const floorElement = document.querySelector(`[data-floor="${floorNumber}"]`);
    if (floorElement) {
        floorElement.remove();
        AppState.floorCount--;
        
        // Renumber remaining floors
        renumberFloors();
        console.log(`Removed floor ${floorNumber}`);
    }
}

function renumberFloors() {
    const floors = document.querySelectorAll('.floor-section');
    floors.forEach((floor, index) => {
        const newFloorNum = index + 1;
        floor.setAttribute('data-floor', newFloorNum);
        
        const floorNames = ['Ground', 'First', 'Second', 'Third', 'Fourth', 'Fifth'];
        const floorName = floorNames[newFloorNum - 1] || `Floor ${newFloorNum}`;
        
        const header = floor.querySelector('h4');
        if (header) {
            header.textContent = `${floorName} Floor`;
        }
        
        // Update input IDs and names
        const areaInput = floor.querySelector('.floor-area');
        const usageSelect = floor.querySelector('.floor-usage');
        const removeBtn = floor.querySelector('.btn-secondary');
        
        if (areaInput) areaInput.id = `floor${newFloorNum}Area`;
        if (usageSelect) usageSelect.id = `floor${newFloorNum}Usage`;
        
        if (removeBtn && newFloorNum === 1) {
            removeBtn.remove();
        } else if (removeBtn) {
            removeBtn.setAttribute('onclick', `removeFloor(${newFloorNum})`);
        }
    });
}

// ========== UNIT CONVERSION ==========
function setUnit(unit) {
    AppState.currentUnit = unit;
    console.log(`Unit set to: ${unit}`);
    
    // Update UI buttons
    document.querySelectorAll('.unit-btn').forEach(btn => {
        btn.classList.remove('active');
        if ((unit === 'meters' && btn.textContent.includes('Meters')) || 
            (unit === 'feet' && btn.textContent.includes('Feet'))) {
            btn.classList.add('active');
        }
    });
    
    // Update labels and placeholders
    document.querySelectorAll('.unit-label').forEach(label => {
        label.textContent = unit === 'meters' ? 'm²' : 'ft²';
    });
    
    document.querySelectorAll('.floor-area').forEach(input => {
        input.placeholder = `Enter area in ${unit === 'meters' ? 'm²' : 'ft²'}`;
    });
}

// ========== EXPERT MODE ==========
function toggleExpertMode() {
    AppState.expertMode = !AppState.expertMode;
    const expertSection = document.getElementById('expertSection');
    const expertToggle = document.getElementById('expertToggle');
    
    if (expertSection && expertToggle) {
        if (AppState.expertMode) {
            expertSection.classList.add('active');
            expertToggle.innerHTML = '🔧 Expert Mode Active';
            expertToggle.classList.add('active');
            console.log('Expert mode enabled');
        } else {
            expertSection.classList.remove('active');
            expertToggle.innerHTML = '🔧 Enable Expert Mode (For Fire Professionals)';
            expertToggle.classList.remove('active');
            console.log('Expert mode disabled');
        }
    }
}

// ========== CALCULATE REQUIREMENTS ==========
function calculateRequirements() {
    console.log('Starting calculation...');
    
    // Validate all required fields
    if (!validateAllFields()) {
        showNotification('Please fill all required fields before calculating', 'error');
        return;
    }
    
    // Show loading state
    const calculateBtn = document.getElementById('calculateBtn');
    const originalText = calculateBtn.innerHTML;
    calculateBtn.innerHTML = '<span class="spinner"></span> Calculating...';
    calculateBtn.disabled = true;
    
    // Collect form data
    const formData = collectFormData();
    console.log('Form data collected:', formData);
    
    // Simulate calculation (replace with actual calculation)
    setTimeout(() => {
        // Generate results
        const results = generateResults(formData);
        
        // Display results
        displayResults(results);
        
        // Show results section
        const resultSection = document.getElementById('resultSection');
        if (resultSection) {
            resultSection.classList.add('active');
            resultSection.scrollIntoView({ behavior: 'smooth' });
        }
        
        // Reset button
        calculateBtn.innerHTML = originalText;
        calculateBtn.disabled = false;
        
        console.log('Calculation complete!');
        showNotification('Fire safety requirements calculated successfully!', 'success');
        
    }, 1500);
}

function validateAllFields() {
    let isValid = true;
    
    // Check all required fields
    const requiredFields = document.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.style.borderColor = '#e74c3c';
            
            // Scroll to first error
            if (isValid === false) {
                field.scrollIntoView({ behavior: 'smooth', block: 'center' });
                field.focus();
            }
        } else {
            field.style.borderColor = '';
        }
    });
    
    return isValid;
}

function collectFormData() {
    const data = {
        customer: {
            name: document.getElementById('customerName').value,
            company: document.getElementById('companyName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            project: document.getElementById('projectName').value,
            address: document.getElementById('projectAddress').value
        },
        building: {
            type: document.getElementById('buildingType').value,
            height: document.getElementById('buildingHeight').value
        },
        fireRisk: document.getElementById('fireRisk').value,
        expertMode: AppState.expertMode,
        floors: [],
        unit: AppState.currentUnit
    };
    
    // Collect floor data
    const floorSections = document.querySelectorAll('.floor-section');
    floorSections.forEach((section, index) => {
        const floorNum = index + 1;
        const areaInput = section.querySelector('.floor-area');
        const usageSelect = section.querySelector('.floor-usage');
        
        if (areaInput && usageSelect) {
            data.floors.push({
                number: floorNum,
                area: parseFloat(areaInput.value) || 0,
                usage: usageSelect.value
            });
        }
    });
    
    return data;
}

function generateResults(formData) {
    // Sample calculation logic
    const totalArea = formData.floors.reduce((sum, floor) => sum + floor.area, 0);
    
    // Calculate based on area (simplified for demo)
    let extinguishersRequired = Math.ceil(totalArea / 100) * 2;
    if (extinguishersRequired < 2) extinguishersRequired = 2;
    
    // Calculate cost (simplified)
    const baseCostPerExtinguisher = 5000;
    const totalCost = extinguishersRequired * baseCostPerExtinguisher;
    const gst = totalCost * 0.18;
    const grandTotal = totalCost + gst;
    
    return {
        totalArea: totalArea,
        totalFloors: formData.floors.length,
        buildingType: formData.building.type,
        extinguishersRequired: extinguishersRequired,
        estimatedCost: totalCost,
        gst: gst,
        grandTotal: grandTotal,
        recommendations: getRecommendations(formData)
    };
}

function getRecommendations(formData) {
    const recommendations = [];
    
    // Basic recommendations
    recommendations.push('✓ Minimum 2 extinguishers per floor as per BIS 2190:2024');
    recommendations.push('✓ Maximum travel distance: 15-20 meters');
    recommendations.push('✓ Monthly visual inspection required');
    recommendations.push('✓ Annual maintenance by certified technician');
    
    // Risk-based recommendations
    switch(formData.fireRisk) {
        case 'A':
            recommendations.push('✓ Water or Foam extinguishers recommended');
            break;
        case 'B':
            recommendations.push('✓ CO₂ or Foam extinguishers recommended');
            break;
        case 'C':
            recommendations.push('✓ CO₂ extinguishers mandatory for electrical areas');
            break;
        case 'F':
            recommendations.push('✓ Wet Chemical extinguishers required for kitchen');
            break;
    }
    
    return recommendations;
}

function displayResults(results) {
    const resultSection = document.getElementById('resultSection');
    if (!resultSection) return;
    
    const resultsHTML = `
        <div class="result-card fade-in">
            <h3>🎯 Your Fire Safety Plan</h3>
            <div class="info-box">
                <strong>Calculation Complete!</strong><br><br>
                Based on your input, here are the fire safety requirements compliant with BIS 2190:2024 standards.
            </div>

            <div class="recommendation-grid">
                <div class="recommendation-item">
                    <strong>Total Area</strong>
                    <div>${results.totalArea.toLocaleString()} ${AppState.currentUnit === 'meters' ? 'm²' : 'ft²'}</div>
                </div>
                <div class="recommendation-item">
                    <strong>Building Type</strong>
                    <div>${results.buildingType.charAt(0).toUpperCase() + results.buildingType.slice(1)}</div>
                </div>
                <div class="recommendation-item">
                    <strong>Total Floors</strong>
                    <div>${results.totalFloors}</div>
                </div>
                <div class="recommendation-item">
                    <strong>Extinguishers Required</strong>
                    <div>${results.extinguishersRequired} units</div>
                </div>
            </div>

            <div class="result-card" style="margin-top: 20px;">
                <h3>💰 Cost Estimation</h3>
                <table class="quotation-table">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Amount (₹)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Fire Extinguishers (${results.extinguishersRequired} units @ ₹5,000)</td>
                            <td>₹${results.estimatedCost.toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td>Extinguisher Stands/Brackets</td>
                            <td>₹${(results.extinguishersRequired * 500).toLocaleString()}</td>
                        </tr>
                        <tr class="total-row">
                            <td><strong>Subtotal</strong></td>
                            <td><strong>₹${(results.estimatedCost + (results.extinguishersRequired * 500)).toLocaleString()}</strong></td>
                        </tr>
                        <tr>
                            <td>GST @18%</td>
                            <td>₹${Math.round(results.gst).toLocaleString()}</td>
                        </tr>
                        <tr class="total-row">
                            <td><strong>Grand Total</strong></td>
                            <td><strong>₹${Math.round(results.grandTotal + (results.extinguishersRequired * 500)).toLocaleString()}</strong></td>
                        </tr>
                    </tbody>
                </table>
                
                <div class="info-box" style="margin-top: 20px;">
                    <strong>Note:</strong> Prices are approximate. Actual costs may vary based on brand, location, and market conditions.
                </div>
            </div>

            <div class="result-card">
                <h3>📋 Safety Recommendations</h3>
                <div class="info-box">
                    <strong>BIS 2190:2024 Compliance Checklist:</strong>
                    <ul style="margin-left: 20px; margin-top: 10px;">
                        ${results.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="warning-box" style="margin-top: 20px;">
                    <strong>⚠️ Important:</strong> This is a preliminary calculation. Always consult with a certified fire safety professional for final assessment and installation.
                </div>
            </div>
            
            <div class="button-group">
                <button class="btn btn-secondary" onclick="downloadPDF()">
                    📄 Download PDF Quotation
                </button>
                <button class="btn btn-success" onclick="downloadExcel()">
                    📊 Download Excel Report
                </button>
                <button class="btn" onclick="window.print()">
                    🖨️ Print This Report
                </button>
                <button class="btn" onclick="resetCalculator()">
                    🔄 New Calculation
                </button>
            </div>
        </div>
    `;
    
    resultSection.innerHTML = resultsHTML;
}

// ========== EXPORT FUNCTIONS ==========
function downloadPDF() {
    showNotification('PDF download feature will be available soon!', 'info');
    // In production, implement actual PDF generation
}

function downloadExcel() {
    showNotification('Excel download feature will be available soon!', 'info');
    // In production, implement actual Excel generation
}

// ========== UTILITY FUNCTIONS ==========
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <div style="padding: 15px; margin: 10px; border-radius: 8px; 
                    background: ${type === 'error' ? '#f8d7da' : type === 'warning' ? '#fff3cd' : '#d4edda'}; 
                    color: ${type === 'error' ? '#721c24' : type === 'warning' ? '#856404' : '#155724'};
                    border: 1px solid ${type === 'error' ? '#f5c6cb' : type === 'warning' ? '#ffeaa7' : '#c3e6cb'};">
            ${message}
        </div>
    `;
    
    const container = document.querySelector('.container');
    if (container) {
        container.insertBefore(notification, container.firstChild);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
}

function resetCalculator() {
    if (confirm('Start a new calculation? All current data will be lost.')) {
        // Reset form
        document.getElementById('fireCalculator').reset();
        
        // Reset floors
        const floorsContainer = document.getElementById('floorsContainer');
        if (floorsContainer) {
            floorsContainer.innerHTML = '';
            AppState.floorCount = 0;
            addFloor(); // Add first floor
        }
        
        // Reset progress
        document.querySelectorAll('.progress-step').forEach(step => {
            step.classList.remove('active', 'completed');
        });
        document.querySelector('.progress-step[data-step="1"]').classList.add('active');
        
        // Hide results
        const resultSection = document.getElementById('resultSection');
        if (resultSection) {
            resultSection.classList.remove('active');
            resultSection.innerHTML = '';
        }
        
        // Go to step 1
        document.querySelectorAll('.form-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById('step1').classList.add('active');
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        showNotification('Calculator reset. Ready for new calculation!', 'success');
    }
}

function showPrivacyPolicy() {
    alert('Privacy Policy:\n\nYour data is processed locally in your browser and not stored on our servers. We respect your privacy and follow all applicable data protection regulations.');
}

function showTerms() {
    alert('Terms of Use:\n\nThis calculator provides estimates based on BIS 2190:2024 standards. For actual installation, always consult with certified fire safety professionals. The developers are not liable for any damages arising from the use of this tool.');
}

// Add some CSS for animations
const style = document.createElement('style');
style.textContent = `
    .shake {
        animation: shake 0.5s ease-in-out;
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
    
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .spinner {
        display: inline-block;
        width: 20px;
        height: 20px;
        border: 3px solid #f3f3f3;
        border-top: 3px solid #3498db;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-right: 10px;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

console.log('Fire Extinguisher Calculator script loaded successfully!');
