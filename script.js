// script.js
// Global variables and application state
const AppState = {
    currentUnit: 'meters',
    floorCount: 1,
    expertMode: false,
    currentCalculation: null,
    selectedExtinguishers: new Map(),
    fireExtinguishers: [],
    floors: [],
    filters: {
        type: '',
        agent: '',
        capacity: ''
    }
};

// BIS Standards Data
const BISStandards = {
    low: { rating: '2A', distance: 20, area: 300, coverage: 300 },
    moderate: { rating: '3A', distance: 20, area: 150, coverage: 150 },
    high: { rating: '4A', distance: 15, area: 100, coverage: 100 }
};

// Hazard classification based on usage
const usageHazards = {
    'office': 'low',
    'retail': 'moderate',
    'kitchen': 'high',
    'storage': 'high',
    'residential': 'low',
    'corridor': 'low',
    'parking': 'moderate',
    'laboratory': 'high',
    'server': 'high',
    'workshop': 'high'
};

// Price list data for quick reference
const quickPriceList = {
    'ABC_4KG': { desc: 'ABC Dry Powder (MAP-90%)', capacity: '4kg', rating: '4A:144B', price: 5034 },
    'ABC_9KG': { desc: 'ABC Dry Powder (MAP-90%)', capacity: '9kg', rating: '6A:233B', price: 7817 },
    'CO2_4.5KG': { desc: 'CO2 Extinguisher', capacity: '4.5kg', rating: '55B', price: 11667 },
    'FOAM_9L': { desc: 'Mechanical Foam', capacity: '9L', rating: '4A:144B', price: 5117 },
    'WATER_9L': { desc: 'Water Type', capacity: '9L', rating: '3A', price: 5017 },
    'WET_CHEM_6L': { desc: 'Wet Chemical (F-Class)', capacity: '6L', rating: '25F', price: 26332 }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadFireExtinguishers();
    initializeForm();
    setupEventListeners();
    initializeGoogleTranslate();
});

// Load fire extinguisher data from JSON
async function loadFireExtinguishers() {
    try {
        const response = await fetch('fire-extinguishers.json');
        const data = await response.json();
        AppState.fireExtinguishers = data.fireExtinguishers;
        console.log(`Loaded ${AppState.fireExtinguishers.length} fire extinguishers`);
        
        // Initialize first floor
        addFloor();
        
        // Set default unit
        setUnit('meters');
        
    } catch (error) {
        console.error('Error loading fire extinguishers:', error);
        // Fallback to embedded data if JSON fails to load
        AppState.fireExtinguishers = [
            // Minimal fallback data
            {id: 1, name: 'ABC / DCP', type: 'PORTABLE', body: 'MILD STEEL', operating: 'STORE PRESSURE', agent: 'POWDER', agentName: 'MAP 90%', capacity: '4 KG', cost: 5433, fireClass: 'ABC'},
            {id: 2, name: 'ABC / DCP', type: 'PORTABLE', body: 'MILD STEEL', operating: 'STORE PRESSURE', agent: 'POWDER', agentName: 'MAP 90%', capacity: '9 KG', cost: 7917, fireClass: 'ABC'},
            {id: 3, name: 'CO2', type: 'PORTABLE', body: 'MILD STEEL', operating: 'STORE PRESSURE', agent: 'GAS', agentName: 'CO2', capacity: '4.5 KG', cost: 11750, fireClass: 'BC'},
            {id: 4, name: 'FOAM', type: 'PORTABLE', body: 'MILD STEEL', operating: 'STORE PRESSURE', agent: 'FOAM', agentName: 'AFFF', capacity: '9 LTR', cost: 5217, fireClass: 'AB'},
            {id: 5, name: 'WATER', type: 'PORTABLE', body: 'MILD STEEL', operating: 'STORE PRESSURE', agent: 'WATER', agentName: 'CLEAN WATER', capacity: '9 LTR', cost: 5117, fireClass: 'A'},
            {id: 6, name: 'KITCHEN (K/F CLASS)', type: 'PORTABLE', body: 'STAINLESS STEEL', operating: 'STORE PRESSURE', agent: 'KITCHEN (K/F CLASS)', agentName: 'WET CHEMICAL', capacity: '6 LTR', cost: 26405, fireClass: 'F'}
        ];
        addFloor();
        setUnit('meters');
    }
}

// Initialize Google Translate
function initializeGoogleTranslate() {
    function googleTranslateElementInit() {
        if (window.google && window.google.translate) {
            new google.translate.TranslateElement({
                pageLanguage: 'en',
                includedLanguages: 'en,hi,ta,te,ml,kn,bn,mr,gu,pa,ur,es,fr,de,zh,ja,ar,ru',
                layout: google.translate.TranslateElement.InlineLayout.SIMPLE
            }, 'google_translate_element');
        } else {
            console.log('Google Translate not loaded');
        }
    }
    
    window.googleTranslateElementInit = googleTranslateElementInit;
}

// Initialize form and event listeners
function initializeForm() {
    // Form submission
    document.getElementById('fireCalculator').addEventListener('submit', handleFormSubmit);
    
    // Initialize first floor
    renderFloorSection(1);
    
    // Initialize expert mode section
    renderExtinguisherGrid();
}

function setupEventListeners() {
    // Add click outside listener for expert mode
    document.addEventListener('click', function(event) {
        const expertSection = document.getElementById('expertSection');
        const expertToggle = document.getElementById('expertToggle');
        
        if (expertSection && expertToggle && 
            !expertSection.contains(event.target) && 
            !expertToggle.contains(event.target) &&
            expertSection.classList.contains('active')) {
            toggleExpertMode();
        }
    });
}

