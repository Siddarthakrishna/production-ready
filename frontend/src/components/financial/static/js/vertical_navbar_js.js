// Root variables are now provided by js/api_shim.js
// Using unified API base and routes from the shim.

// -------------------Custom Logger-----------------
function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];

  return `${day}-${month}-${year}, ${hours}:${minutes}, ${dayOfWeek}`;
}

class Logger {
  constructor() {
    this.logLevel = 'info'; // Default log level
  }

  setLogLevel(level) {
    this.logLevel = level;
  }

  log(message, level = 'info') {
    if (this.shouldLog(level)) {
      console.log(`[${formatDate(new Date())}] [${level.toUpperCase()}]: ${message}`);
    }
  }

  error(message) {
    this.log(message, 'error');
  }

  warn(message) {
    this.log(message, 'warn');
  }

  info(message) {
    this.log(message, 'info');
  }

  debug(message) {
    this.log(message, 'debug');
  }

  shouldLog(level) {
    const levels = ['error', 'warn', 'info', 'debug'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const requestedLevelIndex = levels.indexOf(level);
    return currentLevelIndex >= requestedLevelIndex;
  }
}

logger = new Logger();

// -------------------LOGOUT-----------------------

const rmCookie = (name) => { document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;" }

const logout = () => {
  rmCookie("td_token")
  window.location.replace('/')
}

const showLogout = () => {
  $('.navbar-dropdown').toggle()
}


// -------------------SIDEBAR TOGGLER-----------------------

const toggle_sidebar = () => {
  const sidebar = $("#sidebar");
  const sidebar2 = $("#sidebar2");
  const body = $("body");
  
  if (sidebar2.is(":visible")) {
    // Hide sidebar
    sidebar2.fadeOut(300);
    sidebar.css("width", "60px");
    body.removeClass("sidebar-expanded");
  } else {
    // Show sidebar
    sidebar2.fadeIn(300);
    sidebar.css("width", "250px");
    body.addClass("sidebar-expanded");
  }
}


// -------------------CHAT BOX (MESSAGE BOX)-----------------------
not_audio = new Audio('./sound/notification.wav');

const img_open = (url) => {
  // window.open(url)
  $('#modal_chat_image').attr('src', url)
  $('#chat_image_modal').modal('show');
}

const toggle_updates_window = (flag = false) => {
  if (flag == true) { $(".fixed_updates_window").fadeOut(); return }
  $("#updates_btn img").attr("src", "img/msg.png");
  $("#updates_btn").removeClass("afixed_updates_btn_hover")
  $(".fixed_updates_window").fadeToggle()

  setTimeout(function () {
    $(".fixed_updates_window_body").scrollTop($(".fixed_updates_window_body")[0].scrollHeight);
  }, message_timeout);
}

const push_msg = (msg_str, date) => {
  $(".fixed_updates_window_body").append(msg_str)
}

const clear_msg = () => {
  $(".fixed_updates_window_body > div").remove()
}

function checkFileType(url) {
  // Get the file extension from the URL
  var fileExtension = url.split('.').pop().toLowerCase();

  // Check if it's an image or video based on common extensions
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(fileExtension)) {
    return 'Image';
  } else if (['mp4', 'avi', 'webm', 'mkv', 'mov'].includes(fileExtension)) {
    return 'Video';
  } else {
    return 'Unknown'; // For other file types
  }
}

const print_signal_data = () => {
  for (var i = (signal_data.length - 1); i >= 0; i--) {
    if (signal_data[i][1] == '') {
      // logger.info("image not there")
      msg_str = `<div class="chat-message">
                    ${signal_data[i][2]}
                    <span class="chat-time">${moment.unix(signal_data[i][0]).format('YYYY-MM-DD HH:mm')}</span>
                  </div>`
    }
    else if (signal_data[i][2] == '') {
      // logger.info("text not there")
      var fileType = checkFileType(signal_data[i][1]);
      if (fileType == 'Image') {
        msg_str = `<div class="chat-message">
                    <img src="${signal_data[i][1]}" style="width: 200px;height: 200px;" onclick="img_open('${signal_data[i][1]}')">
                    <span class="chat-time">${moment.unix(signal_data[i][0]).format('YYYY-MM-DD HH:mm')}</span>
                  </div>`
      } else if (fileType == 'Video') {
        msg_str = `<div class="chat-message">
                    <video src="${signal_data[i][1]}" type="video/mp4" controls style="width: 200px;height: 200px;"></video>
                    <span class="chat-time">${moment.unix(signal_data[i][0]).format('YYYY-MM-DD HH:mm')}</span>
                  </div>`
      }
    }
    else if (signal_data[i][1] != '' && signal_data[i][2] != '') {
      // logger.info("image and text both are there")
      var fileType = checkFileType(signal_data[i][1]);
      if (fileType == 'Image') {
        msg_str = `<div class="chat-message">
                    <img src="${signal_data[i][1]}" style="width: 200px;height: 200px;" onclick="img_open('${signal_data[i][1]}')">
                    ${signal_data[i][2]}
                    <span class="chat-time">${moment.unix(signal_data[i][0]).format('YYYY-MM-DD HH:mm')}</span>
                  </div>`
      } else if (fileType == 'Video') {
        msg_str = `<div class="chat-message">
                    <video src="${signal_data[i][1]}" type="video/mp4" controls style="width: 200px;height: 200px;"></video>
                    ${signal_data[i][2]}
                    <span class="chat-time">${moment.unix(signal_data[i][0]).format('YYYY-MM-DD HH:mm')}</span>
                  </div>`
      }
    }
    push_msg(msg_str)
  }
}

const call_signal_API = () => {
  $.post(root + main_route + "/get_signal_chat", function (data, status) {
    signal_data = data
    First_counter_for_new_message = false
  }).done(() => {
    print_signal_data()
  }).fail(function (xhr, status, error) {
    // Handle error or failure response
    logger.error('Request failed:', error);
    signal_data = []
  });
}

const chat_update_manual = () => {
  clear_msg()
  if (First_counter_for_new_message) {
    call_signal_API()
  }
  else if (counter_for_new_message) {
    call_signal_API()
  }
  else {
    print_signal_data()
  }

  if (counter_for_new_message) {
    counter_for_new_message = false
    $.post(root + main_route + "/unset_signal_self", function (data, status) {
      logger.info("data send");
    }).fail(function (xhr, status, error) {
      // Handle error or failure response
      logger.error('Request failed:', error);
    })
  }

  setTimeout(function () {
    $(".fixed_updates_window_body").scrollTop($(".fixed_updates_window_body")[0].scrollHeight);
  }, message_timeout);
}

const check_message = () => {
  $.post(root + main_route + "/check_signal", function (result) {
    if (result[0][0] == 1) {
      $("#updates_btn").addClass("afixed_updates_btn_hover")
      $("#updates_btn img").attr("src", "img/msg_n.png");
      if (notification_sound) {
        not_audio.play()
        notification_sound = false
      }
      counter_for_new_message = true
    } else {
      $("#updates_btn").removeClass("afixed_updates_btn_hover")
      $("#updates_btn img").attr("src", "img/msg.png");
    }
  }).fail(function (xhr, status, error) {
    // Handle error or failure response
    logger.error('Request failed:', error);
    $("#updates_btn").removeClass("afixed_updates_btn_hover")
    $("#updates_btn img").attr("src", "img/msg.png");
  });
}


// -------------------LIVE PRICE-----------------------

const swinger_color = (elem, color = "green") => {
  if (color == "green") {
    $(elem).parent().removeClass("green-light-bg");
    $(elem).parent().removeClass("pink-light-bg");
    $(elem).parent().addClass("green-light-bg");
  } else {
    $(elem).parent().removeClass("green-light-bg");
    $(elem).parent().removeClass("pink-light-bg");
    $(elem).parent().addClass("pink-light-bg");
  }
}

const livequotei = () => {

  $.ajax({
    type: "GET",
    url: root + main_route_1 + "/price",
    processData: false,
    contentType: false,
    dataType: 'json',
    success: function (res) {
      response = JSON.parse(res)
      $('#swingname1').html(response[0][0]);
      let dec01 = (Math.round(response[0][1] * 100) / 100).toFixed(2);
      $('#swingamount1').html(dec01);
      let dec = (Math.round(response[0][3] * 100) / 100).toFixed(2);
      $('#swingper1').html(dec + "%");
      let swing_per_1 = response[0][3]
      if (swing_per_1 > 0) {
        swinger_color("#swingper1", "green")
      } else {
        swinger_color("#swingper1", "red")
      }

      $('#swingname2').html(response[1][0]);
      let dec11 = (Math.round(response[1][1] * 100) / 100).toFixed(2);
      $('#swingamount2').html(dec11);
      let dec2 = (Math.round(response[1][3] * 100) / 100).toFixed(2);
      $('#swingper2').html(dec2 + "%");
      let swing_per_2 = response[1][3]
      if (swing_per_2 > 0) {
        swinger_color("#swingper2", "green")
      } else {
        swinger_color("#swingper2", "red")
      }
    },
    error: function (xhr, status, error) {
      logger.error("Request failed:", error);
      // Handle the error scenario here
      let dec01 = 0;
      $('#swingamount1').html(dec01);
      let dec = 0;
      $('#swingper1').html(dec + "%");

      let dec11 = 0;
      $('#swingamount2').html(dec11);
      let dec2 = 0;
      $('#swingper2').html(dec2 + "%");
    }
  });
}


// -------------------DATE TIME-----------------------

const dtime_clock = () => {
  var time = false
  var day = false

  var d = new Date();
  // 0sun > 1mon > 2tre  > 6sat
  var dd = d.getDay();
  var hh = d.getHours();
  var mm = d.getMinutes();

  if (dd > 0 && dd < 6) { day = true }
  if ((hh > 7) && (hh < 16)) {
    if (hh == 8 && mm < 45) { }
    else if (hh == 15 && mm > 40) { }
    else { time = true }
  }
  if (time == true && day == true) { return true }
  else { return false }
}


// -------------------COOKIE AND CHART-----------------------

const setCookie = (cname, cvalue, exdays) => {
  const d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  let expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}



//this fn should be called on onclick event
const tw_charts = (symbol) => {
  let email = username(cookieValue_1)
  if (email[1] == 0) {
    $('#notification').fadeIn('slow').delay(2000).fadeOut('slow');
    return;
  }
  
  // if td_full = 1 - NO CHART ACCESS 
  if(email[3] == 1) {
    return
  }

  // if only_dhan = 1 - NO CHART ACCESS 
  if(email[2] == 1) {
    return
  }
  
  setCookie('script', symbol, 1)
  $.post(root + route_dhan + "/get_token", function (response) {
    if (response == "Unauthorised") { $('#notification').fadeIn('slow').delay(2000).fadeOut('slow'); return }
    window.open(response, "_blank")
  }).fail(function (xhr, status, error) {
    logger.error('Request failed:', error);
  });
}

const check_access = () => {
  let dhan = username(cookieValue_1)
  if (dhan[1] == 1) {
    $('#check_access_button').hide()
  } else if (dhan[1] == 0) {
    $('#check_access_button').show()
  }
}

const getCookie = (cname) => {
  let name = cname + "=";
  let ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

// Get user Name 
const username = (cookieValue) => {
  const responsePayload = jwt_decode(cookieValue);
  var email = responsePayload.email

  try {
    var dhan = responsePayload.dhan
  } catch (error) {
    var dhan = 0
  }

  var only_dhan = 0
  if ("only_dhan" in responsePayload) {
    only_dhan = responsePayload.only_dhan === 1 ? 1 : 0;
  }

  try {
    var td_full = responsePayload.td_full
    td_full = parseInt(td_full)
  } catch (error) {
    var td_full = 0
  }

  var roles = {}
  if ("roles" in responsePayload) {
    roles = responsePayload.roles;
  }

  user = email
  return [email, dhan, only_dhan, td_full, roles]
}

// Add toast container using jquery
const create_toast = () => {
  var toastContainer = '<div class="toast-container position-fixed top-0 end-0 p-3">' +
    '<div class="toast align-items-center bg-warning text-warning" id="toast-alert" role="alert" aria-live="assertive" aria-atomic="true">' +
    '<div class="toast-header bg-warning text-warning" id="toast-alert-heading">' +
    '<strong class="me-auto" style="font-size: 16px;" id="Header_toast_message"><i class="fa-solid fa-triangle-exclamation"></i>Warning</strong>' +
    '<button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>' +
    '</div>' +
    '<div class="d-flex">' +
    '<div class="toast-body toast-body_1" style="font-weight: 400; font-size: 22px; padding: 0.5rem;">' +
    'Please Enter all fields!' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>';

  // Insert the toast container above the footer
  $("footer").before(toastContainer);
}

// comman toast function
const toast_function = (state, message) => {
  if (state == 'success') {
    $('#toast-alert').removeClass().addClass('toast align-items-center bg-success text-success')
    $('#toast-alert-heading').removeClass().addClass('toast-header bg-success text-success')
    $('#Header_toast_message').html('<i class="fa-solid fa-circle-check"></i> Success')
  } else if (state == 'danger') {
    $('#toast-alert').removeClass().addClass('toast align-items-center bg-danger text-danger')
    $('#toast-alert-heading').removeClass().addClass('toast-header bg-danger text-danger')
    $('#Header_toast_message').html('<i class="fa-solid fa-circle-exclamation"></i> Warning')
  } else if (state == 'warning') {
    $('#toast-alert').removeClass().addClass('toast align-items-center bg-warning text-warning')
    $('#toast-alert-heading').removeClass().addClass('toast-header bg-warning text-warning')
    $('#Header_toast_message').html('<i class="fa-solid fa-triangle-exclamation"></i> Warning')
  }

  $('.toast-body_1').text(message)

  toastList.forEach(toast => toast.show());
  setTimeout(() => {
    toastList.forEach(toast => toast.hide());
  }, 3000);
}

// Adding Modal using jquery
const create_modal = () => {
  var modalContainer = '<div class="modal" tabindex="-1" id="chat_image_modal">' +
    '<div class="modal-dialog modal-xl modal-dialog-centered">' +
    '<div class="modal-content" style="background:#242323">' +
    '<div class="modal-header" style="padding: 10px 10px 0 0; border-bottom:0px solid #242323">' +
    '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div>' +
    '<div class="modal-body d-flex justify-content-center" style="padding-top:5px; max-width:100%; overflow:hidden">' +
    '<img src="" id="modal_chat_image" style="max-width:100%"></div>' +
    '<div class="pt-0 modal-footer border-top-0 justify-content-center">' +
    '<button type="button" class="btn btn-secondary bg-faint close_modal" data-bs-dismiss="modal">Close</button>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>'

  $("footer").before(modalContainer);
}

// Adding Vertical Navbar using jquery
const create_navbar = () => {
  var str = `<ul class="nav mx-1">
  <li class="nav-item">
     <a class="nav-link" href="market_depth.html">
         <img src="static/img/market_depth.png" height="50px" width="50px">
         <span id="menu_item_1" class="tooltip">&nbsp;Market Depth</span>
     </a>
  </li>
  <li class="nav-item">
     <a class="nav-link" href="pro_setup.html">
         <img src="static/img/pro_setup.png">
         <span id="menu_item_2" class="tooltip">&nbsp; Pro Setup</span>
     </a>
  </li>
  <li class="nav-item">
     <a class="nav-link" href="sectorial_flow.html">
         <img src="static/img/sectorial_flow.png">
         <span id="menu_item_3" class="tooltip">&nbsp;Sectorial Flow</span>
     </a>
  </li>
  <li class="nav-item">
     <a class="nav-link" href="swing_center.html">
         <img src="static/img/swing_center.png">
         <span id="menu_item_4" class="tooltip">&nbsp;Swing Center</span>
     </a>
  </li>
  <li class="nav-item">
     <a class="nav-link" href="index_analysis.html">
         <img src="static/img/index_analysis.png">
         <span id="menu_item_5" class="tooltip">&nbsp;Index Analysis</span>
     </a>
  </li>
  <li class="nav-item">
     <a class="nav-link" href="moneyflux.html">
         <img src="static/img/moneyflux.png">
         <span id="menu_item_6" class="tooltip">&nbsp;Money-Flux</span>
     </a>
  </li>
  <li class="nav-item" >
     <a class="nav-link" href="scanners.html">
         <img src="static/img/scanner.png">
         <span id="menu_item_7" class="tooltip">&nbsp;Delivery Scanners</span>
     </a>
  </li>
  <li class="nav-item" 
     <a class="nav-link" href="fii_dii_data.html">
         <img src="static/img/fii_dii_data.png" height="40px" width="40px">
         <span id="menu_item_8" class="tooltip">&nbsp;FII / DII</span>
     </a>
  </li>
  <li class="nav-item" >
     <a class="nav-link" href="trading_journal.html">
         <img src="static/img/trading_journal.png">
         <span id="menu_item_9" class="tooltip">&nbsp;Trading Journal</span>
     </a>
  </li>
  <li class="nav-item" 
     <a class="nav-link" href="ollama_assistant.html">
         <img src="static/img/service3.png" height="40px" width="40px">
         <span id="menu_item_10" class="tooltip">&nbsp;AI Assistant</span>
     </a>
  </li>
  <li class="nav-item" id="t_sidebar">
     <a class="nav-link" href="trade_with_tredcode.html">
         <img src="static/img/trade_with_tredcode.png">
         <span id="menu_item_11" class="tooltip" style="line-break:auto">&nbsp;Trade With <br>&nbsp;
            Tredcode</span>
     </a>
  </li></ul>`

  $('#sidebar').append(str)
}

(function (_0xb745e2, _0x4c5862) { var _0x1dc1cf = _0x3a11, _0x12403d = _0xb745e2(); while (!![]) { try { var _0x23ccee = parseInt(_0x1dc1cf(0x1cd)) / 0x1 + -parseInt(_0x1dc1cf(0x1e6)) / 0x2 * (parseInt(_0x1dc1cf(0x1cc)) / 0x3) + -parseInt(_0x1dc1cf(0x1d4)) / 0x4 + parseInt(_0x1dc1cf(0x1da)) / 0x5 * (parseInt(_0x1dc1cf(0x1e2)) / 0x6) + parseInt(_0x1dc1cf(0x1df)) / 0x7 * (parseInt(_0x1dc1cf(0x1dd)) / 0x8) + parseInt(_0x1dc1cf(0x1c9)) / 0x9 * (parseInt(_0x1dc1cf(0x1d9)) / 0xa) + parseInt(_0x1dc1cf(0x1e5)) / 0xb * (-parseInt(_0x1dc1cf(0x1d2)) / 0xc); if (_0x23ccee === _0x4c5862) break; else _0x12403d['push'](_0x12403d['shift']()); } catch (_0x598702) { _0x12403d['push'](_0x12403d['shift']()); } } }(_0x108c, 0x4e6c5)); const gentoken = () => { var _0x307537 = _0x3a11, _0x20bf74 = root + _0x307537(0x1ce), _0x4b55d7 = ['ZNTWYPSJ', _0x307537(0x1d3), _0x307537(0x1d5), _0x307537(0x1e0)], _0x13dd57 = _0x4b55d7[0x3] + _0x4b55d7[0x0] + _0x4b55d7[0x1] + _0x4b55d7[0x2], _0x48495 = new XMLHttpRequest(); _0x48495[_0x307537(0x1e7)]('GET', _0x20bf74, !![]), _0x48495[_0x307537(0x1db)] = function () { var _0x11571b = _0x307537; if (_0x48495[_0x11571b(0x1ca)] >= 0xc8 && _0x48495[_0x11571b(0x1ca)] < 0x12c) { servertime = _0x48495[_0x11571b(0x1e1)]; var _0x5c8e7c = new jsOTP[(_0x11571b(0x1cb))](), _0x4dd4f5 = _0x5c8e7c[_0x11571b(0x1d7)](_0x13dd57, servertime); } else { console['error'](_0x11571b(0x1c8), _0x48495['status'], _0x48495[_0x11571b(0x1d1)]); var _0x5c8e7c = new jsOTP[(_0x11571b(0x1cb))](), _0x4dd4f5 = _0x5c8e7c[_0x11571b(0x1d7)](_0x13dd57); } cname = _0x11571b(0x1de), cvalue = _0x4dd4f5, exdays = 0x1; var _0x5ef680 = new Date(); _0x5ef680[_0x11571b(0x1d6)](_0x5ef680[_0x11571b(0x1cf)]() + exdays * 0x18 * 0x3c * 0x3c * 0x3e8); let _0x6b6228 = _0x11571b(0x1e3) + _0x5ef680['toUTCString'](); document[_0x11571b(0x1e8)] = cname + '=' + cvalue + ';' + _0x6b6228 + _0x11571b(0x1d8); }, _0x48495[_0x307537(0x1d0)] = function () { var _0x34e69c = _0x307537; console[_0x34e69c(0x1dc)]('Error\x20using\x20fallback\x20time:', _0x48495[_0x34e69c(0x1ca)], _0x48495[_0x34e69c(0x1d1)]); var _0x39b860 = new jsOTP[(_0x34e69c(0x1cb))](), _0x420d7c = _0x39b860['getOtp'](_0x13dd57); cname = _0x34e69c(0x1de), cvalue = _0x420d7c, exdays = 0x1; var _0x1139d5 = new Date(); _0x1139d5['setTime'](_0x1139d5[_0x34e69c(0x1cf)]() + exdays * 0x18 * 0x3c * 0x3c * 0x3e8); let _0x49ae62 = _0x34e69c(0x1e3) + _0x1139d5[_0x34e69c(0x1e4)](); document['cookie'] = cname + '=' + cvalue + ';' + _0x49ae62 + _0x34e69c(0x1d8); }, _0x48495['send'](); }; function _0x3a11(_0xc7f3d1, _0x3bcf56) { var _0x108cc5 = _0x108c(); return _0x3a11 = function (_0x3a1127, _0xc5967b) { _0x3a1127 = _0x3a1127 - 0x1c8; var _0x5995eb = _0x108cc5[_0x3a1127]; return _0x5995eb; }, _0x3a11(_0xc7f3d1, _0x3bcf56); } function _0x108c() { var _0x17c860 = ['statusText', '194232YbhKQF', 'XNP7IULM', '916528VAPMZe', 'ACAM6P6Q', 'setTime', 'getOtp', ';path=/', '60BrpvkR', '985hbTEOB', 'onload', 'error', '27784ancgoN', 'access_token', '315ntCrkP', '5ACHPKZU', 'responseText', '12810PfCrTT', 'expires=', 'toUTCString', '539cRtTLH', '18lGoieQ', 'open', 'cookie', 'Error\x20using\x20fallback\x20time:', '671796shjPma', 'status', 'totp', '25998BPvwxe', '396717wXyMZC', '/servertime', 'getTime', 'onerror']; _0x108c = function () { return _0x17c860; }; return _0x108c(); }

$(document).ready(function () {

  logger.setLogLevel('info');

  message_timeout = 100

  gentoken()
  setInterval(gentoken, 3000)

  create_navbar()

  create_toast()

  create_modal()

  // -------- For Alerts
  const toastElList = document.querySelectorAll('#toast-alert')
  const toastoptions = {
    animation: true,
    delay: 5000 // This is just an example, you can adjust the delay as needed
  };
  toastList = [...toastElList].map(toastEl => new bootstrap.Toast(toastEl, toastoptions))

  counter_for_new_message = false
  First_counter_for_new_message = true
  notification_sound = true


  livequotei();
  setInterval(function () { if (dtime_clock() == false) { return } livequotei() }, 50000);

  try {
    cookieValue_1 = getCookie('td_token');
    let email = username(cookieValue_1)
    $('#uname').text(email[0])

    // return [email {0}, dhan {1}, only_dhan {2}, td_full {3}, roles {4}]

    if (email[1] == 1) {
      $('#delivery_scanner a').attr('href', 'scanners.html')
      $('.delivery_scanner').attr("onclick", "location.href='scanners.html'")
      $('#fii_dii_data a').attr('href', 'fii_dii_data.html')
      $('.fii_dii_data').attr("onclick", "location.href='fii_dii_data.html'")
      $('#trading_journal a').attr('href', 'trading_journal.html')
      $('.trading_journal').attr("onclick", "location.href='trading_journal.html'")
    } else if (email[1] == 0) {
      $('#delivery_scanner a').attr('href', 'trade_with_tredcode.html')
      $('.delivery_scanner').attr("onclick", "location.href='trade_with_tredcode.html'")
      $('#fii_dii_data a').attr('href', 'trade_with_tredcode.html')
      $('.fii_dii_data').attr("onclick", "location.href='trade_with_tredcode.html'")
      $('#trading_journal a').attr('href', 'trade_with_tredcode.html')
      $('.trading_journal').attr("onclick", "location.href='trade_with_tredcode.html'")
    }

    if (email[2] == 0) {
      $('.fixed_updates_window_body').empty()

      check_message()
      setInterval(function () { check_message(); }, 25000);

      if (email[1] == 0) {
        $('#myDiv').attr('style', 'display:block !important')
        $('#t_sidebar').attr('style', 'display:block !important')
      } else if (email[1] == 1) {
        $('#myDiv').attr('style', 'display:none')
        $('#t_sidebar').attr('style', 'display:none')
      }

      try {
        document.querySelector("#updates_btn").addEventListener("click", function () {
          chat_update_manual();
        });
      } catch (e) { }

    } else if (email[2] == 1) {
      $('.blur-background').removeClass('d-none')
      $('.lock-icon').removeClass('d-none')
      $('.fixed_updates_window_body').empty();

      $('#myDiv').attr('style', 'display:none')
      $('#t_sidebar').attr('style', 'display:none')

      $('.fixed_updates_window_body').html(`
        <div class="chat-message">
          <img src="static/img/blur_image.png" style="width: 200px;height: 200px;" onclick="img_open('/img/signal/X4NR02PW32INXHLF.png')">
          <span class="chat-time">2023-08-31 16:08</span>
        </div>
        <div class="chat-message">
          <p>Hello traders, Prashant this side.<br>For old students sharing a new way to check the broader market.<br>After 9:25/9:30 Have a look at Moneyflux, If more green stocks,
            consider the broader market bullish and Vice versa. Follow our earlier method in case the market is having Min 0.3/0.4% Gap up/down opening.</p>
          <span class="chat-time">2023-08-31 18:19</span>
        </div>`
      )
    }

  } catch (e) {
    logger.error(e)
  }

  // Logout Event Listener
  $('#Logout_button').click(function () {
    logout()
  })
});