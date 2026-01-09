/**
 * Rating Controller
 * Handles submission of driver ratings and comments
 */

/**
 * Submit rating data
 * @param {Object} ratingData - Rating data object
 * @param {number} ratingData.driverRating - Rating value (1-5)
 * @param {string} ratingData.comment - Customer comment
 * @param {Date} ratingData.createdAt - Timestamp of submission
 */
function submitRating(ratingData) {
    console.log('Submitting rating:', ratingData);

    // Simulate API call with delay
    setTimeout(() => {
        // Mock API response
        const response = {
            success: true,
            message: 'Cảm ơn bạn đã đánh giá!',
            data: ratingData,
            timestamp: new Date().toISOString()
        };

        // Log success response
        console.log('Rating submitted successfully:', response);

        // Show success message and reset form
        showSuccessMessage();

        // Reset form after 2 seconds
        setTimeout(() => {
            resetForm();
            hideSuccessMessage();
        }, 2000);

    }, 500); // Simulate network delay
}

/**
 * Show success message
 */
function showSuccessMessage() {
    const submitBtn = document.getElementById('submitBtn');
    const card = document.querySelector('.rating-card');

    // Create success message element
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = 'Cảm ơn bạn đã đánh giá! ✓';
    successDiv.id = 'successMessage';

    // Insert success message
    card.insertBefore(successDiv, submitBtn);

    // Disable submit button during submission
    submitBtn.disabled = true;
    submitBtn.textContent = 'Đang gửi...';
}

/**
 * Hide success message
 */
function hideSuccessMessage() {
    const successMessage = document.getElementById('successMessage');
    const submitBtn = document.getElementById('submitBtn');

    if (successMessage) {
        successMessage.remove();
    }

    submitBtn.disabled = false;
    submitBtn.textContent = 'Gửi đánh giá';
}

/**
 * Mock API function - can be replaced with real API call
 * This demonstrates the expected API format
 * 
 * Example of real API implementation:
 * 
 * async function submitRatingToAPI(ratingData) {
 *   try {
 *     const response = await fetch('/api/ratings', {
 *       method: 'POST',
 *       headers: {
 *         'Content-Type': 'application/json',
 *         'Authorization': `Bearer ${token}`
 *       },
 *       body: JSON.stringify(ratingData)
 *     });
 *     
 *     if (!response.ok) {
 *       throw new Error('Failed to submit rating');
 *     }
 *     
 *     const result = await response.json();
 *     return result;
 *   } catch (error) {
 *     console.error('Error submitting rating:', error);
 *     throw error;
 *   }
 * }
 */
