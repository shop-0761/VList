//context
chrome.contextMenus.create({
    title: "このVALUユーザーをリストに追加する",
    onclick: function (info, tab) {

        //construct
        var title = tab.title.match(/VALU \| (.*)のVALU/);
        if (title != null) {
            var dir = tab.url.split("/");
            var name = title[1];
            var id = dir[3];

            //save
            chrome.storage.sync.get("num", function (v) {
                if (v.num === undefined) {
                    v.num = 0;
                }
                urlNum = parseInt(v.num) + 1;

                if (name != null && id != null) {
                    chrome.storage.sync.get(function (v) {

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

                        chrome.storage.sync.set({ "num": urlNum });
                    });
                }

            });
        }


    }
});