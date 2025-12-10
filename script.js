// script.js - ACCURATE BIS 2190:2024 CALCULATOR
console.log('Fire Extinguisher Calculator loading...');

// Global state
const AppState = {
    currentUnit: 'meters',
    floorCount: 0,
    expertMode: false,
    selectedExtinguishers: new Map()
};

// BIS 2190:2024 STANDARDS DATA
const BISStandards = {
    // Minimum extinguisher ratings based on hazard level
    hazardLevels: {
        low: { rating: '5A', coverage: 300, distance: 20 },      // Offices, Residential
        moderate: { rating: '10A', coverage: 150, distance: 20 }, // Retail, Hotels
        high: { rating: '20A', coverage: 100, distance: 15 }      // Industrial, Storage
    },
    
    // Fire class to extinguisher type mapping
    fireClassExtinguishers: {
        'A': ['Water', 'Foam', 'ABC Powder'],
        'B': ['CO₂', 'Foam', 'ABC Powder', 'Clean Agent'],
        'C': ['CO₂', 'Clean Agent', 'ABC Powder'],
        'D': ['Special Powder (Class D)', 'Sand', 'Dry Powder'],
        'F': ['Wet Chemical', 'Class F Foam'],
        'E': ['AVD (Aerosol)', 'Clean Agent', 'CO₂'],
        'mixed': ['ABC Powder', 'Multi-purpose']
    },
    
    // Standard extinguisher capacities and costs (₹)
    extinguisherTypes: {
        'ABC Powder': [
            { capacity: '1 KG', rating: '5A:34B', cost: 2500, coverage: 100 },
            { capacity: '2 KG', rating: '10A:68B', cost: 3200, coverage: 200 },
            { capacity: '4 KG', rating: '20A:144B', cost: 4500, coverage: 300 },
            { capacity: '6 KG', rating: '27A:233B', cost: 5500, coverage: 400 },
            { capacity: '9 KG', rating: '43A:366B', cost: 7000, coverage: 600 }
        ],
        'CO₂': [
            { capacity: '2 KG', rating: '5B', cost: 8500, coverage: 50 },
            { capacity: '4.5 KG', rating: '22B', cost: 12000, coverage: 100 },
            { capacity: '6.8 KG', rating: '34B', cost: 15000, coverage: 150 }
        ],
        'Foam': [
            { capacity: '6 L', rating: '13A:89B', cost: 6000, coverage: 200 },
            { capacity: '9 L', rating: '21A:144B', cost: 7500, coverage: 300 }
        ],
        'Water': [
            { capacity: '9 L', rating: '13A', cost: 4500, coverage: 150 }
        ],
        'Wet Chemical': [
            { capacity: '6 L', rating: '25F', cost: 18000, coverage: 100 }
        ],
        'AVD': [
            { capacity: '1 L', rating: 'E-Class', cost: 20000, coverage: 50 }
        ]
    }
};

// Hazard mapping for different usages
const usageHazardMapping = {
    'office': 'low',
    'residential': 'low',
    'corridor': 'low',
    'retail': 'moderate',
    'hotel': 'moderate',
    'parking': 'moderate',
    'kitchen': 'high',
    'storage': 'high',
    'laboratory': 'high',
    'server': 'high',
    'workshop': 'high',
    'factory': 'high'
};

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing BIS 2190:2024 calculator...');
    
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
    
    console.log('BIS 2190:2024 Calculator initialized successfully!');
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
                        <option value="residential">Residential</option>
                        <option value="retail">Retail/Shop</option>
                        <option value="hotel">Hotel/Restaurant</option>
                        <option value="kitchen">Kitchen/Canteen</option>
                        <option value="storage">Storage/Warehouse</option>
                        <option value="parking">Parking Area</option>
                        <option value="corridor">Corridor/Common Area</option>
                        <option value="laboratory">Laboratory</option>
                        <option value="server">Server/Data Room</option>
                        <option value="workshop">Workshop</option>
                        <option value="factory">Factory/Manufacturing</option>
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

