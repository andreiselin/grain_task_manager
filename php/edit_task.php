<?php
include("init.php");




$task = array();
$task["id"]            = $_POST["task"]["id"];
$task["title"]         = grain_test_var($_POST["task"]["title"], "");
$task["content"]       = grain_test_var($_POST["task"]["content"], "");
$task["time_term"]     = grain_test_var($_POST["task"]["time_term"], "");
$task["status"]        = grain_test_var($_POST["task"]["status"], "");
$task["responsible"]   = grain_test_var($_POST["task"]["responsible"], "");
$task["img"]           = grain_test_var($_POST["task"]["img"], "");




// adding comment
$edit_task_query_text = "
    UPDATE `tasks` SET
        `title` = '".($task["title"])."',
        `content` = '".($task["content"])."',
        `time_term` = '".(date_ltg($task["time_term"]))."',
        `status` = '".($task["status"])."',
        `responsible` = '".($task['responsible'])."',
        `img` = '".($task["img"])."',
        `initiator` ='".($user["id"])."'
    WHERE
        `id` = ".$task['id']."
    ";

$edit_task_query = $the_base->prepare($edit_task_query_text);
if($edit_task_query -> execute()){
    // everything's okay
    grain_status(
        "ok",
        "",
        "task has been successfully edited"
    );
}else{
    grain_status(
        "error",
        "",
        "task hasn't been edited: ".$edit_task_query_text
    );
}




?>