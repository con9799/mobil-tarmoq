var app = {};
var config = {
	"ip": "192.168.43.1",
	"port": "8080",
	"status": "False"
};
var debug = false;
app.version = function () {return chrome.runtime.getManifest().version};
app.homepage = function () {return chrome.runtime.getManifest().homepage_url};
app.fullname = function () {return chrome.runtime.getManifest().name};

if (debug == false) {
	//chrome.runtime.setUninstallURL(app.homepage(), function (){app.notifications.create("Devcon mahsulotlarini tanlaganingiz uchun rahmat :)");});
}
app.proxy = {
	"enable": function() {
		chrome.proxy.settings.set({value: {
				mode: "fixed_servers",
				rules: {singleProxy: {host: config['ip'], port: parseInt(config['port'])}}
			}, scope: 'regular'},
          	function() {}
        );
	},
	"disable": function() {
		chrome.proxy.settings.set({value: {
				mode: "system",
				rules: {singleProxy: {host: config['ip'], port: parseInt(config['port'])}}
			}, scope: 'regular'},
          	function() {}
        );	
	}
}

app.tab = {
  "open": function (url) {chrome.tabs.create({"url": url, "active": true})},
  "reload": function (url) {
    chrome.tabs.query({"active": true}, function (tabs) {
      if (tabs && tabs.length) {
        chrome.tabs.reload(tabs[0].id, function () {});
      }
    });
  }
};

app.storage = (function () {
  var objs = {};
  window.setTimeout(function () {
    chrome.storage.local.get(null, function (o) {
      objs = o;
      if (objs.hasOwnProperty("ip")) {config['ip'] = obj['ip'];}
      if (objs.hasOwnProperty("port")) {config['port'] = obj['port'];}
      if (objs.hasOwnProperty("status")) {config['status'] = obj['status'];}
    });
  }, 0);
  return {
    "read": function (id) {return objs[id]},
    "write": function (id, data) {
      var tmp = {};
      tmp[id] = data;
      config[id] = data;
      chrome.storage.local.set(tmp, function () {});
    }
  }
})();

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.path=='popup-to-background') {
    	switch(request.method){
			case "enable":
				if (request.data['ip'] == "") {
					app.notifications.create("Kechirasiz server ip manzili kiritilmadi!");
				}else if (request.data['port'] == "") {
					app.notifications.create("Kechirasiz server port manzili kiritilmadi!");
				}else{
					app.storage.write('ip', request.data['ip']);
					app.storage.write('port', request.data['port']);
					app.storage.write('status', 'True');
					app.proxy.enable();
					app.notifications.create("Tizim ishga tushdi!");
					app.sendmessage('load', config);
				}
			break;
			case "disable":
				if (config['status'] == 'True') {
					app.proxy.disable();
					app.storage.write('status', 'False');
					app.notifications.create("Tizim to'xtatildi!");
					app.sendmessage('load', config);
				}else{
					app.notifications.create("Tizim ishga tushirilmagan!");
				}
			break;
			case "about":
				var about = `Ushbu dastur mobil operatorlarning cheksiz internetlaridan kompyuter qurilmalarida ham foydalanishga imkoniyat yaratadi. \n\nDasturchi: Manuchehr Usmonov\n\nTelegram: @kibertexnik\n\nVeb-sayt: www.devcon.uz`;
				app.notifications.create(about);
			break;
			case "load":
				app.sendmessage('load', config);
			break;
    	}
    }
});

app.sendmessage = function(method, data) {
	chrome.runtime.sendMessage({"path": 'background-to-popup', "method": method, "data": data});
}

app.notifications = {
  "id": "mobile-network-notifications",
  "create": function (message, mode) {
    var path = "data/icons/64.png";
    chrome.notifications.create(app.notifications.id, {
      "type": "basic",
      "message": message,
      "title": app.fullname(),
      "iconUrl": chrome.runtime.getURL(path)
    }, function () {});
  }
};
