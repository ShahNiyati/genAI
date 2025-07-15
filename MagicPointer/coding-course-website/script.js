document.addEventListener('DOMContentLoaded', () => {
    console.log('Coding Course Hub website loaded successfully!');
    // You can add more interactive JavaScript here later

    const exploreButton = document.querySelector('.hero button');
    if (exploreButton) {
        exploreButton.addEventListener('click', () => {
            alert('Exploring courses! (This is a placeholder action)');
            // You can implement scrolling to the courses section or navigating to a new page here
        });
    }
});
