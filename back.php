<?php

$save_file = dirname(__FILE__)."/chat.log";
if (!empty($_REQUEST)) {
    if (is_file($save_file)) {
        // PHPEOL(改行)でログファイルを区切ってメッセージ数を取得
        $logs = explode(PHP_EOL , file_get_contents($save_file));
        $num = count($logs);
    }
    // $_REQUESTはjsから送られてきた値。$_POSTでも受け取れるが違いは…？
    $response = $_REQUEST["data"];
    $datetime = date("Y/m/d H:i:s");
    // タブの場所を目印に、名前とメッセージを分割
    $escIdx = mb_strpos($response, "\t");
    $name = mb_substr($response, 0, $escIdx);
    $message = mb_substr($response, $escIdx + 1, strlen($response));
    // 空欄のときの名前を設定
    if ($name == "") {
        $name = "名無しさん";
    }
    // 連想配列にいろいろ分けておくことで、jsで分けて取り出せる
    $ary_lists = [
        "num" => $num,
        "date" => $datetime,
        "name" => $name,
        "message" => $message,
        "data" => $response,
    ];
    // ログを書き込む
    file_put_contents($save_file, $num .",". $response.PHP_EOL, FILE_APPEND);
    // json形式にして連想配列を出力
    echo json_encode($ary_lists);
}

?>