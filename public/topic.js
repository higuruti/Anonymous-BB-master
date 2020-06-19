let radioButtonElements = document.forms.chooseTopics.elements;
for (let i = 0; i < radioButtonElements.length - 1; i++) {
    if (!i) {
        radioButtonElements.topic.addEventListener("click", () => {
            radioButtonElements.submitBtn.disabled = 0;
        });
        break;
    }
    radioButtonElements.topic[i].addEventListener("click", () => {
        radioButtonElements.submitBtn.disabled = 0;
    });
}
