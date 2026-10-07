(function () {
  // Mobile menu
  var toggle = document.getElementById('menu-toggle');
  var mnav = document.getElementById('mobile-nav');
  if (toggle && mnav) {
    toggle.addEventListener('click', function () {
      var open = mnav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Đóng menu' : 'Mở menu');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mnav.classList.contains('is-open')) {
        mnav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Mở menu');
        toggle.focus();
      }
    });
  }

  // Scroll reveal + count-up for landing page accents
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18 });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  var counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window && counters.length) {
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = Number(el.dataset.count || 0);
        var suffix = el.dataset.suffix || '';
        var decimals = (String(target).split('.')[1] || '').length;
        var duration = 900;
        var start = null;

        function update(ts) {
          if (!start) start = ts;
          var progress = Math.min((ts - start) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          var value = target * eased;
          el.textContent = Number(value).toFixed(decimals) + suffix;
          if (progress < 1) requestAnimationFrame(update);
          else el.textContent = target.toFixed(decimals) + suffix;
        }

        requestAnimationFrame(update);
        countObserver.unobserve(el);
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { countObserver.observe(el); });
  } else {
    counters.forEach(function (el) {
      var target = Number(el.dataset.count || 0);
      var suffix = el.dataset.suffix || '';
      el.textContent = target + suffix;
    });
  }

  // Service category filter
  var filterButtons = document.querySelectorAll('.segmented__btn');
  var serviceCards = document.querySelectorAll('.service-card');
  if (filterButtons.length && serviceCards.length) {
    filterButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        var filter = button.dataset.filter;
        filterButtons.forEach(function (btn) { btn.classList.toggle('is-active', btn === button); });
        serviceCards.forEach(function (card) {
          var show = filter === 'all' || card.dataset.category === filter;
          card.classList.toggle('hidden', !show);
        });
      });
    });
  }

  // Booking form
  var form = document.getElementById('booking-form');
  if (!form) return;
  var status = document.getElementById('form-status');
  var rules = {
    name: function (v) { return v.trim().length >= 2 ? '' : 'Họ và tên cần ít nhất 2 ký tự.'; },
    phone: function (v) { return /^0\d{9}$/.test(v.replace(/\s+/g, '')) ? '' : 'Số điện thoại phải gồm 10 chữ số, bắt đầu bằng 0.'; },
    service: function (v) { return v ? '' : 'Chọn một dịch vụ bạn quan tâm.'; },
    date: function (v) {
      if (!v) return 'Chọn ngày bạn muốn đến.';
      var d = new Date(v + 'T00:00:00'), t = new Date(); t.setHours(0, 0, 0, 0);
      return d >= t ? '' : 'Ngày hẹn phải từ hôm nay trở đi.';
    }
  };
  function check(field) {
    var id = field.id; if (!rules[id]) return true;
    var msg = rules[id](field.value);
    var err = document.getElementById(id + '-err');
    if (msg) { field.setAttribute('aria-invalid', 'true'); err.textContent = msg; err.hidden = false; }
    else { field.removeAttribute('aria-invalid'); err.hidden = true; }
    return !msg;
  }
  Object.keys(rules).forEach(function (id) {
    var f = document.getElementById(id);
    if (f) f.addEventListener('blur', function () { check(f); });
  });
  var dateEl = document.getElementById('date');
  if (dateEl) { var n = new Date(); dateEl.min = n.getFullYear() + '-' + String(n.getMonth() + 1).padStart(2, '0') + '-' + String(n.getDate()).padStart(2, '0'); }
  var pre = new URLSearchParams(location.search).get('dv');
  var sel = document.getElementById('service');
  if (pre && sel) { for (var i = 0; i < sel.options.length; i++) { if (sel.options[i].value === pre) sel.selectedIndex = i; } }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var firstBad = null;
    Object.keys(rules).forEach(function (id) {
      var f = document.getElementById(id);
      if (f && !check(f) && !firstBad) firstBad = f;
    });
    if (firstBad) { firstBad.focus(); status.className = 'notice notice--err'; status.textContent = 'Kiểm tra lại các trường được đánh dấu.'; return; }
    var btn = form.querySelector('button[type="submit"]');
    btn.setAttribute('aria-busy', 'true'); btn.disabled = true;
    setTimeout(function () {
      btn.removeAttribute('aria-busy'); btn.disabled = false;
      var name = document.getElementById('name').value.trim();
      var ds = new Intl.DateTimeFormat('vi-VN').format(new Date(document.getElementById('date').value + 'T00:00:00'));
      status.className = 'notice notice--ok';
      status.textContent = 'Đã nhận yêu cầu của ' + name + ' cho ngày ' + ds + '. Đây là bản demo nên chưa có dữ liệu nào được gửi đi.';
      form.reset();
    }, 700);
  });
})();
