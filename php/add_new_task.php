<?php
include("init.php");


// mail($admin_mail, "adding task", print_r($_POST, true));


$task = array();
$task["title"]         = grain_test_var($_POST["task"]["title"], "");
$task["content"]       = grain_test_var($_POST["task"]["content"], "");
$task["time_term"]     = grain_test_var($_POST["task"]["time_term"], "");
// status -> only 1 to input
$task["responsible"]   = grain_test_var($_POST["task"]["responsible"], "");
$task["img"]           = grain_test_var($_POST["task"]["img"], "");
$task["task_notified"] = $_POST["task"]["task_notified"];
$task["template"]      = $_POST["task"]["destination"] == "template" ? 1 : 0;



// mail($admin_mail, "add_task_time", $task["time_term"]." / ".date_ltg($task["time_term"]));

// adding comment
$add_task_query_text = "
    INSERT INTO `tasks` (
        `title`,
        `content`,
        `time_term`,
        `status`,
        `responsible`,
        `img`,
        `initiator`,
        `template`,
        `active`
    )VALUES(
        '".$task["title"]."',
        '".$task["content"]."',
        '".date_ltg($task["time_term"])."',
        '1',
        '".$task['responsible']."',
        '".$task["img"]."',
        '".$user["id"]."',
        '".$task['template']."',
        '1'
    )";

$add_task_query = $the_base->prepare($add_task_query_text);
if($add_task_query -> execute()){
    // adding notifications
    add_notifications($task["task_notified"], $the_base->lastInsertId(), 0);

    // everything's okay
    grain_status(
        "ok",
        "",
        "task has been successfully added"
    );
}else{
    grain_status(
        "error",
        "",
        "task hasn't been added: ".$add_task_query_text
    );
}




?>