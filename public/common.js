// 最新のメッセージの要素と、そのY座標を取得
let messageBox = document.getElementById("message");
let messageLists = messageBox.getElementsByTagName("li");
let lastMessage = messageLists[messageLists.length - 1];
// メッセージボックスのYの長さ
let lastMessageY = 0;
for (let i = 0; i < messageLists.length; i++) {
    lastMessageY += messageLists[i].clientHeight;
}

var form = document.forms.myform;

// 入力が開始したら最新のメッセージまでスクロール
let textareaElement = document.forms.myform.elements.text;
textareaElement.addEventListener("input", function() {
    messageBox.scrollTo({left: 0, top: lastMessageY+500, behavior: "smooth"}); // +500は微調整のやつ。おそらくmessageListsの上下の空白分
    // 入力が空ならボタンの無効化
    if (textareaElement.value != "") {
        form.btn.disabled = 0;
    } else {
        form.btn.disabled = 1;
    }
});

// ショートカットキーで投稿
textareaElement.addEventListener("keydown", e => {
    if (e.key === "Enter" && e.ctrlKey) {
        form.btn.click();
    }
});