function convertToMeters(area, unit) {
    if (unit === 'meters') return area;
    if (unit === 'feet') return area * 0.0929; // Convert sq ft to sq m
    return area;
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

// ========== CALCULATE REQUIREMENTS (ACCURATE BIS 2190:2024) ==========
function calculateRequirements() {
    console.log('Starting BIS 2190:2024 calculation...');
    
    // Validate all required fields
    if (!validateAllFields()) {
        showNotification('Please fill all required fields before calculating', 'error');
        return;
    }
    
    // Show loading state
    const calculateBtn = document.getElementById('calculateBtn');
    const originalText = calculateBtn.innerHTML;
    calculateBtn.innerHTML = '<span class="spinner"></span> Calculating as per BIS 2190:2024...';
    calculateBtn.disabled = true;
    
    // Collect form data
    const formData = collectFormData();
    console.log('Form data collected:', formData);
    
    // Calculate based on BIS standards
    setTimeout(() => {
        try {
            // Generate accurate results
            const results = calculateBISRequirements(formData);
            
            // Display detailed results
            displayDetailedResults(results, formData);
            
            // Show results section
            const resultSection = document.getElementById('resultSection');
            if (resultSection) {
                resultSection.classList.add('active');
                resultSection.scrollIntoView({ behavior: 'smooth' });
            }
            
            console.log('BIS 2190:2024 Calculation complete!', results);
            showNotification('Fire safety requirements calculated as per BIS 2190:2024!', 'success');
            
        } catch (error) {
            console.error('Calculation error:', error);
            showNotification('Error in calculation. Please check your inputs.', 'error');
        } finally {
            // Reset button
            calculateBtn.innerHTML = originalText;
            calculateBtn.disabled = false;
        }
    }, 1000);
}

function validateAllFields() {
    let isValid = true;
    let firstError = null;
    
    // Check all required fields
    const requiredFields = document.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.style.borderColor = '#e74c3c';
            
            // Track first error for scrolling
            if (!firstError) {
                firstError = field;
            }
        } else {
            field.style.borderColor = '';
        }
    });
    
    // Check floor areas
    const floorAreas = document.querySelectorAll('.floor-area');
    floorAreas.forEach(areaInput => {
        const area = parseFloat(areaInput.value);
        if (isNaN(area) || area <= 0) {
            isValid = false;
            areaInput.style.borderColor = '#e74c3c';
            if (!firstError) firstError = areaInput;
        }
    });
    
    if (!isValid && firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstError.focus();
    }
    
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
            const area = parseFloat(areaInput.value) || 0;
            const usage = usageSelect.value;
            const hazard = usageHazardMapping[usage] || 'moderate';
            
            data.floors.push({
                number: floorNum,
                area: area,
                areaMeters: convertToMeters(area, AppState.currentUnit),
                usage: usage,
                hazard: hazard
            });
        }
    });
    
    return data;
}

function calculateBISRequirements(formData) {
    const results = {
        buildingType: formData.building.type,
        fireRisk: formData.fireRisk,
        totalFloors: formData.floors.length,
        floors: [],
        totalExtinguishers: 0,
        totalArea: 0,
        recommendations: [],
        extinguisherType: '',
        selectedCapacity: '',
        perUnitCost: 0,
        standCost: 0,
        subtotal: 0,
        gst: 0,
        grandTotal: 0
    };
    
    // Calculate total area
    results.totalArea = formData.floors.reduce((sum, floor) => sum + floor.areaMeters, 0);
    
    // Determine extinguisher type based on fire risk
    const extinguisherType = determineExtinguisherType(formData.fireRisk);
    results.extinguisherType = extinguisherType;
    
    // Get available capacities for this extinguisher type
    const capacities = BISStandards.extinguisherTypes[extinguisherType];
    if (!capacities) {
        throw new Error(`No capacities defined for extinguisher type: ${extinguisherType}`);
    }
    
    // Calculate for each floor
    formData.floors.forEach(floor => {
        const floorResult = calculateFloorRequirements(floor, extinguisherType, capacities);
        results.floors.push(floorResult);
        results.totalExtinguishers += floorResult.extinguishersRequired;
    });
    
    // Select appropriate capacity based on total area and hazard
    const selectedCapacity = selectOptimalCapacity(results.totalArea, extinguisherType, formData.floors[0]?.hazard);
    results.selectedCapacity = selectedCapacity;
    
    // Get cost for selected capacity
    const capacityData = capacities.find(cap => cap.capacity === selectedCapacity);
    if (capacityData) {
        results.perUnitCost = capacityData.cost;
    } else {
        // Default to first capacity if not found
        results.perUnitCost = capacities[0].cost;
        results.selectedCapacity = capacities[0].capacity;
    }
    
    // Calculate costs
    results.standCost = results.totalExtinguishers * 500; // ₹500 per stand
    results.subtotal = (results.totalExtinguishers * results.perUnitCost) + results.standCost;
    results.gst = results.subtotal * 0.18;
    results.grandTotal = results.subtotal + results.gst;
    
    // Generate recommendations
    results.recommendations = generateBISRecommendations(formData, results);
    
    return results;
}

