// Rating text translations
const ratingTexts = {
    1: "Rất tệ",
    2: "Tạm được",
    3: "Bình thường",
    4: "Tốt",
    5: "Rất tốt"
};

let selectedRating = 0;

// DOM Elements
const stars = document.querySelectorAll('.star');
const ratingText = document.getElementById('ratingText');
const commentTextarea = document.getElementById('comment');
const submitBtn = document.getElementById('submitBtn');
const errorMessage = document.getElementById('errorMessage');

// Add click event listeners to stars
stars.forEach(star => {
    star.addEventListener('click', function() {
        selectedRating = parseInt(this.dataset.rating);
        updateStarDisplay();
        updateRatingText();
        clearError();
    });

    // Hover effects
    star.addEventListener('mouseenter', function() {
        const hoverRating = parseInt(this.dataset.rating);
        stars.forEach(s => {
            const starRating = parseInt(s.dataset.rating);
            if (starRating <= hoverRating) {
                s.style.color = 'var(--primary-orange)';
                s.style.transform = 'scale(1.15)';
            } else {
                s.style.color = '#D1D5DB';
                s.style.transform = 'scale(1)';
            }
        });
    });
});

// Reset hover state when leaving star container
document.querySelector('.stars-container').addEventListener('mouseleave', updateStarDisplay);

// Update star visual display
function updateStarDisplay() {
    stars.forEach(star => {
        const starRating = parseInt(star.dataset.rating);
        if (starRating <= selectedRating) {
            star.classList.add('active');
            star.classList.remove('inactive-after-hover');
        } else {
            star.classList.remove('active');
            star.classList.add('inactive-after-hover');
        }
    });
}

// Update rating text display
function updateRatingText() {
    if (selectedRating > 0) {
        ratingText.textContent = ratingTexts[selectedRating];
        ratingText.style.color = 'var(--primary-orange)';
    } else {
        ratingText.textContent = 'Chọn để đánh giá';
        ratingText.style.color = 'var(--primary-blue)';
    }
}

// Clear error message
function clearError() {
    errorMessage.textContent = '';
    errorMessage.style.display = 'none';
}

// Show error message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

// Submit button click handler
submitBtn.addEventListener('click', function() {
    // Validate rating selection
    if (selectedRating === 0) {
        showError('Vui lòng chọn mức đánh giá');
        return;
    }

    clearError();

    // Get comment value
    const comment = commentTextarea.value.trim();

    // Prepare rating data
    const ratingData = {
        driverRating: selectedRating,
        comment: comment,
        createdAt: new Date()
    };

    // Call controller to handle submission
    submitRating(ratingData);
});

// Submit feedback after successful submission
function resetForm() {
    selectedRating = 0;
    commentTextarea.value = '';
    updateStarDisplay();
    updateRatingText();
    clearError();
}
