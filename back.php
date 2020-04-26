<?php

$ary_lists = [];
$resp = $_POST['data'];
$escIdx = mb_strpos($resp, "\t");
$name = mb_substr($resp, 0, $escIdx);
if ($name == "") {
    $name = "名無しさん";
}
$message = mb_substr($resp, $escIdx + 1, strlen($resp));
$ary_lists = [
    "date" => date('Y/m/d H:i:s'),
    "data" => $resp,
    "name" => $name,
    "message" => $message,
];

// ログ書き込みしようとしたらエラーする…

// $num = 0;
// if (is_file("chat.log")) {
//     $logs = explode(PHP_EOL, file_get_contents("chat.log"));
//     $num = count($logs);
// }
// file_put_contents("chat.log", $num . "," . $ary_lists['date'] . str_replace("\t", ",", $resp) . PHP_EOL, FILE_APPEND);


// $filename = chmod('./chat.log', 606);
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