// Navigation between steps
function nextStep(step) {
    // Validate current step before proceeding
    if (!validateCurrentStep(step - 1)) {
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
        targetStep.classList.add('fade-in');
    }
    
    // Update progress indicator
    updateProgressIndicator(step);
    
    // Scroll to top of the section
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function prevStep(step) {
    // Hide all steps
    document.querySelectorAll('.form-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target step
    const targetStep = document.getElementById(`step${step}`);
    if (targetStep) {
        targetStep.classList.add('active');
        targetStep.classList.add('fade-in');
    }
    
    // Update progress indicator
    updateProgressIndicator(step);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

function validateCurrentStep(step) {
    const currentStep = document.getElementById(`step${step}`);
    if (!currentStep) return true;
    
    const requiredFields = currentStep.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.style.borderColor = '#e74c3c';
            field.focus();
            
            // Add shake animation
            field.classList.add('shake');
            setTimeout(() => field.classList.remove('shake'), 500);
        } else {
            field.style.borderColor = '';
        }
    });
    
    if (!isValid) {
        showNotification('Please fill all required fields', 'error');
    }
    
    return isValid;
}

// Floor management
function addFloor() {
    AppState.floorCount++;
    renderFloorSection(AppState.floorCount);
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
    }
}

function renumberFloors() {
    const floors = document.querySelectorAll('.floor-section');
    floors.forEach((floor, index) => {
        const floorNum = index + 1;
        floor.setAttribute('data-floor', floorNum);
        
        const floorNames = ['Ground', 'First', 'Second', 'Third', 'Fourth', 'Fifth', 
                          'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth'];
        const floorName = floorNames[floorNum - 1] || `Floor ${floorNum}`;
        
        const header = floor.querySelector('h4');
        if (header) {
            header.textContent = `${floorName} Floor`;
        }
        
        // Update input names
        const inputs = floor.querySelectorAll('input, select');
        inputs.forEach(input => {
            const name = input.getAttribute('name') || '';
            if (name.includes('floor')) {
                input.setAttribute('name', name.replace(/floor\d+/, `floor${floorNum}`));
            }
        });
    });
}

