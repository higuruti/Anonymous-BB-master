<!DOCTYPE html>
<html>
    <head>
        <title>チャット</title>
        <meta charset="UTF-8">
        <script src="common.js" defer></script>
    </head>
    <body>
        <!-- formを使ったら謎エラーっぽい -->
        <!-- <form method="POST" id="f1"> -->
            <p>ニックネーム</p>
            <input type="text" name="name" id="ajaxTextbox">
            <br>
            <p>メッセージ</p>
            <textarea name="message" id="ajaxTextarea" rows="10" cols="60"></textarea>
            <br>
            <input type="submit" value="送信" id="ajaxButton">
        <!-- </form> -->
    </body>
</html>