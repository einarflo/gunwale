<?php
 header("Access-Control-Allow-Origin: *");
// get the HTTP method, path and body of the request
$method = $_SERVER['REQUEST_METHOD'];
$request = explode('/', trim($_SERVER['PATH_INFO'],'/'));
$input = json_decode(file_get_contents('php://input'),true);
 
// connect to the mysql database
$link = mysqli_connect('dogetek.mysql.domeneshop.no', 'dogetek', 'pqdF9GiG', 'dogetek');
mysqli_set_charset($link,'utf8');
 
$key = $request[1];
// retrieve the table and key from the path
$table = preg_replace('/[^a-z0-9_]+/i','',array_shift($request));
//$key = array_shift($request)+0;
//echo $key;
// escape the columns and values from the input object

$set = '';

if ($input!==null) {
    $columns = preg_replace('/[^a-z0-9_]+/i','',array_keys($input));
    print_r($columns);
    $values = array_map(function ($value) use ($link) {
        if ($value===null) return null;
        return mysqli_real_escape_string($link,(string)$value);
    },array_values($input));

    // build the SET part of the SQL command


    for ($i=0;$i<count($columns);$i++) {
        $set.=($i>0?',':'').'`'.$columns[$i].'`=';
        $set.=($values[$i]===null?'NULL':'"'.$values[$i].'"');
    }

}

 
// create SQL based on HTTP method
switch ($method) {
  case 'GET':

    if ($table == "users") {
      $sql = "select id, username from ".$table." WHERE username=". '"'. $key. '"' .";"; break;
    }
    else if ($table == "channels") {
      $sql = "select * from ".$table.";"; break;
    }
    else if ($table == "channel_posts") {
      $sql = "select * from `$table`".($key?" WHERE channel_id=$key":''); break;
    }
    else if ($table == "game_question") {
      $sql = "select * from `$table`".($key?" WHERE game_id=$key":''); break;
    }
    else if ($table == "game_players") {
        $sql = "select * from `$table` WHERE name=". '"'. $key. '"' .";"; break;
    }
    else if ($table == "game_players_id") {
        $sql = "select * from game_players WHERE game_id=". '"'. $key. '"' .";"; break;
    }
    else if ($table == "games") {
        $sql = "select * from game WHERE created_by=". '"'. $key. '"' .";"; break;
    }
    else {
      $sql = "select * from `$table`".($key?" WHERE id=$key":''); break;
    }
    
  case 'PUT':
    if ($table == "game") {
        $sql = "update game set $set WHERE id=". '"'. $key. '"' .";"; echo $sql; break;
    }
    else if ($table == "game_players") {
        $sql = "update game set $set WHERE id=". '"'. $key. '"' .";"; echo $sql; break;
    }
    else {
        exit("nope");
    }
    //$sql = "update `$table` set $set where id=$key"; break;
  case 'POST':
    //exit("nope");
    $sql = "insert into `$table` set $set"; echo $sql; break;
  case 'DELETE':
    exit("nope");
    //$sql = "delete `$table` where id=$key"; break;
}
 
// execute SQL statement
$result = mysqli_query($link, $sql);
 
// die if SQL statement failed
if (!$result) {
  http_response_code(404);
  die(mysqli_error($link));
}
 
// print results, insert id or affected row count
if ($method == 'GET') {
  if (!$key || ($table == "channel_posts" || $table == "game_question" || $table == "games" || $table == "game_players" || $table == "game_players_id")) echo '[';
  for ($i=0;$i<mysqli_num_rows($result);$i++) {
    echo ($i>0?',':'').json_encode(mysqli_fetch_object($result));
  }
  if (!$key || ($table == "channel_posts" || $table == "game_question" || $table == "games" || $table == "game_players" || $table == "game_players_id")) echo ']';
} elseif ($method == 'POST') {
  echo mysqli_insert_id($link);
} else {
  echo mysqli_affected_rows($link);
}
 
// close mysql connection
mysqli_close($link);