function renderFloorSection(floorNumber) {
    const floorsContainer = document.getElementById('floorsContainer');
    if (!floorsContainer) return;
    
    const floorNames = ['Ground', 'First', 'Second', 'Third', 'Fourth', 'Fifth', 
                       'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth'];
    const floorName = floorNames[floorNumber - 1] || `Floor ${floorNumber}`;
    
    const floorHtml = `
        <div class="floor-section" data-floor="${floorNumber}">
            <div class="floor-header">
                <h4>${floorName} Floor</h4>
                <button type="button" class="btn btn-secondary remove-floor" onclick="removeFloor(${floorNumber})">
                    Remove
                </button>
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
    
    floorsContainer.insertAdjacentHTML('beforeend', floorHtml);
}

// Unit conversion
function setUnit(unit) {
    AppState.currentUnit = unit;
    
    // Update UI
    document.querySelectorAll('.unit-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Update labels and placeholders
    document.querySelectorAll('.unit-label').forEach(label => {
        label.textContent = unit === 'meters' ? 'm²' : 'ft²';
    });
    
    document.querySelectorAll('.floor-area').forEach(input => {
        input.placeholder = `Enter area in ${unit === 'meters' ? 'm²' : 'ft²'}`;
    });
}

function convertArea(area, fromUnit, toUnit) {
    if (fromUnit === toUnit) return area;
    if (fromUnit === 'meters' && toUnit === 'feet') return area * 10.7639;
    if (fromUnit === 'feet' && toUnit === 'meters') return area / 10.7639;
    return area;
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
            renderExtinguisherGrid();
        } else {
            expertSection.classList.remove('active');
            expertToggle.innerHTML = '🔧 Enable Expert Mode (For Fire Professionals)';
            expertToggle.classList.remove('active');
            clearExpertSelections();
        }
    }
}

function renderExtinguisherGrid() {
    const grid = document.getElementById('extinguisherGrid');
    if (!grid) return;
    
    // Filter extinguishers
    const filteredExtinguishers = filterExtinguishersData();
    
    // Clear grid
    grid.innerHTML = '';
    
    if (filteredExtinguishers.length === 0) {
        grid.innerHTML = '<div class="info-box">No extinguishers match your filters. Try different filter options.</div>';
        return;
    }
    
    // Render extinguisher cards
    filteredExtinguishers.forEach(ext => {
        const isSelected = AppState.selectedExtinguishers.has(ext.id);
        const selectedQuantity = isSelected ? AppState.selectedExtinguishers.get(ext.id).quantity : 1;
        
        const card = document.createElement('div');
        card.className = `extinguisher-card ${isSelected ? 'selected' : ''}`;
        card.innerHTML = `
            <div class="extinguisher-header">
                <h5 style="margin: 0; color: #2c3e50;">${ext.name}</h5>
                <span class="extinguisher-type-badge">${ext.type}</span>
            </div>
            
            <div class="extinguisher-details">
                <div class="detail-item">
                    <span class="detail-label">Capacity:</span>
                    <span class="detail-value">${ext.capacity}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Body:</span>
                    <span class="detail-value">${ext.body}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Operating:</span>
                    <span class="detail-value">${ext.operating}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Agent:</span>
                    <span class="detail-value">${ext.agentName}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Fire Class:</span>
                    <span class="detail-value">${ext.fireClass || 'ABC'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Approx. Cost:</span>
                    <span class="detail-value">₹${ext.cost.toLocaleString()}</span>
                </div>
            </div>
            
            <div class="extinguisher-quantity" style="${isSelected ? '' : 'display: none;'}">
                <button class="quantity-btn" onclick="updateExtinguisherQuantity(${ext.id}, -1)">-</button>
                <input type="number" 
                       class="quantity-input" 
                       value="${selectedQuantity}" 
                       min="1" 
                       max="100"
                       onchange="updateExtinguisherQuantity(${ext.id}, 0, this.value)">
                <button class="quantity-btn" onclick="updateExtinguisherQuantity(${ext.id}, 1)">+</button>
            </div>
            
            <button class="btn ${isSelected ? 'btn-secondary' : ''}" 
                    onclick="toggleExtinguisherSelection(${ext.id})"
                    style="margin-top: 15px; width: 100%;">
                ${isSelected ? '✓ Selected' : 'Select'}
            </button>
        `;
        
        grid.appendChild(card);
    });
    
    updateExpertSelectionSummary();
}

function filterExtinguishersData() {
    return AppState.fireExtinguishers.filter(ext => {
        // Filter by type
        if (AppState.filters.type && ext.type !== AppState.filters.type) {
            return false;
        }
        
        // Filter by agent
        if (AppState.filters.agent) {
            if (AppState.filters.agent === 'KITCHEN' && !ext.agent.includes('KITCHEN')) {
                return false;
            }
            if (AppState.filters.agent !== 'KITCHEN' && ext.agent !== AppState.filters.agent) {
                return false;
            }
        }
        
        // Filter by capacity
        if (AppState.filters.capacity) {
            const capacityValue = parseFloat(ext.capacity);
            switch(AppState.filters.capacity) {
                case '1': if (capacityValue > 5) return false; break;
                case '2': if (capacityValue <= 5 || capacityValue > 10) return false; break;
                case '3': if (capacityValue <= 10 || capacityValue > 25) return false; break;
                case '4': if (capacityValue <= 25) return false; break;
            }
        }
        
        return true;
    });
}

function filterExtinguishers() {
    AppState.filters = {
        type: document.getElementById('filterType').value,
        agent: document.getElementById('filterAgent').value,
        capacity: document.getElementById('filterCapacity').value
    };
    
    renderExtinguisherGrid();
}

function toggleExtinguisherSelection(extinguisherId) {
    const extinguisher = AppState.fireExtinguishers.find(e => e.id === extinguisherId);
    if (!extinguisher) return;
    
    if (AppState.selectedExtinguishers.has(extinguisherId)) {
        AppState.selectedExtinguishers.delete(extinguisherId);
    } else {
        AppState.selectedExtinguishers.set(extinguisherId, {
            ...extinguisher,
            quantity: 1
        });
    }
    
    renderExtinguisherGrid();
}

function updateExtinguisherQuantity(extinguisherId, delta, newValue = null) {
    if (!AppState.selectedExtinguishers.has(extinguisherId)) return;
    
    const selection = AppState.selectedExtinguishers.get(extinguisherId);
    let newQuantity;
    
    if (newValue !== null) {
        newQuantity = parseInt(newValue) || 1;
    } else {
        newQuantity = Math.max(1, selection.quantity + delta);
    }
    
    selection.quantity = newQuantity;
    AppState.selectedExtinguishers.set(extinguisherId, selection);
    
    renderExtinguisherGrid();
}

function clearExpertSelections() {
    AppState.selectedExtinguishers.clear();
    renderExtinguisherGrid();
}

function updateExpertSelectionSummary() {
    const summary = document.getElementById('expertSelectionSummary');
    if (!summary) return;
    
    const totalItems = AppState.selectedExtinguishers.size;
    const totalQuantity = Array.from(AppState.selectedExtinguishers.values())
        .reduce((sum, item) => sum + item.quantity, 0);
    const totalCost = Array.from(AppState.selectedExtinguishers.values())
        .reduce((sum, item) => sum + (item.cost * item.quantity), 0);
    
    if (totalItems === 0) {
        summary.innerHTML = 'No extinguishers selected';
    } else {
        summary.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-top: 10px;">
                <div style="text-align: center;">
                    <div style="font-size: 1.2em; font-weight: bold; color: #3498db;">${totalItems}</div>
                    <div style="font-size: 0.9em; color: #666;">Types</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 1.2em; font-weight: bold; color: #27ae60;">${totalQuantity}</div>
                    <div style="font-size: 0.9em; color: #666;">Total Units</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 1.2em; font-weight: bold; color: #e74c3c;">₹${totalCost.toLocaleString()}</div>
                    <div style="font-size: 0.9em; color: #666;">Approx. Cost</div>
                </div>
            </div>
        `;
    }
}

