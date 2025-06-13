document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.querySelector('form');
  const tokenInput = document.getElementById('token');
  
  tokenInput.focus();
  
  loginForm.addEventListener('submit', (e) => {
    const token = tokenInput.value.trim();
    
    if (!token) {
      e.preventDefault();
      showError('Please enter a bot token');
      return;
    }
    
    const submitButton = loginForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.innerHTML = `
      <div class="flex items-center justify-center">
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Connecting...
      </div>
    `;
  });
  
  function showError(message) {
    let errorDiv = document.querySelector('.error-message');
    
    if (!errorDiv) {
      errorDiv = document.createElement('div');
      errorDiv.className = 'bg-red-500/10 border border-red-500/30 rounded-md p-4 mb-6 error-message';
      loginForm.insertBefore(errorDiv, loginForm.firstChild);
    }
    
    errorDiv.textContent = message;
    
    tokenInput.focus();
  }
});