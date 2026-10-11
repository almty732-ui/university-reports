const AI_WORKER_URL = "https://rough-darkness-a269.almty732.workers.dev";

// ===== تعبئة قائمة الجامعات تلقائياً =====
(function loadUniversities() {
  var select = document.getElementById("aiUniversity");
  if (!select) return;

  if (typeof IRAQ_UNIVERSITIES === "undefined") {
    select.innerHTML = '<option value="">خطأ في تحميل الجامعات</option>';
    return;
  }

  select.innerHTML = '<option value="">اختر الجامعة...</option>';

  Object.keys(IRAQ_UNIVERSITIES).forEach(function (groupName) {
    var group = document.createElement("optgroup");
    group.label = "── " + groupName + " ──";

    IRAQ_UNIVERSITIES[groupName].forEach(function (uni) {
      var opt = document.createElement("option");
      opt.value = uni;
      opt.textContent = uni;
      group.appendChild(opt);
    });

    select.appendChild(group);
  });
})();

// ===== الوظائف الرئيسية =====
(function () {
  var aiForm = document.getElementById("aiForm");
  var aiTopic = document.getElementById("aiTopic");
  var aiUniversity = document.getElementById("aiUniversity");
  var aiCollege = document.getElementById("aiCollege");
  var aiDept = document.getElementById("aiDept");
  var aiYear = document.getElementById("aiYear");
  var aiStudent = document.getElementById("aiStudent");
  var aiDoctor = document.getElementById("aiDoctor");
  var aiBtn = document.getElementById("aiBtn");
  var aiLoading = document.getElementById("aiLoading");
  var aiResult = document.getElementById("aiResult");
  var aiTitle = document.getElementById("aiTitle");
  var aiContent = document.getElementById("aiContent");
  var aiError = document.getElementById("aiError");
  var aiCopy = document.getElementById("aiCopy");
  var aiPrint = document.getElementById("aiPrint");
  var aiPdf = document.getElementById("aiPdf");

  var currentReports = [];
  var currentReport = "";
  var currentReportTitle = "";
  var coverInfo = {};

  // ===== إرسال الفورم =====
  aiForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    var topic = aiTopic.value.trim();
    if (!topic) return;

    coverInfo = {
      university: aiUniversity.value.trim(),
      college: aiCollege.value.trim(),
      dept: aiDept.value.trim(),
      year: aiYear.value.trim(),
      student: aiStudent.value.trim(),
      doctor: aiDoctor.value.trim(),
      topic: topic
    };

    aiError.classList.add("hidden");
    aiResult.classList.add("hidden");
    aiLoading.classList.remove("hidden");
    aiBtn.disabled = true;
    aiBtn.textContent = "⏳ جاري كتابة 3 تقارير... (1-2 دقيقة)";

    try {
      var response = await fetch(AI_WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic,
          dept: coverInfo.dept,
          year: coverInfo.year
        })
      });

      var data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "فشل الاتصال");
      }

      currentReports = data.reports || [];
      aiTitle.textContent = "📄 3 تقارير عن: " + topic;

      showReportList();
      aiResult.classList.remove("hidden");
      aiResult.scrollIntoView({ behavior: "smooth", block: "start" });

    } catch (err) {
      aiError.textContent = "❌ خطأ: " + err.message;
      aiError.classList.remove("hidden");
    } finally {
      aiLoading.classList.add("hidden");
      aiBtn.disabled = false;
      aiBtn.textContent = "🪄 اكتبلي التقارير";
    }
  });

  // ===== عرض قائمة التقارير =====
  function showReportList() {
    var html = '<p style="margin-bottom:15px;color:#64748b;">اختر واحد من التقارير:</p>';
    currentReports.forEach(function (r, i) {
      html += '<div class="report-option">';
      html += '<div class="report-option-header">';
      html += '<h3>📄 ' + r.title + '</h3>';
      html += '<button class="select-report-btn" data-index="' + i + '">عرض التقرير</button>';
      html += '</div>';
      html += '</div>';
    });
    aiContent.innerHTML = html;

    document.querySelectorAll(".select-report-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        showReport(parseInt(this.dataset.index));
      });
    });
  }

  // ===== الغلاف =====
  function makeCover() {
    var html = '<div class="report-cover">';
    html += '<div class="cover-border">';

    html += '<div class="cover-top">';
    html += '<div class="cover-logo">🎓</div>';
    html += '<h2 class="cover-university">' + (coverInfo.university || 'الجامعة') + '</h2>';
    html += '<h3 class="cover-college">' + (coverInfo.college || 'الكلية') + '</h3>';
    html += '<h4 class="cover-dept">' + (coverInfo.dept || 'القسم') + '</h4>';
    html += '</div>';

    html += '<div class="cover-divider">❖ ❖ ❖</div>';

    html += '<div class="cover-middle">';
    html += '<p class="cover-label">تقرير عن</p>';
    html += '<h1 class="cover-topic">' + (coverInfo.topic || 'التقرير') + '</h1>';
    html += '</div>';

    html += '<div class="cover-divider">❖ ❖ ❖</div>';

    html += '<div class="cover-bottom">';
    html += '<div class="cover-row"><span>إعداد الطالب:</span><strong>' + (coverInfo.student || '...') + '</strong></div>';
    if (coverInfo.doctor) {
      html += '<div class="cover-row"><span>إشراف:</span><strong>' + coverInfo.doctor + '</strong></div>';
    }
    html += '<div class="cover-row"><span>السنة الدراسية:</span><strong>' + (coverInfo.year || '2024-2025') + '</strong></div>';
    html += '</div>';

    html += '</div>';
    html += '</div>';
    return html;
  }

  // ===== عرض تقرير واحد =====
  function showReport(idx) {
    var r = currentReports[idx];
    if (!r) return;

    currentReport = r.content;
    currentReportTitle = r.title;

    var html = '<button class="back-btn" id="backBtn">← رجوع للخيارات</button>';
    html += makeCover();
    html += '<div class="report-content">';
    html += '<h2 style="color:#1e3a5f;margin:20px 0;">' + r.title + '</h2>';
    html += formatReport(r.content);
    html += '</div>';

    aiContent.innerHTML = html;

    document.getElementById("backBtn").addEventListener("click", showReportList);
  }

  // ===== تنسيق النص =====
  function formatReport(text) {
    if (!text) return "";
    var html = text
      .replace(/^### (.*$)/gm, "<h3>$1</h3>")
      .replace(/^## (.*$)/gm, "<h2>$1</h2>")
      .replace(/^# (.*$)/gm, "<h1>$1</h1>")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n\n/g, "</p><p>")
      .replace(/\n/g, "<br>");
    return "<p>" + html + "</p>";
  }

  // ===== زر النسخ =====
  aiCopy.addEventListener("click", function () {
    if (!currentReport) {
      alert("افتح تقرير أول — اضغط 'عرض التقرير'");
      return;
    }
    var fullText = "";
    fullText += coverInfo.university + "\n";
    fullText += coverInfo.college + "\n";
    fullText += coverInfo.dept + "\n\n";
    fullText += "تقرير عن: " + coverInfo.topic + "\n\n";
    fullText += "إعداد: " + coverInfo.student + "\n";
    if (coverInfo.doctor) fullText += "إشراف: " + coverInfo.doctor + "\n";
    fullText += "السنة: " + coverInfo.year + "\n\n";
    fullText += "═══════════════════\n\n";
    fullText += currentReport;

    navigator.clipboard.writeText(fullText).then(function () {
      aiCopy.textContent = "✅ تم النسخ";
      setTimeout(function () { aiCopy.textContent = "📋 نسخ"; }, 2000);
    });
  });

  // ===== زر الطباعة =====
  aiPrint.addEventListener("click", function () {
    if (!currentReport) {
      alert("افتح تقرير أول — اضغط 'عرض التقرير'");
      return;
    }
    var area = document.getElementById("print-area");
    area.innerHTML = makeCover() + '<div style="page-break-before:always;"></div>' + formatReport(currentReport);
    var oldTitle = document.title;
    document.title = coverInfo.topic + ' - ' + coverInfo.student;
    window.print();
    document.title = oldTitle;
  });

  // ===== زر تحميل PDF =====
  if (aiPdf) {
    aiPdf.addEventListener("click", function () {
      if (!currentReport) {
        alert("افتح تقرير أول — اضغط 'عرض التقرير'");
        return;
      }

      var element = document.createElement("div");
      element.style.padding = "30px";
      element.style.fontFamily = "Cairo, Arial, sans-serif";
      element.style.direction = "rtl";
      element.style.background = "white";
      element.style.color = "#000";
      element.style.fontSize = "14px";
      element.style.lineHeight = "1.8";

      var cover = document.createElement("div");
      cover.style.textAlign = "center";
      cover.style.border = "3px double #1e3a5f";
      cover.style.padding = "40px 20px";
      cover.style.marginBottom = "30px";
      cover.style.pageBreakAfter = "always";

      cover.innerHTML =
        '<h2 style="color:#1e3a5f;font-size:22px;margin:10px 0;">' + (coverInfo.university || '') + '</h2>' +
        '<h3 style="color:#1e5f5f;font-size:18px;margin:8px 0;">' + (coverInfo.college || '') + '</h3>' +
        '<h4 style="color:#64748b;font-size:16px;margin:8px 0 30px;">' + (coverInfo.dept || '') + '</h4>' +
        '<p style="font-size:16px;color:#64748b;margin-bottom:15px;">تقرير عن</p>' +
        '<h1 style="color:#764ba2;font-size:26px;margin:15px 0;border-top:2px solid #d4af37;border-bottom:2px solid #d4af37;padding:15px 0;">' + (coverInfo.topic || '') + '</h1>' +
        '<div style="text-align:right;margin-top:40px;font-size:15px;">' +
          '<p style="margin:10px 0;"><b>إعداد الطالب:</b> ' + (coverInfo.student || '') + '</p>' +
          (coverInfo.doctor ? '<p style="margin:10px 0;"><b>إشراف:</b> ' + coverInfo.doctor + '</p>' : '') +
          '<p style="margin:10px 0;"><b>السنة الدراسية:</b> ' + (coverInfo.year || '') + '</p>' +
        '</div>';

      element.appendChild(cover);

      var content = document.createElement("div");
      content.innerHTML = formatReport(currentReport);
      content.style.textAlign = "right";
      element.appendChild(content);

      var opt = {
        margin: [10, 10, 10, 10],
        filename: (coverInfo.topic || "report") + " - " + (coverInfo.student || "") + ".pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
      };

      aiPdf.textContent = "⏳ جاري التحميل...";
      aiPdf.disabled = true;

      html2pdf().set(opt).from(element).save().then(function () {
        aiPdf.textContent = "📥 تحميل PDF";
        aiPdf.disabled = false;
      }).catch(function (err) {
        console.error(err);
        alert("فشل التحميل: " + err.message);
        aiPdf.textContent = "📥 تحميل PDF";
        aiPdf.disabled = false;
      });
    });
  }
})();