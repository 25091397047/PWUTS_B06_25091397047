$(function () {
  const $content = $("#pageContent");
  const homeHTML = $content.html();
  let year = new Date().getFullYear();
  let month = new Date().getMonth();
  let selectedDate = today();
  let currentPage = "home";

  // Data booking contoh untuk demonstrasi frontend. Belum berasal dari database.
  const bookings = [
    { code: "BK-260901", room: "K2.03.04", date: "2026-10-27", start: "09:00", end: "11:00", purpose: "Diskusi kelompok", status: "Disetujui" },
    { code: "BK-260902", room: "K4.02.01", date: "2026-10-28", start: "13:00", end: "15:00", purpose: "Rapat organisasi", status: "Menunggu" },
    { code: "BK-260903", room: "K1.06.03", date: "2026-10-30", start: "10:00", end: "12:00", purpose: "Belajar kelompok", status: "Disetujui" },
    { code: "BK-260904", room: "K3.01.07", date: "2026-10-18", start: "08:00", end: "10:00", purpose: "Praktikum", status: "Dibatalkan" },
    { code: "BK-260905", room: "K5.04.02", date: "2026-10-14", start: "14:00", end: "16:00", purpose: "Bimbingan", status: "Disetujui" },
    { code: "BK-260906", room: "K6.02.05", date: "2026-10-12", start: "09:00", end: "10:30", purpose: "Diskusi kelompok", status: "Ditolak" },
    { code: "BK-260907", room: "K2.05.01", date: "2026-11-02", start: "10:00", end: "12:00", purpose: "Rapat organisasi", status: "Menunggu" },
    { code: "BK-260908", room: "K8.01.04", date: "2026-11-04", start: "13:00", end: "15:00", purpose: "Kegiatan akademik", status: "Disetujui" }
  ];

  const statusClasses = {
    "Disetujui": "approved",
    "Menunggu": "pending",
    "Dibatalkan": "cancelled",
    "Ditolak": "rejected"
  };
  const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  function today() {
    const date = new Date();
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  }

  function safe(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
    });
  }

  function formatDate(dateValue, options) {
    if (!dateValue) return "—";
    const parts = dateValue.split("-").map(Number);
    const date = new Date(parts[0], parts[1] - 1, parts[2], 12);
    return date.toLocaleDateString("id-ID", options || { day: "numeric", month: "long", year: "numeric" });
  }

  function setTodayText() {
    const text = new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    $("#todayDate").text(text.charAt(0).toUpperCase() + text.slice(1));
  }

  function setActiveNav(page) {
    $(".nav-link").removeClass("active");
    if (page === "home") $('.nav-link[data-page="home"]').addClass("active");
    else $('.nav-link[href="' + page + '"]').addClass("active");
  }

  function normalizePagePath(url) {
    return String(url || "").replace(/^#/, "").replace(/^\.\//, "");
  }

  function showHome(push = true) {
    $content.removeClass("loaded-subpage").html(homeHTML);
    $("#pageTitle").text("Dashboard kalender");
    setActiveNav("home");
    $("#sidebar").removeClass("open");
    currentPage = "home";
    if (push) {
      if (location.protocol === "file:") {
        if (location.hash) location.hash = "";
      } else {
        history.pushState({ home: true }, "", location.pathname + location.search);
      }
    }
    selectedDate = today();
    setTodayText();
    renderCalendar();
    renderUpcoming();
  }

  function mountPage(html, url, title, push) {
    const pagePath = normalizePagePath(url);
    $content.addClass("loaded-subpage").html(html);
    $("#pageTitle").text(title);
    setActiveNav(pagePath);
    $("#sidebar").removeClass("open");
    currentPage = pagePath;

    if (push) {
      if (location.protocol === "file:") {
        if (location.hash !== "#" + pagePath) location.hash = pagePath;
      } else {
        history.pushState({ url: pagePath, title: title }, "", "#" + pagePath);
      }
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (pagePath.includes("riwayat")) initHistory();
    if (pagePath.includes("berulang")) initRecurring();
  }

  function loadPage(url, title, push = true) {
    const pagePath = normalizePagePath(url);
    const bundledHTML = window.RUANGKITA_PAGES && window.RUANGKITA_PAGES[pagePath];

    // Gunakan halaman yang sudah dibundel terlebih dahulu. Ini bekerja baik saat
    // dibuka lewat file:// maupun melalui Apache/Laragon, tanpa ketergantungan AJAX.
    if (bundledHTML) {
      mountPage(bundledHTML, pagePath, title, push);
      return;
    }

    // Fallback untuk halaman lain yang mungkin ditambahkan belakangan.
    $.ajax({ url: pagePath, method: "GET", dataType: "html", cache: false })
      .done(function (html) { mountPage(html, pagePath, title, push); })
      .fail(function () {
        $content.addClass("loaded-subpage").html(
          '<section class="panel"><h2>Halaman belum bisa dimuat</h2>' +
          '<p class="muted">Halaman ini belum tersedia di paket lokal. Coba jalankan proyek lewat Laragon atau periksa nama file halaman.</p>' +
          '<p class="muted" style="margin-top:8px">Dashboard tetap bisa diakses lewat menu RuangKita.</p></section>'
        );
      });
  }

  function restoreFromHash() {
    const pagePath = normalizePagePath(location.hash);
    if (pagePath.includes("pages/riwayat")) {
      if (currentPage !== pagePath) loadPage(pagePath, "Riwayat Booking", false);
    } else if (pagePath.includes("pages/berulang")) {
      if (currentPage !== pagePath) loadPage(pagePath, "Booking Berulang", false);
    } else if (currentPage !== "home") {
      showHome(false);
    }
  }

  $(document).on("click", '[data-page="home"]', function (event) {
    event.preventDefault();
    showHome();
  });

  $(document).on("click", ".ajax-link", function (event) {
    event.preventDefault();
    loadPage($(this).attr("href"), $(this).data("title") || $(this).text().trim());
  });

  $("#mobileMenu").on("click", function () {
    $("#sidebar").toggleClass("open");
  });

  $(document).on("click", function (event) {
    if (window.innerWidth <= 760 && $("#sidebar").hasClass("open") &&
        !$(event.target).closest("#sidebar, #mobileMenu").length) {
      $("#sidebar").removeClass("open");
    }
  });

  $(window).on("popstate", function (event) {
    const state = event.originalEvent.state;
    if (state && state.url) loadPage(state.url, state.title, false);
    else restoreFromHash();
  });

  // Navigasi berbasis hash tetap memiliki tombol Back/Forward pada file://.
  $(window).on("hashchange", function () {
    if (location.protocol === "file:") restoreFromHash();
  });

  function statusClass(status) {
    return statusClasses[status] || "cancelled";
  }

  function renderCalendar() {
    const $calendar = $("#calendar");
    if (!$calendar.length) return;
    $calendar.empty();
    ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].forEach(function (day) {
      $calendar.append($("<div>", { class: "calendar-day-name", text: day }));
    });

    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    $("#calendarMonth").text(monthNames[month] + " " + year);
    for (let i = 0; i < firstDay; i++) $calendar.append($('<div class="calendar-cell muted-day" aria-hidden="true"></div>'));

    for (let day = 1; day <= totalDays; day++) {
      const date = year + "-" + String(month + 1).padStart(2, "0") + "-" + String(day).padStart(2, "0");
      const events = bookings.filter(function (item) { return item.date === date; });
      let classes = "calendar-cell";
      if (date === today()) classes += " today";
      if (date === selectedDate) classes += " selected";
      const $cell = $("<button>", {
        type: "button", class: classes, "data-date": date,
        "aria-label": formatDate(date) + (events.length ? ", " + events.length + " agenda" : ", tidak ada agenda"),
        "aria-pressed": date === selectedDate ? "true" : "false"
      }).append($("<b>", { text: day }));
      if (events.length) {
        const statuses = events.map(function (item) { return item.status; });
        const status = statuses.includes("Disetujui") ? "approved-dot" : statuses.includes("Menunggu") ? "pending-dot" : "other-dot";
        $cell.append($("<span>", { class: "event-dot " + status }));
        $cell.attr("title", events.map(function (item) { return item.room + " — " + item.status; }).join("; "));
      }
      $calendar.append($cell);
    }
    renderSelectedDate();
  }

  function renderSelectedDate() {
    const $panel = $("#selectedDatePanel");
    if (!$panel.length) return;
    const chosen = bookings.filter(function (item) { return item.date === selectedDate; }).sort(function (a, b) { return a.start.localeCompare(b.start); });
    const label = formatDate(selectedDate, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    $panel.empty().append(
      $("<div>", { class: "selected-date-head" })
        .append($("<b>", { text: label.charAt(0).toUpperCase() + label.slice(1) }))
        .append($("<span>", { text: chosen.length + " agenda" }))
    );
    if (!chosen.length) {
      $panel.append($("<p>", { class: "empty-day", text: "Belum ada agenda booking pada tanggal ini. Pilih tanggal bertitik untuk melihat detail jadwal." }));
      return;
    }
    chosen.forEach(function (item) {
      const $line = $("<div>", { class: "selected-agenda-item" });
      const $details = $("<div>").append($("<b>", { text: item.room })).append($("<small>", { text: item.purpose + " · " + item.start + "–" + item.end }));
      $line.append($details).append($("<span>", { class: "status-badge " + statusClass(item.status), text: item.status }));
      $panel.append($line);
    });
  }

  $(document).on("click", ".calendar-cell[data-date]", function () {
    selectedDate = $(this).attr("data-date");
    renderCalendar();
  });

  $("#prevMonth").on("click", function () {
    month--;
    if (month < 0) { month = 11; year--; }
    if (!selectedDate || Number(selectedDate.slice(5, 7)) !== month + 1 || Number(selectedDate.slice(0, 4)) !== year) {
      selectedDate = year + "-" + String(month + 1).padStart(2, "0") + "-01";
    }
    renderCalendar();
  });

  $("#nextMonth").on("click", function () {
    month++;
    if (month > 11) { month = 0; year++; }
    if (!selectedDate || Number(selectedDate.slice(5, 7)) !== month + 1 || Number(selectedDate.slice(0, 4)) !== year) {
      selectedDate = year + "-" + String(month + 1).padStart(2, "0") + "-01";
    }
    renderCalendar();
  });

  function renderUpcoming() {
    const $list = $("#upcomingList");
    if (!$list.length) return;
    const upcoming = bookings.filter(function (item) {
      return item.date >= today() && ["Disetujui", "Menunggu"].includes(item.status);
    }).sort(function (a, b) {
      return (a.date + a.start).localeCompare(b.date + b.start);
    }).slice(0, 4);
    $list.empty();
    $("#upcomingCount").text(String(upcoming.length).padStart(2, "0"));
    if (!upcoming.length) {
      $list.append($("<p>", { class: "empty-day", text: "Belum ada agenda mendatang." }));
      return;
    }
    upcoming.forEach(function (item) {
      const dateParts = item.date.split("-").map(Number);
      const $row = $("<div>", { class: "schedule-item" });
      $row.append($("<div>", { class: "schedule-date" }).append($("<b>", { text: dateParts[2] })).append($("<small>", { text: monthNames[dateParts[1] - 1].slice(0, 3).toUpperCase() })));
      $row.append($("<div>", { class: "schedule-detail" }).append($("<b>", { text: item.room })).append($("<span>", { text: item.purpose + " · " + item.start.replace(":", ".") + "–" + item.end.replace(":", ".") })));
      $row.append($("<span>", { class: "status-badge " + statusClass(item.status), text: item.status }));
      $list.append($row);
    });
  }

  function getFilteredBookings() {
    const search = $("#historySearch").val().trim().toLowerCase();
    const status = $("#historyStatus").val();
    const date = $("#historyDate").val();
    return bookings.filter(function (item) {
      const matchesSearch = !search || [item.code, item.room, item.purpose, item.status].some(function (field) { return field.toLowerCase().includes(search); });
      return matchesSearch && (!status || item.status === status) && (!date || item.date === date);
    }).sort(function (a, b) {
      return b.date.localeCompare(a.date) || b.start.localeCompare(a.start);
    });
  }

  function initHistory() {
    let page = 1;
    const size = 5;

    function render() {
      const rows = getFilteredBookings();
      const pages = Math.max(1, Math.ceil(rows.length / size));
      page = Math.min(Math.max(page, 1), pages);
      const $body = $("#historyBody").empty();
      rows.slice((page - 1) * size, page * size).forEach(function (item) {
        const $row = $("<tr>");
        [item.code, item.room, formatDate(item.date, { day: "numeric", month: "short", year: "numeric" }), item.start + "–" + item.end, item.purpose].forEach(function (value) {
          $row.append($("<td>", { text: value }));
        });
        $row.append($("<td>").append($("<span>", { class: "table-status " + statusClass(item.status), text: item.status })));
        $row.append($("<td>").append($("<button>", { type: "button", class: "btn btn-outline history-detail", text: "Detail" }).attr("data-code", item.code)));
        $body.append($row);
      });
      if (!rows.length) $body.html('<tr><td colspan="7" style="text-align:center;padding:28px;color:#87958b">Tidak ada riwayat yang cocok. Coba ubah kata kunci atau reset filter.</td></tr>');
      $("#historyCount").text("Menampilkan " + (rows.length ? ((page - 1) * size + 1) : 0) + "–" + Math.min(page * size, rows.length) + " dari " + rows.length + " transaksi");
      const $pagination = $("#historyPagination").empty();
      if (pages > 1) {
        $pagination.append($("<button>", { type: "button", class: "page-button", text: "←", disabled: page === 1, "aria-label": "Halaman sebelumnya" }).attr("data-p", page - 1));
        for (let n = 1; n <= pages; n++) {
          $pagination.append($("<button>", { type: "button", class: "page-button" + (n === page ? " selected" : ""), text: n, "aria-label": "Halaman " + n, "aria-current": n === page ? "page" : null }).attr("data-p", n));
        }
        $pagination.append($("<button>", { type: "button", class: "page-button", text: "→", disabled: page === pages, "aria-label": "Halaman berikutnya" }).attr("data-p", page + 1));
      }
    }

    $("#historySearch, #historyStatus, #historyDate").off(".history").on("input.history change.history", function () {
      page = 1;
      $("#historyDetail").prop("hidden", true).empty();
      $("#historyNotice").text("");
      render();
    });
    $("#clearHistoryFilters").off("click.history").on("click.history", function () {
      $("#historySearch").val("");
      $("#historyStatus").val("");
      $("#historyDate").val("");
      $("#historyDetail").prop("hidden", true).empty();
      $("#historyNotice").text("");
      page = 1;
      render();
    });
    $("#historyPagination").off("click.history").on("click.history", "[data-p]", function () {
      if ($(this).prop("disabled")) return;
      page = Number($(this).attr("data-p"));
      render();
    });
    $(document).off("click.history", ".history-detail").on("click.history", ".history-detail", function () {
      const selectedCode = $(this).attr("data-code");
      const item = bookings.find(function (booking) { return booking.code === selectedCode; });
      if (!item) return;
      const $detail = $("#historyDetail").empty().prop("hidden", false);
      const $top = $("<div>", { class: "result-top" }).append($("<div>").append($("<h3>", { text: "Detail booking " + item.code })).append($("<p>", { text: "Ringkasan transaksi dari data simulasi." })));
      $top.append($("<span>", { class: "table-status " + statusClass(item.status), text: item.status }));
      $detail.append($top);
      const $grid = $("<div>", { class: "detail-grid" });
      [["Ruang", item.room], ["Tanggal", formatDate(item.date)], ["Waktu", item.start + "–" + item.end], ["Tujuan", item.purpose], ["Kode booking", item.code], ["Status", item.status]].forEach(function (pair) {
        $grid.append($("<div>").append($("<small>", { text: pair[0] })).append($("<b>", { text: pair[1] })));
      });
      $detail.append($grid);
      $("#historyNotice").text("Detail " + item.code + " sedang ditampilkan di bawah tabel.");
      $detail[0].scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
    $("#exportHistory").off("click.history").on("click.history", function () {
      const rows = getFilteredBookings();
      if (!rows.length) {
        $("#historyNotice").text("Tidak ada data yang dapat diekspor dari filter saat ini.");
        return;
      }
      const headers = ["Kode Booking", "Ruang", "Tanggal", "Jam Mulai", "Jam Selesai", "Tujuan", "Status"];
      const csvCell = function (value) { return '"' + String(value).replace(/"/g, '""') + '"'; };
      const lines = [headers].concat(rows.map(function (item) { return [item.code, item.room, item.date, item.start, item.end, item.purpose, item.status]; }));
      const csv = "\uFEFF" + lines.map(function (line) { return line.map(csvCell).join(","); }).join("\r\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "riwayat-booking-ruangkita.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      $("#historyNotice").text("Ekspor berhasil disiapkan: " + rows.length + " transaksi sesuai filter saat ini.");
    });
    render();
  }

  function initRecurring() {
    const $room = $("#recRoom").empty().append($("<option>", { value: "", text: "Pilih ruang" }));
    for (let building = 1; building <= 10; building++) {
      for (let floor = 1; floor <= 10; floor++) {
        for (let number = 1; number <= 10; number++) {
          const room = "K" + building + "." + String(floor).padStart(2, "0") + "." + String(number).padStart(2, "0");
          $room.append($("<option>", { value: room, text: room }));
        }
      }
    }
    const dateToday = today();
    $("#recStartDate, #recEndDate").attr("min", dateToday);
    $("#recStartDate").off("change.recurring").on("change.recurring", function () {
      $("#recEndDate").attr("min", this.value || dateToday);
      if ($("#recEndDate").val() && $("#recEndDate").val() < this.value) $("#recEndDate").val(this.value);
    });
    $("#recNotes").off("input.recurring").on("input.recurring", function () { $("#notesCount").text(this.value.length); });

    $("#recurringForm").off("submit.recurring reset.recurring").on("reset.recurring", function () {
      setTimeout(function () {
        $(".field-error").text("");
        $("#recAlert").removeClass("error success").text("").hide();
        $("#recResult").prop("hidden", true).empty();
        $("#notesCount").text("0");
        $("#recEndDate").attr("min", dateToday);
      }, 0);
    }).on("submit.recurring", function (event) {
      event.preventDefault();
      $(".field-error").text("");
      $("#recAlert").removeClass("error success").text("").hide();
      $("#recResult").prop("hidden", true).empty();
      let errors = 0;
      function error(id, message) {
        $('.field-error[data-for="' + id + '"]').text(message);
        errors++;
      }
      const name = $("#recName").val().trim();
      const email = $("#recEmail").val().trim();
      const room = $("#recRoom").val();
      const purpose = $("#recPurpose").val();
      const startDate = $("#recStartDate").val();
      const endDate = $("#recEndDate").val();
      const startTime = $("#recStartTime").val();
      const endTime = $("#recEndTime").val();
      const people = Number($("#recParticipants").val());
      const notes = $("#recNotes").val().trim();
      const weekdays = $('input[name="weekday"]:checked').map(function () { return this.value; }).get();

      if (name.length < 3) error("recName", "Nama minimal 3 karakter.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) error("recEmail", "Masukkan alamat email yang valid.");
      if (!room) error("recRoom", "Pilih ruang terlebih dahulu.");
      if (!purpose) error("recPurpose", "Pilih tujuan penggunaan.");
      if (!startDate || startDate < dateToday) error("recStartDate", "Tanggal mulai tidak boleh sebelum hari ini.");
      if (!endDate || !startDate || endDate < startDate) error("recEndDate", "Tanggal selesai harus sama atau setelah tanggal mulai.");
      if (!startTime || !endTime || startTime >= endTime) error("recEndTime", "Jam selesai harus setelah jam mulai.");
      if (!Number.isInteger(people) || people < 1 || people > 200) error("recParticipants", "Jumlah peserta harus 1–200 orang.");
      if (!weekdays.length) error("weekdays", "Pilih minimal satu hari pengulangan.");

      if (errors) {
        $("#recAlert").addClass("error").text("Ada " + errors + " bagian yang perlu diperbaiki. Cek pesan di bawah kolom terkait.").show();
        const firstError = $(".field-error").filter(function () { return $(this).text().trim() !== ""; }).first();
        if (firstError.length) firstError[0].scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }

      let count = 0;
      const occurrences = [];
      const cursor = new Date(startDate + "T12:00:00");
      const end = new Date(endDate + "T12:00:00");
      while (cursor <= end) {
        if (weekdays.includes(dayNames[cursor.getDay()])) {
          count++;
          occurrences.push(cursor.getFullYear() + "-" + String(cursor.getMonth() + 1).padStart(2, "0") + "-" + String(cursor.getDate()).padStart(2, "0"));
        }
        cursor.setDate(cursor.getDate() + 1);
      }
      if (!count) {
        $("#recAlert").addClass("error").text("Tidak ada tanggal yang cocok dengan hari pengulangan. Periksa kembali rentang tanggal dan hari yang dipilih.").show();
        return;
      }

      const code = "BR-" + Date.now().toString().slice(-6);
      $("#recAlert").addClass("success").text("Validasi berhasil. Ringkasan jadwal simulasi sudah dibuat di bawah formulir.").show();
      const $result = $("#recResult").prop("hidden", false).empty();
      const $top = $("<div>", { class: "result-top" });
      $top.append($("<div>").append($("<h3>", { text: "Jadwal berhasil divalidasi" })).append($("<p>", { text: "Periksa ringkasan ini sebelum pengajuan dilakukan melalui sistem resmi." })));
      $top.append($("<span>", { class: "result-code", text: code }));
      $result.append($top);
      const $grid = $("<div>", { class: "detail-grid" });
      [["Pemesan", name], ["Email", email], ["Ruang", room], ["Tujuan", purpose], ["Rentang tanggal", formatDate(startDate) + " – " + formatDate(endDate)], ["Waktu", startTime + "–" + endTime], ["Peserta", people + " orang"], ["Jadwal", count + " kali"]].forEach(function (pair) {
        $grid.append($("<div>").append($("<small>", { text: pair[0] })).append($("<b>", { text: pair[1] })));
      });
      $result.append($grid);
      const $occurrences = $("<div>", { class: "occurrence-list" });
      occurrences.slice(0, 8).forEach(function (date) {
        $occurrences.append($("<span>", { class: "occurrence-chip" }).append($("<b>", { text: formatDate(date, { day: "numeric", month: "short" }) })).append(document.createTextNode(" · " + dayNames[new Date(date + "T12:00:00").getDay()])));
      });
      $result.append($("<b>", { text: "Perkiraan kemunculan jadwal" }));
      $result.append($occurrences);
      if (occurrences.length > 8) $result.append($("<p>", { class: "result-disclaimer", text: "Menampilkan 8 jadwal pertama dari total " + count + " kemunculan." }));
      $result.append($("<p>", { class: "result-disclaimer", text: "Catatan: ini baru simulasi di browser. Kode ini bukan bukti pengajuan resmi, dan data belum tersimpan ke server atau database." }));
      $result[0].scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  // Shortcut '/' untuk langsung mengarah ke kolom pencarian pada halaman riwayat.
  $(document).on("keydown", function (event) {
    const target = event.target;
    const isTyping = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
    if (event.key === "/" && !isTyping && $("#historySearch").length) {
      event.preventDefault();
      $("#historySearch").trigger("focus");
    }
  });

  setTodayText();
  renderCalendar();
  renderUpcoming();
  if (location.hash.includes("pages/")) restoreFromHash();
});