function determineExtinguisherType(fireRisk) {
    switch(fireRisk) {
        case 'A':
            return 'Water';  // Best for Class A fires
        case 'B':
            return 'CO₂';    // Best for Class B fires
        case 'C':
            return 'CO₂';    // Must for electrical fires
        case 'F':
            return 'Wet Chemical';  // Must for kitchen fires
        case 'E':
            return 'AVD';    // For lithium battery fires
        case 'mixed':
        default:
            return 'ABC Powder';  // Multi-purpose for general use
    }
}

function calculateFloorRequirements(floor, extinguisherType, capacities) {
    const floorResult = {
        floorNumber: floor.number,
        floorName: getFloorName(floor.number),
        area: floor.area,
        areaMeters: floor.areaMeters,
        usage: floor.usage,
        hazard: floor.hazard,
        extinguishersRequired: 0,
        extinguisherType: extinguisherType,
        recommendedCapacity: '',
        spacing: '',
        notes: []
    };
    
    // Get hazard level data
    const hazardData = BISStandards.hazardLevels[floor.hazard] || BISStandards.hazardLevels.moderate;
    
    // Calculate based on area coverage (BIS standard)
    // Each extinguisher covers certain area based on its rating
    const coveragePerExtinguisher = hazardData.coverage; // m² per extinguisher
    
    // Minimum calculation: Area ÷ Coverage per extinguisher
    let numExtinguishers = Math.ceil(floor.areaMeters / coveragePerExtinguisher);
    
    // BIS Minimum requirement: At least 2 extinguishers per floor if area ≥ 100m²
    if (floor.areaMeters >= 100 && numExtinguishers < 2) {
        numExtinguishers = 2;
    }
    
    // Additional requirement: Travel distance
    // Based on 15-20m maximum travel distance
    const maxTravelDistance = hazardData.distance;
    const areaPerExtinguisherForDistance = Math.PI * Math.pow(maxTravelDistance, 2);
    const byDistance = Math.ceil(floor.areaMeters / areaPerExtinguisherForDistance);
    
    // Take the higher requirement
    numExtinguishers = Math.max(numExtinguishers, byDistance);
    
    floorResult.extinguishersRequired = numExtinguishers;
    
    // Select capacity based on area
    if (floor.areaMeters < 200) {
        floorResult.recommendedCapacity = '1 KG';
    } else if (floor.areaMeters < 500) {
        floorResult.recommendedCapacity = '2 KG';
    } else if (floor.areaMeters < 1000) {
        floorResult.recommendedCapacity = '4 KG';
    } else {
        floorResult.recommendedCapacity = '6 KG';
    }
    
    // Special cases
    if (floor.usage === 'kitchen') {
        floorResult.extinguisherType = 'Wet Chemical';
        floorResult.recommendedCapacity = '6 L';
        floorResult.notes.push('Special Wet Chemical extinguisher required for kitchen fires');
    } else if (floor.usage === 'server') {
        floorResult.extinguisherType = 'CO₂';
        floorResult.notes.push('CO₂ extinguisher required for electrical/data rooms');
    }
    
    floorResult.spacing = `Max ${maxTravelDistance}m travel distance`;
    
    return floorResult;
}

function selectOptimalCapacity(totalArea, extinguisherType, hazardLevel) {
    const capacities = BISStandards.extinguisherTypes[extinguisherType];
    if (!capacities) return '4 KG';
    
    // Select capacity based on total area
    if (totalArea < 300) return capacities[0].capacity; // Small
    if (totalArea < 1000) return capacities[1]?.capacity || capacities[0].capacity; // Medium
    if (totalArea < 3000) return capacities[2]?.capacity || capacities[1]?.capacity || capacities[0].capacity; // Large
    
    return capacities[capacities.length - 1].capacity; // Extra large
}

