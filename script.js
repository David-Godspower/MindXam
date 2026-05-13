document.addEventListener("DOMContentLoaded", () => {
    let currentQuestionIndex = 0;
    let questions = [];
    let userAnswers = [];
    let timeLeft = 120;
    let timerInterval;

    const elements = {
        startBtn: document.getElementById("start-btn"),
        startMenu: document.getElementById("start-menu"),
        quizContainer: document.getElementById("quiz-container"),
        questionsDiv: document.getElementById("questions"),
        optionsDiv: document.getElementById("options"),
        progressBar: document.getElementById("progressBar"),
        timeDisplay: document.getElementById("time-left"),
        resultsContainer: document.getElementById("results-container"),
        categorySelect: document.getElementById("category-select"),
        gradeBadge: document.getElementById("grade-badge"),
        scoreCircle: document.getElementById("score-circle")
    };

    elements.startBtn.onclick = async () => {
        const cat = elements.categorySelect.value;
        const url = `https://opentdb.com/api.php?amount=15&type=multiple${cat !== 'any' ? '&category='+cat : ''}`;
        elements.startBtn.innerText = "Initializing...";
        
        try {
            const res = await fetch(url);
            const data = await res.json();
            questions = data.results.map(q => ({
                question: decodeHTML(q.question),
                options: [...q.incorrect_answers, q.correct_answer].map(decodeHTML).sort(() => Math.random() - 0.5),
                answer: decodeHTML(q.correct_answer)
            }));
            elements.startMenu.style.display = "none";
            elements.quizContainer.style.display = "block";
            loadQuestion();
            startTimer();
        } catch (e) {
            elements.startBtn.innerText = "Try Again";
        }
    };

    function loadQuestion() {
        const q = questions[currentQuestionIndex];
        elements.questionsDiv.innerText = `Q${currentQuestionIndex + 1}: ${q.question}`;
        elements.optionsDiv.innerHTML = "";
        
        q.options.forEach(opt => {
            const btn = document.createElement("button");
            btn.innerText = opt;
            if (userAnswers[currentQuestionIndex] === opt) btn.classList.add("selected");

            btn.onclick = () => {
                Array.from(elements.optionsDiv.children).forEach(b => b.classList.remove("selected"));
                btn.classList.add("selected");
                userAnswers[currentQuestionIndex] = opt;
                setTimeout(nextQuestion, 400);
            };
            elements.optionsDiv.appendChild(btn);
        });

        elements.progressBar.style.width = `${((currentQuestionIndex + 1) / questions.length) * 100}%`;
        elements.timeDisplay.parentElement.style.color = timeLeft <= 10 ? "#ef4444" : "var(--accent)";
    }

    function nextQuestion() {
        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            loadQuestion();
        } else {
            showResults();
        }
    }

    function showResults() {
        clearInterval(timerInterval);
        elements.quizContainer.style.display = "none";
        elements.resultsContainer.style.display = "block";
        
        const score = userAnswers.filter((ans, i) => ans === questions[i].answer).length;
        const percent = Math.round((score / questions.length) * 100);
        document.getElementById("score-percent").innerText = `${percent}%`;
        
        let grade, color;
        if (percent >= 70) { grade = "A"; color = "#22c55e"; }
        else if (percent >= 60) { grade = "B"; color = "#38bdf8"; }
        else if (percent >= 50) { grade = "C"; color = "#eab308"; }
        else if (percent >= 45) { grade = "D"; color = "#f97316"; }
        else if (percent >= 40) { grade = "E"; color = "#f43f5e"; }
        else { grade = "F"; color = "#ef4444"; }

        elements.gradeBadge.innerText = `Grade: ${grade}`;
        elements.gradeBadge.style.color = color;
        elements.scoreCircle.style.borderColor = color;
        
        if (percent >= 70) confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }

    function startTimer() {
        timerInterval = setInterval(() => {
            timeLeft--;
            const m = Math.floor(timeLeft / 60);
            const s = timeLeft % 60;
            elements.timeDisplay.innerText = `${m}:${s.toString().padStart(2, '0')}`;
            if (timeLeft <= 0) showResults();
        }, 1000);
    }

    function decodeHTML(html) {
        const txt = document.createElement("textarea");
        txt.innerHTML = html;
        return txt.value;
    }

    document.getElementById("next-btn").onclick = nextQuestion;
    document.getElementById("previous-btn").onclick = () => {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            loadQuestion();
        }
    };
    document.getElementById("restart-btn").onclick = () => location.reload();
});

document.getElementById("current-year").innerText = new Date().getFullYear();