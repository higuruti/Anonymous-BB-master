{
  let btn = document.getElementById("submitButton");
  btn.onclick = function() {
    // 名前とメッセージを取得、タブで区切ってdataにまとめる
    let userName = document.getElementById("getName").value;
    let message = document.getElementById("getMessage").value;
    let data = `${userName}\t${message}`;
    let url = "back.php";
    // XMLインスタンスをたててdataを送信する
    let httpRequest = new XMLHttpRequest();
    httpRequest.open("POST", url);
    httpRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    httpRequest.send("data=" + data);
    httpRequest.onreadystatechange = function() {
      try {
        if(httpRequest.readyState === XMLHttpRequest.DONE) {
          if (httpRequest.status === 200) {
            // サーバの準備ができたらresponseを受け取る
            let response = JSON.parse(httpRequest.responseText);
            // タグ、テキストを生成して子要素として追加、入力欄を空にする
            let paraNames = document.createElement("p");
            let paraMessage = document.createElement("p");
            paraNames.textContent = `${response.num} ${response.name} ${response.date}`;
            paraMessage.textContent = response.message;
            document.body.appendChild(paraNames);
            document.body.appendChild(paraMessage);
            document.getElementById("getName").value = "";
            document.getElementById("getMessage").value = "";
          } else {
            alert('リクエストに問題が発生しました\n' +  httpRequest.status +"\n" + httpRequest.readyState);
          }
        }
      }
      catch( e ) {
        alert("exception: " + e.description + "\nHttpRequestStatus: " + httpRequest.status + "\nHttpRequestReadyState: " + httpRequest.readyState);
      }
    };
  };
}