// Form submission and calculation
async function handleFormSubmit(event) {
    event.preventDefault();
    
    // Show loading state
    const calculateBtn = document.getElementById('calculateBtn');
    const originalText = calculateBtn.innerHTML;
    calculateBtn.innerHTML = '<span class="spinner" style="width: 20px; height: 20px;"></span> Calculating...';
    calculateBtn.disabled = true;
    
    try {
        // Collect form data
        const formData = collectFormData();
        
        // Perform calculations
        const results = AppState.expertMode && AppState.selectedExtinguishers.size > 0
            ? calculateExpertRequirements(formData)
            : calculateAutomaticRequirements(formData);
        
        // Store calculation
        AppState.currentCalculation = { formData, results };
        
        // Display results
        displayResults(formData, results);
        
        // Show results section
        const resultSection = document.getElementById('resultSection');
        resultSection.classList.add('active');
        resultSection.scrollIntoView({ behavior: 'smooth' });
        
        // Track calculation in Google Analytics
        if (window.gtag) {
            gtag('event', 'calculation_completed', {
                'mode': AppState.expertMode ? 'expert' : 'auto',
                'building_type': formData.building.type,
                'floor_count': formData.floors.length,
                'total_extinguishers': results.totalExtinguishers
            });
        }
        
    } catch (error) {
        console.error('Calculation error:', error);
        showNotification('Error calculating requirements. Please try again.', 'error');
    } finally {
        // Reset button
        calculateBtn.innerHTML = originalText;
        calculateBtn.disabled = false;
    }
}

function collectFormData() {
    return {
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
        floors: collectFloorData(),
        fireRisk: document.getElementById('fireRisk').value,
        expertMode: AppState.expertMode,
        expertSelections: AppState.expertMode ? Array.from(AppState.selectedExtinguishers.values()) : []
    };
}

function collectFloorData() {
    const floors = [];
    const floorSections = document.querySelectorAll('.floor-section');
    
    floorSections.forEach(section => {
        const floorNum = parseInt(section.getAttribute('data-floor'));
        const areaInput = section.querySelector('.floor-area');
        const usageSelect = section.querySelector('.floor-usage');
        
        if (areaInput && usageSelect) {
            const area = parseFloat(areaInput.value) || 0;
            const usage = usageSelect.value;
            const areaInMeters = AppState.currentUnit === 'meters' 
                ? area 
                : convertArea(area, 'feet', 'meters');
            
            floors.push({
                number: floorNum,
                area: area,
                areaInMeters: areaInMeters,
                usage: usage,
                hazard: usageHazards[usage] || 'moderate'
            });
        }
    });
    
    return floors;
}

function calculateAutomaticRequirements(formData) {
    const results = {
        floors: [],
        totalExtinguishers: 0,
        totalCost: 0,
        recommendations: [],
        extinguisherType: '',
        selectedProduct: null
    };

    // Determine extinguisher type based on fire risk
    let extinguisherType, selectedProduct;
    switch(formData.fireRisk) {
        case 'A':
            extinguisherType = 'Water Type';
            selectedProduct = quickPriceList.WATER_9L;
            break;
        case 'B':
            extinguisherType = 'Foam or ABC Dry Powder';
            selectedProduct = quickPriceList.FOAM_9L;
            break;
        case 'C':
            extinguisherType = 'CO₂ Extinguisher';
            selectedProduct = quickPriceList.CO2_4.5KG;
            break;
        case 'F':
            extinguisherType = 'Wet Chemical (F-Class)';
            selectedProduct = quickPriceList.WET_CHEM_6L;
            break;
        case 'E':
            extinguisherType = 'AVD for Lithium Ion';
            selectedProduct = { desc: 'AVD for Lithium Ion', capacity: '2 LTR', rating: 'E-Class', price: 28394 };
            break;
        case 'mixed':
        default:
            extinguisherType = 'ABC Dry Powder (Multi-purpose)';
            selectedProduct = quickPriceList.ABC_9KG;
            break;
    }

    // Calculate for each floor
    formData.floors.forEach(floor => {
        const standard = BISStandards[floor.hazard] || BISStandards.moderate;
        let numExtinguishers = Math.ceil(floor.areaInMeters / standard.area);
        
        // Minimum requirements
        if (floor.areaInMeters >= 100 && numExtinguishers < 2) {
            numExtinguishers = 2;
        }
        
        // Maximum travel distance consideration
        const maxByDistance = Math.ceil(floor.areaInMeters / (standard.distance * standard.distance));
        numExtinguishers = Math.max(numExtinguishers, maxByDistance);

        const floorCost = numExtinguishers * selectedProduct.price;
        
        results.floors.push({
            ...floor,
            extinguishersRequired: numExtinguishers,
            extinguisherType: extinguisherType,
            product: selectedProduct,
            cost: floorCost,
            standard: standard
        });

        results.totalExtinguishers += numExtinguishers;
        results.totalCost += floorCost;
    });

    results.extinguisherType = extinguisherType;
    results.selectedProduct = selectedProduct;

    return results;
}

function calculateExpertRequirements(formData) {
    const results = {
        expertSelections: [],
        totalExtinguishers: 0,
        totalCost: 0,
        recommendations: []
    };

    // Use manually selected extinguishers
    formData.expertSelections.forEach(selection => {
        const selectionCost = selection.cost * selection.quantity;
        results.expertSelections.push({
            ...selection,
            cost: selectionCost
        });
        
        results.totalExtinguishers += selection.quantity;
        results.totalCost += selectionCost;
    });

    // Add recommendations based on selections
    if (results.expertSelections.length > 0) {
        results.recommendations.push({
            type: 'expert',
            message: 'Custom selection by fire safety expert',
            details: `${results.expertSelections.length} different extinguisher types selected`
        });
    }

    return results;
}

