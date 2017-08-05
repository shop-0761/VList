(function () {
    var $$ = {};
    var name;
    var id;


    // init-run
    $$.__construct = function () {
        chrome.tabs.getSelected(null, function (tab) {
            var title = tab.title.match(/VALU \| (.*)のVALU/);
            if (title != null) {
                name = title[1];
                var dir = tab.url.split("/");
                id = dir[3];
            }
        });

        var save = document.getElementById("save");
        if (save != null) {
            save.onclick = $$.save;
        }

        var clear = document.getElementById("clear");
        if (clear != null) {
            clear.onclick = $$.clear;

        }

        var remove = document.getElementById("remove");
        if (remove != null) {
            remove.onclick = $$.remove;
        }

        var allOpen = document.getElementById("allOpen");
        if (allOpen != null) {
            allOpen.onclick = $$.allOpen;
        }

        $$.view();

    };

    $$.save = function () {
        chrome.storage.sync.get("num", function (v) {
            if (v.num === undefined) {
                v.num = 0;
            }
            var urlNum = parseInt(v.num) + 1;

            if (name != null && id != null) {
                chrome.storage.sync.get(function (v) {

                    var item = {};
                    if (v.screenName !== undefined && v.ID !== undefined) {

                        if (v.screenName.indexOf(name) >= 0 || v.ID.indexOf(id) >= 0) {
                            console.log("this user is exist");
                            return;
                        }
                        
                        v.screenName.push(name);
                        v.ID.push(id);
                        item = {
                            screenName: v.screenName,
                            ID: v.ID
                        };
                    }

                    else {
                        item = {
                            screenName: new Array(name),
                            ID: new Array(id)
                        };
                        console.log("first time set");
                    }

                    chrome.storage.sync.set(item);
                    $$.makeLiItems(name, id);

                    chrome.storage.sync.set({ "num": urlNum });
                });
            }
        });
    };

    $$.makeLiItems = function (name, id) {
        var urlList = document.getElementById("URL-list");
        var anchor = document.createElement("a");
        anchor.setAttribute('href', " https://valu.is/" + id /*+ "/data"*/);
        anchor.setAttribute('class', 'list-group-item');
        anchor.textContent = name;
        anchor.addEventListener("click", function (e) {
            console.log("click " + anchor.href);
            if (anchor.href !== null) {
                chrome.tabs.create({ url: anchor.href }, tab => { });
            }
        });
        urlList.appendChild(anchor);
    }

    $$.view = function () {
        //init
        var urlList = document.getElementById("URL-list");
        while (urlList.firstChild) urlList.removeChild(urlList.firstChild);

        chrome.storage.sync.get(function (v) {
            for (var i = 0; i < v.num; i++) {
                $$.makeLiItems(v.screenName[i], v.ID[i]);
            }
        });
    };

    $$.remove = function () {
        var removeTarget = document.getElementById("removeTarget");
        var removeTargetName = removeTarget.value;

        if (removeTargetName == null) {
            return;
        }

        chrome.storage.sync.get(function (v) {

            var index = v.screenName.indexOf(removeTargetName);
            //removeTargetNameがアドレスかもチェック
            if (index == -1) {
                var dir = removeTargetName.split("/");
                index = v.ID.indexOf(dir[3]);
            }

            if (index >= 0) {
                v.screenName.splice(index, 1);
                v.ID.splice(index, 1);
                v.screenName.join();
                v.ID.join();
                console.log("removed: " + index);

                var item = {
                    screenName: v.screenName,
                    ID: v.ID,
                    num: v.num - 1
                };

                chrome.storage.sync.set(item);

                $$.view();
            }

            removeTarget.value = null;

        });
    }

    $$.clear = function () {
        chrome.storage.sync.clear();
        $$.view();
    }

    $$.allOpen = function () {
        var links = document.getElementsByClassName('list-group-item');
        for (var i = 0; i < links.length; i++) {
            chrome.tabs.create({ url: links[i].href }, tab => { });
        }
    }

    // run
    window.addEventListener("load", $$.__construct);

    //debug
    chrome.storage.onChanged.addListener(function (changes, namespace) {
        for (key in changes) {
            var storageChange = changes[key];
            console.log('Storage key "%s" in namespace "%s" changed. ' +
                'Old value was "%s", new value is "%s".',
                key,
                namespace,
                storageChange.oldValue,
                storageChange.newValue);
        }
    });

})();