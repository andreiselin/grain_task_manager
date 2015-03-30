<?php
include("init.php");

// select templates

$get_templates_query_text = "SELECT `id`, `title`, `content`, `img`, TIME(`time_term`), `responsible`, `initiator` FROM `tasks` WHERE `template` = 1 AND `active` = 1";
$get_templates_query = $the_base -> prepare($get_templates_query_text);
$get_templates_query -> execute();
$get_templates_result = $get_templates_query -> fetchAll(PDO::FETCH_ASSOC);

if($get_templates_query -> rowCount() == 0){
    grain_status(
        "error",
        array("message" => "no_templates"),
        "task templates quantity is 0"
    );
}

// insert templates

$generate_daily_tasks_query_text = "INSERT INTO `tasks` (`title`, `content`, `img`, `time_term`, `responsible`, `initiator`) VALUES";

for($i=0; $i<$get_templates_query -> rowCount(); $i++){
    $generate_daily_tasks_query_text .= "(
        '".$get_templates_result[$i]["title"]."',
        '".$get_templates_result[$i]["content"]."',
        '".$get_templates_result[$i]["img"]."',
        '".date_stg(date("Y-m-d ".$get_templates_result[$i]["img"], time() + 60*60*24))."',
        '".$get_templates_result[$i]["responsible"]."',
        '".$get_templates_result[$i]["initiator"]."'
    )";
}

echo $generate_daily_tasks_query_text;

/*

$generate_daily_tasks_query = $the_base -> prepare($generate_daily_tasks_query_text);
$generate_daily_tasks_query -> execute();
$generate_daily_tasks_result = $generate_daily_tasks_query -> fetchAll(PDO::FETCH_ASSOC);

*/

// CONCAT(CURDATE(), ' 17:30:00')