// Display results
function displayResults(formData, results) {
    const resultSection = document.getElementById('resultSection');
    if (!resultSection) return;
    
    let resultsHTML = '';
    
    // Project Summary
    const totalArea = results.floors ? 
        results.floors.reduce((sum, floor) => sum + floor.area, 0) :
        0;
    
    resultsHTML += `
        <div class="result-card fade-in">
            <h3>🎯 Your Fire Safety Plan</h3>
            <div class="info-box">
                <strong>Project Summary:</strong><br>
                ${formData.building.type.charAt(0).toUpperCase() + formData.building.type.slice(1)} Building | 
                ${formData.building.height} Rise | 
                ${formData.floors.length} Floor(s) | 
                Total Area: ${totalArea.toLocaleString()} ${AppState.currentUnit === 'meters' ? 'm²' : 'ft²'}
                ${formData.expertMode ? ' | 🔧 Expert Mode' : ''}
            </div>

            <div class="recommendation-grid">
                <div class="recommendation-item">
                    <strong>Building Type</strong>
                    <div>${formData.building.type.charAt(0).toUpperCase() + formData.building.type.slice(1)}</div>
                </div>
                <div class="recommendation-item">
                    <strong>Fire Risk</strong>
                    <div>${getRiskDescription(formData.fireRisk)}</div>
                </div>
                <div class="recommendation-item">
                    <strong>Mode</strong>
                    <div>${formData.expertMode ? 'Expert Selection' : 'Automatic Calculation'}</div>
                </div>
                <div class="recommendation-item">
                    <strong>Total Units</strong>
                    <div>${results.totalExtinguishers} extinguishers</div>
                </div>
            </div>
        </div>
    `;
    
    // Show appropriate content based on mode
    if (formData.expertMode) {
        resultsHTML += displayExpertResults(formData, results);
    } else {
        resultsHTML += displayAutomaticResults(formData, results);
    }
    
    // Quotation
    resultsHTML += displayQuotation(formData, results);
    
    // Maintenance Info
    resultsHTML += `
        <div class="result-card">
            <h3>🔧 Maintenance Schedule (BIS 2190:2024)</h3>
            <div class="maintenance-grid">
                <div class="maintenance-item">
                    <strong>Monthly Visual Check</strong>
                    <div>Check pressure, seals, and physical condition</div>
                </div>
                <div class="maintenance-item">
                    <strong>Quarterly Inspection</strong>
                    <div>Detailed inspection by trained personnel</div>
                </div>
                <div class="maintenance-item">
                    <strong>Annual Maintenance</strong>
                    <div>Full service by certified technician</div>
                </div>
                <div class="maintenance-item">
                    <strong>Hydrostatic Testing</strong>
                    <div>Every 5 years (pressure vessels)</div>
                </div>
            </div>
            
            <div class="info-box" style="margin-top: 20px;">
                <strong>📋 Compliance Checklist:</strong>
                <ul style="margin-left: 20px; margin-top: 10px;">
                    <li>✓ Minimum 2 extinguishers per floor (≥100m²)</li>
                    <li>✓ Maximum travel distance: 15-20 meters</li>
                    <li>✓ Proper signage and accessibility</li>
                    <li>✓ Regular maintenance records</li>
                    <li>✓ Staff training on usage</li>
                </ul>
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
        </div>
    `;
    
    resultSection.innerHTML = resultsHTML;
}