function generateBISRecommendations(formData, results) {
    const recommendations = [];
    
    // Basic BIS requirements
    recommendations.push('✓ As per BIS 2190:2024 Standards');
    recommendations.push(`✓ Minimum 2 extinguishers per floor (if area ≥ 100m²)`);
    recommendations.push(`✓ Maximum travel distance: 15-20 meters`);
    recommendations.push(`✓ Extinguishers must be clearly visible and accessible`);
    recommendations.push(`✓ Height: 1.5m max from floor level`);
    
    // Risk-specific recommendations
    switch(formData.fireRisk) {
        case 'A':
            recommendations.push('✓ Water type recommended for wood/paper/textile fires');
            break;
        case 'B':
            recommendations.push('✓ CO₂ recommended for flammable liquid fires');
            recommendations.push('✓ Avoid water on flammable liquids');
            break;
        case 'C':
            recommendations.push('✓ CO₂ mandatory for electrical equipment');
            recommendations.push('✓ Ensure proper ventilation when using CO₂');
            break;
        case 'F':
            recommendations.push('✓ Wet Chemical mandatory for kitchen/cooking oil fires');
            recommendations.push('✓ Install near cooking appliances');
            break;
    }
    
    // Building type specific
    if (formData.building.height === 'high' || formData.building.height === 'skyscraper') {
        recommendations.push('✓ Required on every floor including basements');
        recommendations.push('✓ Staircase and elevator lobby locations critical');
    }
    
    // Maintenance
    recommendations.push('✓ Monthly visual inspection required');
    recommendations.push('✓ Annual maintenance by certified technician');
    recommendations.push('✓ Record keeping mandatory as per BIS');
    
    return recommendations;
}

