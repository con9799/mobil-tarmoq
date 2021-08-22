var proxy = {};


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.path=='background-to-popup') {
    switch(request.method){
      case "load":
        document.getElementById("server_ip").value = request.data['ip'];
        document.getElementById("server_port").value = request.data['port'];
        var st = document.getElementById("st");
        st.classList.remove("red"); st.classList.remove("greed");
        if (request.data['status'] == 'True') {
          st.classList.add("green");
          st.innerHTML = "Yoqilgan";
        }else{
          st.classList.add("red");
          st.innerHTML = "O'chirilgan";
        }
      break;
    }
  }
});

var background = (function () {
  return {
    "send": function (id, data) {chrome.runtime.sendMessage({"path": 'popup-to-background', "method": id, "data": data})}
  }
})();

var load = function (e) {
  background.send("load");
  /*  */
  var enable = document.getElementById("enable");
  var disable = document.getElementById("disable");
  var about = document.getElementById("about");
  /*  */
  enable.addEventListener("click", function () {
    var server_ip = document.getElementById("server_ip").value;
    var server_port = document.getElementById("server_port").value;
    background.send("enable", {ip: server_ip, port: server_port})
  });
  disable.addEventListener("click", function () {background.send("disable")})
  about.addEventListener("click", function () {background.send("about")})
  window.removeEventListener("load", load, false);
};
window.addEventListener("load", load, false);