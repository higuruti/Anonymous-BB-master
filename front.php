<!DOCTYPE html>
<html>
    <head>
        <title>チャット</title>
        <meta charset="UTF-8">
    </head>
    <body>
        <form method="post" action="back.php">
            <p>ニックネーム</p>
            <input type="text" name="name"><br/>
            <p>メッセージ</p>
            <textarea name="message" rows="10" cols="60"></textarea><br/>
            <input type="submit" balue="送信">
        </form>
        <?php
        
       $file=file('chat.log');
       foreach($file as $chat_line){
            $line=explode("\t", $chat_line);
            foreach($line as $value){
                print $value.'<br/>';
            }
            print '<br/>';
       }

        ?>
    </body>
</html>