let currentQuestionIndex = 0;
      let score = 0;
      let userAnswers = [];
      let questions = []; 

      // DOM ELEMENTS
      const startBtn = document.getElementById("start-btn");
      const startScreen = document.getElementById("start-menu");
      const quizContainer = document.getElementById("quiz-container");
      const questionsDiv = document.getElementById("questions");
      const optionsDiv = document.getElementById("options");
      const nextBtn = document.getElementById("next-btn");
      const prevBtn = document.getElementById("previous-btn");
      const resultsContainer = document.getElementById("results-container");
      const scoreDisplay = document.getElementById("score");
      const restartBtn = document.getElementById("restart-btn");
      const timerDisplay = document.getElementById('timer');
      const progressBar = document.getElementById("progressBar");
      const categorySelect = document.getElementById("category-select");

      function decodeHTML(html) {
          const txt = document.createElement('textarea');
          txt.innerHTML = html;
          return txt.value;
      }

      // FETCH QUESTIONS BASED ON SELECTED CATEGORY
      async function fetchQuestions() {
          try {
              // CHANGE BUTTON TEXT
              startBtn.textContent = "Loading...";
              startBtn.disabled = true;

              // GET CATEGORY ID FROM DROPDOWN
              const categoryId = categorySelect.value;
              
              // BUILD URL
              let url = 'https://opentdb.com/api.php?amount=10&type=multiple';
              if(categoryId !== 'any') {
                  url += `&category=${categoryId}`;
              }

              const res = await fetch(url);
              const data = await res.json();

              questions = data.results.map(loadedQ => {
                  const formattedQuestion = {
                      question: decodeHTML(loadedQ.question),
                      options: [...loadedQ.incorrect_answers.map(decodeHTML)],
                      answer: decodeHTML(loadedQ.correct_answer)
                  };
                  const randomIndex = Math.floor(Math.random() * 4);
                  formattedQuestion.options.splice(randomIndex, 0, formattedQuestion.answer);
                  return formattedQuestion;
              });

              // HIDE START MENU, SHOW QUIZ
              startBtn.textContent = "Start Quiz";
              startBtn.disabled = false;
              startScreen.style.display = "none";
              quizContainer.style.display = "flex";
              
              startTimer();
              loadQuestion();

          } catch (error) {
              console.error(error);
              startBtn.textContent = "Try Again";
              startBtn.disabled = false;
              alert("Failed to load questions. Please check your internet.");
          }
      }

      document.addEventListener("DOMContentLoaded", () => {
        setTimeout(() => {
            document.getElementById('loader').style.display = 'none';
            document.querySelector('.content').style.display = 'block';
            document.getElementById('year').textContent = new Date().getFullYear();
        }, 1500);
      });

      // START GAME LISTENER
      startBtn.addEventListener("click", () => {
          // Now fetch questions WHEN the user clicks start, so we know which category they picked
          fetchQuestions();
      });

      function loadQuestion() {
        const currentQuestion = questions[currentQuestionIndex];
        questionsDiv.textContent = `Q${currentQuestionIndex + 1}: ${currentQuestion.question}`;

        optionsDiv.innerHTML = "";

        currentQuestion.options.forEach(option => {
            const button = document.createElement("button");
            button.type = "button"; 
            button.textContent = option;
            button.addEventListener("click", () => selectOption(option, button));
            optionsDiv.appendChild(button);

            if (userAnswers[currentQuestionIndex] === option) {
                button.style.backgroundColor = "lightgreen";
            }
        });

        prevBtn.style.visibility = currentQuestionIndex === 0 ? "hidden" : "visible";

        if (currentQuestionIndex === questions.length - 1) {
            nextBtn.textContent = "Finish";
            nextBtn.style.backgroundColor = "green"; 
        } else {
            nextBtn.textContent = "Next";
            nextBtn.style.backgroundColor = "black";
        }

        const progressPercent = ((currentQuestionIndex + 1) / questions.length) * 100;
        progressBar.style.width = `${progressPercent}%`;
      }

      function selectOption(option, button) {
        userAnswers[currentQuestionIndex] = option;
        Array.from(optionsDiv.children).forEach(btn => btn.style.backgroundColor = "");
        button.style.backgroundColor = "lightgreen";
      }

      nextBtn.addEventListener("click", () => {
        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            loadQuestion();
        } else {
            showResults();
        }
      });

      prevBtn.addEventListener("click", () => {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            loadQuestion();
        }
      });

      function showResults() {
        clearInterval(intervalId);
        intervalId = null;

        quizContainer.style.display = "none";
        resultsContainer.style.display = "flex";

        score = 0;
        userAnswers.forEach((answer, index) => {
            if (answer === questions[index].answer) { score++; }
        });

        let percent = Math.round((score / questions.length) * 100);
        scoreDisplay.textContent = `${percent}%`;
        scoreDisplay.style.color = percent >= 70 ? "green" : "red";

        const reviewContainer = document.createElement('div');
        reviewContainer.id = "review-section";
        
        questions.forEach((q, index) => {
            const userAnswer = userAnswers[index];
            const isCorrect = userAnswer === q.answer;
            
            const reviewItem = document.createElement('p');
            reviewItem.innerHTML = `
                <strong>Q${index + 1}:</strong> ${q.question}<br>
                <span style="color: ${isCorrect ? 'green' : 'red'}">
                    Your Answer: ${userAnswer || "No Answer"} 
                    ${isCorrect ? '<i class="fas fa-check"></i>' : '<i class="fas fa-times"></i>'}
                </span><br>
                ${!isCorrect ? `<strong>Correct Answer: ${q.answer}</strong>` : ''}
            `;
            reviewContainer.appendChild(reviewItem);
        });

        const oldReview = document.getElementById('review-section');
        if(oldReview) oldReview.remove();
        resultsContainer.appendChild(reviewContainer);
      }

      restartBtn.addEventListener("click", () => {
        resultsContainer.style.display = "none";
        quizContainer.style.display = "none";
        startScreen.style.display = "flex";

        currentQuestionIndex = 0;
        userAnswers = [];
        score = 0;
        questions = [];
        
        // Reset timer logic
        clearInterval(intervalId);
        intervalId = null;
        totalSeconds = 60;
      });

      let intervalId = null;
      let totalSeconds = 60; 

      function updateTimerDisplay() {
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = totalSeconds % 60;
        timerDisplay.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12,20A7,7 0 0,1 5,13A7,7 0 0,1 12,6A7,7 0 0,1 19,13A7,7 0 0,1 12,20M19.03,7.39L20.45,5.97C20,5.46 19.55,5 19.04,4.56L17.62,6C16.07,4.74 14.12,4 12,4A9,9 0 0,0 3,13A9,9 0 0,0 12,22C17,22 21,17.97 21,13C21,10.88 20.26,8.93 19.03,7.39M11,14H13V8H11M15,1H9V3H15V1Z" /></svg>${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        if (totalSeconds <= 0) {
            clearInterval(intervalId);
            showResults();
        } else {
            totalSeconds--;
        }
      }

      function startTimer() {
        totalSeconds = 60; 
        if (!intervalId) intervalId = setInterval(updateTimerDisplay, 1000);
      }