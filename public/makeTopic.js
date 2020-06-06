let topicNameElements = document.forms.topicform.elements;
topicNameElements.topic_name.addEventListener("input", function() {
    // 入力が空ならボタンの無効化
    if (topicNameElements.topic_name.value != "") {
        topicNameElements.submitBtn.disabled = 0;
    } else {
        topicNameElements.submitBtn.disabled = 1;
    }
});