function displayExpertResults(formData, results) {
    return `
        <div class="result-card">
            <h3>🔬 Expert Selection Details</h3>
            <div class="info-box">
                You selected ${results.expertSelections.length} different extinguisher types with total ${results.totalExtinguishers} units.
            </div>
            
            <div class="extinguisher-grid" style="margin-top: 20px;">
                ${results.expertSelections.map(selection => `
                    <div class="extinguisher-card">
                        <div class="extinguisher-header">
                            <h5>${selection.name}</h5>
                            <span class="extinguisher-type-badge">${selection.type}</span>
                        </div>
                        <div class="extinguisher-details">
                            <div class="detail-item">
                                <span class="detail-label">Quantity:</span>
                                <span class="detail-value">${selection.quantity} units</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Capacity:</span>
                                <span class="detail-value">${selection.capacity}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Agent:</span>
                                <span class="detail-value">${selection.agentName}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Unit Cost:</span>
                                <span class="detail-value">₹${selection.cost.toLocaleString()}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Total Cost:</span>
                                <span class="detail-value" style="color: #e74c3c; font-weight: bold;">
                                    ₹${(selection.cost * selection.quantity).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function displayAutomaticResults(formData, results) {
    return `
        <div class="result-card">
            <h3>🏗️ Floor-wise Requirements</h3>
            ${results.floors.map(floor => {
                const floorNames = ['Ground', 'First', 'Second', 'Third', 'Fourth', 'Fifth', 
                                  'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth'];
                const floorName = floorNames[floor.number - 1] || `Floor ${floor.number}`;
                
                return `
                    <div class="floor-section" style="margin: 15px 0;">
                        <h4>${floorName} Floor - ${floor.usage.charAt(0).toUpperCase() + floor.usage.slice(1)}</h4>
                        <div class="info-box" style="margin: 10px 0;">
                            <strong>Specifications:</strong><br>
                            • Area: ${floor.area} ${AppState.currentUnit === 'meters' ? 'm²' : 'ft²'}<br>
                            • Hazard Level: ${floor.hazard.toUpperCase()}<br>
                            • Required: ${floor.extinguishersRequired} × ${floor.product.desc}<br>
                            • Coverage: 1 unit per ${floor.standard.area}m²<br>
                            • Max Travel Distance: ${floor.standard.distance}m
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function displayQuotation(formData, results) {
    let totalCost = results.totalCost || 0;
    const standPrice = 500;
    const standQuantity = results.totalExtinguishers;
    const standSubtotal = standPrice * standQuantity;
    totalCost += standSubtotal;
    const gst = totalCost * 0.18;
    const grandTotal = totalCost + gst;
    
    return `
        <div class="result-card">
            <h3>💰 Detailed Quotation</h3>
            
            <div class="info-box">
                <strong>Client Information:</strong><br>
                <div style="margin-top: 10px;">
                    <strong>${formData.customer.name}</strong><br>
                    ${formData.customer.company ? formData.customer.company + '<br>' : ''}
                    ${formData.customer.project}<br>
                    ${formData.customer.address}<br>
                    📞 ${formData.customer.phone} | ✉️ ${formData.customer.email}
                </div>
            </div>
            
            <table class="quotation-table">
                <thead>
                    <tr>
                        <th>Item Description</th>
                        <th>Specifications</th>
                        <th>Unit Price (₹)</th>
                        <th>Quantity</th>
                        <th>Subtotal (₹)</th>
                    </tr>
                </thead>
                <tbody>
                    ${formData.expertMode ? 
                        results.expertSelections.map(selection => `
                            <tr>
                                <td>${selection.name} - ${selection.agentName}</td>
                                <td>${selection.capacity} | ${selection.body} | ${selection.type}</td>
                                <td>₹${selection.cost.toLocaleString()}</td>
                                <td>${selection.quantity}</td>
                                <td>₹${(selection.cost * selection.quantity).toLocaleString()}</td>
                            </tr>
                        `).join('') :
                        results.floors.map(floor => {
                            const floorNames = ['Ground', 'First', 'Second', 'Third', 'Fourth', 'Fifth', 
                                              'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth'];
                            const floorName = floorNames[floor.number - 1] || `Floor ${floor.number}`;
                            
                            return `
                                <tr>
                                    <td>${floor.product.desc} - ${floorName} Floor</td>
                                    <td>${floor.product.capacity} | Rating: ${floor.product.rating}</td>
                                    <td>₹${floor.product.price.toLocaleString()}</td>
                                    <td>${floor.extinguishersRequired}</td>
                                    <td>₹${(floor.product.price * floor.extinguishersRequired).toLocaleString()}</td>
                                </tr>
                            `;
                        }).join('')
                    }
                    
                    <tr>
                        <td>Extinguisher Stand/Bracket</td>
                        <td>Wall mounted, powder coated</td>
                        <td>₹${standPrice.toLocaleString()}</td>
                        <td>${standQuantity}</td>
                        <td>₹${standSubtotal.toLocaleString()}</td>
                    </tr>
                    
                    <tr class="total-row">
                        <td colspan="4" style="text-align: right;"><strong>Subtotal (excluding GST)</strong></td>
                        <td><strong>₹${totalCost.toLocaleString()}</strong></td>
                    </tr>
                    <tr class="total-row">
                        <td colspan="4" style="text-align: right;"><strong>GST @18%</strong></td>
                        <td><strong>₹${Math.round(gst).toLocaleString()}</strong></td>
                    </tr>
                    <tr class="total-row">
                        <td colspan="4" style="text-align: right;"><strong>Grand Total</strong></td>
                        <td><strong>₹${Math.round(grandTotal).toLocaleString()}</strong></td>
                    </tr>
                </tbody>
            </table>
            
            <div class="info-box" style="margin-top: 20px;">
                <strong>💡 Notes:</strong>
                <ul style="margin-left: 20px; margin-top: 10px;">
                    <li>Prices are approximate and may vary based on location, brand, and market conditions</li>
                    <li>Installation charges not included</li>
                    <li>Annual maintenance contract: ₹200-500 per extinguisher</li>
                    <li>Quotation valid for 30 days from generation date</li>
                    <li>All equipment complies with BIS 2190:2024 standards</li>
                </ul>
            </div>
        </div>
    `;
}

// Helper functions
function getRiskDescription(riskCode) {
    const risks = {
        'A': 'Class A - Ordinary Combustibles',
        'B': 'Class B - Flammable Liquids', 
        'C': 'Class C - Electrical Equipment',
        'D': 'Class D - Combustible Metals',
        'F': 'Class F/K - Cooking Oils & Fats',
        'E': 'Class E - Lithium Ion Batteries',
        'mixed': 'Mixed/Multiple Hazards'
    };
    return risks[riskCode] || 'General Risk Assessment';
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div style="padding: 15px; background: ${type === 'error' ? '#f8d7da' : type === 'warning' ? '#fff3cd' : '#d4edda'}; 
                    color: ${type === 'error' ? '#721c24' : type === 'warning' ? '#856404' : '#155724'};
                    border-radius: 8px; margin: 10px 0; border: 1px solid ${type === 'error' ? '#f5c6cb' : type === 'warning' ? '#ffeaa7' : '#c3e6cb'};">
            ${message}
        </div>
    `;
    
    // Add to page
    const container = document.querySelector('.container') || document.body;
    container.insertBefore(notification, container.firstChild);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Export functions
function downloadPDF() {
    if (!AppState.currentCalculation) {
        showNotification('Please calculate requirements first', 'warning');
        return;
    }
    
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Add content to PDF
        doc.setFontSize(20);
        doc.setTextColor(44, 62, 80);
        doc.text('FIRE EXTINGUISHER QUOTATION', 20, 20);
        
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        
        // Client details
        const formData = AppState.currentCalculation.formData;
        doc.text(`Client: ${formData.customer.name}`, 20, 40);
        doc.text(`Project: ${formData.customer.project}`, 20, 50);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 60);
        
        // Generate PDF content based on mode
        if (formData.expertMode) {
            generateExpertPDF(doc, formData, AppState.currentCalculation.results);
        } else {
            generateAutomaticPDF(doc, formData, AppState.currentCalculation.results);
        }
        
        // Save PDF
        doc.save(`Fire_Extinguisher_Quotation_${formData.customer.project.replace(/\s+/g, '_')}.pdf`);
        
        showNotification('PDF downloaded successfully!', 'success');
        
    } catch (error) {
        console.error('PDF generation error:', error);
        showNotification('Error generating PDF. Please try again.', 'error');
    }
}

function generateExpertPDF(doc, formData, results) {
    let yPos = 80;
    
    doc.setFontSize(14);
    doc.text('Expert Selection Summary', 20, yPos);
    yPos += 10;
    
    doc.setFontSize(10);
    results.expertSelections.forEach((selection, index) => {
        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }
        
        doc.text(`${index + 1}. ${selection.name} - ${selection.agentName}`, 25, yPos);
        yPos += 7;
        doc.text(`   Capacity: ${selection.capacity} | Qty: ${selection.quantity} | Unit: ₹${selection.cost}`, 25, yPos);
        yPos += 7;
        doc.text(`   Subtotal: ₹${(selection.cost * selection.quantity).toLocaleString()}`, 25, yPos);
        yPos += 10;
    });
}

function generateAutomaticPDF(doc, formData, results) {
    let yPos = 80;
    
    doc.setFontSize(14);
    doc.text('Floor-wise Requirements', 20, yPos);
    yPos += 10;
    
    doc.setFontSize(10);
    results.floors.forEach((floor, index) => {
        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }
        
        const floorNames = ['Ground', 'First', 'Second', 'Third', 'Fourth'];
        const floorName = floorNames[floor.number - 1] || `Floor ${floor.number}`;
        
        doc.text(`${index + 1}. ${floorName} Floor (${floor.usage})`, 25, yPos);
        yPos += 7;
        doc.text(`   Area: ${floor.area} ${AppState.currentUnit === 'meters' ? 'm²' : 'ft²'}`, 25, yPos);
        yPos += 7;
        doc.text(`   Required: ${floor.extinguishersRequired} × ${floor.product.desc}`, 25, yPos);
        yPos += 7;
        doc.text(`   Cost: ₹${floor.cost.toLocaleString()}`, 25, yPos);
        yPos += 10;
    });
}

function downloadExcel() {
    if (!AppState.currentCalculation) {
        showNotification('Please calculate requirements first', 'warning');
        return;
    }
    
    try {
        const wb = XLSX.utils.book_new();
        const formData = AppState.currentCalculation.formData;
        const results = AppState.currentCalculation.results;
        
        // Create Quotation sheet
        const wsData = [
            ['FIRE EXTINGUISHER QUOTATION'],
            [''],
            ['Client:', formData.customer.name],
            ['Project:', formData.customer.project],
            ['Address:', formData.customer.address],
            ['Contact:', `${formData.customer.phone} | ${formData.customer.email}`],
            ['Date:', new Date().toLocaleDateString()],
            ['Mode:', formData.expertMode ? 'Expert Selection' : 'Automatic Calculation'],
            [''],
            ['Item Description', 'Specifications', 'Unit Price (₹)', 'Quantity', 'Subtotal (₹)']
        ];
        
        if (formData.expertMode) {
            results.expertSelections.forEach(selection => {
                wsData.push([
                    `${selection.name} - ${selection.agentName}`,
                    `${selection.capacity} | ${selection.type} | ${selection.body}`,
                    selection.cost,
                    selection.quantity,
                    selection.cost * selection.quantity
                ]);
            });
        } else {
            results.floors.forEach(floor => {
                const floorNames = ['Ground', 'First', 'Second', 'Third', 'Fourth'];
                const floorName = floorNames[floor.number - 1] || `Floor ${floor.number}`;
                
                wsData.push([
                    `${floor.product.desc} - ${floorName} Floor`,
                    `${floor.product.capacity} | Rating: ${floor.product.rating}`,
                    floor.product.price,
                    floor.extinguishersRequired,
                    floor.cost
                ]);
            });
        }
        
        // Add stands
        const standPrice = 500;
        const standQuantity = results.totalExtinguishers;
        wsData.push([
            'Extinguisher Stand/Bracket',
            'Wall mounted, powder coated',
            standPrice,
            standQuantity,
            standPrice * standQuantity
        ]);
        
        // Add totals
        let subtotal = results.totalCost + (standPrice * standQuantity);
        let gst = subtotal * 0.18;
        let grandTotal = subtotal + gst;
        
        wsData.push(['']);
        wsData.push(['', '', '', 'Subtotal:', subtotal]);
        wsData.push(['', '', '', 'GST @18%:', gst]);
        wsData.push(['', '', '', 'Grand Total:', grandTotal]);
        
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, 'Quotation');
        
        // Create Compliance sheet
        const complianceData = [
            ['BIS 2190:2024 COMPLIANCE CHECKLIST'],
            [''],
            ['Item', 'Requirement', 'Status', 'Remarks']
        ];
        
        // Add compliance items
        const complianceItems = [
            ['Minimum Extinguishers', '2 per floor (≥100m²)', 'To be verified', ''],
            ['Maximum Travel Distance', '15-20 meters', 'To be verified', ''],
            ['Proper Signage', 'Clear and visible', 'To be verified', ''],
            ['Accessibility', 'Unobstructed access', 'To be verified', ''],
            ['Monthly Inspection', 'Visual check', 'To be scheduled', ''],
            ['Annual Maintenance', 'Professional service', 'To be scheduled', ''],
            ['Staff Training', 'Basic fire safety', 'To be arranged', '']
        ];
        
        complianceItems.forEach(item => {
            complianceData.push(item);
        });
        
        const ws2 = XLSX.utils.aoa_to_sheet(complianceData);
        XLSX.utils.book_append_sheet(wb, ws2, 'Compliance');
        
        // Save file
        XLSX.writeFile(wb, `Fire_Safety_Report_${formData.customer.project.replace(/\s+/g, '_')}.xlsx`);
        
        showNotification('Excel report downloaded successfully!', 'success');
        
    } catch (error) {
        console.error('Excel generation error:', error);
        showNotification('Error generating Excel report', 'error');
    }
}

// Utility functions
function showPrivacyPolicy() {
    const policy = `
        <div style="max-width: 800px; margin: 20px auto; padding: 30px; background: white; border-radius: 10px; box-shadow: 0 5px 20px rgba(0,0,0,0.1);">
            <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">Privacy Policy</h2>
            <p><strong>Last Updated:</strong> ${new Date().toLocaleDateString()}</p>
            
            <h3>1. Information We Collect</h3>
            <p>We collect information you provide when using our calculator, including:</p>
            <ul>
                <li>Contact information (name, email, phone)</li>
                <li>Project details (building type, area, requirements)</li>
                <li>Fire safety specifications</li>
            </ul>
            
            <h3>2. How We Use Your Information</h3>
            <p>Your information is used solely for:</p>
            <ul>
                <li>Generating fire safety calculations</li>
                <li>Creating quotations and reports</li>
                <li>Improving our calculator tools</li>
                <li>Communication regarding your project</li>
            </ul>
            
            <h3>3. Data Security</h3>
            <p>We implement security measures to protect your data:</p>
            <ul>
                <li>All calculations are performed client-side</li>
                <li>No sensitive data is stored on our servers</li>
                <li>Regular security updates and monitoring</li>
            </ul>
            
            <h3>4. Third-Party Services</h3>
            <p>We use:</p>
            <ul>
                <li>Google Analytics for usage statistics</li>
                <li>Google AdSense for advertising</li>
                <li>Amazon Associates for product recommendations</li>
            </ul>
            
            <h3>5. Your Rights</h3>
            <p>You have the right to:</p>
            <ul>
                <li>Access your data</li>
                <li>Request deletion of your data</li>
                <li>Opt-out of communications</li>
            </ul>
            
            <button onclick="this.parentElement.remove()" style="padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 20px;">
                Close
            </button>
        </div>
    `;
    
    const modal = document.createElement('div');
    modal.innerHTML = policy;
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '10000';
    
    document.body.appendChild(modal);
}

function showTerms() {
    const terms = `
        <div style="max-width: 800px; margin: 20px auto; padding: 30px; background: white; border-radius: 10px; box-shadow: 0 5px 20px rgba(0,0,0,0.1); max-height: 80vh; overflow-y: auto;">
            <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">Terms of Use</h2>
            
            <h3>1. Acceptance of Terms</h3>
            <p>By using this fire extinguisher calculator, you agree to these terms. The calculator provides estimates based on BIS 2190:2024 standards.</p>
            
            <h3>2. Professional Disclaimer</h3>
            <p><strong>Important:</strong> This calculator provides estimates only. For actual installation:</p>
            <ul>
                <li>Consult with certified fire safety professionals</li>
                <li>Follow local fire safety regulations</li>
                <li>Get proper site assessment</li>
                <li>Use certified equipment from licensed suppliers</li>
            </ul>
            
            <h3>3. Limitation of Liability</h3>
            <p>We are not responsible for:</p>
            <ul>
                <li>Incorrect calculations due to user input errors</li>
                <li>Changes in fire safety regulations</li>
                <li>Site-specific requirements not covered by this tool</li>
                <li>Actual installation costs or compliance issues</li>
            </ul>
            
            <h3>4. Intellectual Property</h3>
            <p>All content, design, and code are protected by copyright. You may:</p>
            <ul>
                <li>Use the calculator for personal/professional projects</li>
                <li>Share results with clients and colleagues</li>
                <li>Reference calculations in proposals</li>
            </ul>
            <p>You may not:</p>
            <ul>
                <li>Copy or reproduce the calculator code</li>
                <li>Use for commercial resale without permission</li>
                <li>Claim ownership of the tool or methodology</li>
            </ul>
            
            <h3>5. Affiliate Disclosure</h3>
            <p>This calculator contains affiliate links. We may earn commissions from qualifying purchases. This helps support free tool development.</p>
            
            <h3>6. Modifications</h3>
            <p>We reserve the right to update these terms. Continued use constitutes acceptance of changes.</p>
            
            <button onclick="this.parentElement.parentElement.remove()" style="padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 20px;">
                I Understand & Accept
            </button>
        </div>
    `;
    
    const modal = document.createElement('div');
    modal.innerHTML = terms;
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '10000';
    
    document.body.appendChild(modal);
}

// Add CSS animations
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
`;
document.head.appendChild(style);