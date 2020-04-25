<?php

$name=$_POST['name'];
$message=$_POST['message'];

$name=htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
$message=htmlspecialchars($message, ENT_QUOTES, 'UTF-8');

$data[]=date('Y/m/d H:i:s');
$data[]=$name;
$data[]=$message;

$file=@fopen('chat.log', 'a');
flock($file, LOCK_EX);
fwrite($file, implode("\t", $data)."\n");
flock($file, LOCK_UN);
fclose($file);

header('Location: front.php');

?>