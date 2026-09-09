(function () {
  "use strict";

  function init() {
    var pages = Array.prototype.slice.call(document.querySelectorAll(".page"));
    var prevBtn = document.getElementById("prevBtn");
    var nextBtn = document.getElementById("nextBtn");
    var pageIndicator = document.getElementById("pageIndicator");
    var startBtn = document.getElementById("startBtn");
    var currentPage = 0;

    var colorActivity = document.getElementById("colorActivity");
    var colorFeedback = document.getElementById("colorFeedback");
    var colorCompletionMessage = document.getElementById("colorCompletionMessage");

    function resetColorActivity() {
      if (!colorActivity) return;
      colorActivity.querySelectorAll(".hotspot-row").forEach(function (row) {
        row.classList.remove("completed");
        row.querySelectorAll(".image-hotspot").forEach(function (choice) {
          choice.classList.remove("correct", "wrong");
        });
      });
      if (colorCompletionMessage) colorCompletionMessage.hidden = true;
      if (colorFeedback) {
        colorFeedback.textContent = "";
        colorFeedback.className = "color-feedback";
      }
    }

    function resetShapeActivity() {
      var activity = document.getElementById("shapeActivity");
      if (!activity) return;
      activity.querySelectorAll(".shape-hotspot").forEach(function (button) {
        button.classList.remove("selected", "matched", "wrong");
      });
      var cover = document.getElementById("shapeCompletionCover");
      if (cover) cover.classList.remove("revealed");
      var feedback = document.getElementById("shapeFeedback");
      if (feedback) {
        feedback.textContent = "";
        feedback.className = "shape-feedback";
      }
      selectedShape = null;
    }

    function showPage(index) {
      currentPage = Math.max(0, Math.min(index, pages.length - 1));

      pages.forEach(function (page, i) {
        var active = i === currentPage;
        page.classList.toggle("active", active);
        page.setAttribute("aria-hidden", active ? "false" : "true");
      });

      if (currentPage !== 2) resetColorActivity();
      if (currentPage !== 3) resetShapeActivity();
      if (currentPage !== 4) resetTracing();
      if (currentPage !== 5) resetColorCountActivity();
      if (currentPage !== 6) resetQuiz();

      if (prevBtn) prevBtn.disabled = currentPage === 0;

      // Interactive activity pages must be completed before moving forward.
      // Page 3 = index 2, Page 4 = index 3.
      var pageLocked = false;
      if (currentPage === 2) {
        pageLocked = !colorRowsComplete();
      } else if (currentPage === 3) {
        pageLocked = !shapeRowsComplete();
      } else if (currentPage === 4) {
        pageLocked = !tracingComplete();
      } else if (currentPage === 5) {
        pageLocked = !colorCountComplete();
      } else if (currentPage === 6) {
        pageLocked = !quizComplete();
      }

      if (nextBtn) {
        nextBtn.disabled = currentPage === pages.length - 1 || pageLocked;
        nextBtn.title = pageLocked ? "Complete this activity to continue." : "";
      }
      if (currentPage === 6) updateQuizNextLock();

      if (pageIndicator) pageIndicator.textContent = "Page " + (currentPage + 1) + " of " + pages.length;

      window.scrollTo(0, 0);
    }

    if (prevBtn) prevBtn.addEventListener("click", function () { showPage(currentPage - 1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { showPage(currentPage + 1); });
    if (startBtn) startBtn.addEventListener("click", function () { showPage(1); });

    document.addEventListener("keydown", function (event) {
      var tag = document.activeElement && document.activeElement.tagName
        ? document.activeElement.tagName.toLowerCase() : "";
      if (tag === "input" || tag === "textarea" || tag === "select") return;
      if (event.key === "ArrowRight") {
        if (!nextBtn || !nextBtn.disabled) showPage(currentPage + 1);
      }
      if (event.key === "ArrowLeft") {
        showPage(currentPage - 1);
      }
    });

    if (colorActivity) {
      colorActivity.addEventListener("click", function (event) {
        var choice = event.target.closest(".image-hotspot");
        if (!choice) return;
        var row = choice.closest(".hotspot-row");
        if (!row || row.classList.contains("completed")) return;

        var target = row.getAttribute("data-target");
        var selectedColor = choice.getAttribute("data-color");
        row.querySelectorAll(".image-hotspot").forEach(function (item) {
          item.classList.remove("wrong");
        });

        if (selectedColor === target) {
          choice.classList.add("correct");
          row.classList.add("completed");
          if (colorRowsComplete()) {
            if (colorCompletionMessage) colorCompletionMessage.hidden = false;
            if (colorFeedback) {
              colorFeedback.textContent = "";
              colorFeedback.className = "color-feedback";
            }
            if (nextBtn) nextBtn.disabled = false;
          }
        } else {
          choice.classList.add("wrong");
          if (colorFeedback) {
            colorFeedback.textContent = "Try again! 😊";
            colorFeedback.className = "color-feedback try";
          }
        }
      });
    }

    function colorRowsComplete() {
      var rows = document.querySelectorAll("#colorActivity .hotspot-row");
      return rows.length === 4 && Array.prototype.every.call(rows, function (row) {
        return row.classList.contains("completed");
      });
    }

    var shapeActivity = document.getElementById("shapeActivity");
    var shapeFeedback = document.getElementById("shapeFeedback");
    var shapeCompletionCover = document.getElementById("shapeCompletionCover");
    var selectedShape = null;

    function shapeRowsComplete() {
      if (!shapeActivity) return false;
      var matched = shapeActivity.querySelectorAll(".shape-hotspot.matched");
      return matched.length === 8;
    }

    if (shapeActivity) {
      shapeActivity.addEventListener("click", function (event) {
        var button = event.target.closest(".shape-hotspot");
        if (!button || button.classList.contains("matched")) return;

        if (!selectedShape) {
          selectedShape = button;
          button.classList.add("selected");
          if (shapeFeedback) {
            shapeFeedback.textContent = "Now tap the matching shape. 👆";
            shapeFeedback.className = "shape-feedback";
          }
          return;
        }

        if (selectedShape === button) return;

        if (selectedShape.getAttribute("data-shape") === button.getAttribute("data-shape")) {
          selectedShape.classList.remove("selected");
          selectedShape.classList.add("matched");
          button.classList.add("matched");
          selectedShape = null;

          if (shapeFeedback) {
            shapeFeedback.textContent = "";
            shapeFeedback.className = "shape-feedback";
          }

          var matched = shapeActivity.querySelectorAll(".shape-hotspot.matched");
          if (matched.length === 8 && shapeCompletionCover) {
            shapeCompletionCover.classList.add("revealed");
            if (nextBtn) nextBtn.disabled = false;
          }
        } else {
          button.classList.add("wrong");
          if (shapeFeedback) {
            shapeFeedback.textContent = "Try again! Find the same shape. 😊";
            shapeFeedback.className = "shape-feedback try";
          }
          window.setTimeout(function () { button.classList.remove("wrong"); }, 500);
        }
      });
    }


    // Page 5: Digital tracing. Pointer Events support mouse, trackpad, finger, and stylus.
    var tracingActivity = document.getElementById("tracingActivity");
    var traceComplete = document.getElementById("traceComplete");
    var traceFeedback = document.getElementById("traceFeedback");
    var traceCanvases = tracingActivity
      ? Array.prototype.slice.call(tracingActivity.querySelectorAll(".trace-canvas"))
      : [];
    var traceState = {};

    var traceGuides = {
      triangle: function (t) {
        var pts = [];
        function add(a, b) {
          for (var i = 0; i <= 30; i++) {
            var u = i / 30;
            pts.push({
              x: a.x + (b.x - a.x) * u,
              y: a.y + (b.y - a.y) * u
            });
          }
        }
        add({x:0.50,y:0.04},{x:0.05,y:0.92});
        add({x:0.05,y:0.92},{x:0.95,y:0.92});
        add({x:0.95,y:0.92},{x:0.50,y:0.04});
        return pts;
      },
      square: function () {
        var pts = [];
        function add(a,b) {
          for (var i=0;i<=30;i++) {
            var u=i/30;
            pts.push({x:a.x+(b.x-a.x)*u,y:a.y+(b.y-a.y)*u});
          }
        }
        add({x:.08,y:.08},{x:.92,y:.08});
        add({x:.92,y:.08},{x:.92,y:.92});
        add({x:.92,y:.92},{x:.08,y:.92});
        add({x:.08,y:.92},{x:.08,y:.08});
        return pts;
      },
      circle: function () {
        var pts=[];
        for (var i=0;i<=120;i++) {
          var a=(Math.PI*2*i)/120;
          pts.push({x:.5+.43*Math.cos(a),y:.5+.43*Math.sin(a)});
        }
        return pts;
      },
      star: function () {
        var pts=[];
        for (var i=0;i<=100;i++) {
          var a=-Math.PI/2+(Math.PI*2*i)/100;
          var r=(i%2===0)?0.46:0.20;
          pts.push({x:.5+r*Math.cos(a),y:.5+r*Math.sin(a)});
        }
        return pts;
      }
    };

    function setupTraceCanvas(canvas) {
      var shape = canvas.getAttribute("data-shape");
      var rect = canvas.getBoundingClientRect();
      var dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));

      var ctx = canvas.getContext("2d");
      ctx.setTransform(dpr,0,0,dpr,0,0);
      ctx.lineWidth = Math.max(4, Math.min(7, rect.width * 0.018));
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      traceState[shape] = {
        canvas: canvas,
        ctx: ctx,
        drawing: false,
        points: [],
        done: false
      };
    }

    function resizeTraceCanvases() {
      traceCanvases.forEach(function(canvas) {
        var state = traceState[canvas.getAttribute("data-shape")];
        if (state && state.points.length) return;
        setupTraceCanvas(canvas);
      });
    }

    function drawPoint(state, p) {
      var ctx = state.ctx;
      if (!state.last) {
        ctx.beginPath();
        ctx.moveTo(p.x,p.y);
      } else {
        ctx.beginPath();
        ctx.moveTo(state.last.x,state.last.y);
        ctx.lineTo(p.x,p.y);
        ctx.stroke();
      }
      state.last = p;
      state.points.push(p);
    }

    function traceScore(state) {
      var shape = state.canvas.getAttribute("data-shape");
      var guide = traceGuides[shape]();
      var minimumPoints = shape === "star" ? 12 : 25;
      if (!guide.length || state.points.length < minimumPoints) return 0;

      var w = state.canvas.clientWidth;
      var h = state.canvas.clientHeight;

      // Preschool-friendly, but still checks whether the child actually
      // followed the dotted path rather than simply drawing anywhere nearby.
      var tolerance = shape === "star"
        ? Math.max(24, Math.min(w,h) * 0.19)
        : Math.max(15, Math.min(w,h) * 0.12);

      var covered = 0;
      guide.forEach(function(g) {
        var gx = g.x * w;
        var gy = g.y * h;
        var found = false;

        for (var i = 0; i < state.points.length; i++) {
          var dx = state.points[i].x - gx;
          var dy = state.points[i].y - gy;
          if (Math.sqrt(dx * dx + dy * dy) <= tolerance) {
            found = true;
            break;
          }
        }

        if (found) covered++;
      });

      return covered / guide.length;
    }

    function tracingComplete() {
      if (!traceCanvases || traceCanvases.length !== 4) return false;
      return traceCanvases.every(function (canvas) {
        var state = traceState[canvas.getAttribute("data-shape")];
        return state && state.done;
      });
    }

    function finishTrace(state) {
      state.done = true;
      state.ctx.save();
      state.ctx.strokeStyle = "#238636";
      state.ctx.lineWidth = Math.max(5, Math.min(8, state.canvas.clientWidth * 0.02));
      state.ctx.restore();

      if (traceFeedback) {
        traceFeedback.textContent = "Great job! Keep going! ⭐";
        traceFeedback.className = "trace-feedback";
      }

      if (tracingComplete() && traceComplete) {
        traceComplete.hidden = false;
        if (nextBtn) nextBtn.disabled = false;
      }
    }

    function resetTracing() {
      traceCanvases.forEach(function(canvas) {
        setupTraceCanvas(canvas);
      });
      Object.keys(traceState).forEach(function(key) {
        var s=traceState[key];
        s.ctx.clearRect(0,0,s.canvas.clientWidth,s.canvas.clientHeight);
        s.points=[];
        s.last=null;
        s.drawing=false;
        s.done=false;
      });
      if (traceComplete) traceComplete.hidden = true;
      if (traceFeedback) {
        traceFeedback.textContent = "Use your finger, stylus, mouse, or trackpad to trace each shape.";
        traceFeedback.className = "trace-feedback";
      }
    }

    traceCanvases.forEach(function(canvas) {
      setupTraceCanvas(canvas);

      canvas.addEventListener("pointerdown", function(event) {
        var state=traceState[canvas.getAttribute("data-shape")];
        if (!state || state.done) return;
        event.preventDefault();
        canvas.setPointerCapture(event.pointerId);
        state.drawing=true;
        state.last=null;
        var r=canvas.getBoundingClientRect();
        drawPoint(state,{x:event.clientX-r.left,y:event.clientY-r.top});
      });

      canvas.addEventListener("pointermove", function(event) {
        var state=traceState[canvas.getAttribute("data-shape")];
        if (!state || !state.drawing || state.done) return;
        event.preventDefault();
        var r=canvas.getBoundingClientRect();
        drawPoint(state,{x:event.clientX-r.left,y:event.clientY-r.top});
      });

      function endPointer(event) {
        var state=traceState[canvas.getAttribute("data-shape")];
        if (!state || !state.drawing || state.done) return;
        event.preventDefault();
        state.drawing=false;
        state.last=null;

        var requiredScore = state.canvas.getAttribute("data-shape") === "star" ? 0.65 : 0.75;
        if (traceScore(state) >= requiredScore) {
          finishTrace(state);
        } else if (traceFeedback) {
          traceFeedback.textContent = "Not quite yet. Follow the dotted line more closely and try again. 😊";
          traceFeedback.className = "trace-feedback try";
        }
      }

      canvas.addEventListener("pointerup", endPointer);
      canvas.addEventListener("pointercancel", endPointer);
    });


    // Page 6: Color & Count - choose any four of six actual shapes.
    var coloringActivity = document.getElementById("coloringActivity");
    var colorPalette = document.getElementById("colorPalette");
    var colorCountFeedback = document.getElementById("colorCountFeedback");
    var colorCountResult = document.getElementById("colorCountResult");
    var shapeCountInput = document.getElementById("shapeCountInput");
    var checkCountBtn = document.getElementById("checkCountBtn");
    var selectedFill = null;

    function resetColorCountActivity() {
      selectedFill = null;

      if (colorPalette) {
        colorPalette.querySelectorAll(".palette-color").forEach(function (button) {
          button.classList.remove("selected");
        });
      }

      if (coloringActivity) {
        coloringActivity.querySelectorAll(".paint-shape").forEach(function (shape) {
          shape.classList.remove("colored");
          shape.style.fill = "transparent";
          shape.style.fillOpacity = "0";
          shape.style.stroke = "transparent";
        });
      }

      if (shapeCountInput) shapeCountInput.value = "";
      if (colorCountResult) colorCountResult.hidden = true;

      if (colorCountFeedback) {
        colorCountFeedback.textContent = "Choose a color, then tap any shape to color it.";
        colorCountFeedback.className = "color-count-feedback";
      }
    }

    function coloredShapeCount() {
      if (!coloringActivity) return 0;
      return coloringActivity.querySelectorAll(".paint-shape.colored").length;
    }

    function colorCountComplete() {
      return coloredShapeCount() === 4 &&
        shapeCountInput &&
        String(shapeCountInput.value).trim() === "4";
    }

    if (colorPalette) {
      colorPalette.addEventListener("click", function (event) {
        var button = event.target.closest(".palette-color");
        if (!button) return;

        selectedFill = button.getAttribute("data-fill");
        colorPalette.querySelectorAll(".palette-color").forEach(function (item) {
          item.classList.remove("selected");
        });
        button.classList.add("selected");

        if (colorCountFeedback) {
          colorCountFeedback.textContent = "Now tap any shape to color it. 🎨";
          colorCountFeedback.className = "color-count-feedback";
        }
      });
    }

    if (coloringActivity) {
      coloringActivity.addEventListener("click", function (event) {
        var shape = event.target.closest(".paint-shape");
        if (!shape) return;

        if (!selectedFill) {
          if (colorCountFeedback) {
            colorCountFeedback.textContent = "Choose a color first. 🎨";
          }
          return;
        }

        var alreadyColored = shape.classList.contains("colored");
        var count = coloredShapeCount();

        if (!alreadyColored && count >= 4) {
          if (colorCountFeedback) {
            colorCountFeedback.textContent = "You already colored 4 shapes. Count them and enter 4 below. 🔢";
          }
          return;
        }

        shape.classList.add("colored");
        shape.style.fill = selectedFill;
        shape.style.fillOpacity = "0.55";
        shape.style.stroke = selectedFill;

        count = coloredShapeCount();

        if (colorCountFeedback) {
          if (count < 4) {
            colorCountFeedback.textContent = count + " of 4 shapes colored. ⭐";
          } else {
            colorCountFeedback.textContent = "Great! You colored 4 shapes. Now enter 4 below and press Check. 🔢";
          }
          colorCountFeedback.className = "color-count-feedback";
        }
      });
    }

    if (checkCountBtn) {
      checkCountBtn.addEventListener("click", function () {
        var count = coloredShapeCount();
        var answer = shapeCountInput ? String(shapeCountInput.value).trim() : "";

        if (count !== 4) {
          if (colorCountFeedback) {
            colorCountFeedback.textContent = "Color exactly 4 shapes first. 🎨";
            colorCountFeedback.className = "color-count-feedback";
          }
          return;
        }

        if (answer === "4") {
          if (colorCountResult) colorCountResult.hidden = false;
          if (colorCountFeedback) {
            colorCountFeedback.textContent = "Correct! You colored 4 shapes and counted them. 🎉";
            colorCountFeedback.className = "color-count-feedback";
          }
          if (nextBtn) nextBtn.disabled = false;
        } else {
          if (colorCountFeedback) {
            colorCountFeedback.textContent = "Try again! Count the shapes you colored. 😊";
            colorCountFeedback.className = "color-count-feedback";
          }
        }
      });
    }

    // Page 7: Original Robert booklet quiz - same questions and choices.
    var quizActivity = document.getElementById("quizActivity");
    var quizHotspots = quizActivity ? Array.from(quizActivity.querySelectorAll(".quiz-hotspot")) : [];
    var quizProgress = document.getElementById("quizProgress");
    var quizFeedback = document.getElementById("quizFeedback");
    var quizResult = document.getElementById("quizResult");

    var originalQuiz = {
      1: { answer:"Red", prompt:"What color is the apple?" },
      2: { answer:"Triangle", prompt:"What shape is this?" },
      3: { answer:"Yellow", prompt:"What color is the sun?" },
      4: { answer:"Circle", prompt:"What shape is this?" },
      5: { answer:"Green", prompt:"What color is the leaf?" }
    };
    var quizAnswered = {};
    var quizScore = 0;
    var quizFinished = false;

    function updateQuizNextLock() {
      if (nextBtn && currentPage === 6) {
        nextBtn.disabled = !quizFinished;
        nextBtn.title = quizFinished ? "" : "Answer all 5 questions to continue.";
      }
    }

    function resetQuiz() {
      quizAnswered = {};
      quizScore = 0;
      quizFinished = false;

      quizHotspots.forEach(function(btn) {
        btn.classList.remove("selected","correct","wrong");
        btn.disabled = false;
      });

      if (quizResult) quizResult.hidden = true;
      if (quizProgress) quizProgress.textContent = "⭐ Answer all 5 questions.";
      if (quizFeedback) {
        quizFeedback.textContent = "Tap an answer for Question 1.";
        quizFeedback.className = "quiz-feedback-bar";
      }
      updateQuizNextLock();
    }

    function answerOriginalQuiz(button) {
      if (quizFinished) return;

      var q = button.getAttribute("data-q");
      var answer = button.getAttribute("data-answer");

      // Do not allow changing an already answered question.
      if (quizAnswered[q]) return;

      quizAnswered[q] = answer;
      button.classList.add("selected");

      var correct = answer === originalQuiz[q].answer;
      if (correct) {
        quizScore++;
        button.classList.add("correct");
      } else {
        button.classList.add("wrong");
        // Show the correct choice visually without changing the original text.
        quizHotspots.forEach(function(other) {
          if (other.getAttribute("data-q") === q &&
              other.getAttribute("data-answer") === originalQuiz[q].answer) {
            other.classList.add("correct");
          }
        });
      }

      // Disable all choices for this question after the selection.
      quizHotspots.forEach(function(other) {
        if (other.getAttribute("data-q") === q) other.disabled = true;
      });

      var totalAnswered = Object.keys(quizAnswered).length;

      if (quizFeedback) {
        quizFeedback.textContent = correct
          ? "Correct! ⭐ Question " + q + " is complete."
          : "Good try! 😊 The correct answer is " + originalQuiz[q].answer + ".";
        quizFeedback.className = "quiz-feedback-bar " + (correct ? "correct" : "wrong");
      }

      if (totalAnswered === 5) {
        quizFinished = true;
        if (quizProgress) quizProgress.textContent = "You finished the quiz! 🎉";
        if (quizResult) {
          quizResult.textContent = "⭐ You got " + quizScore + " out of 5 correct!";
          quizResult.hidden = false;
        }
        updateQuizNextLock();
      } else {
        if (quizProgress) {
          quizProgress.textContent = totalAnswered + " of 5 questions answered. ⭐";
        }
        updateQuizNextLock();
      }
    }

    quizHotspots.forEach(function(button) {
      button.addEventListener("click", function() {
        answerOriginalQuiz(button);
      });
    });

    function quizComplete() {
      return quizFinished;
    }

    var certificateDate = document.getElementById("certificateDate");
    var learnerName = document.getElementById("learnerName");
    var printCertificateBtn = document.getElementById("printCertificateBtn");

    if (certificateDate && !certificateDate.value) {
      var now = new Date();
      certificateDate.value =
        now.getFullYear() + "-" +
        String(now.getMonth()+1).padStart(2,"0") + "-" +
        String(now.getDate()).padStart(2,"0");
    }

    if (printCertificateBtn) {
      printCertificateBtn.addEventListener("click", function() {
        window.print();
      });
    }


    if (certificateDate && !certificateDate.value) {
      var now = new Date();
      certificateDate.value = now.getFullYear() + "-" +
        String(now.getMonth() + 1).padStart(2, "0") + "-" +
        String(now.getDate()).padStart(2, "0");
    }

    showPage(0);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
