(function() {
  var httpRequest;
  document.getElementById("ajaxButton").onclick = function() {
    var userName = document.getElementById("ajaxTextbox").value;
    var message = document.getElementById("ajaxTextarea").value;
    var data = `${userName}\n${message}`;
    makeRequest("back.php", data);
  };

  function makeRequest(url, data) {
    httpRequest = new XMLHttpRequest();

    if (!httpRequest) {
      alert('中断 :( XMLHTTP インスタンスを生成できませんでした');
      return false;
    }
    httpRequest.onreadystatechange = alertContents;
    httpRequest.open('POST', url);
    httpRequest.setRequestHeader("content-Type", "application/x-www-form-urlencoded");
    httpRequest.send("data=" + encodeURIComponent(data));
  }

  function alertContents() {
    try {
      if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status === 200) {
          var response = JSON.parse(httpRequest.responseText);
          let paraDate = document.createElement("pre");
          let paraName = document.createElement("pre");
          paraDate.textContent = response.date;
          paraName.textContent = response.data;
          document.body.appendChild(paraDate);
          document.body.appendChild(paraName);
        } else {
          alert('リクエストに問題が発生しました\n' +  httpRequest.status +"\n" + httpRequest.readyState);
        }
      }
    }
    catch( e ) {
      alert("exception: " + e.description + "\nHttpRequestStatus: " + httpRequest.status + "\nHttpRequestReadyState: " + httpRequest.readyState);
    }
  }
})();