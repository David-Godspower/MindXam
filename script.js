document.addEventListener("DOMContentLoaded", () => {

  let currentQuestionIndex = 0;
  let score = 0;
  let userAnswers = [];
  let questions = [];
  let selectedCategory = "Any Category";
  let isAnswered = false;

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
  const timerDisplay = document.getElementById("timer");
  const progressBar = document.getElementById("progressBar");
  const categorySelect = document.getElementById("category-select");
  const categoryDisplay = document.getElementById("category-display");

  // LOADER LOGIC
  const loader = document.getElementById("loader");
  if (loader) {
    setTimeout(() => {
      loader.style.display = "none";
      document.querySelector(".content").style.display = "block";
      const yearSpan = document.getElementById("year");
      if (yearSpan) yearSpan.textContent = new Date().getFullYear();
    }, 1000);
  }

  function decodeHTML(html) {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  }

  // FETCH QUESTIONS
  async function fetchQuestions() {
    try {
      console.log("Fetching questions..."); // Debug log
      startBtn.textContent = "Loading...";
      startBtn.disabled = true;

      // Get the selected category name
      const selectedOption =
        categorySelect.options[categorySelect.selectedIndex];
      selectedCategory = selectedOption.textContent;

      let url = "https://opentdb.com/api.php?amount=15&type=multiple";

      // Check if dropdown exists before reading value
      if (categorySelect && categorySelect.value !== "any") {
        url += `&category=${categorySelect.value}`;
      }

      const res = await fetch(url);
      console.log("API Response status:", res.status); // Debug log

      if (!res.ok) {
        throw new Error(`API Error: ${res.status}`);
      }

      const data = await res.json();
      console.log("Data received:", data); // Debug log

      if (data.response_code === 1 || data.results.length === 0) {
        alert(
          "Sorry, not enough questions in this category! Please pick another one.",
        );
        startBtn.textContent = "Start Quiz";
        startBtn.disabled = false;
        return;
      }

      questions = data.results.map((loadedQ) => {
        const formattedQuestion = {
          question: decodeHTML(loadedQ.question),
          options: [...loadedQ.incorrect_answers.map(decodeHTML)],
          answer: decodeHTML(loadedQ.correct_answer),
        };
        const randomIndex = Math.floor(Math.random() * 4);
        formattedQuestion.options.splice(
          randomIndex,
          0,
          formattedQuestion.answer,
        );
        return formattedQuestion;
      });

      startBtn.textContent = "Start Quiz";
      startBtn.disabled = false;
      startScreen.style.display = "none";
      quizContainer.style.display = "flex";

      // Display the category
      if (categoryDisplay) {
        categoryDisplay.textContent = selectedCategory;
      }

      startTimer();
      loadQuestion();
    } catch (error) {
      console.error("Fetch failed:", error);
      startBtn.textContent = "Try Again";
      startBtn.disabled = false;
      alert(`Error: ${error.message}. Check your internet connection.`);
    }
  }

  // EVENT LISTENERS
  if (startBtn) {
    startBtn.addEventListener("click", () => {
      fetchQuestions();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        loadQuestion();
      } else {
        showResults();
      }
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion();
      }
    });
  }

  if (restartBtn) {
    restartBtn.addEventListener("click", () => {
      resultsContainer.style.display = "none";
      quizContainer.style.display = "none";
      startScreen.style.display = "flex";

      currentQuestionIndex = 0;
      userAnswers = [];
      score = 0;
      questions = [];
      selectedCategory = "Any Category";
      isAnswered = false;

      if (categoryDisplay) {
        categoryDisplay.textContent = "";
      }

      clearInterval(intervalId);
      intervalId = null;
      totalSeconds = 120;
    });
  }

  // GAME FUNCTIONS
  function loadQuestion() {
    isAnswered = false;
    const currentQuestion = questions[currentQuestionIndex];
    questionsDiv.textContent = `Q${currentQuestionIndex + 1}: ${currentQuestion.question}`;

    optionsDiv.innerHTML = "";

    currentQuestion.options.forEach((option) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = option;
      button.addEventListener("click", () => selectOption(option, button));
      optionsDiv.appendChild(button);

      if (userAnswers[currentQuestionIndex] === option) {
        button.style.backgroundColor = "lightgreen";
      }
    });

    prevBtn.style.visibility =
      currentQuestionIndex === 0 ? "hidden" : "visible";

    if (currentQuestionIndex === questions.length - 1) {
      nextBtn.textContent = "Finish";
      nextBtn.style.backgroundColor = "green";
    } else {
      nextBtn.textContent = "Next";
      nextBtn.style.backgroundColor = "black";
    }

    const progressPercent =
      ((currentQuestionIndex + 1) / questions.length) * 100;
    progressBar.style.width = `${progressPercent}%`;
  }

  function selectOption(option, button) {
    if (isAnswered) return;
    isAnswered = true;

    userAnswers[currentQuestionIndex] = option;
    Array.from(optionsDiv.children).forEach(
      (btn) => (btn.style.backgroundColor = ""),
    );
    button.style.backgroundColor = "lightgreen";

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        loadQuestion();
      } else {
        showResults();
      }
    }, 700);
  }

  function showResults() {
    clearInterval(intervalId);
    intervalId = null;

    quizContainer.style.display = "none";
    resultsContainer.style.display = "flex";

    score = 0;
    userAnswers.forEach((answer, index) => {
      if (answer === questions[index].answer) {
        score++;
      }
    });

    let percent = Math.round((score / questions.length) * 100);
    let grade = "";
    let remark = "";
    scoreDisplay.textContent = `${percent}%`;
    scoreDisplay.style.color = percent >= 70 ? "green" : "red";
    if (percent >= 70){
        grade = "A"
        remark = "Excellent"
        scoreDisplay.style.color = "green";
    } else if(60 <= percent && percent <= 69 ){
         grade = "B"
        remark = "Good"
        scoreDisplay.style.color = "green";
    } else if(50 <= percent && percent <= 59 ){
         grade = "C"
        remark = "Average"
        scoreDisplay.style.color = "orange";
    } else if(45 <= percent && percent <= 49 ){
         grade = "D"
        remark = "Fair"
        scoreDisplay.style.color = "orange-red";
    } else if(40 <= percent && percent <= 44 ){
         grade = "E"
        remark = "Bad"
        scoreDisplay.style.color = "orange-red";
    } else{
        grade = "F"
        remark = "Poor"
        scoreDisplay.style.color = "red";
    }
    // Display both percentage and label
    scoreDisplay.textContent = `Score = ${percent}% \n Grade = ${grade} \n Remark = ${remark}`;
    const reviewContainer = document.createElement("div");
    reviewContainer.id = "review-section";

    questions.forEach((q, index) => {
      const userAnswer = userAnswers[index];
      const isCorrect = userAnswer === q.answer;

      const reviewItem = document.createElement("p");
      reviewItem.innerHTML = `
                <strong>Q${index + 1}:</strong> ${q.question}<br>
                <span style="color: ${isCorrect ? "green" : "red"}">
                    Your Answer: ${userAnswer || "No Answer"} 
                    ${isCorrect ? '<i class="fas fa-check"></i>' : '<i class="fas fa-times"></i>'}
                </span><br>
                ${!isCorrect ? `<strong>Correct Answer: ${q.answer}</strong>` : ""}
            `;
      reviewContainer.appendChild(reviewItem);
    });

    const oldReview = document.getElementById("review-section");
    if (oldReview) oldReview.remove();
    resultsContainer.appendChild(reviewContainer);
  }

  let intervalId = null;
  let totalSeconds = 120;

  function updateTimerDisplay() {
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;
    if (timerDisplay) {
      timerDisplay.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12,20A7,7 0 0,1 5,13A7,7 0 0,1 12,6A7,7 0 0,1 19,13A7,7 0 0,1 12,20M19.03,7.39L20.45,5.97C20,5.46 19.55,5 19.04,4.56L17.62,6C16.07,4.74 14.12,4 12,4A9,9 0 0,0 3,13A9,9 0 0,0 12,22C17,22 21,17.97 21,13C21,10.88 20.26,8.93 19.03,7.39M11,14H13V8H11M15,1H9V3H15V1Z" /></svg>${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }

    if (totalSeconds <= 0) {
      clearInterval(intervalId);
      showResults();
    } else {
      totalSeconds--;
    }
  }

  function startTimer() {
    totalSeconds = 120;
    if (!intervalId) intervalId = setInterval(updateTimerDisplay, 1000);
  }
}); // END OF DOMContentLoaded
