// Loading Screen Management
document.addEventListener('DOMContentLoaded', function() {
    // Simulate loading time
    setTimeout(() => {
        document.getElementById('loadingScreen').style.opacity = '0';
        document.getElementById('loadingScreen').style.transform = 'scale(0.95)';
        setTimeout(() => {
            document.getElementById('loadingScreen').style.display = 'none';
            document.getElementById('mainContent').classList.remove('hidden');
            document.getElementById('mainContent').classList.add('animate-fade-in');
        }, 300);
    }, 2000);
});

// Custom Radio Button Styling
document.querySelectorAll('input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', function() {
        // Remove checked class from all radio buttons in the same group
        document.querySelectorAll(`input[name="${this.name}"]`).forEach(r => {
            r.closest('label').querySelector('div').classList.remove('radio-checked');
        });
        // Add checked class to selected radio button
        this.closest('label').querySelector('div').classList.add('radio-checked');
    });
});

// Custom Checkbox Styling
document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        const checkboxDiv = this.closest('label').querySelector('div');
        if (this.checked) {
            checkboxDiv.classList.add('checkbox-checked');
            checkboxDiv.style.backgroundColor = '#3b82f6';
            checkboxDiv.style.borderColor = '#3b82f6';
        } else {
            checkboxDiv.classList.remove('checkbox-checked');
            checkboxDiv.style.backgroundColor = 'transparent';
            checkboxDiv.style.borderColor = '#6b7280';
        }
    });
});

// Enhanced Validation Functions
const validators = {
    fullName: (value) => {
        if (!value.trim()) return 'Full Name is required.';
        if (value.trim().length < 3) return 'Full Name must be at least 3 characters.';
        if (!/^[a-zA-Z\s]+$/.test(value.trim())) return 'Name should only contain letters and spaces.';
        return '';
    },
    email: (value) => {
        if (!value.trim()) return 'College Email ID is required.';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value.trim())) return 'Please enter a valid email address.';
        return '';
    },
    phone: (value) => {
        if (!value.trim()) return 'Phone Number is required.';
        if (!/^\d{10}$/.test(value.trim())) return 'Phone Number must be exactly 10 digits.';
        return '';
    },
    branch: (value) => {
        if (!value) return 'Please select your branch.';
        return '';
    },
    year: (value) => {
        if (!value) return 'Please select your year of study.';
        return '';
    },
    workshop: (value) => {
        if (!value) return 'Please select if you will attend the workshop.';
        return '';
    },
    consent: (value) => {
        if (!value) return 'You must agree to receive emails to continue.';
        return '';
    }
};

// DOM Elements
const form = document.getElementById('registrationForm');
const submitBtn = document.getElementById('submitBtn');
const successMessage = document.getElementById('successMessage');

// Field Elements
const fields = {
    fullName: document.getElementById('fullName'),
    email: document.getElementById('email'),
    phone: document.getElementById('phone'),
    branch: document.getElementById('branch'),
    year: document.getElementById('year'),
    github: document.getElementById('github'),
    consent: document.getElementById('consent')
};

// Error Elements
const errors = {
    fullName: document.getElementById('fullName-error'),
    email: document.getElementById('email-error'),
    phone: document.getElementById('phone-error'),
    branch: document.getElementById('branch-error'),
    year: document.getElementById('year-error'),
    workshop: document.getElementById('workshop-error'),
    github: document.getElementById('github-error'),
    consent: document.getElementById('consent-error')
};

// Workshop radio buttons
const workshopRadios = document.getElementsByName('workshop');

// Get workshop value
function getWorkshopValue() {
    for (const radio of workshopRadios) {
        if (radio.checked) return radio.value;
    }
    return '';
}

// Enhanced Field Validation
function validateField(fieldName) {
    let value;
    let error = '';

    switch (fieldName) {
        case 'fullName':
            value = fields.fullName.value;
            error = validators.fullName(value);
            break;
        case 'email':
            value = fields.email.value;
            error = validators.email(value);
            break;
        case 'phone':
            value = fields.phone.value;
            error = validators.phone(value);
            break;
        case 'branch':
            value = fields.branch.value;
            error = validators.branch(value);
            break;
        case 'year':
            value = fields.year.value;
            error = validators.year(value);
            break;
        case 'workshop':
            value = getWorkshopValue();
            error = validators.workshop(value);
            break;
        case 'consent':
            value = fields.consent.checked;
            error = validators.consent(value);
            break;
    }

    // Update error message with animation
    const errorElement = errors[fieldName];
    if (error) {
        errorElement.textContent = error;
        errorElement.style.opacity = '0';
        errorElement.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            errorElement.style.opacity = '1';
            errorElement.style.transform = 'translateY(0)';
        }, 10);
    } else {
        errorElement.textContent = '';
    }

    return !error;
}

