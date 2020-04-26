<?php

$ary_lists = [];
$resp = $_POST['data'];
$ary_lists = [
    "date" => date('Y/m/d H:i:s'),
    "data" => $resp,
];

// 名前とメッセージを分割したい(タグ分け、名前空欄判定したい)
//   -> formDataを使う？うまくいっていないが…

// ログ書き込みしようとしたらエラーする…

// $filename = chmod('chat.log', 606);
// $file = fopen(filename, 'a');
// flock($file, LOCK_EX);
// // fwrite($file, implode("\t", $ary_lists)."\n");
// file_put_contents($file, $resp."\n", FILE_APPEND);
// flock($file, LOCK_UN);
// fclose($file);

// $file=file('chat.log');
//     foreach($file as $chat_line){
//         $line=explode("\t", $chat_line);
//         foreach($line as $value){
//             echo json_encode($value.'<br/>');
//         }
//         echo json_encode('<br/>');
//     }

echo json_encode($ary_lists);
?>