function displayDetailedResults(results, formData) {
    const resultSection = document.getElementById('resultSection');
    if (!resultSection) return;
    
    const totalAreaDisplay = results.totalArea.toFixed(0);
    const unitLabel = AppState.currentUnit === 'meters' ? 'm²' : 'ft²';
    
    const resultsHTML = `
        <div class="result-card fade-in">
            <h3>🎯 BIS 2190:2024 Fire Safety Plan</h3>
            <div class="info-box">
                <strong>Client:</strong> ${formData.customer.name}<br>
                <strong>Project:</strong> ${formData.customer.project}<br>
                <strong>Total Area:</strong> ${totalAreaDisplay} ${unitLabel} | 
                <strong>Floors:</strong> ${results.totalFloors} | 
                <strong>Building:</strong> ${formData.building.type.charAt(0).toUpperCase() + formData.building.type.slice(1)}
            </div>

            <div class="recommendation-grid">
                <div class="recommendation-item">
                    <strong>Extinguisher Type</strong>
                    <div>${results.extinguisherType}</div>
                </div>
                <div class="recommendation-item">
                    <strong>Recommended Capacity</strong>
                    <div>${results.selectedCapacity}</div>
                </div>
                <div class="recommendation-item">
                    <strong>Total Units Required</strong>
                    <div>${results.totalExtinguishers}</div>
                </div>
                <div class="recommendation-item">
                    <strong>Primary Fire Risk</strong>
                    <div>Class ${formData.fireRisk}</div>
                </div>
            </div>
        </div>

        <div class="result-card">
            <h3>🏗️ Floor-wise Requirements</h3>
            ${results.floors.map(floor => `
                <div class="floor-section" style="margin: 15px 0; background: #f8f9fa; padding: 20px; border-radius: 8px;">
                    <h4>${floor.floorName} Floor - ${floor.usage.charAt(0).toUpperCase() + floor.usage.slice(1)}</h4>
                    <div class="info-box" style="margin: 10px 0;">
                        <strong>Specifications:</strong><br>
                        • Area: ${floor.area.toLocaleString()} ${unitLabel} (${floor.areaMeters.toFixed(0)} m²)<br>
                        • Hazard Level: ${floor.hazard.toUpperCase()}<br>
                        • Extinguishers Required: ${floor.extinguishersRequired} × ${floor.extinguisherType}<br>
                        • Recommended: ${floor.recommendedCapacity} capacity<br>
                        • Placement: ${floor.spacing}<br>
                        ${floor.notes.map(note => `• ${note}<br>`).join('')}
                    </div>
                </div>
            `).join('')}
        </div>

        <div class="result-card">
            <h3>💰 Detailed Quotation</h3>
            
            <div class="info-box">
                <strong>Price Breakdown (Approximate Market Rates):</strong>
            </div>
            
            <table class="quotation-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Specifications</th>
                        <th>Unit Price (₹)</th>
                        <th>Quantity</th>
                        <th>Amount (₹)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${results.extinguisherType} Fire Extinguisher</td>
                        <td>${results.selectedCapacity} | BIS Certified</td>
                        <td>₹${results.perUnitCost.toLocaleString()}</td>
                        <td>${results.totalExtinguishers}</td>
                        <td>₹${(results.totalExtinguishers * results.perUnitCost).toLocaleString()}</td>
                    </tr>
                    <tr>
                        <td>Wall Mount Stand/Bracket</td>
                        <td>Powder coated, wall mounted</td>
                        <td>₹500</td>
                        <td>${results.totalExtinguishers}</td>
                        <td>₹${results.standCost.toLocaleString()}</td>
                    </tr>
                    <tr>
                        <td>Basic Installation</td>
                        <td>Mounting and positioning</td>
                        <td>₹200</td>
                        <td>${results.totalExtinguishers}</td>
                        <td>₹${(results.totalExtinguishers * 200).toLocaleString()}</td>
                    </tr>
                    <tr class="total-row">
                        <td colspan="4" style="text-align: right;"><strong>Subtotal (excluding GST)</strong></td>
                        <td><strong>₹${Math.round(results.subtotal + (results.totalExtinguishers * 200)).toLocaleString()}</strong></td>
                    </tr>
                    <tr>
                        <td colspan="4" style="text-align: right;">GST @18%</td>
                        <td>₹${Math.round((results.subtotal + (results.totalExtinguishers * 200)) * 0.18).toLocaleString()}</td>
                    </tr>
                    <tr class="total-row">
                        <td colspan="4" style="text-align: right;"><strong>Grand Total (Approx.)</strong></td>
                        <td><strong>₹${Math.round((results.subtotal + (results.totalExtinguishers * 200)) * 1.18).toLocaleString()}</strong></td>
                    </tr>
                </tbody>
            </table>
            
            <div class="info-box" style="margin-top: 20px;">
                <strong>💡 Notes:</strong>
                <ul style="margin-left: 20px; margin-top: 10px;">
                    <li>Prices are approximate and may vary ±15% based on brand and location</li>
                    <li>Annual Maintenance Contract: ₹300-500 per extinguisher</li>
                    <li>Hydrostatic testing required every 5 years: ₹800-1200 per unit</li>
                    <li>Training for staff: ₹2000-5000 per session</li>
                    <li>All equipment must be BIS 2190:2024 certified</li>
                </ul>
            </div>
        </div>

        <div class="result-card">
            <h3>📋 BIS 2190:2024 Compliance Checklist</h3>
            <div class="info-box">
                <strong>Mandatory Requirements:</strong>
                <ul style="margin-left: 20px; margin-top: 10px;">
                    ${results.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>
            
            <div class="warning-box" style="margin-top: 20px;">
                <strong>⚠️ Professional Advice Required:</strong><br>
                This calculator provides estimates based on BIS standards. For actual installation, consult with:
                <ul style="margin-left: 20px; margin-top: 10px;">
                    <li>Certified Fire Safety Consultant</li>
                    <li>Licensed Fire Extinguisher Supplier</li>
                    <li>Local Fire Department for approvals</li>
                    <li>Insurance company for compliance</li>
                </ul>
            </div>
        </div>
        
        <div class="button-group">
            <button class="btn btn-secondary" onclick="downloadPDF()">
                📄 Download Detailed Quotation
            </button>
            <button class="btn btn-success" onclick="downloadExcel()">
                📊 Download Floor-wise Report
            </button>
            <button class="btn" onclick="window.print()">
                🖨️ Print Complete Report
            </button>
            <button class="btn" onclick="resetCalculator()">
                🔄 Start New Calculation
            </button>
        </div>
    `;
    
    resultSection.innerHTML = resultsHTML;
}

// ========== HELPER FUNCTIONS ==========
function getFloorName(number) {
    const names = ['Ground', 'First', 'Second', 'Third', 'Fourth', 'Fifth', 
                  'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth'];
    return names[number - 1] || `Floor ${number}`;
}

// ========== EXPORT FUNCTIONS ==========
function downloadPDF() {
    showNotification('PDF generation feature coming soon!', 'info');
    // Implement actual PDF generation here
}

function downloadExcel() {
    showNotification('Excel export feature coming soon!', 'info');
    // Implement actual Excel generation here
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
        
        // Reset unit
        setUnit('meters');
        
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

console.log('BIS 2190:2024 Fire Extinguisher Calculator loaded successfully!');