// Form Validation
function validateForm() {
    let isValid = true;
    isValid &= validateField('fullName');
    isValid &= validateField('email');
    isValid &= validateField('phone');
    isValid &= validateField('branch');
    isValid &= validateField('year');
    isValid &= validateField('workshop');
    isValid &= validateField('consent');
    return isValid;
}

// Update Submit Button State
function updateSubmitState() {
    const isValid = validateForm();
    submitBtn.disabled = !isValid;
    
    if (isValid) {
        submitBtn.classList.add('animate-pulse');
    } else {
        submitBtn.classList.remove('animate-pulse');
    }
}

// Event Listeners for Real-time Validation
fields.fullName.addEventListener('input', () => {
    validateField('fullName');
    updateSubmitState();
});

fields.email.addEventListener('input', () => {
    validateField('email');
    updateSubmitState();
});

fields.phone.addEventListener('input', (e) => {
    // Only allow numeric input
    fields.phone.value = fields.phone.value.replace(/[^\d]/g, '');
    validateField('phone');
    updateSubmitState();
});

fields.branch.addEventListener('change', () => {
    validateField('branch');
    updateSubmitState();
});

fields.year.addEventListener('change', () => {
    validateField('year');
    updateSubmitState();
});

// Workshop radio buttons
workshopRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        validateField('workshop');
        updateSubmitState();
    });
});

fields.consent.addEventListener('change', () => {
    validateField('consent');
    updateSubmitState();
});

// Form Submission with Enhanced UX
form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (!validateForm()) {
        // Show all errors with animation
        Object.keys(validators).forEach(field => {
            validateField(field);
        });
        return;
    }

    // Show loading state
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = `
        <span class="flex items-center justify-center">
            <i class="fas fa-spinner fa-spin mr-2"></i>
            Processing...
        </span>
    `;
    submitBtn.disabled = true;

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Hide form and show success message
    form.style.opacity = '0';
    form.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
        form.style.display = 'none';
        successMessage.classList.remove('hidden');
        successMessage.style.opacity = '0';
        successMessage.style.transform = 'scale(0.9)';
        
        setTimeout(() => {
            successMessage.style.opacity = '1';
            successMessage.style.transform = 'scale(1)';
        }, 100);
    }, 300);

    // Reset form after showing success
    setTimeout(() => {
        form.reset();
        form.style.display = 'block';
        form.style.opacity = '1';
        form.style.transform = 'scale(1)';
        successMessage.classList.add('hidden');
        submitBtn.innerHTML = originalText;
        updateSubmitState();
        
        // Reset custom styling
        document.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.closest('label').querySelector('div').classList.remove('radio-checked');
        });
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            const checkboxDiv = checkbox.closest('label').querySelector('div');
            checkboxDiv.classList.remove('checkbox-checked');
            checkboxDiv.style.backgroundColor = 'transparent';
            checkboxDiv.style.borderColor = '#6b7280';
        });
    }, 5000);
});

// Input Focus Effects
document.querySelectorAll('input, select').forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.classList.add('ring-2', 'ring-blue-400/20');
    });
    
    input.addEventListener('blur', function() {
        this.parentElement.classList.remove('ring-2', 'ring-blue-400/20');
    });
});

// Initialize form state
updateSubmitState();

// Add floating particles effect
function createParticle() {
    const particle = document.createElement('div');
    particle.className = 'absolute w-2 h-2 bg-white/20 rounded-full animate-float';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 3 + 's';
    particle.style.animationDuration = (Math.random() * 3 + 2) + 's';
    document.body.appendChild(particle);
    
    setTimeout(() => {
        particle.remove();
    }, 5000);
}

// Create particles periodically
setInterval(createParticle, 3000);

// Add some initial particles
for (let i = 0; i < 5; i++) {
    setTimeout(createParticle, i * 500);
} 