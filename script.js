document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const bucket = document.getElementById('bucket');
    const nextDisplay = document.getElementById('next-number');
    const numbersContainer = document.getElementById('numbers');
    const gameContainer = document.getElementById('game-container');
    const startButton = document.getElementById('startButton');

    let next = 1;
    let isDragging = false;
    let gameInterval;
    let fallIntervals = [];

    function moveBucket(event) {
        if (!gameInterval) return;     // Exit early if game is paused or not dragging
        if (isDragging) {
            // Calculate new position for the bucket
            const gameContainerRect = gameContainer.getBoundingClientRect();
            const bucketWidth = bucket.offsetWidth;
            let bucketX = event.clientX || event.touches[0].clientX;
            bucketX += bucketWidth / 2;    
            let newPositionX = bucketX - gameContainerRect.left - bucketWidth / 2;
            newPositionX = Math.max(bucketWidth / 2, Math.min(newPositionX, gameContainerRect.width - bucketWidth / 2)); 
            // Update bucket position
            bucket.style.left = newPositionX + 'px';
        }
    }

    function startDragging(event) {
        isDragging = true;
        moveBucket(event);
    }

    function stopDragging() {
        isDragging = false;
    }

    function checkCollision(number) {
        const bucketRect = bucket.getBoundingClientRect();
        const numberRect = number.getBoundingClientRect();

        return !(bucketRect.right < numberRect.left ||
            bucketRect.left > numberRect.right ||
            bucketRect.bottom < numberRect.top ||
            bucketRect.top > numberRect.bottom);
    }

    function removeNumber(number) {
        numbersContainer.removeChild(number);
    }

    function handleNumberClick(event) {
        const number = event.target;
        const value = parseInt(number.innerText);

        if (value === next) {
            next++;
            nextDisplay.innerText = next;
            removeNumber(number);
            if (next === 11) {
                alert('Congratulations! You win!');
                resetGame();
            }
        } else {
            alert('Game over! You lose!');
            resetGame();
        }
    }

    function createNumber() {
        const number = document.createElement('div');
        number.classList.add('number');
        const value = Math.floor(Math.random() * 10) + 1;
        number.innerText = value;
        number.style.left = Math.floor(Math.random() * (gameContainer.offsetWidth - 50)) + 'px';
        numbersContainer.appendChild(number);
        number.addEventListener('click', handleNumberClick);

        const fallInterval = setInterval(function() {
            const topPos = number.offsetTop;
            if (topPos >= gameContainer.offsetHeight - 50) {
                clearInterval(fallInterval);
                removeNumber(number);
            } else {
                number.style.top = topPos + 5 + 'px';
                if (checkCollision(number)) {
                    clearInterval(fallInterval); 
                    handleNumberClick({ target: number });
                }
            }
        }, 1000 / 60);

        fallIntervals.push(fallInterval);
    }

    function resetGame() {
        next = 1;
        nextDisplay.innerText = next;
        while (numbersContainer.firstChild) {
            numbersContainer.removeChild(numbersContainer.firstChild);
        }
        fallIntervals.forEach(interval => clearInterval(interval));
        fallIntervals = [];
    }

    function startGame() {
        gameInterval = setInterval(createNumber, 1000);
        startButton.textContent = 'Pause';
        startButton.removeEventListener('click', startGame);
        startButton.addEventListener('click', pauseGame);
        numbersContainer.querySelectorAll('.number').forEach(number => {
            const fallInterval = setInterval(function() {
                const topPos = number.offsetTop;
                if (topPos >= gameContainer.offsetHeight - 50) {
                    clearInterval(fallInterval);
                    removeNumber(number);
                } else {
                    number.style.top = topPos + 5 + 'px';
                    if (checkCollision(number)) {
                        clearInterval(fallInterval);
                        handleNumberClick({ target: number });
                    }
                }
            }, 1000 / 60);
            fallIntervals.push(fallInterval); 
        });
    }

    function pauseGame() {
        clearInterval(gameInterval);
        gameInterval = null;
        startButton.textContent = 'Start';
        startButton.removeEventListener('click', pauseGame);
        startButton.addEventListener('click', startGame);
        fallIntervals.forEach(interval => clearInterval(interval));
        fallIntervals = [];
    }

    function preventRightClick(event) {
        event.preventDefault();
    }
    
    function onWindowBlur() {
        pauseGame();
        window.removeEventListener('blur', onWindowBlur);
        window.addEventListener('focus', onWindowFocus);
    }

    function onWindowFocus() {
        window.removeEventListener('focus', onWindowFocus);
        window.addEventListener('blur', onWindowBlur);
    }


    // Event listeners
    document.addEventListener('contextmenu', preventRightClick);

    bucket.addEventListener('mousedown', startDragging);
    bucket.addEventListener('touchstart', startDragging);

    document.addEventListener('mousemove', moveBucket);
    document.addEventListener('touchmove', moveBucket);

    document.addEventListener('mouseup', stopDragging);
    document.addEventListener('touchend', stopDragging);

    startButton.addEventListener('click', startGame);
    window.addEventListener('blur', onWindowBlur);
    window.addEventListener('focus', onWindowFocus);
});

