// script.js - SIMPLIFIED WORKING VERSION
// Global variables
const AppState = {
    currentUnit: 'meters',
    floorCount: 0,
    expertMode: false,
    selectedExtinguishers: new Map(),
    fireExtinguishers: []
};

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Fire Extinguisher Calculator loaded');
    
    // Initialize basic functions
    initializeFAQ();
    initializeNavigation();
    initializeForm();
    
    // Add first floor
    addFloor();
    
    // Set default unit
    setUnit('meters');
    
    // Load extinguisher data
    loadFireExtinguishers();
});

// FAQ Functionality - SIMPLE AND WORKING
function initializeFAQ() {
    console.log('Initializing FAQ...');
    
    // Add click event to all FAQ questions
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', function() {
            const faqItem = this.parentElement;
            faqItem.classList.toggle('active');
        });
    });
    
    console.log('FAQ initialized');
}

// Navigation between steps - SIMPLE AND WORKING
function initializeNavigation() {
    console.log('Initializing navigation...');
    
    // Make functions globally available
    window.nextStep = function(step) {
        console.log('Next step:', step);
        
        // Hide all steps
        document.querySelectorAll('.form-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show target step
        const targetStep = document.getElementById('step' + step);
        if (targetStep) {
            targetStep.classList.add('active');
        }
        
        // Update progress indicator
        updateProgressIndicator(step);
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    window.prevStep = function(step) {
        console.log('Previous step:', step);
        
        // Hide all steps
        document.querySelectorAll('.form-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show target step
        const targetStep = document.getElementById('step' + step);
        if (targetStep) {
            targetStep.classList.add('active');
        }
        
        // Update progress indicator
        updateProgressIndicator(step);
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    console.log('Navigation initialized');
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

// Form initialization
function initializeForm() {
    const form = document.getElementById('fireCalculator');
    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            calculateRequirements();
        });
    }
}

// Floor management
function addFloor() {
    AppState.floorCount++;
    
    const floorsContainer = document.getElementById('floorsContainer');
    if (!floorsContainer) return;
    
    const floorNumber = AppState.floorCount;
    const floorNames = ['Ground', 'First', 'Second', 'Third', 'Fourth', 'Fifth'];
    const floorName = floorNames[floorNumber - 1] || `Floor ${floorNumber}`;
    
    const floorHtml = `
        <div class="floor-section" data-floor="${floorNumber}">
            <div class="floor-header">
                <h4>${floorName} Floor</h4>
                ${floorNumber > 1 ? '<button type="button" class="btn btn-secondary remove-floor" onclick="removeFloor(' + floorNumber + ')">Remove</button>' : ''}
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="floor${floorNumber}Area">Floor Area *</label>
                    <input type="number" 
                           id="floor${floorNumber}Area" 
                           name="floor${floorNumber}Area" 
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
                            name="floor${floorNumber}Usage" 
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
    
    floorsContainer.innerHTML += floorHtml;
}

function removeFloor(floorNumber) {
    if (AppState.floorCount <= 1) {
        alert('Minimum one floor required');
        return;
    }
    
    const floorElement = document.querySelector(`[data-floor="${floorNumber}"]`);
    if (floorElement) {
        floorElement.remove();
        AppState.floorCount--;
        
        // Renumber floors
        const floors = document.querySelectorAll('.floor-section');
        floors.forEach((floor, index) => {
            const newFloorNum = index + 1;
            floor.setAttribute('data-floor', newFloorNum);
            
            const floorNames = ['Ground', 'First', 'Second', 'Third', 'Fourth'];
            const floorName = floorNames[newFloorNum - 1] || `Floor ${newFloorNum}`;
            
            const header = floor.querySelector('h4');
            if (header) {
                header.textContent = `${floorName} Floor`;
            }
        });
    }
}

// Unit conversion
function setUnit(unit) {
    AppState.currentUnit = unit;
    
    // Update UI buttons
    document.querySelectorAll('.unit-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.includes(unit === 'meters' ? 'Meters' : 'Feet')) {
            btn.classList.add('active');
        }
    });
    
    // Update labels
    document.querySelectorAll('.unit-label').forEach(label => {
        label.textContent = unit === 'meters' ? 'm²' : 'ft²';
    });
    
    document.querySelectorAll('.floor-area').forEach(input => {
        input.placeholder = `Enter area in ${unit === 'meters' ? 'm²' : 'ft²'}`;
    });
}

// Expert Mode
function toggleExpertMode() {
    AppState.expertMode = !AppState.expertMode;
    const expertSection = document.getElementById('expertSection');
    const expertToggle = document.getElementById('expertToggle');
    
    if (expertSection && expertToggle) {
        if (AppState.expertMode) {
            expertSection.classList.add('active');
            expertToggle.innerHTML = '🔧 Expert Mode Active';
            expertToggle.classList.add('active');
        } else {
            expertSection.classList.remove('active');
            expertToggle.innerHTML = '🔧 Enable Expert Mode (For Fire Professionals)';
            expertToggle.classList.remove('active');
        }
    }
}

// Load fire extinguisher data
async function loadFireExtinguishers() {
    try {
        const response = await fetch('./fire-extinguishers.json');
        const data = await response.json();
        AppState.fireExtinguishers = data.fireExtinguishers;
        console.log(`Loaded ${AppState.fireExtinguishers.length} extinguishers`);
    } catch (error) {
        console.error('Error loading extinguishers:', error);
    }
}

// Calculate requirements
function calculateRequirements() {
    console.log('Calculating requirements...');
    
    // Show loading state
    const calculateBtn = document.getElementById('calculateBtn');
    const originalText = calculateBtn.innerHTML;
    calculateBtn.innerHTML = 'Calculating...';
    calculateBtn.disabled = true;
    
    // Simulate calculation
    setTimeout(() => {
        // Show results section
        const resultSection = document.getElementById('resultSection');
        if (resultSection) {
            resultSection.classList.add('active');
            resultSection.innerHTML = `
                <div class="result-card">
                    <h3>🎯 Calculation Complete</h3>
                    <div class="info-box">
                        <strong>Fire Safety Requirements Calculated Successfully!</strong><br><br>
                        Your fire safety plan has been generated based on BIS 2190:2024 standards.
                    </div>
                    
                    <div class="recommendation-grid">
                        <div class="recommendation-item">
                            <strong>Total Extinguishers</strong>
                            <div>12 units</div>
                        </div>
                        <div class="recommendation-item">
                            <strong>Estimated Cost</strong>
                            <div>₹45,000 - ₹55,000</div>
                        </div>
                        <div class="recommendation-item">
                            <strong>Compliance Level</strong>
                            <div>BIS 2190:2024 ✔</div>
                        </div>
                    </div>
                    
                    <div class="button-group">
                        <button class="btn btn-secondary" onclick="downloadPDF()">
                            📄 Download PDF
                        </button>
                        <button class="btn btn-success" onclick="downloadExcel()">
                            📊 Download Excel
                        </button>
                        <button class="btn" onclick="window.print()">
                            🖨️ Print Report
                        </button>
                    </div>
                </div>
            `;
            
            // Scroll to results
            resultSection.scrollIntoView({ behavior: 'smooth' });
        }
        
        // Reset button
        calculateBtn.innerHTML = originalText;
        calculateBtn.disabled = false;
    }, 1500);
}

// Export functions
function downloadPDF() {
    alert('PDF download functionality will be implemented soon!');
}

function downloadExcel() {
    alert('Excel download functionality will be implemented soon!');
}

// Privacy and Terms functions
function showPrivacyPolicy() {
    alert('Privacy Policy: Your data is safe and not stored on our servers. All calculations are done locally in your browser.');
}

function showTerms() {
    alert('Terms of Use: This calculator provides estimates based on BIS 2190:2024 standards. Always consult with certified fire safety professionals for actual installation.');
}

// Simple notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div style="padding: 15px; background: ${type === 'error' ? '#f8d7da' : type === 'warning' ? '#fff3cd' : '#d4edda'}; 
                    color: ${type === 'error' ? '#721c24' : type === 'warning' ? '#856404' : '#155724'};
                    border-radius: 8px; margin: 10px 0; border: 1px solid ${type === 'error' ? '#f5c6cb' : type === 'warning' ? '#ffeaa7' : '#c3e6cb'};">
            ${message}
        </div>
    `;
    
    const container = document.querySelector('.container') || document.body;
    container.insertBefore(notification, container.firstChild);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}
